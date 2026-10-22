import type {
  EnvironmentType,
  TestCategory,
  TestPriority,
  TestResultStatus,
  TestRunStatus,
} from '~/types/api'

/** Outcome colors. `neutral` is everything that is not a verdict. */
export type Tone = 'pass' | 'fail' | 'warn' | 'skip' | 'run' | 'neutral'

type Status = TestRunStatus | TestResultStatus

/** `tag` is the short, test-runner style label (PASS, FAIL…). */
export const STATUS_META: Record<Status, { label: string; tag: string; tone: Tone }> = {
  PENDING: { label: 'Queued', tag: 'QUEUED', tone: 'neutral' },
  RUNNING: { label: 'Running', tag: 'RUNNING', tone: 'run' },
  PASSED: { label: 'Passed', tag: 'PASS', tone: 'pass' },
  FAILED: { label: 'Failed', tag: 'FAIL', tone: 'fail' },
  SKIPPED: { label: 'Skipped', tag: 'SKIP', tone: 'skip' },
  ERROR: { label: 'Error', tag: 'ERROR', tone: 'warn' },
}

export function isActiveStatus(status: Status): boolean {
  return status === 'PENDING' || status === 'RUNNING'
}

/** Tailwind classes per tone. Kept literal so Tailwind can see them. */
export const TONE_CLASSES: Record<Tone, { text: string; border: string; solid: string }> = {
  pass: { text: 'text-pass', border: 'border-pass/40', solid: 'bg-pass text-canvas' },
  fail: { text: 'text-fail', border: 'border-fail/40', solid: 'bg-fail text-canvas' },
  warn: { text: 'text-warn', border: 'border-warn/40', solid: 'bg-warn text-canvas' },
  skip: { text: 'text-skip', border: 'border-skip/40', solid: 'bg-skip text-canvas' },
  run: { text: 'text-run', border: 'border-run/40', solid: 'bg-run text-canvas' },
  neutral: { text: 'text-fg-muted', border: 'border-line-strong', solid: 'bg-overlay text-fg-muted' },
}

/** Priority is shown as a level (1–4 bars), not a color: color means outcome. */
export const PRIORITY_META: Record<TestPriority, { label: string; level: 1 | 2 | 3 | 4 }> = {
  CRITICAL: { label: 'Critical', level: 4 },
  HIGH: { label: 'High', level: 3 },
  MEDIUM: { label: 'Medium', level: 2 },
  LOW: { label: 'Low', level: 1 },
}

export const CATEGORY_LABELS: Record<TestCategory, string> = {
  FUNCTIONAL: 'Functional',
  NEGATIVE: 'Negative',
  EDGE_CASE: 'Edge case',
  REGRESSION: 'Regression',
  ACCESSIBILITY: 'Accessibility',
  SECURITY: 'Security',
}

export const ENVIRONMENT_TYPE_LABELS: Record<EnvironmentType, string> = {
  DEVELOPMENT: 'Development',
  STAGING: 'Staging',
  PRODUCTION: 'Production',
  CUSTOM: 'Custom',
}

/** Production is the one environment worth a caution color. */
export const ENVIRONMENT_TYPE_TONES: Record<EnvironmentType, Tone> = {
  DEVELOPMENT: 'neutral',
  STAGING: 'neutral',
  PRODUCTION: 'warn',
  CUSTOM: 'neutral',
}

export const optionsFrom = <K extends string>(labels: Record<K, string>) =>
  (Object.keys(labels) as K[]).map((value) => ({ value, label: labels[value] }))
