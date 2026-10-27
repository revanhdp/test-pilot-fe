<script setup lang="ts">
definePageMeta({ layout: 'auth', public: true, guestOnly: true })
useHead({ title: 'Create account · TestPilot AI' })
</script>

<template>
  <AuthClerkForm mode="sign-up" />
</template>
