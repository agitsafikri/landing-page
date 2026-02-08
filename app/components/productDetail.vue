<script setup lang="ts">
import CarouselCustom from "./bases/carouselCustom.vue";

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
  <CarouselCustom
    :images="[dummyImage, dummyImage, dummyImage]"
    class="product-img"
  />
  <section class="product-detail">
    <h2 class="ff-poppins product-price">Rp. 100.000</h2>
    <h3 class="ff-open-sans product-name">Product Name</h3>
    <div class="border-top-1-solid-primary product-feature">
      <p class="title ff-open-sans">Yang Anda Dapatkan</p>
      <ul>
        <li
          v-for="(feature, index) in dummyProductFeature"
          :key="'feature-' + index"
          :id="'feature-' + index"
          class="ff-open-sans"
        >
          {{ feature }}
        </li>
      </ul>
    </div>
  </section>
</template>
