<script setup lang="ts">
import bankTransferIcon from "~/assets/images/bank-transfer-icon.png";
import codIcon from "~/assets/images/cod-icon.png";
import { setDelimiter, setMoneyDelimiter } from "~/functions/delimiter";
import {
  applyApiErrors,
  buildOrderPayload,
  firstErrorKeyInOrder,
  hasErrorCode,
  initFormInfo,
  initFormValues,
  scrollToField,
  validateCheckoutForm,
} from "~/functions/formConfig";
import type { FieldInfo } from "~/types/formConfig";
import { useProdukStore } from "~/stores/produkStore";

const route = useRoute();
const slug = route.params.slug as string;
const produkStore = useProdukStore();
const locationStore = useLocationStore();
const pesananStore = usePesananStore();
const alertStore = useAlertStore();
const config = useRuntimeConfig();
const isAbandonSubmitted = ref(false);
const isCOD = ref(false);
const isBankTransfer = ref(false);
const isCountdown = ref(false);
const isFlashSale = ref(false);
const isPesanTambahan = ref(false);
const countdownConfig = ref<any>(null);
const flashSaleConfig = ref<any>(null);
const pesanTambahanConfig = ref<any>(null);
const loading = ref(false);
const dynamicFormRef = ref<any>(null);

/** Atribut pesanan yang bukan bagian formConfig. `source` ditentukan per jalur kirim. */
const order = ref({
  idProduk: "",
  idAtributProduk: "",
  metodePembayaran: "",
});

/** Nilai & pesan galat per fieldKey — dibangun dari formConfig, bukan hardcode. */
const values = ref<Record<string, any>>({});
const info = ref<Record<string, FieldInfo>>({});

/** Galat tingkat form dari backend (§18.4). */
const formError = ref("");
/** Dua kontrol di luar formConfig memakai pesan galatnya sendiri. */
const optionError = ref("");
const paymentError = ref("");

const fields = computed(() => produkStore.formConfig);

/**
 * Setelan `hidePrice` menyembunyikan harga produk yang tampil di atas nama
 * produk, di dalam `<section class="product-detail">`.
 *
 * Seksi tersebut saat ini kosong: isinya (harga, nama produk, dan daftar "Yang
 * Anda Dapatkan") dihapus pada commit 8a9ce7d "fix : content rendering".
 * Selama blok itu belum dipulihkan, tidak ada elemen harga untuk disembunyikan
 * di halaman ini — nilainya tersedia lewat `produkStore.hidePrice` begitu blok
 * tersebut kembali. Harga per varian pada daftar Pilihan Produk **tetap tampil**;
 * bukan sasaran setelan ini.
 */

/**
 * Form tidak dapat dirender tanpa konfigurasi. Merender form kosong akan
 * menghasilkan payload tanpa data penerima dan 400 yang tidak dapat
 * diperbaiki pelanggan (§18.6).
 */
const isConfigUnavailable = computed(
  () => !produkStore.loading && fields.value.length === 0,
);

const hargaTerpilih = computed(
  () =>
    produkStore.item?.atributProduk?.find(
      (a: any) => a.id === order.value.idAtributProduk,
    )?.harga || 0,
);

const startCountdown = () => {
  let jam = countdownConfig.value.config.jam;
  let menit = countdownConfig.value.config.menit;
  let detik = countdownConfig.value.config.detik;

  setInterval(() => {
    detik--;
    if (detik < 0) {
      detik = 59;
      menit--;
      if (menit < 0) {
        menit = 59;
        jam--;
        if (jam < 0) {
          jam = 0;
        }
      }
    }
    countdownConfig.value.config.jam = jam;
    countdownConfig.value.config.menit = menit;
    countdownConfig.value.config.detik = detik;
  }, 1000);
};

/**
 * Menyiapkan state form dari konfigurasi. `previous` dipakai saat konfigurasi
 * dimuat ulang agar isian pelanggan tidak hilang (§18.5, §18.6).
 */
