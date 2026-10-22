/** Response shapes of the TestPilot API (backend/src). Dates arrive as ISO strings. */

export type EnvironmentType = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'CUSTOM'
export type TestPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type TestCategory =
  | 'FUNCTIONAL'
  | 'NEGATIVE'
  | 'EDGE_CASE'
  | 'REGRESSION'
  | 'ACCESSIBILITY'
  | 'SECURITY'
export type TestCaseStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
export type TestRunStatus = 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'ERROR'
export type TestResultStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'PASSED'
  | 'FAILED'
  | 'SKIPPED'
  | 'ERROR'
export type StepStatus = 'PASSED' | 'FAILED' | 'SKIPPED'

export interface User {
  id: string
  email: string
  name: string
}

export interface Project {
  id: string
  userId: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectListItem extends Project {
  _count: { environments: number; testCases: number; testRuns: number }
  testRuns: Pick<
    TestRun,
    'id' | 'number' | 'status' | 'totalTests' | 'passedTests' | 'failedTests' | 'createdAt'
  >[]
}

export interface Environment {
  id: string
  projectId: string
  name: string
  baseUrl: string
  type: EnvironmentType
  createdAt: string
  updatedAt: string
}

export interface TestSuite {
  id: string
  projectId: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  _count: { testCases: number }
}

export interface ProjectDetail extends Project {
  environments: Environment[]
  testSuites: TestSuite[]
  _count: { testCases: number; testRuns: number }
}

// ─── Steps ──────────────────────────────────────────────────────────────────

export type LocatorType = 'css' | 'text' | 'role' | 'label' | 'placeholder' | 'testId'

export interface Locator {
  type: LocatorType
  value: string
  name?: string
}

export type StepAction =
  | 'navigate'
  | 'click'
  | 'fill'
  | 'select'
  | 'check'
  | 'uncheck'
  | 'press'
  | 'wait'
  | 'assertVisible'
  | 'assertHidden'
  | 'assertText'
  | 'assertUrl'
  | 'assertTitle'

/** A step as sent to the API. */
export interface StepInput {
  action: StepAction
  target?: Locator
  value?: string
}

/** A stored step. */
export interface TestStepRecord {
  id: string
  order: number
  action: StepAction
  target: Locator | null
  value: string | null
}

// ─── Test cases ─────────────────────────────────────────────────────────────

interface TestCaseBase {
  id: string
  projectId: string
  suiteId: string
  number: number
  title: string
  description: string | null
  priority: TestPriority
  category: TestCategory
  expectedResult: string | null
  status: TestCaseStatus
  createdAt: string
  updatedAt: string
  suite: { id: string; name: string }
}

export interface TestCaseListItem extends TestCaseBase {
  _count: { steps: number }
  results: { id: string; status: TestResultStatus; finishedAt: string | null; testRunId: string }[]
}

export interface TestCaseDetail extends TestCaseBase {
  steps: TestStepRecord[]
  project: { id: string; name: string }
  createdBy: { id: string; name: string } | null
  results: {
    id: string
    status: TestResultStatus
    durationMs: number | null
    errorMessage: string | null
    createdAt: string
    testRun: { id: string; number: number; environmentName: string }
  }[]
}

// ─── Runs ───────────────────────────────────────────────────────────────────

export interface TestRun {
  id: string
  projectId: string
  environmentId: string | null
  number: number
  status: TestRunStatus
  browser: string
  environmentName: string
  baseUrl: string
  errorMessage: string | null
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests: number
  triggeredById: string | null
  createdAt: string
  startedAt: string | null
  finishedAt: string | null
}

export interface TestRunListItem extends TestRun {
  triggeredBy: { id: string; name: string } | null
}

export interface ArtifactRef {
  id: string
  type: 'SCREENSHOT' | 'VIDEO' | 'TRACE' | 'CONSOLE_LOG' | 'NETWORK_LOG' | 'DOM_SNAPSHOT'
  mimeType: string
  sizeBytes: number | null
}

export interface TestCaseSnapshot {
  key: string
  title: string
  suiteName: string
  priority: TestPriority
  category: TestCategory
  expectedResult: string | null
  steps: (StepInput & { order: number })[]
}

export interface StepOutcome {
  order: number
  status: StepStatus
  durationMs: number
  error?: string
}

export interface TestResult {
  id: string
  testRunId: string
  testCaseId: string | null
  position: number
  status: TestResultStatus
  durationMs: number | null
  errorMessage: string | null
  failedStep: number | null
  testCaseSnapshot: TestCaseSnapshot
  stepResults: StepOutcome[] | null
  finalUrl: string | null
  pageTitle: string | null
  createdAt: string
  startedAt: string | null
  finishedAt: string | null
  artifacts: ArtifactRef[]
}

export interface TestRunDetail extends TestRun {
  project: { id: string; name: string }
  triggeredBy: { id: string; name: string } | null
  results: TestResult[]
}

// ─── Overview ───────────────────────────────────────────────────────────────

export interface TestCaseRef {
  key: string
  title: string
}

export interface Overview {
  stats: {
    projects: number
    testCases: number
    runs: number
    windowDays: number
    testsExecuted: number
    passRate: number | null
  }
  activeRuns: (TestRun & {
    project: { id: string; name: string }
    results: {
      id: string
      status: TestResultStatus
      position: number
      durationMs: number | null
      testCase: TestCaseRef
    }[]
  })[]
  recentRuns: (TestRun & { project: { id: string; name: string } })[]
  recentFailures: {
    id: string
    status: TestResultStatus
    errorMessage: string | null
    failedStep: number | null
    finishedAt: string | null
    testCase: TestCaseRef
    testRun: {
      id: string
      number: number
      environmentName: string
      project: { id: string; name: string }
    }
  }[]
  health: (Pick<
    TestRun,
    | 'id'
    | 'number'
    | 'status'
    | 'totalTests'
    | 'passedTests'
    | 'failedTests'
    | 'skippedTests'
    | 'createdAt'
  > & { project: { name: string } })[]
}

/** Error body for 400 responses from the validation pipe. */
export interface ApiErrorBody {
  statusCode: number
  message: string | string[]
  issues?: { path: string; message: string }[]
}
