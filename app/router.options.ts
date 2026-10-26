import type { RouterConfig } from 'nuxt/schema'

/** How long to wait for a hash target (e.g. /#pricing) to render before giving up. */
const HASH_WAIT_MS = 2000

/**
 * The app renders on the client, so on a fresh load of /#pricing the section
 * doesn't exist yet when the router scrolls. Wait for the target to appear,
 * then scroll to it, honouring its CSS scroll-margin-top.
 */
export default {
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (!to.hash) return to.path === from.path ? false : { top: 0 }

    const samePage = to.path === from.path && from.matched.length > 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return new Promise((resolve) => {
      const started = performance.now()
      const find = () => {
        const el = document.getElementById(decodeURIComponent(to.hash.slice(1)))
        if (el) {
          const top = Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0
          return resolve({ el, top, behavior: samePage && !reduced ? 'smooth' : 'instant' })
        }
        if (performance.now() - started > HASH_WAIT_MS) return resolve({ top: 0 })
        requestAnimationFrame(find)
      }
      find()
    })
  },
} satisfies RouterConfig
