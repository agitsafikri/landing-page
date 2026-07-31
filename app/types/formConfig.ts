// Tipe untuk renderer form checkout dinamis.
// Acuan: TDD produk-form-config-frontend §15.3 (Bentuk Item).

/** Tipe khusus System Field — hanya untuk render, tidak pernah dipilih Admin. */
export type SystemFieldType = "PHONE" | "PROVINCE" | "CITY" | "DISTRICT";

/** Tipe yang boleh dipilih Admin untuk Custom Field. */
export type CustomFieldType = "TEXT" | "TEXTAREA" | "SELECT";

export type FormFieldType = CustomFieldType | SystemFieldType;

export interface FieldOption {
  label: string;
  value: string;
}

export interface ValidationRule {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

/**
 * Satu field pada `data.formConfig` dari `GET /produk/checkout`.
 *
 * Backend menjamin (§15.2): hanya field aktif yang dikirim, sudah terurut
 * `sortOrder` naik, dan `sortOrder` ternormalkan 1..N. Client tidak menyaring
 * maupun mengurutkan ulang.
 */
export interface FormFieldCheckout {
  fieldKey: string;
  fieldCategory: "SYSTEM" | "CUSTOM";
  fieldType: FormFieldType;
  label: string;
  placeholder: string | null;
  helpText: string | null;
  isRequired: boolean;
  defaultValue: string | null;
  options: FieldOption[] | null;
  sortOrder: number;
  validation: ValidationRule | null;
  dataSource: string | null;

  // Alias kompatibilitas untuk klien lama — akan dihapus backend.
  // Klien ini WAJIB memakai fieldType / sortOrder / isRequired (§15.3).
  tipeField?: string;
  order?: number;
  isMandatory?: boolean;
}

/** Item pada atribut `data` respons 400 (§2.2 — bukan `errors`). */
export interface ApiFieldError {
  field: string;
  message: string;
  code?: string;
  meta?: Record<string, any>;
}

/** State pesan per field, mengikuti konvensi `messageType` komponen bases. */
export interface FieldInfo {
  type: "info" | "error";
  message: string;
}

/** Opsi untuk `BasesSelectCustom`. */
export interface SelectOption {
  name: string;
  value: string | number;
}
