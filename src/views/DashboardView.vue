<template>
  <main class="relative z-10 py-8 px-6">
    <div class="max-w-7xl mx-auto">
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div v-for="stat in quickStats" :key="stat.label" class="card p-6">
            <p class="text-slate-600 text-sm font-medium mb-2">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-slate-900">{{ stat.value }}</p>
            <p class="text-slate-500 text-xs mt-2">{{ stat.change }}</p>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Active Actions Section -->
            <section class="card p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-slate-900">Active Actions</h2>
              </div>

              <div class="space-y-3">
                <div 
                  v-for="action in priorityActions" 
                  :key="action.id"
                  class="p-4 rounded-lg border-l-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  :style="{ borderLeftColor: getTeamColor(action.team) }"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="font-semibold text-slate-900">{{ action.title }}</span>
                        <span class="text-xs px-2 py-1 rounded-full" :style="{ backgroundColor: getTeamColor(action.team) + '15', color: getTeamColor(action.team) }">
                          {{ action.team }}
                        </span>
                      </div>
                      <p class="text-sm text-slate-600">{{ action.description }}</p>
                    </div>
                    <span class="text-xs font-medium text-slate-500 whitespace-nowrap ml-2">{{ action.dueDate }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Recent Activity -->
            <section class="card p-6">
              <h2 class="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
              <div class="space-y-4">
                <div v-for="activity in recentActivity.slice(0, 5)" :key="activity.id" class="border-b border-slate-200 pb-4 last:border-0">
                  <p class="text-sm text-slate-600 mb-1">{{ activity.action }}</p>
                  <p class="text-xs text-slate-500">{{ activity.timestamp }}</p>
                </div>
              </div>
            </section>
          </div>

          <!-- Right Column -->
          <div class="space-y-8">
            <!-- Project Health -->
            <section class="card p-6">
              <h2 class="text-xl font-bold text-slate-900 mb-6">Project Health</h2>
              <div class="space-y-4">
                <div v-for="milestone in projectHealth.milestones" :key="milestone.name" class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="font-medium text-slate-900">{{ milestone.name }}</span>
                    <span class="text-slate-600">{{ milestone.progress }}%</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full transition-all" :style="{ width: milestone.progress + '%' }"></div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Team Members -->
            <section class="card p-6">
              <h2 class="text-xl font-bold text-slate-900 mb-6">Team Members</h2>
              <div class="space-y-3">
                <div v-for="member in allMembers.slice(0, 5)" :key="member.id" class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full" :style="{ backgroundColor: getTeamColor(member.team) }"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 truncate">{{ member.name }}</p>
                    <p class="text-xs text-slate-500 capitalize">{{ member.team }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { projectHealth as projectHealthData, actions, teams, recentActivity } from '@/data/sampleData'
const userStore = useUserStore()

// Quick stats
const quickStats = [
  { label: 'Total Tasks', value: '24', change: '+3 from last week' },
  { label: 'Completed', value: '18', change: '75% completion' },
  { label: 'In Progress', value: '4', change: '2 blocked' },
  { label: 'Team Health', value: '92%', change: 'Excellent' }
]

// Project health data
const projectHealth = projectHealthData

// Priority actions - get first 3 from sampleData
const priorityActions = computed(() => {
  return actions.slice(0, 3).map(action => ({
    ...action,
    dueDate: 'Due in 2 days'
  }))
})

// All members from userStore
const allMembers = computed(() => {
  const members = []
  const teamNames = {
    structure: 'structure',
    program: 'program',
    data: 'data'
  }
  
  // Get members from userStore
  for (const [teamId, teamMemberList] of Object.entries(userStore.teamMembers)) {
    if (Array.isArray(teamMemberList)) {
      teamMemberList.forEach(member => {
        members.push({
          id: member.id,
          name: member.name,
          role: member.role || 'Team Member',
          team: teamId,
          status: member.status || 'online',
          mood: member.mood
        })
      })
    }
  }
  
  // If no custom members added, show sample data for display purposes
  if (members.length === 0) {
    return teams.flatMap(team => 
      team.members.map(member => ({
        ...member,
        team: team.id
      }))
    )
  }
  
  return members
})

function getTeamColor(team) {
  const colors = {
    structure: '#10b981',
    program: '#3b82f6',
    data: '#ef4444'
  }
  return colors[team] || '#6b7280'
}

</script>

<style scoped>
.card {
  background-color: white;
  border: 1px solid rgb(226, 232, 240);
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: rgb(203, 213, 225);
}
</style>
