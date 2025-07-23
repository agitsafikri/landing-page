// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    public: {
      api_url: process.env.VITE_APP_API_URL,
    },
  },
  css: ['@/assets/styles/index.scss'],
})
