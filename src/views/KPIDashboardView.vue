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

      <!-- Row 1: Program | Structure | Data -->
      <div v-else class="grid lg:grid-cols-3 gap-6 items-stretch">

        <!-- Program Widget -->
        <div class="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900" style="color: #3b82f6;">Program</h2>
            <p class="text-xs text-slate-500">Space usage and program KPIs</p>
          </div>
          <ProgramKPISelector v-if="programSheetData" :sheetData="programSheetData" />
          <p v-else class="text-slate-400 text-sm">No program data available</p>
        </div>

        <!-- Structure Widget -->
        <div class="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div>
            <h2 class="text-lg font-bold" style="color: #10b981;">Structure</h2>
            <p class="text-xs text-slate-500">Structural performance KPIs</p>
          </div>

          <!-- Structure Selectors -->
          <div class="flex flex-wrap gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-700">Week</label>
              <select v-model="structureWeek" class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm">
                <option value="">Select Week</option>
                <option v-for="week in structureWeeks" :key="week" :value="week">{{ week }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-700">Scenario</label>
              <select v-model="structureScenario" class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm">
                <option value="">Select Scenario</option>
                <option v-for="scenario in structureScenarios" :key="scenario" :value="scenario">{{ scenario }}</option>
              </select>
            </div>
          </div>

          <!-- Spacer matching Program's Space Name row -->
          <div class="flex flex-col gap-1 invisible" aria-hidden="true">
            <label class="text-xs font-medium text-slate-700">Space Name</label>
            <div class="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm">&nbsp;</div>
          </div>

          <!-- Structure KPI Cards with inline bullet charts -->
          <div v-if="structureFilteredKPIs.length > 0" class="space-y-3">
            <div
              v-for="(kpi, index) in structureFilteredKPIs"
              :key="kpi.id"
              class="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
              @mouseenter="hoveredStructureIndex = index"
              @mouseleave="hoveredStructureIndex = null"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <h3 class="text-xs font-semibold text-slate-700">{{ kpi.name }}</h3>
                  <p class="text-[11px] text-slate-500">{{ kpi.unit }}</p>
                </div>
                <div :class="['w-2 h-2 rounded-full flex-shrink-0 mt-0.5', structureSummaryCards[index] ? (structureSummaryCards[index].delta <= 0 ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-300']"></div>
              </div>
              <div class="text-2xl font-bold text-slate-900 mb-3">{{ typeof kpi.value === 'number' ? kpi.value.toFixed(2) : kpi.value }}</div>
              <template v-if="structureSummaryCards[index]">
                <div class="text-[11px] text-slate-500">Target: {{ structureSummaryCards[index].displayTarget }}</div>
                <div class="flex items-center gap-2 mt-1 mb-3">
                  <span :class="['text-[10px] px-2 py-0.5 rounded-full border', structureSummaryCards[index].delta <= 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200']">
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

          <p v-else-if="!structureWeek || !structureScenario" class="text-slate-400 text-sm">Select a week and scenario to view data</p>
        </div>

        <!-- Data Widget -->
        <div class="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div>
            <h2 class="text-lg font-bold" style="color: #ef4444;">Data</h2>
            <p class="text-xs text-slate-500">Data environment KPIs</p>
          </div>

          <!-- Data Selectors -->
          <div class="flex flex-wrap gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-700">Week</label>
              <select v-model="dataWeek" class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm">
                <option value="">Select Week</option>
                <option v-for="week in dataWeeks" :key="week" :value="week">{{ week }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-700">Scenario</label>
              <select v-model="dataScenario" class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm">
                <option value="">Select Scenario</option>
                <option v-for="scenario in dataScenarios" :key="scenario" :value="scenario">{{ scenario }}</option>
              </select>
            </div>
          </div>

          <!-- Spacer matching Program's Space Name row -->
          <div class="flex flex-col gap-1 invisible" aria-hidden="true">
            <label class="text-xs font-medium text-slate-700">Space Name</label>
            <div class="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm">&nbsp;</div>
          </div>

          <!-- Data KPI Cards with inline bullet charts -->
          <div v-if="dataFilteredKPIs.length > 0" class="space-y-3">
            <div
              v-for="(kpi, index) in dataFilteredKPIs"
              :key="kpi.id"
              class="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
              @mouseenter="hoveredDataIndex = index"
              @mouseleave="hoveredDataIndex = null"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <h3 class="text-xs font-semibold text-slate-700">{{ kpi.name }}</h3>
                  <p class="text-[11px] text-slate-500">{{ kpi.unit }}</p>
                </div>
                <div :class="['w-2 h-2 rounded-full flex-shrink-0 mt-0.5', dataSummaryCards[index] ? (dataSummaryCards[index].delta <= 0 ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-300']"></div>
              </div>
              <div class="text-2xl font-bold text-slate-900 mb-3">{{ typeof kpi.value === 'number' ? kpi.value.toFixed(2) : kpi.value }}</div>
              <template v-if="dataSummaryCards[index]">
                <div class="text-[11px] text-slate-500">Target: {{ dataSummaryCards[index].displayTarget }}</div>
                <div class="flex items-center gap-2 mt-1 mb-3">
                  <span :class="['text-[10px] px-2 py-0.5 rounded-full border', dataSummaryCards[index].delta <= 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200']">
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

          <p v-else-if="!dataWeek || !dataScenario" class="text-slate-400 text-sm">Select a week and scenario to view data</p>
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
import { fetchKPIsByCategory, getKPIsForSelection } from '@/services/googleSheetsService'

// --- Global state ---
const isLoading = ref(false)
const loadError = ref('')

// --- Per-widget hover state ---
const hoveredStructureIndex = ref(null)
const hoveredDataIndex = ref(null)

// --- Sheet data store ---
const sheetDataByCategory = ref({
  program: null,
  structure: null,
  data: null,
})

// --- Per-category sheet data ---
const programSheetData = computed(() => sheetDataByCategory.value.program)
const structureSheetData = computed(() => sheetDataByCategory.value.structure)
const dataSheetData = computed(() => sheetDataByCategory.value.data)

// --- Structure widget state ---
const structureWeek = ref('')
const structureScenario = ref('')

const structureWeeks = computed(() => {
  const data = structureSheetData.value
  if (!data || !Array.isArray(data.weeks)) return []
  return data.weeks.filter(week => !/target/i.test(String(week)))
})

const structureScenarios = computed(() => {
  if (!structureWeek.value || !structureSheetData.value) return []
  const rows = structureSheetData.value.data || []
  const scenariosForWeek = rows
    .filter(row => row && row.week === structureWeek.value)
    .map(row => row?.scenario)
    .filter(v => v && v.trim())
    .filter(v => !/target/i.test(v))
  return [...new Set(scenariosForWeek)]
})

const structureFilteredKPIs = computed(() => {
  if (!structureWeek.value || !structureScenario.value || !structureSheetData.value) return []
  const result = getKPIsForSelection(structureSheetData.value, structureWeek.value, structureScenario.value)
  return Array.isArray(result) ? result : []
})

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
    const target = parseNumber(targets[index])
    const max = Math.max(value, target) * 1.2 || 1
    const delta = value - target
    return {
      id: `structure-summary-${kpi.id}`,
      displayValue: formatValue(value),
      displayTarget: formatValue(target),
      displayDelta: formatValue(delta),
      delta,
      bulletValuePct: Math.min((value / max) * 100, 100),
      bulletTargetPct: Math.min((target / max) * 100, 100),
      color: '#10b981',
    }
  })
})

