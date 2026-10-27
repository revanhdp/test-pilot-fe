<script setup lang="ts">
definePageMeta({ layout: 'auth', public: true, guestOnly: true })
useHead({ title: 'Sign in · TestPilot AI' })
</script>

<template>
  <AuthClerkForm mode="sign-in" />
</template>
