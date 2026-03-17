<template>
  <div
    class="rounded-lg border border-slate-100 overflow-hidden bg-slate-50 hover:shadow-md transition-shadow cursor-pointer min-h-[180px]"
    @click="$emit('toggle-expand')"
  >
    <!-- Card body -->
    <div class="p-4 min-w-0">

      <!-- Header row: name + status symbol + logic chip + chevron -->
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-xs font-semibold text-slate-700 flex-1 pr-2 leading-tight">{{ kpi.name }}</h3>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <!-- Status: symbol colored by on/off-target -->
          <span
            class="text-[11px] font-bold leading-none"
            :style="{ color: statusColor }"
            :title="status.acceptable ? 'On target' : 'Off target'"
          >{{ status.acceptable ? '✓' : '▲' }}</span>
          <!-- Logic chip: status-tinted -->
          <span
            class="text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wide border"
            :style="chipStyle"
          >
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
        <span class="text-2xl font-bold" :style="{ color: statusColor }">{{ formattedValue }}</span>
        <span class="text-xs text-slate-400 ml-1">{{ cleanedUnit }}</span>
      </div>

      <!-- Deviation line -->
      <p class="text-xs mt-1 opacity-70" :style="{ color: statusColor }">{{ deviation.text }}</p>

      <!-- Range indicator -->
      <div class="mt-3">

        <!-- STRICT: full-range number-line with acceptable zone + 3 ticks + value dot -->
        <template v-if="kpi.logic === 'STRICT'">
          <div class="flex items-center justify-between mb-1.5">
            <p class="text-[9px] text-slate-400 uppercase tracking-wider">Acceptable range</p>
            <span class="text-[9px] font-semibold" :style="{ color: statusColor }">
              {{ status.acceptable ? '✓ in range' : '▲ out of range' }}
            </span>
          </div>
          <div class="relative h-2 flex items-center overflow-visible">
            <!-- Full track: 0 → strictScale -->
            <div class="absolute inset-x-0 h-full rounded-full bg-slate-200"></div>
            <!-- Fill bar: 0 → value dot position -->
            <div
              class="absolute left-0 top-0 h-full rounded-full transition-all duration-500 opacity-80"
              :style="{ width: dotPosition + '%', backgroundColor: statusColor }"
            ></div>
            <!-- Acceptable zone band (filled between low & high ticks) -->
            <div
              class="absolute h-full rounded-full transition-all duration-500"
              :style="{ left: strictLowPct + '%', width: (strictHighPct - strictLowPct) + '%', backgroundColor: statusColor, opacity: 0.18 }"
            ></div>
            <!-- Tick: low bound -->
            <div
              class="absolute w-[2px] h-3 rounded-sm bg-slate-400 -translate-x-1/2 top-1/2 -translate-y-1/2"
              :style="{ left: strictLowPct + '%' }"
            ></div>
            <!-- Tick: target (tall prominent marker, like MAX/MIN) -->
            <div
              class="absolute top-0 w-0.5 h-5 -mt-1.5 rounded -translate-x-1/2"
              :style="{ left: strictTargetPct + '%', backgroundColor: statusColor }"
            ></div>
            <!-- Tick: high bound -->
            <div
              class="absolute w-[2px] h-3 rounded-sm bg-slate-400 -translate-x-1/2 top-1/2 -translate-y-1/2"
              :style="{ left: strictHighPct + '%' }"
            ></div>
            <!-- Value dot: filled (in-range) or hollow ring (out-of-range) -->
            <div
              class="absolute w-3 h-3 rounded-full border-2 -translate-x-1/2 top-1/2 -translate-y-1/2 transition-all duration-500 shadow-sm"
              :style="dotStyle"
            ></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0</span>
            <span>target {{ formatKPIValue(kpi.target) }}</span>
          </div>
        </template>

        <!-- MAX / MIN: fill bar with directional arrow -->
        <template v-else>
          <div class="flex items-center justify-between mb-1.5">
            <p class="text-[9px] text-slate-400 uppercase tracking-wider">
              <span :style="{ color: statusColor }">{{ kpi.logic === 'MAX' ? '↑' : '↓' }}</span>
              {{ kpi.logic === 'MAX' ? ' higher is better' : ' lower is better' }}
            </p>
            <span class="text-[9px] font-semibold" :style="{ color: statusColor }">
              {{ status.acceptable ? '✓ on target' : '▲ off target' }}
            </span>
          </div>
          <div class="relative h-2 rounded-full bg-slate-200 overflow-visible">
            <div
              class="absolute left-0 top-0 h-full rounded-full transition-all duration-500 opacity-80"
              :style="{ width: `${fillBarPct}%`, backgroundColor: statusColor }"
            ></div>
            <!-- Target marker -->
            <div
              class="absolute top-0 h-5 -mt-1.5 w-0.5 rounded"
              :style="{ left: `${targetBarPct}%`, backgroundColor: statusColor }"
            ></div>
            <!-- Directional arrow: MAX → ▶ beyond bar end, MIN → ◀ beyond bar end pointing left -->
            <svg
              v-if="kpi.logic === 'MAX'"
              class="absolute -translate-y-1/2 top-1/2"
              :style="{ left: `calc(${Math.min(fillBarPct + 0.5, 99)}% + 2px)` }"
              width="10" height="12" viewBox="0 0 10 12"
            >
              <polygon points="0,1 10,6 0,11" :fill="statusColor" />
            </svg>
            <svg
              v-else
              class="absolute -translate-y-1/2 top-1/2"
              :style="{ left: `calc(${Math.min(fillBarPct + 0.5, 99)}% + 2px)` }"
              width="10" height="12" viewBox="0 0 10 12"
            >
              <polygon points="10,1 0,6 10,11" :fill="statusColor" />
            </svg>
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

// Status color: colorblind-friendly blue (on-target) / orange (off-target)
const statusColor = computed(() =>
  status.value.acceptable ? '#2563eb' : '#ea580c'
)

// Logic chip styling — tinted by status
const chipStyle = computed(() => {
  if (status.value.acceptable) {
    return {
      backgroundColor: 'rgba(37,99,235,0.1)',
      color: '#2563eb',
      borderColor: 'rgba(37,99,235,0.25)',
    }
  }
  return {
    backgroundColor: 'rgba(234,88,12,0.1)',
    color: '#ea580c',
    borderColor: 'rgba(234,88,12,0.25)',
  }
})

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

// STRICT: scale from 0 → max(bandHigh*1.1, value*1.1) so PPI shows 0→0.77
const strictScale = computed(() => {
  const high = getStrictBand(props.kpi.target).high
  return Math.max(high * 1.1, Math.abs(props.kpi.value) * 1.1) || 1
})

const strictLowPct = computed(() => (getStrictBand(props.kpi.target).low / strictScale.value) * 100)
const strictTargetPct = computed(() => (props.kpi.target / strictScale.value) * 100)
const strictHighPct = computed(() => (getStrictBand(props.kpi.target).high / strictScale.value) * 100)

const dotPosition = computed(() => {
  // Position value dot on the full 0→strictScale range
  const pct = (props.kpi.value / strictScale.value) * 100
  return Math.max(0, Math.min(100, pct))
})

const dotStyle = computed(() => ({
  left: `${dotPosition.value}%`,
  ...(status.value.acceptable
    ? { backgroundColor: statusColor.value, borderColor: 'white' }
    : { backgroundColor: 'white', borderColor: statusColor.value }),
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
