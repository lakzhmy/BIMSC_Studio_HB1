<template>
  <AppShell>
    <!--
      The AppShell sticky header is ~108px tall (64px bar + 44px nav tabs).
      Everything below fills the remaining viewport height as a flex column.
    -->
    <main class="flex flex-col gap-3 px-6 py-4 overflow-hidden" style="height: calc(100vh - 108px);">

      <!-- ── Top bar: title + controls (fixed height) ── -->
      <div class="flex items-center justify-between gap-4 flex-none flex-wrap">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-slate-900">KPI Map</h1>
          <span class="text-sm text-slate-400 hidden sm:block">— dependency network between design KPIs</span>
        </div>

        <div class="flex items-center gap-4 flex-wrap">
          <!-- Team toggles -->
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-medium text-slate-400">Teams</span>
            <label :class="chipClass(teamFilters.structure, 'green')">
              <input v-model="teamFilters.structure" type="checkbox" class="sr-only" />
              Structure
            </label>
            <label :class="chipClass(teamFilters.program, 'blue')">
              <input v-model="teamFilters.program" type="checkbox" class="sr-only" />
              Program
            </label>
            <label :class="chipClass(teamFilters.data, 'red')">
              <input v-model="teamFilters.data" type="checkbox" class="sr-only" />
              Data
            </label>
          </div>

          <!-- Connection mode segmented control -->
          <div class="flex items-center gap-0.5 bg-slate-100 rounded-lg p-1">
            <button
              v-for="mode in CONNECTION_MODES"
              :key="mode.value"
              @click="connectionMode = mode.value"
              :class="[
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                connectionMode === mode.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              ]"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Legend (fixed height) ── -->
      <div class="flex items-center gap-5 text-xs text-slate-400 flex-none flex-wrap">
        <div class="flex items-center gap-1.5">
          <svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="#94a3b8" stroke-width="2.5" /></svg>
          Strong
        </div>
        <div class="flex items-center gap-1.5">
          <svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 3" /></svg>
          Medium
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full border-2 border-slate-300"></div>
          KPI node — hover or click to explore
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full border-2 border-dashed border-red-300"></div>
          Validation KPI (Data)
        </div>
      </div>

      <!-- ── SVG graph: fills remaining space ── -->
      <div
        ref="containerRef"
        class="flex-1 min-h-0 relative bg-white rounded-xl border border-slate-200 overflow-hidden"
      >
        <svg
          ref="svgRef"
          viewBox="0 0 900 540"
          preserveAspectRatio="xMidYMid meet"
          class="w-full h-full"
          @click.self="clearLock"
        >
          <defs>
            <radialGradient id="grad-program" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.12" />
              <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
            </radialGradient>
            <radialGradient id="grad-structure" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.12" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
            </radialGradient>
            <radialGradient id="grad-data" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ef4444" stop-opacity="0.12" />
              <stop offset="100%" stop-color="#ef4444" stop-opacity="0" />
            </radialGradient>
          </defs>

          <!-- Layer 1: Team halo rings -->
          <g>
            <circle v-if="teamFilters.program"
              cx="450" cy="268" r="150"
              fill="url(#grad-program)"
              stroke="#3b82f6" stroke-width="1" stroke-opacity="0.2"
              stroke-dasharray="6 4"
            />
            <circle v-if="teamFilters.structure"
              cx="730" cy="268" r="150"
              fill="url(#grad-structure)"
              stroke="#10b981" stroke-width="1" stroke-opacity="0.2"
              stroke-dasharray="6 4"
            />
            <circle v-if="teamFilters.data"
              cx="170" cy="268" r="150"
              fill="url(#grad-data)"
              stroke="#ef4444" stroke-width="1" stroke-opacity="0.2"
              stroke-dasharray="6 4"
            />
          </g>

          <!-- Layer 2: Team labels (inside halos at bottom) -->
          <g>
            <text v-if="teamFilters.program"
              x="450" y="484" text-anchor="middle"
              style="font-size: 13px; font-weight: 700; fill: #3b82f6; letter-spacing: 0.1em;"
            >PROGRAM</text>
            <text v-if="teamFilters.structure"
              x="730" y="484" text-anchor="middle"
              style="font-size: 13px; font-weight: 700; fill: #10b981; letter-spacing: 0.1em;"
            >STRUCTURE</text>
            <text v-if="teamFilters.data"
              x="170" y="484" text-anchor="middle"
              style="font-size: 13px; font-weight: 700; fill: #ef4444; letter-spacing: 0.1em;"
            >DATA</text>
            <text v-if="teamFilters.data"
              x="170" y="500" text-anchor="middle"
              style="font-size: 11px; fill: #94a3b8; letter-spacing: 0.04em;"
            >(Validation)</text>
          </g>

          <!-- Layer 3: Edges -->
          <g>
            <path
              v-for="edge in visibleEdges"
              :key="edge.id"
              :d="edgePath(edge)"
              fill="none"
              :stroke="edgeStrokeColor(edge)"
              :stroke-width="edge.strength === 'strong' ? 2.5 : 1.5"
              :stroke-dasharray="edgeDasharray(edge)"
              :stroke-opacity="edgeOpacity(edge)"
              :class="{ 'edge-animated': connectedEdgeIds.has(edge.id) }"
              style="transition: stroke-opacity 0.3s, stroke 0.3s;"
            />
          </g>

          <!-- Layer 4: KPI nodes -->
          <g>
            <g
              v-for="node in visibleNodes"
              :key="node.id"
              :transform="`translate(${node.cx}, ${node.cy})`"
              class="cursor-pointer"
              @mouseenter="handleNodeHover(node)"
              @mouseleave="handleNodeLeave(node)"
              @click.stop="handleNodeClick(node)"
            >
              <!-- Glow ring -->
              <circle
                r="36"
                :fill="TEAM_COLORS[node.team].hex"
                :fill-opacity="nodeGlowOpacity(node)"
                style="transition: fill-opacity 0.25s;"
              />

              <!-- Main circle -->
              <circle
                r="26"
                :fill="TEAM_COLORS[node.team].light"
                :fill-opacity="nodeFillOpacity(node)"
                :stroke="TEAM_COLORS[node.team].hex"
                :stroke-width="isNodeActive(node) ? 3 : 1.5"
                :stroke-opacity="nodeStrokeOpacity(node)"
                :stroke-dasharray="node.team === 'data' ? '4 2' : 'none'"
                style="transition: fill-opacity 0.25s, stroke-opacity 0.25s, stroke-width 0.2s;"
              />

              <!-- Node ID -->
              <text
                text-anchor="middle"
                dominant-baseline="central"
                :fill="TEAM_COLORS[node.team].hex"
                style="font-size: 12px; font-weight: 800;"
              >{{ node.id }}</text>

              <!-- KPI label (2 lines below circle) -->
              <text text-anchor="middle" :fill-opacity="nodeFillOpacity(node)" style="transition: fill-opacity 0.25s;">
                <tspan x="0" dy="36" style="font-size: 11px; fill: #475569; font-weight: 500;">{{ nodeLabelLine1(node) }}</tspan>
                <tspan x="0" dy="13" style="font-size: 11px; fill: #475569; font-weight: 500;">{{ nodeLabelLine2(node) }}</tspan>
              </text>
            </g>
          </g>
        </svg>

        <!-- ── Tooltip ── -->
        <Transition name="tooltip-fade">
          <div
            v-if="tooltip.visible && activeNode"
            class="absolute z-20 pointer-events-none"
            :style="tooltipStyle"
          >
            <div class="bg-white border border-slate-200 rounded-xl shadow-xl p-4 w-64">
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="inline-block w-2.5 h-2.5 rounded-full flex-none"
                  :style="{ backgroundColor: TEAM_COLORS[activeNode.team].hex }"
                ></span>
                <span class="text-xs font-bold uppercase tracking-widest"
                  :style="{ color: TEAM_COLORS[activeNode.team].hex }"
                >{{ activeNode.team }}</span>
                <span class="ml-auto text-xs text-slate-300 font-mono font-bold">{{ activeNode.id }}</span>
              </div>

              <p class="text-sm font-semibold text-slate-900 leading-snug">{{ activeNode.label }}</p>
              <p v-if="activeNode.sublabel" class="text-xs text-slate-400 mt-0.5">{{ activeNode.sublabel }}</p>

              <p class="text-xs text-slate-500 leading-relaxed mt-2">{{ activeNode.description }}</p>

              <div v-if="connectedNodeIds.size > 0" class="mt-3 pt-3 border-t border-slate-100">
                <p class="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Connects to</p>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="cid in connectedNodeIds"
                    :key="cid"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold font-mono"
                    :style="{
                      backgroundColor: TEAM_COLORS[nodeMap[cid]?.team]?.light,
                      color: TEAM_COLORS[nodeMap[cid]?.team]?.hex
                    }"
                  >{{ cid }}</span>
                </div>
              </div>

              <p v-if="!lockedNodeId" class="text-[10px] text-slate-300 mt-3">Click to lock · click canvas to clear</p>
              <p v-else class="text-[10px] text-slate-400 mt-3 font-medium">Locked — click canvas to release</p>
            </div>
          </div>
        </Transition>
      </div>

    </main>
  </AppShell>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import AppShell from '@/components/AppShell.vue'

