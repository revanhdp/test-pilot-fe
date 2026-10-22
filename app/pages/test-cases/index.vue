<script setup lang="ts">
import { FolderKanban, ListChecks, Pencil, Play, Plus, Search } from '@lucide/vue'
import type { Environment, TestCaseListItem, TestSuite } from '~/types/api'

useHead({ title: 'Test cases · TestPilot AI' })

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { current } = useProjects()
const projectId = computed(() => current.value?.id ?? null)

const { data, refresh, status } = await useAsyncData(
  () => `test-cases:${projectId.value}`,
  async () => {
    if (!projectId.value) return null
    const query = { projectId: projectId.value }
    const [suites, testCases, environments] = await Promise.all([
      $api<TestSuite[]>('/test-suites', { query }),
      $api<TestCaseListItem[]>('/test-cases', { query }),
      $api<Environment[]>('/environments', { query }),
    ])
    return { suites, testCases, environments }
  },
  { watch: [projectId] },
)

const suiteId = computed({
  get: () => (typeof route.query.suite === 'string' ? route.query.suite : null),
  set: (value) => router.replace({ query: value ? { suite: value } : {} }),
})
const selectedSuite = computed(() => data.value?.suites.find((s) => s.id === suiteId.value) ?? null)
const search = ref('')

const visible = computed(() => {
  const term = search.value.trim().toLowerCase()
  return (data.value?.testCases ?? []).filter(
    (tc) =>
      (!suiteId.value || tc.suiteId === suiteId.value) &&
      (!term || tc.title.toLowerCase().includes(term) || tcKey(tc.number).toLowerCase().includes(term)),
  )
})
const runnableCount = computed(
  () =>
    (data.value?.testCases ?? []).filter(
      (tc) => tc.status === 'ACTIVE' && (!suiteId.value || tc.suiteId === suiteId.value),
    ).length,
)

const suiteModal = ref(false)
const editingSuite = ref<TestSuite | null>(null)
const runModal = ref(false)

function openSuite(suite: TestSuite | null) {
  editingSuite.value = suite
  suiteModal.value = true
}

const newTestLink = computed(() => ({ path: '/test-cases/new', query: suiteId.value ? { suite: suiteId.value } : {} }))
</script>

