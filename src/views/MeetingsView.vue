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
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">Meetings</h1>
            <p class="text-slate-600 mt-1">Team coordination and discussions</p>
          </div>
          <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">Schedule Meeting</button>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="meeting in meetings" :key="meeting.id" class="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-slate-900">{{ meeting.title }}</h3>
                <p class="text-sm text-slate-600 mt-1">{{ meeting.description }}</p>
              </div>
              <span :class="['px-3 py-1 rounded-full text-xs font-medium', meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : meeting.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700']">{{ meeting.status }}</span>
            </div>
            <div class="space-y-2 text-sm text-slate-600">
              <div class="flex items-center gap-2">
                <span class="text-slate-500">📅</span>
                <span>{{ meeting.date }} at {{ meeting.time }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500">👥</span>
                <span>{{ meeting.attendees.length }} attendees</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500">📍</span>
                <span>{{ meeting.location }}</span>
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
import { meetings } from '@/data/sampleData'

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
