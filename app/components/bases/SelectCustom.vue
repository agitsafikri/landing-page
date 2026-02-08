<script lang="ts" setup>
import menuDown from "vue-material-design-icons/MenuDown.vue";
import menuUp from "vue-material-design-icons/MenuUp.vue";
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
  isCombobox?: boolean;
  withMessage?: boolean;
  messageType?: string | "error" | "info";
  customClass?: string;
  fieldId?: string;
  fieldName?: string;
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
  customClass: "",
  list: () => [],
  fieldId: "",
  fieldName: "",
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

const searchValue = ref("");
const filterredList: Ref<listInterface[]> = ref([]);
const typingTimer: any = ref(null);
const showDropdown = ref(false);

const clearTime = () => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value);
  }
};

const onSearch = (value: string) => {
  if (!value) return (filterredList.value = props.list!);
  searchValue.value = value;
  filterredList.value = props.list!.filter((item: any) =>
    item.name.toLowerCase().includes(value.toLowerCase()),
  );
};

const handleTimer = (value: string) => {
  clearTime();
  typingTimer.value = setTimeout(() => {
    onSearch(value);
  }, 500);
};
const selectData = (e: any) => {
  showDropdown.value = false;
  emits("select", e);
};
const blur = (e: any) => {
  emits("blur", e);
};

watch(
  () => props.list,
  () => {
    filterredList.value = props.list!;
  },
  { immediate: true },
);

watch(
  () => props.roValue,
  () => {
    searchValue.value = props.roValue;
  },
  { immediate: true },
);
</script>

<template>
  <InputCustom
    :custom-class="
      error && !disabled
        ? 'error'
        : disabled
          ? 'cursor-not-allowed'
          : '' + 'white-bg cursor-pointer ' + customClass
    "
    :disabled="disabled"
    :readonly="readonly || !isCombobox"
    v-model="searchValue"
    type="text"
    :placeholder="placeholder"
    :with-message="withMessage"
    :message="message"
    :message-type="messageType"
    :label="label"
    :loading="loading"
    :required="required"
    :field-id="fieldId"
    :field-name="fieldName"
    @click.prevent="readonly || disabled ? '' : (showDropdown = !showDropdown)"
    @blur="blur"
    @keyup="handleTimer(searchValue)"
  >
    <template #suffix-icon="{ class: cls }" v-if="!showDropdown">
      <menuDown :class="cls" />
    </template>
    <template #suffix-icon="{ class: cls }" v-else>
      <menuUp :class="cls" />
    </template>
    <div
      v-if="showDropdown"
      class="dropdown-custom"
      :style="label ? 'margin-top: 4rem' : ''"
      @mouseleave="showDropdown = false"
    >
      <div v-if="filterredList.length === 0" class="no-data">
        Data tidak ditemukan
      </div>
      <div
        v-for="(data, index) in filterredList"
        :key="`data-${index}`"
        :ref="`data-item-${index}`"
        class="dropdown-item"
        :class="data.value === selected ? 'selected' : ''"
        @click.prevent="selectData(data)"
      >
        {{ data.name }}
      </div>
    </div>
  </InputCustom>
</template>
