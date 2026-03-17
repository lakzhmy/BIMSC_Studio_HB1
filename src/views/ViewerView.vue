<template>
  <main class="py-8 px-6">
    <div class="max-w-7xl mx-auto space-y-6">

      <!-- ========== LIVE VIEW WIDGET (top) — iframe embed ========== -->
      <div id="tour-viewer-3d" class="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col" style="height: 1000px;">

        <!-- Header bar (outside iframe) -->
        <div class="px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <h1 class="text-lg font-semibold text-slate-900 leading-tight">Live Model View</h1>
        </div>

        <!-- Iframe container — clip right-side line with overflow + extra width -->
        <div class="flex-1 relative overflow-hidden">
          <iframe
            :src="liveIframeSrc"
            class="absolute inset-0 border-0"
            style="width: calc(100% + 4px); height: 100%;"
            allow="fullscreen"
            loading="lazy"
          ></iframe>
        </div>

        <!-- Timeline bar (outside iframe) -->
        <div v-if="snapPoints.length > 1" class="px-4 py-3 border-t border-slate-100 flex-shrink-0">
          <div class="flex items-center gap-3">
            <span class="text-[10px] text-slate-400 whitespace-nowrap">Timeline</span>
            <div class="flex-1 flex items-center justify-between relative py-2">
              <div class="absolute left-1.5 right-1.5 h-0.5 bg-slate-300 top-1/2 -translate-y-1/2"></div>
              <button
                v-for="(point, i) in snapPoints"
                :key="i"
                @click="onSnapPointClick(point, i)"
                class="w-3 h-3 rounded-full border-2 relative z-10 transition-all hover:scale-125 focus:outline-none"
                :class="activeSnapIndex === i
                  ? 'bg-blue-600 border-blue-600 scale-125'
                  : 'bg-white border-slate-400 hover:border-blue-400'"
                :title="point.label"
              ></button>
            </div>
            <span class="text-xs font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded whitespace-nowrap min-w-[100px] text-center">
              {{ activeSnapLabel }}
            </span>
          </div>
        </div>

      </div>

      <!-- ========== GRADIENT VISUALIZATION WIDGET (bottom) ========== -->
      <div class="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col" style="height: 1000px;">
        <div ref="gradientViewerContainer" class="flex-1 relative">

          <!-- Loading overlay -->
          <div v-if="isFetchingSets" class="absolute inset-0 flex items-center justify-center gap-2 text-slate-600 text-sm z-10">
            <span class="spinner" aria-hidden="true"></span>
            <span>Loading gradient sets...</span>
          </div>
          <div v-else-if="gradientLoading && !gradientHasLoaded" class="absolute inset-0 flex items-center justify-center gap-2 text-slate-600 text-sm z-10">
            <span class="spinner" aria-hidden="true"></span>
            <span>{{ gradientLoadingProgress || 'Initializing...' }}</span>
          </div>
          <div v-else-if="gradientError && !gradientLoading" class="absolute inset-0 flex items-center justify-center text-red-600 text-sm px-6 text-center z-10">
            {{ gradientError }}
          </div>
          <div v-else-if="!gradientHasLoaded && !isFetchingSets" class="absolute inset-0 flex items-center justify-center text-slate-400 text-sm z-10">
            Select a gradient set to visualize
          </div>

          <!-- Top-left header -->
          <div class="absolute top-4 left-4 z-10 pointer-events-none">
            <h1 class="text-lg font-semibold text-slate-900 leading-tight">Gradient Visualization</h1>
            <p v-if="gradientLegend.property_name" class="text-xs text-slate-500 mt-0.5">{{ gradientLegend.property_name }}</p>
          </div>

          <!-- Top-right: gradient set buttons (vertical) -->
          <div class="absolute top-4 right-4 z-10 flex flex-col gap-1">
            <button
              v-for="gs in gradientSets"
              :key="gs.id"
              @click="switchToGradientSet(gs)"
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors text-center w-40"
              :class="activeGradientSetId === gs.id
                ? 'bg-blue-600 text-white'
                : 'bg-white/90 backdrop-blur text-slate-600 hover:bg-slate-100 border border-slate-200'"
              :disabled="isSwitchingGradient"
            >{{ gs.name }}</button>
          </div>

          <!-- Non-blocking loading indicator -->
          <div v-if="gradientHasLoaded && gradientLoadingProgress" class="absolute top-16 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600">
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

          <!-- Bottom-left: bucket legend -->
          <div v-if="gradientHasLoaded && gradientLegend.property_name" class="absolute bottom-3 left-3 z-10">
            <div class="bg-white/80 backdrop-blur rounded-lg border border-slate-200 px-3 py-2.5">
              <div class="text-xs font-medium text-slate-700">{{ gradientLegend.property_name }}</div>
              <div v-if="activeGradientUnit" class="text-[10px] text-slate-400 mt-0.5">{{ activeGradientUnit }}</div>
              <div class="space-y-0.5 mt-1.5">
                <div
                  v-for="(bucket, i) in gradientLegend.buckets"
                  :key="i"
                  class="flex items-center gap-2 text-[11px]"
                >
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: bucket.color }"></span>
                  <span class="text-slate-700">{{ bucket.bucket_label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom-center: timeline -->
          <div v-if="gradientHasLoaded && gradientManifestVersions.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-3">
            <div class="bg-white/80 backdrop-blur rounded-lg border border-slate-200 px-4 py-2.5">
              <div class="flex items-center gap-2">
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
import {
  Viewer,
  DefaultViewerParams,
  CameraController,
  FilteringExtension,
} from '@speckle/viewer'
import { useGradientVisualization } from '@/composables/useGradientVisualization'
import {
  fetchAllModelsAndVersions,
  transformModelsData,
} from '@/services/speckleService'

// --- Refs ---
const gradientViewerContainer = ref(null)

const gradientHasLoaded = ref(false)
const isFetchingSets = ref(false)
const isSwitchingGradient = ref(false)
const activeGradientSetId = ref(null)
const gradientSets = ref([])

let gradientViewer = null
let gradientFilteringExt = null

// --- Gradient composable ---
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

// --- Live view: iframe + snap-point version switching ---
const SPECKLE_PROJECT = '08c875bbe4'
const SPECKLE_MODEL = 'hyperbuilding01'
const SPECKLE_BASE_URL = `https://app.speckle.systems/projects/${SPECKLE_PROJECT}/models/$${SPECKLE_MODEL}`
const EMBED_PARAMS = '#embed=%7B%22isEnabled%22%3Atrue%7D'

const snapPoints = ref([])
const activeSnapIndex = ref(-1)

const liveIframeSrc = computed(() => {
  const idx = activeSnapIndex.value
  if (idx === -1 || idx === snapPoints.value.length - 1 || !snapPoints.value[idx]) {
    // Latest version — no @versionId
    return SPECKLE_BASE_URL + EMBED_PARAMS
  }
  const versionId = snapPoints.value[idx].version.id
  return `${SPECKLE_BASE_URL}@${versionId}${EMBED_PARAMS}`
})

const activeSnapLabel = computed(() => {
  if (activeSnapIndex.value === -1 || activeSnapIndex.value === snapPoints.value.length - 1) {
    return 'Current'
  }
  const point = snapPoints.value[activeSnapIndex.value]
  return point ? point.label : ''
})

function onSnapPointClick(point, index) {
  if (activeSnapIndex.value === index) return
  activeSnapIndex.value = index
  // iframe src updates reactively via liveIframeSrc computed
}

// Fetch versions for snap-point timeline (lightweight GraphQL only, no 3D loading)
async function fetchLiveSnapPoints() {
  try {
    const stream = await fetchAllModelsAndVersions()
    const data = transformModelsData(stream)
    // Filter to hyperbuilding01
    const filtered = data.models.filter(m => m.name.toLowerCase().includes(SPECKLE_MODEL))
    const allVersions = filtered
      .flatMap(m => m.versions.map(v => ({ model: m, version: v })))
      .sort((a, b) => a.version.createdAt - b.version.createdAt)

    if (allVersions.length === 0) return

    const count = 6
    if (allVersions.length <= count) {
      snapPoints.value = allVersions.map((entry, i) => ({
        index: i,
        model: entry.model,
        version: entry.version,
        date: entry.version.createdAt,
        label: entry.version.createdAt.toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
        }),
      }))
    } else {
      const points = []
      for (let i = 0; i < count; i++) {
        const idx = Math.round(i * (allVersions.length - 1) / (count - 1))
        const entry = allVersions[idx]
        points.push({
          index: idx,
          model: entry.model,
          version: entry.version,
          date: entry.version.createdAt,
          label: entry.version.createdAt.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
          }),
        })
      }
      snapPoints.value = points
    }
    activeSnapIndex.value = snapPoints.value.length - 1
  } catch (err) {
    console.error('Failed to fetch live snap points:', err)
  }
}

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

