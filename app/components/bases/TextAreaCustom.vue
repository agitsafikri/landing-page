<script setup lang="ts">
interface propsInterface {
  type?: string;
  label?: string;
  modelValue?: string;
  error?: boolean;
  message?: string;
  rightIcon?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  maxLength?: string;
  withMessage?: boolean;
  messageType?: string | "error" | "info";
  required?: boolean;
  customClass?: string;
  fieldId?: string;
  fieldName?: string;
  /** Sembunyikan label secara visual saja — lihat catatan di InputCustom. */
  labelHidden?: boolean;
}

const prop = withDefaults(defineProps<propsInterface>(), {
  type: "text",
  error: false,
  errorMsg: "Tidak boleh kosong",
  withMessage: true,
  loading: false,
  labelHidden: false,
});

const emits = defineEmits([
  "update:modelValue",
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

// Aksesibilitas: sejajar dengan InputCustom (TDD produk-form-config §20.4).
const hasError = computed(() => prop.error || prop.messageType === "error");
const messageId = computed(() =>
  prop.fieldId ? `${prop.fieldId}-message` : undefined,
);
const describedBy = computed(() =>
  prop.withMessage && prop.message ? messageId.value : undefined,
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
      <textarea
        :class="error && !disabled ? 'error' : '' + ' ' + customClass"
        :maxlength="maxLength"
        :id="fieldId"
        :fieldName="fieldName"
        autocomplete="off"
        :value="prop.modelValue"
        :name="prop.label"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
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
        v-else
      />
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
  </div>
</template>

<style scoped>
/* Terlihat oleh pembaca layar, tidak oleh mata — lihat catatan di InputCustom. */
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
