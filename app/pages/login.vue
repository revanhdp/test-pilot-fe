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
  <div>
    <h1 class="text-2xl font-semibold tracking-[-0.015em]">Sign in</h1>
    <p class="mt-2 text-[13px] text-fg-muted">
      New to TestPilot? <NuxtLink to="/register" class="link">Create an account</NuxtLink>
    </p>

    <p v-if="notice" class="mt-6 border-l-2 border-pass bg-pass/8 px-3 py-2 text-xs text-pass">{{ notice }}</p>

    <form class="mt-8 space-y-4" @submit.prevent="submit">
      <UiField label="Email">
        <UiInput v-model="form.email" type="email" autocomplete="email" required autofocus />
      </UiField>
      <UiField label="Password">
        <UiInput v-model="form.password" type="password" autocomplete="current-password" required />
      </UiField>
      <UiAlert :message="error" />
      <UiButton type="submit" variant="primary" size="lg" block :loading="loading">Sign in</UiButton>
    </form>
    <p class="mt-5 text-center">
      <NuxtLink to="/forgot-password" class="text-xs text-fg-muted hover:text-fg">Forgot your password?</NuxtLink>
    </p>
  </div>
</template>
