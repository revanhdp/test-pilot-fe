<script setup lang="ts">
import { Globe, Lock } from '@lucide/vue'

/** A browser window chrome around a screenshot or live placeholder. */
defineProps<{ url?: string | null; title?: string | null; browser?: string }>()
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-line-strong bg-[#0c0d10] shadow-[0_20px_60px_-30px_rgb(0_0_0/0.9)]">
    <div class="flex items-center gap-3 border-b border-line bg-raised px-3 py-2">
      <div class="flex gap-1.5" aria-hidden="true">
        <span class="size-2.5 rounded-full bg-[#3a3d45]" />
        <span class="size-2.5 rounded-full bg-[#3a3d45]" />
        <span class="size-2.5 rounded-full bg-[#3a3d45]" />
      </div>
      <div class="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-md border border-line bg-canvas px-2">
        <Lock v-if="url?.startsWith('https://')" class="size-3 shrink-0 text-fg-subtle" />
        <Globe v-else class="size-3 shrink-0 text-fg-subtle" />
        <span class="truncate font-mono text-[11px] text-fg-muted">{{ url ?? 'about:blank' }}</span>
      </div>
      <span v-if="browser" class="hidden font-mono text-[10px] tracking-wide text-fg-subtle uppercase sm:block">{{ browser }}</span>
    </div>
    <div v-if="title" class="truncate border-b border-line px-3 py-1 text-[11px] text-fg-subtle">{{ title }}</div>
    <div class="relative aspect-[16/10] bg-canvas">
      <slot />
    </div>
  </div>
</template>
