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
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-slate-900">3D Building Viewer</h1>
          <p class="text-slate-600 mt-1">Interactive architectural visualization</p>
        </div>
        <div class="bg-white rounded-lg border border-slate-200 overflow-hidden aspect-video flex items-center justify-center">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 class="text-lg font-semibold text-slate-900 mb-1">3D Viewer Coming Soon</h3>
            <p class="text-slate-600">Interactive 3D visualization will be available shortly</p>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 mt-6">
          <div class="bg-white p-4 rounded-lg border border-slate-200">
            <h4 class="font-semibold text-slate-900 mb-2">Controls</h4>
            <ul class="text-sm text-slate-600 space-y-1">
              <li>• Drag to rotate</li>
              <li>• Scroll to zoom</li>
              <li>• Right-click to pan</li>
            </ul>
          </div>
          <div class="bg-white p-4 rounded-lg border border-slate-200">
            <h4 class="font-semibold text-slate-900 mb-2">Layers</h4>
            <ul class="text-sm text-slate-600 space-y-1">
              <li>✓ Structure</li>
              <li>✓ MEP Systems</li>
              <li>✓ Interiors</li>
            </ul>
          </div>
          <div class="bg-white p-4 rounded-lg border border-slate-200">
            <h4 class="font-semibold text-slate-900 mb-2">Features</h4>
            <ul class="text-sm text-slate-600 space-y-1">
              <li>✓ Measurements</li>
              <li>✓ Annotations</li>
              <li>✓ Export</li>
            </ul>
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
</script>

<style scoped>
</style>
