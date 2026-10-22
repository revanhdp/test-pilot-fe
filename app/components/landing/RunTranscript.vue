<script setup lang="ts">
import type { TestResultStatus } from '~/types/api'

/** A static run report, printed the way a test runner prints one. */
const results: { status: TestResultStatus; key: string; title: string; duration: string }[] = [
  { status: 'PASSED', key: 'TC-AUTH-001', title: 'Valid login', duration: '1.24 s' },
  { status: 'PASSED', key: 'TC-AUTH-002', title: 'Invalid password', duration: '0.91 s' },
  { status: 'FAILED', key: 'TC-BOOK-004', title: 'Invalid payment', duration: '4.07 s' },
  { status: 'PASSED', key: 'TC-BOOK-005', title: 'Valid booking', duration: '3.32 s' },
  { status: 'SKIPPED', key: 'TC-BOOK-006', title: 'Cancel within 24 hours', duration: '' },
]
</script>

<template>
  <div class="w-full max-w-[34rem] font-mono text-[12.5px] leading-relaxed" aria-hidden="true">
    <p class="text-fg-subtle">
      <span class="text-fg">Run #128</span> · Hotel Booking · Staging · chromium
    </p>
    <ul class="mt-5 space-y-2">
      <li v-for="result in results" :key="result.key">
        <div class="flex items-center gap-3">
          <RunStatusBadge :status="result.status" class="w-12 justify-center" />
          <span class="text-fg-subtle">{{ result.key }}</span>
          <span class="min-w-0 flex-1 truncate font-sans text-[13px] text-fg">{{ result.title }}</span>
          <span class="text-fg-subtle tabular-nums">{{ result.duration }}</span>
        </div>
        <dl v-if="result.status === 'FAILED'" class="mt-2 mb-1 ml-[3.75rem] grid grid-cols-[4.5rem_minmax(0,1fr)] border-l-2 border-fail py-0.5 pl-3 text-[12px]">
          <dt class="text-fg-subtle">expected</dt>
          <dd class="text-fg-muted">validation message "Card number is invalid"</dd>
          <dt class="text-fg-subtle">actual</dt>
          <dd class="text-fail">POST /api/payments → HTTP 500</dd>
          <dt class="text-fg-subtle">at</dt>
          <dd class="text-fg-muted">step 4 · expect text role=alert</dd>
        </dl>
      </li>
    </ul>
    <p class="mt-6 border-t border-line pt-4 tabular-nums">
      <span class="text-pass">34 passed</span>
      <span class="text-fg-subtle"> · </span>
      <span class="text-fail">6 failed</span>
      <span class="text-fg-subtle"> · 2 skipped · 42 total · 2m 51s</span>
    </p>
  </div>
</template>
