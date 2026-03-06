<template>
  <main class="py-8 px-6">
    <div class="max-w-7xl mx-auto space-y-6">

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-16">
        <p class="text-slate-500 text-lg">Loading KPI data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-red-900 font-semibold mb-2">Error Loading Data</h3>
        <p class="text-red-700 text-sm">{{ loadError }}</p>
        <button @click="loadData" class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium">
          Retry
        </button>
      </div>

      <!-- Shared Week Selector -->
      <div v-if="!isLoading && !loadError" class="flex items-center gap-3">
        <label class="text-sm font-medium text-slate-700">Week</label>
        <select v-model="structureWeek" class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm">
          <option value="">Select Week</option>
          <option v-for="week in structureWeeks" :key="week" :value="week">{{ week }}</option>
        </select>
      </div>

      <!-- Row 1: Program | Structure | Data -->
      <div v-if="!isLoading && !loadError" class="grid lg:grid-cols-3 gap-6 items-stretch">

        <!-- Program Widget -->
        <div class="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900" style="color: #3b82f6;">Program</h2>
            <p class="text-xs text-slate-500">Space usage and program KPIs</p>
          </div>

          <!-- Program KPI Cards with inline bullet charts -->
          <div v-if="programFilteredKPIs.length > 0" class="space-y-3">
            <div
              v-for="(kpi, index) in programFilteredKPIs"
              :key="kpi.id"
              class="bg-slate-50 rounded-lg border border-slate-100 hover:shadow-md transition-shadow cursor-pointer relative"
              @mouseenter="handleProgramKPIMouseEnter(kpi.id)"
              @mouseleave="handleProgramKPIMouseLeave(kpi.id)"
            >
              <!-- Hover tooltip -->
              <div v-if="showProgramKPITooltip === kpi.id" class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                Click on card to display KPI description
              </div>
              <div class="p-4" @click="toggleExpandProgramKPI(kpi.id)">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <h3 class="text-xs font-semibold text-slate-700">{{ kpi.name }}</h3>
                    <p class="text-[11px] text-slate-500">{{ kpi.unit }}</p>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <div class="w-2 h-2 rounded-full bg-slate-300"></div>
                    <svg :class="['w-4 h-4 text-slate-500 transition-transform', expandedProgramKPIs.has(kpi.id) ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                  </div>
                </div>
                <!-- Expandable description section -->
                <div v-if="expandedProgramKPIs.has(kpi.id)" class="bg-slate-100 -mx-4 px-4 py-2 mb-3 border-t border-b border-slate-200">
                  <p class="text-xs text-slate-600 leading-relaxed">{{ kpi.description }}</p>
                </div>
                <div class="text-2xl font-bold text-slate-900 mb-3">{{ typeof kpi.value === 'number' ? kpi.value.toFixed(2) : kpi.value }}</div>
                <template v-if="programSummaryCards[index]">
                  <div class="text-[11px] text-slate-500">Target: {{ programSummaryCards[index].displayTarget }}</div>
                  <div class="flex items-center gap-2 mt-1 mb-3">
                    <span :class="['text-[10px] px-2 py-0.5 rounded-full border', programSummaryCards[index].withinMargin ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200']">
                      {{ programSummaryCards[index].delta > 0 ? '+' : '' }}{{ programSummaryCards[index].displayDelta }}
                    </span>
                  </div>
                  <div class="relative h-2 rounded-full bg-slate-200 overflow-visible">
                    <div class="absolute left-0 top-0 h-full rounded-full" :style="{ width: `${programSummaryCards[index].bulletValuePct}%`, backgroundColor: programSummaryCards[index].color }"></div>
                    <div class="absolute top-0 h-full w-0.5 bg-slate-500" :style="{ left: `${programSummaryCards[index].bulletTargetPct}%` }"></div>
                    <div class="absolute top-0 h-2 w-2 bg-yellow-400 shadow-sm" :style="{ left: `calc(${programSummaryCards[index].bulletTargetPct}% - 4px)`, transform: 'rotate(45deg)' }"></div>
                    <div class="absolute -top-5 text-[10px] text-slate-600" :style="{ left: `calc(${programSummaryCards[index].bulletTargetPct}% - 8px)` }">{{ programSummaryCards[index].displayTarget }}</div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <p v-else class="text-slate-400 text-sm">No program data available</p>
        </div>

        <!-- Structure Widget -->
        <div class="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div>
            <h2 class="text-lg font-bold" style="color: #10b981;">Structure</h2>
            <p class="text-xs text-slate-500">Structural performance KPIs</p>
          </div>



          <!-- Structure KPI Cards with inline bullet charts -->
          <div v-if="structureFilteredKPIs.length > 0" class="space-y-3">
            <div
              v-for="(kpi, index) in structureFilteredKPIs"
              :key="kpi.id"
              class="bg-slate-50 rounded-lg border border-slate-100 hover:shadow-md transition-shadow cursor-pointer relative"
              @mouseenter="hoveredStructureIndex = index; handleStructureKPIMouseEnter(kpi.id)"
              @mouseleave="hoveredStructureIndex = null; handleStructureKPIMouseLeave(kpi.id)"
            >
              <!-- Hover tooltip -->
              <div v-if="showStructureKPITooltip === kpi.id" class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                Click on card to display KPI description
              </div>
              <div class="p-4" @click="toggleExpandStructureKPI(kpi.id)">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <h3 class="text-xs font-semibold text-slate-700">{{ kpi.name }}</h3>
                    <p class="text-[11px] text-slate-500">{{ kpi.unit }}</p>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <div :class="['w-2 h-2 rounded-full', structureSummaryCards[index] ? (structureSummaryCards[index].withinMargin ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-300']"></div>
                    <svg :class="['w-4 h-4 text-slate-500 transition-transform', expandedStructureKPIs.has(kpi.id) ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                  </div>
                </div>
                <!-- Expandable description section -->
                <div v-if="expandedStructureKPIs.has(kpi.id)" class="bg-slate-100 -mx-4 px-4 py-2 mb-3 border-t border-b border-slate-200">
                  <p class="text-xs text-slate-600 leading-relaxed">{{ kpi.description }}</p>
                </div>
                <div class="text-2xl font-bold text-slate-900 mb-3">{{ typeof kpi.value === 'number' ? kpi.value.toFixed(2) : kpi.value }}</div>
                <template v-if="structureSummaryCards[index]">
                  <div class="text-[11px] text-slate-500">Target: {{ structureSummaryCards[index].displayTarget }}</div>
                  <div class="flex items-center gap-2 mt-1 mb-3">
                    <span :class="['text-[10px] px-2 py-0.5 rounded-full border', structureSummaryCards[index].withinMargin ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200']">
                      {{ structureSummaryCards[index].delta > 0 ? '+' : '' }}{{ structureSummaryCards[index].displayDelta }}
                    </span>
                  </div>
                  <div class="relative h-2 rounded-full bg-slate-200 overflow-visible">
                    <div class="absolute left-0 top-0 h-full rounded-full" :style="{ width: `${structureSummaryCards[index].bulletValuePct}%`, backgroundColor: structureSummaryCards[index].color }"></div>
                    <div class="absolute top-0 h-full w-0.5 bg-slate-500" :style="{ left: `${structureSummaryCards[index].bulletTargetPct}%` }"></div>
                    <div class="absolute top-0 h-2 w-2 bg-yellow-400 shadow-sm" :style="{ left: `calc(${structureSummaryCards[index].bulletTargetPct}% - 4px)`, transform: 'rotate(45deg)' }"></div>
                    <div class="absolute -top-5 text-[10px] text-slate-600" :style="{ left: `calc(${structureSummaryCards[index].bulletTargetPct}% - 8px)` }">{{ structureSummaryCards[index].displayTarget }}</div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <p v-else-if="!structureWeek" class="text-slate-400 text-sm">Select a week to view data</p>
        </div>

        <!-- Data Widget -->
        <div class="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div>
            <h2 class="text-lg font-bold" style="color: #ef4444;">Data</h2>
            <p class="text-xs text-slate-500">Full building KPIs</p>
          </div>



          <!-- Data KPI Cards with inline bullet charts -->
          <div v-if="dataFilteredKPIs.length > 0" class="space-y-3">
            <div
              v-for="(kpi, index) in dataFilteredKPIs"
              :key="kpi.id"
              class="bg-slate-50 rounded-lg border border-slate-100 hover:shadow-md transition-shadow cursor-pointer relative"
              @mouseenter="hoveredDataIndex = index; handleDataKPIMouseEnter(kpi.id)"
              @mouseleave="hoveredDataIndex = null; handleDataKPIMouseLeave(kpi.id)"
            >
              <!-- Hover tooltip -->
              <div v-if="showDataKPITooltip === kpi.id" class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                Click on card to display KPI description
              </div>
              <div class="p-4" @click="toggleExpandDataKPI(kpi.id)">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <h3 class="text-xs font-semibold text-slate-700">{{ kpi.name }}</h3>
                    <p class="text-[11px] text-slate-500">{{ kpi.unit }}</p>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <div :class="['w-2 h-2 rounded-full', dataSummaryCards[index] ? (dataSummaryCards[index].withinMargin ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-300']"></div>
                    <svg :class="['w-4 h-4 text-slate-500 transition-transform', expandedDataKPIs.has(kpi.id) ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                  </div>
                </div>
                <!-- Expandable description section -->
                <div v-if="expandedDataKPIs.has(kpi.id)" class="bg-slate-100 -mx-4 px-4 py-2 mb-3 border-t border-b border-slate-200">
                  <p class="text-xs text-slate-600 leading-relaxed">{{ kpi.description }}</p>
                </div>
                <div class="text-2xl font-bold text-slate-900 mb-3">{{ typeof kpi.value === 'number' ? kpi.value.toFixed(2) : kpi.value }}</div>
                <template v-if="dataSummaryCards[index]">
                  <div class="text-[11px] text-slate-500">Target: {{ dataSummaryCards[index].displayTarget }}</div>
                  <div class="flex items-center gap-2 mt-1 mb-3">
                    <span :class="['text-[10px] px-2 py-0.5 rounded-full border', dataSummaryCards[index].withinMargin ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200']">
                      {{ dataSummaryCards[index].delta > 0 ? '+' : '' }}{{ dataSummaryCards[index].displayDelta }}
                    </span>
                  </div>
                  <div class="relative h-2 rounded-full bg-slate-200 overflow-visible">
                    <div class="absolute left-0 top-0 h-full rounded-full" :style="{ width: `${dataSummaryCards[index].bulletValuePct}%`, backgroundColor: dataSummaryCards[index].color }"></div>
                    <div class="absolute top-0 h-full w-0.5 bg-slate-500" :style="{ left: `${dataSummaryCards[index].bulletTargetPct}%` }"></div>
                    <div class="absolute top-0 h-2 w-2 bg-yellow-400 shadow-sm" :style="{ left: `calc(${dataSummaryCards[index].bulletTargetPct}% - 4px)`, transform: 'rotate(45deg)' }"></div>
                    <div class="absolute -top-5 text-[10px] text-slate-600" :style="{ left: `calc(${dataSummaryCards[index].bulletTargetPct}% - 8px)` }">{{ dataSummaryCards[index].displayTarget }}</div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <p v-else-if="!structureWeek" class="text-slate-400 text-sm">Select a week to view data</p>
        </div>

      </div>

      <!-- Row 2: Vitals (full width) -->
      <div v-if="!isLoading && !loadError" class="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
        <div>
          <h2 class="text-lg font-bold" style="color: #8b5cf6;">Vitals</h2>
          <p class="text-slate-500 text-sm">Building performance visualizations and real-time monitoring.</p>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <div class="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:shadow-lg transition-shadow">
            <BreathingChart />
          </div>
          <div class="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:shadow-lg transition-shadow">
            <ProjectComplexity />
          </div>
        </div>

        <div class="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:shadow-lg transition-shadow">
          <PorousVisualization />
        </div>
      </div>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ProgramKPISelector from '@/components/ProgramKPISelector.vue'
