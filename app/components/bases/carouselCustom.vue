<script setup lang="ts">
import "vue3-carousel/carousel.css";
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";

interface CarousellProps {
  images: string[];
}

const props = withDefaults(defineProps<CarousellProps>(), {
  images: () => [],
});

const config = {
  itemsToShow: 1,
  gap: 5,
  wrapAround: true,
};
</script>

<template>
  <Carousel v-bind="config">
    <Slide
      v-for="(image, index) in props.images"
      :key="image"
    >
      <img
        :src="image"
        width="800"
        height="800"
        :loading="index === 0 ? 'eager' : 'lazy'"
        :fetchpriority="index === 0 ? 'high' : 'auto'"
        alt="product image"
        class="carousel-image"
      />
    </Slide>

    <template #addons>
      <Navigation />
      <Pagination />
    </template>
  </Carousel>
</template>

<style scoped>
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>