<script setup lang="ts">
import { useProdukStore } from "~/stores/produkStore";

const route = useRoute();
const slug = route.params.slug as string;
const produkStore = useProdukStore();

const getProduk = async () => {
  await produkStore.onCheckout(slug);
};

onMounted(() => {
  getProduk();
});
</script>

<template>
  <NuxtLayout name="client-layouts">
    <ProductDetail />
    <ProductOption />
    <Recipient />
    <ProductSale />
    <Action />
    <ProductReview />
  </NuxtLayout>
</template>