import BreathingChart from '@/components/BreathingChart.vue'
import PorousVisualization from '@/components/PorousVisualization.vue'
import ProjectComplexity from '@/components/ProjectComplexity.vue'
import { fetchKPIsByCategory, fetchStructureParams, fetchProgramParams, fetchFormulaTargets, extractParamValues } from '@/services/googleSheetsService'
import { KPI_BY_CATEGORY, computeKPI, updateKPITargets, evaluateKPIStatus } from '@/services/kpiFormulas'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

// --- Current calendar week (Jan 12 2026 = Week 1, +7 days per week) ---
const currentWeekNumber = computed(() => {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const week1Start = new Date(2026, 0, 12).getTime()
  const week = Math.floor((Date.now() - week1Start) / msPerWeek) + 1
  return Math.max(1, Math.min(10, week))
})

// Pick the highest available week <= current; fall back to first week
const closestWeek = (weeks) => {
  const sorted = [...weeks].sort((a, b) => Number(a) - Number(b))
  const past = sorted.filter(w => Number(w) <= currentWeekNumber.value)
  return past.length ? past[past.length - 1] : sorted[0]
}

// --- Global state ---
const isLoading = ref(false)
const loadError = ref('')

// --- Per-widget hover state ---
const hoveredStructureIndex = ref(null)
const hoveredDataIndex = ref(null)

