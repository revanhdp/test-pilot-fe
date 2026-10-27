/**
 * `$api`: fetch client for the TestPilot API. Sends the Clerk session token
 * and sends the user to sign-in when a protected request comes back 401.
 */
export default defineNuxtPlugin({
  name: 'api',
  dependsOn: ['clerk'],
  setup(nuxtApp) {
    const apiBase = useRuntimeConfig().public.apiBase.replace(/\/+$/, '')
    const api = $fetch.create({
      baseURL: `${apiBase}/api`,
      async onRequest({ options }) {
        // Short-lived and refreshed by Clerk, so ask for it on every request.
        const token = await nuxtApp.$clerk.session?.getToken()
        if (token) {
          const headers = new Headers(options.headers)
          headers.set('Authorization', `Bearer ${token}`)
          options.headers = headers
        }
      },
      async onResponseError({ response }) {
        if (response.status !== 401) return

        useState('auth:user').value = null
        const redirect = nuxtApp.$router.currentRoute.value.fullPath
        await nuxtApp.runWithContext(() =>
          navigateTo({ path: '/login', query: { redirect } }),
        )
      },
    })

    return { provide: { api } }
  },
})
