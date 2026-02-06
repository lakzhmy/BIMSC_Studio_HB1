<template>
  <div class="w-full h-64 flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 group/info">
        <h3 class="text-sm font-semibold text-slate-700">Project Complexity</h3>
        <span class="text-slate-400 cursor-help text-xs relative">ⓘ
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/info:block z-20 bg-slate-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
            Project scope growth measured over 7 weeks
          </div>
        </span>
      </div>
      <p class="text-xs text-slate-500">Growth Over Time</p>
    </div>
    <div class="flex-1 relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
      <svg viewBox="0 0 600 200" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <!-- Background grid -->
        <defs>
          <pattern id="gridPattern" width="60" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="200" stroke="rgba(148, 163, 184, 0.1)" stroke-width="1" />
            <line x1="0" y1="0" x2="600" y2="0" stroke="rgba(148, 163, 184, 0.1)" stroke-width="1" />
          </pattern>
        </defs>
        <rect width="600" height="200" fill="url(#gridPattern)" />

        <!-- Y-axis labels -->
        <text x="10" y="20" class="axis-label" text-anchor="start">High</text>
        <text x="10" y="100" class="axis-label" text-anchor="start">Mid</text>
        <text x="10" y="180" class="axis-label" text-anchor="start">Low</text>

        <!-- Stepped line path -->
        <polyline
          :points="steppedLinePoints"
          fill="none"
          stroke="rgba(100, 116, 139, 0.8)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />

        <!-- Data points (nodes) -->
        <g class="data-points">
          <circle
            v-for="(point, idx) in dataPoints"
            :key="idx"
            :cx="point.x"
            :cy="point.y"
            r="4"
            fill="rgba(148, 163, 184, 0.9)"
            stroke="white"
            stroke-width="2"
            class="node"
          />
        </g>

        <!-- X-axis labels -->
        <text x="30" y="195" class="axis-label" text-anchor="middle">Week 1</text>
        <text x="120" y="195" class="axis-label" text-anchor="middle">Week 2</text>
        <text x="210" y="195" class="axis-label" text-anchor="middle">Week 3</text>
        <text x="300" y="195" class="axis-label" text-anchor="middle">Week 4</text>
        <text x="390" y="195" class="axis-label" text-anchor="middle">Week 5</text>
        <text x="480" y="195" class="axis-label" text-anchor="middle">Week 6</text>
        <text x="570" y="195" class="axis-label" text-anchor="middle">Week 7</text>
      </svg>
    </div>
    <div class="text-xs text-slate-600">
      Current Complexity Index: <span class="font-semibold text-slate-900">{{ complexityIndex.toFixed(1) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Generate stepped complexity data
const complexityData = [
  { week: 1, complexity: 25 },
  { week: 2, complexity: 32 },
  { week: 3, complexity: 42 },
  { week: 4, complexity: 52 },
  { week: 5, complexity: 68 },
  { week: 6, complexity: 78 },
  { week: 7, complexity: 85 },
]

// Convert data to SVG coordinates
const dataPoints = computed(() => {
  return complexityData.map((data, idx) => {
    const x = 30 + idx * 90
    const y = 170 - (data.complexity / 100) * 150 // Scale to fit in viewBox
    return { x, y, complexity: data.complexity }
  })
})

// Generate stepped line points (horizontal then vertical transitions)
const steppedLinePoints = computed(() => {
  let points = []
  
  for (let i = 0; i < dataPoints.value.length; i++) {
    const current = dataPoints.value[i]
    
    if (i === 0) {
      points.push([current.x, current.y])
    } else {
      const prev = dataPoints.value[i - 1]
      // Create step: go horizontal first, then vertical
      points.push([current.x, prev.y])
      points.push([current.x, current.y])
    }
  }
  
  return points.map(p => p.join(',')).join(' ')
})

// Get latest complexity index
const complexityIndex = computed(() => {
  return complexityData[complexityData.length - 1].complexity
})
</script>

<style scoped>
.axis-label {
  font-size: 11px;
  fill: rgba(100, 116, 139, 0.6);
  font-family: system-ui, -apple-system, sans-serif;
}

.node {
  transition: all 0.3s ease;
}

.node:hover {
  r: 6px;
  fill: rgba(59, 130, 246, 0.9);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}
</style>
