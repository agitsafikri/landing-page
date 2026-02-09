<script setup lang="ts">
const productStore = useProdukStore();
const pesananStore = usePesananStore();
const redirectTimer = ref(3);

const openWhatsapp = () => {
  window.open(
    `https://api.whatsapp.com/send?phone=${pesananStore.phoneNumber}&text=${pesananStore.message}`,
    "_blank",
  );
};

onMounted(() => {
  redirectTimer.value = 3;

  const timer = setInterval(() => {
    redirectTimer.value--;
    if (redirectTimer.value === 0) {
      clearInterval(timer);
      // openWhatsapp();
    }
  }, 1000);
});
</script>

<template>
  <section class="order-success">
    <div class="title">
      <p>Terima kasih</p>
      <p>sudah melakukan order</p>
      <p>{{ productStore.item.namaProduk }}</p>
    </div>
    <div class="caption">
      <p>Kami akan segera mengarahkan</p>
      <p>Anda ke agen kami di WhatsApp</p>
    </div>
    <img src="/assets/images/order-success.png" alt="order-success" />
    <p class="confirmation">Konfirmasi pembayaran Anda di WhatsApp</p>
  </section>
</template>
