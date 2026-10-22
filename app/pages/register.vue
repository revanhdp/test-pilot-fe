<script setup lang="ts">
definePageMeta({ layout: 'auth', public: true, guestOnly: true })
useHead({ title: 'Create account · TestPilot AI' })

const { register } = useAuth()

const form = reactive({ name: '', email: '', password: '' })
const loading = ref(false)
const error = ref<string | null>(null)
const errors = ref<Record<string, string>>({})

async function submit() {
  loading.value = true
  error.value = null
  errors.value = {}
  try {
    await register(form)
    await navigateTo('/projects?new=1')
  } catch (e) {
    errors.value = fieldErrors(e)
    if (!Object.keys(errors.value).length) error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-[-0.015em]">Create your account</h1>
    <p class="mt-2 text-[13px] text-fg-muted">
      Already have one? <NuxtLink to="/login" class="link">Sign in</NuxtLink>
    </p>

    <form class="mt-8 space-y-4" @submit.prevent="submit">
      <UiField label="Name" :error="errors.name">
        <UiInput v-model="form.name" autocomplete="name" required autofocus :invalid="!!errors.name" />
      </UiField>
      <UiField label="Email" :error="errors.email">
        <UiInput v-model="form.email" type="email" autocomplete="email" required :invalid="!!errors.email" />
      </UiField>
      <UiField label="Password" hint="At least 8 characters." :error="errors.password">
        <UiInput v-model="form.password" type="password" autocomplete="new-password" required :invalid="!!errors.password" />
      </UiField>
      <UiAlert :message="error" />
      <UiButton type="submit" variant="primary" size="lg" block :loading="loading">Create account</UiButton>
    </form>
  </div>
</template>