const initFormState = (previous?: Record<string, any>) => {
  const next = initFormValues(fields.value);

  if (previous) {
    for (const key of Object.keys(next)) {
      if (key in previous) next[key] = previous[key];
    }
  }

  values.value = next;
  info.value = initFormInfo(fields.value);
  formError.value = "";
  optionError.value = "";
  paymentError.value = "";
};

const mappingData = (previous?: Record<string, any>) => {
  const item = produkStore.item;
  if (!item || !item.id) return;

  order.value.idProduk = item.id;

  if (item.atributProduk && item.atributProduk.length > 0) {
    order.value.idAtributProduk = item.atributProduk[0].id;
  }

  const pembayaran: string[] = item.metodePembayaran ?? [];
  isCOD.value = pembayaran.includes("COD");
  isBankTransfer.value = pembayaran.includes("Bank Transfer");
  order.value.metodePembayaran = pembayaran[0] ?? "";

  initFormState(previous);

  // Seksi `ekstra` bersifat opsional — produk tanpa ekstra tetap harus dapat
  // dipesan, jadi bagian ini tidak boleh menghentikan inisialisasi di atas.
  if (!Array.isArray(item.ekstra)) return;

  isCountdown.value = item.ekstra.some((e: any) => e.type === "Countdown");
  isPesanTambahan.value = item.ekstra.some(
    (e: any) => e.type === "Pesan Tambahan",
  );
  isFlashSale.value = item.ekstra.some((e: any) => e.type === "Flash Sale");

  countdownConfig.value = item.ekstra.find((e: any) => e.type === "Countdown");
  flashSaleConfig.value = item.ekstra.find((e: any) => e.type === "Flash Sale");
  pesanTambahanConfig.value = item.ekstra.find(
    (e: any) => e.type === "Pesan Tambahan",
  );

  if (import.meta.client && isCountdown.value) {
    startCountdown();
  }
};

const handleSelectOption = (selected: any) => {
  order.value.idAtributProduk = selected.id;
};

/** Memuat ulang konfigurasi — tombol "Muat ulang" dan pemulihan VALUE_NOT_IN_OPTIONS. */
const reloadCheckout = async (keepValues = false) => {
  const previous = keepValues ? { ...values.value } : undefined;
  await produkStore.onCheckout(slug);
  mappingData(previous);
  await nextTick();
  dynamicFormRef.value?.syncDisplayValues();
};

const validateData = () => {
  let error = validateCheckoutForm(fields.value, values.value, info.value);

  optionError.value = "";
  paymentError.value = "";

  if (!order.value.idAtributProduk) {
    optionError.value = "Pilihan Produk tidak boleh kosong";
    error++;
  }
  if (!order.value.metodePembayaran) {
    paymentError.value = "Metode Pembayaran tidak boleh kosong";
    error++;
  }

  return error;
};