// --- Data widget state ---
const dataWeek = ref('')
const dataScenario = ref('')

const dataWeeks = computed(() => {
  const data = dataSheetData.value
  if (!data || !Array.isArray(data.weeks)) return []
  return data.weeks.filter(week => !/target/i.test(String(week)))
})

const dataScenarios = computed(() => {
  if (!dataWeek.value || !dataSheetData.value) return []
  const rows = dataSheetData.value.data || []
  const scenariosForWeek = rows
    .filter(row => row && row.week === dataWeek.value)
    .map(row => row?.scenario)
    .filter(v => v && v.trim())
    .filter(v => !/target/i.test(v))
  return [...new Set(scenariosForWeek)]
})

const dataFilteredKPIs = computed(() => {
  if (!dataWeek.value || !dataScenario.value || !dataSheetData.value) return []
  const result = getKPIsForSelection(dataSheetData.value, dataWeek.value, dataScenario.value)
  return Array.isArray(result) ? result : []
})

const dataSummaryCards = computed(() => {
  const targets = dataSheetData.value?.targetsByScenario?.[dataScenario.value] || []
  const formatValue = (value) => Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })
  const parseNumber = (value) => {
    if (typeof value === 'number') return value
    const sanitized = String(value || '').replace(/,/g, '')
    const match = sanitized.match(/-?\d*\.?\d+/)
    if (!match) return 0
    const parsed = Number(match[0])
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return dataFilteredKPIs.value.map((kpi, index) => {
    const value = parseNumber(kpi.value)
    const target = parseNumber(targets[index])
    const max = Math.max(value, target) * 1.2 || 1
    const delta = value - target
    return {
      id: `data-summary-${kpi.id}`,
      displayValue: formatValue(value),
      displayTarget: formatValue(target),
      displayDelta: formatValue(delta),
      delta,
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

// --- Auto-select first week when weeks load (structure) ---
watch(() => structureWeeks.value, (newWeeks) => {
  if (!newWeeks || newWeeks.length === 0) return
  const stored = loadStoredSelection('structure')
  if (stored?.week && newWeeks.includes(stored.week)) {
    structureWeek.value = stored.week
    return
  }
  if (!structureWeek.value || !newWeeks.includes(structureWeek.value)) {
    structureWeek.value = newWeeks[0]
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

// --- Auto-select first week when weeks load (data) ---
watch(() => dataWeeks.value, (newWeeks) => {
  if (!newWeeks || newWeeks.length === 0) return
  const stored = loadStoredSelection('data')
  if (stored?.week && newWeeks.includes(stored.week)) {
    dataWeek.value = stored.week
    return
  }
  if (!dataWeek.value || !newWeeks.includes(dataWeek.value)) {
    dataWeek.value = newWeeks[0]
  }
})

watch(() => dataScenarios.value, (newScenarios) => {
  if (!newScenarios || newScenarios.length === 0) return
  const stored = loadStoredSelection('data')
  if (stored?.scenario && newScenarios.includes(stored.scenario)) {
    dataScenario.value = stored.scenario
    return
  }
  if (!dataScenario.value || !newScenarios.includes(dataScenario.value)) {
    dataScenario.value = newScenarios[0]
  }
})

watch(() => [dataWeek.value, dataScenario.value], ([week, scenario]) => {
  if (week && scenario) storeSelection('data', week, scenario)
})

// --- Data loading ---
async function loadData() {
  isLoading.value = true
  loadError.value = ''
  try {
    const [programData, structureData, dataData] = await Promise.all([
      fetchKPIsByCategory('program'),
      fetchKPIsByCategory('structure'),
      fetchKPIsByCategory('data'),
    ])
    sheetDataByCategory.value = {
      program: programData,
      structure: structureData,
      data: dataData,
    }
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
  const storedData = loadStoredSelection('data')
  if (storedData) {
    dataWeek.value = storedData.week || ''
    dataScenario.value = storedData.scenario || ''
  }
})
</script>

<style scoped>
</style>
