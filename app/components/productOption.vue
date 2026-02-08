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
  <section class="product-option">
    <p class="title ff-open-sans">Pilihan Produk</p>
    <div class="product-option-list">
      <div
        class="product-option-item"
        v-for="option in productOptions"
        :key="option.id"
      >
        <div class="product-option-item">
          <input
            type="radio"
            name="product-option"
            :id="'option-' + option.id"
            :value="option.id"
          />
          <label :for="'option-' + option.id">
            <span class="text">{{ option.text }}</span>
            <span class="price">Rp. {{ option.price }}</span></label
          >
        </div>
      </div>
    </div>
  </section>
</template>
