import type { AiErrorCode, AiStatus, ApiErrorBody, GeneratedTest, GenerateTestInput } from '~/types/api'

export interface AiError {
  code: AiErrorCode | null
  message: string
}

/** Quota and rate-limit errors lock generating until the wait is over. */
const LOCKING: AiErrorCode[] = ['AI_QUOTA_EXHAUSTED', 'AI_USER_LIMIT']

/**
 * AI test generation. A used-up provider quota (or the per-user hourly cap)
 * stops generating until its `retryAfterSeconds` has passed: the lock is shared
 * by every button and survives closing the modal. Nothing here retries.
 */
export function useAi() {
  const { $api } = useNuxtApp()
  const { data: status } = useAsyncData('ai:status', () => $api<AiStatus>('/ai/status'), { lazy: true })

  const lockedUntil = useState<number | null>('ai:lockedUntil', () => null)
  const lockReason = useState<AiErrorCode | null>('ai:lockReason', () => null)
  const now = useState('ai:now', () => Date.now())
  const generating = ref(false)
  const error = ref<AiError | null>(null)

  const secondsLeft = computed(() => (lockedUntil.value ? Math.max(Math.ceil((lockedUntil.value - now.value) / 1000), 0) : 0))
  const locked = computed(() => secondsLeft.value > 0)

  if (import.meta.client) {
    // One clock while locked; it stops itself when the wait is over.
    const timer = setInterval(() => {
      if (!lockedUntil.value) return
      now.value = Date.now()
      if (now.value >= lockedUntil.value) {
        lockedUntil.value = null
        lockReason.value = null
      }
    }, 1000)
    onBeforeUnmount(() => clearInterval(timer))
  }

  const available = computed(() => status.value?.enabled === true)
  const unavailableReason = computed(() => {
    if (status.value && !status.value.enabled) return 'AI is not set up on this server. Add GROQ_API_KEY to the API’s .env.'
    return null
  })

  async function generate(input: GenerateTestInput): Promise<GeneratedTest | null> {
    generating.value = true
    error.value = null
    try {
      return await $api<GeneratedTest>('/ai/generate-test', { method: 'POST', body: input })
    } catch (e) {
      const data = (e as { data?: ApiErrorBody }).data
      const code = data?.code ?? null
      error.value = { code, message: errorMessage(e) }
      if (code && LOCKING.includes(code)) {
        now.value = Date.now()
        lockedUntil.value = now.value + (data?.retryAfterSeconds ?? 60) * 1000
        lockReason.value = code
      }
      return null
    } finally {
      generating.value = false
    }
  }

  return { status, available, unavailableReason, generating, error, locked, lockReason, secondsLeft, generate }
}
