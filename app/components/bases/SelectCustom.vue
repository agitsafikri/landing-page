<script lang="ts" setup>
import menuDown from "vue-material-design-icons/MenuDown.vue";
import menuUp from "vue-material-design-icons/MenuUp.vue";
import InputCustom from "./InputCustom.vue";
interface listInterface {
  name: string;
  value: string | number | boolean;
}
interface propsInterface {
  roValue?: string;
  required?: boolean;
  label?: string;
  placeholder?: string;
  isSearch?: boolean;
  error?: boolean;
  message?: string;
  disabled?: boolean;
  readonly?: boolean;
  list?: listInterface[];
  selected?: any;
  isChild?: any;
  loading?: boolean;
  withClearData?: boolean;
  /**
   * Mode combobox: field dapat diketik untuk menyaring `list`.
   *
   * Penyaringan berjalan sepenuhnya di sisi klien atas `list` yang sudah
   * dimuat — tidak ada permintaan per ketukan. Pemanggil bertanggung jawab
   * memuat seluruh opsi lebih dahulu; daftar yang dimuat sebagian akan
   * menyembunyikan opsi yang sah dari pencarian.
   */
  isCombobox?: boolean;
  withMessage?: boolean;
  messageType?: string | "error" | "info";
  customClass?: string;
  fieldId?: string;
  fieldName?: string;
  /** Diteruskan ke InputCustom di dalamnya — lihat catatan di sana. */
  labelHidden?: boolean;
}
const props = withDefaults(defineProps<propsInterface>(), {
  roValue: "",
  required: false,
  label: "",
  placeholder: "",
  withMessage: true,
  errorMsg: "",
  selected: "",
  isSearch: false,
  error: false,
  disabled: false,
  isChild: false,
  loading: false,
  withClearData: false,
  isCombobox: false,
  customClass: "",
  list: () => [],
  fieldId: "",
  fieldName: "",
  labelHidden: false,
});

const emits = defineEmits([
  "focus",
  "onClick",
  "close",
  "select",
  "mouseleave",
  "blur",
  "input",
  "change",
  "update:modelValue",
  "addData",
  "onRemove",
]);

/** Kata kunci pencarian. Terpisah dari `roValue` agar teks pilihan tidak rusak
 *  ketika pelanggan mengetik lalu membatalkan tanpa memilih apa pun. */
const query = ref("");
const showDropdown = ref(false);
const highlightedIndex = ref(-1);
const listRef = ref<HTMLElement | null>(null);
const fieldRef = ref<any>(null);

const uid = useId();
const listboxId = computed(() => `${props.fieldId || uid}-listbox`);
const optionId = (index: number) => `${listboxId.value}-option-${index}`;

const isBlankValue = (v: any) => v === null || v === undefined || v === "";

/** Perbandingan longgar: `selected` berasal dari payload dan bisa bertipe
 *  string sementara opsi bertipe number (mis. id provinsi). */
const isSelected = (value: listInterface["value"]) =>
  !isBlankValue(props.selected) && String(value) === String(props.selected);

const normalize = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/**
 * Penyaringan lokal per kata, bukan substring utuh: "jawa bar" tetap
 * menemukan "Jawa Barat", dan "yogyakarta" menemukan "DI Yogyakarta".
 */
const filteredList = computed<listInterface[]>(() => {
  const items = props.list ?? [];
  if (!props.isCombobox) return items;

  const tokens = normalize(query.value).split(" ").filter(Boolean);
  if (!tokens.length) return items;

  return items.filter((item) => {
    const name = normalize(item.name);
    return tokens.every((token) => name.includes(token));
  });
});

/** Saat dropdown combobox terbuka field menampilkan kata kunci, di luar itu
 *  menampilkan teks pilihan. */
const inputValue = computed(() =>
  props.isCombobox && showDropdown.value ? query.value : props.roValue,
);

/** Kata kunci dikosongkan saat membuka, jadi pilihan yang sedang berlaku
 *  ditampilkan sebagai placeholder — bukan hilang tanpa jejak. */
