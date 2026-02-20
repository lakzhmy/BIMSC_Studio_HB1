<template>
  <main class="py-10 px-8">
      <div class="max-w-none mx-auto space-y-8">
        <div class="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 class="text-4xl font-bold text-slate-900">Timeline</h1>
            <p class="text-base text-slate-600 mt-2">Weekly milestones and team deliverables</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <label :class="chipClass(filters.structure, 'green')">
                <input v-model="filters.structure" type="checkbox" class="sr-only" />
                Structure
              </label>
              <label :class="chipClass(filters.program, 'blue')">
                <input v-model="filters.program" type="checkbox" class="sr-only" />
                Program
              </label>
              <label :class="chipClass(filters.data, 'red')">
                <input v-model="filters.data" type="checkbox" class="sr-only" />
                Data
              </label>
            </div>
            <button
              @click="showAddModal = true"
              class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Add Milestone
            </button>
          </div>
        </div>

        <div class="relative overflow-x-hidden overflow-visible">
          <div class="w-full mt-8 pt-12">
            <div class="relative h-28 overflow-visible isolate">
              <svg class="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 100 96" preserveAspectRatio="none">
                <polyline :points="teamPoints.structure" :class="trackStrokeClass('structure')" class="fill-none stroke-[3]" />
                <polyline :points="teamPoints.program" :class="trackStrokeClass('program')" class="fill-none stroke-[3]" />
                <polyline :points="teamPoints.data" :class="trackStrokeClass('data')" class="fill-none stroke-[3]" />
              </svg>
              <div class="absolute -translate-x-1/2 top-0 -translate-y-8 z-10 pointer-events-none" :style="currentWeekMarkerStyle">
                <div class="text-xs font-semibold text-slate-700 bg-white/95 border border-slate-200 rounded-full px-3.5 py-1.5 shadow-sm">
                  We are here now
                </div>
              </div>
              <div class="absolute -translate-x-1/2 -top-[24px] z-10 flex flex-col items-center pointer-events-none" :style="currentWeekMarkerStyle">
                <svg class="mt-1 w-3.5 h-40 text-slate-600" viewBox="0 0 16 144" aria-hidden="true">
                  <line x1="8" y1="2" x2="8" y2="124" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3" />
                  <polygon points="8,140 4,124 12,124" fill="currentColor" />
                </svg>
              </div>
              <div class="absolute inset-0 grid grid-cols-10 gap-2 z-20">
                <div v-for="week in courseTimeline" :key="week.week" class="relative">
                  <div
                    v-if="weekHasTeam(week, 'structure')"
                    class="group absolute left-1/2 -translate-x-1/2 z-30 hover:z-[90] cursor-pointer"
                    :style="nodeStyle(week, 'structure')"
                    @click="toggleSelection(week, 'structure')"
                  >
                    <div
                      :class="[
                        'w-4 h-4 flex items-center justify-center',
                        isSelected(week.week, 'structure') ? 'ring-2 ring-green-300 ring-offset-1 ring-offset-white' : ''
                      ]"
                    >
                      <div v-if="isPastWeek(week.week)" :class="tickContainerClass('structure')">
                        <svg class="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3.5 8.5l2.5 2.5 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white" />
                        </svg>
                      </div>
                      <div v-else class="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
                    </div>
                    <div
                      :class="[
                        'absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg opacity-0 pointer-events-none transition-opacity transition-transform origin-bottom scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto z-[100]',
                        tooltipTextClass('structure')
                      ]"
                    >
                      <p class="text-xs">{{ teamMilestoneTitle(week, 'structure') }}</p>
                    </div>
                  </div>
                  <div
                    v-if="weekHasTeam(week, 'program')"
                    class="group absolute left-1/2 -translate-x-1/2 z-30 hover:z-[90] cursor-pointer"
                    :style="nodeStyle(week, 'program')"
                    @click="toggleSelection(week, 'program')"
                  >
                    <div
                      :class="[
                        'w-4 h-4 flex items-center justify-center',
                        isSelected(week.week, 'program') ? 'ring-2 ring-blue-300 ring-offset-1 ring-offset-white' : ''
                      ]"
                    >
                      <div v-if="isPastWeek(week.week)" :class="tickContainerClass('program')">
                        <svg class="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3.5 8.5l2.5 2.5 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white" />
                        </svg>
                      </div>
                      <div v-else class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                    </div>
                    <div
                      :class="[
                        'absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg opacity-0 pointer-events-none transition-opacity transition-transform origin-bottom scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto z-[100]',
                        tooltipTextClass('program')
                      ]"
                    >
                      <p class="text-xs">{{ teamMilestoneTitle(week, 'program') }}</p>
                    </div>
                  </div>
                  <div
                    v-if="weekHasTeam(week, 'data')"
                    class="group absolute left-1/2 -translate-x-1/2 z-30 hover:z-[90] cursor-pointer"
                    :style="nodeStyle(week, 'data')"
                    @click="toggleSelection(week, 'data')"
                  >
                    <div
                      :class="[
                        'w-4 h-4 flex items-center justify-center',
                        isSelected(week.week, 'data') ? 'ring-2 ring-red-300 ring-offset-1 ring-offset-white' : ''
                      ]"
                    >
                      <div v-if="isPastWeek(week.week)" :class="tickContainerClass('data')">
                        <svg class="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3.5 8.5l2.5 2.5 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white" />
                        </svg>
                      </div>
                      <div v-else class="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
                    </div>
                    <div
                      :class="[
                        'absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg opacity-0 pointer-events-none transition-opacity transition-transform origin-bottom scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto z-[100]',
                        tooltipTextClass('data')
                      ]"
                    >
                      <p class="text-xs">{{ teamMilestoneTitle(week, 'data') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-10 gap-3 mt-4 items-start">
              <div v-for="week in courseTimeline" :key="week.week" class="bg-white rounded-xl border border-slate-200 p-3 self-start">
                <div class="space-y-1">
                  <h3 class="text-xs font-semibold text-slate-900">Week {{ week.week }}: {{ week.title }}</h3>
                  <p class="text-[11px] text-slate-600">{{ week.description }}</p>
                </div>
                <div v-if="isWeekSelected(week.week)" class="mt-2">
                  <div
                    v-for="deliverable in selectedDeliverables(week)"
                    :key="deliverable.id"
                    :class="['mb-2 last:mb-0 rounded-lg border p-2', summaryCardClass(deliverable.team)]"
                  >
                    <div class="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                      <span :class="teamDotClass(deliverable.team)"></span>
                      {{ deliverable.text }}
                      <div v-if="deliverable.dbId" class="ml-auto flex items-center gap-1">
                        <button
                          @click.stop="editMilestone(deliverable)"
                          class="text-slate-400 hover:text-blue-500 transition-colors"
                          title="Edit milestone"
                        >
                          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          @click.stop="deleteMilestone(deliverable.dbId)"
                          class="text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete milestone"
                        >
                          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <ul class="space-y-1 list-disc pl-4">
                      <li
                        v-for="(item, index) in milestoneSummary(deliverable)"
                        :key="index"
                        class="text-[11px] text-slate-600"
                      >
                        {{ item }}
                      </li>
                    </ul>
                    <!-- Connection indicators for DB milestones -->
                    <div v-if="deliverable.connections && hasConnections(deliverable.connections)" class="mt-1.5 flex items-center gap-1.5">
                      <span class="text-[10px] text-slate-400">Links:</span>
                      <template v-for="(level, t) in deliverable.connections" :key="t">
                        <span
                          v-if="level > 0"
                          :class="connectionDotClass(t, level)"
                          :title="`${t}: ${['None','Low','Medium','High'][level]}`"
                        ></span>
                      </template>
                    </div>
                  </div>
                </div>
                <p v-else class="mt-2 text-[11px] text-slate-500">Click the dots to toggle team deliverables.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add / Edit Milestone Modal -->
      <AddMilestoneModal
        :isOpen="showAddModal"
        :weeks="courseTimeline"
        :editing="editingMilestone"
        @close="showAddModal = false; editingMilestone = null"
        @save="editingMilestone ? handleUpdateMilestone($event) : handleSaveMilestone($event)"
      />
    </main>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { courseTimeline as baseTimeline } from '@/data/sampleData'
import { useUserStore } from '@/stores/userStore'
import AddMilestoneModal from '@/components/AddMilestoneModal.vue'

const userStore = useUserStore()

const filters = reactive({
  structure: true,
  program: true,
  data: true
})

const selectedKeys = ref(new Set())
const showAddModal = ref(false)
const editingMilestone = ref(null)
const dbMilestones = ref([])

// Load milestones from the database on mount
async function fetchMilestones() {
  try {
    const res = await fetch('/api/milestones')
    if (res.ok) {
      dbMilestones.value = await res.json()
    }
  } catch (err) {
    console.error('Failed to fetch milestones:', err)
  }
}

onMounted(fetchMilestones)

// Build timeline from base week structure + DB milestones only (no hardcoded deliverables)
const courseTimeline = computed(() => {
  return baseTimeline.map((week) => {
    const dbItems = dbMilestones.value
      .filter((m) => m.week === week.week)
      .map((m) => ({
        id: `db-${m.id}`,
        dbId: m.id,
        week: m.week,
        team: m.team,
        text: m.title,
        summary: m.summary || [],
        connections: m.connections || {},
        authorName: m.author_name,
      }))
    return {
      ...week,
      deliverables: dbItems,
    }
  })
})

async function handleSaveMilestone(milestone) {
  try {
    const res = await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        week: milestone.week,
        team: milestone.team,
        title: milestone.title,
        summary: milestone.summary,
        connections: milestone.connections,
        created_by: userStore.currentUser?.googleId || null,
      }),
    })
    if (res.ok) {
      await fetchMilestones()
    } else {
      console.error('Failed to save milestone:', await res.text())
    }
  } catch (err) {
    console.error('Error saving milestone:', err)
  }
  showAddModal.value = false
}

