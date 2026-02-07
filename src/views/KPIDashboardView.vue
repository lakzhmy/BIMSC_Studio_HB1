<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <div class="h-16 px-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold">Lung Tower Studio</h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-100">
            <UserAvatar size="32px" />
            <div class="text-sm">
              <p class="font-semibold">{{ userStore.currentUser.name }}</p>
              <p class="text-xs text-slate-600 capitalize">{{ userStore.selectedTeam }} Team</p>
            </div>
          </div>
          <button @click="$router.push('/profile')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium">Profile</button>
          <button @click="handleLogout" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium">Logout</button>
        </div>
      </div>
      <div class="border-t px-6 flex gap-1 overflow-x-auto border-slate-200">
        <router-link v-for="item in navigationItems" :key="item.path" :to="item.path" :class="['px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap', isActiveRoute(item.path) ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900']">{{ item.label }}</router-link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="py-8 px-6">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Category Tabs -->
        <div class="flex gap-2">
          <button v-for="category in categories" :key="category.id" @click="selectedCategory = category.id" :class="['px-6 py-2 text-sm font-medium rounded-lg transition-colors', selectedCategory === category.id ? 'text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50']" :style="selectedCategory === category.id ? { backgroundColor: category.color } : {}">
            {{ category.label }}
          </button>
        </div>

        <!-- Week and Scenario Selectors -->
        <div v-if="selectedCategory !== 'vitals' && selectedCategory !== 'program'" class="flex flex-wrap gap-4 p-4 bg-white rounded-lg border border-slate-200">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-slate-700">Week</label>
            <select v-model="selectedWeek" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm">
              <option value="">Select Week</option>
              <option v-for="week in weeks" :key="week" :value="week">{{ week }}</option>
            </select>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-slate-700">Scenario</label>
            <select v-model="selectedScenario" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm">
              <option value="">Select Scenario</option>
              <option v-for="scenario in scenarios" :key="scenario" :value="scenario">{{ scenario }}</option>
            </select>
          </div>
        </div>

        <!-- Program Selector (isolated component) -->
        <ProgramKPISelector v-if="selectedCategory === 'program' && currentSheetData" :sheetData="currentSheetData" />

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-16">
          <p class="text-slate-500 text-lg">Loading KPI data...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 class="text-red-900 font-semibold mb-2">Error Loading Data</h3>
          <p class="text-red-700 text-sm">{{ loadError }}</p>
          <button @click="loadData" class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium">
            Retry
          </button>
        </div>

        <!-- KPI Cards (not for PROGRAM) -->
        <div v-if="selectedCategory !== 'vitals' && selectedCategory !== 'program' && filteredKPIs.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="kpi in filteredKPIs" :key="kpi.id" class="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-slate-700 mb-1">{{ kpi.name }}</h3>
                <p class="text-xs text-slate-500">{{ kpi.unit }}</p>
              </div>
              <div :class="['w-2 h-2 rounded-full flex-shrink-0 mt-1', kpi.status === 'good' ? 'bg-green-500' : kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500']"></div>
            </div>
            <div class="space-y-3">
              <div class="flex items-end gap-2">
                <div class="text-3xl font-bold text-slate-900">{{ typeof kpi.value === 'number' ? kpi.value.toFixed(2) : kpi.value }}</div>
              </div>
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <span class="capitalize">Status: {{ kpi.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- No Data State -->
        <div v-else-if="selectedCategory !== 'vitals' && selectedCategory !== 'program'" class="bg-slate-100 rounded-lg p-12 text-center">
          <p class="text-slate-500">Select a week and scenario to view KPI data</p>
        </div>

        <!-- Vitals Visualizations -->
        <div v-if="selectedCategory === 'vitals'" class="space-y-6">
          <div class="bg-white rounded-lg border border-slate-200 p-6">
            <h2 class="text-2xl font-bold text-slate-900 mb-2">Vitals</h2>
            <p class="text-slate-500">Building performance visualizations and real-time monitoring.</p>
          </div>

          <div class="grid lg:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
              <BreathingChart />
            </div>
            <div class="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
              <ProjectComplexity />
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
            <PorousVisualization />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import UserAvatar from '@/components/UserAvatar.vue'
import ProgramKPISelector from '@/components/ProgramKPISelector.vue'
import BreathingChart from '@/components/BreathingChart.vue'
import PorousVisualization from '@/components/PorousVisualization.vue'
import ProjectComplexity from '@/components/ProjectComplexity.vue'
import { fetchKPIsByCategory, getKPIsForSelection } from '@/services/googleSheetsService'

const router = useRouter()
const userStore = useUserStore()
const selectedCategory = ref('program')
const selectedWeek = ref('')
const selectedScenario = ref('')
const isLoading = ref(false)
const loadError = ref('')

const categories = [
  { id: 'program', label: 'Program', color: '#3b82f6' },
  { id: 'structure', label: 'Structure', color: '#10b981' },
  { id: 'data', label: 'Data', color: '#ef4444' },
  { id: 'vitals', label: 'Vitals', color: '#8b5cf6' },
]

const sheetDataByCategory = ref({
  program: null,
  structure: null,
  data: null,
  vitals: null,
})

const currentSheetData = computed(() => sheetDataByCategory.value[selectedCategory.value])

const weeks = computed(() => {
  const data = currentSheetData.value
  return (data && Array.isArray(data.weeks)) ? data.weeks : []
})

const scenarios = computed(() => {
  if (!selectedWeek.value || !currentSheetData.value) {
    return []
  }
  const data = currentSheetData.value.data || []
  const scenariosForWeek = data
    .filter(row => row && row.week === selectedWeek.value)
    .map(row => row?.scenario)
    .filter(v => v && v.trim())
  return [...new Set(scenariosForWeek)]
})

const filteredKPIs = computed(() => {
  if (!selectedWeek.value || !selectedScenario.value || !currentSheetData.value) {
    return []
  }
  const result = getKPIsForSelection(currentSheetData.value, selectedWeek.value, selectedScenario.value)
  return Array.isArray(result) ? result : []
})

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/kpi', label: 'KPI' },
  { path: '/meetings', label: 'Meetings' },
  { path: '/actions', label: 'Actions' },
  { path: '/viewer', label: '3D Viewer' },
  { path: '/teams', label: 'Teams' },
]

function isActiveRoute(path) {
  return router.currentRoute.value.path === path
}

function handleLogout() {
  userStore.logout()
  router.push('/')
}

async function loadData() {
  isLoading.value = true
  loadError.value = ''
  try {
    console.log('Loading KPI data from Google Sheets...')
    const [programData, structureData, dataData, vitalsData] = await Promise.all([
      fetchKPIsByCategory('program'),
      fetchKPIsByCategory('structure'),
      fetchKPIsByCategory('data'),
      fetchKPIsByCategory('vitals'),
    ])
    console.log('Loaded data:', { programData, structureData, dataData, vitalsData })
    
    sheetDataByCategory.value = {
      program: programData,
      structure: structureData,
      data: dataData,
      vitals: vitalsData,
    }
  } catch (error) {
    console.error('Failed to load KPI data:', error)
    loadError.value = `Error: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    isLoading.value = false
  }
}

watch(() => selectedCategory.value, () => {
  selectedWeek.value = ''
  selectedScenario.value = ''
})

watch(() => weeks.value, (newWeeks) => {
  if (newWeeks && newWeeks.length > 0 && !selectedWeek.value) {
    selectedWeek.value = newWeeks[0]
  }
})

watch(() => selectedWeek.value, () => {
  selectedScenario.value = ''
})

watch(() => scenarios.value, (newScenarios) => {
  if (newScenarios && newScenarios.length > 0 && !selectedScenario.value) {
    selectedScenario.value = newScenarios[0]
  }
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
</style>
