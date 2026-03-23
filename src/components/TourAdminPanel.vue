<template>
  <Teleport to="body">

    <!-- ── PICKER OVERLAY (shown while picking an element) ─────────────── -->
    <template v-if="isPicking">
      <!-- Full-screen capture layer -->
      <div
        ref="overlayEl"
        class="fixed inset-0 z-[10002] cursor-crosshair"
        @mousemove="onPickerMove"
        @click.capture.prevent.stop="onPickerClick"
      />

      <!-- Hover highlight box (pointer-events-none so it doesn't interfere) -->
      <div
        v-if="hoverRect"
        class="pointer-events-none fixed z-[10003] border-2 border-teal-400 rounded"
        style="transition: top 60ms, left 60ms, width 60ms, height 60ms; box-shadow: 0 0 0 2000px rgba(0,0,0,0.25);"
        :style="hoverHighlightStyle"
      />

      <!-- Picker instruction bar -->
      <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[10004] bg-[#1e1e2e] border border-teal-500/40 rounded-full px-5 py-2.5 flex items-center gap-3 text-xs text-white/80 shadow-2xl select-none">
        <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0"></span>
        <span>Hover to highlight · <strong class="text-white">Click</strong> to select element</span>
        <button
          @click.stop="cancelPicker"
          class="ml-2 text-white/40 hover:text-white transition-colors"
        >✕ Cancel (Esc)</button>
      </div>

      <!-- Element info chip (shows near cursor) -->
      <div
        v-if="hoverRect && hoveredTag"
        class="pointer-events-none fixed z-[10004] bg-teal-900/90 text-teal-200 text-xs font-mono px-2 py-1 rounded"
        :style="{ top: (hoverRect.bottom + 6) + 'px', left: hoverRect.left + 'px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }"
      >{{ hoveredTag }}</div>
    </template>

    <!-- ── MAIN PANEL (hidden while picking) ───────────────────────────── -->
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

          <!-- Selector banner: info (teal) or warning (amber) -->
          <div
            v-if="selectorWarning"
            :class="selectorWarning.startsWith('info:')
              ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'"
            class="border rounded-lg px-3 py-2 text-xs flex items-start gap-2"
          >
            <span class="shrink-0 mt-0.5">{{ selectorWarning.startsWith('info:') ? 'ℹ' : '⚠' }}</span>
            <span>{{ selectorWarning.replace(/^(info|warn):/, '') }}</span>
            <button @click="selectorWarning = ''" class="ml-auto shrink-0 opacity-50 hover:opacity-100">✕</button>
          </div>

          <p v-if="orderSaved" class="text-green-400 text-xs text-center">Order saved ✓</p>

          <!-- Existing steps -->
          <div
            v-for="(step, i) in editableSteps"
            :key="step.dbId ?? step.annId"
            class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2"
          >
            <!-- Row: index + order buttons + saved badge -->
            <div class="flex items-center gap-2">
              <span class="text-white/30 text-xs font-mono w-4 shrink-0">{{ i + 1 }}</span>
              <div class="flex gap-1">
                <button
                  @click="moveUp(i)"
                  :disabled="i === 0 || savingOrder"
                  class="text-white/30 hover:text-white/70 disabled:opacity-20 text-xs px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors leading-none"
                  title="Move up"
                >▲</button>
                <button
                  @click="moveDown(i)"
                  :disabled="i === editableSteps.length - 1 || savingOrder"
                  class="text-white/30 hover:text-white/70 disabled:opacity-20 text-xs px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors leading-none"
                  title="Move down"
                >▼</button>
              </div>
              <span v-if="savingOrder" class="ml-auto text-white/30 text-xs">Saving order…</span>
              <span v-else-if="savedIds.has(step.annId)" class="ml-auto text-green-400 text-xs">Saved ✓</span>
            </div>

            <!-- Title -->
            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-16 shrink-0">Title</label>
              <input v-model="step.title" type="text" class="input-dark flex-1 rounded-md px-3 py-1.5 text-xs" placeholder="Step title…" />
            </div>

            <!-- Element selector -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-2">
                <label class="text-white/40 text-xs w-16 shrink-0">Element</label>
                <!-- Dropdown of known elements for this route -->
                <select
                  v-model="step.selectorChoice"
                  @change="onSelectorChoiceChange(step)"
                  class="select-dark flex-1 text-xs rounded-md px-2 py-1.5 border border-white/10 min-w-0"
                >
                  <option value="__custom__">Custom / Pick from page…</option>
                  <option v-for="opt in knownSelectorsFor(selectedRoute)" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                <!-- Pick button -->
                <button
                  @click="startPicker(step)"
                  class="shrink-0 text-xs px-2.5 py-1.5 rounded-md bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 hover:text-teal-200 transition-colors border border-teal-500/20"
                  title="Click an element on the page to select it"
                >Pick</button>
              </div>
              <!-- Custom text input (shown when custom/pick mode) -->
              <div v-if="step.selectorChoice === '__custom__'" class="flex items-center gap-2">
                <span class="w-16 shrink-0"></span>
                <input
                  v-model="step.selector"
                  type="text"
                  class="input-dark flex-1 font-mono rounded-md px-3 py-1.5 text-xs"
                  placeholder="#element-id or .class-name"
                />
              </div>
            </div>

            <!-- Side -->
            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-16 shrink-0">Side</label>
              <select v-model="step.side" class="select-dark text-xs rounded-md px-3 py-1.5 border border-white/10">
                <option value="bottom">bottom</option>
                <option value="top">top</option>
                <option value="left">left</option>
                <option value="right">right</option>
              </select>
            </div>

            <!-- Label -->
            <textarea
              v-model="step.label"
              rows="3"
              class="input-dark w-full rounded-md px-3 py-2 text-xs resize-none"
              placeholder="Description shown in the tour popover…"
            />

            <div class="flex items-center justify-between">
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
          <div v-if="showAddForm" class="bg-white/5 border border-indigo-500/30 rounded-lg p-4 space-y-2">
            <p class="text-indigo-300 text-xs font-semibold mb-3">New Step</p>

            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-16 shrink-0">Title</label>
              <input v-model="newStep.title" type="text" class="input-dark flex-1 rounded-md px-3 py-1.5 text-xs" placeholder="Step title…" />
            </div>

            <!-- Element selector for new step -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-2">
                <label class="text-white/40 text-xs w-16 shrink-0">Element</label>
                <select
                  v-model="newStep.selectorChoice"
                  @change="onNewSelectorChoiceChange"
                  class="select-dark flex-1 text-xs rounded-md px-2 py-1.5 border border-white/10 min-w-0"
                >
                  <option value="__custom__">Custom / Pick from page…</option>
                  <option v-for="opt in knownSelectorsFor(selectedRoute)" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                <button
                  @click="startPicker('new')"
                  class="shrink-0 text-xs px-2.5 py-1.5 rounded-md bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 hover:text-teal-200 transition-colors border border-teal-500/20"
                  title="Click an element on the page to select it"
                >Pick</button>
              </div>
              <div v-if="newStep.selectorChoice === '__custom__'" class="flex items-center gap-2">
                <span class="w-16 shrink-0"></span>
                <input
                  v-model="newStep.selector"
                  type="text"
                  class="input-dark flex-1 font-mono rounded-md px-3 py-1.5 text-xs"
                  placeholder="#element-id or .class-name"
                />
              </div>
            </div>

            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-16 shrink-0">Side</label>
              <select v-model="newStep.side" class="select-dark text-xs rounded-md px-3 py-1.5 border border-white/10">
                <option value="bottom">bottom</option>
                <option value="top">top</option>
                <option value="left">left</option>
                <option value="right">right</option>
              </select>
            </div>

            <textarea
              v-model="newStep.label"
              rows="3"
              class="input-dark w-full rounded-md px-3 py-2 text-xs resize-none"
              placeholder="Description shown in the tour popover…"
            />

            <div class="flex items-center justify-between pt-1">
              <button @click="showAddForm = false" class="text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">Cancel</button>
              <button @click="create" :disabled="creating" class="text-xs px-3 py-1.5 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-colors disabled:opacity-40">
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
import { ref, watch, computed } from 'vue'
import { useAnnotations } from '@/composables/useAnnotations'
import { useUserStore } from '@/stores/userStore'
import { TOUR_STEPS_MAP } from '@/data/tourStepsMap'

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
const selectorWarning = ref('')

const newStep = ref({ title: '', selector: '', selectorChoice: '__custom__', side: 'bottom', label: '' })

// ── Picker state ────────────────────────────────────────────────────────────
const isPicking = ref(false)
const pickingFor = ref(null)   // step object or 'new'
const overlayEl = ref(null)
const hoveredEl = ref(null)
const hoverRect = ref(null)

const hoveredTag = computed(() => {
  const el = hoveredEl.value
  if (!el) return ''
  const tag = el.tagName.toLowerCase()
  const id = el.id ? `#${el.id}` : ''
  const cls = [...el.classList].filter(c => c.length < 20 && !c.includes(':') && !c.includes('['))
    .slice(0, 2).map(c => `.${c}`).join('')
  return `${tag}${id}${cls}`
})

const hoverHighlightStyle = computed(() => {
  if (!hoverRect.value) return {}
  const r = hoverRect.value
  return {
    top: `${r.top}px`,
    left: `${r.left}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
  }
})

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

  const { selector, snappedTo, unstable } = generateSelector(el)

  if (pickingFor.value === 'new') {
    newStep.value.selector = selector
    newStep.value.selectorChoice = resolveChoice(selector, selectedRoute.value)
    // Auto-fill title from element text if blank
    if (!newStep.value.title) {
      const text = el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 40) || ''
      if (text) newStep.value.title = text
    }
  } else {
    pickingFor.value.selector = selector
    pickingFor.value.selectorChoice = resolveChoice(selector, selectedRoute.value)
  }

  if (snappedTo) {
    selectorWarning.value = `info:Snapped to the nearest labelled parent (#${snappedTo}). To highlight a more specific element, add an id directly to it and pick again.`
  } else if (unstable) {
    selectorWarning.value = `warn:No id found anywhere in this element's tree. The selector "${selector}" may break if the page structure changes.`
  } else {
    selectorWarning.value = ''
  }

  isPicking.value = false
  pickingFor.value = null
}

function startPicker(target) {
  selectorWarning.value = ''
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

// Escape key listener active only while picking
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

// ── Selector generation ──────────────────────────────────────────────────────
// Returns { selector, snappedTo } where snappedTo is the id we snapped up to (or null).
function generateSelector(el) {
  // Own id — ideal, no snapping needed
  if (el.id) return { selector: `#${el.id}`, snappedTo: null }

  // Walk up to find the nearest ancestor with an id and use that
  let current = el.parentElement
  while (current && current !== document.body) {
    if (current.id) return { selector: `#${current.id}`, snappedTo: current.id }
    current = current.parentElement
  }

  // No id anywhere — last resort: use tag + classes of the element itself
  const stableClasses = [...el.classList]
    .filter(c => !c.includes(':') && !c.includes('[') && !c.includes('/') && c.length < 30)
    .slice(0, 2)
  const selector = stableClasses.length
    ? el.tagName.toLowerCase() + '.' + stableClasses.join('.')
    : el.tagName.toLowerCase()
  return { selector, snappedTo: null, unstable: true }
}

// ── Selector dropdown helpers ────────────────────────────────────────────────
function knownSelectorsFor(route) {
  return (TOUR_STEPS_MAP[route] ?? []).map((def) => ({
    value: def.selector,
    label: `${def.title}  (${def.selector})`,
  }))
}

function resolveChoice(selector, route) {
  const known = knownSelectorsFor(route).map((o) => o.value)
  return known.includes(selector) ? selector : '__custom__'
}

// ── Editable steps ───────────────────────────────────────────────────────────
function buildEditableSteps() {
  const routeAnnotations = dbAnnotations.value[selectedRoute.value] ?? []
  editableSteps.value = routeAnnotations.map((a) => {
    const sel = a.selector ?? ''
    return {
      annId: a.id,
      dbId: a.dbId,
      title: a.title ?? '',
      selector: sel,
      selectorChoice: resolveChoice(sel, selectedRoute.value),
      side: a.side ?? 'bottom',
      label: a.label ?? '',
    }
  })
}

watch(() => [selectedRoute.value, dbAnnotations.value], buildEditableSteps, { immediate: true, deep: true })

function onSelectorChoiceChange(step) {
  if (step.selectorChoice !== '__custom__') step.selector = step.selectorChoice
}
function onNewSelectorChoiceChange() {
  if (newStep.value.selectorChoice !== '__custom__') newStep.value.selector = newStep.value.selectorChoice
}

function openAddForm() {
  newStep.value = { title: '', selector: '', selectorChoice: '__custom__', side: 'bottom', label: '' }
  showAddForm.value = true
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// ── Sort order ───────────────────────────────────────────────────────────────
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

// ── CRUD ─────────────────────────────────────────────────────────────────────
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
.select-dark:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.35);
}
.select-dark option {
  background-color: #1e1e2e;
  color: rgba(255, 255, 255, 0.85);
}

.input-dark {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.75);
}
.input-dark:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}
.input-dark::placeholder {
  color: rgba(255, 255, 255, 0.2);
}
</style>
