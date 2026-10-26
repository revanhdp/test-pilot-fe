export function tcKey(number: number): string {
  return `TC-${number}`
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms} ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 2 : 1)} s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${Math.round(seconds % 60)}s`
}

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—'
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000
  if (Math.abs(seconds) < 45) return 'just now'
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return relative.format(Math.round(seconds / 60), 'minute')
}

const dateTime = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTime.format(new Date(iso)) : '—'
}

export function formatPercent(ratio: number | null | undefined, digits = 0): string {
  return ratio == null ? '—' : `${(ratio * 100).toFixed(digits)}%`
}

/** Pass rate of a run over executed (non-skipped) tests. */
export function runPassRate(run: {
  passedTests: number
  failedTests: number
}): number | null {
  const executed = run.passedTests + run.failedTests
  return executed > 0 ? run.passedTests / executed : null
}

export function runDuration(run: {
  startedAt: string | null
  finishedAt: string | null
}): number | null {
  if (!run.startedAt) return null
  const end = run.finishedAt ? new Date(run.finishedAt).getTime() : Date.now()
  return end - new Date(run.startedAt).getTime()
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

/** "https://staging.example.com/app" → "staging.example.com/app" */
export function prettyUrl(url: string | null | undefined): string {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

/** "1 run", "3 runs". */
export function plural(count: number, word: string): string {
  return `${count.toLocaleString()} ${word}${count === 1 ? '' : 's'}`
}

/** "45 s", "1:13", "14 min", "1 h 2 min": how long to wait, for people. Ticks visibly under ten minutes. */
export function formatWait(seconds: number): string {
  const whole = Math.max(Math.ceil(seconds), 1)
  if (whole < 60) return `${whole} s`
  if (whole < 600) return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
  const minutes = Math.ceil(whole / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  return minutes % 60 ? `${hours} h ${minutes % 60} min` : `${hours} h`
}
