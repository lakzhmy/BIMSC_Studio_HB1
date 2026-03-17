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
          <span class="text-slate-700 font-bold text-[11px] leading-none">✓</span>
          <span class="text-slate-600">On target</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-slate-700 font-bold text-[11px] leading-none">▲</span>
          <span class="text-slate-600">Off target</span>
        </div>
        <div class="border-l border-slate-200 h-4 mx-1"></div>
        <span class="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Logic</span>
        <div class="flex items-center gap-1.5">
          <span class="bg-slate-100 text-slate-600 border border-slate-200 text-xs px-2 py-0.5 rounded-md font-bold tracking-wide">MAX ↑</span>
          <span class="text-slate-600">higher is better</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="bg-slate-100 text-slate-600 border border-slate-200 text-xs px-2 py-0.5 rounded-md font-bold tracking-wide">MIN ↓</span>
          <span class="text-slate-600">lower is better</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="bg-slate-100 text-slate-600 border border-slate-200 text-xs px-2 py-0.5 rounded-md font-bold tracking-wide">STRICT ⊙</span>
          <span class="text-slate-600">within ±10% of target</span>
        </div>
        <div class="border-l border-slate-200 h-4 mx-1"></div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-1 inline-block" style="background: linear-gradient(to right, #94a3b8, transparent);"></span>
          <span class="text-slate-500 italic">Click ▾ on a card to expand description &amp; formula</span>
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
            <KPICard
              v-for="kpi in programFilteredKPIs"
              :key="kpi.id"
              :kpi="kpi"
              :is-expanded="expandedCards.has(`program-${kpi.id}`)"
              @toggle-expand="toggleCardExpanded('program', kpi.id)"
            />
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
            <KPICard
              v-for="kpi in structureFilteredKPIs"
              :key="kpi.id"
              :kpi="kpi"
              :is-expanded="expandedCards.has(`structure-${kpi.id}`)"
              @toggle-expand="toggleCardExpanded('structure', kpi.id)"
            />
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
            <KPICard
              v-for="kpi in dataFilteredKPIs"
              :key="kpi.id"
              :kpi="kpi"
              :is-expanded="expandedCards.has(`data-${kpi.id}`)"
              @toggle-expand="toggleCardExpanded('data', kpi.id)"
            />
          </div>

          <p v-else-if="!structureWeek" class="text-slate-400 text-sm">Select a week to view data</p>
        </div>

      </div>

      <!-- Row 2: Performance Overview -->
      <div v-if="!isLoading && !loadError" class="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Performance Overview</h2>
          <p class="text-slate-500 text-sm">System-wide KPI balance against targets.</p>
        </div>

        <div v-if="radarDotPositions.length === RADAR_N">
          <!-- Header + filter toggles -->
          <div class="flex items-center justify-between flex-wrap gap-3 mb-3">
            <p class="text-xs text-slate-400 uppercase tracking-wider">All KPIs vs Targets</p>
            <div class="flex items-center gap-1.5">
              <button
                @click="toggleRadarTeam('program')"
                :class="['text-[10px] px-2.5 py-1 rounded-full border font-semibold transition-colors',
                  activeRadarTeams.has('program') ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-slate-100 text-slate-400 border-slate-200']"
              >Program</button>
              <button
                @click="toggleRadarTeam('structure')"
                :class="['text-[10px] px-2.5 py-1 rounded-full border font-semibold transition-colors',
                  activeRadarTeams.has('structure') ? 'bg-green-100 text-green-700 border-green-300' : 'bg-slate-100 text-slate-400 border-slate-200']"
              >Structure</button>
              <button
                @click="toggleRadarTeam('data')"
                :class="['text-[10px] px-2.5 py-1 rounded-full border font-semibold transition-colors',
                  activeRadarTeams.has('data') ? 'bg-red-100 text-red-700 border-red-300' : 'bg-slate-100 text-slate-400 border-slate-200']"
              >Data</button>
            </div>
          </div>

          <!-- Legend -->
          <div class="flex items-center gap-5 mb-4 flex-wrap">
            <div class="flex items-center gap-1.5">
              <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4 2"/></svg>
              <span class="text-[10px] text-slate-400">Target</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
              <span class="text-[10px] text-slate-400">Program</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              <span class="text-[10px] text-slate-400">Structure</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
              <span class="text-[10px] text-slate-400">Data</span>
            </div>
          </div>

          <!-- Two-column layout: radar left, info panel right -->
          <div class="flex gap-8 items-center justify-center mx-auto" style="max-width: 860px;">

            <!-- Left: Radar SVG -->
            <div class="overflow-x-auto" style="width: 480px; flex: 0 0 480px;">
              <svg viewBox="0 0 500 440" width="480" height="422" @mouseleave="hoveredRadarIdx = null">

                <!-- Concentric reference rings -->
                <polygon
                  v-for="(ringPts, ri) in radarRings"
                  :key="`ring-${ri}`"
                  :points="ringPts"
                  fill="none" stroke="#e2e8f0" stroke-width="1"
                />
                <!-- Ring % labels at top of each ring -->
                <text v-for="(frac, ri) in [0.25, 0.5, 0.75, 1.0]" :key="`rlbl-${ri}`"
                  :x="RADAR_CX" :y="RADAR_CY - frac * RADAR_MAX_R - 3"
                  text-anchor="middle" dominant-baseline="auto"
                  fill="#94a3b8" font-size="7" font-weight="500"
                >{{ Math.round(frac * 100) }}%</text>

                <!-- Axes — dimmed when their team is filtered out -->
                <line
                  v-for="(ax, i) in radarAxes"
                  :key="`ax-${ax.label}`"
                  :x1="RADAR_CX" :y1="RADAR_CY"
                  :x2="ax.axisEndX" :y2="ax.axisEndY"
                  :stroke="ax.color"
                  :stroke-opacity="activeRadarTeams.has(RADAR_TEAM_NAMES[i].toLowerCase()) ? 0.25 : 0.06"
                  stroke-width="1"
                />

                <!-- Target polygon -->
                <polygon :points="radarTargetPoints" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="5 3" />

                <!-- Team polygons (each a coloured sector slice) -->
                <polygon v-if="activeRadarTeams.has('program') && radarProgramPoints"
                  :points="radarProgramPoints"
                  fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="1.5" stroke-linejoin="round" />
                <polygon v-if="activeRadarTeams.has('structure') && radarStructurePoints"
                  :points="radarStructurePoints"
                  fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="1.5" stroke-linejoin="round" />
                <polygon v-if="activeRadarTeams.has('data') && radarDataPoints"
                  :points="radarDataPoints"
                  fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="1.5" stroke-linejoin="round" />

                <!-- Score dots + hit areas -->
                <g
                  v-for="dot in radarDotPositions"
                  :key="`dot-${dot.i}`"
                  @mouseenter="hoveredRadarIdx = dot.i"
                  style="cursor: pointer;"
                >
                  <circle
                    :cx="dot.x" :cy="dot.y"
                    :r="hoveredRadarIdx === dot.i ? 6 : 4"
                    :fill="dot.color"
                    :fill-opacity="hoveredRadarIdx === dot.i ? 1 : 0.75"
                    style="transition: r 0.2s cubic-bezier(0.34,1.56,0.64,1), fill-opacity 0.15s;"
                  />
                  <!-- Invisible larger hit area -->
                  <circle :cx="dot.x" :cy="dot.y" r="14" fill="transparent" />
                </g>

                <!-- Axis labels — coloured by team, bolded when hovered -->
                <text
                  v-for="(ax, i) in radarAxes"
                  :key="`lbl-${ax.label}`"
                  :x="ax.labelX" :y="ax.labelY"
                  text-anchor="middle" dominant-baseline="central"
                  :fill="ax.color"
                  :fill-opacity="activeRadarTeams.has(RADAR_TEAM_NAMES[i].toLowerCase()) ? 1 : 0.25"
                  :style="{ fontSize: hoveredRadarIdx === i ? '11px' : '10px', fontWeight: hoveredRadarIdx === i ? '800' : '600', transition: 'font-size 0.15s' }"
                >{{ ax.label }}</text>

              </svg>
            </div>

            <!-- Right: KPI Info Panel -->
            <div class="w-56 flex-none rounded-xl border border-slate-200 bg-slate-50 p-5">
              <transition name="fade" mode="out-in">
                <div v-if="hoveredKPIInfo" :key="hoveredRadarIdx">
                  <div class="flex items-center gap-1.5 mb-3">
                    <span class="inline-block w-2.5 h-2.5 rounded-full flex-none" :style="{ backgroundColor: RADAR_TEAM_COLORS[hoveredRadarIdx] }"></span>
                    <span class="text-[10px] font-bold uppercase tracking-wider" :style="{ color: RADAR_TEAM_COLORS[hoveredRadarIdx] }">
                      {{ RADAR_TEAM_NAMES[hoveredRadarIdx] }}
                    </span>
                  </div>
                  <p class="text-sm font-semibold text-slate-800 leading-snug mb-4">{{ hoveredKPIInfo.name }}</p>
                  <div class="space-y-3">
                    <div>
                      <p class="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Value</p>
                      <p class="font-mono font-bold text-slate-900 text-sm">{{ hoveredKPIInfo.displayValue }}</p>
                    </div>
                    <div>
                      <p class="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Target</p>
                      <p class="font-mono text-slate-600 text-xs">{{ hoveredKPIInfo.displayTarget }}</p>
                    </div>
                    <div>
                      <p class="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Score</p>
                      <p class="font-mono font-bold text-base" :style="{ color: RADAR_TEAM_COLORS[hoveredRadarIdx] }">{{ hoveredKPIInfo.scoreDisplay }}</p>
                    </div>
                  </div>
                  <div class="mt-4 pt-3 border-t border-slate-200 flex items-center gap-1.5 flex-wrap">
                    <span class="text-xs px-2 py-0.5 rounded-md font-bold tracking-wide" :class="getLogicBadgeColor(hoveredKPIInfo.logic)">{{ getLogicBadgeLabel(hoveredKPIInfo.logic) }}</span>
                    <span class="text-[9px] font-medium" :class="hoveredKPIInfo.withinMargin ? 'text-teal-600' : 'text-amber-500'">
                      {{ hoveredKPIInfo.withinMargin ? '✓ on target' : '▲ off target' }}
                    </span>
                  </div>
                </div>
                <div v-else key="empty" class="flex flex-col items-center justify-center py-10 text-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" class="mb-3 opacity-30">
                    <circle cx="16" cy="16" r="14" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/>
                    <line x1="16" y1="2" x2="16" y2="30" stroke="#94a3b8" stroke-width="1" stroke-opacity="0.5"/>
                    <line x1="2" y1="16" x2="30" y2="16" stroke="#94a3b8" stroke-width="1" stroke-opacity="0.5"/>
                  </svg>
                  <p class="text-xs text-slate-400 leading-relaxed">Hover a point on<br>the chart to see<br>KPI details</p>
                </div>
              </transition>
            </div>

          </div>
        </div>

      </div>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { fetchKPIsByCategory, fetchStructureParams, fetchProgramParams, fetchFormulaTargets } from '@/services/googleSheetsService'
