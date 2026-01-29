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
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">Teams</h1>
            <p class="text-slate-600 mt-1">Collaboration and member management</p>
          </div>
          <button @click="openAddMemberModal" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">Add Member</button>
        </div>
        <div class="grid lg:grid-cols-3 gap-6">
          <div v-for="team in teams" :key="team.id" class="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl" :style="{ background: `linear-gradient(135deg, ${team.color} 0%, ${team.colorDark} 100%)` }"></div>
                <div>
                  <h3 class="text-lg font-bold text-slate-900">{{ team.name }}</h3>
                  <p class="text-sm text-slate-600">{{ team.description }}</p>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div class="text-center p-3 bg-slate-50 rounded-lg">
                <div class="text-2xl font-bold text-slate-900">{{ getTeamMemberCount(team.id) }}</div>
                <div class="text-xs text-slate-500">Members</div>
              </div>
              <div class="text-center p-3 bg-slate-50 rounded-lg">
                <div class="text-2xl font-bold text-slate-900">{{ getTeamMeetingCount(team.id) }}</div>
                <div class="text-xs text-slate-500">Meetings</div>
              </div>
              <div class="text-center p-3 bg-slate-50 rounded-lg">
                <div class="text-2xl font-bold text-slate-900">{{ getTeamActionCount(team.id) }}</div>
                <div class="text-xs text-slate-500">Actions</div>
              </div>
            </div>
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-slate-700">Team Progress</span>
                <span class="text-sm font-medium text-slate-900">{{ team.progress }}%</span>
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700" :style="{ width: `${team.progress}%`, backgroundColor: team.color }"></div>
              </div>
            </div>
            <router-link :to="`/teams/${team.id}`" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium text-center block">View Details →</router-link>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg border border-slate-200">
          <h2 class="text-xl font-bold text-slate-900 mb-6">All Team Members</h2>
          <div v-if="allMembers.length === 0" class="text-center py-12">
            <p class="text-slate-600 mb-4">No team members yet. Click "Add Member" to get started!</p>
          </div>
          <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="member in allMembers" :key="member.id" class="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-14 h-14 flex-shrink-0">
                  <MemberBlob :member="member" size="56px" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h4 class="text-sm font-semibold text-slate-900 truncate">{{ member.name }}</h4>
                    <div :class="['w-2 h-2 rounded-full flex-shrink-0', member.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-slate-300']"></div>
                  </div>
                  <p class="text-xs text-slate-600 truncate">{{ member.role }}</p>
                  <p v-if="member.mood" class="text-xs text-slate-500 truncate italic">{{ member.mood }}</p>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: getTeamColor(member.teamId) }"></div>
                  <span class="text-xs font-medium" :style="{ color: getTeamColor(member.teamId) }">{{ getTeamName(member.teamId) }}</span>
                </div>
                <button @click="removeMember(member.teamId, member.id)" class="opacity-0 group-hover:opacity-100 px-3 py-1 bg-red-100 border border-red-200 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 transition-all">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AddMemberModal :isOpen="showAddMemberModal" @close="closeAddMemberModal" @submit="handleAddMember" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import UserAvatar from '@/components/UserAvatar.vue'
import MemberBlob from '@/components/MemberBlob.vue'
import AddMemberModal from '@/components/AddMemberModal.vue'
import { teams, meetings, actions } from '@/data/sampleData'

const router = useRouter()
const userStore = useUserStore()
const showAddMemberModal = ref(false)

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

const allMembers = computed(() => {
  const members = []
  
  // Get all user-added members from each team
  teams.forEach(team => {
    const teamMembers = userStore.getTeamMembers(team.id)
    teamMembers.forEach(member => {
      members.push({
        ...member,
        teamId: team.id
      })
    })
  })
  
  return members
})

function openAddMemberModal() {
  showAddMemberModal.value = true
}

function closeAddMemberModal() {
  showAddMemberModal.value = false
}

function handleAddMember(memberData) {
  if (memberData.team) {
    userStore.addTeamMember(memberData.team, memberData)
    closeAddMemberModal()
  }
}

function removeMember(teamId, memberId) {
  userStore.removeTeamMember(teamId, memberId)
}

function getTeamMemberCount(teamId) {
  return userStore.getTeamMembers(teamId).length
}

function getTeamMeetingCount(teamId) {
  const memberNames = userStore.getTeamMembers(teamId).map(member => member.name)
  const baseMeetings = meetings.filter(meeting =>
    meeting.teams?.includes(teamId) ||
    meeting.attendees?.some(attendee => memberNames.includes(attendee))
  )
  return baseMeetings.length + userStore.getTeamMeetings(teamId).length
}

function getTeamActionCount(teamId) {
  const memberNames = userStore.getTeamMembers(teamId).map(member => member.name)
  const baseActions = actions.filter(action =>
    action.team === teamId || memberNames.includes(action.assignee)
  )
  return baseActions.length + userStore.getTeamActions(teamId).length
}

function getMemberGradient(teamId) {
  const team = teams.find(t => t.id === teamId)
  if (!team) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  return `linear-gradient(135deg, ${team.color} 0%, ${team.colorDark} 100%)`
}

function getTeamColor(teamId) {
  const team = teams.find(t => t.id === teamId)
  return team ? team.color : '#64748b'
}

function getTeamName(teamId) {
  const team = teams.find(t => t.id === teamId)
  return team ? team.name : 'Unknown'
}
</script>

<style scoped>
</style>


