<template>
  <RouterView v-slot="{ Component }">
    <AppShell v-if="showShell">
      <component :is="Component" />
    </AppShell>
    <component v-else :is="Component" />
  </RouterView>

  <AnnotationOverlay />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppShell from '@/components/AppShell.vue'
import AnnotationOverlay from '@/components/AnnotationOverlay.vue'
import { useAnnotations } from '@/composables/useAnnotations'

const route = useRoute()

const showShell = computed(() => {
  return ['dashboard', 'kpi', 'timeline', 'viewer', 'stress-test'].includes(route.name)
})

const { registerKeyListener } = useAnnotations()
onMounted(() => registerKeyListener())
</script>
