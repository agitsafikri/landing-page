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
    <Slide v-for="image in props.images" :key="image">
      <img :src="image" />
    </Slide>

    <template #addons>
      <Navigation />
      <Pagination />
    </template>
  </Carousel>
</template>
