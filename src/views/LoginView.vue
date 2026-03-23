<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Header with Breathing Blob Logo -->
      <div class="text-center mb-10">
        <div class="inline-block mb-6">
          <div
            class="w-32 h-32 rounded-full animate-breathing-blob mx-auto"
            style="
              background: linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #ef4444 100%);
              box-shadow: 0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(59, 130, 246, 0.2), 0 0 60px rgba(239, 68, 68, 0.1);
            "
          ></div>
        </div>
        <h1 class="text-5xl font-bold mb-3 text-slate-900">
          HB01 - The Lungs
        </h1>
        <p class="text-slate-600 text-lg">Sign in with your Google account</p>
      </div>

      <!-- Google Sign-In Card -->
      <div class="card p-8 animate-fade-in">
        <div v-if="authError" class="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-700">{{ authError }}</p>
        </div>

        <button
          id="tour-login-signin"
          @click="signIn"
          class="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span class="font-medium text-slate-700">Sign in with Google</span>
        </button>
      </div>

      <!-- Public tower link -->
      <div class="text-center mt-6">
        <router-link
          id="tour-login-explore"
          to="/tower"
          class="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          Explore the Tower →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()

const errorMessages = {
  access_denied: 'Sign-in was cancelled.',
  token_exchange_failed: 'Authentication failed. Please try again.',
  userinfo_failed: 'Could not retrieve your profile. Please try again.',
  server_error: 'A server error occurred. Please try again.',
  no_code: 'Authentication failed. Please try again.',
}

const authError = ref(
  route.query.error
    ? errorMessages[route.query.error] || 'Sign-in failed. Please try again.'
    : ''
)

function signIn() {
  window.location.href = '/auth/google'
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-in;
}

.animate-breathing-blob {
  animation: breathingBlob 4s ease-in-out infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes breathingBlob {
  0%, 100% {
    transform: scale(1);
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    box-shadow: 0 20px 60px rgba(99, 102, 241, 0.3);
  }
  25% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
  }
  50% {
    transform: scale(1.1);
    border-radius: 50% 50% 30% 70% / 30% 50% 70% 50%;
    box-shadow: 0 25px 70px rgba(99, 102, 241, 0.4);
  }
  75% {
    border-radius: 70% 30% 50% 50% / 60% 40% 60% 40%;
  }
}
</style>