<template>
  <div>
    <AppPageHeader title="Test cases" :eyebrow="current?.name">
      <template v-if="current" #actions>
        <UiButton :disabled="!runnableCount || !data?.environments.length" @click="runModal = true">
          <Play /> Run {{ selectedSuite ? 'suite' : 'all' }}
        </UiButton>
        <UiButton variant="primary" :to="newTestLink"><Plus /> New test case</UiButton>
      </template>
    </AppPageHeader>

    <div v-if="!current" class="panel">
      <UiEmptyState title="Create a project first" description="Test cases belong to a project and run against its environments.">
        <template #icon><FolderKanban /></template>
        <UiButton variant="primary" to="/projects?new=1"><Plus /> New project</UiButton>
      </UiEmptyState>
    </div>

    <div v-else-if="data" class="grid items-start gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
      <!-- Suites -->
      <nav class="lg:pt-1" aria-label="Suites">
        <button
          type="button"
          :class="['flex w-full items-center rounded-[4px] px-2.5 py-1.5 text-[13px]', !suiteId ? 'bg-raised font-medium text-fg' : 'text-fg-muted hover:bg-raised/60 hover:text-fg']"
          @click="suiteId = null"
        >
          All tests
          <span class="ml-auto font-mono text-[11px] text-fg-subtle">{{ data.testCases.length }}</span>
        </button>
        <p class="caption mt-4 mb-1 px-2.5">Suites</p>
        <div v-for="suite in data.suites" :key="suite.id" class="group relative">
          <button
            type="button"
            :class="['flex w-full items-center rounded-[4px] px-2.5 py-1.5 text-left text-[13px]', suiteId === suite.id ? 'bg-raised font-medium text-fg' : 'text-fg-muted hover:bg-raised/60 hover:text-fg']"
            @click="suiteId = suite.id"
          >
            <span class="min-w-0 flex-1 truncate">{{ suite.name }}</span>
            <span class="font-mono text-[11px] text-fg-subtle group-hover:opacity-0">{{ suite._count.testCases }}</span>
          </button>
          <button
            type="button"
            class="absolute top-1/2 right-1 hidden -translate-y-1/2 rounded-[4px] p-1.5 text-fg-subtle group-focus-within:block group-hover:block hover:text-fg"
            :aria-label="`Rename ${suite.name}`"
            @click="openSuite(suite)"
          >
            <Pencil class="size-3" />
          </button>
        </div>
        <button type="button" class="mt-1 flex w-full items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 text-xs text-fg-subtle hover:bg-raised/60 hover:text-fg" @click="openSuite(null)">
          <Plus class="size-3.5" /> New suite
        </button>
      </nav>

      <!-- Cases -->
      <section class="panel min-w-0 overflow-hidden">
        <div class="panel-header">
          <h2 class="panel-title">{{ selectedSuite?.name ?? 'All tests' }}</h2>
          <span class="font-mono text-[11px] text-fg-subtle">{{ visible.length }}</span>
          <div class="relative ml-auto w-56">
            <Search class="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-fg-subtle" />
            <UiInput v-model="search" size="sm" placeholder="Filter by title or key" class="pl-7" aria-label="Filter test cases" />
          </div>
        </div>

        <UiEmptyState
          v-if="!visible.length"
          :title="search ? 'No matching test cases' : 'No test cases yet'"
          :description="search ? 'Try a different filter.' : 'Describe a user flow as steps: navigate, interact, then assert what should happen.'"
        >
          <template #icon><ListChecks /></template>
          <UiButton v-if="!search" variant="primary" :to="newTestLink"><Plus /> New test case</UiButton>
        </UiEmptyState>

        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr class="border-b border-line text-xs text-fg-subtle">
                <th class="w-8 py-2.5 pl-4" />
                <th class="w-20 px-2 py-2.5 font-medium">Key</th>
                <th class="w-full px-2 py-2.5 font-medium">Title</th>
                <th class="px-2 py-2.5 font-medium whitespace-nowrap">Priority</th>
                <th class="px-2 py-2.5 font-medium">Category</th>
                <th class="px-2 py-2.5 text-right font-medium">Steps</th>
                <th class="px-4 py-2.5 text-right font-medium whitespace-nowrap">Last run</th>
              </tr>
            </thead>
            <tbody :class="['divide-y divide-line', status === 'pending' && 'opacity-60']">
              <tr
                v-for="tc in visible"
                :key="tc.id"
                class="cursor-pointer transition-colors hover:bg-raised"
                @click="navigateTo(`/test-cases/${tc.id}`)"
              >
                <td class="py-2.5 pl-4">
                  <RunStatusIcon v-if="tc.results[0]" :status="tc.results[0].status" size="sm" />
                  <span v-else class="block size-3.5 text-center font-mono text-xs leading-3.5 text-fg-subtle" title="Never run">·</span>
                </td>
                <td class="px-2 py-2.5 font-mono text-xs whitespace-nowrap text-fg-muted">{{ tcKey(tc.number) }}</td>
                <td class="max-w-0 w-full px-2 py-2.5">
                  <div class="flex items-center gap-2">
                    <NuxtLink :to="`/test-cases/${tc.id}`" class="truncate font-medium text-fg" @click.stop>{{ tc.title }}</NuxtLink>
                    <UiBadge v-if="tc.status !== 'ACTIVE'">{{ tc.status === 'DRAFT' ? 'Draft' : 'Archived' }}</UiBadge>
                  </div>
                  <p v-if="!suiteId" class="mt-0.5 truncate text-xs text-fg-subtle">{{ tc.suite.name }}</p>
                </td>
                <td class="px-2 py-2.5"><TestCasePriority :priority="tc.priority" /></td>
                <td class="px-2 py-2.5 text-xs whitespace-nowrap text-fg-muted">{{ CATEGORY_LABELS[tc.category] }}</td>
                <td class="px-2 py-2.5 text-right font-mono text-xs text-fg-muted tabular-nums">{{ tc._count.steps }}</td>
                <td class="px-4 py-2.5 text-right text-xs whitespace-nowrap text-fg-subtle">{{ formatRelative(tc.results[0]?.finishedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <template v-if="current && data">
      <ProjectSuiteModal v-model:open="suiteModal" :project-id="current.id" :suite="editingSuite" @saved="refresh()" />
      <RunStartModal
        v-model:open="runModal"
        :environments="data.environments"
        :scope-label="selectedSuite ? `Suite “${selectedSuite.name}”` : `All suites in ${current.name}`"
        :test-count="runnableCount"
        :suite-id="selectedSuite?.id"
      />
    </template>
  </div>
</template>
