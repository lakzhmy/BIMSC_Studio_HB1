<template>
  <div v-if="showHintButton" class="fixed bottom-4 right-4 z-[9998] flex items-center gap-2">
    <!-- Admin: Manage Hints button -->
    <button
      v-if="canEdit"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/85 backdrop-blur-sm border border-slate-600 text-white hover:bg-black shadow-sm transition-all select-none"
      @click="adminPanelOpen = true"
      title="Manage tour hints for this page"
    >
      <Settings :size="13" />
      <span>Manage Hints</span>
    </button>

    <button
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-white shadow-sm transition-all select-none"
      @click="startTour(route.name)"
      title="Start guided tour (Spacebar)"
    >
      <PenLine :size="13" />
      <span>Click here / Space for Hints</span>
    </button>
  </div>

  <TourAdminPanel
    v-if="adminPanelOpen"
    :route-name="route.name"
    @close="adminPanelOpen = false"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Settings, PenLine } from 'lucide-vue-next'
import { useAnnotations } from '@/composables/useAnnotations'
import { useTour } from '@/composables/useTour'
import TourAdminPanel from '@/components/TourAdminPanel.vue'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const { isAdmin } = useAnnotations()
const { startTour } = useTour()
const userStore = useUserStore()

const adminPanelOpen = ref(false)

const HIDDEN_ROUTES = ['auth-success', 'profile']

const showHintButton = computed(() => {
  return !HIDDEN_ROUTES.includes(route.name)
})

const canEdit = computed(() => isAdmin(userStore.currentUser?.name))
</script>
