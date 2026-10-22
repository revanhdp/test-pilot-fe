import type { Locator, LocatorType, StepAction, StepInput } from '~/types/api'

export type ActionGroup = 'Navigation' | 'Interaction' | 'Assertion'

export interface ActionMeta {
  label: string
  group: ActionGroup
  target: 'required' | 'optional' | 'none'
  value: { label: string; placeholder: string; mono?: boolean; type?: 'text' | 'number' } | null
  hint?: string
}

/** Mirrors backend/src/test-steps/test-step.schema.ts. */
export const ACTIONS: Record<StepAction, ActionMeta> = {
  navigate: {
    label: 'Navigate',
    group: 'Navigation',
    target: 'none',
    value: { label: 'URL or path', placeholder: '/login', mono: true },
    hint: 'Paths resolve against the environment base URL. Other origins are blocked.',
  },
  click: { label: 'Click', group: 'Interaction', target: 'required', value: null },
  fill: {
    label: 'Fill',
    group: 'Interaction',
    target: 'required',
    value: { label: 'Text', placeholder: 'Value to type' },
  },
  select: {
    label: 'Select option',
    group: 'Interaction',
    target: 'required',
    value: { label: 'Option', placeholder: 'Option value or label' },
  },
  check: { label: 'Check', group: 'Interaction', target: 'required', value: null },
  uncheck: { label: 'Uncheck', group: 'Interaction', target: 'required', value: null },
  press: {
    label: 'Press key',
    group: 'Interaction',
    target: 'optional',
    value: { label: 'Key', placeholder: 'Enter', mono: true },
    hint: 'Without a target, the key is sent to the page.',
  },
  wait: {
    label: 'Wait',
    group: 'Interaction',
    target: 'none',
    value: { label: 'Milliseconds', placeholder: '1000', mono: true, type: 'number' },
  },
  assertVisible: { label: 'Expect visible', group: 'Assertion', target: 'required', value: null },
  assertHidden: { label: 'Expect hidden', group: 'Assertion', target: 'required', value: null },
  assertText: {
    label: 'Expect text',
    group: 'Assertion',
    target: 'required',
    value: { label: 'Contains', placeholder: 'Expected text' },
  },
  assertUrl: {
    label: 'Expect URL',
    group: 'Assertion',
    target: 'none',
    value: { label: 'Contains', placeholder: '/dashboard', mono: true },
  },
  assertTitle: {
    label: 'Expect title',
    group: 'Assertion',
    target: 'none',
    value: { label: 'Contains', placeholder: 'Page title' },
  },
}

export const ACTION_GROUPS: { group: ActionGroup; actions: StepAction[] }[] = (
  ['Navigation', 'Interaction', 'Assertion'] as const
).map((group) => ({
  group,
  actions: (Object.keys(ACTIONS) as StepAction[]).filter((a) => ACTIONS[a].group === group),
}))

export const LOCATOR_TYPES: Record<LocatorType, { label: string; placeholder: string }> = {
  role: { label: 'Role', placeholder: 'button' },
  label: { label: 'Label', placeholder: 'Email' },
  text: { label: 'Text', placeholder: 'Sign in' },
  placeholder: { label: 'Placeholder', placeholder: 'Search…' },
  testId: { label: 'Test ID', placeholder: 'submit-button' },
  css: { label: 'CSS', placeholder: '#login' },
}

export function describeLocator(locator: Locator | null | undefined): string {
  if (!locator) return 'page'
  switch (locator.type) {
    case 'css':
      return locator.value
    case 'role':
      return locator.name ? `${locator.value} "${locator.name}"` : `${locator.value}`
    case 'label':
      return `field "${locator.value}"`
    case 'placeholder':
      return `placeholder "${locator.value}"`
    case 'testId':
      return `[data-testid=${locator.value}]`
    case 'text':
      return `text "${locator.value}"`
  }
}

/** One-line, human description of a step for timelines. */
export function describeStep(step: StepInput): { verb: string; subject: string; detail?: string } {
  const target = describeLocator(step.target)
  const value = step.value ?? ''
  switch (step.action) {
    case 'navigate':
      return { verb: 'Open', subject: value }
    case 'click':
      return { verb: 'Click', subject: target }
    case 'fill':
      return { verb: 'Fill', subject: target, detail: value === '' ? '(empty)' : `"${value}"` }
    case 'select':
      return { verb: 'Select', subject: target, detail: `"${value}"` }
    case 'check':
      return { verb: 'Check', subject: target }
    case 'uncheck':
      return { verb: 'Uncheck', subject: target }
    case 'press':
      return { verb: 'Press', subject: value, detail: step.target ? `on ${target}` : undefined }
    case 'wait':
      return { verb: 'Wait', subject: `${value} ms` }
    case 'assertVisible':
      return { verb: 'Expect visible', subject: target }
    case 'assertHidden':
      return { verb: 'Expect hidden', subject: target }
    case 'assertText':
      return { verb: 'Expect text', subject: target, detail: `contains "${value}"` }
    case 'assertUrl':
      return { verb: 'Expect URL', subject: `contains "${value}"` }
    case 'assertTitle':
      return { verb: 'Expect title', subject: `contains "${value}"` }
  }
}

/** Editor row. `key` keeps Vue's list identity stable while reordering. */
export interface StepDraft {
  key: string
  action: StepAction
  target: Locator
  value: string
}

let draftCounter = 0
const nextKey = () => `step-${++draftCounter}`

export function blankStep(action: StepAction = 'click'): StepDraft {
  return {
    key: nextKey(),
    action,
    target: { type: action === 'click' ? 'role' : 'label', value: '', name: '' },
    value: '',
  }
}

export function toDraft(step: { action: StepAction; target: Locator | null | undefined; value: string | null | undefined }): StepDraft {
  return {
    key: nextKey(),
    action: step.action,
    target: step.target
      ? { type: step.target.type, value: step.target.value, name: step.target.name ?? '' }
      : { type: 'css', value: '', name: '' },
    value: step.value ?? '',
  }
}

/** Editor row → API payload, sending only the fields the action uses. */
export function toStepInput(draft: StepDraft): StepInput {
  const meta = ACTIONS[draft.action]
  const step: StepInput = { action: draft.action }
  const hasTarget = draft.target.value.trim() !== ''
  if (meta.target === 'required' || (meta.target === 'optional' && hasTarget)) {
    step.target = {
      type: draft.target.type,
      value: draft.target.value,
      ...(draft.target.type === 'role' && draft.target.name?.trim() && { name: draft.target.name }),
    }
  }
  if (meta.value) step.value = draft.value
  return step
}
