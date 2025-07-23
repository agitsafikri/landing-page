<script setup lang="ts">
const dummyImage = "https://unsplash.it/300/300?random";
</script>

<template>
  <img :src="dummyImage" alt="product" id="product-img" />
  <section id="product-detail">
    <h2 id="product-price">Rp. 100.000</h2>
    <h3 id="product-name">Product Name</h3>
    <div id="product-info">
      <h4 class="title">Deskripsi</h4>
      <p id="product-description">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto, iste? In
        sit recusandae voluptas animi sapiente, praesentium aspernatur! Quam,
        minima.
      </p>
    </div>
  </section>
</template>