// ─── Static data ─────────────────────────────────────────────────────────────

const TEAM_COLORS = {
  program:   { hex: '#3b82f6', light: '#dbeafe' },
  structure: { hex: '#10b981', light: '#d1fae5' },
  data:      { hex: '#ef4444', light: '#fee2e2' },
}

const CONNECTION_MODES = [
  { value: 'within', label: 'Within Team' },
  { value: 'cross',  label: 'Cross-Team'  },
  { value: 'all',    label: 'All'         },
]

// viewBox: 0 0 900 540
// Team columns: Data cx=170, Program cx=450, Structure cx=730
// Nodes arranged vertically: cy = 140, 268, 396
const NODES = [
  {
    id: 'P1', team: 'program',
    label: 'Occupancy Density',
    sublabel: 'm² / use',
    description: 'Building occupancy capacity, modifying square footage (m²), and the dimensions of the architectural program.',
    cx: 450, cy: 140,
  },
  {
    id: 'P2', team: 'program',
    label: 'Circulation-to-Program Ratio',
    sublabel: 'Net / Gross',
    description: 'Dimensions and positioning of circulation routes based on the location of the program throughout the building.',
    cx: 450, cy: 268,
  },
  {
    id: 'P3', team: 'program',
    label: 'Resource Consumption Intensity',
    sublabel: '',
    description: 'Consumption and distribution of resources throughout the building based on the needs of each program.',
    cx: 450, cy: 396,
  },
  {
    id: 'S1', team: 'structure',
    label: 'Natural Light & Shading',
    sublabel: 'Daylight & Solar Control',
    description: 'How the façade pattern, openings, and orientation balance daylight admission and solar gain control across the building.',
    cx: 730, cy: 140,
  },
  {
    id: 'S2', team: 'structure',
    label: 'Energy & Water Performance',
    sublabel: 'System Responsiveness',
    description: 'Assesses how efficiently environmental systems respond to external and internal conditions while minimizing energy consumption and resource losses.',
    cx: 730, cy: 268,
  },
  {
    id: 'S3', team: 'structure',
    label: 'Thermal, Solar & Wind Buffering',
    sublabel: 'Environmental Envelope',
    description: 'Evaluates how effectively the façade mitigates external environmental forces before they reach interior spaces, integrating material properties, pattern behavior, and wind-responsive design.',
    cx: 730, cy: 396,
  },
  {
    id: 'D1', team: 'data',
    label: 'Thermal Comfort Compliance',
    sublabel: '',
    description: 'Aggregates thermal inputs derived from program occupancy, envelope performance, structural mass, and active systems and evaluates how consistently interior spaces remain within acceptable thermal comfort ranges.',
    cx: 170, cy: 140,
  },
  {
    id: 'D2', team: 'data',
    label: 'Acoustic Comfort & Noise Index',
    sublabel: '',
    description: 'Aggregates noise sources (mechanical systems, circulation, program activity), structural transmission paths, envelope attenuation, and spatial buffering strategies. Evaluates both internal acoustic comfort and the building\'s noise impact on surroundings.',
    cx: 170, cy: 268,
  },
  {
    id: 'D3', team: 'data',
    label: 'Air Purification Effectiveness',
    sublabel: '',
    description: 'Informed by façade geometry, structural porosity, program density, and core systems. Defines how much air the building processes and the degree to which pollutants are removed before redistribution.',
    cx: 170, cy: 396,
  },
]

