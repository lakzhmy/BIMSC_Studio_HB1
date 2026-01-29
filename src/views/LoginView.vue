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
        <p class="text-slate-600 text-lg">Sign in with IAAC email</p>
      </div>

      <!-- Login Form - Simplified -->
      <div class="card p-8 animate-fade-in">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="your.name@iaac.net"
              class="input-field"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-2">
              Team Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="Enter team password"
              class="input-field"
            />
          </div>

          <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700">{{ errorMessage }}</p>
          </div>

          <button
            type="submit"
            class="w-full btn-primary"
            :disabled="!email || !password"
          >
            Enter Studio →
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const errorMessage = ref('')

function handleLogin() {
  errorMessage.value = ''
  
  // Validate password
  if (password.value !== 'lungskey') {
    errorMessage.value = 'Incorrect password. Please contact your team lead.'
    return
  }
  
  // Validate IAAC email
  if (!email.value.toLowerCase().endsWith('@students.iaac.net')) {
    errorMessage.value = 'Please use your @students.iaac.net email address.'
    return
  }
  
  if (email.value && password.value === 'lungskey') {
    userStore.login(email.value)
    router.push('/profile')
  }
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
