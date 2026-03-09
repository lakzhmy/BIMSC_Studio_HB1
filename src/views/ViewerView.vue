<template>
  <main class="py-8 px-6">
    <div class="max-w-7xl mx-auto">

      <!-- Viewer widget -->
      <div class="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col" style="height: 700px;">
        <div ref="viewerContainer" class="flex-1 relative">

          <!-- Loading overlay -->
          <div v-if="isFetchingSets" class="absolute inset-0 flex items-center justify-center gap-2 text-slate-600 text-sm z-10">
            <span class="spinner" aria-hidden="true"></span>
            <span>Loading viewer...</span>
          </div>
          <div v-else-if="activeLoading && !hasLoaded" class="absolute inset-0 flex items-center justify-center gap-2 text-slate-600 text-sm z-10">
            <span class="spinner" aria-hidden="true"></span>
            <span>{{ activeLoadingProgress || 'Initializing...' }}</span>
          </div>
          <div v-else-if="activeError && !activeLoading" class="absolute inset-0 flex items-center justify-center text-red-600 text-sm px-6 text-center z-10">
            {{ activeError }}
          </div>

          <!-- Top-left header -->
          <div class="absolute top-4 left-4 z-10 pointer-events-none">
            <h1 class="text-lg font-semibold text-slate-900 leading-tight">
              {{ viewMode === 'live' ? 'Live Model View' : 'Gradient Visualization' }}
            </h1>
            <p v-if="viewMode === 'live' && liveStreamName" class="text-xs text-slate-500 mt-0.5">{{ liveStreamName }}</p>
            <p v-if="viewMode !== 'live' && gradientLegend.property_name" class="text-xs text-slate-500 mt-0.5">{{ gradientLegend.property_name }}</p>
          </div>

          <!-- Top-right: mode selector buttons -->
          <div class="absolute top-4 right-4 z-10 flex items-center gap-1 flex-wrap justify-end">
            <!-- Live View button (always first) -->
            <button
              @click="switchToLiveView"
              class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
              :class="viewMode === 'live'
                ? 'bg-blue-600 text-white'
                : 'bg-white/90 backdrop-blur text-slate-600 hover:bg-slate-100 border border-slate-200'"
              :disabled="isSwitching"
            >Live View</button>

            <!-- Gradient set buttons -->
            <button
              v-for="gs in gradientSets"
              :key="gs.id"
              @click="switchToGradientSet(gs)"
              class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
              :class="viewMode === gs.id
                ? 'bg-blue-600 text-white'
                : 'bg-white/90 backdrop-blur text-slate-600 hover:bg-slate-100 border border-slate-200'"
              :disabled="isSwitching"
            >{{ gs.name }}</button>
          </div>

          <!-- Non-blocking loading indicator (when switching after first load) -->
          <div v-if="hasLoaded && activeLoadingProgress" class="absolute top-14 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600">
            <span class="spinner-sm" aria-hidden="true"></span>
            <span>{{ activeLoadingProgress }}</span>
          </div>

          <!-- Tooltip on object click (gradient mode only) -->
          <div
            v-if="viewMode !== 'live' && gradientTooltip"
            class="absolute z-20 bg-white rounded-lg border border-slate-200 shadow-lg px-3 py-2 text-xs pointer-events-none"
            :style="{ left: tooltipLeft + 'px', top: tooltipTop + 'px' }"
          >
            <div class="font-medium text-slate-900">Value: {{ gradientTooltip.property_value }}</div>
            <div class="text-slate-500 mt-0.5">Bucket: {{ gradientTooltip.bucket_label }}</div>
          </div>

          <!-- Bottom controls -->
          <div class="absolute bottom-0 left-0 right-0 z-10 p-3 bg-gradient-to-t from-white/90 to-white/0">
            <div class="bg-white/80 backdrop-blur rounded-lg border border-slate-200 px-4 py-3 space-y-3">

              <!-- Gradient Legend (gradient mode only) -->
              <div v-if="viewMode !== 'live' && gradientLegend.property_name">
                <div class="text-xs font-medium text-slate-700 mb-1">{{ gradientLegend.property_name }}</div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-slate-500">{{ gradientLegend.global_min }}</span>
                  <div class="flex-1 h-3 rounded-full gradient-bar"></div>
                  <span class="text-[10px] text-slate-500">{{ gradientLegend.global_max }}</span>
                </div>
              </div>

              <!-- Gradient Timeline (gradient mode with multiple versions) -->
              <div v-if="viewMode !== 'live' && gradientManifestVersions.length > 1" class="flex items-center gap-2">
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

              <!-- Live View Timeline (live mode with version history) -->
              <div v-if="viewMode === 'live' && liveTimeline.length > 1" class="flex items-center gap-2">
                <span class="text-[10px] text-slate-400 whitespace-nowrap">Timeline</span>
                <input
                  :value="liveSliderValue"
                  @input="onLiveSliderInput"
                  type="range"
                  :min="0"
                  :max="100"
                  step="1"
                  class="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
                />
                <span class="text-xs font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
                  {{ liveTimelineLabel }}
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
import {
  Viewer,
  DefaultViewerParams,
  CameraController,
  FilteringExtension,
} from '@speckle/viewer'
import { useGradientVisualization } from '@/composables/useGradientVisualization'
import { useSpeckleModels } from '@/composables/useSpeckleModels'

