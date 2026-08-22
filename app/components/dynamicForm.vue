<script setup lang="ts">
import {
  LOCATION_CHAIN,
  isBlank,
  isLocationField,
  normalizePhone,
} from "~/functions/formConfig";
import type {
  FieldInfo,
  FormFieldCheckout,
  FormFieldType,
  SelectOption,
} from "~/types/formConfig";

interface propsInterface {
  /** Sudah tersaring & terurut oleh backend — jangan urutkan ulang (§15.2). */
  fields: FormFieldCheckout[];
  /** Dimiliki halaman agar dapat menyusun payload; komponen ini memutakhirkannya. */
  values: Record<string, any>;
  info: Record<string, FieldInfo>;
  /** Setelan produk `hideFormLabel`. */
  labelHidden?: boolean;
}

const props = defineProps<propsInterface>();

const locationStore = useLocationStore();

/** Teks tampilan tiap kontrol select, terpisah dari nilainya. */
const roValues = ref<Record<string, string>>({});
const loadingKeys = ref<Record<string, boolean>>({});

const fieldOfType = (type: FormFieldType) =>
  props.fields.find((f) => f.fieldType === type);

const locationOptions = (type: FormFieldType): SelectOption[] => {
  if (type === "PROVINCE") return locationStore.provinces;
  if (type === "CITY") return locationStore.cities;
  if (type === "DISTRICT") return locationStore.districts;
  return [];
};

const optionsFor = (field: FormFieldCheckout): SelectOption[] =>
  isLocationField(field.fieldType) ? locationOptions(field.fieldType) : [];

/**
 * Tipe field yang dirender sebagai combobox tercari.
 *
 * Syaratnya opsi sudah dimuat penuh, karena pencarian berjalan lokal. Ketiga
 * tingkat lokasi memenuhinya: `location/*` mengembalikan satu daftar utuh per
 * induk tanpa paginasi, dan `loadLocationLevel` menunggu daftar itu selesai
 * sebelum tingkat tersebut dapat dibuka.
 *
 * Bila kelak ada tingkat lokasi yang dimuat bertahap/diambil per kata kunci,
 * tingkat itu TIDAK boleh masuk daftar ini: penyaringan lokal atas daftar
 * separuh akan menyembunyikan opsi yang sah dari pelanggan.
 */
const SEARCHABLE_TYPES: FormFieldType[] = ["PROVINCE", "CITY", "DISTRICT"];

const isSearchable = (field: FormFieldCheckout) =>
  SEARCHABLE_TYPES.includes(field.fieldType);

/** Tingkat lokasi nonaktif hingga tingkat di atasnya terpilih (§16). */
const isDisabled = (field: FormFieldCheckout): boolean => {
  if (!isLocationField(field.fieldType)) return false;
  const index = LOCATION_CHAIN.indexOf(field.fieldType);
  if (index <= 0) return false;

  const parent = fieldOfType(LOCATION_CHAIN[index - 1]!);
  if (!parent) return false; // tingkat induk tidak dikonfigurasi — jangan kunci pelanggan
  return isBlank(props.values[parent.fieldKey]);
};

const clearError = (fieldKey: string) => {
  if (props.info[fieldKey]?.type === "error") {
    props.info[fieldKey] = { type: "info", message: "" };
  }
};

/** Memuat opsi tingkat berikutnya, dan selalu mengosongkan tingkat di bawahnya. */
const loadLocationLevel = async (type: FormFieldType, parentId: any) => {
  const field = fieldOfType(type);
  if (field) loadingKeys.value[field.fieldKey] = true;

  try {
    if (type === "CITY") {
      locationStore.cities = [];
      locationStore.districts = [];
      await locationStore.onIndexCity(parentId);
    } else if (type === "DISTRICT") {
      locationStore.districts = [];
      await locationStore.onIndexDistrict(parentId);
    }
  } finally {
    if (field) loadingKeys.value[field.fieldKey] = false;
  }
};

