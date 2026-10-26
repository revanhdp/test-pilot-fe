<script setup lang="ts">
import { Plus } from '@lucide/vue'
import { AnimatePresence, motion } from 'motion-v'

/** The questions a visitor asks before signing up, starting with the obvious one. */
const QUESTIONS = [
  {
    q: 'Why not just test by hand?',
    a: 'For a one-off check, testing by hand is faster. A test case pays off from the second run: it repeats the same checks on every deploy in seconds, never skips the boring ones like the 404 page or the admin login, and leaves the failing step, a screenshot and the exact error behind.',
  },
  {
    q: 'Do I have to write every step myself?',
    a: 'Today, yes: steps are written in the editor, as navigate, click, fill and assertions. Generating them is next: describe the goal, review the steps a model proposes, save. Generated tests are validated and run by the same engine as hand-written ones.',
  },
  {
    q: 'Can the AI mark a broken test as passed?',
    a: 'No. Pass or fail comes only from assertions running in Chromium. A model can propose steps and explain a failure, but it never sets a result.',
  },
  {
    q: 'What counts as a test execution?',
    a: 'One test case, run once, in one browser. Running a suite of nine tests is nine executions. Tests skipped because they have no steps don’t count.',
  },
  {
    q: 'Which sites can it test?',
    a: 'Any site the TestPilot server can reach over http(s): staging, preview deployments or production. Each environment has one origin, and tests can’t navigate away from it.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. Tests run in Chromium on TestPilot’s servers. All you need is the URL of the site you want to test.',
  },
]

const open = ref<number | null>(0)
const toggle = (index: number) => (open.value = open.value === index ? null : index)
const id = useId()
</script>

<template>
  <ul class="divide-y divide-line border-y border-line">
    <li v-for="(item, index) in QUESTIONS" :key="item.q">
      <h3>
        <button
          :id="`${id}-q${index}`"
          type="button"
          class="flex w-full items-center gap-4 py-4 text-left text-[15px] font-medium hover:text-fg"
          :aria-expanded="open === index"
          :aria-controls="`${id}-a${index}`"
          @click="toggle(index)"
        >
          <span class="flex-1">{{ item.q }}</span>
          <Plus :class="['size-4 shrink-0 text-fg-subtle transition-transform duration-300', open === index && 'rotate-45']" />
        </button>
      </h3>
      <AnimatePresence :initial="false">
        <motion.div
          v-if="open === index"
          :id="`${id}-a${index}`"
          role="region"
          :aria-labelledby="`${id}-q${index}`"
          class="overflow-hidden"
          :initial="{ height: 0, opacity: 0 }"
          :animate="{ height: 'auto', opacity: 1 }"
          :exit="{ height: 0, opacity: 0 }"
          :transition="{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }"
        >
          <p class="max-w-[62ch] pb-5 text-[14px] leading-relaxed text-fg-muted">{{ item.a }}</p>
        </motion.div>
      </AnimatePresence>
    </li>
  </ul>
</template>
