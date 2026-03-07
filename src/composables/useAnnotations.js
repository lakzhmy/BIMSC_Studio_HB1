import { ref } from 'vue'

// Singleton state — shared across all components that call useAnnotations()
const isVisible = ref(false)
const dbAnnotations = ref([])
const isLoading = ref(false)
let listenerRegistered = false

const ANNOTATION_ADMINS = [
  'Emilie El Chidiac',
  'María Sánchez Domínguez',
  'Lakzhmy Mari Zaro',
]

function isAdmin(userName) {
  if (!userName) return false
  return ANNOTATION_ADMINS.some(
    (admin) => admin.localeCompare(userName, undefined, { sensitivity: 'base' }) === 0
  )
}

function groupByRoute(rows) {
  const map = {}
  rows.forEach((row) => {
    if (!map[row.route]) map[row.route] = []
    const arrowPath = typeof row.arrow_path === 'string' ? JSON.parse(row.arrow_path) : row.arrow_path
    const labelAnchor = typeof row.label_anchor === 'string' ? JSON.parse(row.label_anchor) : row.label_anchor
    map[row.route].push({
      dbId: row.id,
      id: row.ann_id,
      arrowPath,
      label: row.label,
      labelAnchor,
      boxWidth: labelAnchor.w || 230,
      color: row.color,
    })
  })
  return map
}

async function loadAnnotations() {
  isLoading.value = true
  try {
    const res = await fetch('/api/annotations')
    if (res.ok) {
      const rows = await res.json()
      dbAnnotations.value = groupByRoute(rows)
    }
  } catch (err) {
    console.error('[annotations] fetch failed:', err)
  } finally {
    isLoading.value = false
  }
}

async function saveAnnotation(data) {
  const res = await fetch('/api/annotations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  await loadAnnotations()
  return res.json()
}

async function updateAnnotation(id, data) {
  const res = await fetch(`/api/annotations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  await loadAnnotations()
  return res.json()
}

async function deleteAnnotation(id, userName) {
  const res = await fetch(`/api/annotations/${id}?user_name=${encodeURIComponent(userName)}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error((await res.json()).error)
  await loadAnnotations()
}

export function useAnnotations() {
  function toggleAnnotations() {
    isVisible.value = !isVisible.value
  }

  function hideAnnotations() {
    isVisible.value = false
  }

  function registerKeyListener() {
    if (listenerRegistered) return
    listenerRegistered = true

    window.addEventListener('keydown', (event) => {
      const tag = document.activeElement?.tagName?.toLowerCase()
      if (['input', 'textarea', 'select'].includes(tag)) return
      if (document.activeElement?.contentEditable === 'true') return

      if (event.code === 'Space') {
        event.preventDefault()
        toggleAnnotations()
      }
      if (event.code === 'Escape') {
        hideAnnotations()
      }
    })

    // Load annotations from DB on first register
    loadAnnotations()
  }

  return {
    isVisible,
    dbAnnotations,
    isLoading,
    isAdmin,
    toggleAnnotations,
    hideAnnotations,
    registerKeyListener,
    loadAnnotations,
    saveAnnotation,
    updateAnnotation,
    deleteAnnotation,
  }
}
