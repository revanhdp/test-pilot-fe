import { animate, useInView, useReducedMotion } from 'motion-v'
import type { Ref } from 'vue'

/** 0 → 1 as `t` moves from `start` to `end`, clamped. */
export function progressBetween(t: number, start: number, end: number): number {
  return Math.min(Math.max((t - start) / (end - start), 0), 1)
}

/**
 * One clock for a scripted landing-page animation: `t` runs from 0 to
 * `duration` seconds the first time `target` scrolls into view, and again on
 * `play()`. With reduced motion it jumps straight to the end, so every scene
 * still shows its final state.
 *
 * "In view" means the top edge has risen above 70% of the viewport height,
 * which also works for scenes taller than the screen.
 */
export function usePlayback(target: Ref<HTMLElement | null>, duration: number) {
  const t = ref(0)
  const playing = ref(false)
  const reduced = useReducedMotion()
  const inView = useInView(target, { margin: '0px 0px -30% 0px' })
  let controls: { stop: () => void } | undefined

  function finish() {
    controls?.stop()
    t.value = duration
    playing.value = false
  }

  function play() {
    controls?.stop()
    if (reduced.value) return finish()
    playing.value = true
    controls = animate(0, duration, {
      duration,
      ease: 'linear',
      onUpdate: (value) => (t.value = value),
      onComplete: () => (playing.value = false),
    })
  }

  const stopAutoplay = watch(inView, (visible) => {
    if (!visible) return
    stopAutoplay()
    play()
  })
  watch(reduced, (isReduced) => isReduced && finish())
  onBeforeUnmount(() => controls?.stop())

  return { t, playing, done: computed(() => t.value >= duration), play }
}
