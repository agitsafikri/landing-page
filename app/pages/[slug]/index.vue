<script setup lang="ts">
import Check from "vue-material-design-icons/Check.vue";
import bankTransferIcon from "~/assets/images/bank-transfer-icon.png";
import codIcon from "~/assets/images/cod-icon.png";
import { setDelimiter, setMoneyDelimiter } from "~/functions/delimiter";
import { validateForm } from "~/functions/formHelper";
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
const roValueProvinsi = ref<any>(null);
const roValueKota = ref<any>(null);
const roValueKecamatan = ref<any>(null);
const loading = ref(false);
const form = ref({
  idProduk: "",
  idAtributProduk: "",
  namaLengkap: "",
  nomorWhatsapp: "",
  alamat: "",
  idProvinsi: null,
  idKota: null,
  idKecamatan: null,
  metodePembayaran: "",
  source: "FORM",
});
const info = ref({
  namaLengkap: { type: "info", message: "" },
  nomorWhatsapp: { type: "info", message: "" },
  alamat: { type: "info", message: "" },
  idProvinsi: { type: "info", message: "" },
  idKota: { type: "info", message: "" },
  idKecamatan: { type: "info", message: "" },
  idProduk: { type: "info", message: "" },
  idAtributProduk: { type: "info", message: "" },
  metodePembayaran: { type: "info", message: "" },
});

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

const mappingData = () => {
  let item = produkStore.item;
  if (!item || !item.ekstra) return;

  isCountdown.value = item.ekstra.some(
    (item: any) => item.type === "Countdown",
  );
  isPesanTambahan.value = item.ekstra.some(
    (item: any) => item.type === "Pesan Tambahan",
  );
  isFlashSale.value = item.ekstra.some(
    (item: any) => item.type === "Flash Sale",
  );

  countdownConfig.value = item.ekstra.find(
    (item: any) => item.type === "Countdown",
  );
  flashSaleConfig.value = item.ekstra.find(
    (item: any) => item.type === "Flash Sale",
  );
  pesanTambahanConfig.value = item.ekstra.find(
    (item: any) => item.type === "Pesan Tambahan",
  );

  isCOD.value = item.metodePembayaran.includes("COD");
  isBankTransfer.value = item.metodePembayaran.includes("Bank Transfer");

  if (process.client && isCountdown.value) {
  startCountdown();
}

  form.value.idProduk = item.id;

  if (item.atributProduk && item.atributProduk.length > 0) {
    form.value.idAtributProduk = item.atributProduk[0].id;
  }

  if (item.metodePembayaran && item.metodePembayaran.length > 0) {
    form.value.metodePembayaran = item.metodePembayaran[0];
  }
};

const handleSelectProvinsi = async (selected: any) => {
  roValueProvinsi.value = selected.name;
  form.value.idProvinsi = selected.value;
  roValueKota.value = "";
  form.value.idKota = null;
  roValueKecamatan.value = "";
  form.value.idKecamatan = null;
  await locationStore.onIndexCity(selected.value);
};

const handleSelectKota = async (selected: any) => {
  roValueKota.value = selected.name;
  form.value.idKota = selected.value;
  roValueKecamatan.value = "";
  form.value.idKecamatan = null;
  await locationStore.onIndexDistrict(selected.value);
};

const handleSelectKecamatan = async (selected: any) => {
  roValueKecamatan.value = selected.name;
  form.value.idKecamatan = selected.value;
};

const handleSelectOption = (selected: any) => {
  form.value.idAtributProduk = selected.id;
};

const handleSelectPaymentMethod = (selected: any) => {
  form.value.metodePembayaran = selected;
};

const validateData = () => {
  let err = 0;
  const validation = {
    namaLengkap: {
      label: "Nama",
      required: true,
    },
    nomorWhatsapp: {
      label: "Nomor Handphone",
      required: true,
    },
    alamat: {
      label: "Alamat",
      required: true,
    },
    idProvinsi: {
      label: "Provinsi",
      required: true,
    },
    idKota: {
      label: "Kota",
      required: true,
    },
    idKecamatan: {
      label: "Kecamatan",
      required: true,
    },
    idProduk: {
      label: "Produk",
      required: true,
    },
    idAtributProduk: {
      label: "Pilihan Produk",
      required: true,
    },
    metodePembayaran: {
      label: "Metode Pembayaran",
      required: true,
    },
  };

  err += validateForm(validation, form.value, info.value);
  return err;
};

