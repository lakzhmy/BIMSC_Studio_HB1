<template>
  <div
    class="flex rounded-lg border border-slate-100 overflow-hidden bg-slate-50 hover:shadow-md transition-shadow cursor-pointer"
    @click="$emit('toggle-expand')"
  >
    <!-- Left strip: team color — thicker to read as a column anchor -->
    <div class="w-1.5 flex-none" :style="{ backgroundColor: teamColor }"></div>

    <!-- Card body -->
    <div class="flex-1 p-4 min-w-0">

      <!-- Header row: name + status symbol + logic chip + chevron -->
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-xs font-semibold text-slate-700 flex-1 pr-2 leading-tight">{{ kpi.name }}</h3>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <!-- Status: symbol only, team color so it reads as part of the card identity -->
          <span
            class="text-[11px] font-bold leading-none"
            :style="{ color: teamColor }"
            :title="status.acceptable ? 'On target' : 'Off target'"
          >{{ status.acceptable ? '✓' : '▲' }}</span>
          <!-- Logic chip: neutral — symbol differentiates -->
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 font-bold tracking-wide">
            {{ logicLabel }}
          </span>
          <span class="text-slate-400 text-[11px] leading-none">{{ isExpanded ? '▴' : '▾' }}</span>
        </div>
      </div>

      <!-- Expand panel: description + formula -->
      <div :class="['overflow-hidden transition-all duration-300', isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0']">
        <div class="bg-slate-100 -mx-4 px-4 py-2 mb-3 border-t border-b border-slate-200">
          <p class="text-xs text-slate-600 leading-relaxed">{{ kpi.description }}</p>
          <div class="mt-2 pt-2 border-t border-slate-200">
            <p class="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Formula</p>
            <code class="text-xs bg-white text-slate-700 rounded border border-slate-200 px-2 py-1 block font-mono">{{ kpi.formula }}</code>
          </div>
        </div>
      </div>

      <!-- Large value + unit -->
      <div class="mt-1">
        <span class="text-2xl font-bold text-slate-900">{{ formattedValue }}</span>
        <span class="text-xs text-slate-400 ml-1">{{ cleanedUnit }}</span>
      </div>

      <!-- Deviation line -->
      <p class="text-xs mt-1 text-slate-500">{{ deviation.text }}</p>

      <!-- Range indicator -->
      <div class="mt-3">

        <!-- STRICT: number-line — filled dot (in band) vs hollow ring (out of band) -->
        <template v-if="kpi.logic === 'STRICT'">
          <div class="flex items-center justify-between mb-1.5">
            <p class="text-[9px] text-slate-400 uppercase tracking-wider">Acceptable range</p>
            <span class="text-[9px] font-semibold text-slate-500">
              {{ status.acceptable ? '✓ in range' : '▲ out of range' }}
            </span>
          </div>
          <div class="relative h-5 flex items-center">
            <!-- Track: faint team color -->
            <div
              class="absolute inset-x-0 h-1.5 rounded-full top-1/2 -translate-y-1/2 opacity-20"
              :style="{ backgroundColor: teamColor }"
            ></div>
            <!-- Dot: position + filled/hollow in one element -->
            <div
              class="absolute w-3 h-3 rounded-full border-2 -translate-x-1/2 top-1/2 -translate-y-1/2 transition-all duration-500"
              :style="dotStyle"
            ></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>{{ formatKPIValue(bandLow) }}</span>
            <span class="text-slate-500 text-[9px]">target {{ formatKPIValue(kpi.target) }}</span>
            <span>{{ formatKPIValue(bandHigh) }}</span>
          </div>
          <div class="flex justify-between text-[9px] text-slate-300 mt-0.5">
            <span>below</span>
            <span>above</span>
          </div>
        </template>

        <!-- MAX / MIN: fill bar uses team color -->
        <template v-else>
          <div class="flex items-center justify-between mb-1.5">
            <p class="text-[9px] text-slate-400 uppercase tracking-wider">
              {{ kpi.logic === 'MAX' ? '↑ higher is better' : '↓ lower is better' }}
            </p>
            <span class="text-[9px] font-semibold text-slate-500">
              {{ status.acceptable ? '✓ on target' : '▲ off target' }}
            </span>
          </div>
          <div class="relative h-2 rounded-full bg-slate-200 overflow-visible">
            <div
              class="absolute left-0 top-0 h-full rounded-full transition-all duration-500 opacity-70"
              :style="{ width: `${fillBarPct}%`, backgroundColor: teamColor }"
            ></div>
            <!-- Target marker -->
            <div
              class="absolute top-0 h-4 -mt-1 w-0.5 rounded"
              :style="{ left: `${targetBarPct}%`, backgroundColor: teamColor }"
            ></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0</span>
            <span>target {{ formatKPIValue(kpi.target) }} {{ cleanedUnit }}</span>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { evaluateKPIStatus } from '@/services/kpiFormulas'
import { formatKPIValue, formatDeviation, getStrictBand, cleanUnit } from '@/utils/kpiFormatting'

const props = defineProps({
  kpi: { type: Object, required: true },
  isExpanded: { type: Boolean, default: false },
})

defineEmits(['toggle-expand'])

const cleanedUnit = computed(() => cleanUnit(props.kpi.unit))
const formattedValue = computed(() => formatKPIValue(props.kpi.value))

const status = computed(() =>
  evaluateKPIStatus(props.kpi.value, props.kpi.target, props.kpi.logic)
)

// Team color: the single accent color per card — derived from category, never changes with status
const teamColor = computed(() => {
  if (props.kpi.category === 'program')     return '#3b82f6' // blue
  if (props.kpi.category === 'structure')   return '#10b981' // green
  if (props.kpi.category === 'environment') return '#ef4444' // red
  return '#94a3b8'
})

const deviation = computed(() =>
  formatDeviation(props.kpi.value, props.kpi.target, props.kpi.logic, props.kpi.unit)
)

const logicLabel = computed(() => {
  if (props.kpi.logic === 'MAX') return 'MAX ↑'
  if (props.kpi.logic === 'MIN') return 'MIN ↓'
  return 'STRICT ⊙'
})

// STRICT range indicator
const bandLow = computed(() => getStrictBand(props.kpi.target).low)
const bandHigh = computed(() => getStrictBand(props.kpi.target).high)

const dotPosition = computed(() => {
  const { low, high } = getStrictBand(props.kpi.target)
  if (high === low) return 0.5
  const pos = (props.kpi.value - low) / (high - low)
  return Math.max(0, Math.min(1, pos))
})

const dotStyle = computed(() => ({
  left: `${dotPosition.value * 100}%`,
  ...(status.value.acceptable
    ? { backgroundColor: teamColor.value, borderColor: 'white' }
    : { backgroundColor: 'white', borderColor: teamColor.value }),
}))

// MAX / MIN fill bar
const barScale = computed(() =>
  Math.max(Math.abs(props.kpi.value), Math.abs(props.kpi.target)) * 1.2 || 1
)

const fillBarPct = computed(() =>
  Math.min((Math.abs(props.kpi.value) / barScale.value) * 100, 100)
)

const targetBarPct = computed(() =>
  Math.min((Math.abs(props.kpi.target) / barScale.value) * 100, 100)
)
</script>
