<script setup lang="ts">
const props = defineProps<{ mode: 'sign-in' | 'sign-up' }>()

const { $clerk } = useNuxtApp()
const route = useRoute()
const { reset } = useAuth()
const el = ref<HTMLDivElement>()

/** Only same-app paths, never "//host" (protocol-relative) redirects. */
const redirect = computed(() => {
  const target = route.query.redirect
  return typeof target === 'string' && /^\/(?!\/)/.test(target) ? target : undefined
})

onMounted(() => {
  if (!el.value) return
  // A different user may sign in after an earlier one: drop the cached user.
  reset()
  if (props.mode === 'sign-in') {
    $clerk.mountSignIn(el.value, {
      routing: 'path',
      path: '/login',
      signUpUrl: '/register',
      forceRedirectUrl: redirect.value ?? '/dashboard',
    })
  } else {
    $clerk.mountSignUp(el.value, {
      routing: 'path',
      path: '/register',
      signInUrl: '/login',
      forceRedirectUrl: redirect.value ?? '/projects?new=1',
    })
  }
})

onBeforeUnmount(() => {
  if (!el.value) return
  if (props.mode === 'sign-in') $clerk.unmountSignIn(el.value)
  else $clerk.unmountSignUp(el.value)
})
</script>

<template>
  <div ref="el" />
</template>
