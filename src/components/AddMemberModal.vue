<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">Add Member</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Name</label>
          <input 
            v-model="formData.name"
            type="text" 
            placeholder="Enter member name"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Role</label>
          <input 
            v-model="formData.role"
            type="text" 
            placeholder="e.g., Lead Engineer, Designer"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Team</label>
          <select 
            v-model="formData.team"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a team</option>
            <option value="structure">Green Structure</option>
            <option value="program">Blue Program</option>
            <option value="data">Red Data</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Mood</label>
          <input 
            v-model="formData.mood"
            type="text" 
            placeholder="e.g., Focused, Creative, Energized"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label class="flex items-center gap-3 cursor-pointer">
            <input 
              v-model="useUserAvatar"
              type="checkbox"
              class="w-4 h-4"
            />
            <span class="text-sm font-medium text-slate-700">Match my avatar</span>
          </label>
          <p class="text-xs text-slate-500 mt-1">Use your own avatar settings for this member</p>
        </div>

        <div v-if="!useUserAvatar" class="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Complexity Level</label>
            <div class="flex items-center gap-3">
              <input 
                v-model.number="formData.avatar.complexity"
                type="range" 
                min="0" 
                max="100"
                class="flex-1"
              />
              <span class="text-sm font-medium text-slate-700 w-12">{{ formData.avatar.complexity }}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              {{ getComplexityLabel(formData.avatar.complexity) }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Animation Speed</label>
            <div class="flex items-center gap-3">
              <input 
                v-model.number="formData.avatar.speed"
                type="range" 
                min="0.5" 
                max="4"
                step="0.1"
                class="flex-1"
              />
              <span class="text-sm font-medium text-slate-700 w-12">{{ formData.avatar.speed.toFixed(1) }}s</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Wobble Effect</label>
            <div class="flex items-center gap-3">
              <input 
                v-model.number="formData.avatar.wobble"
                type="range" 
                min="0" 
                max="50"
                class="flex-1"
              />
              <span class="text-sm font-medium text-slate-700 w-12">{{ formData.avatar.wobble }}</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Color Shade</label>
            <div class="flex items-center gap-3">
              <input 
                v-model.number="formData.avatar.shade"
                type="range" 
                min="0" 
                max="4"
                class="flex-1"
              />
              <span class="text-sm font-medium text-slate-700 w-12">{{ formData.avatar.shade }}</span>
            </div>
          </div>

          <!-- Avatar Preview -->
          <div class="mt-4 pt-4 border-t border-slate-300">
            <p class="text-sm font-medium text-slate-700 mb-3">Preview</p>
            <div class="flex justify-center items-center py-6 bg-white rounded-lg">
              <AvatarPreview 
                :complexity="formData.avatar.complexity"
                :speed="formData.avatar.speed"
                :wobble="formData.avatar.wobble"
                :shade="formData.avatar.shade"
                :team="formData.team"
              />
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button 
            type="button"
            @click="handleClose"
            class="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Add Member
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import AvatarPreview from '@/components/AvatarPreview.vue'

const userStore = useUserStore()

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const useUserAvatar = ref(true)

const formData = ref({
  name: '',
  role: '',
  team: '',
  mood: '',
  avatar: {
    complexity: 50,
    speed: 2,
    wobble: 30,
    shade: 2
  }
})

// Watch useUserAvatar and update avatar if needed
watch(useUserAvatar, (newVal) => {
  if (newVal) {
    formData.value.avatar = {
      complexity: userStore.avatarConfig.complexity,
      speed: userStore.avatarConfig.speed,
      wobble: userStore.avatarConfig.wobble,
      shade: userStore.avatarConfig.shade
    }
  }
})

function getComplexityLabel(complexity) {
  if (complexity < 25) return 'Simple - Almost circular'
  if (complexity < 50) return 'Moderate - More organic'
  if (complexity < 75) return 'Complex - Very organic'
  return 'Extreme - Highly irregular'
}

function handleSubmit() {
  if (formData.value.name && formData.value.role && formData.value.team && formData.value.mood) {
    emit('submit', {
      ...formData.value,
      avatar: formData.value.avatar
    })
    resetForm()
  }
}

function handleClose() {
  resetForm()
  emit('close')
}

function resetForm() {
  useUserAvatar.value = true
  formData.value = {
    name: '',
    role: '',
    team: '',
    mood: '',
    avatar: {
      complexity: 50,
      speed: 2,
      wobble: 30,
      shade: 2
    }
  }
}
</script>

<style scoped>
</style>
