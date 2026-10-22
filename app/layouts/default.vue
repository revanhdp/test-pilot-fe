<script setup lang="ts">
import { Menu } from '@lucide/vue'

const drawerOpen = ref(false)

const route = useRoute()
watch(() => route.fullPath, () => (drawerOpen.value = false))
</script>

<template>
  <div class="flex h-dvh overflow-hidden bg-canvas">
    <!-- Desktop sidebar -->
    <AppSidebar class="hidden lg:flex" />

    <!-- Mobile drawer -->
    <Transition enter-from-class="opacity-0" enter-active-class="transition" leave-to-class="opacity-0" leave-active-class="transition">
      <div v-if="drawerOpen" class="fixed inset-0 z-40 bg-black/60 lg:hidden" @click="drawerOpen = false" />
    </Transition>
    <AppSidebar
      :class="[
        'fixed inset-y-0 left-0 z-50 transition-transform lg:hidden',
        drawerOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      @navigate="drawerOpen = false"
    />

    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex h-12 items-center gap-3 border-b border-line px-4 lg:hidden">
        <button type="button" class="rounded p-1.5 text-fg-muted hover:bg-overlay" aria-label="Open menu" @click="drawerOpen = true">
          <Menu class="size-4" />
        </button>
        <AppLogo />
      </div>
      <main class="flex-1 overflow-y-auto">
        <div class="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
