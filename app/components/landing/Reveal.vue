<script setup lang="ts">
import { motion } from 'motion-v'

/** Fades and lifts its content in the first time it scrolls into view. */
withDefaults(defineProps<{ delay?: number; as?: 'div' | 'section' | 'header' }>(), { delay: 0, as: 'div' })
</script>

<template>
  <motion.div
    :as="as"
    :initial="{ opacity: 0, y: 18 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :in-view-options="{ once: true, margin: '0px 0px -12% 0px' }"
    :transition="{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }"
  >
    <slot />
  </motion.div>
</template>
