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

const STREAM_ID = '3d70848e9c'
const SPECKLE_SERVER = 'https://app.speckle.systems'

export function useSpeckleModels(viewerContainerRef) {
  // --- State ---
  const isFetchingModels = ref(false)
  const errorMessage = ref('')
  const loadingProgress = ref('')

  const streamName = ref('')
  const models = ref([])
  const dateRange = ref({ min: new Date(), max: new Date() })
  const timeline = ref([])

  const viewMode = ref('current')
  const historyPosition = ref(1.0)

  const loadedModels = ref([])
  const hiddenModelIds = ref(new Set())

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

  // --- Viewer Management ---
  async function initViewer() {
    if (!viewerContainerRef.value || viewer) return
    viewer = new Viewer(viewerContainerRef.value, DefaultViewerParams)
    await viewer.init()
    viewer.createExtension(CameraController)
  }

  async function loadModelsIntoViewer(modelEntries) {
    if (!viewer) await initViewer()
    if (!viewer) return

    errorMessage.value = ''
    loadedModels.value = modelEntries

    try {
      await viewer.unloadAll()

      const visibleEntries = modelEntries.filter(
        e => !hiddenModelIds.value.has(e.model.id),
      )

      let shouldZoom = true
      let failedModels = []

      for (let i = 0; i < visibleEntries.length; i++) {
        const entry = visibleEntries[i]
        loadingProgress.value = `Loading ${i + 1}/${visibleEntries.length}: ${entry.model.name}`

        try {
          // Point directly at Speckle (public project — no auth token needed).
          // This bypasses the Express proxy entirely, avoiding body-consumption issues.
          const speckleUrl = `${SPECKLE_SERVER}/streams/${STREAM_ID}/objects/${entry.version.referencedObject}`
          const urls = await UrlHelper.getResourceUrls(speckleUrl)

          for (const url of urls) {
            const loader = new SpeckleLoader(viewer.getWorldTree(), url)
            await viewer.loadObject(loader, shouldZoom)
            shouldZoom = false
          }
        } catch (err) {
          console.warn(`Failed to load model "${entry.model.name}":`, err)
          failedModels.push(entry.model.name)
        }
      }

      if (failedModels.length > 0 && failedModels.length === visibleEntries.length) {
        errorMessage.value = 'Failed to load all models. Check browser console for details.'
      } else if (failedModels.length > 0) {
        errorMessage.value = `Could not load: ${failedModels.join(', ')}`
      }
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Failed to load models'
    } finally {
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
      // Model discovery still uses the /graphql proxy (lightweight, token injected server-side)
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
    historyDate,
    historyDateLabel,
    modelCount,
    fetchModels,
    initViewer,
    showCurrentModels,
    showHistoryAtPosition,
    toggleModelVisibility,
    isModelVisible,
    dispose,
  }
}
