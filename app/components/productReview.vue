<script setup lang="ts">
const reviews = ref([
  {
    id: 1,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, in pharetra",
    name: "John Doe",
    rating: 4,
    picture: "https://unsplash.it/300/300?random",
  },
  {
    id: 2,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, in pharetra",
    name: "John Doe",
    rating: 5,
    picture: "https://unsplash.it/300/300?random",
  },
  {
    id: 3,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, in pharetra",
    name: "John Doe",
    rating: 4,
    picture: "https://unsplash.it/300/300?random",
  },
]);
</script>

<template>
  <section id="product-review">
    <p class="title ff-open-sans">Ulasan Produk</p>
    <div class="reviews">
      <div class="review" v-for="review in reviews" :key="review.id">
        <img :src="review.picture" alt="reviewer" class="reviewer-picture" />
        <div class="review-content">
          <div class="reviewer-info">
            <p class="name ff-open-sans">
              {{ review.name }}
              <span v-for="n in review.rating" :key="n">⭐</span>
            </p>
            <div class="rating"></div>
          </div>
          <p class="review-text ff-open-sans">{{ review.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
