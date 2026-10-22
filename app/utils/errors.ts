import type { ApiErrorBody } from '~/types/api'

function body(error: unknown): ApiErrorBody | undefined {
  if (error && typeof error === 'object' && 'data' in error) {
    return (error as { data?: ApiErrorBody }).data
  }
  return undefined
}

/** A user-facing message for any API or network error. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const data = body(error)
  if (data?.issues?.length) return data.issues[0]!.message
  if (Array.isArray(data?.message)) return data.message[0] ?? fallback
  if (typeof data?.message === 'string') return data.message
  if (error && typeof error === 'object' && 'statusCode' in error && !data) {
    return 'Could not reach the TestPilot API.'
  }
  return fallback
}

/** Field-level validation messages keyed by path ("baseUrl", "steps.2.target.value"). */
export function fieldErrors(error: unknown): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of body(error)?.issues ?? []) {
    errors[issue.path] ??= issue.message
  }
  return errors
}