const submitData = async () => {
  if (loading.value) return; // penjaga submit ganda selain tombol yang dinonaktifkan

  formError.value = "";
  const error = validateData();

  if (error > 0) {
    alertStore.setAlert(
      "Terdapat beberapa kesalahan pada form. Silakan periksa kembali.",
      "danger",
    );
    scrollToField(firstErrorKeyInOrder(fields.value, info.value));
    return;
  }

  const harga = hargaTerpilih.value;

  // ============================
  // META InitiateCheckout
  // ============================
  if (
    !produkStore.item?.embededCheckoutScript &&
    typeof window !== "undefined" &&
    window.fbq &&
    !window.__checkoutTracked
  ) {
    window.__checkoutTracked = true;

    window.fbq("track", "InitiateCheckout", {
      content_ids: [order.value.idProduk],
      content_name: produkStore.item.namaProduk,
      currency: "IDR",
      value: harga,
    });
  }

  // ============================
  // GTM begin_checkout
  // ============================
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: "begin_checkout",
      ecommerce: {
        currency: "IDR",
        value: harga,
        items: [
          {
            item_id: order.value.idProduk,
            item_name: produkStore.item.namaProduk,
            price: harga,
          },
        ],
      },
    });
  }

  // ============================
  // STORE ORDER
  // ============================
  loading.value = true;

  const payload = buildOrderPayload(fields.value, values.value, {
    ...order.value,
    source: "FORM",
  });

  const res = await pesananStore.onStore(payload);

  if (res.success) {
    navigateTo(`/${route.params.slug}/success`);
    loading.value = false;
    return;
  }

  // Pemulihan struktural lebih dahulu — keduanya membangun ulang state field
  // dan akan menghapus tanda galat bila dijalankan sesudahnya (§18.5).
  if (hasErrorCode(res.errors, "LOCATION_HIERARCHY_MISMATCH")) {
    await dynamicFormRef.value?.resetLocationChain();
  }
  if (hasErrorCode(res.errors, "VALUE_NOT_IN_OPTIONS")) {
    // Admin mengubah options setelah halaman termuat: muat ulang konfigurasi
    // lalu minta pelanggan memilih ulang — jalur pemulihan, bukan kegagalan.
    await reloadCheckout(true);
  }

  // Isian dipertahankan seluruhnya; tombol dapat ditekan ulang (§18.6).
  const outcome = applyApiErrors(
    res.errors,
    fields.value,
    info.value,
    res.message,
  );

  formError.value = outcome.formError;
  if (formError.value) alertStore.setAlert(formError.value, "danger");

  scrollToField(
    outcome.firstErrorKey || firstErrorKeyInOrder(fields.value, info.value),
  );

  loading.value = false;
};

const handleAbandon = () => {
  if (pesananStore.isSubmitted || isAbandonSubmitted.value) return;
  if (!fields.value.length) return;

  isAbandonSubmitted.value = true;

  const payload = buildOrderPayload(fields.value, values.value, {
    ...order.value,
    source: "ABANDON",
  });

  const url = `${config.public.api_url}order/create`;

  // sendBeacon butuh Blob atau FormData
  const blob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  });

  navigator.sendBeacon(url, blob);
};

const onVisibilityChange = () => {
  if (document.visibilityState === "hidden") {
    handleAbandon();
  }
};

const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
  if (!pesananStore.isSubmitted) {
    event.preventDefault();
    event.returnValue = "";
  }
};

// ===== SSR DATA FETCH =====
await useAsyncData("checkout-data", async () => {
  await Promise.all([
    produkStore.onCheckout(slug),
    locationStore.onIndexProvince(),
  ]);

  mappingData();
  return true;
});

// ===== HEAD TRACKING =====
useHead(() => {
  const pixelId = produkStore.item?.idFacebookPixelId?.trim();
  const gtmId = produkStore.item?.idGoogleGtmId?.trim();
  const embedded = produkStore.item?.embededCheckoutScript;
  const namaProduk = produkStore.item?.namaProduk?.trim()

  const title = namaProduk
    ? `${namaProduk} | Checkout Resmi`
    : "Checkout Produk"

  const description =
    "Selesaikan pembelian produk dengan cepat, aman, dan praktis melalui halaman checkout resmi kami."

  const isValidPixel = /^\d+$/.test(pixelId || "");
  const isValidGtm = /^GTM-/.test(gtmId || "");

  const scripts: any[] = [];
  const noscripts: any[] = [];

  // ==========================
  // META PIXEL
  // ==========================
  if (isValidPixel) {
    scripts.push({
      key: "fb-pixel",
      tagPosition: "head",
      innerHTML: `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `,
    });

    noscripts.push({
      key: "fb-noscript",
      tagPosition: "bodyOpen",
      innerHTML: `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
      `,
    });
  }

  // ==========================
  // GTM
  // ==========================
  if (isValidGtm) {
    scripts.push({
      key: "gtm-script",
      tagPosition: "head",
      innerHTML: `
        (function(w,d,s,l,i){w[l]=w[l]||[];
        w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
        var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
        j.async=true;
        j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
        f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `,
    });

    noscripts.push({
      key: "gtm-noscript",
      tagPosition: "bodyOpen",
      innerHTML: `
        <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `,
    });
  }

  // ==========================
  // EMBEDDED SCRIPT (Client Custom)
  // ==========================
  if (embedded) {
    scripts.push({
      key: "custom-script",
      tagPosition: "head",
      innerHTML: embedded,
    });
  }

  return {
    title,
    meta: [
  {
    key: "description",
    name: "description",
    content: description,
  },
  {
    key: "og:title",
    property: "og:title",
    content: title,
  },
  {
    key: "robots",
    name: "robots",
    content: "noindex, nofollow",
  },
  {
    key: "og:description",
    property: "og:description",
    content: description,
  },
  {
    key: "og:type",
    property: "og:type",
    content: "website",
  },
],
    script: scripts,
    noscript: noscripts,
  };
});

