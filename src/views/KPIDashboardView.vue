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

      <!-- Legend -->
      <div v-if="!isLoading && !loadError" class="flex items-center gap-4 flex-wrap text-xs bg-white border border-slate-100 rounded-lg px-4 py-2.5">
        <span class="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Status</span>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-green-500 inline-block flex-none"></span>
          <span class="text-slate-600">Within target range</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-red-500 inline-block flex-none"></span>
          <span class="text-slate-600">Outside target range</span>
        </div>
        <div class="border-l border-slate-200 h-4 mx-1"></div>
        <span class="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Logic</span>
        <div class="flex items-center gap-1.5">
          <span class="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded font-medium">MAX</span>
          <span class="text-slate-600">higher is better</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-medium">MIN</span>
          <span class="text-slate-600">lower is better</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-medium">STRICT</span>
          <span class="text-slate-600">within ±10% of target</span>
        </div>
        <div class="border-l border-slate-200 h-4 mx-1"></div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-1 inline-block" style="background: linear-gradient(to right, #94a3b8, transparent);"></span>
          <span class="text-slate-500 italic">Hover a card to see description &amp; formula</span>
        </div>
      </div>

      <!-- Row 1: Program | Structure | Data -->
      <div v-if="!isLoading && !loadError" class="grid lg:grid-cols-3 gap-6 items-stretch">

        <!-- Program Widget -->
        <div class="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900" style="color: #3b82f6;">Program</h2>
            <p class="text-xs text-slate-500">Space usage and program KPIs</p>
          </div>

          <div v-if="programFilteredKPIs.length > 0" class="space-y-3">
            <div
              v-for="(kpi, index) in programFilteredKPIs"
              :key="kpi.id"
              class="group bg-slate-50 rounded-lg border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <h3 class="text-xs font-semibold text-slate-700">{{ kpi.name }}</h3>
                    <p class="text-[11px] text-slate-500">{{ kpi.unit }}</p>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <div :class="['w-2 h-2 rounded-full', programSummaryCards[index] ? (programSummaryCards[index].withinMargin ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-300']"></div>
                    <span :class="['text-[9px] px-1.5 py-0.5 rounded font-medium', getLogicBadgeColor(kpi.logic)]">
                      {{ kpi.logic }}
                    </span>
                  </div>
                </div>
                <!-- Hover-expand: description + formula -->
                <div class="max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-96 group-hover:opacity-100">
                  <div class="bg-slate-100 -mx-4 px-4 py-2 mb-3 border-t border-b border-slate-200">
                    <p class="text-xs text-slate-600 leading-relaxed">{{ kpi.description }}</p>
                    <div class="mt-2 pt-2 border-t border-slate-200">
                      <p class="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Formula</p>
                      <code class="text-xs bg-white text-slate-700 rounded border border-slate-200 px-2 py-1 block font-mono">{{ kpi.formula }}</code>
                    </div>
                  </div>
                </div>
                <div class="text-2xl font-bold text-slate-900 mb-3">{{ formatNumberDE(kpi.value) }}</div>
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

          <div v-if="structureFilteredKPIs.length > 0" class="space-y-3">
            <div
              v-for="(kpi, index) in structureFilteredKPIs"
              :key="kpi.id"
              class="group bg-slate-50 rounded-lg border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <h3 class="text-xs font-semibold text-slate-700">{{ kpi.name }}</h3>
                    <p class="text-[11px] text-slate-500">{{ kpi.unit }}</p>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <div :class="['w-2 h-2 rounded-full', structureSummaryCards[index] ? (structureSummaryCards[index].withinMargin ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-300']"></div>
                    <span :class="['text-[9px] px-1.5 py-0.5 rounded font-medium', getLogicBadgeColor(kpi.logic)]">
                      {{ kpi.logic }}
                    </span>
                  </div>
                </div>
                <!-- Hover-expand: description + formula -->
                <div class="max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-96 group-hover:opacity-100">
                  <div class="bg-slate-100 -mx-4 px-4 py-2 mb-3 border-t border-b border-slate-200">
                    <p class="text-xs text-slate-600 leading-relaxed">{{ kpi.description }}</p>
                    <div class="mt-2 pt-2 border-t border-slate-200">
                      <p class="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Formula</p>
                      <code class="text-xs bg-white text-slate-700 rounded border border-slate-200 px-2 py-1 block font-mono">{{ kpi.formula }}</code>
                    </div>
                  </div>
                </div>
                <div class="text-2xl font-bold text-slate-900 mb-3">{{ formatNumberDE(kpi.value) }}</div>
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

          <div v-if="dataFilteredKPIs.length > 0" class="space-y-3">
            <div
              v-for="(kpi, index) in dataFilteredKPIs"
              :key="kpi.id"
              class="group bg-slate-50 rounded-lg border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <h3 class="text-xs font-semibold text-slate-700">{{ kpi.name }}</h3>
                    <p class="text-[11px] text-slate-500">{{ kpi.unit }}</p>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <div :class="['w-2 h-2 rounded-full', dataSummaryCards[index] ? (dataSummaryCards[index].withinMargin ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-300']"></div>
                    <span :class="['text-[9px] px-1.5 py-0.5 rounded font-medium', getLogicBadgeColor(kpi.logic)]">
                      {{ kpi.logic }}
                    </span>
                  </div>
                </div>
                <!-- Hover-expand: description + formula -->
                <div class="max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-96 group-hover:opacity-100">
                  <div class="bg-slate-100 -mx-4 px-4 py-2 mb-3 border-t border-b border-slate-200">
                    <p class="text-xs text-slate-600 leading-relaxed">{{ kpi.description }}</p>
                    <div class="mt-2 pt-2 border-t border-slate-200">
                      <p class="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Formula</p>
                      <code class="text-xs bg-white text-slate-700 rounded border border-slate-200 px-2 py-1 block font-mono">{{ kpi.formula }}</code>
                    </div>
                  </div>
                </div>
                <div class="text-2xl font-bold text-slate-900 mb-3">{{ formatNumberDE(kpi.value) }}</div>
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

      <!-- Row 2: Performance Overview -->
      <div v-if="!isLoading && !loadError" class="bg-white rounded-lg border border-slate-200 p-6 space-y-8">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Performance Overview</h2>
          <p class="text-slate-500 text-sm">Headline KPIs per team and system-wide balance against targets.</p>
        </div>

        <!-- Radial Gauges (headline KPI per team) -->
        <div>
          <p class="text-xs text-slate-400 uppercase tracking-wider mb-5">Team Headline KPIs</p>
          <div class="flex justify-around items-start gap-4 flex-wrap">
            <div v-for="g in gaugeItems" :key="g.team" class="flex flex-col items-center gap-1 min-w-36">
              <p class="text-xs font-bold uppercase tracking-wider" :style="{ color: g.color }">{{ g.team }}</p>
              <svg viewBox="0 0 130 130" width="160" height="160">
                <!-- Background track (270° arc) -->
                <circle
                  cx="65" cy="65" r="54"
                  fill="none" stroke="#e2e8f0" stroke-width="10"
                  :stroke-dasharray="`${GAUGE_ARC_LENGTH} ${GAUGE_CIRCUMFERENCE}`"
                  stroke-linecap="round"
                  transform="rotate(135, 65, 65)"
                />
                <!-- Progress arc -->
                <circle
                  v-if="g.kpi"
                  cx="65" cy="65" r="54"
                  fill="none" :stroke="g.color" stroke-width="10"
                  :stroke-dasharray="`${g.progress * GAUGE_ARC_LENGTH} ${GAUGE_CIRCUMFERENCE}`"
                  stroke-linecap="round"
                  transform="rotate(135, 65, 65)"
                />
                <!-- Center: value -->
                <text x="65" y="58" text-anchor="middle" style="font-size: 17px; font-weight: 800; fill: #0f172a;">
                  {{ g.displayValue }}
                </text>
                <!-- Unit -->
                <text x="65" y="73" text-anchor="middle" style="font-size: 9px; fill: #94a3b8;">
                  {{ g.unit }}
                </text>
                <!-- vs target -->
                <text x="65" y="90" text-anchor="middle" style="font-size: 8px; fill: #cbd5e1;">
                  target {{ g.displayTarget }}
                </text>
              </svg>
              <p class="text-[11px] text-slate-500 text-center leading-tight max-w-32">{{ g.name }}</p>
              <!-- Status indicator -->
              <div class="flex items-center gap-1 mt-1">
                <span :class="['w-1.5 h-1.5 rounded-full', g.withinMargin ? 'bg-green-500' : 'bg-red-500']"></span>
                <span :class="['text-[9px] font-medium', g.withinMargin ? 'text-green-600' : 'text-red-600']">
                  {{ g.withinMargin ? 'On target' : 'Off target' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Radar Chart (all 9 KPIs vs targets) -->
        <div v-if="radarCurrentPoints">
          <p class="text-xs text-slate-400 uppercase tracking-wider mb-3">All KPIs vs Targets</p>
          <div class="flex items-center justify-center gap-6 mb-3 flex-wrap">
            <div class="flex items-center gap-1.5">
              <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4 2"/></svg>
              <span class="text-[10px] text-slate-400">Target</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#6366f1" stroke-width="2"/></svg>
              <span class="text-[10px] text-slate-400">Current state</span>
            </div>
          </div>
          <div class="flex justify-center overflow-x-auto">
            <svg viewBox="0 0 500 440" width="100%" style="max-width: 560px; min-width: 320px;">

              <!-- Concentric reference rings -->
              <polygon
                v-for="(ringPts, ri) in radarRings"
                :key="`ring-${ri}`"
                :points="ringPts"
                fill="none"
                stroke="#f1f5f9"
                stroke-width="1"
              />

              <!-- Axes -->
              <line
                v-for="ax in radarAxes"
                :key="`ax-${ax.label}`"
                :x1="RADAR_CX" :y1="RADAR_CY"
                :x2="ax.axisEndX" :y2="ax.axisEndY"
                stroke="#e2e8f0" stroke-width="1"
              />

              <!-- Target polygon -->
              <polygon
                :points="radarTargetPoints"
                fill="none"
                stroke="#cbd5e1"
                stroke-width="1.5"
                stroke-dasharray="5 3"
              />

              <!-- Current state polygon -->
              <polygon
                :points="radarCurrentPoints"
                fill="rgba(99,102,241,0.12)"
                stroke="#6366f1"
                stroke-width="2"
                stroke-linejoin="round"
              />

              <!-- Axis labels -->
              <text
                v-for="ax in radarAxes"
                :key="`lbl-${ax.label}`"
                :x="ax.labelX" :y="ax.labelY"
                text-anchor="middle"
                dominant-baseline="central"
                style="font-size: 10px; font-weight: 600; fill: #64748b;"
              >{{ ax.label }}</text>

            </svg>
          </div>
        </div>

      </div>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { fetchKPIsByCategory, fetchStructureParams, fetchProgramParams, fetchFormulaTargets } from '@/services/googleSheetsService'
import { KPI_BY_CATEGORY, computeKPI, updateKPITargets, evaluateKPIStatus } from '@/services/kpiFormulas'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

// --- German number formatter ---
const formatNumberDE = (value) => {
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value))
}

// --- Logic type badge helper ---
const getLogicBadgeColor = (logic) => {
  if (logic === 'MIN') return 'bg-blue-100 text-blue-700'
  if (logic === 'MAX') return 'bg-purple-100 text-purple-700'
  return 'bg-amber-100 text-amber-700' // STRICT
}

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
  let rows = structureParamsData.value.rows || []
  if (!rows.length) return []

  const avgParams = {}
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

  const defs = KPI_BY_CATEGORY['structure']
  const descriptions = {
    'structural-efficiency-performance': 'Evaluates how effectively the structural system resists environmental loads while maintaining material stability. By comparing structural density with stress loads and external wind pressure, it reflects the balance between structural capacity and environmental demand. Higher values indicate a more resilient and efficient structural configuration.',
    'solar-control-performance': 'Measures how effectively the building\'s structural configuration moderates solar exposure. By relating structural density to incident solar radiation, it reflects the capacity of the structure to contribute to passive shading and solar mitigation. Higher values indicate improved control of solar gains and more stable interior conditions.',
    'filtration-efficiency': 'Quantifies the building\'s ability to mitigate external pollution through filtration systems. By comparing filtration capacity with environmental pollution intensity, it reflects how effectively airborne contaminants are reduced. Higher values indicate stronger filtration performance and improved indoor air quality.',
  }
  return defs.map(def => {
    let value
    if (def.computeAggregate) {
      const paramRows = rows.map(r => r.params || {})
      value = Math.round(def.computeAggregate(paramRows) * 100) / 100
    } else {
      value = Math.round(computeKPI(def, avgParams) * 100) / 100
    }
    return {
      id: def.id,
      name: def.name,
      value,
      unit: def.unit,
      target: def.target,
      logic: def.logic,
      formula: def.formula,
      description: descriptions[def.id] || 'No description available.',
    }
  })
})

