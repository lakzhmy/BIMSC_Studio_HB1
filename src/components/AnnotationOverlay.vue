<template>
  <!-- Hint button: hidden on login/auth/profile pages -->
  <div v-if="showHintButton" class="fixed bottom-4 right-4 z-[9998] flex items-center gap-2">
    <!-- Admin: Manage Annotations button (black) -->
    <button
      v-if="canEdit"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/85 backdrop-blur-sm border border-slate-600 text-white hover:bg-black shadow-sm transition-all select-none"
      @click="enterEditorMode"
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

  <!-- Read-only hint overlay (Space / click) -->
  <Teleport to="body">
    <Transition name="annotation-fade">
      <div
        v-if="isVisible && !editorMode"
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

    <!-- ─── Editor mode overlay (admin only) ─── -->
    <Transition name="annotation-fade">
      <div
        v-if="editorMode"
        class="fixed inset-0 z-[10000] select-none"
        style="background: rgba(0, 0, 0, 0.12);"
        @mousedown="onEditorBgDown"
        @mousemove="onDrag"
        @mouseup="onDragEnd"
      >
        <!-- Top bar -->
        <div class="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-5 py-3 bg-black/70 backdrop-blur-sm">
          <div class="flex items-center gap-3">
            <span class="text-white text-sm font-semibold tracking-wide">Editing Annotations</span>
            <span class="text-white/50 text-xs">{{ route.name }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="handleAddNew"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/15 text-white hover:bg-white/25 border border-white/20 transition-colors"
            >
              <Plus :size="13" />
              Add Annotation
            </button>
            <button
              @click="leaveEditorMode"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-black hover:bg-slate-100 transition-colors"
            >
              Done
            </button>
          </div>
        </div>

        <!-- Instructions -->
        <div
          class="absolute top-14 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          style="font-family: 'Caveat', cursive; font-size: 0.95rem; font-style: italic; color: rgba(255,255,255,0.60); letter-spacing: 0.02em;"
        >
          Drag label or arrowhead · Resize from corner · Double-click to edit text · Delete or ✕ to remove
        </div>

        <!-- SVG canvas for editor mode -->
        <svg
          ref="editorSvgRef"
          class="absolute inset-0"
          :width="vw"
          :height="vh"
          :viewBox="`0 0 ${vw} ${vh}`"
          xmlns="http://www.w3.org/2000/svg"
          style="width: 100%; height: 100%;"
        >
          <g ref="editorGroupRef" />
        </svg>

        <!-- HTML overlays for interactive handles (positioned over SVG) -->
        <template v-for="ann in editorAnnotations" :key="ann.dbId">
          <!-- Label box drag handle -->
          <div
            :data-ann-id="ann.dbId"
            data-handle="label"
            class="absolute rounded-xl border-2 transition-shadow"
            :class="selectedId === ann.dbId ? 'border-white shadow-lg shadow-white/20' : 'border-transparent hover:border-white/50'"
            :style="labelBoxStyle(ann)"
            @mousedown.stop="onLabelDown($event, ann)"
            @dblclick.stop="onLabelDblClick(ann)"
            style="cursor: grab;"
          >
            <!-- Delete button -->
            <button
              class="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
              style="font-size: 10px; line-height: 1; cursor: pointer;"
              @mousedown.stop
              @click.stop="handleDeleteEditor(ann)"
              title="Delete annotation"
            >✕</button>

            <!-- Resize handle (bottom-right corner) -->
            <div
              data-handle="resize"
              class="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-sm bg-white/80 border border-white hover:bg-white transition-colors"
              style="cursor: nwse-resize;"
              @mousedown.stop="onResizeDown($event, ann)"
            />

            <!-- Edge connection dots (midpoints) -->
            <div class="absolute left-1/2 -top-1.5 w-2 h-2 rounded-full -translate-x-1/2" :class="getEdgeDotClass(ann, 'top')" />
            <div class="absolute left-1/2 -bottom-1.5 w-2 h-2 rounded-full -translate-x-1/2" :class="getEdgeDotClass(ann, 'bottom')" />
            <div class="absolute top-1/2 -left-1.5 w-2 h-2 rounded-full -translate-y-1/2" :class="getEdgeDotClass(ann, 'left')" />
            <div class="absolute top-1/2 -right-1.5 w-2 h-2 rounded-full -translate-y-1/2" :class="getEdgeDotClass(ann, 'right')" />
          </div>

          <!-- Arrowhead drag handle (circle) -->
          <div
            :data-ann-id="ann.dbId"
            data-handle="tip"
            class="absolute w-5 h-5 rounded-full border-2 transition-shadow"
            :class="selectedId === ann.dbId ? 'bg-white border-white shadow-lg shadow-white/30' : 'bg-white/60 border-white/40 hover:bg-white hover:border-white'"
            :style="tipHandleStyle(ann)"
            @mousedown.stop="onTipDown($event, ann)"
            style="cursor: grab;"
          />
        </template>

        <!-- Inline text editor -->
        <div
          v-if="textEditAnn"
          class="absolute z-20"
          :style="textEditorStyle"
          @mousedown.stop
        >
          <textarea
            ref="textEditRef"
            v-model="textEditValue"
            class="min-h-[60px] p-3 rounded-xl border-2 border-white bg-black/80 text-white text-sm outline-none resize-y"
            :style="{ width: (textEditAnn.boxWidth || 230) + 'px', fontFamily: `'Caveat', cursive`, fontSize: '15px', lineHeight: '22px' }"
            @keydown.escape="cancelTextEdit"
            @blur="commitTextEdit"
          />
          <div class="flex justify-end gap-1 mt-1">
            <button @mousedown.prevent @click="cancelTextEdit" class="px-2 py-0.5 text-xs text-white/60 hover:text-white transition-colors">Cancel</button>
            <button @mousedown.prevent @click="commitTextEdit" class="px-2 py-0.5 text-xs text-white bg-white/20 hover:bg-white/30 rounded transition-colors">Save</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { PenLine, Settings, Plus } from 'lucide-vue-next'
import rough from 'roughjs'
import { useAnnotations } from '@/composables/useAnnotations'
import { useUserStore } from '@/stores/userStore'

const {
  isVisible, dbAnnotations, isAdmin,
  toggleAnnotations, hideAnnotations,
  saveAnnotation, updateAnnotation, deleteAnnotation, loadAnnotations,
} = useAnnotations()

const route = useRoute()
const userStore = useUserStore()

// ─── Read-only SVG refs ──────────────────────────────────────────────────────
const svgRef = ref(null)
const groupRef = ref(null)

// ─── Editor mode refs ────────────────────────────────────────────────────────
const editorSvgRef = ref(null)
const editorGroupRef = ref(null)

const canEdit = computed(() => isAdmin(userStore.currentUser?.name))
const editorMode = ref(false)

// Local mutable copy of annotations for the current route during editing
const editorAnnotations = ref([])
const selectedId = ref(null)

// Drag state
const dragState = reactive({
  active: false,
  type: null,     // 'label' | 'tip' | 'resize'
  annDbId: null,
  startMouseX: 0,
  startMouseY: 0,
  startValX: 0,   // fraction
  startValY: 0,   // fraction
  startWidth: 0,
})

// Text editing state
const textEditAnn = ref(null)
const textEditValue = ref('')
const textEditRef = ref(null)

// ─── Editor mode lifecycle ───────────────────────────────────────────────────

function enterEditorMode() {
  hideAnnotations()
  // Deep-clone current route's annotations into mutable array
  const source = dbAnnotations.value[route.name] ?? []
  editorAnnotations.value = source.map((a) => ({
    ...a,
    arrowPath: a.arrowPath.map((p) => [...p]),
    labelAnchor: { ...a.labelAnchor },
    boxWidth: a.boxWidth || DEFAULT_BOX_W,
  }))
  selectedId.value = null
  textEditAnn.value = null
  editorMode.value = true
  nextTick(() => drawEditorAnnotations())
}

function leaveEditorMode() {
  editorMode.value = false
  textEditAnn.value = null
  selectedId.value = null
}

// ─── Computed label box dimensions (reused for hit area + style) ─────────────

const LABEL_FONT_SIZE = 15
const LABEL_LINE_HEIGHT = 22
const LABEL_PAD_X = 12
const LABEL_PAD_Y = 10
const DEFAULT_BOX_W = 230
const MIN_BOX_W = 120
const MAX_BOX_W = 500

function labelBoxHeight(ann) {
  const lines = ann.label.split('\n')
  return lines.length * LABEL_LINE_HEIGHT + LABEL_PAD_Y * 2
}

function labelBoxStyle(ann) {
  const W = vw.value
  const H = vh.value
  const bw = ann.boxWidth || DEFAULT_BOX_W
  const bx = Math.min(ann.labelAnchor.x * W, W - bw - 8)
  const by = ann.labelAnchor.y * H + currentScrollY
  const h = labelBoxHeight(ann)
  return {
    left: `${bx}px`,
    top: `${by}px`,
    width: `${bw}px`,
    height: `${h}px`,
  }
}

function tipHandleStyle(ann) {
  const W = vw.value
  const H = vh.value
  const tip = ann.arrowPath[3]
  const tx = tip[0] * W - 10
  const ty = tip[1] * H + currentScrollY - 10
  return { left: `${tx}px`, top: `${ty}px` }
}

const textEditorStyle = computed(() => {
  if (!textEditAnn.value) return {}
  const W = vw.value
  const H = vh.value
  const bw = textEditAnn.value.boxWidth || DEFAULT_BOX_W
  const bx = Math.min(textEditAnn.value.labelAnchor.x * W, W - bw - 8)
  const by = textEditAnn.value.labelAnchor.y * H + currentScrollY
  return { left: `${bx}px`, top: `${by}px` }
})

// ─── Edge-snap: compute which box edge the arrow connects to ─────────────────

function getBoxEdge(ann, W, H, scrollY) {
  const bw = ann.boxWidth || DEFAULT_BOX_W
  const bh = labelBoxHeight(ann)
  const bx = Math.min(ann.labelAnchor.x * W, W - bw - 8)
  const by = ann.labelAnchor.y * H + (scrollY ?? 0)

  const tip = ann.arrowPath[3]
  const tx = tip[0] * W
  const ty = tip[1] * H + (scrollY ?? 0)

  const cx = bx + bw / 2
  const cy = by + bh / 2
  const dx = tx - cx
  const dy = ty - cy

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) return { edge: 'right',  x: bx + bw, y: cy, bx, by, bw, bh }
    else        return { edge: 'left',   x: bx,      y: cy, bx, by, bw, bh }
  } else {
    if (dy > 0) return { edge: 'bottom', x: cx, y: by + bh, bx, by, bw, bh }
    else        return { edge: 'top',    x: cx, y: by,      bx, by, bw, bh }
  }
}

