import { fileURLToPath } from "url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  modules: ["@pinia/nuxt"],
  alias: {
    "~": fileURLToPath(new URL("./app", import.meta.url)),
    "@": fileURLToPath(new URL("./app/assets", import.meta.url)),
    icons: fileURLToPath(
      new URL("./node_modules/vue-material-design-icons", import.meta.url),
    ),
  },
  runtimeConfig: {
    public: {
      api_url: process.env.VITE_APP_API_URL,
    },
  },
  ssr: false,
  css: ["@/styles/index.scss"],
});
