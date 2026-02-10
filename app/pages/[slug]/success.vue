<script setup lang="ts">
const pesananStore = usePesananStore();
const produkStore = useProdukStore();

onMounted(() => {
  if (!pesananStore.isSubmitted) navigateTo("/");

  useHead({
    script: [
      {
        innerHTML: produkStore.item.embededPurchaseScript,
        type: "text/javascript",
      },
    ],
  });
});
</script>

<template>
  <NuxtLayout name="client-layouts">
    <OrderSuccess />
  </NuxtLayout>
</template>