function getEdgeDotClass(ann, edgeName) {
  const W = vw.value
  const H = vh.value
  const info = getBoxEdge(ann, W, H, currentScrollY)
  return info.edge === edgeName ? 'bg-white' : 'bg-white/30'
}

// ─── Arrow path: compute bezier from edge midpoint to tip ────────────────────

function recalcArrowFromEdge(ann) {
  const W = vw.value
  const H = vh.value
  const info = getBoxEdge(ann, W, H, currentScrollY)
  const tip = ann.arrowPath[3]

  const tailXFrac = info.x / W
  const tailYFrac = (info.y - currentScrollY) / H

  ann.arrowPath[0] = [tailXFrac, tailYFrac]

  const tipXPx = tip[0] * W
  const tipYPx = tip[1] * H + currentScrollY

  if (info.edge === 'top' || info.edge === 'bottom') {
    const midY = (info.y + tipYPx) / 2
    ann.arrowPath[1] = [tailXFrac, (midY - currentScrollY) / H]
    ann.arrowPath[2] = [tip[0], (midY - currentScrollY) / H]
  } else {
    const midX = (info.x + tipXPx) / 2
    ann.arrowPath[1] = [midX / W, tailYFrac]
    ann.arrowPath[2] = [midX / W, tip[1]]
  }
}

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)) }

