<script setup lang="ts">
import { X } from '@lucide/vue'

const open = defineModel<boolean>('open', { required: true })
withDefaults(defineProps<{ title: string; description?: string; width?: 'sm' | 'md' | 'lg' }>(), {
  width: 'md',
})

const panel = ref<HTMLElement | null>(null)

function close() {
  open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (open.value && event.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  panel.value?.querySelector<HTMLElement>('[autofocus], input, select, textarea')?.focus()
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-from-class="opacity-0"
      enter-active-class="transition duration-150"
      leave-to-class="opacity-0"
      leave-active-class="transition duration-100"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-[12vh]"
        @mousedown.self="close"
      >
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          :class="[
            'panel w-full border-line-strong shadow-[0_24px_64px_-24px_rgb(0_0_0/0.8)]',
            { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[width],
          ]"
        >
          <div class="flex items-start gap-3 border-b border-line px-5 py-4">
            <div class="min-w-0 flex-1">
              <h2 class="text-[15px] font-semibold">{{ title }}</h2>
              <p v-if="description" class="mt-1 text-[13px] leading-relaxed text-fg-muted">{{ description }}</p>
            </div>
            <button
              type="button"
              class="-m-1 rounded p-1 text-fg-subtle hover:bg-overlay hover:text-fg"
              aria-label="Close"
              @click="close"
            >
              <X class="size-4" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
