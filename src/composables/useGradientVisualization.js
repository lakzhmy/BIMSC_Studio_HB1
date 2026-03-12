import { ref, shallowRef } from 'vue'
import {
  SpeckleLoader,
  UrlHelper,
  ViewerEvent,
} from '@speckle/viewer'
import {
  fetchModelVersions,
  fetchRootObject,
  fetchObjectChildren,
} from '@/services/speckleService'

export function useGradientVisualization() {
  // --- Active config (set dynamically via initialize) ---
  let activeProjectId = null
  let activeVizModelId = null
  let activeManifestModelId = null

  // --- State ---
  const isActive = ref(false)
  const manifestVersions = shallowRef([])
  const visualizationVersions = shallowRef([])
  const selectedVersionIndex = ref(0)
  const gradientMap = ref(new Map())
  const legendData = ref({ data_min: 0, data_max: 1, property_name: '', buckets: [] })
  const isLoading = ref(false)
  const loadingProgress = ref('')
  const errorMessage = ref('')
  const tooltipData = ref(null)

  let viewer = null
  let filteringExtension = null
  let clickHandlerRegistered = false

  // --- Accept shared viewer from outside ---
  function setViewer(v, fe) {
    viewer = v
    filteringExtension = fe

    // Register click handler once
    if (!clickHandlerRegistered && viewer) {
      viewer.on(ViewerEvent.ObjectClicked, (selectionEvent) => {
        if (!isActive.value) return // ignore clicks when not in gradient mode
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
            screenX: selectionEvent.event?.clientX ?? 0,
            screenY: selectionEvent.event?.clientY ?? 0,
          }
        } else {
          tooltipData.value = null
        }
      })
      clickHandlerRegistered = true
    }
  }

  // --- Color ramp: light blue (#60b5f0) → red (#f06050) ---
  function gradientToColor(t) {
    const clamped = Math.max(0, Math.min(1, t))
    const r = Math.round(96 + (240 - 96) * clamped)   // 96 → 240
    const g = Math.round(181 + (96 - 181) * clamped)   // 181 → 96
    const b = Math.round(240 + (80 - 240) * clamped)   // 240 → 80
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  // --- Initialization: fetch all versions and their root data ---
  // config: { project_id, visualization_model_id, manifest_model_id }
  async function initialize(config) {
    activeProjectId = config.project_id
    activeVizModelId = config.visualization_model_id
    activeManifestModelId = config.manifest_model_id

    isLoading.value = true
    errorMessage.value = ''
    tooltipData.value = null
    loadingProgress.value = 'Fetching manifest versions...'

    try {
      // 1. Fetch manifest versions
      const rawManifest = await fetchModelVersions(activeProjectId, activeManifestModelId, 5)

      // 2. Fetch visualization versions
      loadingProgress.value = 'Fetching visualization versions...'
      const rawViz = await fetchModelVersions(activeProjectId, activeVizModelId, 10)

      // 3. Fetch root objects for manifest versions to get source_version_id and property_name
      loadingProgress.value = 'Loading metadata...'
      const manifestWithRoots = []
      for (const v of rawManifest) {
        const rootData = await fetchRootObject(activeProjectId, v.referencedObject)
        manifestWithRoots.push({ ...v, rootData })
      }
      manifestVersions.value = manifestWithRoots

      // 4. Fetch root objects for visualization versions to get source_version_id
      const vizWithRoots = []
      for (const v of rawViz) {
        const rootData = await fetchRootObject(activeProjectId, v.referencedObject)
        vizWithRoots.push({ ...v, rootData })
      }
      visualizationVersions.value = vizWithRoots

      // 5. Load latest version
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

      // Clear previous colors and unload existing objects
      loadingProgress.value = 'Loading 3D objects...'
      if (filteringExtension) {
        filteringExtension.removeUserObjectColors()
      }
      await viewer.unloadAll()

      // Load visualization objects through proxy (private project — needs auth)
      const proxyUrl = `${window.location.origin}/streams/${activeProjectId}/objects/${vizVersion.referencedObject}`
      const urls = await UrlHelper.getResourceUrls(proxyUrl)

      for (const url of urls) {
        const loader = new SpeckleLoader(viewer.getWorldTree(), url)
        await viewer.loadObject(loader, true)
      }

      // Read bucket definitions from manifest root data
      loadingProgress.value = 'Loading bucket definitions...'
      const rawBuckets = manifest.rootData?.buckets ?? []
      const buckets = rawBuckets
        .map((b, i) => ({
          bucket_label: b.bucket_label,
          range_low: b.range_low,
          range_high: b.range_high,
          color_position: rawBuckets.length > 1 ? i / (rawBuckets.length - 1) : 0,
          element_count: b.element_count,
        }))
        .sort((a, b) => a.range_low - b.range_low)

      console.log(`[gradient] Loaded ${buckets.length} buckets from manifest root`)

      // Build gradient map using bucket_index from visualization children
      loadingProgress.value = 'Applying colors...'
      await buildGradientMap(vizVersion.referencedObject, buckets)
      applyColors()

      // Update legend with bucket data from manifest
      legendData.value = {
        data_min: manifest.rootData?.data_min ?? 0,
        data_max: manifest.rootData?.data_max ?? 1,
        property_name: manifest.rootData?.property_name ?? '',
        buckets: buckets.map(b => ({
          ...b,
          color: gradientToColor(b.color_position),
        })),
      }
    } catch (err) {
      errorMessage.value = err instanceof Error ? err.message : 'Failed to load version'
      console.error('Load version error:', err)
    } finally {
      isLoading.value = false
      loadingProgress.value = ''
    }
  }

  // --- Find which bucket a property value belongs to ---
  function findBucketByValue(buckets, propertyValue) {
    for (let i = 0; i < buckets.length; i++) {
      const b = buckets[i]
      if (i === buckets.length - 1) {
        if (propertyValue >= b.range_low && propertyValue <= b.range_high) return b
      } else {
        if (propertyValue >= b.range_low && propertyValue < b.range_high) return b
      }
    }
    return null
  }

  // --- Build gradient map from visualization children + manifest buckets ---
  async function buildGradientMap(rootObjectId, buckets) {
    const children = await fetchObjectChildren(activeProjectId, rootObjectId, 2, 5000)
    const map = new Map()

    for (const child of children) {
      const data = child.data
      if (data && data.property_value !== undefined) {
        const elementRef = data['@element']
        const geometryId =
          elementRef?.referencedId || elementRef?.[0]?.referencedId || null

        if (geometryId) {
          // Prefer bucket_index, fall back to range lookup
          let bucket = null
          if (data.bucket_index !== undefined && buckets[data.bucket_index]) {
            bucket = buckets[data.bucket_index]
          } else {
            bucket = findBucketByValue(buckets, data.property_value)
          }
          map.set(geometryId, {
            color_position: bucket ? bucket.color_position : 0,
            property_value: data.property_value,
            bucket_label: bucket ? bucket.bucket_label : 'Unknown',
          })
        }
      }
    }

    console.log(`[gradient] Gradient map: ${map.size} elements mapped to ${buckets.length} buckets`)
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

    // Group by bucket color_position (one color per bucket)
    const colorBuckets = new Map()
    for (const [treeId, info] of treeIdToGradient) {
      const pos = info.color_position
      if (!colorBuckets.has(pos)) {
        colorBuckets.set(pos, [])
      }
      colorBuckets.get(pos).push(treeId)
    }

    const colorGroups = []
    for (const [colorPos, objectIds] of colorBuckets) {
      const color = hexToArgb(gradientToColor(colorPos))
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

  // Reset state without touching the shared viewer
  function reset() {
    if (filteringExtension) {
      filteringExtension.removeUserObjectColors()
    }
    isActive.value = false
    gradientMap.value = new Map()
    tooltipData.value = null
    manifestVersions.value = []
    visualizationVersions.value = []
    activeProjectId = null
    activeVizModelId = null
    activeManifestModelId = null
    legendData.value = { data_min: 0, data_max: 1, property_name: '', buckets: [] }
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
    setViewer,
    initialize,
    loadVersion,
    getObjectInfo,
    gradientToColor,
    reset,
  }
}