const EDGES = [
  { id: 'e-P1-D1', source: 'P1', target: 'D1', strength: 'strong', type: 'cross'  },
  { id: 'e-P1-D2', source: 'P1', target: 'D2', strength: 'strong', type: 'cross'  },
  { id: 'e-P1-D3', source: 'P1', target: 'D3', strength: 'medium', type: 'cross'  },
  { id: 'e-P2-D2', source: 'P2', target: 'D2', strength: 'strong', type: 'cross'  },
  { id: 'e-P3-D3', source: 'P3', target: 'D3', strength: 'strong', type: 'cross'  },
  { id: 'e-P3-S2', source: 'P3', target: 'S2', strength: 'medium', type: 'cross'  },
  { id: 'e-S1-D1', source: 'S1', target: 'D1', strength: 'strong', type: 'cross'  },
  { id: 'e-S2-D1', source: 'S2', target: 'D1', strength: 'medium', type: 'cross'  },
  { id: 'e-S3-D1', source: 'S3', target: 'D1', strength: 'strong', type: 'cross'  },
  { id: 'e-S3-D3', source: 'S3', target: 'D3', strength: 'medium', type: 'cross'  },
  { id: 'e-S1-S3', source: 'S1', target: 'S3', strength: 'medium', type: 'within' },
  { id: 'e-P1-P2', source: 'P1', target: 'P2', strength: 'medium', type: 'within' },
]

