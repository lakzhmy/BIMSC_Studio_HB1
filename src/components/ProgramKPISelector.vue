<template>
  <div class="space-y-4">
    <!-- Full Building KPI Cards with inline summary -->
    <div v-if="summaryCards.length > 0" class="space-y-3">
      <div
        v-for="(card, index) in summaryCards"
        :key="card.id"
        :class="['bg-slate-50 p-4 rounded-lg border border-slate-100 hover:shadow-md transition-shadow cursor-pointer', hoveredSummaryKey === card.key ? 'shadow-md border-slate-300' : '']"
        @mouseenter="setHoveredSummaryKey(index)"
        @mouseleave="clearHoveredSummaryKey"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <h3 class="text-xs font-semibold text-slate-700">{{ card.title }}</h3>
            <p class="text-[11px] text-slate-500">{{ getProgramUnit(index) }}</p>
          </div>
          <div :class="['w-2 h-2 rounded-full flex-shrink-0 mt-0.5', card.withinMargin ? 'bg-green-500' : 'bg-red-500']"></div>
        </div>
        <div class="text-2xl font-bold text-slate-900 mb-3">{{ typeof card.rawValue === 'number' ? card.rawValue.toFixed(2) : card.rawValue }}</div>
        <div class="text-[11px] text-slate-500">Target: {{ formatValue(card.visual.target) }}</div>
        <div class="flex items-center gap-2 mt-1 mb-3">
          <span :class="['text-[10px] px-2 py-0.5 rounded-full border', card.withinMargin ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200']">
            {{ card.delta > 0 ? '+' : '' }}{{ formatDelta(card.delta) }}
          </span>
        </div>
        <div class="relative h-2 rounded-full bg-slate-200 overflow-visible">
          <div class="absolute left-0 top-0 h-full rounded-full" :style="{ width: `${card.bulletValuePct}%`, backgroundColor: '#3b82f6' }"></div>
          <div class="absolute top-0 h-full w-0.5 bg-slate-500" :style="{ left: `${card.bulletTargetPct}%` }"></div>
          <div class="absolute top-0 h-2 w-2 bg-yellow-400 shadow-sm" :style="{ left: `calc(${card.bulletTargetPct}% - 4px)`, transform: 'rotate(45deg)' }"></div>
          <div class="absolute -top-5 text-[10px] text-slate-600" :style="{ left: `calc(${card.bulletTargetPct}% - 8px)` }">{{ formatValue(card.visual.target) }}</div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <p v-else class="text-slate-400 text-sm">No program data available</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { KPI_BY_CATEGORY, computeKPI, evaluateKPIStatus } from '@/services/kpiFormulas'
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

const hoveredSummaryKey = ref('')

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

const formatValue = (value) => {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const formatDelta = (delta) => {
  if (Math.abs(delta) < 1) {
    return delta.toFixed(2)
  }
  return delta.toLocaleString()
}

const summaryData = computed(() => {
  if (!props.sheetData?.data) {
    return {
      epa: { value: 0, target: 0, delta: 0, bulletValuePct: 0, bulletTargetPct: 0 },
      ppi: { value: 0, target: 0, delta: 0, bulletValuePct: 0, bulletTargetPct: 0 },
      rcir: { value: 0, target: 0, delta: 0, bulletValuePct: 0, bulletTargetPct: 0 },
    }
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

  const bulletConfig = (value, target, logic = 'STRICT') => {
    const max = Math.max(value, target) * 1.2 || 1
    const status = evaluateKPIStatus(value, target, logic)
    return {
      delta: value - target,
      withinMargin: status.acceptable,
      bulletValuePct: Math.min((value / max) * 100, 100),
      bulletTargetPct: Math.min((target / max) * 100, 100),
    }
  }

  return {
    epa: {
      value: epaValue,
      target: epaTarget,
      ...bulletConfig(epaValue, epaTarget, epaDef?.logic || 'STRICT'),
    },
    ppi: {
      value: Math.round(ppiValue * 100) / 100,
      target: ppiTarget,
      ...bulletConfig(ppiValue, ppiTarget, ppiDef?.logic || 'STRICT'),
    },
    rcir: {
      value: Math.round(rcirValue * 100) / 100,
      target: rcirTarget,
      ...bulletConfig(rcirValue, rcirTarget, rcirDef?.logic || 'STRICT'),
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
      title: 'Effective Programmatic Area',
      subtitle: 'Total',
      rawValue: epa.value,
      displayValue: formatValue(epa.value),
      visual: { type: 'bullet', target: epa.target || 0 },
      delta: epa.value - epa.target,
      withinMargin: epa.withinMargin,
      bulletValuePct: epa.bulletValuePct,
      bulletTargetPct: epa.bulletTargetPct,
    },
    {
      key: 'ppi',
      id: 'summary-ppi',
      title: 'Programmatic Proximity Index',
      subtitle: 'Average',
      rawValue: ppi.value,
      displayValue: formatValue(ppi.value),
      visual: { type: 'bullet', target: ppi.target || 0 },
      delta: ppi.delta,
      withinMargin: ppi.withinMargin,
      bulletValuePct: ppi.bulletValuePct,
      bulletTargetPct: ppi.bulletTargetPct,
    },
    {
      key: 'rcir',
      id: 'summary-rcir',
      title: 'Resource Consumption Intensity Ratio',
      subtitle: 'Average',
      rawValue: rcir.value,
      displayValue: formatValue(rcir.value),
      visual: { type: 'bullet', target: rcir.target || 0 },
      delta: rcir.delta,
      withinMargin: rcir.withinMargin,
      bulletValuePct: rcir.bulletValuePct,
      bulletTargetPct: rcir.bulletTargetPct,
    },
  ]
})

const getProgramUnit = (index) => {
  if (index === 0) {
    return 'm²'
  }
  return 'unitless'
}

const setHoveredSummaryKey = (index) => {
  const keys = ['epa', 'ppi', 'rcir']
  hoveredSummaryKey.value = keys[index] || ''
}

const clearHoveredSummaryKey = () => {
  hoveredSummaryKey.value = ''
}
</script>

<style scoped>
</style>
