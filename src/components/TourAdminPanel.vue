<template>
  <Teleport to="body">

    <!-- ── PICKER OVERLAY ──────────────────────────────────────────────────── -->
    <template v-if="isPicking">
      <div
        ref="overlayEl"
        class="fixed inset-0 z-[10002] cursor-crosshair"
        @mousemove="onPickerMove"
        @click.capture.prevent.stop="onPickerClick"
      />

      <!-- Highlight box -->
      <div
        v-if="hoverRect"
        class="pointer-events-none fixed z-[10003] rounded"
        style="border: 2px solid #2dd4bf; box-shadow: 0 0 0 2000px rgba(0,0,0,0.3); transition: all 80ms ease;"
        :style="{ top: hoverRect.top + 'px', left: hoverRect.left + 'px', width: hoverRect.width + 'px', height: hoverRect.height + 'px' }"
      />

      <!-- Instruction bar -->
      <div class="pointer-events-none fixed top-4 left-1/2 -translate-x-1/2 z-[10004] bg-[#1e1e2e] border border-teal-500/40 rounded-full px-5 py-2.5 flex items-center gap-3 text-xs text-white/80 shadow-2xl select-none">
        <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0"></span>
        <span>Click any element to select it &nbsp;·&nbsp; <kbd class="opacity-60">Esc</kbd> to cancel</span>
      </div>

      <!-- Cancel button (separate so it's clickable) -->
      <button
        class="fixed top-4 right-6 z-[10004] text-xs text-white/50 hover:text-white bg-[#1e1e2e] border border-white/10 rounded-full px-3 py-2 transition-colors"
        @click="cancelPicker"
      >✕ Cancel</button>
    </template>

    <!-- ── MAIN PANEL ──────────────────────────────────────────────────────── -->
    <div
      v-if="!isPicking"
      class="fixed inset-0 z-[10001] flex items-center justify-center"
      style="background: rgba(0,0,0,0.5);"
      @click.self="$emit('close')"
    >
      <div class="bg-[#1e1e2e] border border-white/10 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <p class="text-white font-semibold text-sm">Manage Tour Hints</p>
          <div class="flex items-center gap-3">
            <select v-model="selectedRoute" class="select-dark text-xs rounded-md px-2 py-1 border border-white/20">
              <option v-for="r in ALL_ROUTES" :key="r" :value="r">{{ r }}</option>
            </select>
            <button @click="$emit('close')" class="text-white/40 hover:text-white transition-colors text-xl leading-none">✕</button>
          </div>
        </div>

        <!-- Steps list -->
        <div class="overflow-y-auto flex-1 p-4 space-y-3">

          <p v-if="orderSaved" class="text-green-400 text-xs text-center">Order saved ✓</p>

          <!-- Existing steps -->
          <div
            v-for="(step, i) in editableSteps"
            :key="step.dbId ?? step.annId"
            class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
          >
            <!-- Index + order arrows + saved badge -->
            <div class="flex items-center gap-2">
              <span class="text-white/25 text-xs font-mono w-4 shrink-0">{{ i + 1 }}</span>
              <div class="flex gap-1">
                <button @click="moveUp(i)" :disabled="i === 0 || savingOrder" class="text-white/30 hover:text-white/70 disabled:opacity-20 text-xs px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors">▲</button>
                <button @click="moveDown(i)" :disabled="i === editableSteps.length - 1 || savingOrder" class="text-white/30 hover:text-white/70 disabled:opacity-20 text-xs px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors">▼</button>
              </div>
              <span v-if="savingOrder" class="ml-auto text-white/30 text-xs">Saving…</span>
              <span v-else-if="savedIds.has(step.annId)" class="ml-auto text-green-400 text-xs">Saved ✓</span>
            </div>

            <!-- Title -->
            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-20 shrink-0">Title</label>
              <input v-model="step.title" type="text" class="input-dark flex-1 rounded-md px-3 py-1.5 text-xs" placeholder="Step title…" />
            </div>

            <!-- Element picker (no selectors shown to admin) -->
            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-20 shrink-0">Element</label>
              <div
                v-if="step.selector"
                class="flex-1 flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-md px-3 py-1.5"
              >
                <span class="text-teal-400 text-xs shrink-0">✓</span>
                <span class="text-white/70 text-xs truncate">{{ step.pickedLabel || 'Element selected' }}</span>
                <button @click="startPicker(step)" class="ml-auto shrink-0 text-xs text-white/40 hover:text-white/70 transition-colors">Re-pick</button>
              </div>
              <button
                v-else
                @click="startPicker(step)"
                class="flex-1 text-xs px-3 py-1.5 rounded-md bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 border-dashed text-teal-400 hover:text-teal-300 transition-colors text-left"
              >Click to pick an element on the page →</button>
            </div>

            <!-- Popover side -->
            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-20 shrink-0">Popover side</label>
              <select v-model="step.side" class="select-dark text-xs rounded-md px-3 py-1.5 border border-white/10">
                <option value="bottom">bottom</option>
                <option value="top">top</option>
                <option value="left">left</option>
                <option value="right">right</option>
              </select>
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1">
              <label class="text-white/40 text-xs">Description</label>
              <textarea v-model="step.label" rows="3" class="input-dark w-full rounded-md px-3 py-2 text-xs resize-none" placeholder="Text shown in the tour popover…" />
            </div>

            <div class="flex items-center justify-between pt-1">
              <button @click="remove(step)" class="text-xs px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors">Delete</button>
              <button @click="save(step)" :disabled="saving === step.annId" class="text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors disabled:opacity-40">
                {{ saving === step.annId ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </div>

          <p v-if="!editableSteps.length && !showAddForm" class="text-white/30 text-sm text-center py-4">
            No hints for this route yet. Add one below.
          </p>

          <!-- Add Step form -->
          <div v-if="showAddForm" class="bg-white/5 border border-indigo-500/30 rounded-lg p-4 space-y-3">
            <p class="text-indigo-300 text-xs font-semibold">New Step</p>

            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-20 shrink-0">Title</label>
              <input v-model="newStep.title" type="text" class="input-dark flex-1 rounded-md px-3 py-1.5 text-xs" placeholder="Step title…" />
            </div>

            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-20 shrink-0">Element</label>
              <div
                v-if="newStep.selector"
                class="flex-1 flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-md px-3 py-1.5"
              >
                <span class="text-teal-400 text-xs shrink-0">✓</span>
                <span class="text-white/70 text-xs truncate">{{ newStep.pickedLabel || 'Element selected' }}</span>
                <button @click="startPicker('new')" class="ml-auto shrink-0 text-xs text-white/40 hover:text-white/70 transition-colors">Re-pick</button>
              </div>
              <button
                v-else
                @click="startPicker('new')"
                class="flex-1 text-xs px-3 py-1.5 rounded-md bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 border-dashed text-teal-400 hover:text-teal-300 transition-colors text-left"
              >Click to pick an element on the page →</button>
            </div>

            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-20 shrink-0">Popover side</label>
              <select v-model="newStep.side" class="select-dark text-xs rounded-md px-3 py-1.5 border border-white/10">
                <option value="bottom">bottom</option>
                <option value="top">top</option>
                <option value="left">left</option>
                <option value="right">right</option>
              </select>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-white/40 text-xs">Description</label>
              <textarea v-model="newStep.label" rows="3" class="input-dark w-full rounded-md px-3 py-2 text-xs resize-none" placeholder="Text shown in the tour popover…" />
            </div>

            <div class="flex items-center justify-between pt-1">
              <button @click="showAddForm = false" class="text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">Cancel</button>
              <button @click="create" :disabled="creating || !newStep.selector" class="text-xs px-3 py-1.5 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-colors disabled:opacity-40">
                {{ creating ? 'Creating…' : 'Create' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t border-white/10">
          <button
            v-if="!showAddForm"
            @click="openAddForm"
            class="text-xs px-3 py-1.5 rounded-md bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 hover:text-indigo-200 transition-colors"
          >+ Add Step</button>
        </div>
      </div>
    </div>

  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAnnotations } from '@/composables/useAnnotations'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  routeName: { type: String, required: true },
})
defineEmits(['close'])

const ALL_ROUTES = ['dashboard', 'kpi', 'kpi-map', 'timeline', 'viewer', 'stress-test', 'login', 'tower']

const { dbAnnotations, saveAnnotation, updateAnnotation, updateAnnotationSilent, deleteAnnotation, loadAnnotations } = useAnnotations()
const userStore = useUserStore()

const selectedRoute = ref(props.routeName)
const editableSteps = ref([])
const saving = ref(null)
const savedIds = ref(new Set())
const showAddForm = ref(false)
const creating = ref(false)
const savingOrder = ref(false)
const orderSaved = ref(false)

const newStep = ref({ title: '', selector: '', pickedLabel: '', side: 'bottom', label: '' })

// ── Element picker ─────────────────────────────────────────────────────────
const isPicking = ref(false)
const pickingFor = ref(null)   // step object or 'new'
const overlayEl = ref(null)
const hoveredEl = ref(null)
const hoverRect = ref(null)

function getElementAtPoint(x, y) {
  if (overlayEl.value) overlayEl.value.style.pointerEvents = 'none'
  const el = document.elementFromPoint(x, y)
  if (overlayEl.value) overlayEl.value.style.pointerEvents = 'auto'
  return el
}

function onPickerMove(e) {
  const el = getElementAtPoint(e.clientX, e.clientY)
  if (el && el !== hoveredEl.value) {
    hoveredEl.value = el
    hoverRect.value = el.getBoundingClientRect()
  }
}

function onPickerClick(e) {
  const el = getElementAtPoint(e.clientX, e.clientY)
  if (!el) return cancelPicker()

  const selector = generateSelector(el)
  const label = getPickedLabel(el)

  if (pickingFor.value === 'new') {
    newStep.value.selector = selector
    newStep.value.pickedLabel = label
    if (!newStep.value.title) newStep.value.title = label
  } else {
    pickingFor.value.selector = selector
    pickingFor.value.pickedLabel = label
  }

  isPicking.value = false
  pickingFor.value = null
}

function startPicker(target) {
  pickingFor.value = target
  hoveredEl.value = null
  hoverRect.value = null
  isPicking.value = true
}

function cancelPicker() {
  isPicking.value = false
  pickingFor.value = null
  hoveredEl.value = null
  hoverRect.value = null
}

function handlePickerKey(e) {
  if (e.key === 'Escape') cancelPicker()
}
watch(isPicking, (val) => {
  if (val) {
    document.addEventListener('keydown', handlePickerKey)
    window.addEventListener('scroll', onScroll, true)
  } else {
    document.removeEventListener('keydown', handlePickerKey)
    window.removeEventListener('scroll', onScroll, true)
  }
})
function onScroll() {
  if (hoveredEl.value) hoverRect.value = hoveredEl.value.getBoundingClientRect()
}

// Generate the most stable short selector possible — admin never sees this
function generateSelector(el) {
  // Own id is ideal
  if (el.id) return `#${el.id}`

  // Build a selector for this exact element (no parent snapping)
  const stableClasses = [...el.classList]
    .filter(c => !c.includes(':') && !c.includes('[') && !c.includes('/') && c.length < 30)
    .slice(0, 3)
  if (stableClasses.length) return el.tagName.toLowerCase() + '.' + stableClasses.join('.')

  // Use immediate parent id as context if available
  if (el.parentElement?.id) return `#${el.parentElement.id} > ${el.tagName.toLowerCase()}`

  return el.tagName.toLowerCase()
}

// Derive a human-readable name from the element — shown to admin after picking
function getPickedLabel(el) {
  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel
  if (el.id) return el.id
  const text = el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 40)
  if (text) return text
  const firstClass = [...el.classList].find(c => !c.includes(':') && !c.includes('[') && c.length < 30)
  if (firstClass) return `${el.tagName.toLowerCase()}.${firstClass}`
  return el.tagName.toLowerCase()
}

// ── Steps ──────────────────────────────────────────────────────────────────
function buildEditableSteps() {
  const routeAnnotations = dbAnnotations.value[selectedRoute.value] ?? []
  editableSteps.value = routeAnnotations.map((a) => {
    const sel = a.selector ?? ''
    let pickedLabel = sel.startsWith('#') ? sel.slice(1) : sel
    if (sel) {
      try {
        const el = document.querySelector(sel)
        if (el) pickedLabel = getPickedLabel(el)
      } catch { /* invalid selector — keep fallback */ }
    }
    return {
      annId: a.id,
      dbId: a.dbId,
      title: a.title ?? '',
      selector: sel,
      pickedLabel,
      side: a.side ?? 'bottom',
      label: a.label ?? '',
    }
  })
}

watch(() => [selectedRoute.value, dbAnnotations.value], buildEditableSteps, { immediate: true, deep: true })

function openAddForm() {
  newStep.value = { title: '', selector: '', pickedLabel: '', side: 'bottom', label: '' }
  showAddForm.value = true
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// ── Sort order ────────────────────────────────────────────────────────────
async function moveUp(i) {
  if (i === 0) return
  const arr = [...editableSteps.value];
  [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
  editableSteps.value = arr
  await persistOrder()
}
async function moveDown(i) {
  if (i === editableSteps.value.length - 1) return
  const arr = [...editableSteps.value];
  [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
  editableSteps.value = arr
  await persistOrder()
}
async function persistOrder() {
  savingOrder.value = true
  try {
    await Promise.all(
      editableSteps.value.map((step, idx) =>
        updateAnnotationSilent(step.dbId, { sort_order: idx, user_name: userStore.currentUser.name })
      )
    )
    await loadAnnotations()
    orderSaved.value = true
    setTimeout(() => { orderSaved.value = false }, 2000)
  } catch (err) {
    console.error('[TourAdminPanel] order save failed:', err)
  } finally {
    savingOrder.value = false
  }
}

// ── CRUD ──────────────────────────────────────────────────────────────────
async function save(step) {
  saving.value = step.annId
  try {
    await updateAnnotation(step.dbId, {
      title: step.title,
      selector: step.selector,
      side: step.side,
      label: step.label,
      user_name: userStore.currentUser.name,
    })
    savedIds.value = new Set([...savedIds.value, step.annId])
    setTimeout(() => {
      savedIds.value = new Set([...savedIds.value].filter((id) => id !== step.annId))
    }, 2000)
  } catch (err) {
    console.error('[TourAdminPanel] save failed:', err)
  } finally {
    saving.value = null
  }
}

async function create() {
  if (!newStep.value.title || !newStep.value.selector) return
  creating.value = true
  try {
    await saveAnnotation({
      route: selectedRoute.value,
      ann_id: slugify(newStep.value.title),
      selector: newStep.value.selector,
      title: newStep.value.title,
      side: newStep.value.side,
      label: newStep.value.label,
      arrow_path: [],
      label_anchor: {},
      user_name: userStore.currentUser.name,
    })
    showAddForm.value = false
  } catch (err) {
    console.error('[TourAdminPanel] create failed:', err)
  } finally {
    creating.value = false
  }
}

async function remove(step) {
  if (!confirm(`Delete hint "${step.title}"? This cannot be undone.`)) return
  try {
    await deleteAnnotation(step.dbId, userStore.currentUser.name)
  } catch (err) {
    console.error('[TourAdminPanel] delete failed:', err)
  }
}
</script>

<style scoped>
.select-dark {
  background-color: #2a2a3e;
  color: rgba(255, 255, 255, 0.8);
}
.select-dark:focus { outline: none; border-color: rgba(255,255,255,0.35); }
.select-dark option { background-color: #1e1e2e; color: rgba(255,255,255,0.85); }

.input-dark {
  background-color: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.75);
}
.input-dark:focus { outline: none; border-color: rgba(255,255,255,0.3); }
.input-dark::placeholder { color: rgba(255,255,255,0.2); }
</style>
