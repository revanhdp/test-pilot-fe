<script setup lang="ts">
import { ArrowRight, KeyRound, ListChecks, Pencil, Play, Plus, Trash } from '@lucide/vue'
import type { Environment, ProjectDetail, TestRunListItem, TestSuite } from '~/types/api'

const route = useRoute()
const id = computed(() => route.params.id as string)
const { $api } = useNuxtApp()
const { refresh: refreshProjects, select } = useProjects()

const { data: project, refresh, error } = await useAsyncData(
  () => `project:${id.value}`,
  () => $api<ProjectDetail>(`/projects/${id.value}`),
)
const { data: runs } = await useAsyncData(
  () => `project-runs:${id.value}`,
  () => $api<TestRunListItem[]>('/test-runs', { query: { projectId: id.value, limit: 6 } }),
)

watch(project, (p) => p && select(p.id), { immediate: true })
useHead({ title: () => `${project.value?.name ?? 'Project'} · TestPilot AI` })

const activeTests = computed(() => project.value?._count.testCases ?? 0)

// Modals
const editingProject = ref(false)
const deletingProject = ref(false)
const envModal = ref(false)
const editingEnv = ref<Environment | null>(null)
const signInModal = ref(false)
const signInEnv = ref<Environment | null>(null)
const suiteModal = ref(false)
const editingSuite = ref<TestSuite | null>(null)
const runModal = ref(false)
const pendingDelete = ref<{ kind: 'environment' | 'suite'; id: string; title: string; description: string } | null>(null)
const busy = ref(false)
const actionError = ref<string | null>(null)

function openEnv(env: Environment | null) {
  editingEnv.value = env
  envModal.value = true
}
function openSignIn(env: Environment) {
  signInEnv.value = env
  signInModal.value = true
}
function openSuite(suite: TestSuite | null) {
  editingSuite.value = suite
  suiteModal.value = true
}

async function afterChange() {
  await Promise.all([refresh(), refreshProjects()])
}

