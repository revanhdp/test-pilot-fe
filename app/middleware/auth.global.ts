export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchUser } = useAuth()
  await fetchUser()

  if (!user.value && !to.meta.public) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
  if (user.value && to.meta.guestOnly) {
    return navigateTo('/dashboard')
  }
  if (user.value && !to.meta.public) {
    await useProjects().ensureLoaded()
  }
})
