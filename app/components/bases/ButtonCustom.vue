<script setup lang="ts">
interface propsInterface {
  type?: string;
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  minWidth?: any;
  withPadding?: any;
}
const props = withDefaults(defineProps<propsInterface>(), {
  type: '',
  color: 'primary',
  loading: false,
  disabled: false,
  withPadding: true,
  minWidth: 'fit-content',
});
</script>

<template>
  <button
    :disabled="props.loading || props.disabled"
    :class="`btn-${props.color}${props.type ? `-${props.type}` : ''} 
    ${!props.withPadding ? `p-0` : ''}
    w-min-${props.minWidth}`">
    <div class="d-flex align-items-center justify-content-center gap-4">
      <div class="spinner w-24 h-24" v-if="props.loading" />
      <slot v-else />
    </div>
  </button>
</template>
