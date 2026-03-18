<script setup lang="ts">
import logoFull from "~/assets/images/logo-full.svg";
</script>

<template>
  <div class="client-layout">
    <nav>
      <img :src="logoFull" alt="Logo Saktiform" />
    </nav>

    <!-- Tambahkan main landmark -->
    <main class="content">
      <slot />
    </main>
  </div>
</template>