onMounted(() => {
  const harga = hargaTerpilih.value;

  // META
  if (
    !produkStore.item?.embededCheckoutScript &&
    typeof window !== "undefined" &&
    window.fbq
  ) {
    fbq("track", "ViewContent", {
      content_ids: [produkStore.item.id],
      content_name: produkStore.item.namaProduk,
      currency: "IDR",
      value: harga,
    });
  }

  // GTM
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: "view_content",
      ecommerce: {
        currency: "IDR",
        value: harga,
        items: [
          {
            item_id: produkStore.item.id,
            item_name: produkStore.item.namaProduk,
            price: harga,
          },
        ],
      },
    });
  }

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("beforeunload", beforeUnloadHandler);
  window.addEventListener("pagehide", handleAbandon);
});

onBeforeUnmount(() => {
  document.removeEventListener("visibilitychange", onVisibilityChange);
  window.removeEventListener("beforeunload", beforeUnloadHandler);
  window.removeEventListener("pagehide", handleAbandon);
});
</script>

<template>
  <NuxtLayout name="client-layouts">
    <BasesCarouselCustom
      v-if="
        produkStore.item.gambarProduk &&
        produkStore.item.gambarProduk.length > 0 &&
        Object.keys(produkStore.item.gambarProduk[0]).length > 0
      "
      :images="produkStore.item.gambarProduk"
      class="product-img"
    />
    <section class="product-detail">

    </section>
    <section class="product-option">
      <p class="title ff-open-sans">Pilihan Produk</p>
      <div class="product-option-list">
        <!-- Satu elemen per varian: pembungkus bersarang dengan kelas yang sama
             membuat kotaknya ter-render dua kali. -->
        <div
          class="product-option-item"
          v-for="option in produkStore.item.atributProduk"
          :key="option.id"
          @click="handleSelectOption(option)"
        >
          <input
            type="radio"
            name="product-option"
            :id="'option-' + option.id"
            :value="option.id"
            v-model="order.idAtributProduk"
          />
          <label :for="'option-' + option.id">
            <span class="text">{{ option.deskripsi }}</span>
            <span class="price">
              {{ setMoneyDelimiter(option.harga) }}</span
            ></label
          >
        </div>
      </div>
      <span class="message danger fz-em-07 m-4-top">{{ optionError }}</span>
    </section>
    <section class="recipient">
      <p class="title ff-open-sans">Data Penerima</p>

      <!-- Konfigurasi gagal dimuat: jangan merender form kosong (§18.6). -->
      <div v-if="isConfigUnavailable" class="text-align-center">
        <p class="message danger fz-em-07">
          {{
            produkStore.error ||
            "Form pemesanan belum tersedia untuk produk ini."
          }}
        </p>
        <BasesButtonCustom
          class="btn-primary m-8-top"
          :loading="produkStore.loading"
          @click="reloadCheckout()"
        >
          Muat ulang
        </BasesButtonCustom>
      </div>

      <div v-else class="receipent-form">
        <div class="receipent-form-item">
          <DynamicForm
            ref="dynamicFormRef"
            :fields="fields"
            :values="values"
            :info="info"
            :label-hidden="produkStore.hideFormLabel"
          />
        </div>
      </div>

      <div class="payment-method">
        <p class="title ff-open-sans">Metode Pembayaran</p>
        <div class="payment-method-list" v-if="isCOD || isBankTransfer">
          <div class="payment-method-item" v-if="isCOD">
            <label for="payment-method-1">
              <img :src="codIcon" alt="icon-cod" /> (Bayar di Tempat)</label
            >
            <input
              type="radio"
              name="payment-method"
              id="payment-method-1"
              value="COD"
              v-model="order.metodePembayaran"
            />
          </div>
          <div class="payment-method-item" v-if="isBankTransfer">
            <label for="payment-method-2">
              <img :src="bankTransferIcon" alt="icon-bank-transfer" /> Bank
              Transfer</label
            >
            <input
              type="radio"
              name="payment-method"
              id="payment-method-2"
              value="Bank Transfer"
              v-model="order.metodePembayaran"
            />
          </div>
        </div>
        <span class="message danger fz-em-07 m-4-top">{{ paymentError }}</span>
      </div>
    </section>
    <section class="product-sale">
      <div class="countdown" v-if="isCountdown">
        <div class="hours">
          <p class="counter">{{ countdownConfig.config.jam }}</p>
          <p class="label">Jam</p>
        </div>
        <div class="minute">
          <p class="counter">{{ countdownConfig.config.menit }}</p>
          <p class="label">Menit</p>
        </div>
        <div class="second">
          <p class="counter">{{ countdownConfig.config.detik }}</p>
          <p class="label">Detik</p>
        </div>
      </div>
      <div class="flash-sale" v-if="isFlashSale">
        <p class="quantity">{{ setDelimiter(flashSaleConfig.config.stok) }}</p>
        <p class="label">{{ flashSaleConfig.config.pesan }}</p>
      </div>
      <div class="guarantee" v-if="isPesanTambahan">
        <p class="title">{{ pesanTambahanConfig.config.pesan }}</p>
      </div>
    </section>
    <section class="action">
      <p class="message danger fz-em-07 m-4-bottom" v-if="formError">
        {{ formError }}
      </p>
      <BasesButtonCustom
        class="action-btn btn-primary w-p-100 m-8-bottom"
        :loading="loading"
        :disabled="isConfigUnavailable"
        @click="submitData"
      >
        {{ produkStore.item.narasiTombol || "Beli Sekarang" }}
      </BasesButtonCustom>
      <p class="syarat-ketentuan">
        Dengan melanjutkan pembayaran, kamu menyetujui
        <a href="#">S&K</a>
      </p>
      <p class="faq">
        Punya pertanyaan? Lihat FAQ
        <a href="#">disini</a>
      </p>
    </section>
    <section
      class="product-review"
      v-if="
        produkStore.item.testimoni &&
        produkStore.item.testimoni.length > 0 &&
        produkStore.item.testimoni[0].nama
      "
    >
      <p class="title ff-open-sans">Ulasan Produk</p>
      <div class="reviews">
        <div
          class="review"
          v-for="(testimoni, index) in produkStore.item.testimoni"
          :key="index"
        >
          <img
  v-if="testimoni.urlGambar"
  :src="testimoni.urlGambar"
  width="80"
  height="80"
  loading="lazy"
/>
          <div class="review-content">
            <div class="reviewer-info">
              <p class="name ff-open-sans">
                {{ testimoni.nama }}
              </p>
              <div class="rating"></div>
            </div>
            <p class="review-text ff-open-sans">{{ testimoni.pesan }}</p>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<style scoped>
.product-img {
  aspect-ratio: 1 / 1;
  width: 100%;
}
</style>
