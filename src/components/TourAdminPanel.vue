<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[10001] flex items-center justify-center"
      style="background: rgba(0,0,0,0.5);"
      @click.self="$emit('close')"
    >
      <div class="bg-[#1e1e2e] border border-white/10 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p class="text-white font-semibold text-sm">Manage Tour Hints</p>
            <p class="text-white/40 text-xs mt-0.5 capitalize">{{ routeName }}</p>
          </div>
          <button
            @click="$emit('close')"
            class="text-white/40 hover:text-white transition-colors text-xl leading-none"
          >✕</button>
        </div>

        <!-- Steps list -->
        <div class="overflow-y-auto flex-1 p-4 space-y-4">
          <div
            v-for="(step, i) in editableSteps"
            :key="step.annId"
            class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2"
          >
            <div class="flex items-center gap-2">
              <span class="text-white/30 text-xs font-mono">{{ i + 1 }}</span>
              <p class="text-white/80 text-sm font-semibold">{{ step.title }}</p>
              <span
                v-if="savedIds.has(step.annId)"
                class="ml-auto text-green-400 text-xs"
              >Saved ✓</span>
            </div>
            <textarea
              v-model="step.label"
              rows="3"
              class="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white/70 text-xs resize-none focus:outline-none focus:border-white/30 placeholder-white/20"
              placeholder="Description shown in the tour popover…"
            />
            <button
              @click="save(step)"
              :disabled="saving === step.annId"
              class="text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors disabled:opacity-40"
            >
              {{ saving === step.annId ? 'Saving…' : 'Save' }}
            </button>
          </div>

          <p v-if="!editableSteps.length" class="text-white/30 text-sm text-center py-6">
            No tour steps defined for this route.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAnnotations } from '@/composables/useAnnotations'
import { TOUR_STEPS_MAP } from '@/data/tourStepsMap'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  routeName: { type: String, required: true },
})
defineEmits(['close'])

const { dbAnnotations, updateAnnotation } = useAnnotations()
const userStore = useUserStore()

const editableSteps = ref([])
const saving = ref(null)
const savedIds = ref(new Set())

function buildEditableSteps() {
  const stepDefs = TOUR_STEPS_MAP[props.routeName] ?? []
  const routeAnnotations = dbAnnotations.value[props.routeName] ?? []
  const labelMap = Object.fromEntries(routeAnnotations.map((a) => [a.id, { label: a.label, dbId: a.dbId }]))
  editableSteps.value = stepDefs.map((def) => ({
    annId: def.annId,
    title: def.title,
    label: labelMap[def.annId]?.label ?? '',
    dbId: labelMap[def.annId]?.dbId ?? null,
  }))
}

watch(() => [props.routeName, dbAnnotations.value], buildEditableSteps, { immediate: true, deep: true })

async function save(step) {
  if (!step.dbId) return
  saving.value = step.annId
  try {
    await updateAnnotation(step.dbId, {
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
</script>
