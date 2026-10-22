<script setup lang="ts">
definePageMeta({ layout: 'auth', public: true, guestOnly: true })
useHead({ title: 'Sign in · TestPilot AI' })

const route = useRoute()
const { login } = useAuth()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref<string | null>(null)
const notice = computed(() =>
  route.query.reset === '1' ? 'Your password was updated. Sign in with the new one.' : null,
)

async function submit() {
  loading.value = true
  error.value = null
  try {
    await login(form)
    const target = route.query.redirect
    // Only same-app paths, never "//host" (protocol-relative) redirects.
    const redirect = typeof target === 'string' && /^\/(?!\/)/.test(target) ? target : '/dashboard'
    await navigateTo(redirect)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="panel p-6 shadow-2xl shadow-black/40">
    <h1 class="text-lg font-semibold tracking-tight">Sign in</h1>
    <p class="mt-1 text-[13px] text-fg-muted">Welcome back to the control room.</p>

    <p v-if="notice" class="mt-4 rounded-md border border-pass/25 bg-pass/10 px-3 py-2 text-xs text-pass">{{ notice }}</p>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <UiField label="Email">
        <UiInput v-model="form.email" type="email" autocomplete="email" required autofocus />
      </UiField>
      <UiField label="Password">
        <UiInput v-model="form.password" type="password" autocomplete="current-password" required />
      </UiField>
      <div class="flex justify-end">
        <NuxtLink to="/forgot-password" class="text-xs text-fg-muted hover:text-fg">Forgot password?</NuxtLink>
      </div>
      <UiAlert :message="error" />
      <UiButton type="submit" variant="primary" block :loading="loading">Sign in</UiButton>
    </form>
  </div>
  <p class="mt-6 text-center text-[13px] text-fg-muted">
    New to TestPilot?
    <NuxtLink to="/register" class="text-accent hover:underline">Create an account</NuxtLink>
  </p>
</template>