// ─── Reactive state ───────────────────────────────────────────────────────────

const teamFilters    = reactive({ program: true, structure: true, data: true })
const connectionMode = ref('all')
const hoveredNodeId  = ref(null)
const lockedNodeId   = ref(null)
const svgRef         = ref(null)
const containerRef   = ref(null)
const tooltip        = reactive({ visible: false, nodeId: null })

// ─── Computed ─────────────────────────────────────────────────────────────────

const nodeMap = computed(() => Object.fromEntries(NODES.map(n => [n.id, n])))

const visibleNodes = computed(() => NODES.filter(n => teamFilters[n.team]))

const visibleEdges = computed(() => {
  return EDGES.filter(edge => {
    const src = nodeMap.value[edge.source]
    const tgt = nodeMap.value[edge.target]
    if (!teamFilters[src.team] || !teamFilters[tgt.team]) return false
    if (connectionMode.value === 'within') return edge.type === 'within'
    if (connectionMode.value === 'cross')  return edge.type === 'cross'
    return true
  })
})

const activeNodeId = computed(() => lockedNodeId.value ?? hoveredNodeId.value)

const activeNode = computed(() =>
  activeNodeId.value ? nodeMap.value[activeNodeId.value] : null
)

const connectedNodeIds = computed(() => {
  if (!activeNodeId.value) return new Set()
  const ids = new Set()
  for (const e of visibleEdges.value) {
    if (e.source === activeNodeId.value) ids.add(e.target)
    if (e.target === activeNodeId.value) ids.add(e.source)
  }
  return ids
})

const connectedEdgeIds = computed(() => {
  if (!activeNodeId.value) return new Set()
  return new Set(
    visibleEdges.value
      .filter(e => e.source === activeNodeId.value || e.target === activeNodeId.value)
      .map(e => e.id)
  )
})

// Tooltip: position as % of viewBox, clamped so it never clips at edges
const tooltipStyle = computed(() => {
  if (!activeNode.value) return { display: 'none' }
  const rawX = (activeNode.value.cx / 900) * 100
  const clampedX = Math.min(Math.max(rawX, 16), 84)
  const yPct = (activeNode.value.cy / 540) * 100
  return {
    left: `${clampedX}%`,
    top:  `${yPct}%`,
    transform: 'translate(-50%, calc(-100% - 18px))',
  }
})

