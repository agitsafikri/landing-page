<script setup lang="ts">
const dummyImage = "https://unsplash.it/300/300?random";
const dummyProductFeature = [
  "Fitur 1",
  "Fitur 2",
  "Fitur 3",
  "Fitur 4",
  "Fitur 5",
];
</script>

<template>
  <img :src="dummyImage" alt="product" id="product-img" />
  <section id="product-detail">
    <h2 id="product-price" class="ff-poppins">Rp. 100.000</h2>
    <h3 id="product-name" class="ff-open-sans">Product Name</h3>
    <div id="product-feature">
      <p class="title ff-open-sans">Yang Anda Dapatkan</p>
      <ul>
        <li
          v-for="feature in dummyProductFeature"
          :key="feature"
          :id="feature"
          class="ff-open-sans"
        >
          {{ feature }}
        </li>
      </ul>
    </div>
  </section>
</template>