const isWithinMargin = (value, target, logic = 'STRICT') => {
  const status = evaluateKPIStatus(value, target, logic)
  return status.acceptable
}

const structureSummaryCards = computed(() => {
  const formatValue = (value) => formatNumberDE(value)
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
  const formatValue = (value) => formatNumberDE(value)
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

// Average PRG param values
const averagePrgParams = computed(() => {
  const rows = programParamsData.value?.rows || []
  if (!rows.length) return {}
  const avgParams = {}
  const paramNames = Object.keys(rows[0])
  for (const param of paramNames) {
    let sum = 0, count = 0
    for (const row of rows) {
      if (row[param] !== undefined && row[param] !== null) { sum += Number(row[param]); count++ }
    }
    avgParams[param] = count > 0 ? sum / count : 0
  }
  return avgParams
})

// Compute program KPIs from average program parameters
const programFilteredKPIs = computed(() => {
  const rows = programParamsData.value?.rows || []
  if (!rows.length) return []

  const avgParams = {}
  const paramNames = Object.keys(rows[0])
  for (const param of paramNames) {
    let sum = 0, count = 0
    for (const row of rows) {
      if (row[param] !== undefined && row[param] !== null) { sum += Number(row[param]); count++ }
    }
    avgParams[param] = count > 0 ? sum / count : 0
  }

  const descriptions = {
    'effective-programmatic-area': 'The EPA (Effective Programmatic Area) is used to calculate operating costs based on actual usage. It defines how well-utilized (high EPA) or under-utilized (low EPA) spaces are in relation to the total area of the building.',
    'programmatic-proximity-index': 'The PPI (Programmatic Proximity Index) evaluates a space\'s location based strictly on its functional dependencies. High values (1.0) indicate optimal connectivity to critical zones, while low values (0.0) signify operational isolation.',
    'resource-consumption-intensity-ratio': 'The RCIR (Resource Consumption Intensity Ratio) is a performance metric (0.0 – 1.0) that quantifies the estimated demand for energy, water, and data services per program. By weighting the density of equipment and occupancy (the use_ratio) against specific technical requirements, the RCIR identifies high-intensity infrastructure cores versus low-impact, passive public zones.',
  }

  const defs = KPI_BY_CATEGORY['program']
  return defs.map(def => {
    let value
    if (def.computeAggregate) {
      value = def.computeAggregate(rows)
    } else {
      value = computeKPI(def, avgParams)
    }
    return {
      id: def.id,
      name: def.name,
      value: Math.round(value * 100) / 100,
      unit: def.unit,
      target: def.target,
      logic: def.logic,
      formula: def.formula,
      description: descriptions[def.id] || 'No description available.',
    }
  })
})

// Average structure params
const averageStructureParams = computed(() => {
  const rows = structureParamsData.value.rows || []
  if (!rows.length) return {}
  const avgParams = {}
  const paramNames = Object.keys(rows[0]?.params || {})
  for (const param of paramNames) {
    let sum = 0, count = 0
    for (const row of rows) {
      if (row.params && row.params[param] !== undefined) { sum += row.params[param]; count++ }
    }
    avgParams[param] = count > 0 ? sum / count : 0
  }
  return avgParams
})

// Compute environment KPIs
const dataFilteredKPIs = computed(() => {
  const structParams = averageStructureParams.value
  const prgParams = averagePrgParams.value
  if (Object.keys(structParams).length === 0 || Object.keys(prgParams).length === 0) return []

  const structRows = structureParamsData.value.rows || []
  const mergedRows = structRows.map(row => ({ params: { ...row.params, ...prgParams } }))
  const mergedParams = { ...structParams, ...prgParams }

  const defs = KPI_BY_CATEGORY['environment']
  const descriptions = {
    'thermal-comfort-compliance-rate': 'Estimates the percentage of conditions that remain within acceptable thermal comfort ranges. By comparing structural buffering capacity with environmental pressures such as solar radiation and wind exposure, it approximates the building\'s ability to moderate external climate effects. Higher values indicate more thermally stable environments.',
    'air-purification-effectiveness': 'Estimates the percentage of airborne pollutants removed by the building. By normalizing pollution levels and combining with program intensity and filtration performance, it reflects the system\'s capacity to process contaminated air. Higher values indicate stronger air purification capability.',
    'acoustic-comfort-noise-impact-index': 'Estimates the level of acoustic disturbance transmitted through the building envelope. By relating environmental pressures and structural stress to the damping effect of structural density, it approximates internal noise impact. Lower values indicate improved acoustic comfort.',
  }
  return defs.map(def => {
    let value
    if (def.computeAggregate && def.id === 'thermal-comfort-compliance-rate') {
      value = Math.round(def.computeAggregate(structRows.map(r => r.params || {})) * 100) / 100
    } else if (def.computeAggregate && def.id === 'air-purification-effectiveness') {
      value = Math.round(def.computeAggregate(mergedRows.map(r => r.params || {})) * 100) / 100
    } else {
      value = Math.round(computeKPI(def, mergedParams) * 100) / 100
    }
    return {
      id: def.id,
      name: def.name,
      value,
      unit: def.unit,
      target: def.target,
      logic: def.logic,
      formula: def.formula,
      description: descriptions[def.id] || 'No description available.',
    }
  })
})

const dataSummaryCards = computed(() => {
  const formatValue = (value) => formatNumberDE(value)
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

// ─── Gauge constants & helpers ────────────────────────────────────────────────

const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 54       // ≈ 339.29
const GAUGE_ARC_LENGTH = 0.75 * GAUGE_CIRCUMFERENCE // 270° = ≈ 254.47

function formatGaugeValue(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(2)
}

const gaugeItems = computed(() => {
  const entries = [
    { kpi: programFilteredKPIs.value[0],   color: '#3b82f6', team: 'Program'   },
    { kpi: structureFilteredKPIs.value[0], color: '#10b981', team: 'Structure' },
    { kpi: dataFilteredKPIs.value[0],      color: '#ef4444', team: 'Data'      },
  ]
  return entries.map(({ kpi, color, team }) => {
    if (!kpi) return { kpi: null, color, team, progress: 0, displayValue: '—', displayTarget: '—', unit: '', name: '', withinMargin: false }
    const value = Number(kpi.value) || 0
    const target = Number(kpi.target) || 1
    const progress = Math.min(value / target, 1)
    return {
      kpi, color, team, progress,
      displayValue: formatGaugeValue(value),
      displayTarget: formatGaugeValue(target),
      unit: kpi.unit,
      name: kpi.name,
      withinMargin: evaluateKPIStatus(value, target, kpi.logic || 'STRICT').acceptable,
    }
  })
})

// ─── Radar chart constants & helpers ─────────────────────────────────────────

const RADAR_LABELS = ['EPA', 'PPI', 'RCIR', 'SE', 'SCP', 'FiltEff', 'TCR', 'APE', 'ACNI']
const RADAR_CX = 250, RADAR_CY = 220, RADAR_MAX_R = 150
const RADAR_N = 9

function axisAngle(i) {
  return (-90 + i * (360 / RADAR_N)) * Math.PI / 180
}

function kpiToRadarScore(kpi) {
  const value = Number(kpi.value) || 0
  const target = Number(kpi.target) || 1
  if (kpi.logic === 'MAX') return Math.min(value / target, 1.2)
  if (kpi.logic === 'MIN') return Math.min(target / Math.max(value, 0.001), 1.2)
  // STRICT
  return Math.max(0, 1 - Math.abs(value - target) / (target * 0.3))
}

function radarScoreToR(score) {
  return (Math.min(score, 1.2) / 1.2) * RADAR_MAX_R
}

function axisPoint(i, r) {
  const a = axisAngle(i)
  return { x: RADAR_CX + r * Math.cos(a), y: RADAR_CY + r * Math.sin(a) }
}

const radarCurrentPoints = computed(() => {
  const all = [...programFilteredKPIs.value, ...structureFilteredKPIs.value, ...dataFilteredKPIs.value]
  if (all.length < RADAR_N) return ''
  return all.map((kpi, i) => {
    const pt = axisPoint(i, radarScoreToR(kpiToRadarScore(kpi)))
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
  }).join(' ')
})

const radarTargetPoints = computed(() => {
  const r = (1.0 / 1.2) * RADAR_MAX_R   // score = 1.0 → 83.3% of maxR
  return Array.from({ length: RADAR_N }, (_, i) => {
    const pt = axisPoint(i, r)
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
  }).join(' ')
})

const radarAxes = computed(() => {
  return Array.from({ length: RADAR_N }, (_, i) => {
    const end = axisPoint(i, RADAR_MAX_R)
    const lbl = axisPoint(i, RADAR_MAX_R + 24)
    return {
      label: RADAR_LABELS[i],
      axisEndX: end.x.toFixed(1),
      axisEndY: end.y.toFixed(1),
      labelX: lbl.x.toFixed(1),
      labelY: lbl.y.toFixed(1),
    }
  })
})

const radarRings = computed(() => {
  return [0.25, 0.5, 0.75, 1.0].map(frac => {
    const r = frac * RADAR_MAX_R
    return Array.from({ length: RADAR_N }, (_, i) => {
      const pt = axisPoint(i, r)
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
    }).join(' ')
  })
})

// ─── localStorage helpers ─────────────────────────────────────────────────────

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
  } catch { /* ignore */ }
}

// ─── Watchers ─────────────────────────────────────────────────────────────────

watch(() => structureWeeks.value, (newWeeks) => {
  if (!newWeeks || newWeeks.length === 0) return
  const stored = loadStoredSelection('structure')
  if (stored?.week && newWeeks.includes(stored.week)) { structureWeek.value = stored.week; return }
  if (!structureWeek.value || !newWeeks.includes(structureWeek.value)) {
    structureWeek.value = closestWeek(newWeeks)
  }
})

watch(() => structureScenarios.value, (newScenarios) => {
  if (!newScenarios || newScenarios.length === 0) return
  const stored = loadStoredSelection('structure')
  if (stored?.scenario && newScenarios.includes(stored.scenario)) { structureScenario.value = stored.scenario; return }
  if (!structureScenario.value || !newScenarios.includes(structureScenario.value)) {
    structureScenario.value = newScenarios[0]
  }
})

watch(() => [structureWeek.value, structureScenario.value], ([week, scenario]) => {
  if (week && scenario) storeSelection('structure', week, scenario)
})

watch(
  [programSummaryCards, structureSummaryCards, dataSummaryCards],
  ([progCards, strCards, dataCards]) => {
    const progOnTarget  = progCards.filter(c => c.withinMargin).length
    const strOnTarget   = strCards.filter(c => c.withinMargin).length
    const dataOnTarget  = dataCards.filter(c => c.withinMargin).length
    const total    = progCards.length + strCards.length + dataCards.length
    const onTarget = progOnTarget + strOnTarget + dataOnTarget
    userStore.setKpiHealth({ total, onTarget, warnings: total - onTarget })
  },
  { immediate: true }
)

// ─── Data loading ─────────────────────────────────────────────────────────────

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
    if (formulaTargets && Object.keys(formulaTargets).length > 0) {
      updateKPITargets(formulaTargets)
    }
    sheetDataByCategory.value = { program: programData, structure: structureData, data: null }
    structureParamsData.value = strParamsResult
    programParamsData.value   = prgParamsResult
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
    structureWeek.value    = storedStructure.week     || ''
    structureScenario.value = storedStructure.scenario || ''
  }
})
</script>

<style scoped>
</style>
