<template>
  <RouterView v-slot="{ Component }">
    <AppShell v-if="showShell">
      <component :is="Component" />
    </AppShell>
    <component v-else :is="Component" />
  </RouterView>
</template>

<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppShell from '@/components/AppShell.vue'

const route = useRoute()

const showShell = computed(() => {
  return ['dashboard', 'kpi', 'timeline', 'viewer', 'stress-test'].includes(route.name)
})
</script>
