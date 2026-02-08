<script setup lang="ts">
const alertStore = useAlertStore();

const setTime = () => {
  setTimeout(() => {
    alertStore.hideAlert();
  }, 3000);
};

onUpdated(() => {
  setTime();
});
</script>

<template>
  <div
    class="alert-container"
    :class="
      alertStore.show ? `alert-show ${alertStore.type}-alert` : `alert-hide`
    ">
    <div class="alert">
      <!-- <img
        v-if="alertStore.type === 'success'"
        src="@/images/icons/alert-success.svg"
        alt="" />
      <img v-else src="@/images/icons/alert-error.svg" alt="" /> -->
      {{ alertStore.message }}
    </div>
  </div>
</template>
