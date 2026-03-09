<template>
  <main class="py-8 px-6">
    <div class="max-w-7xl mx-auto">

      <!-- Viewer widget -->
      <div class="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col" style="height: 700px;">
        <div ref="viewerContainer" class="flex-1 relative">

          <!-- Loading overlay -->
          <div v-if="gradientLoading && !gradientHasLoaded" class="absolute inset-0 flex items-center justify-center gap-2 text-slate-600 text-sm z-10">
            <span class="spinner" aria-hidden="true"></span>
            <span>{{ gradientLoadingProgress || 'Initializing gradient view...' }}</span>
          </div>
          <div v-else-if="gradientError && !gradientLoading" class="absolute inset-0 flex items-center justify-center text-red-600 text-sm px-6 text-center z-10">
            {{ gradientError }}
          </div>

          <!-- Top-left header -->
          <div class="absolute top-4 left-4 z-10 pointer-events-none">
            <h1 class="text-lg font-semibold text-slate-900 leading-tight">Gradient Visualization</h1>
            <p v-if="gradientLegend.property_name" class="text-xs text-slate-500 mt-0.5">{{ gradientLegend.property_name }}</p>
          </div>

          <!-- Top-right: non-blocking loading indicator -->
          <div v-if="gradientHasLoaded && gradientLoadingProgress" class="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600">
            <span class="spinner-sm" aria-hidden="true"></span>
            <span>{{ gradientLoadingProgress }}</span>
          </div>

          <!-- Tooltip on object click -->
          <div
            v-if="gradientTooltip"
            class="absolute z-20 bg-white rounded-lg border border-slate-200 shadow-lg px-3 py-2 text-xs pointer-events-none"
            :style="{ left: tooltipLeft + 'px', top: tooltipTop + 'px' }"
          >
            <div class="font-medium text-slate-900">Value: {{ gradientTooltip.property_value }}</div>
            <div class="text-slate-500 mt-0.5">Bucket: {{ gradientTooltip.bucket_label }}</div>
          </div>

          <!-- Bottom controls: Legend + Timeline -->
          <div class="absolute bottom-0 left-0 right-0 z-10 p-3 bg-gradient-to-t from-white/90 to-white/0">
            <div class="bg-white/80 backdrop-blur rounded-lg border border-slate-200 px-4 py-3 space-y-3">
              <!-- Legend -->
              <div v-if="gradientLegend.property_name">
                <div class="text-xs font-medium text-slate-700 mb-1">{{ gradientLegend.property_name }}</div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-slate-500">{{ gradientLegend.global_min }}</span>
                  <div class="flex-1 h-3 rounded-full gradient-bar"></div>
                  <span class="text-[10px] text-slate-500">{{ gradientLegend.global_max }}</span>
                </div>
              </div>

              <!-- Timeline -->
              <div v-if="gradientManifestVersions.length > 1" class="flex items-center gap-2">
                <span class="text-[10px] text-slate-400 whitespace-nowrap">Timeline</span>
                <input
                  :value="gradientSliderValue"
                  @input="onGradientSliderInput"
                  type="range"
                  :min="0"
                  :max="gradientManifestVersions.length - 1"
                  step="1"
                  class="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
                />
                <span class="text-xs font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
                  {{ gradientTimelineLabel }}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGradientVisualization } from '@/composables/useGradientVisualization'

const viewerContainer = ref(null)
const gradientHasLoaded = ref(false)

// --- Gradient composable ---
const {
  manifestVersions: gradientManifestVersions,
  legendData: gradientLegend,
  isLoading: gradientLoading,
  loadingProgress: gradientLoadingProgress,
  errorMessage: gradientError,
  tooltipData: gradientTooltip,
  initialize: initGradient,
  loadVersion: loadGradientVersion,
  dispose: disposeGradient,
} = useGradientVisualization(viewerContainer)

// --- Gradient controls ---
const gradientSliderValue = ref(0)

const gradientTimelineLabel = computed(() => {
  const versions = gradientManifestVersions.value
  const idx = gradientSliderValue.value
  if (!versions[idx]) return ''
  return formatDate(new Date(versions[idx].createdAt))
})

function onGradientSliderInput(event) {
  const idx = Number(event.target.value)
  gradientSliderValue.value = idx
  loadGradientVersion(idx).then(() => {
    gradientHasLoaded.value = true
  })
}

// --- Tooltip positioning (relative to viewer container) ---
const tooltipLeft = computed(() => {
  if (!gradientTooltip.value || !viewerContainer.value) return 0
  const rect = viewerContainer.value.getBoundingClientRect()
  return gradientTooltip.value.screenX - rect.left + 12
})

const tooltipTop = computed(() => {
  if (!gradientTooltip.value || !viewerContainer.value) return 0
  const rect = viewerContainer.value.getBoundingClientRect()
  return gradientTooltip.value.screenY - rect.top - 40
})

// --- Utilities ---
function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date)) return ''
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// --- Lifecycle ---
onMounted(async () => {
  await initGradient()
  gradientHasLoaded.value = true
})

onUnmounted(() => {
  disposeGradient()
})
</script>

<style scoped>
:deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.2);
}

input[type='range']::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.2);
  border: none;
}

.gradient-bar {
  background: linear-gradient(to right, #ffff50, #ff8800, #ff0000);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(100, 116, 139, 0.2);
  border-top-color: rgba(100, 116, 139, 0.9);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.spinner-sm {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(100, 116, 139, 0.2);
  border-top-color: rgba(100, 116, 139, 0.9);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
