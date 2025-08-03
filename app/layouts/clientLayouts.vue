<script setup lang="ts">
import logoFull from "~/assets/images/logo-full.png";
</script>

<template>
  <div class="client-layout">
    <nav>
      <img :src="logoFull" alt="logo" />
    </nav>
    <div class="content">
      <slot />
    </div>
  </div>
</template>
