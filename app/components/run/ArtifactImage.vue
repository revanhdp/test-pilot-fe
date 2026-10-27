<script setup lang="ts">
/**
 * An artifact image. The API needs the Clerk token, which an <img src> can't
 * send, so the file is fetched with `$api` and shown from a blob URL.
 */
const props = defineProps<{ id: string; alt?: string }>()

const { $api } = useNuxtApp()
// Artifacts never change, so a blob URL is reused for the life of the page.
const cache = useState<Record<string, string>>('artifact-images', () => ({}))
const failed = ref(false)

const src = computed(() => cache.value[props.id])

watch(
  () => props.id,
  async (id) => {
    failed.value = false
    if (cache.value[id]) return
    try {
      const blob = await $api<Blob>(`/artifacts/${id}/file`, { responseType: 'blob' })
      cache.value = { ...cache.value, [id]: URL.createObjectURL(blob) }
    } catch {
      failed.value = true
    }
  },
  { immediate: true },
)
</script>

<template>
  <img v-if="src" :src="src" :alt="alt ?? ''" v-bind="$attrs">
  <span v-else-if="failed" class="flex size-full items-center justify-center font-mono text-xs text-fg-subtle">
    Screenshot unavailable
  </span>
  <span v-else class="block size-full" aria-hidden="true" />
</template>
