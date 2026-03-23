<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[10001] flex items-center justify-center"
      style="background: rgba(0,0,0,0.5);"
      @click.self="$emit('close')"
    >
      <div class="bg-[#1e1e2e] border border-white/10 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <p class="text-white font-semibold text-sm">Manage Tour Hints</p>
          <div class="flex items-center gap-3">
            <!-- Route selector -->
            <select
              v-model="selectedRoute"
              class="bg-white/10 border border-white/20 rounded-md px-2 py-1 text-white/80 text-xs focus:outline-none focus:border-white/40"
            >
              <option v-for="r in ALL_ROUTES" :key="r" :value="r">{{ r }}</option>
            </select>
            <button
              @click="$emit('close')"
              class="text-white/40 hover:text-white transition-colors text-xl leading-none"
            >✕</button>
          </div>
        </div>

        <!-- Steps list -->
        <div class="overflow-y-auto flex-1 p-4 space-y-4">

          <!-- Existing steps -->
          <div
            v-for="(step, i) in editableSteps"
            :key="step.dbId ?? step.annId"
            class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2"
          >
            <div class="flex items-center gap-2">
              <span class="text-white/30 text-xs font-mono">{{ i + 1 }}</span>
              <span
                v-if="savedIds.has(step.annId)"
                class="ml-auto text-green-400 text-xs"
              >Saved ✓</span>
            </div>

            <!-- Title -->
            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-16 shrink-0">Title</label>
              <input
                v-model="step.title"
                type="text"
                class="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-white/80 text-xs focus:outline-none focus:border-white/30"
                placeholder="Step title…"
              />
            </div>

            <!-- Selector -->
            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-16 shrink-0">Selector</label>
              <input
                v-model="step.selector"
                type="text"
                class="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-white/70 text-xs font-mono focus:outline-none focus:border-white/30"
                placeholder="#tour-element-id"
              />
            </div>

            <!-- Side -->
            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-16 shrink-0">Side</label>
              <select
                v-model="step.side"
                class="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-white/70 text-xs focus:outline-none focus:border-white/30"
              >
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
              class="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white/70 text-xs resize-none focus:outline-none focus:border-white/30 placeholder-white/20"
              placeholder="Description shown in the tour popover…"
            />

            <div class="flex items-center justify-between">
              <button
                @click="remove(step)"
                class="text-xs px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
              >
                Delete
              </button>
              <button
                @click="save(step)"
                :disabled="saving === step.annId"
                class="text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors disabled:opacity-40"
              >
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
              <input
                v-model="newStep.title"
                type="text"
                class="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-white/80 text-xs focus:outline-none focus:border-white/30"
                placeholder="Step title…"
              />
            </div>

            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-16 shrink-0">Selector</label>
              <input
                v-model="newStep.selector"
                type="text"
                class="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-white/70 text-xs font-mono focus:outline-none focus:border-white/30"
                placeholder="#tour-element-id"
              />
            </div>

            <div class="flex items-center gap-2">
              <label class="text-white/40 text-xs w-16 shrink-0">Side</label>
              <select
                v-model="newStep.side"
                class="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-white/70 text-xs focus:outline-none focus:border-white/30"
              >
                <option value="bottom">bottom</option>
                <option value="top">top</option>
                <option value="left">left</option>
                <option value="right">right</option>
              </select>
            </div>

            <textarea
              v-model="newStep.label"
              rows="3"
              class="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white/70 text-xs resize-none focus:outline-none focus:border-white/30 placeholder-white/20"
              placeholder="Description shown in the tour popover…"
            />

            <div class="flex items-center justify-between pt-1">
              <button
                @click="showAddForm = false"
                class="text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="create"
                :disabled="creating"
                class="text-xs px-3 py-1.5 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-colors disabled:opacity-40"
              >
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
          >
            + Add Step
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useAnnotations } from '@/composables/useAnnotations'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  routeName: { type: String, required: true },
})
defineEmits(['close'])

const ALL_ROUTES = ['dashboard', 'kpi', 'kpi-map', 'timeline', 'viewer', 'stress-test', 'login', 'tower']

const { dbAnnotations, saveAnnotation, updateAnnotation, deleteAnnotation } = useAnnotations()
const userStore = useUserStore()

const selectedRoute = ref(props.routeName)
const editableSteps = ref([])
const saving = ref(null)
const savedIds = ref(new Set())
const showAddForm = ref(false)
const creating = ref(false)

const newStep = ref({ title: '', selector: '', side: 'bottom', label: '' })

function buildEditableSteps() {
  const routeAnnotations = dbAnnotations.value[selectedRoute.value] ?? []
  editableSteps.value = routeAnnotations.map((a) => ({
    annId: a.id,
    dbId: a.dbId,
    title: a.title ?? '',
    selector: a.selector ?? '',
    side: a.side ?? 'bottom',
    label: a.label ?? '',
  }))
}

watch(() => [selectedRoute.value, dbAnnotations.value], buildEditableSteps, { immediate: true, deep: true })

function openAddForm() {
  newStep.value = { title: '', selector: '', side: 'bottom', label: '' }
  showAddForm.value = true
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

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
