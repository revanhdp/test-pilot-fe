<script setup lang="ts">
import type { EnvironmentType, Project } from '~/types/api'

/** Create a project (with its first environment) or edit name/description. */
const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ project?: Project }>()
const emit = defineEmits<{ saved: [project: Project] }>()

const { $api } = useNuxtApp()

const blank = () => ({
  name: props.project?.name ?? '',
  description: props.project?.description ?? '',
  envName: 'Staging',
  envType: 'STAGING' as EnvironmentType,
  baseUrl: '',
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
    const project = props.project
      ? await $api<Project>(`/projects/${props.project.id}`, {
          method: 'PATCH',
          body: { name: form.name, description: form.description },
        })
      : await $api<Project>('/projects', {
          method: 'POST',
          body: {
            name: form.name,
            description: form.description,
            ...(form.baseUrl.trim() && {
              environment: { name: form.envName, baseUrl: form.baseUrl, type: form.envType },
            }),
          },
        })
    open.value = false
    emit('saved', project)
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
    :title="project ? 'Edit project' : 'New project'"
    :description="project ? undefined : 'A project groups the environments, suites and runs of one application.'"
  >
    <form @submit.prevent="submit">
      <div class="space-y-4 px-5 py-4">
        <UiField label="Name" :error="errors.name">
          <UiInput v-model="form.name" placeholder="Hotel Booking" required autofocus :invalid="!!errors.name" />
        </UiField>
        <UiField label="Description" optional :error="errors.description">
          <UiTextarea v-model="form.description" rows="2" placeholder="What is being tested" />
        </UiField>

        <fieldset v-if="!project" class="rounded-lg border border-line p-3.5">
          <legend class="eyebrow px-1.5">Target website</legend>
          <div class="space-y-3">
            <UiField
              label="Base URL"
              optional
              hint="Where tests run. You can add more environments later."
              :error="errors['environment.baseUrl']"
            >
              <UiInput v-model="form.baseUrl" type="url" mono placeholder="https://staging.example.com" :invalid="!!errors['environment.baseUrl']" />
            </UiField>
            <div v-if="form.baseUrl.trim()" class="grid grid-cols-2 gap-3">
              <UiField label="Environment name" :error="errors['environment.name']">
                <UiInput v-model="form.envName" />
              </UiField>
              <UiField label="Type">
                <UiSelect v-model="form.envType" :options="optionsFrom(ENVIRONMENT_TYPE_LABELS)" />
              </UiField>
            </div>
          </div>
        </fieldset>
        <UiAlert :message="error" />
      </div>
      <div class="flex justify-end gap-2 border-t border-line px-5 py-3">
        <UiButton variant="ghost" @click="open = false">Cancel</UiButton>
        <UiButton type="submit" variant="primary" :loading="loading">{{ project ? 'Save' : 'Create project' }}</UiButton>
      </div>
    </form>
  </UiModal>
</template>
