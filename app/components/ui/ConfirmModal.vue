<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
defineProps<{ title: string; description: string; confirmLabel?: string; loading?: boolean; error?: string | null }>()
defineEmits<{ confirm: [] }>()
</script>

<template>
  <UiModal v-model:open="open" :title="title" width="sm">
    <div class="space-y-3 px-5 py-4">
      <p class="text-[13px] leading-relaxed text-fg-muted">{{ description }}</p>
      <p v-if="error" class="text-xs text-fail">{{ error }}</p>
    </div>
    <div class="flex justify-end gap-2 border-t border-line px-5 py-3">
      <UiButton variant="ghost" @click="open = false">Cancel</UiButton>
      <UiButton variant="danger" :loading="loading" @click="$emit('confirm')">
        {{ confirmLabel ?? 'Delete' }}
      </UiButton>
    </div>
  </UiModal>
</template>
