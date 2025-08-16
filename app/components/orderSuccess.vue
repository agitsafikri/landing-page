<script setup lang="ts">
const productName = ref("Product Name");
</script>

<template>
  <section id="order-success">
    <div class="title">
      <p>Terima kasih</p>
      <p>sudah melakukan order</p>
      <p>{{ productName }}</p>
    </div>
    <div class="caption">
      <p>Kami akan segera mengarahkan</p>
      <p>Anda ke agen kami di WhatsApp</p>
    </div>
    <img src="/assets/images/order-success.png" alt="order-success" />
    <p class="confirmation">Konfirmasi pembayaran Anda di WhatsApp</p>
  </section>
</template>
