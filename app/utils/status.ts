import type {
  EnvironmentType,
  TestCategory,
  TestPriority,
  TestResultStatus,
  TestRunStatus,
} from '~/types/api'

export type Tone = 'pass' | 'fail' | 'warn' | 'skip' | 'run' | 'accent' | 'neutral'

type Status = TestRunStatus | TestResultStatus

export const STATUS_META: Record<Status, { label: string; tone: Tone }> = {
  PENDING: { label: 'Queued', tone: 'neutral' },
  RUNNING: { label: 'Running', tone: 'run' },
  PASSED: { label: 'Passed', tone: 'pass' },
  FAILED: { label: 'Failed', tone: 'fail' },
  SKIPPED: { label: 'Skipped', tone: 'skip' },
  ERROR: { label: 'Error', tone: 'warn' },
}

export function isActiveStatus(status: Status): boolean {
  return status === 'PENDING' || status === 'RUNNING'
}

/** Tailwind classes per tone. Kept literal so Tailwind can see them. */
export const TONE_CLASSES: Record<Tone, { text: string; bg: string; border: string; dot: string }> = {
  pass: { text: 'text-pass', bg: 'bg-pass/10', border: 'border-pass/25', dot: 'bg-pass' },
  fail: { text: 'text-fail', bg: 'bg-fail/10', border: 'border-fail/25', dot: 'bg-fail' },
  warn: { text: 'text-warn', bg: 'bg-warn/10', border: 'border-warn/25', dot: 'bg-warn' },
  skip: { text: 'text-skip', bg: 'bg-skip/10', border: 'border-skip/25', dot: 'bg-skip' },
  run: { text: 'text-run', bg: 'bg-run/10', border: 'border-run/25', dot: 'bg-run' },
  accent: { text: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/25', dot: 'bg-accent' },
  neutral: { text: 'text-fg-muted', bg: 'bg-overlay', border: 'border-line-strong', dot: 'bg-fg-subtle' },
}

export const PRIORITY_META: Record<TestPriority, { label: string; tone: Tone }> = {
  CRITICAL: { label: 'Critical', tone: 'fail' },
  HIGH: { label: 'High', tone: 'warn' },
  MEDIUM: { label: 'Medium', tone: 'run' },
  LOW: { label: 'Low', tone: 'neutral' },
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

export const ENVIRONMENT_TYPE_TONES: Record<EnvironmentType, Tone> = {
  DEVELOPMENT: 'run',
  STAGING: 'accent',
  PRODUCTION: 'warn',
  CUSTOM: 'neutral',
}

export const optionsFrom = <K extends string>(labels: Record<K, string>) =>
  (Object.keys(labels) as K[]).map((value) => ({ value, label: labels[value] }))
