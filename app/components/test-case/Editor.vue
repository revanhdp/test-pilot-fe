<script setup lang="ts">
import { Play, Save, Trash } from '@lucide/vue'
import type {
  Environment,
  TestCaseDetail,
  TestCaseStatus,
  TestCategory,
  TestPriority,
  TestSuite,
} from '~/types/api'

const props = defineProps<{
  projectId: string
  suites: TestSuite[]
  environments: Environment[]
  testCase?: TestCaseDetail
  defaultSuiteId?: string
}>()
const emit = defineEmits<{ saved: [testCase: TestCaseDetail] }>()

const { $api } = useNuxtApp()
const { start, starting, error: runError } = useStartRun()

// ─── Form state ─────────────────────────────────────────────────────────────

const form = reactive({
  title: props.testCase?.title ?? '',
  description: props.testCase?.description ?? '',
  suiteId: props.testCase?.suiteId ?? props.defaultSuiteId ?? props.suites[0]?.id ?? '',
  priority: props.testCase?.priority ?? ('MEDIUM' as TestPriority),
  category: props.testCase?.category ?? ('FUNCTIONAL' as TestCategory),
  status: props.testCase?.status ?? ('ACTIVE' as TestCaseStatus),
  expectedResult: props.testCase?.expectedResult ?? '',
})
const steps = ref(props.testCase ? props.testCase.steps.map(toDraft) : [blankStep('navigate')])

const payload = () => ({
  ...form,
  description: form.description.trim() || null,
  expectedResult: form.expectedResult.trim() || null,
  steps: steps.value.map(toStepInput),
})
const saved = ref(JSON.stringify(payload()))
const dirty = computed(() => !props.testCase || JSON.stringify(payload()) !== saved.value)

// ─── Save ───────────────────────────────────────────────────────────────────

const saving = ref(false)
const formError = ref<string | null>(null)
const errors = ref<Record<string, string>>({})
const stepErrors = computed(() => {
  const byIndex: Record<number, string> = {}
  for (const [path, message] of Object.entries(errors.value)) {
    const match = /^steps\.(\d+)/.exec(path)
    if (match) byIndex[Number(match[1])] ??= message
  }
  return byIndex
})

