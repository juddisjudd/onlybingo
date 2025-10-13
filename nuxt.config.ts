// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/eslint'
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Private (server-only)
    databaseUrl: process.env.DATABASE_URL,
    public: {
      // Public (client & server)
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
      umamiScriptUrl: process.env.UMAMI_SCRIPT_URL,
      umamiWebsiteId: process.env.UMAMI_WEBSITE_ID
    }
  },

  app: {
    head: {
      title: 'Only Bingo!',
      meta: [
        { name: 'description', content: 'Create custom bingo boards and share them with friends!' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      script: [
        {
          defer: true,
          src: process.env.UMAMI_SCRIPT_URL,
          'data-website-id': process.env.UMAMI_WEBSITE_ID
        }
      ]
    }
  },

  devtools: { enabled: true },

  typescript: {
    strict: true,
    typeCheck: false  // Disabled for now - enable later with vue-tsc installed
  },

  nitro: {
    preset: 'node-server' // For Coolify
  },

  compatibilityDate: '2025-01-10'
})
