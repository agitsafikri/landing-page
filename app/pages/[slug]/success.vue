<script setup lang="ts">
const pesananStore = usePesananStore();

onMounted(() => {
  if (!pesananStore.isSubmitted) navigateTo("/");
});
</script>

<template>
  <NuxtLayout name="client-layouts">
    <OrderSuccess />
  </NuxtLayout>
</template>
