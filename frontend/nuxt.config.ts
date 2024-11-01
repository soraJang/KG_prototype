// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  ssr: false,
  target: "static",
  app: {
    baseURL: "/KG_prototype/" // 저장소 이름
  },
  nitro: {
    preset: "github-pages"
  },
  devtools: { enabled: true },
  alias: {
    "@": "/",
    "@comp": "/components",
    "@cons": "/constants",
    "@store": "/store",
    "@composables": "/composables"
  },
  modules: ["@pinia/nuxt"]
});
