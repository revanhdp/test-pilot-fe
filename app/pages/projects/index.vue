<script setup lang="ts">
import { ChevronRight, FolderKanban, Plus } from '@lucide/vue'
import type { Project } from '~/types/api'

useHead({ title: 'Projects · TestPilot AI' })

const route = useRoute()
const router = useRouter()
const { projects, refresh, select } = useProjects()

await refresh()

// `?new=1` (from onboarding links) opens the modal once; drop it so a reload doesn't reopen it.
const creating = ref(route.query.new === '1')
onMounted(() => {
  if (route.query.new) void router.replace({ query: {} })
})

async function onCreated(project: Project) {
  await refresh()
  select(project.id)
  await navigateTo(`/projects/${project.id}`)
}
</script>

<template>
  <div>
    <AppPageHeader title="Projects">
      Each project is one application under test, with its environments, suites and run history.
      <template #actions>
        <UiButton variant="primary" @click="creating = true"><Plus /> New project</UiButton>
      </template>
    </AppPageHeader>

    <div class="panel overflow-hidden">
      <UiEmptyState
        v-if="!projects?.length"
        title="No projects yet"
        description="Create a project and point it at the website you want to test."
      >
        <template #icon><FolderKanban /></template>
        <UiButton variant="primary" @click="creating = true"><Plus /> New project</UiButton>
      </UiEmptyState>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[720px] text-left text-[13px]">
          <thead>
            <tr class="border-b border-line text-xs text-fg-subtle">
              <th class="px-4 py-2.5 font-medium">Project</th>
              <th class="px-4 py-2.5 font-medium">Environments</th>
              <th class="px-4 py-2.5 font-medium">Test cases</th>
              <th class="px-4 py-2.5 font-medium">Last run</th>
              <th class="w-48 px-4 py-2.5 font-medium">Result</th>
              <th class="w-8" />
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr
              v-for="project in projects"
              :key="project.id"
              class="group cursor-pointer transition-colors hover:bg-raised"
              @click="navigateTo(`/projects/${project.id}`)"
            >
              <td class="px-4 py-3">
                <NuxtLink :to="`/projects/${project.id}`" class="font-medium text-fg" @click.stop>{{ project.name }}</NuxtLink>
                <p class="mt-0.5 max-w-md truncate text-xs text-fg-subtle">{{ project.description ?? 'No description' }}</p>
              </td>
              <td class="px-4 py-3 font-mono text-xs text-fg-muted tabular-nums">{{ project._count.environments }}</td>
              <td class="px-4 py-3 font-mono text-xs text-fg-muted tabular-nums">{{ project._count.testCases }}</td>
              <td class="px-4 py-3">
                <div v-if="project.testRuns[0]" class="flex items-center gap-2">
                  <RunStatusBadge :status="project.testRuns[0].status" />
                  <span class="text-xs text-fg-subtle">{{ formatRelative(project.testRuns[0].createdAt) }}</span>
                </div>
                <span v-else class="text-xs text-fg-subtle">Never run</span>
              </td>
              <td class="px-4 py-3">
                <div v-if="project.testRuns[0]" class="flex items-center gap-3">
                  <RunResultBar
                    class="flex-1"
                    :passed="project.testRuns[0].passedTests"
                    :failed="project.testRuns[0].failedTests"
                    :skipped="0"
                    :total="project.testRuns[0].totalTests"
                  />
                  <span class="w-9 text-right font-mono text-xs text-fg-muted tabular-nums">{{ formatPercent(runPassRate(project.testRuns[0])) }}</span>
                </div>
              </td>
              <td class="pr-3 text-fg-subtle"><ChevronRight class="size-4 opacity-0 transition-opacity group-hover:opacity-100" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ProjectFormModal v-model:open="creating" @saved="onCreated" />
  </div>
</template>