// ─── Drag handlers ───────────────────────────────────────────────────────────

function onLabelDown(e, ann) {
  if (textEditAnn.value) return
  selectedId.value = ann.dbId
  dragState.active = true
  dragState.type = 'label'
  dragState.annDbId = ann.dbId
  dragState.startMouseX = e.clientX
  dragState.startMouseY = e.clientY
  dragState.startValX = ann.labelAnchor.x
  dragState.startValY = ann.labelAnchor.y
  e.preventDefault()
}

function onTipDown(e, ann) {
  if (textEditAnn.value) return
  selectedId.value = ann.dbId
  dragState.active = true
  dragState.type = 'tip'
  dragState.annDbId = ann.dbId
  dragState.startMouseX = e.clientX
  dragState.startMouseY = e.clientY
  dragState.startValX = ann.arrowPath[3][0]
  dragState.startValY = ann.arrowPath[3][1]
  e.preventDefault()
}

function onResizeDown(e, ann) {
  if (textEditAnn.value) return
  selectedId.value = ann.dbId
  dragState.active = true
  dragState.type = 'resize'
  dragState.annDbId = ann.dbId
  dragState.startMouseX = e.clientX
  dragState.startMouseY = e.clientY
  dragState.startWidth = ann.boxWidth || DEFAULT_BOX_W
  e.preventDefault()
}

