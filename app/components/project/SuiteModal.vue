<script setup lang="ts">
import type { TestSuite } from '~/types/api'

const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ projectId: string; suite?: TestSuite | null }>()
const emit = defineEmits<{ saved: [suite: TestSuite] }>()

const { $api } = useNuxtApp()
const form = reactive({ name: '', description: '' })
const loading = ref(false)
const error = ref<string | null>(null)

watch(open, (isOpen) => {
  if (!isOpen) return
  form.name = props.suite?.name ?? ''
  form.description = props.suite?.description ?? ''
  error.value = null
})

async function submit() {
  loading.value = true
  error.value = null
  try {
    const suite = props.suite
      ? await $api<TestSuite>(`/test-suites/${props.suite.id}`, { method: 'PATCH', body: form })
      : await $api<TestSuite>('/test-suites', { method: 'POST', body: { ...form, projectId: props.projectId } })
    open.value = false
    emit('saved', suite)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UiModal v-model:open="open" :title="suite ? 'Rename suite' : 'New test suite'" width="sm">
    <form @submit.prevent="submit">
      <div class="space-y-4 px-5 py-4">
        <UiField label="Name">
          <UiInput v-model="form.name" placeholder="Checkout" required autofocus />
        </UiField>
        <UiField label="Description" optional>
          <UiTextarea v-model="form.description" rows="2" />
        </UiField>
        <UiAlert :message="error" />
      </div>
      <div class="flex justify-end gap-2 border-t border-line px-5 py-3">
        <UiButton variant="ghost" @click="open = false">Cancel</UiButton>
        <UiButton type="submit" variant="primary" :loading="loading">{{ suite ? 'Save' : 'Create suite' }}</UiButton>
      </div>
    </form>
  </UiModal>
</template>
