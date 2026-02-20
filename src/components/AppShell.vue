<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Floating Bubble Particles Background -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div
        v-for="i in 15"
        :key="i"
        class="bubble animate-bubble-rise opacity-100"
        :style="{
          left: `${Math.random() * 100}%`,
          width: `${30 + Math.random() * 80}px`,
          height: `${30 + Math.random() * 80}px`,
          animationDelay: `${Math.random() * 8}s`,
          animationDuration: `${12 + Math.random() * 8}s`
        }"
      />
    </div>

    <!-- Main Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <div class="h-16 px-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold">Lung Tower Studio</h1>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-100">
            <img
              v-if="userStore.currentUser.photoURL"
              :src="userStore.currentUser.photoURL"
              :alt="userStore.currentUser.name"
              class="w-8 h-8 rounded-full object-cover"
              referrerpolicy="no-referrer"
            />
            <UserAvatar v-else size="32px" />
            <div class="text-sm">
              <p class="font-semibold">{{ userStore.currentUser.name }}</p>
              <p class="text-slate-600 text-xs capitalize">{{ userStore.selectedTeam }} Team</p>
            </div>
          </div>

          <button
            @click="router.push('/profile')"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Profile
          </button>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="border-t px-6 flex gap-1 overflow-x-auto border-slate-200">
        <router-link
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2',
            isActiveRoute(item.path)
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          ]"
        >
          <component v-if="item.icon" :is="item.icon" class="w-4 h-4" />
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </header>

    <main class="relative z-10">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { BarChart3, Calendar, LayoutDashboard, Monitor, Zap } from 'lucide-vue-next'
import UserAvatar from '@/components/UserAvatar.vue'
import { projectHealth as projectHealthData } from '@/data/sampleData'

const router = useRouter()
const userStore = useUserStore()

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'KPI', path: '/kpi', icon: BarChart3 },
  { label: 'Timeline', path: '/timeline', icon: Calendar },
  { label: 'Viewer', path: '/viewer', icon: Monitor },
  { label: 'Stress Test', path: '/stress-test', icon: Zap }
]

function isActiveRoute(path) {
  return router.currentRoute.value.path === path
}

function handleLogout() {
  userStore.logout()
  router.push('/')
}
</script>
