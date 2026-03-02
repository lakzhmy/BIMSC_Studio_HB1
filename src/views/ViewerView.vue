<template>
  <main class="py-8 px-6">
    <div class="max-w-7xl mx-auto">

      <!-- Viewer widget -->
      <div class="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col" style="height: 700px;">
        <div ref="viewerContainer" class="flex-1 relative">

          <!-- Full overlay: only shown before viewer is ready -->
          <div v-if="isFetchingModels" class="absolute inset-0 flex items-center justify-center gap-2 text-slate-600 text-sm z-10">
            <span class="spinner" aria-hidden="true"></span>
            <span>Fetching models from Speckle...</span>
          </div>
          <div v-else-if="!hasLoadedOnce && loadingProgress" class="absolute inset-0 flex items-center justify-center gap-2 text-slate-600 text-sm z-10">
            <span class="spinner" aria-hidden="true"></span>
            <span>{{ loadingProgress }}</span>
          </div>
          <div v-else-if="errorMessage && !loadingProgress" class="absolute inset-0 flex items-center justify-center text-red-600 text-sm px-6 text-center z-10">
            {{ errorMessage }}
          </div>

          <!-- Top-left header -->
          <div class="absolute top-4 left-4 z-10 pointer-events-none">
            <h1 class="text-lg font-semibold text-slate-900 leading-tight">3D Building Viewer</h1>
            <p v-if="streamName" class="text-xs text-slate-500 mt-0.5">{{ streamName }}</p>
          </div>

          <!-- Top-right: non-blocking loading indicator (after first load) -->
          <div v-if="hasLoadedOnce && loadingProgress" class="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600">
            <span class="spinner-sm" aria-hidden="true"></span>
            <span>{{ loadingProgress }}</span>
          </div>

          <!-- Bottom controls -->
          <div class="absolute bottom-0 left-0 right-0 z-10 p-3 bg-gradient-to-t from-white/90 to-white/0">
            <div class="flex items-center gap-3 bg-white/80 backdrop-blur rounded-lg border border-slate-200 px-4 py-2.5">
              <div class="flex items-center gap-1">
                <button
                  @click="switchToCurrentMode"
                  class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
                  :class="viewMode === 'current'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >Current</button>
                <button
                  @click="switchToHistoryMode"
                  class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
                  :class="viewMode === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >History</button>
              </div>

              <div v-if="viewMode === 'current'" class="flex-1 text-xs text-slate-500 text-center">
                Latest version of {{ modelCount }} models
              </div>

              <div v-if="viewMode === 'history'" class="flex-1 flex items-center gap-3 min-w-0">
                <span class="text-[10px] text-slate-400 whitespace-nowrap">{{ formatDate(dateRange.min) }}</span>
                <input
                  :value="sliderValue"
                  @input="onSliderInput"
                  type="range"
                  min="0"
                  max="1000"
                  step="1"
                  class="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
                />
                <span class="text-xs font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">{{ historyDateLabel }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSpeckleModels } from '@/composables/useSpeckleModels'

const viewerContainer = ref(null)
const hasLoadedOnce = ref(false)

const {
  isFetchingModels,
  errorMessage,
  loadingProgress,
  streamName,
  dateRange,
  viewMode,
  historyDateLabel,
  modelCount,
  fetchModels,
  initViewer,
  showCurrentModels,
  showHistoryAtPosition,
  dispose,
  models,
} = useSpeckleModels(viewerContainer)

const sliderValue = ref(1000)
let debounceTimer = null

function onSliderInput(event) {
  sliderValue.value = Number(event.target.value)
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    showHistoryAtPosition(sliderValue.value / 1000)
  }, 300)
}

function switchToCurrentMode() {
  if (viewMode.value === 'current') return
  showCurrentModels()
}

function switchToHistoryMode() {
  if (viewMode.value === 'history') return
  showHistoryAtPosition(sliderValue.value / 1000)
}

function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date)) return ''
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(async () => {
  await fetchModels()
  if (!errorMessage.value && models.value.length > 0) {
    await initViewer()
    await showCurrentModels()
    hasLoadedOnce.value = true
  }
})

onUnmounted(() => {
  clearTimeout(debounceTimer)
  dispose()
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
