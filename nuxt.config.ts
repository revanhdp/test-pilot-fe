import tailwindcss from '@tailwindcss/vite'

const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:4001'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',

  // The dashboard is an authenticated SPA. `nuxt generate` emits static files
  // that Nginx serves next to the API, so no Node process is needed for the
  // frontend on the 2 GB VPS.
  ssr: false,

  devtools: { enabled: false },

  css: [
    '@fontsource-variable/geist',
    '@fontsource-variable/geist-mono',
    '~/assets/css/main.css',
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: 'TestPilot AI',
      htmlAttrs: { lang: 'en' },
      meta: [
        {
          name: 'description',
          content:
            'TestPilot explores your application, executes real browser tests, detects failures, and turns them into actionable bug reports.',
        },
        { name: 'theme-color', content: '#0a0b0d' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  // Same-origin API in development, mirroring the Nginx setup in production,
  // so the session cookie stays first-party.
  nitro: {
    devProxy: {
      '/api': { target: `${apiTarget}/api`, changeOrigin: true },
    },
  },

  typescript: { strict: true },
})
