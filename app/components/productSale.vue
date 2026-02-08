<script setup lang="ts">
interface Countdown {
  hours: number | string;
  minutes: number | string;
  seconds: number | string;
}

const saleCountdown = ref(6);
const countdown: Ref<Countdown> = ref({
  hours: 0,
  minutes: 0,
  seconds: 0,
});
const saleQuantity = ref(50);

onMounted(() => {
  const countdownTarget =
    new Date().getTime() + saleCountdown.value * 60 * 60 * 1000;
  const interval = setInterval(() => {
    const now = new Date().getTime();
    const distance = countdownTarget - now;
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdown.value.hours = hours < 10 ? `0${hours}` : hours;
    countdown.value.minutes = minutes < 10 ? `0${minutes}` : minutes;
    countdown.value.seconds = seconds < 10 ? `0${seconds}` : seconds;

    if (distance < 0) {
      countdown.value = {
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
      clearInterval(interval);
    }
  });
});
</script>

<template>
  <section class="product-sale">
    <div class="countdown">
      <div class="hours">
        <p class="counter">{{ countdown.hours }}</p>
        <p class="label">Jam</p>
      </div>
      <div class="minute">
        <p class="counter">{{ countdown.minutes }}</p>
        <p class="label">Menit</p>
      </div>
      <div class="second">
        <p class="counter">{{ countdown.seconds }}</p>
        <p class="label">Detik</p>
      </div>
    </div>
    <div class="flash-sale">
      <p class="quantity">{{ saleQuantity }}</p>
      <p class="label">Sisa StokFlash Sale</p>
    </div>
    <div class="guarantee">
      <p class="title">Garansi 100%</p>
      <p class="caption">
        Penggantian uang jika tidak ada hasil selama penggunaan!
      </p>
    </div>
  </section>
</template>