// --- Expandable KPI cards state ---
const expandedStructureKPIs = ref(new Set())
const showStructureKPITooltip = ref(null)
const structureKPITooltipTimeouts = ref({})

const toggleExpandStructureKPI = (id) => {
  if (expandedStructureKPIs.value.has(id)) {
    expandedStructureKPIs.value.delete(id)
  } else {
    expandedStructureKPIs.value.add(id)
  }
  expandedStructureKPIs.value = new Set(expandedStructureKPIs.value)
}

const handleStructureKPIMouseEnter = (id) => {
  structureKPITooltipTimeouts.value[id] = setTimeout(() => {
    showStructureKPITooltip.value = id
  }, 1000)
}

const handleStructureKPIMouseLeave = (id) => {
  clearTimeout(structureKPITooltipTimeouts.value[id])
  delete structureKPITooltipTimeouts.value[id]
  if (showStructureKPITooltip.value === id) {
    showStructureKPITooltip.value = null
  }
}

const expandedProgramKPIs = ref(new Set())
const showProgramKPITooltip = ref(null)
const programKPITooltipTimeouts = ref({})

const toggleExpandProgramKPI = (id) => {
  if (expandedProgramKPIs.value.has(id)) {
    expandedProgramKPIs.value.delete(id)
  } else {
    expandedProgramKPIs.value.add(id)
  }
  expandedProgramKPIs.value = new Set(expandedProgramKPIs.value)
}

