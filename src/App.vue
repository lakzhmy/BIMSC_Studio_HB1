<template>
  <RouterView v-slot="{ Component }">
    <AppShell v-if="showShell">
      <component :is="Component" />
    </AppShell>
    <component v-else :is="Component" />
  </RouterView>

  <TourHintButton />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppShell from '@/components/AppShell.vue'
import TourHintButton from '@/components/TourHintButton.vue'
import { useAnnotations } from '@/composables/useAnnotations'
import { useTour } from '@/composables/useTour'

const route = useRoute()

const showShell = computed(() => {
  return ['dashboard', 'kpi', 'timeline', 'viewer', 'stress-test'].includes(route.name)
})

const { loadAnnotations } = useAnnotations()
const { startTour } = useTour()

onMounted(() => {
  loadAnnotations()

  const IGNORED_TAGS = ['input', 'textarea', 'select']
  window.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName?.toLowerCase()
    if (IGNORED_TAGS.includes(tag)) return
    if (document.activeElement?.contentEditable === 'true') return

    if (event.code === 'Space') {
      event.preventDefault()
      startTour(route.name)
    }
  })
})
</script>
