<script setup lang="ts">
const pesananStore = usePesananStore();
const produkStore = useProdukStore();

onMounted(() => {
  if (!pesananStore.isSubmitted) {
    navigateTo("/");
    return;
  }

  
  const harga =
    produkStore.item?.atributProduk?.[0]?.harga || 0;

  // =============================
  // META PURCHASE (Fallback)
  // =============================
  if (
    !produkStore.item?.embededPurchaseScript &&
    typeof window !== "undefined" &&
    window.fbq &&
    !window.__purchaseTracked
  ) {
    window.__purchaseTracked = true;

    fbq("track", "Purchase", {
      content_ids: [produkStore.item.id],
      content_name: produkStore.item.namaProduk,
      currency: "IDR",
      value: harga,
    });
  }

  // =============================
  // GTM PURCHASE
  // =============================
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        currency: "IDR",
        value: harga,
        items: [
          {
            item_id: produkStore.item.id,
            item_name: produkStore.item.namaProduk,
            price: harga,
          },
        ],
      },
    });
  }
});
</script>

<template>
  <NuxtLayout name="client-layouts">
    <OrderSuccess />
  </NuxtLayout>
</template>
