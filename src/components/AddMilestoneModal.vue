<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" @click.self="close">
    <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900">Add Milestone</h2>
        <button @click="close" class="text-slate-400 hover:text-slate-600 transition-colors">
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <form @submit.prevent="handleSubmit" class="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
        <!-- Week & Team row -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Week</label>
            <select
              v-model.number="form.week"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            >
              <option :value="0" disabled>Select week</option>
              <option v-for="w in weeks" :key="w.week" :value="w.week">
                Week {{ w.week }}: {{ w.title }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Team</label>
            <select
              v-model="form.team"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            >
              <option value="" disabled>Select team</option>
              <option value="structure">🟢 Structure</option>
              <option value="program">🔵 Program</option>
              <option value="data">🔴 Data</option>
            </select>
          </div>
        </div>

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Milestone Title</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="e.g., Foundation Load Analysis Complete"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            required
          />
        </div>

        <!-- Summary Bullets -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Summary Points</label>
          <div class="space-y-2">
            <div
              v-for="(bullet, idx) in form.summary"
              :key="idx"
              class="flex items-center gap-2"
            >
              <span class="text-slate-400 text-xs mt-0.5">•</span>
              <input
                v-model="form.summary[idx]"
                type="text"
                :placeholder="`Point ${idx + 1}`"
                class="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <button
                v-if="form.summary.length > 1"
                type="button"
                @click="removeBullet(idx)"
                class="text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <button
            v-if="form.summary.length < 6"
            type="button"
            @click="addBullet"
            class="mt-2 text-xs text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add point
          </button>
        </div>

        <!-- Connection Levels -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Connections to Other Teams</label>
          <p class="text-xs text-slate-500 mb-3">How much does this milestone depend on or affect other teams?</p>
          <div class="space-y-3">
            <div v-for="t in otherTeams" :key="t.id" class="flex items-center gap-3">
              <span :class="connectionLabelClass(t.id)" class="text-xs font-semibold w-20">{{ t.label }}</span>
              <input
                v-model.number="form.connections[t.id]"
                type="range"
                min="0"
                max="3"
                step="1"
                class="flex-1 accent-slate-500"
              />
              <span class="text-xs text-slate-500 w-16 text-right">{{ connectionLabel(form.connections[t.id]) }}</span>
            </div>
          </div>
        </div>
      </form>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
        <button
          type="button"
          @click="close"
          class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="!isValid || saving"
          class="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg v-if="saving" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          {{ saving ? 'Saving...' : 'Add Milestone' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  weeks: { type: Array, required: true },
})

const emit = defineEmits(['close', 'save'])

const defaultForm = () => ({
  week: 0,
  team: '',
  title: '',
  summary: [''],
  connections: { structure: 0, program: 0, data: 0 },
})

const form = reactive(defaultForm())
const saving = reactive({ value: false })

const otherTeams = computed(() => {
  const all = [
    { id: 'structure', label: 'Structure' },
    { id: 'program', label: 'Program' },
    { id: 'data', label: 'Data' },
  ]
  return all.filter((t) => t.id !== form.team)
})

const isValid = computed(() => {
  return form.week > 0 && form.team && form.title.trim().length > 0
})

function addBullet() {
  if (form.summary.length < 6) {
    form.summary.push('')
  }
}

function removeBullet(idx) {
  form.summary.splice(idx, 1)
}

function connectionLabel(value) {
  return ['None', 'Low', 'Medium', 'High'][value] || 'None'
}

function connectionLabelClass(team) {
  const map = {
    structure: 'text-green-700',
    program: 'text-blue-700',
    data: 'text-red-700',
  }
  return map[team] || 'text-slate-700'
}

function resetForm() {
  Object.assign(form, defaultForm())
}

function close() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  if (!isValid.value) return
  saving.value = true

  const cleanSummary = form.summary.map((s) => s.trim()).filter(Boolean)

  emit('save', {
    week: form.week,
    team: form.team,
    title: form.title.trim(),
    summary: cleanSummary.length > 0 ? cleanSummary : [`Define scope for ${form.title.trim().toLowerCase()}.`],
    connections: { ...form.connections },
  })

  saving.value = false
  resetForm()
}
</script>
