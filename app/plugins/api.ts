/**
 * `$api`: fetch client for the TestPilot API. Sends the session cookie and
 * sends the user to sign-in when a protected request comes back 401.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const api = $fetch.create({
    baseURL: '/api',
    credentials: 'include',
    async onResponseError({ request, response }) {
      const url = typeof request === 'string' ? request : request.url
      if (response.status !== 401 || url.includes('/auth/')) return

      useState('auth:user').value = null
      const redirect = nuxtApp.$router.currentRoute.value.fullPath
      await nuxtApp.runWithContext(() =>
        navigateTo({ path: '/login', query: { redirect } }),
      )
    },
  })

  return { provide: { api } }
})
