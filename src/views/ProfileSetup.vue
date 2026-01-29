<template>
  <div class="min-h-screen py-12 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-4xl font-bold text-slate-900 mb-2">Welcome, {{ userStore.currentUser.name }}</h1>
        <p class="text-slate-600">Let's set up your profile and avatar</p>
      </div>

      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Team Selection -->
        <div class="card p-8 card-hover animate-slide-in">
          <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <svg class="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Choose Your Team
          </h2>
          
          <div class="space-y-4">
            <button
              @click="handleTeamSelect('structure')"
              :class="[
                'w-full p-6 rounded-xl border-2 transition-all transform hover:scale-102',
                userStore.selectedTeam === 'structure' 
                  ? 'border-structure bg-structure/10 scale-102 shadow-lg' 
                  : 'border-slate-200 hover:border-structure/50 bg-white'
              ]"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-structure flex items-center justify-center animate-breathe">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div class="text-left flex-1">
                  <h3 class="font-bold text-lg text-slate-900">Structure Team</h3>
                  <p class="text-sm text-slate-600">Building the foundation</p>
                </div>
                <div v-if="userStore.selectedTeam === 'structure'" class="ml-auto">
                  <svg class="w-6 h-6 text-structure" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </button>

            <button
              @click="handleTeamSelect('program')"
              :class="[
                'w-full p-6 rounded-xl border-2 transition-all transform hover:scale-102',
                userStore.selectedTeam === 'program' 
                  ? 'border-program bg-program/10 scale-102 shadow-lg' 
                  : 'border-slate-200 hover:border-program/50 bg-white'
              ]"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-program flex items-center justify-center animate-breathe">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div class="text-left flex-1">
                  <h3 class="font-bold text-lg text-slate-900">Program Team</h3>
                  <p class="text-sm text-slate-600">Designing the experience</p>
                </div>
                <div v-if="userStore.selectedTeam === 'program'" class="ml-auto">
                  <svg class="w-6 h-6 text-program" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </button>

            <button
              @click="handleTeamSelect('data')"
              :class="[
                'w-full p-6 rounded-xl border-2 transition-all transform hover:scale-102',
                userStore.selectedTeam === 'data' 
                  ? 'border-data bg-data/10 scale-102 shadow-lg' 
                  : 'border-slate-200 hover:border-data/50 bg-white'
              ]"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-data flex items-center justify-center animate-breathe">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div class="text-left flex-1">
                  <h3 class="font-bold text-lg text-slate-900">Data Team</h3>
                  <p class="text-sm text-slate-600">Analyzing the insights</p>
                </div>
                <div v-if="userStore.selectedTeam === 'data'" class="ml-auto">
                  <svg class="w-6 h-6 text-data" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Avatar Lab -->
        <div class="card p-8 card-hover animate-slide-in" style="animation-delay: 0.1s;">
          <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <svg class="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Avatar Lab
          </h2>

          <!-- Blob Preview with Real-time Updates -->
          <div class="mb-8 flex items-center justify-center h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl relative overflow-hidden border border-slate-200">
            <UserAvatar size="140px" />
          </div>

          <!-- Real-time Controls -->
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-3 flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                  </svg>
                  Pulse Speed
                </span>
                <span class="text-blue-600 font-mono">{{ localAvatar.speed.toFixed(1) }}s</span>
              </label>
              <input
                v-model.number="localAvatar.speed"
                @input="updateAvatarPreview"
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div class="flex justify-between text-xs text-slate-500 mt-1">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-3 flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd" />
                  </svg>
                  Wobble Effect
                </span>
                <span class="text-purple-600 font-mono">{{ localAvatar.wobble }}%</span>
              </label>
              <input
                v-model.number="localAvatar.wobble"
                @input="updateAvatarPreview"
                type="range"
                min="0"
                max="100"
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div class="flex justify-between text-xs text-slate-500 mt-1">
                <span>Sharp</span>
                <span>Blurry</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-3 flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                  </svg>
                  Complexity
                </span>
                <span class="text-pink-600 font-mono">{{ localAvatar.complexity }}%</span>
              </label>
              <input
                v-model.number="localAvatar.complexity"
                @input="updateAvatarPreview"
                type="range"
                min="0"
                max="100"
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
              />
              <div class="flex justify-between text-xs text-slate-500 mt-1">
                <span>Simple</span>
                <span>Complex</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clip-rule="evenodd" />
                </svg>
                Shade
              </label>
              <div class="grid grid-cols-5 gap-2">
                <button
                  v-for="(shade, index) in getTeamShades()"
                  :key="index"
                  @click="localAvatar.shade = index; updateAvatarPreview()"
                  :class="[
                    'h-10 rounded-lg border-2 transition-all transform hover:scale-110',
                    localAvatar.shade === index 
                      ? 'border-slate-900 scale-110 shadow-lg' 
                      : 'border-slate-200'
                  ]"
                  :style="{ background: shade }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="mt-10 text-center animate-fade-in" style="animation-delay: 0.2s;">
        <button
          @click="enterStudio"
          :disabled="!userStore.selectedTeam"
          :class="[
            'px-10 py-4 text-lg font-medium rounded-xl transition-all transform shadow-lg',
            userStore.selectedTeam
              ? 'btn-primary'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          ]"
        >
          {{ userStore.selectedTeam ? 'Enter Studio' : 'Choose a Team First' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import UserAvatar from '@/components/UserAvatar.vue'

const router = useRouter()
const userStore = useUserStore()

// Local reactive avatar config for real-time preview
const localAvatar = reactive({
  speed: userStore.avatarConfig.speed,
  wobble: userStore.avatarConfig.wobble,
  complexity: userStore.avatarConfig.complexity,
  shade: userStore.avatarConfig.shade || 2,
})

function handleTeamSelect(team) {
  userStore.selectTeam(team)
}

function updateAvatarPreview() {
  // Real-time update to store
  userStore.updateAvatar(localAvatar)
}

function getTeamShades() {
  const team = userStore.selectedTeam
  const shades = {
    structure: [
      '#d1fae5',
      '#6ee7b7',
      '#10b981',
      '#059669',
      '#047857',
    ],
    program: [
      '#dbeafe',
      '#93c5fd',
      '#3b82f6',
      '#2563eb',
      '#1d4ed8',
    ],
    data: [
      '#fee2e2',
      '#fca5a5',
      '#ef4444',
      '#dc2626',
      '#b91c1c',
    ],
  }
  return shades[team] || shades.structure
}

function enterStudio() {
  if (userStore.selectedTeam) {
    userStore.updateAvatar(localAvatar)
    router.push('/dashboard')
  }
}

// Watch for external changes to avatar config
watch(() => userStore.avatarConfig, (newConfig) => {
  Object.assign(localAvatar, newConfig)
}, { deep: true })
</script>

<style scoped>
.blob-morphing {
  border-radius: 50%;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

/* Simple: Almost circular with minimal morphing */
.blob-simple {
  animation-name: morph-simple;
}

@keyframes morph-simple {
  0%, 100% {
    border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
  }
  25% {
    border-radius: 55% 45% 50% 50% / 50% 55% 45% 50%;
  }
  50% {
    border-radius: 50% 50% 45% 55% / 50% 50% 50% 50%;
  }
  75% {
    border-radius: 45% 55% 50% 50% / 55% 45% 50% 50%;
  }
}

/* Moderate: More organic with 4-6 distinct points */
.blob-moderate {
  animation-name: morph-moderate;
}

@keyframes morph-moderate {
  0%, 100% {
    border-radius: 60% 40% 55% 45% / 50% 55% 45% 50%;
  }
  20% {
    border-radius: 45% 55% 60% 40% / 55% 50% 50% 45%;
  }
  40% {
    border-radius: 55% 45% 40% 60% / 45% 60% 40% 55%;
  }
  60% {
    border-radius: 40% 60% 50% 50% / 60% 40% 55% 45%;
  }
  80% {
    border-radius: 50% 50% 45% 55% / 50% 55% 45% 60%;
  }
}

/* Complex: Very organic with 6-8 points */
.blob-complex {
  animation-name: morph-complex;
}

@keyframes morph-complex {
  0%, 100% {
    border-radius: 65% 35% 70% 30% / 40% 60% 35% 65%;
  }
  16% {
    border-radius: 35% 65% 40% 60% / 70% 30% 65% 35%;
  }
  33% {
    border-radius: 60% 40% 35% 65% / 30% 70% 40% 60%;
  }
  50% {
    border-radius: 40% 60% 65% 35% / 65% 35% 70% 30%;
  }
  66% {
    border-radius: 70% 30% 60% 40% / 35% 65% 30% 70%;
  }
  83% {
    border-radius: 30% 70% 40% 60% / 60% 40% 65% 35%;
  }
}

/* Extreme: Highly irregular with 8+ points */
.blob-extreme {
  animation-name: morph-extreme;
}

@keyframes morph-extreme {
  0%, 100% {
    border-radius: 73% 27% 80% 20% / 30% 75% 25% 70%;
  }
  12.5% {
    border-radius: 25% 75% 35% 65% / 80% 20% 70% 30%;
  }
  25% {
    border-radius: 70% 30% 25% 75% / 20% 80% 35% 65%;
  }
  37.5% {
    border-radius: 35% 65% 73% 27% / 75% 25% 80% 20%;
  }
  50% {
    border-radius: 80% 20% 65% 35% / 27% 73% 30% 70%;
  }
  62.5% {
    border-radius: 20% 80% 30% 70% / 65% 35% 75% 25%;
  }
  75% {
    border-radius: 75% 25% 70% 30% / 35% 65% 20% 80%;
  }
  87.5% {
    border-radius: 30% 70% 20% 80% / 73% 27% 65% 35%;
  }
}
</style>
