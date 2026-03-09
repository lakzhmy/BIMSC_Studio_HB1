import { ref, shallowRef } from 'vue'
import {
  Viewer,
  DefaultViewerParams,
  SpeckleLoader,
  UrlHelper,
  CameraController,
  FilteringExtension,
  ViewerEvent,
} from '@speckle/viewer'
import {
  fetchModelVersions,
  fetchRootObject,
  fetchObjectChildren,
} from '@/services/speckleService'

const TARGET_PROJECT_ID = import.meta.env.VITE_SPECKLE_TARGET_PROJECT_ID
const VIZ_MODEL_ID = import.meta.env.VITE_SPECKLE_VISUALIZATION_MODEL_ID
const MANIFEST_MODEL_ID = import.meta.env.VITE_SPECKLE_MANIFEST_MODEL_ID

export function useGradientVisualization(viewerContainerRef) {
  // --- State ---
  const isActive = ref(false)
  const manifestVersions = shallowRef([])
  const visualizationVersions = shallowRef([])
  const selectedVersionIndex = ref(0)
  const gradientMap = ref(new Map())
  const legendData = ref({ global_min: 0, global_max: 1, property_name: '' })
  const isLoading = ref(false)
  const loadingProgress = ref('')
  const errorMessage = ref('')
  const tooltipData = ref(null)

  let viewer = null
  let filteringExtension = null

  // --- Color ramp: light yellow → deep red ---
  function gradientToColor(t) {
    const clamped = Math.max(0, Math.min(1, t))
    const r = 255
    const g = Math.round(255 * (1 - clamped))
    const b = Math.round(80 * (1 - clamped))
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  // --- Viewer ---
  async function initViewer() {
    if (!viewerContainerRef.value) return
    if (viewer) {
      viewer.dispose()
      viewer = null
      filteringExtension = null
    }
    viewer = new Viewer(viewerContainerRef.value, DefaultViewerParams)
    await viewer.init()
    viewer.createExtension(CameraController)
    filteringExtension = viewer.createExtension(FilteringExtension)

    viewer.on(ViewerEvent.ObjectClicked, (selectionEvent) => {
      if (!selectionEvent || !selectionEvent.hits || selectionEvent.hits.length === 0) {
        tooltipData.value = null
        return
      }
      const hit = selectionEvent.hits[0]
      const nodeId = hit.node?.model?.raw?.id
      if (nodeId && gradientMap.value.has(nodeId)) {
        const info = gradientMap.value.get(nodeId)
        tooltipData.value = {
          property_value: info.property_value,
          bucket_label: info.bucket_label,
          gradient_value: info.gradient_value,
          screenX: selectionEvent.event?.clientX ?? 0,
          screenY: selectionEvent.event?.clientY ?? 0,
        }
      } else {
        tooltipData.value = null
      }
    })
  }

  // --- Initialization: fetch all versions and their root data ---
  async function initialize() {
    isLoading.value = true
    errorMessage.value = ''
    loadingProgress.value = 'Fetching manifest versions...'

    try {
      // 1. Fetch manifest versions
      const rawManifest = await fetchModelVersions(TARGET_PROJECT_ID, MANIFEST_MODEL_ID, 5)

      // 2. Fetch visualization versions
      loadingProgress.value = 'Fetching visualization versions...'
      const rawViz = await fetchModelVersions(TARGET_PROJECT_ID, VIZ_MODEL_ID, 10)

      // 3. Fetch root objects for manifest versions to get source_version_id and property_name
      loadingProgress.value = 'Loading metadata...'
      const manifestWithRoots = []
      for (const v of rawManifest) {
        const rootData = await fetchRootObject(TARGET_PROJECT_ID, v.referencedObject)
        manifestWithRoots.push({ ...v, rootData })
      }
      manifestVersions.value = manifestWithRoots

      // 4. Fetch root objects for visualization versions to get source_version_id
      const vizWithRoots = []
      for (const v of rawViz) {
        const rootData = await fetchRootObject(TARGET_PROJECT_ID, v.referencedObject)
        vizWithRoots.push({ ...v, rootData })
      }
      visualizationVersions.value = vizWithRoots

      // 5. Init viewer and load the latest version
      await initViewer()
      isActive.value = true
      await loadVersion(0)
    } catch (err) {
      errorMessage.value = err instanceof Error ? err.message : 'Failed to initialize gradient view'
      console.error('Gradient initialization error:', err)
    } finally {
      isLoading.value = false
      loadingProgress.value = ''
    }
  }

  // --- Load a specific version by timeline index ---
  async function loadVersion(index) {
    if (!viewer) return

    isLoading.value = true
    tooltipData.value = null
    errorMessage.value = ''

    try {
      selectedVersionIndex.value = index
      const manifest = manifestVersions.value[index]
      if (!manifest) {
        errorMessage.value = 'No manifest version at this index'
        return
      }

      const sourceVersionId = manifest.rootData?.source_version_id
      loadingProgress.value = 'Matching visualization version...'

      // Find matching visualization version
      const vizVersion = visualizationVersions.value.find(
        v => v.rootData?.source_version_id === sourceVersionId,
      )

      if (!vizVersion) {
        errorMessage.value = `No visualization found for source version ${sourceVersionId}`
        return
      }

      // Unload existing objects
      loadingProgress.value = 'Loading 3D objects...'
      await viewer.unloadAll()

      // Load visualization objects through proxy (private project — needs auth)
      const proxyUrl = `${window.location.origin}/streams/${TARGET_PROJECT_ID}/objects/${vizVersion.referencedObject}`
      const urls = await UrlHelper.getResourceUrls(proxyUrl)

      for (const url of urls) {
        const loader = new SpeckleLoader(viewer.getWorldTree(), url)
        await viewer.loadObject(loader, true)
      }

      // Build gradient map from children
      loadingProgress.value = 'Applying colors...'
      await buildGradientMap(vizVersion.referencedObject)
      applyColors()

      // Update legend
      legendData.value = {
        global_min: vizVersion.rootData?.global_min ?? 0,
        global_max: vizVersion.rootData?.global_max ?? 1,
        property_name: manifest.rootData?.property_name ?? '',
      }
    } catch (err) {
      errorMessage.value = err instanceof Error ? err.message : 'Failed to load version'
      console.error('Load version error:', err)
    } finally {
      isLoading.value = false
      loadingProgress.value = ''
    }
  }

  // --- Build gradient map from object children ---
  async function buildGradientMap(rootObjectId) {
    const children = await fetchObjectChildren(TARGET_PROJECT_ID, rootObjectId, 2, 5000)
    const map = new Map()

    for (const child of children) {
      const data = child.data
      if (data && data.gradient_value !== undefined) {
        // The @element reference contains the geometry object ID
        const elementRef = data['@element']
        const geometryId =
          elementRef?.referencedId || elementRef?.[0]?.referencedId || null

        if (geometryId) {
          map.set(geometryId, {
            gradient_value: data.gradient_value,
            property_value: data.property_value,
            bucket_label: data.bucket_label,
          })
        }
      }
    }

    gradientMap.value = map
  }

  // --- Apply colors to the viewer using FilteringExtension ---
  function applyColors() {
    if (!filteringExtension || !viewer) return

    // Walk the world tree to find all renderable nodes and their IDs
    const worldTree = viewer.getWorldTree()
    const root = worldTree.root
    const treeIdToGradient = new Map()
    const unmatchedTreeIds = []

    function walkTree(node) {
      if (!node) return
      const raw = node.model?.raw
      if (raw?.id && gradientMap.value.has(raw.id)) {
        treeIdToGradient.set(node.model.id, gradientMap.value.get(raw.id))
      } else if (raw?.id) {
        unmatchedTreeIds.push({ treeId: node.model.id, rawId: raw.id, type: raw.speckle_type })
      }
      if (node.children) {
        for (const child of node.children) {
          walkTree(child)
        }
      }
    }
    walkTree(root)

    console.log(`[gradient] Tree nodes matched: ${treeIdToGradient.size}, unmatched: ${unmatchedTreeIds.length}`)
    if (unmatchedTreeIds.length > 0) {
      console.log('[gradient] Sample unmatched:', unmatchedTreeIds.slice(0, 5))
    }

    // Group by rounded gradient value for efficiency
    const buckets = new Map()
    for (const [treeId, info] of treeIdToGradient) {
      const rounded = Math.round(info.gradient_value * 100) / 100
      if (!buckets.has(rounded)) {
        buckets.set(rounded, [])
      }
      buckets.get(rounded).push(treeId)
    }

    const colorGroups = []
    for (const [gradientVal, objectIds] of buckets) {
      const color = hexToArgb(gradientToColor(gradientVal))
      colorGroups.push({ objectIds, color })
    }

    console.log(`[gradient] Applying ${colorGroups.length} color groups to ${treeIdToGradient.size} nodes`)
    filteringExtension.setUserObjectColors(colorGroups)
  }

  // Convert hex color to ARGB number for Speckle viewer
  function hexToArgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    // ARGB: fully opaque
    return (0xff << 24) | (r << 16) | (g << 8) | b
  }

  function getObjectInfo(objectId) {
    return gradientMap.value.get(objectId) || null
  }

  function dispose() {
    if (viewer && typeof viewer.dispose === 'function') {
      viewer.dispose()
      viewer = null
      filteringExtension = null
    }
    isActive.value = false
    gradientMap.value = new Map()
    tooltipData.value = null
    manifestVersions.value = []
    visualizationVersions.value = []
  }

  return {
    isActive,
    manifestVersions,
    visualizationVersions,
    selectedVersionIndex,
    gradientMap,
    legendData,
    isLoading,
    loadingProgress,
    errorMessage,
    tooltipData,
    initialize,
    loadVersion,
    getObjectInfo,
    gradientToColor,
    dispose,
  }
}