const handleProgramKPIMouseEnter = (id) => {
  programKPITooltipTimeouts.value[id] = setTimeout(() => {
    showProgramKPITooltip.value = id
  }, 1000)
}

const handleProgramKPIMouseLeave = (id) => {
  clearTimeout(programKPITooltipTimeouts.value[id])
  delete programKPITooltipTimeouts.value[id]
  if (showProgramKPITooltip.value === id) {
    showProgramKPITooltip.value = null
  }
}

const expandedDataKPIs = ref(new Set())
const showDataKPITooltip = ref(null)
const dataKPITooltipTimeouts = ref({})

const toggleExpandDataKPI = (id) => {
  if (expandedDataKPIs.value.has(id)) {
    expandedDataKPIs.value.delete(id)
  } else {
    expandedDataKPIs.value.add(id)
  }
  expandedDataKPIs.value = new Set(expandedDataKPIs.value)
}

const handleDataKPIMouseEnter = (id) => {
  dataKPITooltipTimeouts.value[id] = setTimeout(() => {
    showDataKPITooltip.value = id
  }, 1000)
}

const handleDataKPIMouseLeave = (id) => {
  clearTimeout(dataKPITooltipTimeouts.value[id])
  delete dataKPITooltipTimeouts.value[id]
  if (showDataKPITooltip.value === id) {
    showDataKPITooltip.value = null
  }
}

