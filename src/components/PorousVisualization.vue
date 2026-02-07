<template>
  <div class="w-full flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 group/info">
        <h3 class="text-sm font-semibold text-slate-700">Tower Vital Signs Matrix</h3>
        <span class="text-slate-400 cursor-help text-xs relative">i
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/info:block z-20 bg-slate-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
            Color-coded stress map: Red=Air Quality, Blue=Occupancy, Green=Structure
          </div>
        </span>
      </div>
      <p class="text-xs text-slate-500">200 Floors x 4 Zones</p>
    </div>
    <div class="relative rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4" style="height: 700px;">
      <div class="flex gap-4 h-full">
        <div class="flex flex-col justify-between text-xs text-slate-500 pr-2 border-r border-slate-300">
          <div>L200</div>
          <div>L180</div>
          <div>L160</div>
          <div>L140</div>
          <div>L120</div>
          <div>L100</div>
          <div>L80</div>
          <div>L60</div>
          <div>L40</div>
          <div>L20</div>
          <div>L1</div>
        </div>

        <div class="flex-1 flex flex-col">
          <div class="grid grid-cols-4 gap-2 mb-2 pb-2 border-b border-slate-300">
            <div class="text-xs text-slate-500 text-center font-medium">North</div>
            <div class="text-xs text-slate-500 text-center font-medium">Core</div>
            <div class="text-xs text-slate-500 text-center font-medium">South</div>
            <div class="text-xs text-slate-500 text-center font-medium">Atrium</div>
          </div>

          <div
            class="flex-1 relative"
            @mousemove="updateTooltipPos"
            @mouseleave="hideTooltip"
          >
            <div
              v-for="(bubble, idx) in bubbles"
              :key="idx"
              class="absolute bubble-breathing cursor-pointer rounded-full transition-transform hover:scale-110"
              :style="{
                left: `${bubble.xPos}%`,
                top: `${bubble.yPos}%`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                background: bubble.color,
                opacity: bubble.opacity,
                animationDelay: `${idx * 0.02}s`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                transform: 'translate(-50%, -50%)',
              }"
              @mouseenter="showTooltip(bubble, $event)"
              @mousemove="updateTooltipPos"
            ></div>

            <div
              v-if="hoveredBubble"
              class="fixed z-50 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none"
              :style="{
                left: `${tooltipPos.x + 20}px`,
                top: `${tooltipPos.y - 20}px`,
                minWidth: '220px',
                maxWidth: '280px',
              }"
            >
              <div class="font-semibold mb-2 border-b border-slate-700 pb-1">
                Level {{ hoveredBubble.floor }} - {{ hoveredBubble.zone }}
              </div>
              <div class="space-y-1">
                <div class="flex justify-between">
                  <span class="text-red-300">Air Quality:</span>
                  <span class="font-medium">{{ (100 - hoveredBubble.airPollution).toFixed(1) }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">CO2 Level:</span>
                  <span>{{ hoveredBubble.co2 }} ppm</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Pollution:</span>
                  <span>{{ hoveredBubble.airPollution.toFixed(1) }}%</span>
                </div>
                <div class="flex justify-between mt-2 pt-1 border-t border-slate-700">
                  <span class="text-blue-300">Occupancy:</span>
                  <span class="font-medium">{{ hoveredBubble.occupancy.toFixed(1) }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">People Count:</span>
                  <span>{{ hoveredBubble.peopleCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Activity Level:</span>
                  <span>{{ hoveredBubble.activityLevel }}</span>
                </div>
                <div class="flex justify-between mt-2 pt-1 border-t border-slate-700">
                  <span class="text-green-300">Structural Load:</span>
                  <span class="font-medium">{{ hoveredBubble.structuralLoad.toFixed(1) }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Stress Level:</span>
                  <span>{{ hoveredBubble.stressLevel }} MPa</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Deflection:</span>
                  <span>{{ hoveredBubble.deflection }} mm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex gap-4 text-xs flex-wrap">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full" style="background: rgb(239, 68, 68); opacity: 0.7;"></div>
        <span class="text-slate-600">Red: Air Quality (Data)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full" style="background: rgb(59, 130, 246); opacity: 0.7;"></div>
        <span class="text-slate-600">Blue: Occupancy (Program)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full" style="background: rgb(34, 197, 94); opacity: 0.7;"></div>
        <span class="text-slate-600">Green: Structure Load</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full" style="background: linear-gradient(135deg, rgb(239, 68, 68) 50%, rgb(59, 130, 246) 50%); opacity: 0.7;"></div>
        <span class="text-slate-600">Purple: Red+Blue overlap</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full" style="background: linear-gradient(135deg, rgb(59, 130, 246) 50%, rgb(34, 197, 94) 50%); opacity: 0.7;"></div>
        <span class="text-slate-600">Teal: Blue+Green overlap</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const zones = ['North', 'Core', 'South', 'Atrium']
const floors = 200

const hoveredBubble = ref(null)
const tooltipPos = ref({ x: 0, y: 0 })

const showTooltip = (bubble, event) => {
  hoveredBubble.value = bubble
  tooltipPos.value = {
    x: event.clientX,
    y: event.clientY,
  }
}

const updateTooltipPos = (event) => {
  if (hoveredBubble.value) {
    tooltipPos.value = {
      x: event.clientX,
      y: event.clientY,
    }
  }
}

const hideTooltip = () => {
  hoveredBubble.value = null
}

const generateBubbles = () => {
  const bubbles = []
  const floorsToShow = [
    1, 10, 20, 30, 40, 50, 60, 70, 80, 90,
    100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
  ]

  for (let floorIdx = 0; floorIdx < floorsToShow.length; floorIdx++) {
    const floor = floorsToShow[floorIdx]

    for (let zoneIdx = 0; zoneIdx < zones.length; zoneIdx++) {
      const zone = zones[zoneIdx]

      const baseX = (zoneIdx / (zones.length - 1)) * 100
      const baseY = ((floorsToShow.length - 1 - floorIdx) / (floorsToShow.length - 1)) * 100
      const xOffset = (Math.random() - 0.5) * 15
      const yOffset = (Math.random() - 0.5) * 8

      const xPos = Math.max(5, Math.min(95, baseX + xOffset))
      const yPos = Math.max(5, Math.min(95, baseY + yOffset))

      let airPollution = Math.random() * 100
      if (zone === 'Core' || zone === 'Atrium') {
        airPollution = 30 + Math.random() * 70
      }

      let occupancy = Math.random() * 100
      if (zone === 'Core') {
        occupancy = 50 + Math.random() * 50
      } else if (zone === 'Atrium') {
        occupancy = 40 + Math.random() * 40
      }

      const floorFactor = (floors - floor) / floors
      let structuralLoad = floorFactor * 60 + Math.random() * 40
      if (zone === 'Core') {
        structuralLoad = Math.max(structuralLoad, 60 + Math.random() * 40)
      }

      const co2 = Math.round(400 + airPollution * 15)
      const peopleCount = Math.round(occupancy * 0.5)
      const activityLevel = occupancy > 70 ? 'High' : occupancy > 40 ? 'Medium' : 'Low'
      const stressLevel = (structuralLoad * 0.8).toFixed(1)
      const deflection = (structuralLoad * 0.15).toFixed(2)

      const maxMetric = Math.max(airPollution, occupancy, structuralLoad)

      let color
      const bubbleSize = 35 + (maxMetric / 100) * 40

      if (airPollution === maxMetric) {
        color = 'rgb(239, 68, 68)'
      } else if (occupancy === maxMetric) {
        color = 'rgb(59, 130, 246)'
      } else {
        color = 'rgb(34, 197, 94)'
      }

      bubbles.push({
        floor,
        zone,
        xPos,
        yPos,
        airPollution,
        co2,
        occupancy,
        peopleCount,
        activityLevel,
        structuralLoad,
        stressLevel,
        deflection,
        color,
        size: bubbleSize,
        opacity: 0.5,
      })
    }
  }

  return bubbles
}

const bubbles = computed(() => generateBubbles())
</script>

<style scoped>
.bubble-breathing {
  animation: bubblePulse 3s ease-in-out infinite;
  mix-blend-mode: multiply;
}

@keyframes bubblePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
