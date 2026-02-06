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
      <div v-for="kpi in kpiCards" :key="kpi.id" class="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
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