async function deleteProject() {
  busy.value = true
  try {
    await $api(`/projects/${id.value}`, { method: 'DELETE' })
    await refreshProjects()
    await navigateTo('/projects')
  } catch (e) {
    actionError.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

async function confirmPendingDelete() {
  if (!pendingDelete.value) return
  busy.value = true
  actionError.value = null
  try {
    const path = pendingDelete.value.kind === 'environment' ? 'environments' : 'test-suites'
    await $api(`/${path}/${pendingDelete.value.id}`, { method: 'DELETE' })
    pendingDelete.value = null
    await afterChange()
  } catch (e) {
    actionError.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

const pendingOpen = computed({
  get: () => pendingDelete.value !== null,
  set: (open) => {
    if (!open) pendingDelete.value = null
  },
})
</script>

<template>
  <div v-if="error" class="panel">
    <UiEmptyState title="Project not found" description="It may have been deleted, or it belongs to another account.">
      <UiButton to="/projects">Back to projects</UiButton>
    </UiEmptyState>
  </div>

  <div v-else-if="project">
    <AppPageHeader :title="project.name" eyebrow="Project">
      <template v-if="project.description">{{ project.description }}</template>
      <template #actions>
        <UiButton variant="ghost" @click="editingProject = true"><Pencil /> Edit</UiButton>
        <UiButton variant="ghost" @click="deletingProject = true"><Trash /> Delete</UiButton>
        <UiButton :to="`/test-cases`"><ListChecks /> Test cases</UiButton>
        <UiButton variant="primary" :disabled="!project.environments.length || !activeTests" @click="runModal = true">
          <Play /> Run all tests
        </UiButton>
      </template>
    </AppPageHeader>

    <div class="grid items-start gap-6 xl:grid-cols-2">
      <!-- Environments -->
      <section class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Environments</h2>
          <UiButton class="ml-auto" size="sm" variant="ghost" @click="openEnv(null)"><Plus /> Add</UiButton>
        </div>
        <ul v-if="project.environments.length" class="divide-y divide-line">
          <li v-for="env in project.environments" :key="env.id" class="group flex items-center gap-3 px-4 py-3">
            <div class="min-w-0 flex-1">
              <p class="flex items-center gap-2 text-[13px] font-medium">
                {{ env.name }}
                <UiBadge :tone="ENVIRONMENT_TYPE_TONES[env.type]">{{ ENVIRONMENT_TYPE_LABELS[env.type] }}</UiBadge>
              </p>
              <a :href="env.baseUrl" target="_blank" rel="noopener noreferrer" class="mt-0.5 block truncate font-mono text-xs text-fg-subtle hover:text-fg hover:underline">{{ env.baseUrl }}</a>
              <button
                type="button"
                :class="['mt-1.5 flex items-center gap-1.5 text-xs hover:text-fg', env.signInSteps?.length ? 'text-fg-muted' : 'text-fg-subtle']"
                @click="openSignIn(env)"
              >
                <KeyRound class="size-3" />
                {{ env.signInSteps?.length ? `Signs in · ${plural(env.signInSteps.length, 'step')}` : 'Add sign-in' }}
              </button>
            </div>
            <div class="flex gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
              <UiButton size="xs" variant="ghost" aria-label="Edit environment" @click="openEnv(env)"><Pencil /></UiButton>
              <UiButton
                size="xs"
                variant="ghost"
                aria-label="Delete environment"
                @click="pendingDelete = { kind: 'environment', id: env.id, title: `Delete ${env.name}?`, description: 'Past runs keep their environment name and URL.' }"
              >
                <Trash />
              </UiButton>
            </div>
          </li>
        </ul>
        <UiEmptyState v-else title="No environments" description="Add the base URL of the site you want to test.">
          <UiButton size="sm" variant="primary" @click="openEnv(null)"><Plus /> Add environment</UiButton>
        </UiEmptyState>
      </section>

      <!-- Suites -->
      <section class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Test suites</h2>
          <span class="font-mono text-[11px] text-fg-subtle">{{ project._count.testCases }} tests</span>
          <UiButton class="ml-auto" size="sm" variant="ghost" @click="openSuite(null)"><Plus /> Add</UiButton>
        </div>
        <ul class="divide-y divide-line">
          <li v-for="suite in project.testSuites" :key="suite.id" class="group flex items-center gap-3 px-4 py-3">
            <NuxtLink :to="{ path: '/test-cases', query: { suite: suite.id } }" class="min-w-0 flex-1">
              <p class="text-[13px] font-medium hover:underline">{{ suite.name }}</p>
              <p class="truncate text-xs text-fg-subtle">{{ suite.description ?? `${suite._count.testCases} test cases` }}</p>
            </NuxtLink>
            <span class="font-mono text-xs text-fg-muted tabular-nums">{{ suite._count.testCases }}</span>
            <div class="flex gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
              <UiButton size="xs" variant="ghost" aria-label="Rename suite" @click="openSuite(suite)"><Pencil /></UiButton>
              <UiButton
                size="xs"
                variant="ghost"
                aria-label="Delete suite"
                @click="pendingDelete = { kind: 'suite', id: suite.id, title: `Delete ${suite.name}?`, description: `This deletes the suite and its ${suite._count.testCases} test case(s). Past run results keep their snapshots.` }"
              >
                <Trash />
              </UiButton>
            </div>
          </li>
        </ul>
      </section>

      <!-- Runs -->
      <section class="panel xl:col-span-2">
        <div class="panel-header">
          <h2 class="panel-title">Recent runs</h2>
          <NuxtLink to="/test-runs" class="ml-auto flex items-center gap-1 text-xs text-fg-muted hover:text-fg">All runs <ArrowRight class="size-3.5" /></NuxtLink>
        </div>
        <ul v-if="runs?.length" class="divide-y divide-line">
          <li v-for="run in runs" :key="run.id">
            <NuxtLink :to="`/test-runs/${run.id}`" class="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2.5 hover:bg-raised sm:grid-cols-[70px_90px_1fr_160px_100px]">
              <RunStatusBadge :status="run.status" class="justify-self-start" />
              <span class="font-mono text-[13px]">Run #{{ run.number }}</span>
              <span class="hidden truncate text-xs text-fg-muted sm:block">{{ run.environmentName }}</span>
              <RunResultBar class="hidden sm:flex" :passed="run.passedTests" :failed="run.failedTests" :skipped="run.skippedTests" :total="run.totalTests" />
              <span class="text-right text-xs text-fg-subtle">{{ formatRelative(run.createdAt) }}</span>
            </NuxtLink>
          </li>
        </ul>
        <p v-else class="px-4 py-6 text-center text-xs text-fg-subtle">No runs yet.</p>
      </section>
    </div>

    <ProjectFormModal v-model:open="editingProject" :project="project" @saved="afterChange" />
    <ProjectEnvironmentModal v-model:open="envModal" :project-id="project.id" :environment="editingEnv" @saved="afterChange" />
    <ProjectSignInModal v-model:open="signInModal" :environment="signInEnv" @saved="afterChange" />
    <ProjectSuiteModal v-model:open="suiteModal" :project-id="project.id" :suite="editingSuite" @saved="afterChange" />
    <RunStartModal v-model:open="runModal" :environments="project.environments" :scope-label="`All suites in ${project.name}`" :test-count="activeTests" />
    <UiConfirmModal
      v-model:open="deletingProject"
      :title="`Delete ${project.name}?`"
      description="All environments, suites, test cases, runs and screenshots of this project will be permanently deleted."
      confirm-label="Delete project"
      :loading="busy"
      :error="actionError"
      @confirm="deleteProject"
    />
    <UiConfirmModal
      v-model:open="pendingOpen"
      :title="pendingDelete?.title ?? ''"
      :description="pendingDelete?.description ?? ''"
      :loading="busy"
      :error="actionError"
      @confirm="confirmPendingDelete"
    />
  </div>
</template>