async function save(): Promise<TestCaseDetail | null> {
  saving.value = true
  formError.value = null
  errors.value = {}
  try {
    const body = payload()
    const result = props.testCase
      ? await $api<TestCaseDetail>(`/test-cases/${props.testCase.id}`, { method: 'PATCH', body })
      : await $api<TestCaseDetail>('/test-cases', { method: 'POST', body })
    saved.value = JSON.stringify(body)
    emit('saved', result)
    return result
  } catch (e) {
    errors.value = fieldErrors(e)
    formError.value = Object.keys(stepErrors.value).length
      ? 'Some steps need attention.'
      : errorMessage(e)
    return null
  } finally {
    saving.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    if (dirty.value && !saving.value) void save()
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

onBeforeRouteLeave(() => {
  if (dirty.value && props.testCase && !saving.value) {
    return window.confirm('You have unsaved changes. Leave anyway?')
  }
})

// ─── Run ────────────────────────────────────────────────────────────────────

const environmentId = ref(props.environments[0]?.id ?? '')

async function run() {
  if (!props.testCase) return
  if (dirty.value && !(await save())) return
  await start({ environmentId: environmentId.value, testCaseIds: [props.testCase.id] })
}

// ─── Delete ─────────────────────────────────────────────────────────────────

const confirmDelete = ref(false)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

async function remove() {
  if (!props.testCase) return
  deleting.value = true
  try {
    await $api(`/test-cases/${props.testCase.id}`, { method: 'DELETE' })
    saved.value = JSON.stringify(payload())
    await navigateTo('/test-cases')
  } catch (e) {
    deleteError.value = errorMessage(e)
  } finally {
    deleting.value = false
  }
}

const suiteOptions = computed(() => props.suites.map((s) => ({ value: s.id, label: s.name })))
const environmentOptions = computed(() =>
  props.environments.map((e) => ({ value: e.id, label: `${e.name} — ${prettyUrl(e.baseUrl)}` })),
)
const priorityOptions = (Object.keys(PRIORITY_META) as TestPriority[]).map((value) => ({
  value,
  label: PRIORITY_META[value].label,
}))
const categoryOptions = optionsFrom(CATEGORY_LABELS)
const statusOptions = [
  { value: 'ACTIVE', label: 'Active — included in suite runs' },
  { value: 'DRAFT', label: 'Draft — only runs on its own' },
  { value: 'ARCHIVED', label: 'Archived — never runs' },
]
</script>

<template>
  <div>
    <AppPageHeader
      :eyebrow="testCase ? `${tcKey(testCase.number)} · ${testCase.suite.name}` : 'New test case'"
      :title="form.title.trim() || 'Untitled test case'"
    >
      <template v-if="testCase">
        Created by {{ testCase.createdBy?.name ?? 'a deleted user' }} · updated {{ formatRelative(testCase.updatedAt) }}
      </template>
      <template #actions>
        <span v-if="testCase && dirty" class="flex items-center gap-1.5 text-xs text-warn"><span class="size-1.5 rounded-full bg-warn" /> Unsaved changes</span>
        <UiButton v-if="testCase" variant="ghost" @click="confirmDelete = true"><Trash /> Delete</UiButton>
        <UiButton variant="primary" :loading="saving" :disabled="!dirty" @click="save">
          <Save v-if="!saving" /> {{ testCase ? 'Save' : 'Create test case' }}
          <kbd class="ml-1 hidden font-mono text-[10px] opacity-55 sm:inline">⌘S</kbd>
        </UiButton>
      </template>
    </AppPageHeader>

    <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div class="min-w-0 space-y-5">
        <UiAlert :message="formError" />

        <section class="panel space-y-4 p-4">
          <UiField label="Title" :error="errors.title">
            <UiInput v-model="form.title" placeholder="e.g. Sign in with a wrong password" :invalid="!!errors.title" :autofocus="!testCase" />
          </UiField>
          <UiField label="Description" optional :error="errors.description">
            <UiTextarea v-model="form.description" rows="2" placeholder="What this test covers and why it matters" />
          </UiField>
        </section>

        <TestCaseStepEditor v-model="steps" :errors="stepErrors" />
      </div>

      <aside class="space-y-5 xl:sticky xl:top-0">
        <section v-if="testCase" class="panel overflow-hidden">
          <div class="panel-header">
            <h2 class="panel-title">Run</h2>
            <span class="ml-auto font-mono text-[10px] tracking-wider text-fg-subtle uppercase">chromium</span>
          </div>
          <div class="space-y-3 p-4">
            <template v-if="environments.length">
              <UiField label="Environment">
                <UiSelect v-model="environmentId" :options="environmentOptions" />
              </UiField>
              <UiButton variant="primary" block :loading="starting || saving" :disabled="!environmentId || testCase.status === 'ARCHIVED'" @click="run">
                <Play v-if="!starting && !saving" /> {{ dirty ? 'Save & run test' : 'Run test' }}
              </UiButton>
              <UiAlert :message="runError" />
              <p v-if="testCase.status === 'ARCHIVED'" class="text-xs text-fg-subtle">Archived tests can't run. Change the status to run it.</p>
            </template>
            <p v-else class="text-xs leading-relaxed text-fg-muted">
              Add an environment to this project to run tests.
              <NuxtLink :to="`/projects/${projectId}`" class="text-fg underline decoration-line-strong underline-offset-2 hover:decoration-fg">Configure environments</NuxtLink>
            </p>
          </div>
        </section>

        <section class="panel space-y-4 p-4">
          <UiField label="Suite" :error="errors.suiteId">
            <UiSelect v-model="form.suiteId" :options="suiteOptions" placeholder="Choose a suite" />
          </UiField>
          <div class="grid grid-cols-2 gap-3">
            <UiField label="Priority">
              <UiSelect v-model="form.priority" :options="priorityOptions" />
            </UiField>
            <UiField label="Category">
              <UiSelect v-model="form.category" :options="categoryOptions" />
            </UiField>
          </div>
          <UiField label="Status">
            <UiSelect v-model="form.status" :options="statusOptions" />
          </UiField>
          <UiField label="Expected result" optional hint="Shown next to the actual result when the test fails." :error="errors.expectedResult">
            <UiTextarea v-model="form.expectedResult" rows="3" placeholder="An error message is shown and the user stays on the page." />
          </UiField>
        </section>

        <section v-if="testCase" class="panel">
          <div class="panel-header"><h2 class="panel-title">Recent results</h2></div>
          <ul v-if="testCase.results.length" class="divide-y divide-line">
            <li v-for="result in testCase.results" :key="result.id">
              <NuxtLink :to="`/test-runs/${result.testRun.id}`" class="flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-raised">
                <RunStatusIcon :status="result.status" size="sm" />
                <span class="font-mono text-fg-muted">#{{ result.testRun.number }}</span>
                <span class="min-w-0 flex-1 truncate text-fg-subtle">{{ result.testRun.environmentName }}</span>
                <span class="text-fg-subtle tabular-nums">{{ formatRelative(result.createdAt) }}</span>
              </NuxtLink>
            </li>
          </ul>
          <p v-else class="px-4 py-3 text-xs text-fg-subtle">Not run yet.</p>
        </section>
      </aside>
    </div>

    <UiConfirmModal
      v-model:open="confirmDelete"
      title="Delete test case?"
      :description="`${testCase ? tcKey(testCase.number) : ''} and its steps will be deleted. Past run results keep their snapshot.`"
      :loading="deleting"
      :error="deleteError"
      @confirm="remove"
    />
  </div>
</template>
