<script setup lang="ts">
import { vMaska } from "maska/vue";
interface propsInterface {
  type?: string;
  label?: string;
  modelValue?: string | number;
  value?: string;
  error?: boolean;
  message?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  maxLength?: string;
  min?: number;
  max?: number;
  withMessage?: boolean;
  messageType?: string | "error" | "info";
  required?: boolean;
  customClass?: string;
  fieldId?: string;
  fieldName?: string;
  mask?: string | object;
  /**
   * Sembunyikan label secara visual, TETAPI biarkan tetap terbaca pembaca layar.
   * Bukan `v-if` maupun `display:none` — menghapus label dari pohon aksesibilitas
   * membuat form tidak dapat diisi pengguna tunanetra (TDD produk-display-config §5.1).
   */
  labelHidden?: boolean;
}

const props = withDefaults(defineProps<propsInterface>(), {
  type: "text",
  error: false,
  withMessage: true,
  loading: false,
  min: 0,
  max: 0,
  required: false,
  customClass: "",
  fieldId: "",
  fieldName: "",
  mask: "",
  labelHidden: false,
});

const emits = defineEmits([
  "input",
  "change",
  "blur",
  "keypress",
  "keydown",
  "keyup",
  "keyup.enter",
  "keypress.enter",
  "keyup.tab",
  "keydown.tab",
  "click",
  "onClickField",
  "onFocus",
  "update:modelValue",
  "onKeyupEnter",
  "onKeypressEnter",
  "onKeyupTab",
  "onKeydownTab",
]);
function onChange(e: { target: { value: any } }) {
  const value = e.target.value;
  emits("update:modelValue", value);
}
function onFocus(e: any) {
  emits("onFocus", e);
}
function change(e: any) {
  emits("change", e);
}
function onBlur(e: any) {
  emits("blur", e);
}
function onKeypress(e: any) {
  emits("keypress", e);
}
function onKeydown(e: any) {
  emits("keydown", e);
}
function onKeyup(e: any) {
  emits("keyup", e);
}
function onKeyupEnter(e: any) {
  emits("onKeyupEnter", e);
}
function onKeypressEnter(e: any) {
  emits("onKeypressEnter", e);
}
function onKeyupTab(e: any) {
  emits("onKeyupTab", e);
}
function onKeydownTab(e: any) {
  emits("onKeydownTab", e);
}
function onClick(e: any) {
  emits("click", e);
}

// Aksesibilitas: field wajib dan galat harus terbaca screen reader, bukan hanya
// ditandai `*` dan warna (TDD produk-form-config §20.4).
const hasError = computed(() => props.error || props.messageType === "error");
const messageId = computed(() =>
  props.fieldId ? `${props.fieldId}-message` : undefined,
);
const describedBy = computed(() =>
  props.withMessage && props.message ? messageId.value : undefined,
);
</script>

<template>
  <div class="input-group">
    <label v-if="label" :for="fieldId" :class="{ 'sr-only': labelHidden }">
      {{ label }}
      <span class="danger" v-if="required" aria-hidden="true">*</span>
    </label>
    <div class="field">
      <div class="skeleton w-min-150 w-p-100 h-34" v-if="loading" />
      <input
        :class="error && !disabled ? 'error' : '' + ' ' + customClass"
        :maxlength="maxLength"
        autocomplete="false"
        :type="type"
        :value="modelValue ? modelValue : value"
        :name="label"
        :min="min"
        :max="max"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :id="fieldId"
        :fieldName="fieldName"
        :aria-required="required || undefined"
        :aria-invalid="hasError || undefined"
        :aria-describedby="describedBy"
        @input="
          onChange({
            target: { value: ($event.target as HTMLInputElement).value },
          })
        "
        @click="onClick"
        @change="change"
        @focus="onFocus"
        @blur="onBlur"
        @keypress="onKeypress"
        @keydown="onKeydown"
        @keyup="onKeyup"
        @keyup.enter="onKeyupEnter"
        @keypress.enter="onKeypressEnter"
        @keyup.tab="onKeyupTab"
        @keydown.tab="onKeydownTab"
        v-maska="mask"
        v-else
      />
      <slot name="prefix-icon" class="prefix-icon" v-if="!loading" />
      <slot name="suffix-icon" class="suffix-icon" v-if="!loading" />
    </div>
    <span
      :id="messageId"
      class="message"
      :class="{
        danger: messageType === 'error',
        info: messageType === 'info',
      }"
      v-if="withMessage && !loading"
    >
      {{ message }}
    </span>
    <slot />
  </div>
</template>

<style scoped>
/* Terlihat oleh pembaca layar, tidak oleh mata. Ditaruh di komponen, bukan di
   assets/styles, karena SCSS landing page berada di submodule repo terpisah. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