// --- Sheet data store ---
const sheetDataByCategory = ref({
  program: null,
  structure: null,
  data: null,
})

// --- Structure raw params store ---
const structureParamsData = ref({ weeks: [], scenarios: [], rows: [] })

// --- Program raw params store ---
const programParamsData = ref({ rows: [] })

// --- Per-category sheet data ---
const programSheetData = computed(() => sheetDataByCategory.value.program)
const structureSheetData = computed(() => sheetDataByCategory.value.structure)

// --- Structure widget state ---
const structureWeek = ref('')
const structureScenario = ref('')

const structureWeeks = computed(() => {
  const data = structureParamsData.value
  if (!data || !Array.isArray(data.weeks)) return []
  return data.weeks.filter(week => !/target/i.test(String(week)))
})

const structureScenarios = computed(() => {
  if (!structureWeek.value || !structureParamsData.value) return []
  const rows = structureParamsData.value.rows || []
  const scenariosForWeek = rows
    .filter(row => row && row.week === structureWeek.value)
    .map(row => row?.scenario)
    .filter(v => v && v.trim())
    .filter(v => !/target/i.test(v))
  return [...new Set(scenariosForWeek)]
})

// Compute structure KPIs from raw params using the formula engine
const structureFilteredKPIs = computed(() => {
  const rows = structureParamsData.value.rows || []
  if (!rows.length) return []

  // Calculate average parameters across all structure data rows
  const avgParams = {}
  if (rows.length > 0) {
    const firstRowParams = rows[0]?.params || {}
    const paramNames = Object.keys(firstRowParams)
    
    for (const param of paramNames) {
      let sum = 0
      let count = 0
      for (const row of rows) {
        if (row.params && row.params[param] !== undefined) {
          sum += row.params[param]
          count++
        }
      }
      avgParams[param] = count > 0 ? sum / count : 0
    }
  }

  const defs = KPI_BY_CATEGORY['structure']
  const descriptions = {
    'structural-efficiency-performance': 'Evaluates how effectively the structural system resists environmental loads while maintaining material stability. By comparing structural density with stress loads and external wind pressure, it reflects the balance between structural capacity and environmental demand. Higher values indicate a more resilient and efficient structural configuration.',
    'solar-control-performance': 'Measures how effectively the building\'s structural configuration moderates solar exposure. By relating structural density to incident solar radiation, it reflects the capacity of the structure to contribute to passive shading and solar mitigation. Higher values indicate improved control of solar gains and more stable interior conditions.',
    'filtration-efficiency': 'Quantifies the building\'s ability to mitigate external pollution through filtration systems. By comparing filtration capacity with environmental pollution intensity, it reflects how effectively airborne contaminants are reduced. Higher values indicate stronger filtration performance and improved indoor air quality.',
  }
  return defs.map(def => ({
    id: def.id,
    name: def.name,
    value: Math.round(computeKPI(def, avgParams) * 100) / 100,
    unit: def.unit,
    target: def.target,
    logic: def.logic,
    status: 'good',
    description: descriptions[def.id] || 'No description available.',
  }))
})

// Returns true when value is within ±10% of the target
const isWithinMargin = (value, target, logic = 'STRICT') => {
  const status = evaluateKPIStatus(value, target, logic)
  return status.acceptable
}

