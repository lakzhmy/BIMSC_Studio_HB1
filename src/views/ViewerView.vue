<template>
  <main class="py-8 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-slate-900">3D Building Viewer</h1>
          <p class="text-slate-600 mt-1">Live Speckle model loaded from stream object links</p>
        </div>

        <!-- Main Viewer Area -->
        <div class="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col" style="height: 700px;">
          <div ref="viewerContainer" class="flex-1 relative">
            <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
              Loading Speckle model...
            </div>
            <div v-else-if="errorMessage" class="absolute inset-0 flex items-center justify-center text-red-600 text-sm px-6 text-center">
              {{ errorMessage }}
            </div>
            <div v-else-if="infoMessage" class="absolute inset-0 flex items-center justify-center gap-2 text-red-600 text-sm px-6 text-center">
              <span class="spinner" aria-hidden="true"></span>
              <span>{{ infoMessage }}</span>
            </div>
          </div>
        </div>

        <!-- Timeline Control -->
        <div class="bg-white rounded-lg border border-slate-200 p-6 mt-6">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span class="text-sm font-medium text-slate-700 whitespace-nowrap">Project Timeline:</span>
              <div class="flex-1 relative">
                <input
                  v-model.number="currentWeek"
                  type="range"
                  min="1"
                  max="10"
                  class="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                />
                <div class="range-thumb" :style="{ left: `${thumbPosition}%` }">
                  {{ currentWeek }}
                </div>
              </div>
              <div class="text-sm font-semibold text-slate-900 bg-slate-100 px-4 py-2 rounded-lg min-w-fit text-center">
                Week {{ currentWeek }} / 10
              </div>
            </div>
            <div class="text-sm text-slate-700">
              <span class="font-medium block mb-1">Current Phase:</span>
              <span class="font-semibold text-slate-900 text-base">{{ weekLabels[currentWeek - 1] }}</span>
            </div>
          </div>
        </div>

        <!-- Model Info -->
        <div class="bg-white rounded-lg border border-slate-200 p-6 mt-6">
          <div class="flex flex-col gap-2 text-sm text-slate-700">
            <div>
              <span class="font-medium">Week:</span>
              <span class="font-semibold text-slate-900">{{ currentWeek }}</span>
            </div>
            <div>
              <span class="font-medium">Model:</span>
              <span class="font-semibold text-slate-900">{{ activeModelLabel }}</span>
            </div>
          </div>
        </div>

        <!-- Info Panel -->
        <div class="grid grid-cols-2 gap-4 mt-6">
          <div class="bg-white p-4 rounded-lg border border-slate-200">
            <h4 class="font-semibold text-slate-900 mb-2">Status</h4>
            <p class="text-sm text-slate-600">
              Viewer: <span class="font-semibold" :class="statusClass">{{ statusLabel }}</span>
            </p>
          </div>
          <div class="bg-white p-4 rounded-lg border border-slate-200">
            <h4 class="font-semibold text-slate-900 mb-2">Auth</h4>
            <p class="text-sm text-slate-600">
              Token: <span class="font-semibold text-slate-900">{{ hasToken ? 'Configured' : 'Missing' }}</span>
            </p>
          </div>
        </div>
      </div>
    </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Viewer, DefaultViewerParams, SpeckleLoader, UrlHelper, CameraController } from '@speckle/viewer'

const viewerContainer = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')
const infoMessage = ref('')
const currentWeek = ref(5)
const minWeek = 1
const maxWeek = 10

// Optional: required for private streams; leave empty for public models.
const authToken = import.meta.env.VITE_SPECKLE_TOKEN || ''

const hasToken = computed(() => Boolean(authToken))
const statusLabel = computed(() => {
  if (errorMessage.value) return 'Error'
  if (infoMessage.value) return 'No model found'
  return 'Ready'
})
const statusClass = computed(() => {
  if (errorMessage.value) return 'text-red-600'
  if (infoMessage.value) return 'text-amber-600'
  return 'text-green-600'
})
const thumbPosition = computed(() => {
  const ratio = (currentWeek.value - minWeek) / (maxWeek - minWeek)
  return Math.min(100, Math.max(0, ratio * 100))
})

const weekLabels = [
  'Week 1',
  'Week 2',
  'Week 3',
  'Week 4',
  'Week 5',
  'Week 6',
  'Week 7',
  'Week 8',
  'Week 9',
  'Week 10'
]

// Update these URLs per week; leave empty strings to show "In progress".
const weekModelUrls = [
  'https://app.speckle.systems/streams/3d70848e9c/objects/5593e21947',
  'https://app.speckle.systems/streams/3d70848e9c/objects/36a4e51e7cae20342d94f875861779cf',
  'https://app.speckle.systems/streams/3d70848e9c/objects/cce6171d59e3e80e5cfc3eec9c212e5a',
  'https://app.speckle.systems/streams/3d70848e9c/objects/e03549b39607cb8052cf9a67170900a5',
  'https://app.speckle.systems/streams/3d70848e9c/objects/d159e83c2b2c550b930437d2e5707993',
  '',
  '',
  '',
  '',
  ''
]

const activeModelLabel = computed(() => {
  const url = weekModelUrls[currentWeek.value - 1]
  return url ? `Speckle Object ${currentWeek.value}` : 'In progress'
})

let viewer = null

// Loads the selected week and clears any previously loaded model.
async function loadWeekModel(weekIndex) {
  if (!viewerContainer.value) return

  try {
    isLoading.value = true
    errorMessage.value = ''
    infoMessage.value = ''

    const streamObjectUrl = weekModelUrls[weekIndex]
    if (!streamObjectUrl) {
      infoMessage.value = 'In progress'
      if (viewer) {
        await viewer.unloadAll()
      }
      return
    }

    if (!viewer) {
      viewer = new Viewer(viewerContainer.value, DefaultViewerParams)
      await viewer.init()
      viewer.createExtension(CameraController)
    } else {
      await viewer.unloadAll()
    }

    const urls = await UrlHelper.getResourceUrls(streamObjectUrl)
    let shouldZoom = true

    for (const url of urls) {
      const loader = new SpeckleLoader(viewer.getWorldTree(), url, authToken)
      await viewer.loadObject(loader, shouldZoom)
      shouldZoom = false
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load Speckle model.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadWeekModel(currentWeek.value - 1)
})

watch(currentWeek, (newWeek) => {
  loadWeekModel(newWeek - 1)
})

onUnmounted(() => {
  if (viewer && typeof viewer.dispose === 'function') {
    viewer.dispose()
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
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  box-shadow: none;
}

input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  box-shadow: none;
  border: none;
}

.range-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2);
  pointer-events: none;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(220, 38, 38, 0.2);
  border-top-color: rgba(220, 38, 38, 0.9);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
