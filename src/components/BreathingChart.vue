<template>
  <div class="w-full h-64 flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 group/info">
        <h3 class="text-sm font-semibold text-slate-700">Filtration Efficacy</h3>
        <span class="text-slate-400 cursor-help text-xs relative">ⓘ
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/info:block z-20 bg-slate-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
            Dirty air (red) declines as clean air (green) increases
          </div>
        </span>
      </div>
      <p class="text-xs text-slate-500">Dirty vs Clean Air</p>
    </div>
    <div class="flex-1 relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
      <svg viewBox="0 0 600 250" class="w-full h-full breathing-animation" preserveAspectRatio="xMidYMid meet">
        <!-- Dirty Air curve (gray/red) -->
        <defs>
          <linearGradient id="dirtyAirGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color: rgba(239, 68, 68, 0.3); stop-opacity: 1" />
            <stop offset="100%" style="stop-color: rgba(239, 68, 68, 0.05); stop-opacity: 1" />
          </linearGradient>
          <linearGradient id="cleanAirGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color: rgba(34, 197, 94, 0.3); stop-opacity: 1" />
            <stop offset="100%" style="stop-color: rgba(34, 197, 94, 0.05); stop-opacity: 1" />
          </linearGradient>
        </defs>

        <!-- Dirty Air Area -->
        <path
          :d="dirtyAirPath"
          fill="url(#dirtyAirGradient)"
          stroke="rgba(239, 68, 68, 0.8)"
          stroke-width="2"
          class="dirty-air-curve"
        />

        <!-- Clean Air Area -->
        <path
          :d="cleanAirPath"
          fill="url(#cleanAirGradient)"
          stroke="rgba(34, 197, 94, 0.8)"
          stroke-width="2"
          class="clean-air-curve"
        />

        <!-- Grid lines -->
        <line x1="0" y1="75" x2="600" y2="75" stroke="rgba(148, 163, 184, 0.1)" stroke-width="1" />
        <line x1="0" y1="125" x2="600" y2="125" stroke="rgba(148, 163, 184, 0.1)" stroke-width="1" />
        <line x1="0" y1="175" x2="600" y2="175" stroke="rgba(148, 163, 184, 0.1)" stroke-width="1" />
      </svg>
    </div>
    <div class="flex gap-6 text-xs">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-500"></div>
        <span class="text-slate-600">Dirty Air</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-green-500"></div>
        <span class="text-slate-600">Clean Air</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const generateWave = (phase, amplitude = 40, offset = 120) => {
  let path = `M 0 ${offset}`
  for (let x = 0; x <= 600; x += 10) {
    const y = offset + Math.sin((x / 600) * Math.PI * 4 + phase) * amplitude
    path += ` L ${x} ${y}`
  }
  path += ` L 600 250 L 0 250 Z`
  return path
}

// Create paths using sine waves
const phase = Math.sin(Date.now() / 2000) * 0.5
const dirtyAirPath = computed(() => generateWave(phase, 35, 100))
const cleanAirPath = computed(() => generateWave(phase + Math.PI / 2, 35, 130))
</script>

<style scoped>
.breathing-animation {
  animation: breathe 4s ease-in-out infinite;
  transform-origin: center;
}

@keyframes breathe {
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.08);
  }
}
</style>