// --- Gradient controls ---
const gradientSliderValue = ref(0)

const activeGradientUnit = computed(() => {
  const gs = gradientSets.value.find(s => s.id === activeGradientSetId.value)
  return gs?.unit || ''
})

const gradientTimelineLabel = computed(() => {
  const versions = gradientManifestVersions.value
  const idx = gradientSliderValue.value
  if (!versions[idx]) return ''
  return formatDate(new Date(versions[idx].createdAt))
})

async function ensureGradientViewer() {
  if (gradientViewer) return
  if (!gradientViewerContainer.value) return
  gradientViewer = new Viewer(gradientViewerContainer.value, DefaultViewerParams)
  await gradientViewer.init()
  gradientViewer.createExtension(CameraController)
  gradientFilteringExt = gradientViewer.createExtension(FilteringExtension)
  gradientSetViewer(gradientViewer, gradientFilteringExt)
}

async function switchToGradientSet(gs) {
  if (activeGradientSetId.value === gs.id && gradientHasLoaded.value) return
  isSwitchingGradient.value = true
  activeGradientSetId.value = gs.id

  resetGradient()
  gradientSliderValue.value = 0

  try {
    await ensureGradientViewer()
    await initGradient({
      project_id: gs.project_id,
      visualization_model_id: gs.visualization_model_id,
      manifest_model_id: gs.manifest_model_id,
    })
    gradientHasLoaded.value = true
  } catch (err) {
    console.error('Failed to switch to gradient set:', err)
  } finally {
    isSwitchingGradient.value = false
  }
}

function onGradientSliderInput(event) {
  const idx = Number(event.target.value)
  gradientSliderValue.value = idx
  loadGradientVersion(idx)
}

// --- Tooltip positioning ---
const tooltipLeft = computed(() => {
  if (!gradientTooltip.value || !gradientViewerContainer.value) return 0
  const rect = gradientViewerContainer.value.getBoundingClientRect()
  return gradientTooltip.value.screenX - rect.left + 12
})

const tooltipTop = computed(() => {
  if (!gradientTooltip.value || !gradientViewerContainer.value) return 0
  const rect = gradientViewerContainer.value.getBoundingClientRect()
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
  // Fetch snap points for the live view timeline (lightweight GraphQL, no 3D)
  fetchLiveSnapPoints()

  // Fetch gradient sets, then auto-load the first one
  isFetchingSets.value = true
  fetchGradientSets().then(() => {
    isFetchingSets.value = false
    if (gradientSets.value.length > 0) {
      switchToGradientSet(gradientSets.value[0])
    }
  })
})

onUnmounted(() => {
  resetGradient()
  if (gradientViewer && typeof gradientViewer.dispose === 'function') {
    gradientViewer.dispose()
    gradientViewer = null
    gradientFilteringExt = null
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
