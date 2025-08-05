<script setup lang="ts"></script>

<template>
  <section id="payment-method">
    <p class="title ff-open-sans">Metode Pembayaran</p>
    <div id="payment-method-list">
      <div class="payment-method-item">
        <label for="payment-method-1">COD (Bayar di Tempat)</label>
        <input type="radio" name="payment-method" id="payment-method-1" />
      </div>
      <div class="payment-method-item">
        <label for="payment-method-2">Bank Transfer</label>
        <input type="radio" name="payment-method" id="payment-method-2" />
      </div>
    </div>
  </section>
</template>
