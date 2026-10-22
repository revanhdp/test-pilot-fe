<script setup lang="ts">
import {
  Bug,
  FileChartColumn,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Plug,
  Radar,
  Settings,
  Workflow,
} from '@lucide/vue'
import type { Component } from 'vue'

defineEmits<{ navigate: [] }>()

const { user, logout } = useAuth()
const route = useRoute()
const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)

interface NavItem {
  label: string
  to: string
  icon: Component
  /** Not built yet: shown so the roadmap is visible, but not clickable. */
  soon?: boolean
}

const primary: NavItem[] = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Test Runs', to: '/test-runs', icon: Workflow },
  { label: 'Test Cases', to: '/test-cases', icon: ListChecks },
]

const intelligence: NavItem[] = [
  { label: 'AI Explorer', to: '/explorer', icon: Radar, soon: true },
  { label: 'Bugs', to: '/bugs', icon: Bug, soon: true },
  { label: 'Reports', to: '/reports', icon: FileChartColumn, soon: true },
]

const system: NavItem[] = [
  { label: 'Integrations', to: '/integrations', icon: Plug, soon: true },
  { label: 'Settings', to: '/settings', icon: Settings, soon: true },
]

const sections = [
  { title: null, items: primary },
  { title: 'Intelligence', items: intelligence },
  { title: 'System', items: system },
]
</script>

<template>
  <aside class="flex h-full w-60 flex-col border-r border-line bg-surface">
    <div class="flex h-14 items-center px-4">
      <NuxtLink to="/dashboard" @click="$emit('navigate')"><AppLogo /></NuxtLink>
    </div>

    <div class="px-3 pb-3">
      <AppProjectSwitcher />
    </div>

    <nav class="flex-1 space-y-5 overflow-y-auto px-3 py-2">
      <div v-for="section in sections" :key="section.title ?? 'main'">
        <p v-if="section.title" class="eyebrow mb-1.5 px-2">{{ section.title }}</p>
        <ul class="space-y-0.5">
          <li v-for="item in section.items" :key="item.to">
            <span
              v-if="item.soon"
              class="flex h-8 cursor-default items-center gap-2.5 rounded-md px-2 text-[13px] text-fg-subtle"
              :title="`${item.label} is on the roadmap`"
            >
              <component :is="item.icon" class="size-4 opacity-70" />
              {{ item.label }}
              <span class="ml-auto rounded border border-line px-1 font-mono text-[9.5px] tracking-wide uppercase">soon</span>
            </span>
            <NuxtLink
              v-else
              :to="item.to"
              :class="[
                'relative flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors',
                isActive(item.to)
                  ? 'bg-overlay text-fg before:absolute before:inset-y-2 before:-left-3 before:w-0.5 before:rounded-full before:bg-accent'
                  : 'text-fg-muted hover:bg-overlay hover:text-fg',
              ]"
              @click="$emit('navigate')"
            >
              <component :is="item.icon" class="size-4" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <div class="border-t border-line p-3">
      <p class="eyebrow mb-2 px-1">Personal workspace</p>
      <div class="flex items-center gap-2.5 rounded-md px-1 py-1">
        <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-overlay text-[11px] font-semibold text-fg-muted ring-1 ring-line-strong">
          {{ user ? initials(user.name) : '' }}
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[13px] font-medium">{{ user?.name }}</span>
          <span class="block truncate text-[11px] text-fg-subtle">{{ user?.email }}</span>
        </span>
        <button
          type="button"
          class="rounded p-1.5 text-fg-subtle hover:bg-overlay hover:text-fg"
          aria-label="Sign out"
          title="Sign out"
          @click="logout"
        >
          <LogOut class="size-3.5" />
        </button>
      </div>
    </div>
  </aside>
</template>