const structureSummaryCards = computed(() => {
  const targets = structureSheetData.value?.targetsByScenario?.[structureScenario.value] || []
  const formatValue = (value) => Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })
  const parseNumber = (value) => {
    if (typeof value === 'number') return value
    const sanitized = String(value || '').replace(/,/g, '')
    const match = sanitized.match(/-?\d*\.?\d+/)
    if (!match) return 0
    const parsed = Number(match[0])
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return structureFilteredKPIs.value.map((kpi, index) => {
    const value = parseNumber(kpi.value)
    const target = kpi.target ?? 0
    const delta = value - target
    const status = evaluateKPIStatus(value, target, structureFilteredKPIs.value[index]?.logic || 'STRICT')
    const withinMargin = status.acceptable
    const max = Math.max(value, target) * 1.2 || 1
    return {
      id: `structure-summary-${kpi.id}`,
      displayValue: formatValue(value),
      displayTarget: formatValue(target),
      displayDelta: formatValue(Math.abs(delta)),
      delta,
      withinMargin,
      bulletValuePct: Math.min((value / max) * 100, 100),
      bulletTargetPct: Math.min((target / max) * 100, 100),
      color: '#10b981',
    }
  })
})

const programSummaryCards = computed(() => {
  const formatValue = (value) => Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })
  const parseNumber = (value) => {
    if (typeof value === 'number') return value
    const sanitized = String(value || '').replace(/,/g, '')
    const match = sanitized.match(/-?\d*\.?\d+/)
    if (!match) return 0
    const parsed = Number(match[0])
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return programFilteredKPIs.value.map((kpi, index) => {
    const value = parseNumber(kpi.value)
    const target = kpi.target ?? 0
    const delta = value - target
    const status = evaluateKPIStatus(value, target, programFilteredKPIs.value[index]?.logic || 'STRICT')
    const withinMargin = status.acceptable
    const max = Math.max(value, target) * 1.2 || 1
    return {
      id: `program-summary-${kpi.id}`,
      displayValue: formatValue(value),
      displayTarget: formatValue(target),
      displayDelta: formatValue(Math.abs(delta)),
      delta,
      withinMargin,
      bulletValuePct: Math.min((value / max) * 100, 100),
      bulletTargetPct: Math.min((target / max) * 100, 100),
      color: '#3b82f6',
    }
  })
})

// --- Data widget state (uses structure week/scenario, no separate selectors) ---

// Average PRG param values across all program param rows
const averagePrgParams = computed(() => {
  const rows = programParamsData.value?.rows || []
  if (!rows.length) return {}

  const avgParams = {}
  if (rows.length > 0) {
    const paramNames = Object.keys(rows[0])
    
    for (const param of paramNames) {
      let sum = 0
      let count = 0
      for (const row of rows) {
        if (row[param] !== undefined && row[param] !== null) {
          sum += Number(row[param])
          count++
        }
      }
      avgParams[param] = count > 0 ? sum / count : 0
    }
  }
  return avgParams
})

// Compute program KPIs from average program parameters
const programFilteredKPIs = computed(() => {
  const rows = programParamsData.value?.rows || []
  if (!rows.length) return []

  // Calculate average parameters across all program data rows
  const avgParams = {}
  if (rows.length > 0) {
    const paramNames = Object.keys(rows[0])
    
    for (const param of paramNames) {
      let sum = 0
      let count = 0
      for (const row of rows) {
        if (row[param] !== undefined && row[param] !== null) {
          sum += Number(row[param])
          count++
        }
      }
      avgParams[param] = count > 0 ? sum / count : 0
    }
  }

  const descriptions = {
    'effective-programmatic-area': 'The EPA (Effective Programmatic Area) is used to calculate operating costs based on actual usage. It defines how well-utilized (high EPA) or under-utilized (low EPA) spaces are in relation to the total area of the building.',
    'programmatic-proximity-index': 'The PPI (Programmatic Proximity Index) evaluates a space\'s location based strictly on its functional dependencies. High values (1.0) indicate optimal connectivity to critical zones, while low values (0.0) signify operational isolation.',
    'resource-consumption-intensity-ratio': 'The RCIR (Resource Consumption Intensity Ratio) is a performance metric (0.0 – 1.0) that quantifies the estimated demand for energy, water, and data services per program. By weighting the density of equipment and occupancy (the use_ratio) against specific technical requirements, the RCIR identifies high-intensity infrastructure cores versus low-impact, passive public zones.',
  }

  const defs = KPI_BY_CATEGORY['program']
  return defs.map(def => {
    const value = computeKPI(def, avgParams)
    return {
      id: def.id,
      name: def.name,
      value: Math.round(value * 100) / 100,
      unit: def.unit,
      target: def.target,
      logic: def.logic,
      status: 'good',
      description: descriptions[def.id] || 'No description available.',
    }
  })
})