const submitData = async () => {
  const error = validateData();

  if (error > 0) {
    alertStore.setAlert(
      "Terdapat beberapa kesalahan pada form. Silakan periksa kembali.",
      "danger"
    );
    return;
  }

  
  const harga =
    produkStore.item.atributProduk?.find(
      (a: any) => a.id === form.value.idAtributProduk
    )?.harga || 0;

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
      content_ids: [form.value.idProduk],
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
            item_id: form.value.idProduk,
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

  const payload = { ...form.value };

  if (payload.nomorWhatsapp) {
    payload.nomorWhatsapp = payload.nomorWhatsapp.replace(/\D/g, "");
  }

  const res = await pesananStore.onStore(payload);

  if (res.success) {
    navigateTo(`/${route.params.slug}/success`);
  }

  loading.value = false;
};

const handleAbandon = () => {
  if (pesananStore.isSubmitted || isAbandonSubmitted.value) return;

  isAbandonSubmitted.value = true;

  const payload = {
    ...form.value,
    source: "ABANDON",
  };

  if (payload.nomorWhatsapp) {
    payload.nomorWhatsapp = payload.nomorWhatsapp.replace(/\D/g, "");
  }

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
  const harga =
    produkStore.item?.atributProduk?.find(
      (a: any) => a.id === form.value.idAtributProduk
    )?.harga || 0;

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
        <div
          class="product-option-item"
          v-for="option in produkStore.item.atributProduk"
          :key="option.id"
          @click="handleSelectOption(option)"
        >
          <div class="product-option-item">
            <input
              type="radio"
              name="product-option"
              :id="'option-' + option.id"
              :value="option.id"
              v-model="form.idAtributProduk"
            />
            <label :for="'option-' + option.id">
              <span class="text">{{ option.deskripsi }}</span>
              <span class="price">
                {{ setMoneyDelimiter(option.harga) }}</span
              ></label
            >
          </div>
        </div>
      </div>
      <span class="message danger fz-em-07 m-4-top">{{
        info.idAtributProduk.message
      }}</span>
    </section>
    <section class="recipient">
      <p class="title ff-open-sans">Data Penerima</p>
      <div class="receipent-form">
        <div class="receipent-form-item">
          <BasesInputCustom
            label="Nama Lengkap"
            field-id="nama-lengkap"
            field-name="nama-lengkap"
            required
            v-model="form.namaLengkap"
            placeholder="Nama Lengkap"
            :message-type="info.namaLengkap.type"
            :message="info.namaLengkap.message"
          />
          <BasesInputCustom
            label="Nomor Whatsapp"
            field-id="nomor-whatsapp"
            field-name="nomor-whatsapp"
            required
            v-model="form.nomorWhatsapp"
            mask="+62 #### #### #### ####"
            placeholder="+62 xxxx xxxx xxxx"
            :message-type="info.nomorWhatsapp.type"
            :message="info.nomorWhatsapp.message"
          />
          <BasesTextAreaCustom
            label="Alamat Lengkap"
            field-id="alamat-lengkap"
            field-name="alamat-lengkap"
            required
            v-model="form.alamat"
            placeholder="Alamat Lengkap"
            :message-type="info.alamat.type"
            :message="info.alamat.message"
          />
          <BasesSelectCustom
            label="Provinsi"
            field-id="provinsi"
            field-name="provinsi"
            required
            placeholder="Pilih Provinsi"
            :selected="form.idProvinsi"
            :ro-value="roValueProvinsi"
            :list="locationStore.provinces"
            @select="handleSelectProvinsi"
            :message-type="info.idProvinsi.type"
            :message="info.idProvinsi.message"
          />
          <BasesSelectCustom
            label="Kota"
            field-id="kota"
            field-name="kota"
            required
            placeholder="Pilih Kota"
            :selected="form.idKota"
            :ro-value="roValueKota"
            :list="locationStore.cities"
            :disabled="!form.idProvinsi"
            @select="handleSelectKota"
            :message-type="info.idKota.type"
            :message="info.idKota.message"
          />
          <BasesSelectCustom
            label="Kecamatan"
            field-id="kecamatan"
            field-name="kecamatan"
            required
            placeholder="Pilih Kecamatan"
            :selected="form.idKecamatan"
            :ro-value="roValueKecamatan"
            :list="locationStore.districts"
            :disabled="!form.idKota"
            @select="handleSelectKecamatan"
            :message-type="info.idKecamatan.type"
            :message="info.idKecamatan.message"
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
              v-model="form.metodePembayaran"
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
              v-model="form.metodePembayaran"
            />
          </div>
        </div>
        <span class="message danger fz-em-07 m-4-top">{{
          info.metodePembayaran.message
        }}</span>
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
      <BasesButtonCustom
        class="action-btn btn-primary w-p-100 m-8-bottom"
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
