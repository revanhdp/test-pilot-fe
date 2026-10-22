<template>
  <div class="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
    <div class="flex flex-col px-6 py-6 sm:px-10">
      <NuxtLink to="/" class="w-fit rounded-sm"><AppLogo /></NuxtLink>
      <div class="flex flex-1 items-center justify-center py-12">
        <div class="w-full max-w-[22rem]">
          <slot />
        </div>
      </div>
      <p class="text-xs text-fg-subtle">Browser tests that decide pass or fail in a real Chromium.</p>
    </div>
    <div class="hidden items-center justify-center border-l border-line bg-surface px-12 lg:flex">
      <LandingRunTranscript />
    </div>
  </div>
</template>
