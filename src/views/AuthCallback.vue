<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
    <div class="text-center">
      <div class="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p v-if="errorMessage" class="text-red-600">{{ errorMessage }}</p>
      <p v-else class="text-slate-600">Completing sign-in...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const errorMessage = ref('')

onMounted(() => {
  const email = route.query.email

  if (!email) {
    errorMessage.value = 'Sign-in failed: no email received.'
    setTimeout(() => router.push('/'), 3000)
    return
  }

  userStore.login({
    googleId: route.query.google_id || '',
    email,
    verifiedEmail: route.query.verified_email || 'false',
    name: route.query.name || '',
    givenName: route.query.given_name || '',
    familyName: route.query.family_name || '',
    photoURL: route.query.picture || '',
    locale: route.query.locale || '',
  })
  router.replace('/profile')
})
</script>
