import type { WatchSource } from 'vue'

/** Calls `fn` every `intervalMs` while `active` is true. Stops on unmount. */
export function usePolling(
  fn: () => Promise<unknown>,
  active: WatchSource<boolean>,
  intervalMs = 1500,
) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let disposed = false

  const schedule = (isActive: boolean) => {
    clearTimeout(timer)
    if (disposed || !isActive) return
    timer = setTimeout(async () => {
      try {
        await fn()
      } catch {
        // A failed poll is retried on the next tick.
      }
      schedule(toValue(active))
    }, intervalMs)
  }

  watch(active, schedule, { immediate: true })
  onBeforeUnmount(() => {
    disposed = true
    clearTimeout(timer)
  })
}
