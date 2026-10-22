<script setup lang="ts">
import { FolderKanban, LayoutDashboard, ListChecks, LogOut, Workflow } from '@lucide/vue'

defineEmits<{ navigate: [] }>()

const { user, logout } = useAuth()
const route = useRoute()
const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)

const nav = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Test runs', to: '/test-runs', icon: Workflow },
  { label: 'Test cases', to: '/test-cases', icon: ListChecks },
]
</script>

<template>
  <aside class="flex h-full w-56 flex-col border-r border-line bg-canvas">
    <div class="flex h-14 items-center px-4">
      <NuxtLink to="/dashboard" class="rounded-sm" @click="$emit('navigate')"><AppLogo /></NuxtLink>
    </div>

    <div class="px-3 pb-4">
      <AppProjectSwitcher />
    </div>

    <nav class="flex-1 overflow-y-auto px-3" aria-label="Main">
      <ul class="space-y-px">
        <li v-for="item in nav" :key="item.to">
          <NuxtLink
            :to="item.to"
            :class="[
              'relative flex h-8 items-center gap-2.5 rounded-[4px] px-2.5 text-[13px] transition-colors',
              isActive(item.to)
                ? 'bg-raised font-medium text-fg before:absolute before:inset-y-1.5 before:-left-3 before:w-[2px] before:bg-fg'
                : 'text-fg-muted hover:bg-raised/70 hover:text-fg',
            ]"
            @click="$emit('navigate')"
          >
            <component :is="item.icon" class="size-[15px] stroke-[1.75]" />
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="flex items-center gap-2.5 border-t border-line px-4 py-3">
      <span class="flex size-7 shrink-0 items-center justify-center rounded-[4px] bg-overlay font-mono text-[11px] font-medium text-fg-muted">
        {{ user ? initials(user.name) : '' }}
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-[13px] font-medium">{{ user?.name }}</span>
        <span class="block truncate text-[11px] text-fg-subtle">{{ user?.email }}</span>
      </span>
      <button
        type="button"
        class="rounded-[4px] p-1.5 text-fg-subtle hover:bg-raised hover:text-fg"
        aria-label="Sign out"
        title="Sign out"
        @click="logout"
      >
        <LogOut class="size-3.5" />
      </button>
    </div>
  </aside>
</template>
