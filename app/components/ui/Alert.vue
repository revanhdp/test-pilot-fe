<script setup lang="ts">
defineProps<{ message: string | null | undefined }>()
</script>

<template>
  <div
    v-if="message"
    role="alert"
    class="border-l-2 border-fail bg-fail/8 px-3 py-2 text-xs leading-relaxed text-fail"
  >
    {{ message }}
  </div>
</template>
