<template>
  <div class="space-y-4">
    <!-- Week and Space Index Selectors -->
    <div class="flex flex-wrap gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-700">Week</label>
        <select v-model="selectedWeek" class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm">
          <option value="">Select a week</option>
          <option v-for="week in weeks" :key="week" :value="week">{{ week }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-700">Space Index</label>
        <select v-model="selectedColumnC" class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm">
          <option value="">Select a value</option>
          <option v-for="val in availableColumnCValues" :key="val" :value="val">{{ val }}</option>
        </select>
      </div>
    </div>

    <!-- Space Name (own row for consistent height alignment) -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-slate-700">Space Name</label>
      <div class="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm">
        {{ spaceName || '\u00A0' }}
      </div>
    </div>

    <!-- KPI Cards with inline summary (Columns E+) -->
    <div v-if="selectedColumnC && kpiCards.length > 0" class="space-y-3">
      <div
        v-for="(kpi, index) in kpiCards"
        :key="kpi.id"
        :class="['bg-slate-50 p-4 rounded-lg border border-slate-100 hover:shadow-md transition-shadow cursor-pointer', hoveredSummaryKey === summaryKeyByIndex[index] ? 'shadow-md border-slate-300' : '']"
        @mouseenter="setHoveredSummaryKey(index)"
        @mouseleave="clearHoveredSummaryKey"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <h3 class="text-xs font-semibold text-slate-700">{{ kpi.name }}</h3>
            <p class="text-[11px] text-slate-500">{{ getProgramUnit(index) }}</p>
          </div>
          <div :class="['w-2 h-2 rounded-full flex-shrink-0 mt-0.5', summaryCards[index] ? (summaryCards[index].delta <= 0 ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-300']"></div>
        </div>
        <div class="text-2xl font-bold text-slate-900 mb-3">{{ typeof kpi.value === 'number' ? kpi.value.toFixed(2) : kpi.value }}</div>
        <template v-if="summaryCards[index]">
          <div class="text-[11px] text-slate-500">Target: {{ summaryCards[index].visual?.target }}</div>
          <div class="flex items-center gap-2 mt-1 mb-3">
            <span :class="['text-[10px] px-2 py-0.5 rounded-full border', summaryCards[index].delta <= 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200']">
              {{ summaryCards[index].delta > 0 ? '+' : '' }}{{ formatDelta(summaryCards[index].delta) }}
            </span>
          </div>
          <div class="relative h-2 rounded-full bg-slate-200 overflow-visible">
            <div class="absolute left-0 top-0 h-full rounded-full" :style="{ width: `${summaryCards[index].bulletValuePct}%`, backgroundColor: '#3b82f6' }"></div>
            <div class="absolute top-0 h-full w-0.5 bg-slate-500" :style="{ left: `${summaryCards[index].bulletTargetPct}%` }"></div>
            <div class="absolute top-0 h-2 w-2 bg-yellow-400 shadow-sm" :style="{ left: `calc(${summaryCards[index].bulletTargetPct}% - 4px)`, transform: 'rotate(45deg)' }"></div>
            <div class="absolute -top-5 text-[10px] text-slate-600" :style="{ left: `calc(${summaryCards[index].bulletTargetPct}% - 8px)` }">{{ formatValue(summaryCards[index].visual?.target) }}</div>
          </div>
        </template>
      </div>
    </div>

    <!-- No Data State -->
    <p v-else-if="!selectedColumnC" class="text-slate-400 text-sm">Select a space index to view KPI data</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { KPI_BY_CATEGORY, computeKPI, computeAggregateKPIs } from '@/services/kpiFormulas'
import { extractParamValues } from '@/services/googleSheetsService'

const props = defineProps({
  sheetData: {
    type: Object,
    required: true,
  },
  currentWeek: {
    type: Number,
    default: null,
  },
})

const selectedWeek = ref('')
const selectedColumnC = ref('')
const hoveredSummaryKey = ref('')

const programSelectionKey = 'kpi-program-selection'

const loadProgramSelection = () => {
  try {
    const stored = localStorage.getItem(programSelectionKey)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    return null
  }
}

const storeProgramSelection = (week, columnC) => {
  try {
    localStorage.setItem(programSelectionKey, JSON.stringify({ week, columnC }))
  } catch (error) {
    // Ignore storage errors
  }
}

const weeks = computed(() => {
  return [3, 4, 5, 6, 7, 8, 9, 10]
})

const availableColumnCValues = computed(() => {
  if (!props.sheetData?.data) {
    return []
  }
  const data = props.sheetData.data || []
  const values = data
    .map(row => row?.scenario)
    .filter(v => v)
  return [...new Set(values)]
})

const spaceName = computed(() => {
  if (!selectedColumnC.value || !props.sheetData?.data) {
    return ''
  }
  const data = props.sheetData.data || []
  const row = data.find(r => r && r.scenario === selectedColumnC.value)
  return row?.spaceName || ''
})

const kpiCards = computed(() => {
  if (!selectedColumnC.value || !props.sheetData?.data) {
    return []
  }
  const data = props.sheetData.data || []
  const row = data.find(r => r && r.scenario === selectedColumnC.value)
  if (!row || !Array.isArray(row.kpis)) return []

  // Extract raw PRG_PAR_* parameter values from the row
  const kpiNames = props.sheetData.kpiNames || []
  const params = extractParamValues(kpiNames, row.kpis)

  // Compute the three program KPIs from the formulas
  const defs = KPI_BY_CATEGORY['program']
  return defs.map(def => ({
    id: def.id,
    name: def.name,
    value: Math.round(computeKPI(def, params) * 100) / 100,
    unit: def.unit,
    target: def.target,
    status: 'good',
  }))
})


const summaryIndexes = {
  epa: 0,
  ppi: 1,
  rcir: 2,
}

const parseNumber = (value) => {
  if (typeof value === 'number') {
    return value
  }
  const sanitized = String(value || '').replace(/,/g, '')
  const match = sanitized.match(/-?\d*\.?\d+/)
  if (!match) {
    return 0
  }
  const parsed = Number(match[0])
  return Number.isNaN(parsed) ? 0 : parsed
}

const formatDelta = (delta) => {
  if (Math.abs(delta) < 1) {
    return delta.toFixed(2)
  }
  return delta.toLocaleString()
}

const getSummaryTarget = (key) => {
  const targets = props.sheetData?.targets || []
  const index = summaryIndexes[key]
  if (index === undefined) {
    return 0
  }
  return parseNumber(targets[index])
}

const sumByIndex = (index) => {
  const data = props.sheetData?.data || []
  let sum = 0
  data.forEach((row) => {
    const kpi = (row.kpis || [])[index]
    if (kpi) {
      sum += parseNumber(kpi.value)
    }
  })
  return sum
}

const averageByIndex = (index) => {
  const data = props.sheetData?.data || []
  let sum = 0
  let count = 0
  data.forEach((row) => {
    const kpi = (row.kpis || [])[index]
    if (kpi) {
      sum += parseNumber(kpi.value)
      count += 1
    }
  })
  return count > 0 ? sum / count : 0
}

const formatValue = (value) => {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const summaryData = computed(() => {
  if (!props.sheetData?.data) {
    return { epa: { value: 0, target: 0, delta: 0, bulletValuePct: 0, bulletTargetPct: 0 }, ppi: { value: 0, target: 0, delta: 0, bulletValuePct: 0, bulletTargetPct: 0 }, rcir: { value: 0, target: 0, delta: 0, bulletValuePct: 0, bulletTargetPct: 0 } }
  }

  const data = props.sheetData.data || []
  const kpiNames = props.sheetData.kpiNames || []

  // Extract params for all rows and compute aggregate KPIs
  const allParams = data.map(row => {
    return extractParamValues(kpiNames, row.kpis || [])
  })

  const defs = KPI_BY_CATEGORY['program']
  const epaDef = defs.find(d => d.id === 'effective-programmatic-area')
  const ppiDef = defs.find(d => d.id === 'programmatic-proximity-index')
  const rcirDef = defs.find(d => d.id === 'resource-consumption-intensity-ratio')

  // EPA: sum across all rows
  const epaValue = allParams.reduce((acc, p) => acc + (epaDef ? computeKPI(epaDef, p) : 0), 0)
  // PPI: use aggregate (Σ(1/Da) / Σ(1/Di))
  const ppiValue = ppiDef?.computeAggregate ? ppiDef.computeAggregate(allParams) : 0
  // RCIR: average across all rows
  const rcirValue = allParams.length > 0
    ? allParams.reduce((acc, p) => acc + (rcirDef ? computeKPI(rcirDef, p) : 0), 0) / allParams.length
    : 0

  const epaTarget = epaDef?.target ?? 1000000
  const ppiTarget = ppiDef?.target ?? 0.7
  const rcirTarget = rcirDef?.target ?? 0.6

  const bulletConfig = (value, target) => {
    const max = Math.max(value, target) * 1.2 || 1
    return {
      delta: value - target,
      bulletValuePct: Math.min((value / max) * 100, 100),
      bulletTargetPct: Math.min((target / max) * 100, 100),
    }
  }

  return {
    epa: {
      value: epaValue,
      target: epaTarget,
      ...bulletConfig(epaValue, epaTarget),
    },
    ppi: {
      value: Math.round(ppiValue * 100) / 100,
      target: ppiTarget,
      ...bulletConfig(ppiValue, ppiTarget),
    },
    rcir: {
      value: Math.round(rcirValue * 100) / 100,
      target: rcirTarget,
      ...bulletConfig(rcirValue, rcirTarget),
    },
  }
})

const summaryCards = computed(() => {
  const epa = summaryData.value.epa
  const ppi = summaryData.value.ppi
  const rcir = summaryData.value.rcir

  return [
    {
      key: 'epa',
      id: 'summary-epa',
      title: 'EPA',
      subtitle: 'Total',
      rawValue: epa.value,
      displayValue: formatValue(epa.value),
      visual: { type: 'bullet', target: epa.target || 0 },
      delta: epa.value - epa.target,
      bulletValuePct: epa.bulletValuePct,
      bulletTargetPct: epa.bulletTargetPct,
    },
    {
      key: 'ppi',
      id: 'summary-ppi',
      title: 'PPI',
      subtitle: 'Average',
      rawValue: ppi.value,
      displayValue: formatValue(ppi.value),
      visual: { type: 'bullet', target: ppi.target || 0 },
      delta: ppi.delta,
      bulletValuePct: ppi.bulletValuePct,
      bulletTargetPct: ppi.bulletTargetPct,
    },
    {
      key: 'rcir',
      id: 'summary-rcir',
      title: 'RCIR',
      subtitle: 'Average',
      rawValue: rcir.value,
      displayValue: formatValue(rcir.value),
      visual: { type: 'bullet', target: rcir.target || 0 },
      delta: rcir.delta,
      bulletValuePct: rcir.bulletValuePct,
      bulletTargetPct: rcir.bulletTargetPct,
    },
  ]
})

const summaryKeyByIndex = ['epa', 'ppi', 'rcir']

const getProgramUnit = (index) => {
  if (index === 0) {
    return 'm²'
  }
  return 'unitless'
}

const setHoveredSummaryKey = (index) => {
  hoveredSummaryKey.value = summaryKeyByIndex[index] || ''
}

const clearHoveredSummaryKey = () => {
  hoveredSummaryKey.value = ''
}

// Auto-set current week when data loads
watch(() => weeks.value, (newWeeks) => {
  if (!newWeeks || newWeeks.length === 0) return
  if (!selectedWeek.value || !newWeeks.includes(Number(selectedWeek.value))) {
    if (props.currentWeek) {
      const sorted = [...newWeeks].sort((a, b) => a - b)
      const past = sorted.filter(w => w <= props.currentWeek)
      selectedWeek.value = past.length ? past[past.length - 1] : sorted[0]
    } else {
      selectedWeek.value = newWeeks[0]
    }
  }
})

// Auto-set first Column C value when data loads
watch(() => availableColumnCValues.value, (newValues) => {
  if (!newValues || newValues.length === 0) {
    return
  }
  if (!selectedColumnC.value || !newValues.includes(selectedColumnC.value)) {
    selectedColumnC.value = newValues[0]
  }
})

watch(() => [selectedWeek.value, selectedColumnC.value], ([week, columnC]) => {
  if (week && columnC) {
    storeProgramSelection(week, columnC)
  }
})

onMounted(() => {
  const stored = loadProgramSelection()
  if (stored) {
    selectedWeek.value = stored.week || ''
    selectedColumnC.value = stored.columnC || ''
  }
})
</script>

<style scoped>
</style>
