<script setup lang="ts"></script>

<template>
  <section id="recipient">
    <p class="title ff-open-sans">Data Penerima</p>
    <form id="receipent-form">
      <div class="input-group">
        <label for="name">Nama Lengkap</label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Nama Lengkap"
          required
        />
      </div>
      <div class="input-group">
        <label for="phoneNumber">Nomor Whatsapp Aktif</label>
        <input
          type="text"
          name="phoneNumber"
          id="phoneNumber"
          placeholder="Nomor Whatsapp Aktif"
          required
        />
      </div>
      <div class="input-group">
        <label for="address">Alamat Lengkap</label>
        <textarea
          name="address"
          id="address"
          placeholder="Alamat Lengkap"
          required
        />
      </div>
      <div class="input-group">
        <label for="province">Provinsi</label>
        <select
          name="province"
          id="province"
          placeholder="Pilih Provinsi"
          required
        />
      </div>
    </form>
  </section>
</template>
