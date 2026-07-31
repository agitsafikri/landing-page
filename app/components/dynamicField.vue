<script setup lang="ts">
import {
  controlOf,
  effectivePlaceholder,
  optionsOf,
} from "~/functions/formConfig";
import type {
  FieldInfo,
  FormFieldCheckout,
  SelectOption,
} from "~/types/formConfig";

interface propsInterface {
  field: FormFieldCheckout;
  modelValue: any;
  info?: FieldInfo;
  /** Opsi untuk field lokasi. Field SELECT memakai `field.options`. */
  options?: SelectOption[];
  /** Teks yang tampil pada kontrol select (SelectCustom tidak memakai v-model). */
  roValue?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Setelan produk `hideFormLabel` — label disembunyikan visual, bukan dihapus. */
  labelHidden?: boolean;
}

const props = withDefaults(defineProps<propsInterface>(), {
  roValue: "",
  disabled: false,
  loading: false,
  labelHidden: false,
});

const emits = defineEmits<{
  "update:modelValue": [value: any];
  select: [option: SelectOption];
  blur: [];
}>();

/** Digit saja — nomor dinormalkan menjadi 62… saat blur (§16.1). */
const PHONE_MASK = "###############";

const control = computed(() => controlOf(props.field.fieldType));

const selectList = computed<SelectOption[]>(() =>
  control.value === "location" ? (props.options ?? []) : optionsOf(props.field),
);

const messageType = computed(() => props.info?.type ?? "info");

/**
 * Galat mengalahkan helpText. Keduanya dirender sebagai teks — nilai berasal
 * dari input Admin sehingga tidak boleh lewat innerHTML (§15.5).
 */
const message = computed(
  () => props.info?.message || props.field.helpText || "",
);

const placeholder = computed(() =>
  effectivePlaceholder(props.field, props.labelHidden),
);

const maxLength = computed(() => {
  const max = props.field.validation?.maxLength;
  return max ? String(max) : undefined;
});

const onInput = (value: any) => emits("update:modelValue", value);

const onBlur = () => emits("blur");
</script>

<!--
  Tanpa elemen pembungkus: jarak antar field berasal dari selector adjacency
  `.input-group + .input-group` di bases/input.scss. Pembungkus tambahan
  memutus adjacency itu dan menghilangkan jaraknya.
-->
<template>
  <BasesSelectCustom
    v-if="control === 'select' || control === 'location'"
    :data-field-key="field.fieldKey"
    :label="field.label"
    :field-id="field.fieldKey"
    :field-name="field.fieldKey"
    :required="field.isRequired"
    :placeholder="placeholder"
    :label-hidden="labelHidden"
    :list="selectList"
    :selected="modelValue"
    :ro-value="roValue"
    :disabled="disabled"
    :loading="loading"
    :message="message"
    :message-type="messageType"
    @select="emits('select', $event)"
    @blur="onBlur"
  />

  <BasesTextAreaCustom
    v-else-if="control === 'textarea'"
    :data-field-key="field.fieldKey"
    :label="field.label"
    :field-id="field.fieldKey"
    :field-name="field.fieldKey"
    :required="field.isRequired"
    :placeholder="placeholder"
    :label-hidden="labelHidden"
    :model-value="modelValue"
    :max-length="maxLength"
    :disabled="disabled"
    :loading="loading"
    :message="message"
    :message-type="messageType"
    @update:model-value="onInput"
    @blur="onBlur"
  />

  <BasesInputCustom
    v-else
    :data-field-key="field.fieldKey"
    :label="field.label"
    :field-id="field.fieldKey"
    :field-name="field.fieldKey"
    :required="field.isRequired"
    :placeholder="placeholder"
    :label-hidden="labelHidden"
    :model-value="modelValue"
    :type="control === 'phone' ? 'tel' : 'text'"
    :mask="control === 'phone' ? PHONE_MASK : ''"
    :max-length="maxLength"
    :disabled="disabled"
    :loading="loading"
    :message="message"
    :message-type="messageType"
    @update:model-value="onInput"
    @blur="onBlur"
  />
</template>
