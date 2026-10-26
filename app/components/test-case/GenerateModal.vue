<script setup lang="ts">
import { Sparkles } from '@lucide/vue'
import type { Environment, GeneratedTest } from '~/types/api'

/** Describe a goal, get a draft test. The model proposes; the browser engine still decides pass or fail. */
const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{
  environments: Environment[]
  defaultEnvironmentId?: string
  /** The editor already has steps that a draft would replace. */
  replacesSteps?: boolean
}>()
const emit = defineEmits<{ generated: [draft: GeneratedTest, input: { goal: string; path: string }] }>()

const { status, generating, error, locked, lockReason, secondsLeft, generate } = useAi()

const form = reactive({ environmentId: '', goal: '', path: '/' })
const fieldError = ref<string | null>(null)

watch(open, (isOpen) => {
  if (!isOpen) return
  if (!props.environments.some((e) => e.id === form.environmentId)) {
    form.environmentId = props.defaultEnvironmentId ?? props.environments[0]?.id ?? ''
  }
  error.value = null
  fieldError.value = null
})

// The call is one request; the text just says which part of the work is likely running.
const phase = ref(0)
let phaseTimer: ReturnType<typeof setTimeout> | undefined
watch(generating, (on) => {
  clearTimeout(phaseTimer)
  phase.value = 0
  if (on) phaseTimer = setTimeout(() => (phase.value = 1), 2500)
})
onBeforeUnmount(() => clearTimeout(phaseTimer))

const environmentOptions = computed(() => props.environments.map((e) => ({ value: e.id, label: `${e.name} — ${prettyUrl(e.baseUrl)}` })))
const goalLength = computed(() => form.goal.trim().length)

/** A used-up quota is a normal state, not a failure: shown as a notice with the wait. */
const lockNotice = computed(() => {
  if (!locked.value) return null
  return lockReason.value === 'AI_USER_LIMIT'
    ? `You have used your ${status.value?.generationsPerHour} AI generations for this hour.`
    : 'The free AI quota is used up for now. Nothing was charged, and TestPilot never switches to a paid provider.'
})
const failure = computed(() => (error.value && error.value.code !== 'AI_QUOTA_EXHAUSTED' && error.value.code !== 'AI_USER_LIMIT' ? error.value.message : null))

async function submit() {
  fieldError.value = null
  if (goalLength.value < 5) {
    fieldError.value = 'Describe what the test should check, in a few words.'
    return
  }
  const input = { environmentId: form.environmentId, goal: form.goal.trim(), path: form.path.trim() || '/' }
  const draft = await generate(input)
  if (!draft) return
  open.value = false
  emit('generated', draft, { goal: input.goal, path: input.path })
}
</script>

<template>
  <UiModal
    v-model:open="open"
    title="Generate a test with AI"
    description="Describe what should happen. The page is read, steps are drafted, and you review them before anything is saved."
    width="lg"
  >
    <form @submit.prevent="submit">
      <div class="space-y-4 px-5 py-4">
        <div v-if="lockNotice" role="status" class="border-l-2 border-warn bg-warn/6 px-3 py-2.5 text-xs leading-relaxed text-warn">
          <p class="font-medium">{{ lockNotice }}</p>
          <p class="mt-0.5">Try again in <span class="font-mono tabular-nums">{{ formatWait(secondsLeft) }}</span>. Steps you write yourself still work.</p>
        </div>

        <UiField label="What should the test check?" :error="fieldError" :hint="`${goalLength}/500`">
          <UiTextarea
            v-model="form.goal"
            rows="3"
            maxlength="500"
            :disabled="generating"
            placeholder="e.g. The newsletter form rejects an invalid email address"
            :invalid="!!fieldError"
          />
        </UiField>

        <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <UiField label="Environment" hint="The page is opened here, signed out.">
            <UiSelect v-model="form.environmentId" :options="environmentOptions" :disabled="generating" placeholder="Choose an environment" />
          </UiField>
          <UiField label="Starting page" hint="A path on the environment.">
            <UiInput v-model="form.path" mono :disabled="generating" placeholder="/newsletter" />
          </UiField>
        </div>

        <UiAlert :message="failure" />

        <p class="text-xs leading-relaxed text-fg-subtle">
          The goal and an outline of the page (roles and names of its elements) are sent to {{ status?.provider ?? 'the AI provider' }}
          ({{ status?.model }}). Don’t include real passwords or personal data.
          <template v-if="replacesSteps"> The draft replaces the steps you have now.</template>
        </p>
      </div>

      <div class="flex items-center gap-3 border-t border-line px-5 py-3">
        <p v-if="generating" class="flex items-center gap-2 text-xs text-fg-muted" aria-live="polite">
          <UiSpinner /> {{ phase === 0 ? 'Reading the page and drafting steps…' : 'Checking the assertions against the page…' }}
        </p>
        <UiButton class="ml-auto" variant="ghost" :disabled="generating" @click="open = false">Cancel</UiButton>
        <UiButton type="submit" variant="primary" :loading="generating" :disabled="locked || !form.environmentId">
          <Sparkles v-if="!generating" />
          {{ locked ? `Available in ${formatWait(secondsLeft)}` : 'Generate' }}
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
