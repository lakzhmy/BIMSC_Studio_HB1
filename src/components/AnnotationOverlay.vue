<template>
  <!-- Hint button: hidden on login/auth/profile pages -->
  <div v-if="showHintButton" class="fixed bottom-4 right-4 z-[9998] flex items-center gap-2">
    <!-- Admin: Manage Annotations button -->
    <button
      v-if="canEdit"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-500/90 backdrop-blur-sm border border-rose-400 text-white hover:bg-rose-600 shadow-sm transition-all select-none"
      @click="openEditor"
      title="Manage annotations for this page"
    >
      <Settings :size="13" />
      <span>Manage Hints</span>
    </button>

    <button
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-white shadow-sm transition-all select-none"
      @click="toggleAnnotations"
      title="Toggle page hints (Spacebar)"
    >
      <PenLine :size="13" />
      <span>Click here / Space for Hints</span>
    </button>
  </div>

  <!-- Full-screen overlay teleported to body root -->
  <Teleport to="body">
    <Transition name="annotation-fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[9999] select-none cursor-pointer"
        style="background: rgba(0, 0, 0, 0.07);"
        @click="hideAnnotations"
      >
        <svg
          ref="svgRef"
          class="absolute inset-0 pointer-events-none"
          :width="vw"
          :height="vh"
          :viewBox="`0 0 ${vw} ${vh}`"
          xmlns="http://www.w3.org/2000/svg"
          style="width: 100%; height: 100%;"
        >
          <g ref="groupRef" />
        </svg>

        <div
          class="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none"
          style="font-family: 'Caveat', cursive; font-size: 1.05rem; font-style: italic; color: rgba(255,255,255,0.75); letter-spacing: 0.02em;"
        >
          Press Space or Esc to dismiss · click anywhere to close
        </div>
      </div>
    </Transition>

    <!-- Annotation Editor Modal (admin only) -->
    <Transition name="annotation-fade">
      <div
        v-if="editorOpen"
        class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="closeEditor"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" @click.stop>
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <h2 class="text-lg font-semibold text-slate-800">Manage Annotations</h2>
              <p class="text-xs text-slate-400 mt-0.5">Page: <span class="font-medium text-slate-600">{{ route.name }}</span></p>
            </div>
            <button @click="closeEditor" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X :size="18" />
            </button>
          </div>

          <!-- Annotation list -->
          <div class="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            <div v-if="!routeAnnotations.length" class="text-center text-slate-400 py-8 text-sm">
              No annotations on this page yet.
            </div>

            <div
              v-for="(ann, idx) in routeAnnotations"
              :key="ann.dbId || idx"
              class="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="inline-block w-3 h-3 rounded-full" :style="{ background: ann.color }"></span>
                    <span class="text-xs font-mono text-slate-400">{{ ann.id }}</span>
                  </div>
                  <div v-if="editingId !== ann.dbId">
                    <p class="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{{ ann.label }}</p>
                  </div>
                  <div v-else class="space-y-2">
                    <textarea
                      v-model="editForm.label"
                      rows="3"
                      class="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none"
                      placeholder="Annotation text (use \n for new lines)"
                    />
                    <div class="grid grid-cols-2 gap-2">
                      <input v-model="editForm.ann_id" class="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-rose-300 outline-none" placeholder="ID (e.g. kpi-health)" />
                      <input v-model="editForm.color" class="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-rose-300 outline-none" placeholder="Color (e.g. #c0392b)" />
                    </div>
                    <p class="text-[10px] text-slate-400">Arrow path & anchor use current values. Advanced: edit via JSON.</p>
                  </div>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <template v-if="editingId !== ann.dbId">
                    <button @click="startEdit(ann)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors" title="Edit">
                      <Pencil :size="14" />
                    </button>
                    <button @click="handleDelete(ann)" class="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 :size="14" />
                    </button>
                  </template>
                  <template v-else>
                    <button @click="handleSaveEdit(ann)" class="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="Save">
                      <Check :size="14" />
                    </button>
                    <button @click="editingId = null" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors" title="Cancel">
                      <X :size="14" />
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Add new annotation -->
          <div class="border-t border-slate-200 px-6 py-4">
            <div v-if="!showAddForm" class="flex justify-center">
              <button @click="showAddForm = true" class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors">
                <Plus :size="14" />
                Add Annotation
              </button>
            </div>
            <div v-else class="space-y-3">
              <div class="grid grid-cols-2 gap-2">
                <input v-model="newForm.ann_id" class="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 outline-none" placeholder="ID (e.g. my-hint)" />
                <input v-model="newForm.color" class="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 outline-none" placeholder="Color (default: #c0392b)" />
              </div>
              <textarea
                v-model="newForm.label"
                rows="3"
                class="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none"
                placeholder="Annotation text (use \n for new lines)"
              />
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-[10px] text-slate-400 mb-1 block">Label position (x, y fractions 0-1)</label>
                  <div class="flex gap-1">
                    <input v-model.number="newForm.labelX" type="number" step="0.01" min="0" max="1" class="w-full text-xs border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-rose-300" placeholder="x (0.5)" />
                    <input v-model.number="newForm.labelY" type="number" step="0.01" min="0" max="1" class="w-full text-xs border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-rose-300" placeholder="y (0.5)" />
                  </div>
                </div>
                <div>
                  <label class="text-[10px] text-slate-400 mb-1 block">Arrow tip (x, y fractions 0-1)</label>
                  <div class="flex gap-1">
                    <input v-model.number="newForm.tipX" type="number" step="0.01" min="0" max="1" class="w-full text-xs border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-rose-300" placeholder="x (0.5)" />
                    <input v-model.number="newForm.tipY" type="number" step="0.01" min="0" max="1" class="w-full text-xs border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-rose-300" placeholder="y (0.5)" />
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 justify-end">
                <button @click="showAddForm = false" class="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                <button @click="handleAdd" class="px-4 py-1.5 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors" :disabled="saving">
                  {{ saving ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { PenLine, Settings, X, Pencil, Trash2, Check, Plus } from 'lucide-vue-next'
import rough from 'roughjs'
import { useAnnotations } from '@/composables/useAnnotations'
import { useUserStore } from '@/stores/userStore'

const {
  isVisible, dbAnnotations, isAdmin,
  toggleAnnotations, hideAnnotations,
  saveAnnotation, updateAnnotation, deleteAnnotation,
} = useAnnotations()

const route = useRoute()
const userStore = useUserStore()
const svgRef = ref(null)
const groupRef = ref(null)

// Admin state
const canEdit = computed(() => isAdmin(userStore.currentUser?.name))
const editorOpen = ref(false)
const editingId = ref(null)
const showAddForm = ref(false)
const saving = ref(false)

const editForm = reactive({ ann_id: '', label: '', color: '' })
const newForm = reactive({ ann_id: '', label: '', color: '#c0392b', labelX: 0.1, labelY: 0.5, tipX: 0.4, tipY: 0.35 })

function openEditor() { editorOpen.value = true }
function closeEditor() { editorOpen.value = false; editingId.value = null; showAddForm.value = false }

const routeAnnotations = computed(() => dbAnnotations.value[route.name] ?? [])

function startEdit(ann) {
  editingId.value = ann.dbId
  editForm.ann_id = ann.id
  editForm.label = ann.label
  editForm.color = ann.color
}

async function handleSaveEdit(ann) {
  saving.value = true
  try {
    await updateAnnotation(ann.dbId, {
      label: editForm.label,
      color: editForm.color,
      user_name: userStore.currentUser.name,
    })
    editingId.value = null
  } catch (err) {
    alert('Failed to save: ' + err.message)
  } finally {
    saving.value = false
  }
}

async function handleDelete(ann) {
  if (!confirm(`Delete annotation "${ann.id}"?`)) return
  saving.value = true
  try {
    await deleteAnnotation(ann.dbId, userStore.currentUser.name)
  } catch (err) {
    alert('Failed to delete: ' + err.message)
  } finally {
    saving.value = false
  }
}

function buildArrowPath(labelX, labelY, tipX, tipY) {
  const midX = (labelX + tipX) / 2
  const midY = (labelY + tipY) / 2
  return [
    [labelX, labelY],
    [labelX, midY],
    [midX, tipY],
    [tipX, tipY],
  ]
}

async function handleAdd() {
  if (!newForm.ann_id || !newForm.label) {
    alert('ID and label text are required')
    return
  }
  saving.value = true
  try {
    const arrowPath = buildArrowPath(newForm.labelX, newForm.labelY, newForm.tipX, newForm.tipY)
    await saveAnnotation({
      route: route.name,
      ann_id: newForm.ann_id,
      arrow_path: arrowPath,
      label: newForm.label,
      label_anchor: { x: newForm.labelX, y: newForm.labelY + 0.01 },
      color: newForm.color || '#c0392b',
      user_name: userStore.currentUser.name,
    })
    // Reset form
    Object.assign(newForm, { ann_id: '', label: '', color: '#c0392b', labelX: 0.1, labelY: 0.5, tipX: 0.4, tipY: 0.35 })
    showAddForm.value = false
  } catch (err) {
    alert('Failed to add: ' + err.message)
  } finally {
    saving.value = false
  }
}

const showHintButton = computed(() =>
  !['login', 'auth-success', 'profile'].includes(route.name)
)

// Viewport dimensions (SVG size)
const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)

// Current scroll position — updated via passive scroll listener
let currentScrollY = window.scrollY

function updateSize() {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
  if (isVisible.value) drawAnnotations()
}

function updateScroll() {
  currentScrollY = window.scrollY
  if (groupRef.value) {
    groupRef.value.setAttribute('transform', `translate(0, ${-currentScrollY})`)
  }
}

onMounted(() => {
  window.addEventListener('resize', updateSize)
  window.addEventListener('scroll', updateScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
  window.removeEventListener('scroll', updateScroll)
})

// ─── Drawing ─────────────────────────────────────────────────────────────────

function drawAnnotations() {
  const group = groupRef.value
  if (!group) return

  while (group.firstChild) group.removeChild(group.firstChild)

  const currentAnnotations = dbAnnotations.value[route.name] ?? []
  const W = vw.value
  const DH = document.documentElement.scrollHeight

  if (!currentAnnotations.length) {
    drawCenteredText(group, 'No annotations for this page yet.', W / 2, currentScrollY + vh.value / 2)
    group.setAttribute('transform', `translate(0, ${-currentScrollY})`)
    return
  }

  const rc = rough.svg(svgRef.value)

  currentAnnotations.forEach((ann) => {
    const opts = {
      stroke: ann.color,
      strokeWidth: 2.2,
      roughness: 1.8,
      bowing: 1.5,
    }

    const [[x1p, y1p], [cx1p, cy1p], [cx2p, cy2p], [x2p, y2p]] = ann.arrowPath
    const x1 = x1p * W,  y1 = y1p * DH
    const cx1 = cx1p * W, cy1 = cy1p * DH
    const cx2 = cx2p * W, cy2 = cy2p * DH
    const x2 = x2p * W,  y2 = y2p * DH

    const pathStr = `M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`
    group.appendChild(rc.path(pathStr, opts))

    drawArrowhead(group, rc, x2, y2, cx2, cy2, opts)
    drawLabel(group, rc, ann.label, ann.labelAnchor, W, DH, ann.color)
  })

  group.setAttribute('transform', `translate(0, ${-currentScrollY})`)
}

function drawArrowhead(group, rc, x2, y2, cx2, cy2, opts) {
  const dx = x2 - cx2
  const dy = y2 - cy2
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len, uy = dy / len
  const px = -uy, py = ux
  const headLen = 16
  const spread = 6

  group.appendChild(rc.line(
    x2, y2,
    x2 - ux * headLen + px * spread,
    y2 - uy * headLen + py * spread,
    { ...opts, roughness: 1.2 }
  ))
  group.appendChild(rc.line(
    x2, y2,
    x2 - ux * headLen - px * spread,
    y2 - uy * headLen - py * spread,
    { ...opts, roughness: 1.2 }
  ))
}

function drawLabel(group, rc, labelText, anchor, W, DH, color) {
  const lines = labelText.split('\n')
  const fontSize = 15
  const lineHeight = 22
  const padX = 12
  const padY = 10
  const boxW = 230
  const boxH = lines.length * lineHeight + padY * 2

  const bx = Math.min(anchor.x * W, W - boxW - 8)
  const by = anchor.y * DH

  group.appendChild(rc.rectangle(bx, by, boxW, boxH, {
    stroke: color,
    strokeWidth: 1.8,
    roughness: 2.0,
    bowing: 0.5,
    fill: 'rgba(255,255,255,0.88)',
    fillStyle: 'solid',
  }))

  const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  textEl.setAttribute('x', bx + padX)
  textEl.setAttribute('y', by + padY + fontSize)
  textEl.setAttribute('font-family', "'Caveat', cursive")
  textEl.setAttribute('font-size', fontSize)
  textEl.setAttribute('font-style', 'italic')
  textEl.setAttribute('font-weight', '600')
  textEl.setAttribute('fill', color)

  lines.forEach((line, i) => {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    tspan.setAttribute('x', bx + padX)
    tspan.setAttribute('dy', i === 0 ? 0 : lineHeight)
    tspan.textContent = line
    textEl.appendChild(tspan)
  })

  group.appendChild(textEl)
}

function drawCenteredText(group, text, cx, cy) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  el.setAttribute('x', cx)
  el.setAttribute('y', cy)
  el.setAttribute('text-anchor', 'middle')
  el.setAttribute('font-family', "'Caveat', cursive")
  el.setAttribute('font-size', '22')
  el.setAttribute('font-style', 'italic')
  el.setAttribute('fill', '#c0392b')
  el.setAttribute('opacity', '0.7')
  el.textContent = text
  group.appendChild(el)
}

// ─── Reactivity ──────────────────────────────────────────────────────────────

watch(
  [isVisible, () => route.name, vw, vh, dbAnnotations],
  ([visible]) => {
    if (visible) {
      nextTick(() => document.fonts.ready.then(() => drawAnnotations()))
    }
  }
)
</script>

<style>
.annotation-fade-enter-active {
  animation: annotFadeIn 0.25s ease-out;
}
.annotation-fade-leave-active {
  animation: annotFadeIn 0.15s ease-in reverse;
}
@keyframes annotFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>
