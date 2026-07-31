// Helper renderer form checkout dinamis.
// Acuan: TDD produk-form-config-frontend §15–§18.

import type {
  ApiFieldError,
  FieldInfo,
  FormFieldCheckout,
  FormFieldType,
  SelectOption,
} from "~/types/formConfig";
import { validateForm } from "./formHelper";

/** Kontrol UI yang merender sebuah tipe field. */
export type FieldControl = "text" | "textarea" | "select" | "phone" | "location";

const FIELD_CONTROL: Record<FormFieldType, FieldControl> = {
  TEXT: "text",
  TEXTAREA: "textarea",
  SELECT: "select",
  PHONE: "phone",
  PROVINCE: "location",
  CITY: "location",
  DISTRICT: "location",
};

/**
 * Registry tipe → kontrol (§16). Tipe yang tidak dikenal — mis. backend
 * menambah tipe baru sebelum checkout diperbarui — jatuh ke `text`, BUKAN
 * dilewatkan: field wajib yang dilewatkan menghasilkan REQUIRED_FIELD_MISSING
 * yang tidak dapat diperbaiki pelanggan.
 */
export const controlOf = (fieldType: string): FieldControl =>
  FIELD_CONTROL[fieldType as FormFieldType] ?? "text";

/** Rantai lokasi. Urutan larik menentukan ketergantungan & pengosongan berantai (§17). */
export const LOCATION_CHAIN: FormFieldType[] = ["PROVINCE", "CITY", "DISTRICT"];

export const isLocationField = (fieldType: string) =>
  LOCATION_CHAIN.includes(fieldType as FormFieldType);

/**
 * Pemetaan System Field ke atribut payload `POST /order/create` (§18.1).
 *
 * Ini SATU-SATUNYA tempat client boleh mengenali `field_key` System Field —
 * aman karena backend menjamin keenam kunci ini tidak pernah berubah.
 * Pemilihan komponen tetap berbasis `fieldType` (§15.5).
 */
export const SYSTEM_FIELD_PAYLOAD_MAP: Record<string, string> = {
  customer_name: "namaLengkap",
  phone_number: "nomorWhatsapp",
  address: "alamat",
  province: "idProvinsi",
  city: "idKota",
  district: "idKecamatan",
};

/** Sejajar dengan `isEmpty()` backend: angka 0 dan boolean false TIDAK kosong (§18.3). */
export const isBlank = (v: any): boolean => {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  return false;
};

