<script setup lang="ts">
import type { Environment } from '~/types/api'
import type { StepDraft } from '~/utils/steps'

/** Edit the steps that sign in to an environment, performed once per run. */
const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{ environment: Environment | null }>()
const emit = defineEmits<{ saved: [environment: Environment] }>()

const { $api } = useNuxtApp()

/** A typical sign-in flow to start from: the values are left for the user. */
function template(): StepDraft[] {
  return [
    toDraft({ action: 'navigate', target: null, value: '/login' }),
    toDraft({ action: 'fill', target: { type: 'label', value: 'Email' }, value: '' }),
    toDraft({ action: 'fill', target: { type: 'label', value: 'Password' }, value: '' }),
    toDraft({ action: 'click', target: { type: 'role', value: 'button', name: 'Sign in' }, value: null }),
    toDraft({ action: 'assertUrl', target: null, value: '' }),
  ]
}

const steps = ref<StepDraft[]>([])
const saving = ref(false)
const error = ref<string | null>(null)
const errors = ref<Record<string, string>>({})
const stepErrors = computed(() => {
  const byIndex: Record<number, string> = {}
  for (const [path, message] of Object.entries(errors.value)) {
    const match = /^signInSteps\.(\d+)/.exec(path)
    if (match) byIndex[Number(match[1])] ??= message
  }
  return byIndex
})

watch(open, (isOpen) => {
  if (!isOpen) return
  const saved = props.environment?.signInSteps
  steps.value = saved?.length
    ? saved.map((step) => toDraft({ ...step, target: step.target ?? null, value: step.value ?? null }))
    : template()
  error.value = null
  errors.value = {}
})

async function persist(signInSteps: ReturnType<typeof toStepInput>[] | null) {
  if (!props.environment) return
  saving.value = true
  error.value = null
  errors.value = {}
  try {
    const environment = await $api<Environment>(`/environments/${props.environment.id}`, {
      method: 'PATCH',
      body: { signInSteps },
    })
    open.value = false
    emit('saved', environment)
  } catch (e) {
    errors.value = fieldErrors(e)
    error.value = Object.keys(stepErrors.value).length ? 'Some steps need attention.' : errorMessage(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UiModal
    v-model:open="open"
    :title="`Sign-in · ${environment?.name ?? ''}`"
    description="Performed once at the start of a run. Tests marked “Start signed in” begin with the session these steps leave behind."
    width="xl"
  >
    <div class="space-y-3 px-5 py-4">
      <TestCaseStepEditor v-model="steps" :errors="stepErrors" title="Sign-in steps" hint="End with an assertion that proves it worked" />
      <p class="text-xs leading-relaxed text-fg-subtle">
        Typed values are stored as entered and hidden in run results. Use a dedicated test account, not a real one, and one without two-factor sign-in.
      </p>
      <UiAlert :message="error" />
    </div>
    <div class="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3">
      <UiButton v-if="environment?.signInSteps?.length" variant="danger" :disabled="saving" @click="persist(null)">Remove sign-in</UiButton>
      <UiButton class="ml-auto" variant="ghost" @click="open = false">Cancel</UiButton>
      <UiButton variant="primary" :loading="saving" :disabled="!steps.length" @click="persist(steps.map(toStepInput))">Save sign-in</UiButton>
    </div>
  </UiModal>
</template>
