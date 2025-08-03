<script setup lang="ts">
import ProductDetail from "~/components/productDetail.vue";
</script>

<template>
  <NuxtLayout name="client-layouts">
    <ProductDetail />
    <ProductOption />
    <Recipient />
    <PaymentMethod />
  </NuxtLayout>
</template>
