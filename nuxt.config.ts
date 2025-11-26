// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },

  modules: [
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/eslint'
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()]
  },

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
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { name: 'description', content: 'Create custom bingo boards and share them with friends!' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Only Bingo!' },
        { property: 'og:description', content: 'Create custom bingo boards and share them with friends!' },
        { property: 'og:site_name', content: 'Only Bingo!' },
        // Twitter
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Only Bingo!' },
        { name: 'twitter:description', content: 'Create custom bingo boards and share them with friends!' },
        // Theme
        { name: 'theme-color', content: '#FDC830' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
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
