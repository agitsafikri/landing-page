<script setup lang="ts"></script>

<template>
  <section id="recipient">
    <p class="title ff-open-sans">Data Penerima</p>
    <form id="receipent-form">
      <div class="input-group">
        <label for="name">Nama Lengkap</label>
        <div class="field">
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Nama Lengkap"
            required
            class="error"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="suffix-icon"
          >
            <title>magnify</title>
            <path
              d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
            />
          </svg>
        </div>
      </div>
      <div class="input-group">
        <label for="phoneNumber">Nomor Whatsapp Aktif</label>
        <input
          type="text"
          name="phoneNumber"
          id="phoneNumber"
          placeholder="Nomor Whatsapp Aktif"
          required
          value="+62090909909"
          disabled
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