const onSelect = async (field: FormFieldCheckout, option: SelectOption) => {
  props.values[field.fieldKey] = option.value;
  roValues.value[field.fieldKey] = option.name;
  clearError(field.fieldKey);

  if (!isLocationField(field.fieldType)) return;

  const index = LOCATION_CHAIN.indexOf(field.fieldType);

  // Seluruh tingkat di bawahnya dikosongkan, bukan hanya yang tepat di
  // bawahnya — melewatkan ini menghasilkan kombinasi lokasi tak konsisten (§17.2).
  for (const type of LOCATION_CHAIN.slice(index + 1)) {
    const child = fieldOfType(type);
    if (!child) continue;
    props.values[child.fieldKey] = "";
    roValues.value[child.fieldKey] = "";
    clearError(child.fieldKey);
  }

  const next = LOCATION_CHAIN[index + 1];
  if (next) await loadLocationLevel(next, option.value);
};

const onInput = (field: FormFieldCheckout, value: any) => {
  props.values[field.fieldKey] = value;
  clearError(field.fieldKey);
};

const onBlur = (field: FormFieldCheckout) => {
  // Normalisasi hanya sebagai umpan balik saat blur — bukan per ketukan (§16.1).
  if (field.fieldType !== "PHONE") return;
  const value = props.values[field.fieldKey];
  if (isBlank(value)) return;
  props.values[field.fieldKey] = normalizePhone(value);
};

/**
 * Menyelaraskan teks tampilan select dengan nilai yang ada. Dipakai saat
 * konfigurasi pertama dimuat (menghormati `defaultValue`) dan setelah
 * konfigurasi dimuat ulang.
 */
const syncDisplayValues = () => {
  const next: Record<string, string> = {};
  for (const field of props.fields) {
    const value = props.values[field.fieldKey];
    if (isBlank(value)) continue;

    const list = isLocationField(field.fieldType)
      ? locationOptions(field.fieldType)
      : (field.options ?? []).map((o) => ({ name: o.label, value: o.value }));

    const match = list.find((o) => String(o.value) === String(value));
    if (match) next[field.fieldKey] = match.name;
  }
  roValues.value = next;
};

/** Setel ulang seluruh rantai lokasi — LOCATION_HIERARCHY_MISMATCH (§18.5). */
const resetLocationChain = async () => {
  for (const type of LOCATION_CHAIN) {
    const field = fieldOfType(type);
    if (!field) continue;
    props.values[field.fieldKey] = "";
    roValues.value[field.fieldKey] = "";
    clearError(field.fieldKey);
  }
  locationStore.cities = [];
  locationStore.districts = [];
  if (!locationStore.provinces.length) await locationStore.onIndexProvince();
};

onMounted(async () => {
  // Provinsi di-prefetch bersamaan dengan produk di halaman. Ini hanya jaring
  // pengaman bila konfigurasi memuat field PROVINCE tetapi daftarnya kosong.
  if (fieldOfType("PROVINCE") && !locationStore.provinces.length) {
    await locationStore.onIndexProvince();
  }
  syncDisplayValues();
});

watch(() => props.fields, syncDisplayValues);

defineExpose({ resetLocationChain, syncDisplayValues });
</script>

<!--
  Fragment tanpa pembungkus, agar setiap `.input-group` tetap menjadi anak
  langsung `.receipent-form-item` seperti markup sebelumnya — lihat catatan
  adjacency di dynamicField.vue.
-->
<template>
  <DynamicField
    v-for="field in fields"
    :key="field.fieldKey"
    :field="field"
    :model-value="values[field.fieldKey]"
    :info="info[field.fieldKey]"
    :options="optionsFor(field)"
    :ro-value="roValues[field.fieldKey] || ''"
    :searchable="isSearchable(field)"
    :disabled="isDisabled(field)"
    :loading="loadingKeys[field.fieldKey] || false"
    :label-hidden="labelHidden"
    @update:model-value="onInput(field, $event)"
    @select="onSelect(field, $event)"
    @blur="onBlur(field)"
  />
</template>
