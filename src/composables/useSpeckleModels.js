import { ref, computed } from 'vue'
import {
  Viewer,
  DefaultViewerParams,
  SpeckleLoader,
  UrlHelper,
  CameraController,
} from '@speckle/viewer'
import {
  fetchAllModelsAndVersions,
  transformModelsData,
  getModelsAtDate,
  getLatestModels,
} from '@/services/speckleService'

export function useSpeckleModels(viewerContainerRef) {
  // --- State ---
  const isLoading = ref(false)
  const isFetchingModels = ref(false)
  const errorMessage = ref('')
  const loadingProgress = ref('')

  const streamName = ref('')
  const models = ref([])
  const dateRange = ref({ min: new Date(), max: new Date() })
  const timeline = ref([])

  const viewMode = ref('current') // 'current' | 'history'
  const historyPosition = ref(1.0) // 0.0 to 1.0 across dateRange

  // { model, version }[] — entries currently targeted for display
  const loadedModels = ref([])
  // Set of model IDs that the user has toggled OFF
  const hiddenModelIds = ref(new Set())
  // Map of model ID -> loaded SpeckleLoader urls (for unload tracking)
  const loadedObjectUrls = ref(new Map())

  let viewer = null

  // --- Computed ---
  const historyDate = computed(() => {
    const { min, max } = dateRange.value
    const range = max.getTime() - min.getTime()
    return new Date(min.getTime() + range * historyPosition.value)
  })

  const historyDateLabel = computed(() =>
    historyDate.value.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  )

  const modelCount = computed(() => models.value.length)

  const visibleModelCount = computed(
    () => loadedModels.value.filter(e => !hiddenModelIds.value.has(e.model.id)).length,
  )

  const statusLabel = computed(() => {
    if (errorMessage.value) return 'Error'
    if (isFetchingModels.value) return 'Fetching models...'
    if (isLoading.value) return 'Loading geometry...'
    return 'Ready'
  })

  const statusClass = computed(() => {
    if (errorMessage.value) return 'text-red-600'
    if (isFetchingModels.value || isLoading.value) return 'text-amber-600'
    return 'text-green-600'
  })

  // --- Viewer Management ---
  async function initViewer() {
    if (!viewerContainerRef.value || viewer) return
    viewer = new Viewer(viewerContainerRef.value, DefaultViewerParams)
    await viewer.init()
    viewer.createExtension(CameraController)
  }

  /**
   * Loads the given model entries into the viewer.
   * Respects hiddenModelIds — hidden models are skipped.
   */
  async function loadModelsIntoViewer(modelEntries) {
    if (!viewer) await initViewer()
    if (!viewer) return

    isLoading.value = true
    loadingProgress.value = ''
    errorMessage.value = ''

    try {
      await viewer.unloadAll()
      loadedObjectUrls.value = new Map()

      const visibleEntries = modelEntries.filter(
        e => !hiddenModelIds.value.has(e.model.id),
      )

      let shouldZoom = true
      for (let i = 0; i < visibleEntries.length; i++) {
        const entry = visibleEntries[i]
        loadingProgress.value = `Loading model ${i + 1} of ${visibleEntries.length}: ${entry.model.name}`

        try {
          const proxyUrl = `${window.location.origin}${entry.version.objectUrl}`
          const urls = await UrlHelper.getResourceUrls(proxyUrl)

          const loadedUrls = []
          for (const url of urls) {
            const loader = new SpeckleLoader(viewer.getWorldTree(), url)
            await viewer.loadObject(loader, shouldZoom)
            shouldZoom = false
            loadedUrls.push(url)
          }
          loadedObjectUrls.value.set(entry.model.id, loadedUrls)
        } catch (err) {
          console.warn(`Failed to load model "${entry.model.name}":`, err)
        }
      }

      loadedModels.value = modelEntries
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Failed to load models'
    } finally {
      isLoading.value = false
      loadingProgress.value = ''
    }
  }

  // --- Mode Switching ---
  async function showCurrentModels() {
    viewMode.value = 'current'
    const entries = getLatestModels(models.value)
    await loadModelsIntoViewer(entries)
  }

  async function showHistoryAtPosition(position) {
    viewMode.value = 'history'
    historyPosition.value = position
    const entries = getModelsAtDate(models.value, historyDate.value)
    await loadModelsIntoViewer(entries)
  }

  // --- Model Visibility Toggle ---
  async function toggleModelVisibility(modelId) {
    const newHidden = new Set(hiddenModelIds.value)
    if (newHidden.has(modelId)) {
      newHidden.delete(modelId)
    } else {
      newHidden.add(modelId)
    }
    hiddenModelIds.value = newHidden

    // Reload all visible models (simplest approach — avoids partial unload complexity)
    await loadModelsIntoViewer(loadedModels.value)
  }

  function isModelVisible(modelId) {
    return !hiddenModelIds.value.has(modelId)
  }

  // --- Initialization ---
  async function fetchModels() {
    try {
      isFetchingModels.value = true
      errorMessage.value = ''
      const stream = await fetchAllModelsAndVersions()
      const data = transformModelsData(stream)
      streamName.value = data.streamName
      models.value = data.models
      dateRange.value = data.dateRange
      timeline.value = data.timeline
    } catch (error) {
      errorMessage.value =
        error instanceof Error
          ? error.message
          : 'Failed to fetch models from Speckle'
    } finally {
      isFetchingModels.value = false
    }
  }

  function dispose() {
    if (viewer && typeof viewer.dispose === 'function') {
      viewer.dispose()
      viewer = null
    }
  }

  return {
    // State
    isLoading,
    isFetchingModels,
    errorMessage,
    loadingProgress,
    streamName,
    models,
    dateRange,
    timeline,
    viewMode,
    historyPosition,
    loadedModels,
    hiddenModelIds,

    // Computed
    historyDate,
    historyDateLabel,
    modelCount,
    visibleModelCount,
    statusLabel,
    statusClass,

    // Actions
    fetchModels,
    initViewer,
    showCurrentModels,
    showHistoryAtPosition,
    toggleModelVisibility,
    isModelVisible,
    dispose,
  }
}
