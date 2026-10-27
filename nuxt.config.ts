import tailwindcss from '@tailwindcss/vite'

const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:4001'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',

  // The dashboard is an authenticated SPA. `nuxt generate` emits static files
  // that Nginx serves next to the API, so no Node process is needed for the
  // frontend on the 2 GB VPS.
  ssr: false,

  devtools: { enabled: false },

  runtimeConfig: {
    public: {
      // Set NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY and NUXT_PUBLIC_API_BASE (build time for `nuxt generate`).
      clerkPublishableKey: '',
      // Origin of the API when it is not served next to the web app (e.g.
      // https://api.example.com). Empty: same origin, `/api` goes through Nginx.
      apiBase: '',
    },
  },

  css: [
    // Weight and width axes: the width axis gives the condensed display cut.
    '@fontsource-variable/ibm-plex-sans/wdth.css',
    '@fontsource/ibm-plex-mono/400.css',
    '@fontsource/ibm-plex-mono/500.css',
    '@fontsource/ibm-plex-mono/600.css',
    '~/assets/css/main.css',
  ],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['@clerk/clerk-js', '@clerk/ui/entry', '@clerk/ui/themes'],
    },
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
        { name: 'theme-color', content: '#0f0f0e' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  // Same-origin API in development, mirroring the Nginx setup in production,
  // so the browser never needs CORS in development.
  nitro: {
    devProxy: {
      '/api': { target: `${apiTarget}/api`, changeOrigin: true },
    },
  },

  typescript: { strict: true },
})
