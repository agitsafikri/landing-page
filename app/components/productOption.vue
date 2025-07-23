<script setup lang="ts">
const productOptions = ref([
  {
    id: 1,
    text: "Beli 1 dapat 2",
    price: 100000,
  },
  {
    id: 2,
    text: "Beli 1 dapat 3",
    price: 100000,
  },
  {
    id: 3,
    text: "Beli 1 dapat 4",
    price: 100000,
  },
]);
</script>

<template>
  <section id="product-option">
    <h3 class="text-bold">Pilihan Produk</h3>
    <div id="product-option-list">
      <div
        class="product-option-item"
        v-for="option in productOptions"
        :key="option.id"
      >
        <input
          type="radio"
          name="product-option"
          :id="'option-' + option.id"
          :value="option.id"
        />
        <label :for="'option-' + option.id"
          >{{ option.text }} (Rp. {{ option.price }})</label
        >
      </div>
    </div>
  </section>
</template>
