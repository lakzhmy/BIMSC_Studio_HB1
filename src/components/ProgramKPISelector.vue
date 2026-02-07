<template>
  <div class="space-y-6">
    <!-- Week and Space Index Selectors -->
    <div class="flex flex-wrap gap-4 p-4 bg-white rounded-lg border border-slate-200">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-slate-700">Week</label>
        <select v-model="selectedWeek" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm">
          <option value="">Select a week</option>
          <option v-for="week in weeks" :key="week" :value="week">{{ week }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-slate-700">Space Index</label>
        <select v-model="selectedColumnC" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm">
          <option value="">Select a value</option>
          <option v-for="val in availableColumnCValues" :key="val" :value="val">{{ val }}</option>
        </select>
      </div>

      <div v-if="spaceName" class="flex flex-col gap-2">
        <label class="text-sm font-medium text-slate-700">Space Name</label>
        <div class="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm line-height-relaxed">
          {{ spaceName }}
        </div>
      </div>
    </div>

    <!-- KPI Cards (Columns E+) -->
    <div v-if="selectedColumnC && kpiCards.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(kpi, index) in kpiCards"
        :key="kpi.id"
        class="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
        @mouseenter="setHoveredSummaryKey(index)"
        @mouseleave="clearHoveredSummaryKey"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-slate-700 mb-1">{{ kpi.name }}</h3>
            <p class="text-xs text-slate-500">{{ kpi.unit }}</p>
          </div>
          <div :class="['w-2 h-2 rounded-full flex-shrink-0 mt-1', kpi.status === 'good' ? 'bg-green-500' : kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500']"></div>
        </div>
        <div class="space-y-3">
          <div class="flex items-end gap-2">
            <div class="text-3xl font-bold text-slate-900">{{ typeof kpi.value === 'number' ? kpi.value.toFixed(2) : kpi.value }}</div>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <span class="capitalize">Status: {{ kpi.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedColumnC && kpiCards.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="card in summaryCards"
        :key="card.id"
        :class="['bg-white p-6 rounded-lg border border-slate-200 transition-shadow', hoveredSummaryKey === card.key ? 'shadow-lg border-slate-300' : '']"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-slate-700">{{ card.title }}</h3>
            <span class="text-xs text-slate-400">{{ card.subtitle }}</span>
          </div>
        </div>
        <div class="text-3xl font-bold text-slate-900">{{ card.displayValue }}</div>
        <div v-if="card.visual?.type === 'bullet'" class="mt-4 space-y-2">
          <div class="text-xs text-slate-500">
            <span>Target: {{ card.visual.target }}</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <span :class="['text-[11px] px-2 py-0.5 rounded-full border', card.delta <= 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200']">
              {{ card.delta > 0 ? '+' : '' }}{{ formatDelta(card.delta) }}
            </span>
          </div>
          <div class="relative h-2 rounded-full bg-slate-100 overflow-visible">
            <div
              class="absolute left-0 top-0 h-full rounded-full"
              :style="{ width: `${card.bulletValuePct}%`, backgroundColor: '#3b82f6' }"
            ></div>
            <div
              class="absolute top-0 h-full w-0.5 bg-slate-500"
              :style="{ left: `${card.bulletTargetPct}%` }"
            ></div>
            <div
              class="absolute top-0 h-2 w-2 bg-yellow-400 shadow-sm"
              :style="{ left: `calc(${card.bulletTargetPct}% - 4px)`, transform: 'rotate(45deg)' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else-if="!selectedColumnC" class="bg-slate-100 rounded-lg p-12 text-center">
      <p class="text-slate-500">Select a space index to view KPI data</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  sheetData: {
    type: Object,
    required: true,
  },
})

const selectedWeek = ref('')
const selectedColumnC = ref('')
const hoveredSummaryKey = ref('')

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
  return Array.isArray(row?.kpis) ? row.kpis : []
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
  const epaValue = sumByIndex(summaryIndexes.epa)
  const ppiValue = averageByIndex(summaryIndexes.ppi)
  const rcirValue = averageByIndex(summaryIndexes.rcir)

  const epaTarget = getSummaryTarget('epa') || 1000000
  const ppiTarget = getSummaryTarget('ppi')
  const rcirTarget = getSummaryTarget('rcir')

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
      value: ppiValue,
      target: ppiTarget,
      ...bulletConfig(ppiValue, ppiTarget),
    },
    rcir: {
      value: rcirValue,
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

const setHoveredSummaryKey = (index) => {
  hoveredSummaryKey.value = summaryKeyByIndex[index] || ''
}

const clearHoveredSummaryKey = () => {
  hoveredSummaryKey.value = ''
}

// Auto-set first week when data loads
watch(() => weeks.value, (newWeeks) => {
  if (newWeeks && newWeeks.length > 0 && !selectedWeek.value) {
    selectedWeek.value = newWeeks[0]
  }
})

// Auto-set first Column C value when data loads
watch(() => availableColumnCValues.value, (newValues) => {
  if (newValues && newValues.length > 0 && !selectedColumnC.value) {
    selectedColumnC.value = newValues[0]
  }
})
</script>

<style scoped>
</style>