const viewerContainer = ref(null)
const viewMode = ref('live') // 'live' | gradient set id
const hasLoaded = ref(false)
const isFetchingSets = ref(false)
const isSwitching = ref(false)
const gradientSets = ref([])

// Shared viewer instance — created once, never disposed until unmount
let sharedViewer = null
let sharedFilteringExt = null

async function createSharedViewer() {
  if (sharedViewer || !viewerContainer.value) return
  sharedViewer = new Viewer(viewerContainer.value, DefaultViewerParams)
  await sharedViewer.init()
  sharedViewer.createExtension(CameraController)
  sharedFilteringExt = sharedViewer.createExtension(FilteringExtension)

  // Hand the shared viewer to both composables
  gradientSetViewer(sharedViewer, sharedFilteringExt)
  liveSetViewer(sharedViewer)
}

// --- Gradient composable (no viewer creation inside) ---
const {
  manifestVersions: gradientManifestVersions,
  legendData: gradientLegend,
  isLoading: gradientLoading,
  loadingProgress: gradientLoadingProgress,
  errorMessage: gradientError,
  tooltipData: gradientTooltip,
  setViewer: gradientSetViewer,
  initialize: initGradient,
  loadVersion: loadGradientVersion,
  reset: resetGradient,
} = useGradientVisualization()

// --- Live view composable (no viewer creation inside) ---
const {
  isFetchingModels: liveFetching,
  errorMessage: liveError,
  loadingProgress: liveLoadingProgress,
  streamName: liveStreamName,
  models: liveModels,
  dateRange: liveDateRange,
  timeline: liveTimeline,
  historyDateLabel: liveHistoryDateLabel,
  setViewer: liveSetViewer,
  fetchModels: liveFetchModels,
  showCurrentModels: liveShowCurrent,
  showHistoryAtPosition: liveShowHistory,
} = useSpeckleModels()

// --- Unified loading/error state ---
const activeLoading = computed(() =>
  viewMode.value === 'live' ? liveFetching.value : gradientLoading.value
)

const activeLoadingProgress = computed(() =>
  viewMode.value === 'live' ? liveLoadingProgress.value : gradientLoadingProgress.value
)

const activeError = computed(() =>
  viewMode.value === 'live' ? liveError.value : gradientError.value
)

// --- Fetch gradient sets from API ---
async function fetchGradientSets() {
  try {
    const res = await fetch('/api/gradient-sets')
    if (!res.ok) throw new Error(`Failed to fetch gradient sets: ${res.status}`)
    gradientSets.value = await res.json()
  } catch (err) {
    console.error('Failed to fetch gradient sets:', err)
    gradientSets.value = []
  }
}

// --- Live view controls ---
const liveSliderValue = ref(100) // 0-100, default to latest (100 = position 1.0)
let liveModelsFetched = false

const liveTimelineLabel = computed(() => {
  if (liveSliderValue.value >= 100) return 'Current'
  return liveHistoryDateLabel.value || ''
})

async function switchToLiveView() {
  if (viewMode.value === 'live') return
  isSwitching.value = true
  viewMode.value = 'live'

  // Clear gradient state (removes colors, unloads handled by live loader)
  resetGradient()

  try {
    if (!liveModelsFetched) {
      await liveFetchModels('hyperbuilding01')
      liveModelsFetched = true
    }
    liveSliderValue.value = 100
    await liveShowCurrent()
    hasLoaded.value = true
  } catch (err) {
    console.error('Failed to switch to live view:', err)
  } finally {
    isSwitching.value = false
  }
}

function onLiveSliderInput(event) {
  const val = Number(event.target.value)
  liveSliderValue.value = val
  const position = val / 100
  if (val >= 100) {
    liveShowCurrent()
  } else {
    liveShowHistory(position)
  }
}

// --- Gradient controls ---
const gradientSliderValue = ref(0)

const gradientTimelineLabel = computed(() => {
  const versions = gradientManifestVersions.value
  const idx = gradientSliderValue.value
  if (!versions[idx]) return ''
  return formatDate(new Date(versions[idx].createdAt))
})

async function switchToGradientSet(gs) {
  if (viewMode.value === gs.id && hasLoaded.value) return
  isSwitching.value = true
  viewMode.value = gs.id

  // Reset gradient state (clears old colors) — viewer.unloadAll() called inside initGradient
  resetGradient()
  gradientSliderValue.value = 0

  try {
    await initGradient({
      project_id: gs.project_id,
      visualization_model_id: gs.visualization_model_id,
      manifest_model_id: gs.manifest_model_id,
    })
    hasLoaded.value = true
  } catch (err) {
    console.error('Failed to switch to gradient set:', err)
  } finally {
    isSwitching.value = false
  }
}

function onGradientSliderInput(event) {
  const idx = Number(event.target.value)
  gradientSliderValue.value = idx
  loadGradientVersion(idx).then(() => {
    hasLoaded.value = true
  })
}

// --- Tooltip positioning (gradient mode, relative to viewer container) ---
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
  isFetchingSets.value = true
  await fetchGradientSets()
  isFetchingSets.value = false

  // Create shared viewer once
  await createSharedViewer()

  // Default: load live view
  await liveFetchModels('hyperbuilding01')
  liveModelsFetched = true
  await liveShowCurrent()
  hasLoaded.value = true
})

onUnmounted(() => {
  resetGradient()
  if (sharedViewer && typeof sharedViewer.dispose === 'function') {
    sharedViewer.dispose()
    sharedViewer = null
    sharedFilteringExt = null
  }
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