const inputPlaceholder = computed(() =>
  props.isCombobox && showDropdown.value && props.roValue
    ? props.roValue
    : props.placeholder,
);

const inputClass = computed(() => {
  const classes = ["white-bg"];
  if (props.disabled) classes.push("cursor-not-allowed");
  else if (props.isCombobox && !props.readonly) classes.push("cursor-text");
  else classes.push("cursor-pointer");
  if (props.customClass) classes.push(props.customClass);
  return classes.join(" ");
});

const isInteractive = computed(() => !props.disabled && !props.readonly);

/** Menempatkan penanda pada opsi terpilih supaya panah lanjut dari sana. */
const indexOfSelected = () =>
  filteredList.value.findIndex((item) => isSelected(item.value));

const scrollHighlightedIntoView = () => {
  const index = highlightedIndex.value;
  if (index < 0) return;
  nextTick(() => {
    listRef.value
      ?.querySelector(`[data-option-index="${index}"]`)
      ?.scrollIntoView({ block: "nearest" });
  });
};

/**
 * Ikon panah memakai `mousedown.prevent` agar dropdown tidak tertutup oleh
 * blur sebelum kliknya terbaca — efek sampingnya fokus tidak pindah ke input.
 * Tanpa pemanggilan ini, membuka lewat ikon menghasilkan combobox yang tidak
 * dapat diketik, dan pada select biasa tidak ada yang berfokus sehingga klik
 * di luar tidak lagi menutup daftar.
 */
const focusInput = () => {
  const root = fieldRef.value?.$el as HTMLElement | undefined;
  root?.querySelector<HTMLInputElement>("input")?.focus();
};

const open = () => {
  if (!isInteractive.value || showDropdown.value) return;
  query.value = "";
  showDropdown.value = true;
  highlightedIndex.value = indexOfSelected();
  scrollHighlightedIntoView();
  focusInput();
};

const close = () => {
  if (!showDropdown.value) return;
  showDropdown.value = false;
  query.value = "";
  highlightedIndex.value = -1;
  emits("close");
};

const toggle = () => (showDropdown.value ? close() : open());

const selectData = (e: listInterface) => {
  close();
  emits("select", e);
};

/** Klik pada field: combobox selalu membuka — menutupnya di sini membuat klik
 *  untuk menaruh kursor pada teks ikut menutup daftar. */
const onFieldClick = () => {
  if (props.isCombobox) open();
  else toggle();
};

/**
 * Membuka saat field mendapat fokus (klik maupun Tab). Wajib untuk combobox:
 * `open()` mengosongkan kata kunci, dan tanpa itu ketukan pertama pelanggan
 * akan menyambung ke teks pilihan yang sedang tampil.
 *
 * InputCustom memancarkan `onFocus`, bukan `focus` — karena itu `@on-focus`.
 */
const onFieldFocus = (e: any) => {
  if (props.isCombobox) open();
  emits("focus", e);
};

const onQueryInput = (value: string) => {
  if (!props.isCombobox) return;
  query.value = String(value ?? "");
  showDropdown.value = true;
  // Penanda kembali ke hasil teratas: hasil sebelumnya bisa sudah tersaring.
  highlightedIndex.value = filteredList.value.length ? 0 : -1;
  emits("input", query.value);
};

const move = (step: number) => {
  const total = filteredList.value.length;
  if (!total) {
    highlightedIndex.value = -1;
    return;
  }
  const current = highlightedIndex.value;
  // Belum ada penanda: turun mulai dari atas, naik mulai dari bawah.
  highlightedIndex.value =
    current < 0
      ? step > 0
        ? 0
        : total - 1
      : (current + step + total) % total;
  scrollHighlightedIntoView();
};

const onKeydown = (e: KeyboardEvent) => {
  if (!isInteractive.value) return;

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      showDropdown.value ? move(1) : open();
      break;
    case "ArrowUp":
      e.preventDefault();
      showDropdown.value ? move(-1) : open();
      break;
    case "Enter": {
      if (!showDropdown.value) return;
      // Tanpa ini Enter mengirim form checkout dengan field lain masih kosong.
      e.preventDefault();
      const option = filteredList.value[highlightedIndex.value];
      if (option) selectData(option);
      break;
    }
    case "Escape":
      if (!showDropdown.value) return;
      e.preventDefault();
      close();
      break;
    case "Tab":
      close();
      break;
    default:
      break;
  }
};