const toNumber = (v: any): number | null => {
  if (isBlank(v)) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

/**
 * `08…` → `628…`. Dijalankan saat blur, bukan saat mengetik (§16.1) — mengubah
 * nilai per ketukan memindahkan kursor dan merusak penyuntingan.
 */
export const normalizePhone = (raw: any): string => {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  const local = digits.startsWith("62") ? digits.slice(2) : digits;
  return `62${local.replace(/^0+/, "")}`;
};

/** State awal: `defaultValue ?? ''` untuk setiap field (§15.4 langkah 2). */
export const initFormValues = (
  fields: FormFieldCheckout[],
): Record<string, any> => {
  const values: Record<string, any> = {};
  for (const f of fields) values[f.fieldKey] = f.defaultValue ?? "";
  return values;
};

export const initFormInfo = (
  fields: FormFieldCheckout[],
): Record<string, FieldInfo> => {
  const info: Record<string, FieldInfo> = {};
  for (const f of fields) info[f.fieldKey] = { type: "info", message: "" };
  return info;
};

/**
 * Placeholder yang benar-benar dilihat pelanggan
 * (TDD produk-display-config §3.2 & §5.1).
 *
 * Ketika `hideFormLabel` aktif, placeholder menjadi satu-satunya petunjuk:
 * - field wajib mendapat sufiks ` *`, menggantikan tanda `*` pada label yang
 *   tersembunyi secara visual;
 * - placeholder kosong jatuh ke `label`. Dashboard sudah memperingatkan kasus
 *   ini, tetapi renderer tetap harus tahan — kotak isian tanpa petunjuk sama
 *   sekali jauh lebih buruk daripada label yang berpindah tempat.
 */
export const effectivePlaceholder = (
  field: FormFieldCheckout,
  hideFormLabel: boolean,
): string => {
  const base = field.placeholder?.trim() || "";
  if (!hideFormLabel) return base;
  const hint = base || field.label;
  return field.isRequired ? `${hint} *` : hint;
};

/** Opsi `SELECT` dari konfigurasi. Field lokasi mengambil opsinya dari locationStore. */
export const optionsOf = (field: FormFieldCheckout): SelectOption[] =>
  (field.options ?? []).map((o) => ({ name: o.label, value: o.value }));

const setError = (
  info: Record<string, FieldInfo>,
  key: string,
  message: string,
) => {
  info[key] = { type: "error", message };
};

/**
 * Validasi client untuk UX saja — server memvalidasi ulang seluruhnya (§15.5).
 * Menyusun aturan `validateForm` secara dinamis agar pesan galat Indonesia
 * tetap berasal dari satu sumber (`formHelper.ts`).
 */
export const validateCheckoutForm = (
  fields: FormFieldCheckout[],
  values: Record<string, any>,
  info: Record<string, FieldInfo>,
): number => {
  const validation: Record<string, any> = {};

  for (const f of fields) {
    const rule: Record<string, any> = {
      label: f.label,
      required: f.isRequired,
    };

    // Aturan panjang hanya bermakna untuk nilai teks yang terisi. Bila kosong,
    // galat "wajib diisi" sudah cukup (dan minLength pada field opsional yang
    // dibiarkan kosong bukan galat).
    if (
      f.validation &&
      !isLocationField(f.fieldType) &&
      !isBlank(values[f.fieldKey])
    ) {
      if (f.validation.minLength) rule.minLength = f.validation.minLength;
      if (f.validation.maxLength) rule.maxLength = f.validation.maxLength;
    }

    validation[f.fieldKey] = rule;
  }

  let count = validateForm(validation, values, info);

  // `pattern` tidak didukung validateForm — diperiksa terpisah.
  for (const f of fields) {
    const pattern = f.validation?.pattern;
    if (!pattern) continue;
    if (info[f.fieldKey]?.type === "error") continue; // jangan menimpa galat yang lebih spesifik
    if (isBlank(values[f.fieldKey])) continue;

    let valid = true;
    try {
      valid = new RegExp(pattern).test(String(values[f.fieldKey]));
    } catch {
      valid = true; // pattern rusak dari sisi Admin tidak boleh menghalangi pesanan
    }

    if (!valid) {
      setError(info, f.fieldKey, `${f.label} tidak sesuai format`);
      count++;
    }
  }

  return count;
};

/**
 * Menyusun payload `POST /order/create` (§18.2).
 *
 * `base` memuat atribut tingkat pesanan yang bukan bagian formConfig:
 * `idProduk`, `idAtributProduk`, `metodePembayaran`, `source`.
 */
export const buildOrderPayload = (
  fields: FormFieldCheckout[],
  values: Record<string, any>,
  base: Record<string, any>,
): Record<string, any> => {
  const payload: Record<string, any> = { ...base };
  const customFields: { fieldKey: string; value: any }[] = [];

  for (const f of fields) {
    const value = values[f.fieldKey];

    if (f.fieldCategory === "SYSTEM") {
      const attr = SYSTEM_FIELD_PAYLOAD_MAP[f.fieldKey];
      if (!attr) continue; // System Field yang belum dikenal client — biarkan server menolak

      if (isLocationField(f.fieldType)) {
        payload[attr] = toNumber(value); // backend bertipe Integer
      } else if (f.fieldType === "PHONE") {
        payload[attr] = normalizePhone(value);
      } else {
        payload[attr] = value;
      }
      continue;
    }

    // Custom Field opsional yang kosong tidak dikirim.
    if (isBlank(value)) continue;
    customFields.push({ fieldKey: f.fieldKey, value });
  }

  // Selalu dikirim, meski kosong — lebih konsisten daripada undefined (§18.2).
  payload.customFields = customFields;
  return payload;
};

export interface ApiErrorOutcome {
  /** Galat tingkat form — tidak terpetakan ke field mana pun. */
  formError: string;
  /** fieldKey pertama yang bergalat, untuk scrollToFirstError (§18.4). */
  firstErrorKey: string;
}

/**
 * Pemulihan struktural (muat ulang konfigurasi / setel ulang rantai lokasi)
 * WAJIB dijalankan sebelum `applyApiErrors`, karena keduanya membangun ulang
 * state field dan akan menghapus tanda galat yang sudah dipasang.
 */
export const hasErrorCode = (errors: ApiFieldError[], code: string) =>
  errors.some((e) => e.code === code);

const GENERIC_MESSAGE =
  "Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.";

const SHIPPING_UNAVAILABLE =
  "Ongkos kirim untuk kecamatan yang dipilih belum tersedia. Silakan hubungi penjual.";

/**
 * Memetakan daftar galat backend ke pesan per field (§18.4–§18.5).
 * `ErrorDto.field` berisi `field_key`, baik Custom maupun System Field.
 */
export const applyApiErrors = (
  errors: ApiFieldError[],
  fields: FormFieldCheckout[],
  info: Record<string, FieldInfo>,
  fallbackMessage = "",
): ApiErrorOutcome => {
  const known = new Set(fields.map((f) => f.fieldKey));
  const outcome: ApiErrorOutcome = { formError: "", firstErrorKey: "" };

  for (const err of errors) {
    if (err.code === "SYSTEM_FIELD_IN_CUSTOM_PAYLOAD") {
      // Bug client. Pelanggan tidak perlu tahu detailnya.
      console.error("[checkout] System Field terkirim sebagai customField", err);
      outcome.formError = GENERIC_MESSAGE;
      continue;
    }

    const message =
      err.code === "SHIPPING_RATE_NOT_FOUND"
        ? SHIPPING_UNAVAILABLE
        : err.message;

    if (err.field && known.has(err.field)) {
      setError(info, err.field, message);
      if (!outcome.firstErrorKey) outcome.firstErrorKey = err.field;
    } else {
      outcome.formError = message;
    }
  }

  if (!outcome.formError && !outcome.firstErrorKey) {
    outcome.formError = fallbackMessage || GENERIC_MESSAGE;
  }

  return outcome;
};

/**
 * Menggeser tampilan ke field bergalat pertama. Wajib ada: form checkout lebih
 * tinggi dari satu layar, dan galat yang tidak terlihat dibaca pelanggan
 * sebagai "tombol tidak berfungsi" (§18.4).
 */
export const scrollToField = (fieldKey: string) => {
  if (!fieldKey || typeof document === "undefined") return;
  const el = document.querySelector(`[data-field-key="${fieldKey}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.querySelector<HTMLElement>("input, textarea, select")?.focus();
};

/** fieldKey bergalat pertama menurut urutan render, bukan urutan respons. */
export const firstErrorKeyInOrder = (
  fields: FormFieldCheckout[],
  info: Record<string, FieldInfo>,
): string =>
  fields.find((f) => info[f.fieldKey]?.type === "error")?.fieldKey ?? "";
