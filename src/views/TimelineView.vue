<template>
  <main class="py-8 px-6">
      <div class="max-w-none mx-auto space-y-6">
        <div class="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">Timeline</h1>
            <p class="text-slate-600 mt-1">Weekly milestones and team deliverables</p>
          </div>
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
        </div>

        <div class="relative overflow-x-hidden overflow-visible">
          <div class="w-full mt-6 pt-10">
            <div class="relative h-24 overflow-visible isolate">
              <svg class="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 100 96" preserveAspectRatio="none">
                <polyline :points="teamPoints.structure" :class="trackStrokeClass('structure')" class="fill-none stroke-[2.5]" />
                <polyline :points="teamPoints.program" :class="trackStrokeClass('program')" class="fill-none stroke-[2.5]" />
                <polyline :points="teamPoints.data" :class="trackStrokeClass('data')" class="fill-none stroke-[2.5]" />
              </svg>
              <div class="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-8 z-10 pointer-events-none">
                <div class="text-[11px] font-semibold text-slate-700 bg-white/95 border border-slate-200 rounded-full px-3 py-1 shadow-sm">
                  We are here now
                </div>
              </div>
              <div class="absolute left-1/2 -translate-x-1/2 -top-[24px] z-10 flex flex-col items-center pointer-events-none">
                <svg class="mt-1 w-3 h-36 text-slate-600" viewBox="0 0 16 144" aria-hidden="true">
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
                        'w-3.5 h-3.5 flex items-center justify-center',
                        isSelected(week.week, 'structure') ? 'ring-2 ring-green-300 ring-offset-1 ring-offset-white' : ''
                      ]"
                    >
                      <div v-if="isPastWeek(week.week)" :class="tickContainerClass('structure')">
                        <svg class="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3.5 8.5l2.5 2.5 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white" />
                        </svg>
                      </div>
                      <div v-else class="w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white shadow"></div>
                    </div>
                    <div
                      :class="[
                        'absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] shadow-lg opacity-0 pointer-events-none transition-opacity transition-transform origin-bottom scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto z-[100]',
                        tooltipTextClass('structure')
                      ]"
                    >
                      <p class="text-[10px]">{{ teamMilestoneTitle(week, 'structure') }}</p>
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
                        'w-3.5 h-3.5 flex items-center justify-center',
                        isSelected(week.week, 'program') ? 'ring-2 ring-blue-300 ring-offset-1 ring-offset-white' : ''
                      ]"
                    >
                      <div v-if="isPastWeek(week.week)" :class="tickContainerClass('program')">
                        <svg class="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3.5 8.5l2.5 2.5 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white" />
                        </svg>
                      </div>
                      <div v-else class="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                    </div>
                    <div
                      :class="[
                        'absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] shadow-lg opacity-0 pointer-events-none transition-opacity transition-transform origin-bottom scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto z-[100]',
                        tooltipTextClass('program')
                      ]"
                    >
                      <p class="text-[10px]">{{ teamMilestoneTitle(week, 'program') }}</p>
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
                        'w-3.5 h-3.5 flex items-center justify-center',
                        isSelected(week.week, 'data') ? 'ring-2 ring-red-300 ring-offset-1 ring-offset-white' : ''
                      ]"
                    >
                      <div v-if="isPastWeek(week.week)" :class="tickContainerClass('data')">
                        <svg class="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3.5 8.5l2.5 2.5 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white" />
                        </svg>
                      </div>
                      <div v-else class="w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white shadow"></div>
                    </div>
                    <div
                      :class="[
                        'absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] shadow-lg opacity-0 pointer-events-none transition-opacity transition-transform origin-bottom scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto z-[100]',
                        tooltipTextClass('data')
                      ]"
                    >
                      <p class="text-[10px]">{{ teamMilestoneTitle(week, 'data') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-10 gap-2 mt-3 items-start">
              <div v-for="week in courseTimeline" :key="week.week" class="bg-white rounded-xl border border-slate-200 p-2 self-start">
                <div class="space-y-1">
                  <h3 class="text-[11px] font-semibold text-slate-900">Week {{ week.week }}: {{ week.title }}</h3>
                  <p class="text-[10px] text-slate-600">{{ week.description }}</p>
                </div>
                <div v-if="isWeekSelected(week.week)" class="mt-2">
                  <div
                    v-for="deliverable in selectedDeliverables(week)"
                    :key="deliverable.id"
                    :class="['mb-2 last:mb-0 rounded-lg border p-2', summaryCardClass(deliverable.team)]"
                  >
                    <div class="text-[10px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                      <span :class="teamDotClass(deliverable.team)"></span>
                      {{ deliverable.text }}
                    </div>
                    <ul class="space-y-1 list-disc pl-4">
                      <li
                        v-for="(item, index) in milestoneSummary(deliverable)"
                        :key="index"
                        class="text-[10px] text-slate-600"
                      >
                        {{ item }}
                      </li>
                    </ul>
                  </div>
                </div>
                <p v-else class="mt-2 text-[10px] text-slate-500">Click the dots to toggle team deliverables.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { courseTimeline } from '@/data/sampleData'

const filters = reactive({
  structure: true,
  program: true,
  data: true
})

const selectedKeys = ref(new Set())

const teamClasses = {
  general: 'bg-slate-100 text-slate-700 border-slate-200',
  structure: 'bg-green-50 text-green-700 border-green-200',
  program: 'bg-blue-50 text-blue-700 border-blue-200',
  data: 'bg-red-50 text-red-700 border-red-200'
}

const teamBaseY = {
  structure: 14,
  data: 40,
  program: 66
}

const currentWeekMarker = 5

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
  const total = courseTimeline.length
  return courseTimeline
    .map((week, index) => {
      const x = total === 1 ? 0 : (index / (total - 1)) * 100
      const y = teamBaseY[team] + weekOffset(week, team)
      return `${x},${y}`
    })
    .join(' ')
}

function weekOffset(week, team) {
  const activeTeams = ['structure', 'program', 'data'].filter((t) => weekHasTeam(week, t))
  if (!activeTeams.includes(team)) {
    return 0
  }
  const flip = week.week % 2 === 0 ? 1 : -1
  if (activeTeams.length === 3) {
    return (team === 'structure' ? -8 : team === 'data' ? 0 : 8) * flip
  }
  if (activeTeams.length === 2) {
    return (activeTeams[0] === team ? -6 : 6) * flip
  }
  return 4 * flip
}

function nodeStyle(week, team) {
  return {
    top: `${teamBaseY[team] + weekOffset(week, team) - 7}px`
  }
}

function teamMilestoneTitle(week, team) {
  const match = teamDeliverables(week, team)[0]
  return match ? match.text : `Week ${week.week}: ${week.title}`
}

function milestoneSummary(deliverable) {
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
  const base = 'px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer select-none transition-colors'
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
    structure: 'w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white shadow flex items-center justify-center',
    program: 'w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow flex items-center justify-center',
    data: 'w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white shadow flex items-center justify-center'
  }
  return colorMap[team] || 'w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white shadow flex items-center justify-center'
}

function summaryCardClass(team) {
  const colorMap = {
    structure: 'bg-green-50 border-green-200',
    program: 'bg-blue-50 border-blue-200',
    data: 'bg-red-50 border-red-200'
  }
  return colorMap[team] || 'bg-slate-50 border-slate-200'
}

</script>

<style scoped>
</style>
