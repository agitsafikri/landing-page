<script setup lang="ts">
import logoFull from "~/assets/images/logo-full.svg";
useHead({
  title: "Saktiform",
  meta: [
    {
      name: "description",
      content: "Saktiform",
    },
    {
      name: "keywords",
      content: "Saktiform",
    },
    {
      name: "author",
      content: "Saktiform",
    },
  ],
});
</script>

<template>
  <NuxtLayout name="client-layouts">
    <img :src="logoFull" alt="logo" style="margin-block: auto" />
  </NuxtLayout>
</template>
