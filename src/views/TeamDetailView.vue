<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <div class="h-16 px-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <router-link to="/teams" class="text-slate-600 hover:text-slate-900">← Teams</router-link>
          <div class="w-12 h-12 rounded-xl" :style="{ background: `linear-gradient(135deg, ${teamData.color} 0%, ${teamData.colorDark} 100%)` }"></div>
          <div>
            <h1 class="text-2xl font-bold">{{ teamData.name }}</h1>
            <p class="text-sm text-slate-600">{{ teamData.description }}</p>
          </div>
        </div>
        <router-link to="/teams" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium">Back</router-link>
      </div>
    </header>

    <main class="py-8 px-6">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Quick Stats -->
        <div class="grid md:grid-cols-4 gap-4">
          <div class="bg-white p-6 rounded-lg border border-slate-200">
            <div class="text-3xl font-bold text-slate-900">{{ teamMembers.length }}</div>
            <div class="text-sm text-slate-600 mt-2">Team Members</div>
          </div>
          <div class="bg-white p-6 rounded-lg border border-slate-200">
            <div class="text-3xl font-bold text-slate-900">{{ teamMeetings.length }}</div>
            <div class="text-sm text-slate-600 mt-2">Meetings</div>
          </div>
          <div class="bg-white p-6 rounded-lg border border-slate-200">
            <div class="text-3xl font-bold text-slate-900">{{ pendingActions.length }}</div>
            <div class="text-sm text-slate-600 mt-2">Pending Actions</div>
          </div>
          <div class="bg-white p-6 rounded-lg border border-slate-200">
            <div class="text-3xl font-bold text-slate-900">{{ totalHours }}h</div>
            <div class="text-sm text-slate-600 mt-2">Total Hours</div>
          </div>
        </div>

        <!-- Team Members Section -->
        <div class="bg-white p-6 rounded-lg border border-slate-200">
          <h2 class="text-xl font-bold text-slate-900 mb-6">Team Members</h2>
          <div v-if="teamMembers.length === 0" class="text-center py-8 text-slate-500">
            No team members yet
          </div>
          <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="member in teamMembers" :key="member.id" class="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 flex-shrink-0">
                  <MemberBlob :member="member" size="48px" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-semibold text-slate-900">{{ member.name }}</h4>
                  <p class="text-xs text-slate-600">{{ member.role }}</p>
                  <p v-if="member.mood" class="text-xs text-slate-500 italic">{{ member.mood }}</p>
                </div>
              </div>
              <div class="space-y-2">
                <div v-if="member.status" class="flex items-center gap-2">
                  <div :class="['w-2 h-2 rounded-full', member.status === 'online' ? 'bg-green-500' : 'bg-slate-300']"></div>
                  <span class="text-xs text-slate-600 capitalize">{{ member.status }}</span>
                </div>
                <div class="text-xs text-slate-600">
                  <span class="font-medium">{{ getTotalMemberHours(member.id) }}h</span> logged
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Meetings Section -->
        <div class="bg-white p-6 rounded-lg border border-slate-200">
          <h2 class="text-xl font-bold text-slate-900 mb-6">Meetings</h2>
          <div v-if="teamMeetings.length === 0" class="text-center py-8 text-slate-500">
            No meetings scheduled
          </div>
          <div v-else class="space-y-3">
            <div v-for="meeting in teamMeetings" :key="meeting.id" class="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-slate-900">{{ meeting.title }}</h3>
                <span v-if="meeting.status" :class="['text-xs px-2 py-1 rounded', meeting.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700']">
                  {{ meeting.status }}
                </span>
              </div>
              <p v-if="meeting.description" class="text-sm text-slate-600 mb-2">{{ meeting.description }}</p>
              <div class="flex gap-4 text-xs text-slate-500">
                <span v-if="meeting.date">📅 {{ meeting.date }}</span>
                <span v-if="meeting.time">⏰ {{ meeting.time }}</span>
                <span v-if="meeting.duration">⌛ {{ meeting.duration }}min</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Section -->
        <div class="bg-white p-6 rounded-lg border border-slate-200">
          <h2 class="text-xl font-bold text-slate-900 mb-6">Actions</h2>
          <div v-if="teamActions.length === 0" class="text-center py-8 text-slate-500">
            No actions
          </div>
          <div v-else class="space-y-3">
            <div v-for="action in teamActions" :key="action.id" class="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-slate-900">{{ action.title }}</h3>
                <select 
                  :value="action.status"
                  @change="updateStatus(action.id, $event.target.value)"
                  :class="['text-xs px-2 py-1 rounded border-0 font-medium cursor-pointer', getStatusColor(action.status)]"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <p v-if="action.description" class="text-sm text-slate-600 mb-2">{{ action.description }}</p>
              <div v-if="action.assignee" class="flex items-center gap-2 text-xs text-slate-600">
                <span class="font-medium">👤</span>
                <span>{{ action.assignee }}</span>
              </div>
              <div v-if="action.dueDate" class="flex items-center gap-2 text-xs text-slate-600 mt-1">
                <span class="font-medium">📅</span>
                <span>{{ action.dueDate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import MemberBlob from '@/components/MemberBlob.vue'
import { teams, meetings, actions } from '@/data/sampleData'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const teamId = ref(route.params.id || 'structure')

const teamData = computed(() => {
  return teams.find(t => t.id === teamId.value) || teams[0]
})

const teamMembers = computed(() => {
  return userStore.getTeamMembers(teamId.value)
})

const teamMeetings = computed(() => {
  const memberNames = userStore.getTeamMembers(teamId.value).map(member => member.name)
  const baseMeetings = meetings.filter(meeting =>
    meeting.teams?.includes(teamId.value) ||
    meeting.attendees?.some(attendee => memberNames.includes(attendee))
  )
  return [...baseMeetings, ...userStore.getTeamMeetings(teamId.value)]
})

const teamActions = computed(() => {
  const memberNames = userStore.getTeamMembers(teamId.value).map(member => member.name)
  const baseActions = actions
    .filter(action => action.team === teamId.value || memberNames.includes(action.assignee))
    .map(action => ({
      ...action,
      status: normalizeStatus(action.status)
    }))
  return [...baseActions, ...userStore.getTeamActions(teamId.value)]
})

const pendingActions = computed(() => {
  return teamActions.value.filter(a => a.status === 'pending')
})

const totalHours = computed(() => {
  return teamMembers.value.reduce((total, member) => {
    return total + userStore.getTotalMemberHours(member.id)
  }, 0)
})

function getTotalMemberHours(memberId) {
  return userStore.getTotalMemberHours(memberId)
}

function updateStatus(actionId, status) {
  userStore.updateActionStatus(teamId.value, actionId, status)
}

function normalizeStatus(status) {
  const map = {
    'on-track': 'in-progress',
    warning: 'on-hold',
    'at-risk': 'on-hold',
    completed: 'completed'
  }
  return map[status] || 'pending'
}

function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    'on-hold': 'bg-gray-100 text-gray-700'
  }
  return colors[status] || 'bg-slate-100 text-slate-700'
}
</script>

<style scoped>
</style>
