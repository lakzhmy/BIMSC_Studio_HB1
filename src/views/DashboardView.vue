<template>
  <main class="relative z-10 py-8 px-6">
    <div class="max-w-7xl mx-auto">
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <component
            :is="stat.link ? 'router-link' : 'div'"
            :to="stat.link"
            class="card p-6 block"
            v-for="stat in quickStats"
            :key="stat.label"
          >
            <p class="text-slate-600 text-sm font-medium mb-2">{{ stat.label }}</p>
            <div v-if="stat.items" class="space-y-2">
              <div v-for="item in stat.items" :key="item.text" class="flex items-center gap-2 text-sm font-medium text-slate-800">
                <span :class="['w-2.5 h-2.5 rounded-full', item.colorClass]"></span>
                <span class="truncate">{{ item.text }}</span>
              </div>
            </div>
            <template v-else>
              <p class="text-3xl font-bold text-slate-900">{{ stat.value }}</p>
              <p class="text-xs mt-2 text-slate-500 flex items-center gap-2">
                <span v-if="stat.attention" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold animate-pulse">!</span>
                <span>{{ stat.change }}</span>
              </p>
            </template>
          </component>
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
                <router-link
                  v-for="member in allMembers"
                  :key="member.id"
                  to="/teams"
                  class="flex items-center gap-3"
                >
                  <div class="w-9 h-9 flex-shrink-0">
                    <MemberBlob :member="member" size="36px" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 truncate">{{ member.name }}</p>
                    <p class="text-xs text-slate-500">{{ member.role || 'Team Member' }}</p>
                  </div>
                </router-link>
              </div>
            </section>
          </div>
        </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { projectHealth as projectHealthData, teams, recentActivity, courseTimeline as baseTimeline } from '@/data/sampleData'
import MemberBlob from '@/components/MemberBlob.vue'
const userStore = useUserStore()

// ── Live milestones from DB ──
const dbMilestones = ref([])
async function fetchMilestones() {
  try {
    const res = await fetch('/api/milestones')
    if (res.ok) dbMilestones.value = await res.json()
  } catch (err) {
    console.error('Failed to fetch milestones:', err)
  }
}
onMounted(fetchMilestones)

// ── Calendar-based current week (same logic as TimelineView) ──
const WEEK_START_DATES = Array.from({ length: 10 }, (_, i) => new Date(2026, 0, 12 + i * 7))

const currentWeekFraction = computed(() => {
  const now = new Date()
  const week1Start = WEEK_START_DATES[0].getTime()
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const fraction = (now.getTime() - week1Start) / msPerWeek + 1
  return Math.max(1, Math.min(10.99, fraction))
})

const currentWeekNumber = computed(() => Math.floor(currentWeekFraction.value))

const todayString = computed(() => {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const kpiHealth = computed(() => {
  const total = 9
  const onTarget = 7
  const needsAttention = 2
  return { total, onTarget, needsAttention }
})

const timelineSummary = computed(() => {
  const totalWeeks = baseTimeline.length
  return {
    totalWeeks,
    currentWeek: currentWeekNumber.value
  }
})

// Find the base week info (title, description) for the current week
const currentWeekInfo = computed(() => {
  return baseTimeline.find((w) => w.week === currentWeekNumber.value) || null
})

// Get DB milestones for the current week, grouped per team
const teamMilestones = computed(() => {
  const week = currentWeekNumber.value
  const colorMap = {
    structure: 'bg-green-500',
    program: 'bg-blue-500',
    data: 'bg-red-500'
  }
  const labelMap = {
    structure: 'Structure',
    program: 'Program',
    data: 'Data'
  }
  return ['structure', 'program', 'data'].map((team) => {
    const milestones = dbMilestones.value.filter((m) => m.week === week && m.team === team)
    if (milestones.length > 0) {
      return {
        text: milestones.map((m) => m.title).join(', '),
        colorClass: colorMap[team]
      }
    }
    return {
      text: `No milestone set for ${labelMap[team]}`,
      colorClass: 'bg-slate-300'
    }
  })
})

const quickStats = computed(() => {
  const health = kpiHealth.value
  const timeline = timelineSummary.value
  const weekInfo = currentWeekInfo.value
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
      label: 'Current Milestone',
      items: teamMilestoneItems,
      link: '/timeline'
    },
    {
      label: 'Timeline Progress',
      value: weekInfo ? `Week ${weekInfo.week}: ${weekInfo.title}` : '—',
      change: timeline.totalWeeks ? `${todayString.value} · Week ${timeline.currentWeek} of ${timeline.totalWeeks}` : 'Timeline not set',
      link: '/timeline'
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
