<script setup lang="ts">
/** Browser chrome around a screenshot or live placeholder: address bar and engine readout. */
defineProps<{ url?: string | null; title?: string | null; browser?: string; live?: boolean }>()
</script>

<template>
  <div class="overflow-hidden rounded-[5px] border border-line-strong bg-canvas">
    <div class="relative flex h-8 items-center gap-3 border-b border-line bg-raised px-2.5">
      <span class="flex min-w-0 flex-1 items-center gap-2 font-mono text-[11px]">
        <span class="shrink-0 text-fg-subtle">{{ url?.startsWith('https://') ? 'https' : 'http' }}</span>
        <span class="truncate text-fg-muted">{{ url ? prettyUrl(url) : 'about:blank' }}</span>
      </span>
      <span v-if="title" class="hidden max-w-[40%] truncate text-[11px] text-fg-subtle md:block">{{ title }}</span>
      <span v-if="browser" class="hidden font-mono text-[10px] tracking-wider text-fg-subtle uppercase sm:block">{{ browser }}</span>
      <div v-if="live" class="absolute inset-x-0 -bottom-px h-px overflow-hidden" aria-hidden="true">
        <div class="h-px w-1/3 motion-safe:animate-sweep bg-run" />
      </div>
    </div>
    <div class="relative aspect-[16/10] bg-canvas">
      <slot />
    </div>
  </div>
</template>
