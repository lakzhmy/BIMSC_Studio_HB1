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

      <!-- Team Members Full-width Grid -->
      <section class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-slate-900">Team Members</h2>
          <router-link to="/stress-test" class="text-sm font-medium text-blue-600 hover:text-blue-700">
            Play Stress Test to update team health →
          </router-link>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="member in allMembers"
            :key="member.id"
            class="member-card flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            <div class="flex-shrink-0">
              <MemberBlob :member="member" size="60px" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-900 truncate">{{ member.name }}</p>
              <p class="text-xs text-slate-500 mb-2">{{ member.role || 'Team Member' }}</p>
              <!-- Health Bar -->
              <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  class="h-1.5 rounded-full transition-all duration-700"
                  :class="getHealthBarClass(member.teamId)"
                  :style="{ width: memberHealth(member.id) + '%' }"
                />
              </div>
              <p class="text-xs mt-1" :class="memberHealth(member.id) > 0 ? 'text-slate-600' : 'text-slate-400'">
                {{ memberHealth(member.id) > 0 ? memberHealth(member.id) + '% health' : 'No score yet — play Stress Test' }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { kpiMetrics, teams, courseTimeline as baseTimeline } from '@/data/sampleData'
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

// ── KPI Health from sampleData kpiMetrics ──
const kpiHealth = computed(() => {
  const total = kpiMetrics.length
  const onTarget = kpiMetrics.filter((k) => k.status === 'good').length
  const warnings = total - onTarget
  return { total, onTarget, warnings }
})

const timelineSummary = computed(() => {
  const totalWeeks = baseTimeline.length
  return {
    totalWeeks,
    currentWeek: currentWeekNumber.value
  }
})

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

// ── Team Health from stress test scores ──
const teamHealthValue = computed(() => {
  const teamIds = ['structure', 'program', 'data']
  const healths = teamIds.map((tid) => userStore.getTeamHealth(tid))
  const withScores = healths.filter((h) => h > 0)
  if (!withScores.length) return null
  return Math.round(withScores.reduce((a, b) => a + b, 0) / withScores.length)
})

const teamHealthChange = computed(() => {
  const teamIds = ['structure', 'program', 'data']
  const labels = { structure: 'Str', program: 'Prog', data: 'Data' }
  const parts = teamIds
    .map((tid) => {
      const h = userStore.getTeamHealth(tid)
      return h > 0 ? `${labels[tid]} ${h}%` : null
    })
    .filter(Boolean)
  return parts.length ? parts.join(' · ') : 'Play Stress Test to score'
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
      change: health.total ? `${health.warnings} warning${health.warnings !== 1 ? 's' : ''}` : 'No KPI data',
      link: '/kpi',
      attention: health.warnings > 0
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
      value: teamHealthValue.value !== null ? `${teamHealthValue.value}%` : '—',
      change: teamHealthChange.value,
      link: '/stress-test'
    }
  ]
})

// ── All members ──
const allMembers = computed(() => {
  const members = []
  const defaultAvatar = {
    complexity: userStore.avatarConfig?.complexity ?? 50,
    speed: userStore.avatarConfig?.speed ?? 2,
    wobble: userStore.avatarConfig?.wobble ?? 30,
    shade: userStore.avatarConfig?.shade ?? 2
  }
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

function memberHealth(memberId) {
  return userStore.getMemberHealth(memberId)
}

function getHealthBarClass(teamId) {
  const classes = {
    structure: 'bg-green-500',
    program: 'bg-blue-500',
    data: 'bg-red-500',
  }
  return classes[teamId] || 'bg-slate-500'
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

.member-card {
  background-color: white;
}
</style>
