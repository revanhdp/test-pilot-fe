<script setup lang="ts">
import type { Environment, EnvironmentType } from '~/types/api'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ projectId: string; environment?: Environment | null }>()
const emit = defineEmits<{ saved: [environment: Environment] }>()

const { $api } = useNuxtApp()

const blank = () => ({
  name: props.environment?.name ?? '',
  baseUrl: props.environment?.baseUrl ?? '',
  type: props.environment?.type ?? ('STAGING' as EnvironmentType),
})
const form = reactive(blank())
const loading = ref(false)
const error = ref<string | null>(null)
const errors = ref<Record<string, string>>({})

watch(open, (isOpen) => {
  if (!isOpen) return
  Object.assign(form, blank())
  error.value = null
  errors.value = {}
})

async function submit() {
  loading.value = true
  error.value = null
  errors.value = {}
  try {
    const environment = props.environment
      ? await $api<Environment>(`/environments/${props.environment.id}`, { method: 'PATCH', body: form })
      : await $api<Environment>('/environments', { method: 'POST', body: { ...form, projectId: props.projectId } })
    open.value = false
    emit('saved', environment)
  } catch (e) {
    errors.value = fieldErrors(e)
    if (!Object.keys(errors.value).length) error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UiModal
    v-model:open="open"
    :title="environment ? 'Edit environment' : 'Add environment'"
    description="Tests resolve paths against the base URL and can't navigate to other origins."
  >
    <form @submit.prevent="submit">
      <div class="space-y-4 px-5 py-4">
        <div class="grid grid-cols-[minmax(0,1fr)_150px] gap-3">
          <UiField label="Name" :error="errors.name">
            <UiInput v-model="form.name" placeholder="Staging" required autofocus :invalid="!!errors.name" />
          </UiField>
          <UiField label="Type">
            <UiSelect v-model="form.type" :options="optionsFrom(ENVIRONMENT_TYPE_LABELS)" />
          </UiField>
        </div>
        <UiField label="Base URL" :error="errors.baseUrl">
          <UiInput v-model="form.baseUrl" type="url" mono placeholder="https://staging.example.com" required :invalid="!!errors.baseUrl" />
        </UiField>
        <UiAlert :message="error" />
      </div>
      <div class="flex justify-end gap-2 border-t border-line px-5 py-3">
        <UiButton variant="ghost" @click="open = false">Cancel</UiButton>
        <UiButton type="submit" variant="primary" :loading="loading">{{ environment ? 'Save' : 'Add environment' }}</UiButton>
      </div>
    </form>
  </UiModal>
</template>