function onDrag(e) {
  if (!dragState.active) return

  const ann = editorAnnotations.value.find((a) => a.dbId === dragState.annDbId)
  if (!ann) return

  const W = vw.value
  const H = vh.value

  if (dragState.type === 'label') {
    const dx = (e.clientX - dragState.startMouseX) / W
    const dy = (e.clientY - dragState.startMouseY) / H
    ann.labelAnchor.x = clamp(dragState.startValX + dx, 0, 1)
    ann.labelAnchor.y = clamp(dragState.startValY + dy, 0, 1)
  } else if (dragState.type === 'tip') {
    const dx = (e.clientX - dragState.startMouseX) / W
    const dy = (e.clientY - dragState.startMouseY) / H
    ann.arrowPath[3][0] = clamp(dragState.startValX + dx, 0, 1)
    ann.arrowPath[3][1] = clamp(dragState.startValY + dy, 0, 1)
  } else if (dragState.type === 'resize') {
    const dxPx = e.clientX - dragState.startMouseX
    ann.boxWidth = clamp(dragState.startWidth + dxPx, MIN_BOX_W, MAX_BOX_W)
  }

  recalcArrowFromEdge(ann)
  drawEditorAnnotations()
}

function onDragEnd() {
  if (!dragState.active) return
  const ann = editorAnnotations.value.find((a) => a.dbId === dragState.annDbId)
  dragState.active = false
  if (ann) persistAnnotation(ann)
}

function onEditorBgDown(e) {
  if (!e.target.closest('[data-handle]') && !e.target.closest('button') && !e.target.closest('textarea')) {
    selectedId.value = null
  }
}

// ─── Text editing ────────────────────────────────────────────────────────────

function onLabelDblClick(ann) {
  textEditAnn.value = ann
  textEditValue.value = ann.label
  nextTick(() => textEditRef.value?.focus())
}

function cancelTextEdit() {
  textEditAnn.value = null
}

function commitTextEdit() {
  if (!textEditAnn.value) return
  const ann = textEditAnn.value
  if (textEditValue.value.trim() && textEditValue.value !== ann.label) {
    ann.label = textEditValue.value
    recalcArrowFromEdge(ann)
    drawEditorAnnotations()
    persistAnnotation(ann)
  }
  textEditAnn.value = null
}

// ─── Delete ──────────────────────────────────────────────────────────────────

async function handleDeleteEditor(ann) {
  if (!confirm(`Delete annotation "${ann.id}"?`)) return
  try {
    await deleteAnnotation(ann.dbId, userStore.currentUser.name)
    editorAnnotations.value = editorAnnotations.value.filter((a) => a.dbId !== ann.dbId)
    if (selectedId.value === ann.dbId) selectedId.value = null
    drawEditorAnnotations()
  } catch (err) {
    alert('Delete failed: ' + err.message)
  }
}

// ─── Add new ─────────────────────────────────────────────────────────────────

async function handleAddNew() {
  const H = vh.value
  const centerX = 0.5
  const centerY = 0.5
  const tipX = centerX + 0.15
  const tipY = centerY - 0.08
  const annId = `hint-${Date.now()}`

  try {
    const arrowPath = [
      [centerX, centerY],
      [centerX, (centerY + tipY) / 2],
      [(centerX + tipX) / 2, tipY],
      [tipX, tipY],
    ]
    await saveAnnotation({
      route: route.name,
      ann_id: annId,
      arrow_path: arrowPath,
      label: 'New annotation\nDouble-click to edit',
      label_anchor: { x: centerX, y: centerY + 0.01, w: DEFAULT_BOX_W },
      color: '#c0392b',
      user_name: userStore.currentUser.name,
    })
    const source = dbAnnotations.value[route.name] ?? []
    editorAnnotations.value = source.map((a) => ({
      ...a,
      arrowPath: a.arrowPath.map((p) => [...p]),
      labelAnchor: { ...a.labelAnchor },
      boxWidth: a.boxWidth || DEFAULT_BOX_W,
    }))
    drawEditorAnnotations()
  } catch (err) {
    alert('Add failed: ' + err.message)
  }
}

// ─── Persist a single annotation to DB ───────────────────────────────────────

