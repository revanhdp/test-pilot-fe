<script setup lang="ts">
import { Check, ChevronsUpDown, Plus } from '@lucide/vue'

const { projects, current, select } = useProjects()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

function choose(id: string) {
  select(id)
  open.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('mousedown', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentClick))
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-[4px] border border-line px-2.5 py-1.5 text-left transition-colors hover:border-line-strong hover:bg-raised"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="min-w-0 flex-1">
        <span class="block text-[11px] text-fg-subtle">Project</span>
        <span class="block truncate text-[13px] font-medium">{{ current?.name ?? 'No project yet' }}</span>
      </span>
      <ChevronsUpDown class="size-3.5 shrink-0 text-fg-subtle" />
    </button>

    <div
      v-if="open"
      class="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-[5px] border border-line-strong bg-raised shadow-[0_16px_40px_-16px_rgb(0_0_0/0.8)]"
    >
      <div class="max-h-64 overflow-y-auto py-1">
        <button
          v-for="project in projects"
          :key="project.id"
          type="button"
          class="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] hover:bg-overlay"
          @click="choose(project.id)"
        >
          <span class="min-w-0 flex-1 truncate">{{ project.name }}</span>
          <Check v-if="project.id === current?.id" class="size-3.5 text-fg" />
        </button>
        <p v-if="!projects?.length" class="px-2.5 py-1.5 text-xs text-fg-subtle">No projects yet</p>
      </div>
      <NuxtLink
        to="/projects?new=1"
        class="flex items-center gap-2 border-t border-line px-2.5 py-2 text-[13px] text-fg-muted hover:bg-overlay hover:text-fg"
        @click="open = false"
      >
        <Plus class="size-3.5" /> New project
      </NuxtLink>
    </div>
  </div>
</template>
