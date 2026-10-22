<script setup lang="ts">
definePageMeta({ layout: 'auth', public: true, guestOnly: true })
useHead({ title: 'Reset password · TestPilot AI' })

const { $api } = useNuxtApp()
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref<string | null>(null)

async function submit() {
  loading.value = true
  error.value = null
  try {
    await $api('/auth/forgot-password', { method: 'POST', body: { email: email.value } })
    sent.value = true
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-[-0.015em]">Reset your password</h1>
    <template v-if="sent">
      <p class="mt-3 text-[13px] leading-relaxed text-fg-muted">
        If an account exists for <span class="text-fg">{{ email }}</span>, we've sent a link to reset its password. The link expires in one hour.
      </p>
      <UiButton class="mt-8" size="lg" block to="/login">Back to sign in</UiButton>
    </template>
    <template v-else>
      <p class="mt-2 text-[13px] text-fg-muted">Enter your email and we'll send you a reset link.</p>
      <form class="mt-8 space-y-4" @submit.prevent="submit">
        <UiField label="Email">
          <UiInput v-model="email" type="email" autocomplete="email" required autofocus />
        </UiField>
        <UiAlert :message="error" />
        <UiButton type="submit" variant="primary" size="lg" block :loading="loading">Send reset link</UiButton>
      </form>
      <p class="mt-5 text-center">
        <NuxtLink to="/login" class="text-xs text-fg-muted hover:text-fg">Back to sign in</NuxtLink>
      </p>
    </template>
  </div>
</template>