// ─── Handlers ────────────────────────────────────────────────────────────────

function handleNodeHover(node) {
  hoveredNodeId.value = node.id
  tooltip.visible = true
  tooltip.nodeId = node.id
}

function handleNodeLeave(node) {
  if (lockedNodeId.value !== node.id) hoveredNodeId.value = null
  if (!lockedNodeId.value) { tooltip.visible = false; tooltip.nodeId = null }
}

function handleNodeClick(node) {
  if (lockedNodeId.value === node.id) {
    lockedNodeId.value = null
    tooltip.visible = false
  } else {
    lockedNodeId.value = node.id
    hoveredNodeId.value = node.id
    tooltip.visible = true
    tooltip.nodeId = node.id
  }
}

function clearLock() {
  lockedNodeId.value = null
  hoveredNodeId.value = null
  tooltip.visible = false
  tooltip.nodeId = null
}

// ─── SVG helpers ─────────────────────────────────────────────────────────────

function edgePath(edge) {
  const src = nodeMap.value[edge.source]
  const tgt = nodeMap.value[edge.target]
  if (!src || !tgt) return ''
  const x1 = src.cx, y1 = src.cy
  const x2 = tgt.cx, y2 = tgt.cy

  if (edge.type === 'within') {
    const bowX = x1 >= 450 ? x1 + 80 : x1 - 80
    return `M ${x1} ${y1} Q ${bowX} ${(y1 + y2) / 2} ${x2} ${y2}`
  }

  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = -dy / len, ny = dx / len
  return `M ${x1} ${y1} Q ${midX + nx * 45} ${midY + ny * 45} ${x2} ${y2}`
}

function edgeDasharray(edge) {
  if (connectedEdgeIds.value.has(edge.id)) return '12 4'
  return edge.strength === 'medium' ? '8 4' : 'none'
}

function edgeStrokeColor(edge) {
  if (connectedEdgeIds.value.has(edge.id)) return TEAM_COLORS[nodeMap.value[edge.source].team].hex
  return '#cbd5e1'
}

function edgeOpacity(edge) {
  if (!activeNodeId.value) return 0.5
  return connectedEdgeIds.value.has(edge.id) ? 1 : 0.07
}

function isNodeActive(node) { return activeNodeId.value === node.id }

function nodeGlowOpacity(node) {
  if (!activeNodeId.value) return 0
  if (isNodeActive(node)) return 0.2
  if (connectedNodeIds.value.has(node.id)) return 0.1
  return 0
}

function nodeFillOpacity(node) {
  if (!activeNodeId.value) return 0.9
  return (isNodeActive(node) || connectedNodeIds.value.has(node.id)) ? 1 : 0.2
}

function nodeStrokeOpacity(node) {
  if (!activeNodeId.value) return 0.7
  return (isNodeActive(node) || connectedNodeIds.value.has(node.id)) ? 1 : 0.15
}

function chipClass(active, color) {
  const base = 'px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer select-none transition-colors'
  const on = {
    green: 'bg-green-100 text-green-700 border-green-300',
    blue:  'bg-blue-100  text-blue-700  border-blue-300',
    red:   'bg-red-100   text-red-700   border-red-300',
  }[color]
  return `${base} ${active ? on : 'bg-slate-100 text-slate-400 border-slate-200'}`
}

function nodeLabelLine1(node) {
  const words = node.label.split(' ')
  let line = ''
  for (const w of words) {
    if (line && (line + ' ' + w).length > 15) break
    line += (line ? ' ' : '') + w
  }
  return line
}

function nodeLabelLine2(node) {
  const l1 = nodeLabelLine1(node)
  const rest = node.label.slice(l1.length).trim()
  return rest.length > 18 ? rest.slice(0, 16) + '…' : rest
}
</script>

<style scoped>
@keyframes dash-flow {
  from { stroke-dashoffset: 24; }
  to   { stroke-dashoffset: 0; }
}

.edge-animated {
  animation: dash-flow 1.2s linear infinite;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-100% - 10px));
}
</style>
