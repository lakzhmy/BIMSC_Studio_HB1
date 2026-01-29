<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <div class="h-16 px-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold">Lung Tower Studio</h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-100">
            <UserAvatar size="32px" />
            <div class="text-sm">
              <p class="font-semibold">{{ userStore.currentUser.name }}</p>
              <p class="text-xs text-slate-600 capitalize">{{ userStore.selectedTeam }} Team</p>
            </div>
          </div>
          <button @click="$router.push('/profile')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium">Profile</button>
          <button @click="handleLogout" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium">Logout</button>
        </div>
      </div>
      <div class="border-t px-6 flex gap-1 overflow-x-auto border-slate-200">
        <router-link v-for="item in navigationItems" :key="item.path" :to="item.path" :class="['px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap', isActiveRoute(item.path) ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900']">{{ item.label }}</router-link>
      </div>
    </header>
    <main class="py-8 px-6">
      <div class="max-w-7xl mx-auto space-y-6">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="kpi in kpiMetrics" :key="kpi.id" class="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-slate-700 mb-1">{{ kpi.name }}</h3>
                <p class="text-xs text-slate-500">{{ kpi.description }}</p>
              </div>
              <div :class="['w-2 h-2 rounded-full flex-shrink-0 mt-1', kpi.status === 'good' ? 'bg-green-500' : kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500']"></div>
            </div>
            <div class="space-y-3">
              <div class="flex items-end gap-2">
                <div class="text-3xl font-bold text-slate-900">{{ kpi.value }}</div>
                <div class="text-sm text-slate-600 mb-1">{{ kpi.unit }}</div>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex-1">
                  <div class="text-xs text-slate-500 mb-1">Target: {{ kpi.target }} {{ kpi.unit }}</div>
                  <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700" :class="getKPIColor(kpi.status)" :style="{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }"></div>
                  </div>
                </div>
                <div :class="['text-xs font-medium px-2 py-1 rounded-full', kpi.changePercent < 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700']">{{ kpi.changePercent > 0 ? '+' : '' }}{{ kpi.changePercent }}%</div>
              </div>
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <svg class="w-4 h-4" :class="kpi.trend === 'up' ? 'text-blue-600' : kpi.trend === 'down' ? 'text-green-600' : 'text-slate-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="kpi.trend === 'up'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  <path v-else-if="kpi.trend === 'down'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
                </svg>
                <span class="capitalize">{{ kpi.trend }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import UserAvatar from '@/components/UserAvatar.vue'
import { kpiMetrics } from '@/data/sampleData'

const router = useRouter()
const userStore = useUserStore()

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/kpi', label: 'KPI Dashboard' },
  { path: '/meetings', label: 'Meetings' },
  { path: '/actions', label: 'Actions' },
  { path: '/viewer', label: '3D Viewer' },
  { path: '/teams', label: 'Teams' },
]

function isActiveRoute(path) {
  return router.currentRoute.value.path === path
}

function handleLogout() {
  userStore.logout()
  router.push('/')
}

function getKPIColor(status) {
  return { good: 'bg-green-500', warning: 'bg-yellow-500', critical: 'bg-red-500' }[status] || 'bg-slate-500'
}
</script>

<style scoped>
</style>
