<script setup lang="ts">
import { Menu } from '@lucide/vue'

const drawerOpen = ref(false)

const route = useRoute()
watch(() => route.fullPath, () => (drawerOpen.value = false))
</script>

<template>
  <div class="flex h-dvh overflow-hidden bg-canvas">
    <a
      href="#main"
      class="fixed top-2 left-2 z-[60] -translate-y-16 rounded-[4px] bg-fg px-3 py-2 text-[13px] font-medium text-canvas focus:translate-y-0"
    >
      Skip to content
    </a>
    <!-- Desktop sidebar -->
    <AppSidebar class="hidden lg:flex" />

    <!-- Mobile drawer -->
    <Transition enter-from-class="opacity-0" enter-active-class="transition" leave-to-class="opacity-0" leave-active-class="transition">
      <div v-if="drawerOpen" class="fixed inset-0 z-40 bg-black/70 lg:hidden" @click="drawerOpen = false" />
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
        <button type="button" class="rounded-[4px] p-1.5 text-fg-muted hover:bg-raised" aria-label="Open menu" @click="drawerOpen = true">
          <Menu class="size-4" />
        </button>
        <AppLogo />
      </div>
      <main id="main" tabindex="-1" class="flex-1 overflow-y-auto focus:outline-none">
        <div class="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
