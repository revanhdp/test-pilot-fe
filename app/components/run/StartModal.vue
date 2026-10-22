<script setup lang="ts">
import { Play } from '@lucide/vue'
import type { Environment } from '~/types/api'

/** Pick an environment and start a run over a suite or the whole project. */
const open = defineModel<boolean>('open', { required: true })
const props = defineProps<{
  environments: Environment[]
  scopeLabel: string
  testCount: number
  suiteId?: string
}>()

const { start, starting, error } = useStartRun()
const environmentId = ref('')

watch(open, (isOpen) => {
  if (isOpen && !props.environments.some((e) => e.id === environmentId.value)) {
    environmentId.value = props.environments[0]?.id ?? ''
  }
})

const options = computed(() =>
  props.environments.map((e) => ({ value: e.id, label: `${e.name} — ${prettyUrl(e.baseUrl)}` })),
)

async function submit() {
  const run = await start({ environmentId: environmentId.value, suiteId: props.suiteId })
  if (run) open.value = false
}
</script>

<template>
  <UiModal v-model:open="open" title="Start a test run" :description="`${scopeLabel}. Draft and archived test cases are left out.`">
    <form @submit.prevent="submit">
      <div class="space-y-4 px-5 py-4">
        <UiField label="Environment">
          <UiSelect v-model="environmentId" :options="options" placeholder="Choose an environment" />
        </UiField>
        <p class="text-xs leading-relaxed text-fg-subtle">
          Runs in Chromium. Each test gets a fresh browser context and ends with a screenshot.
        </p>
        <UiAlert :message="error" />
      </div>
      <div class="flex justify-end gap-2 border-t border-line px-5 py-3">
        <UiButton variant="ghost" @click="open = false">Cancel</UiButton>
        <UiButton type="submit" variant="primary" :loading="starting" :disabled="!environmentId || testCount === 0">
          <Play v-if="!starting" /> Start run
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