import { KPI_BY_CATEGORY, computeKPI, updateKPITargets, evaluateKPIStatus } from '@/services/kpiFormulas'
import { useUserStore } from '@/stores/userStore'
import KPICard from '@/components/KPICard.vue'

const userStore = useUserStore()

// --- German number formatter ---
const formatNumberDE = (value) => {
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value))
}

// --- Logic type badge helpers ---
const getLogicBadgeColor = () => 'bg-slate-100 text-slate-600 border border-slate-200'
const getLogicBadgeLabel = (logic) => {
  if (logic === 'MAX') return 'MAX ↑'
  if (logic === 'MIN') return 'MIN ↓'
  return 'STRICT ⊙'
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
const expandedCards = ref(new Set())

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


// Average PRG param values
const averagePrgParams = computed(() => {
  const rows = programParamsData.value?.rows || []
  if (!rows.length) {
    return {}
  }
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
  if (!rows.length) {
    return []
  }

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
  if (!rows.length) {
    return {}
  }
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
  if (Object.keys(structParams).length === 0 || Object.keys(prgParams).length === 0) {
    return []
  }

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


// ─── Radar chart constants & helpers ─────────────────────────────────────────

const RADAR_LABELS = ['EPA', 'PPI', 'RCIR', 'SE', 'SCP', 'FE', 'TCR', 'APE', 'ACNI']
// Team colour per axis index (0-2 program, 3-5 structure, 6-8 data)
const RADAR_TEAM_COLORS = ['#3b82f6','#3b82f6','#3b82f6','#10b981','#10b981','#10b981','#ef4444','#ef4444','#ef4444']
const RADAR_TEAM_NAMES  = ['Program','Program','Program','Structure','Structure','Structure','Data','Data','Data']
const RADAR_CX = 250, RADAR_CY = 220, RADAR_MAX_R = 150
const RADAR_N = 9

// Team filter state
const activeRadarTeams = ref(new Set(['program', 'structure', 'data']))

// Radar entrance animation
const radarAnimProgress = ref(0)
let radarAnimFrame = null
function animateRadar(duration = 650) {
  if (radarAnimFrame) cancelAnimationFrame(radarAnimFrame)
  radarAnimProgress.value = 0
  const start = performance.now()
  function step(now) {
    const t = Math.min((now - start) / duration, 1)
    radarAnimProgress.value = 1 - Math.pow(1 - t, 3) // ease-out cubic
    if (t < 1) {
      radarAnimFrame = requestAnimationFrame(step)
    } else {
      radarAnimFrame = null
    }
  }
  radarAnimFrame = requestAnimationFrame(step)
}
onUnmounted(() => { if (radarAnimFrame) cancelAnimationFrame(radarAnimFrame) })

function toggleRadarTeam(team) {
  const s = new Set(activeRadarTeams.value)
  s.has(team) ? s.delete(team) : s.add(team)
  activeRadarTeams.value = s
  animateRadar(400)
}

// Hover state
const hoveredRadarIdx = ref(null)
const hoveredProgramMarker = ref(null)
const hoveredStructureMarker = ref(null)
const hoveredDataMarker = ref(null)

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

// Helper: build a polygon string for one team's sector (other axes collapse to centre)
function makeTeamRadarPoints(teamAxes, progress = 1) {
  const all = [...programFilteredKPIs.value, ...structureFilteredKPIs.value, ...dataFilteredKPIs.value]
  if (all.length < RADAR_N) return ''
  return all.map((kpi, i) => {
    const r = teamAxes.includes(i) ? radarScoreToR(kpiToRadarScore(kpi)) * progress : 0
    const pt = axisPoint(i, r)
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
  }).join(' ')
}

const radarProgramPoints   = computed(() => makeTeamRadarPoints([0, 1, 2], radarAnimProgress.value))
const radarStructurePoints = computed(() => makeTeamRadarPoints([3, 4, 5], radarAnimProgress.value))
const radarDataPoints      = computed(() => makeTeamRadarPoints([6, 7, 8], radarAnimProgress.value))

// Dots at each axis's current-score position (animated)
const radarDotPositions = computed(() => {
  const all = [...programFilteredKPIs.value, ...structureFilteredKPIs.value, ...dataFilteredKPIs.value]
  if (all.length < RADAR_N) return []
  const p = radarAnimProgress.value
  return all.map((kpi, i) => {
    const r = radarScoreToR(kpiToRadarScore(kpi)) * p
    const pt = axisPoint(i, r)
    return { x: pt.x, y: pt.y, color: RADAR_TEAM_COLORS[i], kpi, i }
  })
})

// Tooltip data for the hovered axis
const hoveredKPIInfo = computed(() => {
  if (hoveredRadarIdx.value === null) return null
  const all = [...programFilteredKPIs.value, ...structureFilteredKPIs.value, ...dataFilteredKPIs.value]
  const kpi = all[hoveredRadarIdx.value]
  if (!kpi) return null
  const value  = Number(kpi.value)  || 0
  const target = Number(kpi.target) || 1
  const score  = kpiToRadarScore(kpi)
  return {
    name:         kpi.name,
    displayValue: `${formatNumberDE(value)} ${kpi.unit}`,
    displayTarget:`${formatNumberDE(target)} ${kpi.unit}`,
    scoreDisplay: `${Math.round(score * 100)}%`,
    logic:        kpi.logic,
    withinMargin: evaluateKPIStatus(value, target, kpi.logic || 'STRICT').acceptable,
  }
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
      color: RADAR_TEAM_COLORS[i],
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

// Trigger radar entrance animation when all KPI data is available
watch(
  [programFilteredKPIs, structureFilteredKPIs, dataFilteredKPIs],
  ([prog, str, data]) => {
    if (prog.length && str.length && data.length) animateRadar()
  }
)

watch(
  [programFilteredKPIs, structureFilteredKPIs, dataFilteredKPIs],
  ([progKPIs, strKPIs, dataKPIs]) => {
    const allKPIs = [...progKPIs, ...strKPIs, ...dataKPIs]
    const total    = allKPIs.length
    const onTarget = allKPIs.filter(k => evaluateKPIStatus(k.value, k.target, k.logic).acceptable).length
    userStore.setKpiHealth({ total, onTarget, warnings: total - onTarget })
  },
  { immediate: true }
)

// ─── Card expansion handler ───────────────────────────────────────────────────

function toggleCardExpanded(category, kpiId) {
  const cardKey = `${category}-${kpiId}`
  const newExpanded = new Set(expandedCards.value)
  if (newExpanded.has(cardKey)) {
    newExpanded.delete(cardKey)
  } else {
    newExpanded.add(cardKey)
  }
  expandedCards.value = newExpanded
}

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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