// Calculate average structure parameters across all structure data rows
const averageStructureParams = computed(() => {
  const rows = structureParamsData.value.rows || []
  if (!rows.length) return {}

  const avgParams = {}
  if (rows.length > 0) {
    const firstRowParams = rows[0]?.params || {}
    const paramNames = Object.keys(firstRowParams)
    
    for (const param of paramNames) {
      let sum = 0
      let count = 0
      for (const row of rows) {
        if (row.params && row.params[param] !== undefined) {
          sum += row.params[param]
          count++
        }
      }
      avgParams[param] = count > 0 ? sum / count : 0
    }
  }
  return avgParams
})

// Compute environment KPIs from averaged STR params + averaged PRG params + ENV defaults
const dataFilteredKPIs = computed(() => {
  const structParams = averageStructureParams.value
  const prgParams = averagePrgParams.value
  
  if (Object.keys(structParams).length === 0 || Object.keys(prgParams).length === 0) return []

  // Merge averaged STR params with averaged PRG params (ENV defaults handled by computeKPI)
  const mergedParams = { ...structParams, ...prgParams }

  const defs = KPI_BY_CATEGORY['environment']
  const descriptions = {
    'thermal-comfort-compliance-rate': 'Estimates the percentage of conditions that remain within acceptable thermal comfort ranges. By comparing structural buffering capacity with environmental pressures such as solar radiation and wind exposure, it approximates the building\'s ability to moderate external climate effects. Higher values indicate more thermally stable environments.',
    'air-purification-effectiveness': 'Estimates the mass of airborne pollutants removed by the building each day (kg/day). By combining pollution levels, program intensity, and filtration performance, it reflects the system\'s capacity to process contaminated air. Higher values indicate stronger air purification capability.',
    'acoustic-comfort-noise-impact-index': 'Estimates the level of acoustic disturbance transmitted through the building envelope. By relating environmental pressures and structural stress to the damping effect of structural density, it approximates internal noise impact. Lower values indicate improved acoustic comfort.',
  }
  return defs.map(def => ({
    id: def.id,
    name: def.name,
    value: Math.round(computeKPI(def, mergedParams) * 100) / 100,
    unit: def.unit,
    target: def.target,
    status: 'good',
    logic: def.logic,
    description: descriptions[def.id] || 'No description available.',
  }))
})

const dataSummaryCards = computed(() => {
  const formatValue = (value) => Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })
  const parseNumber = (value) => {
    if (typeof value === 'number') return value
    const sanitized = String(value || '').replace(/,/g, '')
    const match = sanitized.match(/-?\d*\.?\d+/)
    if (!match) return 0
    const parsed = Number(match[0])
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return dataFilteredKPIs.value.map((kpi) => {
    const value = parseNumber(kpi.value)
    const target = kpi.target ?? 0
    const max = Math.max(value, target) * 1.2 || 1
    const delta = value - target
    const status = evaluateKPIStatus(value, target, kpi.logic || 'STRICT')
    const withinMargin = status.acceptable
    return {
      id: `data-summary-${kpi.id}`,
      displayValue: formatValue(value),
      displayTarget: formatValue(target),
      displayDelta: formatValue(Math.abs(delta)),
      delta,
      withinMargin,
      bulletValuePct: Math.min((value / max) * 100, 100),
      bulletTargetPct: Math.min((target / max) * 100, 100),
      color: '#ef4444',
    }
  })
})

