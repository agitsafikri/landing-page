<script setup lang="ts">
const pesananStore = usePesananStore();
const route = useRoute();

onMounted(() => {
  if (!pesananStore.isSubmitted) navigateTo("/");
});
</script>

<template>
  <NuxtLayout name="client-layouts">
    <OrderSuccess />
  </NuxtLayout>
</template>