async function persistAnnotation(ann) {
  try {
    await updateAnnotation(ann.dbId, {
      arrow_path: ann.arrowPath,
      label: ann.label,
      label_anchor: { x: ann.labelAnchor.x, y: ann.labelAnchor.y, w: ann.boxWidth || DEFAULT_BOX_W },
      color: ann.color,
      user_name: userStore.currentUser.name,
    })
  } catch (err) {
    console.error('[annotations] persist failed:', err)
  }
}

// ─── Keyboard in editor mode ────────────────────────────────────────────────

function onEditorKeydown(e) {
  if (!editorMode.value) return
  // Ignore if typing in textarea
  const tag = document.activeElement?.tagName?.toLowerCase()
  if (['input', 'textarea', 'select'].includes(tag)) return

  if (e.code === 'Escape') {
    leaveEditorMode()
  }
  if ((e.code === 'Delete' || e.code === 'Backspace') && selectedId.value) {
    const ann = editorAnnotations.value.find((a) => a.dbId === selectedId.value)
    if (ann) handleDeleteEditor(ann)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onEditorKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onEditorKeydown)
})

// ─── Shared state ────────────────────────────────────────────────────────────

const showHintButton = computed(() =>
  !['login', 'auth-success', 'profile'].includes(route.name)
)

const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)
let currentScrollY = window.scrollY

function updateSize() {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
  if (isVisible.value) drawAnnotations()
  if (editorMode.value) drawEditorAnnotations()
}

function updateScroll() {
  currentScrollY = window.scrollY
  if (groupRef.value) {
    groupRef.value.setAttribute('transform', `translate(0, ${-currentScrollY})`)
  }
  // Editor doesn't use transform — HTML overlays use top offset directly
  if (editorMode.value) drawEditorAnnotations()
}