// --- localStorage helpers ---
const loadStoredSelection = (category) => {
  try {
    const stored = localStorage.getItem(`kpi-selection-${category}`)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const storeSelection = (category, week, scenario) => {
  try {
    localStorage.setItem(`kpi-selection-${category}`, JSON.stringify({ week, scenario }))
  } catch {
    // ignore
  }
}

// --- Auto-select current week when weeks load (structure) ---
watch(() => structureWeeks.value, (newWeeks) => {
  if (!newWeeks || newWeeks.length === 0) return
  const stored = loadStoredSelection('structure')
  if (stored?.week && newWeeks.includes(stored.week)) {
    structureWeek.value = stored.week
    return
  }
  if (!structureWeek.value || !newWeeks.includes(structureWeek.value)) {
    structureWeek.value = closestWeek(newWeeks)
  }
})

watch(() => structureScenarios.value, (newScenarios) => {
  if (!newScenarios || newScenarios.length === 0) return
  const stored = loadStoredSelection('structure')
  if (stored?.scenario && newScenarios.includes(stored.scenario)) {
    structureScenario.value = stored.scenario
    return
  }
  if (!structureScenario.value || !newScenarios.includes(structureScenario.value)) {
    structureScenario.value = newScenarios[0]
  }
})

watch(() => [structureWeek.value, structureScenario.value], ([week, scenario]) => {
  if (week && scenario) storeSelection('structure', week, scenario)
})

// --- Live KPI health (pushed to dashboard store) ---
const programKpiHealth = computed(() => {
  const data = programSheetData.value?.data
  const targets = programSheetData.value?.targets || []
  if (!data?.length) return { total: 0, onTarget: 0 }
  const parse = (v) => {
    if (typeof v === 'number') return v
    const m = String(v || '').replace(/,/g, '').match(/-?\d*\.?\d+/)
    return m ? Number(m[0]) : 0
  }
  const sum = (idx) => data.reduce((acc, row) => acc + parse((row.kpis || [])[idx]?.value), 0)
  const avg = (idx) => {
    const rows = data.filter(r => (r.kpis || [])[idx])
    return rows.length ? rows.reduce((acc, r) => acc + parse(r.kpis[idx].value), 0) / rows.length : 0
  }
  const values = [sum(0), avg(1), avg(2)]
  const onTarget = values.filter((v, i) => parse(targets[i]) === 0 || v - parse(targets[i]) <= 0).length
  return { total: 3, onTarget }
})

watch(
  [programKpiHealth, structureSummaryCards, dataSummaryCards],
  ([prog, strCards, dataCards]) => {
    const strOnTarget = strCards.filter(c => c.delta <= 0).length
    const dataOnTarget = dataCards.filter(c => c.delta <= 0).length
    const total = prog.total + strCards.length + dataCards.length
    const onTarget = prog.onTarget + strOnTarget + dataOnTarget
    userStore.setKpiHealth({ total, onTarget, warnings: total - onTarget })
  },
  { immediate: true }
)

// --- Data loading ---
async function loadData() {
  isLoading.value = true
  loadError.value = ''
  try {
    const [programData, structureData, strParamsResult, prgParamsResult, formulaTargets] = await Promise.all([
      fetchKPIsByCategory('program'),
      fetchKPIsByCategory('structure'),
      fetchStructureParams(),
      fetchProgramParams(),
      fetchFormulaTargets(),
    ])
    
    // Update KPI targets from the FORMULA sheet
    if (formulaTargets && Object.keys(formulaTargets).length > 0) {
      updateKPITargets(formulaTargets)
    }
    
    sheetDataByCategory.value = {
      program: programData,
      structure: structureData,
      data: null,
    }
    structureParamsData.value = strParamsResult
    programParamsData.value = prgParamsResult
  } catch (error) {
    console.error('Failed to load KPI data:', error)
    loadError.value = `Error: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
  const storedStructure = loadStoredSelection('structure')
  if (storedStructure) {
    structureWeek.value = storedStructure.week || ''
    structureScenario.value = storedStructure.scenario || ''
  }
})
</script>

<style scoped>
</style>
