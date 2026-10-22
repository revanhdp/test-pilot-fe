<template>
  <div class="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-12">
    <div class="grid-backdrop pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]" />
    <div class="pointer-events-none absolute top-[-20%] left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-accent-strong/15 blur-[120px]" />
    <div class="relative w-full max-w-sm">
      <NuxtLink to="/" class="mb-8 flex justify-center"><AppLogo /></NuxtLink>
      <slot />
    </div>
  </div>
</template>
