// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  alias: {
    "@": "/",
    "@comp": "/components",
    "@cons": "/constants",
    "@store": "/store"
  },
  modules: ["@pinia/nuxt"]
});