const blur = (e: any) => {
  // Opsi memakai `mousedown.prevent` sehingga fokus tidak lepas saat diklik —
  // blur di sini berarti pelanggan benar-benar meninggalkan field.
  close();
  emits("blur", e);
};

/** Opsi dimuat ulang (mis. rantai lokasi berganti) — penanda lama tidak valid. */
watch(
  () => props.list,
  () => {
    if (!showDropdown.value) return;
    highlightedIndex.value = indexOfSelected();
  },
);
</script>

<template>
  <InputCustom
    ref="fieldRef"
    :custom-class="inputClass"
    :disabled="disabled"
    :readonly="readonly || !isCombobox"
    :model-value="inputValue"
    type="text"
    :placeholder="inputPlaceholder"
    :with-message="withMessage"
    :message="message"
    :message-type="messageType"
    :error="error"
    :label="label"
    :label-hidden="labelHidden"
    :loading="loading"
    :required="required"
    :field-id="fieldId"
    :field-name="fieldName"
    :autocomplete="isCombobox ? 'off' : undefined"
    :role="isCombobox ? 'combobox' : undefined"
    :aria-expanded="isCombobox ? showDropdown : undefined"
    :aria-controls="isCombobox && showDropdown ? listboxId : undefined"
    :aria-autocomplete="isCombobox ? 'list' : undefined"
    :aria-activedescendant="
      isCombobox && showDropdown && highlightedIndex >= 0
        ? optionId(highlightedIndex)
        : undefined
    "
    @update:model-value="onQueryInput"
    @click="onFieldClick"
    @blur="blur"
    @keydown="onKeydown"
    @on-focus="onFieldFocus"
  >
    <template #suffix-icon="{ class: cls }">
      <component
        :is="showDropdown ? menuUp : menuDown"
        :class="cls"
        @mousedown.prevent
        @click="isInteractive ? toggle() : undefined"
      />
    </template>
    <div
      v-if="showDropdown"
      :id="listboxId"
      ref="listRef"
      class="dropdown-custom"
      role="listbox"
      :style="label && !labelHidden ? 'margin-top: 4rem' : ''"
      @mousedown.prevent
    >
      <div v-if="filteredList.length === 0" class="no-data">
        Data tidak ditemukan
      </div>
      <div
        v-for="(data, index) in filteredList"
        :key="`data-${data.value}`"
        :id="optionId(index)"
        :data-option-index="index"
        class="dropdown-item"
        role="option"
        :aria-selected="isSelected(data.value)"
        :class="{
          selected: isSelected(data.value),
          highlighted: index === highlightedIndex,
        }"
        @mousedown.prevent
        @click="selectData(data)"
        @mousemove="highlightedIndex = index"
      >
        {{ data.name }}
      </div>
    </div>
  </InputCustom>
</template>

<style scoped>
/* Menimpa bases/input.scss. Ditaruh di komponen karena SCSS landing page
   berada di submodule repo terpisah — pola yang sama dipakai InputCustom. */
.dropdown-custom {
  /* Global membatasi 100px (~2,5 baris). Terlalu pendek untuk daftar hasil
     pencarian: pelanggan tidak melihat bahwa ada opsi lain di bawahnya. */
  max-height: 13rem;
  /* `html { scroll-behavior: smooth }` membuat navigasi panah tersendat. */
  scroll-behavior: auto;
}

/* Penanda keyboard, disamakan dengan hover agar tetikus dan panah terlihat
   sama. Selector dibuat lebih spesifik dari `.dropdown-item:hover` global. */
.dropdown-custom .dropdown-item.highlighted {
  background-color: #f0f0f0;
}

.dropdown-custom .dropdown-item.selected.highlighted {
  background-color: #005ca1;
}
</style>