function editMilestone(deliverable) {
  editingMilestone.value = {
    id: deliverable.dbId,
    week: deliverable.week || 0,
    team: deliverable.team,
    title: deliverable.text,
    summary: deliverable.summary && deliverable.summary.length > 0 ? [...deliverable.summary] : [''],
    connections: deliverable.connections ? { ...deliverable.connections } : { structure: 0, program: 0, data: 0 },
  }
  showAddModal.value = true
}

async function handleUpdateMilestone(milestone) {
  const id = editingMilestone.value?.id
  if (!id) return
  try {
    const res = await fetch(`/api/milestones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        week: milestone.week,
        team: milestone.team,
        title: milestone.title,
        summary: milestone.summary,
        connections: milestone.connections,
      }),
    })
    if (res.ok) {
      await fetchMilestones()
    } else {
      console.error('Failed to update milestone:', await res.text())
    }
  } catch (err) {
    console.error('Error updating milestone:', err)
  }
  editingMilestone.value = null
  showAddModal.value = false
}

async function deleteMilestone(id) {
  if (!confirm('Delete this milestone?')) return
  try {
    const res = await fetch(`/api/milestones/${id}`, { method: 'DELETE' })
    if (res.ok) {
      await fetchMilestones()
    }
  } catch (err) {
    console.error('Error deleting milestone:', err)
  }
}

const teamClasses = {
  general: 'bg-slate-100 text-slate-700 border-slate-200',
  structure: 'bg-green-50 text-green-700 border-green-200',
  program: 'bg-blue-50 text-blue-700 border-blue-200',
  data: 'bg-red-50 text-red-700 border-red-200'
}

// SVG viewBox height is 96. Space lines evenly with comfortable margins.
const teamBaseY = {
  structure: 20,
  data: 48,
  program: 76
}

const currentWeekMarker = 5

const currentWeekMarkerStyle = computed(() => {
  const total = courseTimeline.value.length
  if (total <= 1) {
    return { left: '0%' }
  }
  const clampedWeek = Math.min(Math.max(currentWeekMarker, 1), total)
  const left = ((clampedWeek - 1) / (total - 1)) * 100
  return { left: `${left}%` }
})

function filteredDeliverables(items) {
  return items.filter((item) => item.team !== 'general' && filters[item.team])
}

function selectionKey(weekNumber, team) {
  return `${weekNumber}:${team}`
}

function toggleSelection(week, team) {
  const next = new Set(selectedKeys.value)
  const key = selectionKey(week.week, team)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }
  selectedKeys.value = next
}

function isSelected(weekNumber, team) {
  return selectedKeys.value.has(selectionKey(weekNumber, team))
}

function isWeekSelected(weekNumber) {
  return ['structure', 'program', 'data'].some((team) => isSelected(weekNumber, team))
}

function isPastWeek(weekNumber) {
  return weekNumber <= currentWeekMarker
}

function weekHasTeam(week, team) {
  return filters[team] && week.deliverables.some((deliverable) => deliverable.team === team)
}

const teamPoints = computed(() => {
  return {
    structure: buildTeamPoints('structure'),
    program: buildTeamPoints('program'),
    data: buildTeamPoints('data')
  }
})

// Calculate pairwise connection strength between two teams for a given week
function pairConnectionStrength(week, teamA, teamB) {
  let strength = 0
  for (const d of week.deliverables) {
    if (d.team === teamA && d.connections) {
      strength += (d.connections[teamB] || 0)
    }
    if (d.team === teamB && d.connections) {
      strength += (d.connections[teamA] || 0)
    }
  }
  return strength
}

// Compute the Y position for each team in a given week based on connection strengths.
// When teams have strong connections, their lines converge toward each other.
// When there are no connections or no milestones, lines stay at their base Y positions.
// A minimum gap is enforced so lines never overlap.
function weekTeamY(week, team) {
  const teams = ['structure', 'program', 'data']
  const others = teams.filter((t) => t !== team)

  let totalStrength = 0
  let weightedY = 0

  for (const other of others) {
    const s = pairConnectionStrength(week, team, other)
    totalStrength += s
    weightedY += s * teamBaseY[other]
  }

  if (totalStrength === 0) {
    return teamBaseY[team]
  }

  // Weighted average Y of connected teams
  const targetY = weightedY / totalStrength
  // Gentle pull: max 35% convergence so lines approach but never overlap
  const pullFactor = Math.min(totalStrength / 12, 1) * 0.35

  return teamBaseY[team] + (targetY - teamBaseY[team]) * pullFactor
}

// After computing raw Y for all three teams in a week, enforce minimum spacing
// so dots remain visible and lines don't overlap.
const MIN_GAP = 8

function weekTeamYSeparated(week, team) {
  // Compute raw positions for all three teams
  const rawPositions = {
    structure: weekTeamY(week, 'structure'),
    program: weekTeamY(week, 'program'),
    data: weekTeamY(week, 'data'),
  }

  // Sort teams by their raw Y position
  const sorted = Object.entries(rawPositions).sort((a, b) => a[1] - b[1])

  // Enforce minimum gap between consecutive lines
  const adjusted = {}
  adjusted[sorted[0][0]] = sorted[0][1]
  for (let i = 1; i < sorted.length; i++) {
    const prevY = adjusted[sorted[i - 1][0]]
    adjusted[sorted[i][0]] = Math.max(sorted[i][1], prevY + MIN_GAP)
  }

  return adjusted[team]
}

function teamDeliverables(week, team) {
  return filteredDeliverables(week.deliverables).filter((item) => item.team === team)
}

function selectedDeliverables(week) {
  const teams = ['structure', 'program', 'data'].filter((team) => isSelected(week.week, team))
  if (!teams.length) {
    return []
  }
  return filteredDeliverables(week.deliverables).filter((item) => teams.includes(item.team))
}

function buildTeamPoints(team) {
  const timeline = courseTimeline.value
  const total = timeline.length
  return timeline
    .map((week, index) => {
      const x = total === 1 ? 0 : (index / (total - 1)) * 100
      const y = weekTeamYSeparated(week, team)
      return `${x},${y}`
    })
    .join(' ')
}

// Convert SVG Y (0–96) to a percentage of container height so dots sit centered on lines.
// The dot is 16px (w-4 h-4), offset by half to center on the line.
function nodeStyle(week, team) {
  const svgY = weekTeamYSeparated(week, team)
  const pct = (svgY / 96) * 100
  return {
    top: `calc(${pct}% - 8px)`
  }
}

function teamMilestoneTitle(week, team) {
  const match = teamDeliverables(week, team)[0]
  return match ? match.text : `Week ${week.week}: ${week.title}`
}

function milestoneSummary(deliverable) {
  // If this is a DB milestone with real summary points, use them
  if (deliverable.summary && deliverable.summary.length > 0) {
    return deliverable.summary
  }
  // Fallback for hardcoded milestones
  const base = deliverable.text
  return [
    `Define scope for ${base.toLowerCase()}.`,
    `Coordinate inputs and dependencies.`,
    `Draft and review initial outputs.`,
    `Refine based on feedback.`
  ]
}

function trackStrokeClass(team) {
  const colorMap = {
    structure: 'stroke-green-400',
    program: 'stroke-blue-400',
    data: 'stroke-red-400'
  }
  return filters[team] ? colorMap[team] : `${colorMap[team]} opacity-0`
}

function teamDotClass(team) {
  const colorMap = {
    structure: 'inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5',
    program: 'inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5',
    data: 'inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5'
  }
  return colorMap[team] || 'inline-block w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5'
}

function chipClass(active, color) {
  const base = 'px-4 py-1.5 rounded-full text-sm font-semibold border cursor-pointer select-none transition-colors'
  const on = {
    green: 'bg-green-100 text-green-700 border-green-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    red: 'bg-red-100 text-red-700 border-red-200'
  }[color]
  const off = 'bg-slate-100 text-slate-500 border-slate-200'
  return `${base} ${active ? on : off}`
}

function tooltipTextClass(team) {
  const colorMap = {
    structure: 'text-green-700',
    program: 'text-blue-700',
    data: 'text-red-700'
  }
  return colorMap[team] || 'text-slate-700'
}

function tickContainerClass(team) {
  const colorMap = {
    structure: 'w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow flex items-center justify-center',
    program: 'w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow flex items-center justify-center',
    data: 'w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow flex items-center justify-center'
  }
  return colorMap[team] || 'w-4 h-4 rounded-full bg-slate-400 border-2 border-white shadow flex items-center justify-center'
}

function summaryCardClass(team) {
  const colorMap = {
    structure: 'bg-green-50 border-green-200',
    program: 'bg-blue-50 border-blue-200',
    data: 'bg-red-50 border-red-200'
  }
  return colorMap[team] || 'bg-slate-50 border-slate-200'
}

function hasConnections(connections) {
  return connections && Object.values(connections).some((v) => v > 0)
}

function connectionDotClass(team, level) {
  const sizeMap = { 1: 'w-1.5 h-1.5', 2: 'w-2 h-2', 3: 'w-2.5 h-2.5' }
  const colorMap = {
    structure: 'bg-green-500',
    program: 'bg-blue-500',
    data: 'bg-red-500',
  }
  return `inline-block rounded-full ${colorMap[team] || 'bg-slate-400'} ${sizeMap[level] || 'w-1.5 h-1.5'}`
}

</script>

<style scoped>
</style>
