<script setup lang="ts">
definePageMeta({ layout: 'auth', public: true })
useHead({ title: 'Choose a new password · TestPilot AI' })

const { $api } = useNuxtApp()
const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function submit() {
  if (password.value !== confirm.value) {
    error.value = 'The passwords do not match.'
    return
  }
  loading.value = true
  error.value = null
  try {
    await $api('/auth/reset-password', {
      method: 'POST',
      body: { token: token.value, password: password.value },
    })
    useState('auth:user').value = null
    await navigateTo({ path: '/login', query: { reset: '1' } })
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="panel p-6 shadow-2xl shadow-black/40">
    <h1 class="text-lg font-semibold tracking-tight">Choose a new password</h1>
    <template v-if="token">
      <p class="mt-1 text-[13px] text-fg-muted">You'll be signed out of all other sessions.</p>
      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <UiField label="New password" hint="At least 8 characters.">
          <UiInput v-model="password" type="password" autocomplete="new-password" minlength="8" required autofocus />
        </UiField>
        <UiField label="Confirm password">
          <UiInput v-model="confirm" type="password" autocomplete="new-password" required />
        </UiField>
        <UiAlert :message="error" />
        <UiButton type="submit" variant="primary" block :loading="loading">Update password</UiButton>
      </form>
    </template>
    <template v-else>
      <p class="mt-3 text-[13px] text-fg-muted">This reset link is missing its token.</p>
      <UiButton class="mt-6" block to="/forgot-password">Request a new link</UiButton>
    </template>
  </div>
</template>