onMounted(() => {
  window.addEventListener('resize', updateSize)
  window.addEventListener('scroll', updateScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
  window.removeEventListener('scroll', updateScroll)
})

// ─── Read-only drawing ───────────────────────────────────────────────────────

function drawAnnotations() {
  const group = groupRef.value
  if (!group) return

  while (group.firstChild) group.removeChild(group.firstChild)

  const currentAnnotations = dbAnnotations.value[route.name] ?? []
  const W = vw.value
  const H = vh.value

  if (!currentAnnotations.length) {
    drawCenteredText(group, 'No annotations for this page yet.', W / 2, currentScrollY + H / 2)
    group.setAttribute('transform', `translate(0, ${-currentScrollY})`)
    return
  }

  const rc = rough.svg(svgRef.value)

  currentAnnotations.forEach((ann) => {
    const bw = ann.boxWidth || DEFAULT_BOX_W
    const bh = labelBoxHeight(ann)
    const bx = Math.min(ann.labelAnchor.x * W, W - bw - 8)
    const by = ann.labelAnchor.y * H + currentScrollY

    const tip = ann.arrowPath[3]
    const tipPx = [tip[0] * W, tip[1] * H + currentScrollY]

    const cxBox = bx + bw / 2
    const cyBox = by + bh / 2
    const dx = tipPx[0] - cxBox
    const dy = tipPx[1] - cyBox

    let edgeX, edgeY, edgeDir
    if (Math.abs(dx) > Math.abs(dy)) {
      edgeDir = dx > 0 ? 'right' : 'left'
      edgeX = dx > 0 ? bx + bw : bx
      edgeY = cyBox
    } else {
      edgeDir = dy > 0 ? 'bottom' : 'top'
      edgeX = cxBox
      edgeY = dy > 0 ? by + bh : by
    }

    let cp1x, cp1y, cp2x, cp2y
    if (edgeDir === 'top' || edgeDir === 'bottom') {
      const midY = (edgeY + tipPx[1]) / 2
      cp1x = edgeX; cp1y = midY; cp2x = tipPx[0]; cp2y = midY
    } else {
      const midX = (edgeX + tipPx[0]) / 2
      cp1x = midX; cp1y = edgeY; cp2x = midX; cp2y = tipPx[1]
    }

    const opts = { stroke: ann.color, strokeWidth: 2.2, roughness: 1.8, bowing: 1.5 }
    const pathStr = `M ${edgeX} ${edgeY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${tipPx[0]} ${tipPx[1]}`
    group.appendChild(rc.path(pathStr, opts))
    drawArrowhead(group, rc, tipPx[0], tipPx[1], cp2x, cp2y, opts)
    drawLabel(group, rc, ann.label, bx, by, bw, bh, ann.color)
  })

  group.setAttribute('transform', `translate(0, ${-currentScrollY})`)
}

// ─── Editor drawing (SVG only — handles are HTML overlays) ───────────────────

function drawEditorAnnotations() {
  const group = editorGroupRef.value
  if (!group) return

  while (group.firstChild) group.removeChild(group.firstChild)

  const W = vw.value
  const H = vh.value

  if (!editorAnnotations.value.length) return

  const rc = rough.svg(editorSvgRef.value)

  editorAnnotations.value.forEach((ann) => {
    const info = getBoxEdge(ann, W, H, currentScrollY)
    const tip = ann.arrowPath[3]
    const tipX = tip[0] * W
    const tipY = tip[1] * H + currentScrollY

    let cp1x, cp1y, cp2x, cp2y
    if (info.edge === 'top' || info.edge === 'bottom') {
      const midY = (info.y + tipY) / 2
      cp1x = info.x; cp1y = midY; cp2x = tipX; cp2y = midY
    } else {
      const midX = (info.x + tipX) / 2
      cp1x = midX; cp1y = info.y; cp2x = midX; cp2y = tipY
    }

    const opts = { stroke: ann.color, strokeWidth: 2.2, roughness: 1.8, bowing: 1.5 }
    const pathStr = `M ${info.x} ${info.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${tipX} ${tipY}`
    group.appendChild(rc.path(pathStr, opts))
    drawArrowhead(group, rc, tipX, tipY, cp2x, cp2y, opts)

    group.appendChild(rc.rectangle(info.bx, info.by, info.bw, info.bh, {
      stroke: ann.color, strokeWidth: 1.8, roughness: 2.0, bowing: 0.5,
      fill: 'rgba(255,255,255,0.88)', fillStyle: 'solid',
    }))

    const lines = ann.label.split('\n')
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    textEl.setAttribute('x', info.bx + LABEL_PAD_X)
    textEl.setAttribute('y', info.by + LABEL_PAD_Y + LABEL_FONT_SIZE)
    textEl.setAttribute('font-family', "'Caveat', cursive")
    textEl.setAttribute('font-size', LABEL_FONT_SIZE)
    textEl.setAttribute('font-style', 'italic')
    textEl.setAttribute('font-weight', '600')
    textEl.setAttribute('fill', ann.color)

    lines.forEach((line, i) => {
      const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
      tspan.setAttribute('x', info.bx + LABEL_PAD_X)
      tspan.setAttribute('dy', i === 0 ? 0 : LABEL_LINE_HEIGHT)
      tspan.textContent = line
      textEl.appendChild(tspan)
    })
    group.appendChild(textEl)
  })
}

// ─── Shared SVG helpers ──────────────────────────────────────────────────────

function drawArrowhead(group, rc, x2, y2, cx2, cy2, opts) {
  const dx = x2 - cx2
  const dy = y2 - cy2
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len, uy = dy / len
  const px = -uy, py = ux

  group.appendChild(rc.line(x2, y2, x2 - ux * 16 + px * 6, y2 - uy * 16 + py * 6, { ...opts, roughness: 1.2 }))
  group.appendChild(rc.line(x2, y2, x2 - ux * 16 - px * 6, y2 - uy * 16 - py * 6, { ...opts, roughness: 1.2 }))
}

function drawLabel(group, rc, labelText, bx, by, bw, bh, color) {
  group.appendChild(rc.rectangle(bx, by, bw, bh, {
    stroke: color, strokeWidth: 1.8, roughness: 2.0, bowing: 0.5,
    fill: 'rgba(255,255,255,0.88)', fillStyle: 'solid',
  }))

  const lines = labelText.split('\n')
  const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  textEl.setAttribute('x', bx + LABEL_PAD_X)
  textEl.setAttribute('y', by + LABEL_PAD_Y + LABEL_FONT_SIZE)
  textEl.setAttribute('font-family', "'Caveat', cursive")
  textEl.setAttribute('font-size', LABEL_FONT_SIZE)
  textEl.setAttribute('font-style', 'italic')
  textEl.setAttribute('font-weight', '600')
  textEl.setAttribute('fill', color)

  lines.forEach((line, i) => {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    tspan.setAttribute('x', bx + LABEL_PAD_X)
    tspan.setAttribute('dy', i === 0 ? 0 : LABEL_LINE_HEIGHT)
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
    if (visible && !editorMode.value) {
      nextTick(() => document.fonts.ready.then(() => drawAnnotations()))
    }
  }
)

// Re-draw editor when editorAnnotations change (deep)
watch(editorMode, (val) => {
  if (!val) return
  nextTick(() => document.fonts.ready.then(() => drawEditorAnnotations()))
})
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
