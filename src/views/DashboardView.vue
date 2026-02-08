<template>
  <main class="relative z-10 py-8 px-6">
    <div class="max-w-7xl mx-auto">
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div v-for="stat in quickStats" :key="stat.label" class="card p-6">
            <p class="text-slate-600 text-sm font-medium mb-2">{{ stat.label }}</p>
            <div v-if="stat.items" class="space-y-2">
              <div v-for="item in stat.items" :key="item.text" class="flex items-center gap-2 text-sm font-medium text-slate-800">
                <span :class="['w-2.5 h-2.5 rounded-full', item.colorClass]"></span>
                <span class="truncate">{{ item.text }}</span>
              </div>
            </div>
            <template v-else>
              <component :is="stat.link ? 'router-link' : 'div'" :to="stat.link" class="block">
                <p class="text-3xl font-bold text-slate-900">{{ stat.value }}</p>
                <p class="text-xs mt-2 text-slate-500 flex items-center gap-2">
                  <span v-if="stat.attention" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold animate-pulse">!</span>
                  <span>{{ stat.change }}</span>
                </p>
              </component>
            </template>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid lg:grid-cols-3 gap-8 items-stretch">
          <!-- Left Column -->
          <div class="lg:col-span-2 h-full">
            <!-- Recent Activity -->
            <section class="card p-6 h-full flex flex-col">
              <h2 class="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
              <div class="space-y-4">
                <div v-for="activity in recentActivity" :key="activity.id" class="border-b border-slate-200 pb-4 last:border-0">
                  <p class="text-sm text-slate-600 mb-1">
                    <span :class="getTeamLabelClass(activity.team)">{{ activity.user }}</span>
                    {{ activity.action }} {{ activity.target }}
                  </p>
                  <p class="text-xs text-slate-500">{{ activity.timestamp }}</p>
                </div>
              </div>
            </section>
          </div>

          <!-- Right Column -->
          <div class="space-y-8 h-full">
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
                <div v-for="member in allMembers" :key="member.id" class="flex items-center gap-3">
                  <div class="w-9 h-9 flex-shrink-0">
                    <MemberBlob :member="member" size="36px" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 truncate">{{ member.name }}</p>
                    <p class="text-xs text-slate-500">{{ member.role || 'Team Member' }}</p>
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
import { projectHealth as projectHealthData, teams, recentActivity, courseTimeline } from '@/data/sampleData'
import MemberBlob from '@/components/MemberBlob.vue'
const userStore = useUserStore()

const kpiHealth = computed(() => {
  const total = 9
  const onTarget = 7
  const needsAttention = 2
  return { total, onTarget, needsAttention }
})

const timelineSummary = computed(() => {
  const totalWeeks = courseTimeline.length
  const currentWeek = 5
  const clampedWeek = Math.min(Math.max(currentWeek, 1), totalWeeks)
  return {
    totalWeeks,
    currentWeek: clampedWeek
  }
})

const currentTimelineMilestone = computed(() => {
  const currentWeek = timelineSummary.value.currentWeek
  return courseTimeline.find((week) => week.week === currentWeek) || null
})

const teamMilestones = computed(() => {
  const milestone = currentTimelineMilestone.value
  if (!milestone) return []
  const colorMap = {
    structure: 'bg-green-500',
    program: 'bg-blue-500',
    data: 'bg-red-500'
  }
  return ['structure', 'program', 'data']
    .map((team) => {
      const deliverable = milestone.deliverables.find((item) => item.team === team)
      if (!deliverable) return null
      return {
        text: deliverable.text,
        colorClass: colorMap[team] || 'bg-slate-400'
      }
    })
    .filter(Boolean)
})

const quickStats = computed(() => {
  const health = kpiHealth.value
  const timeline = timelineSummary.value
  const milestone = currentTimelineMilestone.value
  const teamMilestoneItems = teamMilestones.value

  return [
    {
      label: 'KPI Health',
      value: health.total ? `${health.onTarget}/${health.total} On Target` : '—',
      change: health.total ? `${health.needsAttention} clashes` : 'No KPI data',
      link: '/kpi',
      attention: true
    },
    {
      label: 'Next Milestone',
      items: teamMilestoneItems.length
        ? teamMilestoneItems
        : [{ text: 'No team milestones', colorClass: 'bg-slate-300' }]
    },
    {
      label: 'Timeline Progress',
      value: milestone ? `Week ${milestone.week}: ${milestone.title}` : '—',
      change: timeline.totalWeeks ? `${timeline.currentWeek} out of ${timeline.totalWeeks} weeks` : 'Timeline not set'
    },
    {
      label: 'Team Health',
      value: `${projectHealth.breakdown.team}%`,
      change: `Project overall ${projectHealth.overall}%`
    }
  ]
})

// Project health data
const projectHealth = projectHealthData

// All members from userStore
const allMembers = computed(() => {
  const members = []
  const defaultAvatar = {
    complexity: userStore.avatarConfig?.complexity ?? 50,
    speed: userStore.avatarConfig?.speed ?? 2,
    wobble: userStore.avatarConfig?.wobble ?? 30,
    shade: userStore.avatarConfig?.shade ?? 2
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
          teamId,
          status: member.status || 'online',
          mood: member.mood,
          avatar: member.avatar || defaultAvatar
        })
      })
    }
  }
  
  // If no custom members added, show sample data for display purposes
  if (members.length === 0) {
    return teams.flatMap(team =>
      team.members.map(member => ({
        ...member,
        team: team.id,
        teamId: team.id
      }))
    )
  }
  
  return members
})

function getTeamDisplayName(teamId) {
  const team = teams.find((item) => item.id === teamId)
  return team ? team.name : teamId
}

function getTeamLabelClass(team) {
  const classes = {
    structure: 'text-green-600 font-semibold',
    program: 'text-blue-600 font-semibold',
    data: 'text-red-600 font-semibold'
  }
  return classes[team] || 'text-slate-700 font-semibold'
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
