import { Clerk } from '@clerk/clerk-js'
import { ClerkUI } from '@clerk/ui/entry'
import { dark } from '@clerk/ui/themes'
import type { User } from '~/types/api'

/**
 * `$clerk`: the Clerk client, loaded before the app renders so the first route
 * already knows whether someone is signed in.
 */
export default defineNuxtPlugin({
  name: 'clerk',
  async setup(nuxtApp) {
    const key = useRuntimeConfig().public.clerkPublishableKey
    if (!key) {
      throw new Error('NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set')
    }

    const clerk = new Clerk(key)
    const authUser = useState<User | null>('auth:user')
    try {
      await clerk.load({
        ui: { ClerkUI },
        // Keep Clerk's own navigation inside the SPA router.
        routerPush: (to: string) => nuxtApp.runWithContext(() => navigateTo(to)),
        routerReplace: (to: string) => nuxtApp.runWithContext(() => navigateTo(to, { replace: true })),
        signInUrl: '/login',
        signUpUrl: '/register',
        afterSignOutUrl: '/',
        appearance: {
          theme: dark,
          variables: {
            colorPrimary: '#edece6',
            colorBackground: '#161615',
            colorInputBackground: '#0f0f0e',
            colorText: '#edece6',
            colorTextSecondary: '#aeada4',
            colorDanger: '#ff6a5c',
            colorSuccess: '#5fd38a',
            borderRadius: '4px',
            fontFamily: '"IBM Plex Sans Variable", system-ui, sans-serif',
          },
        },
      })
    } catch (error) {
      console.error('Clerk failed to load', error)
      throw createError({
        fatal: true,
        statusCode: 500,
        message:
          'Could not reach Clerk. Check that NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY is the complete key and that this origin is allowed in the Clerk dashboard.',
      })
    }

    // Name and email are edited in Clerk's account modal: keep the sidebar in step.
    clerk.addListener(({ user }) => {
      if (!user || !authUser.value) return
      authUser.value = {
        ...authUser.value,
        name: user.fullName || user.username || authUser.value.name,
        email: user.primaryEmailAddress?.emailAddress ?? authUser.value.email,
      }
    })

    return { provide: { clerk } }
  },
})
