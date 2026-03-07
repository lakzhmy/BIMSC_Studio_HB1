<template>
  <AppShell>
    <main class="flex flex-col gap-3 px-6 py-4 overflow-hidden" style="height: calc(100vh - 108px);">

      <!-- ── Top bar ── -->
      <div class="flex items-center justify-between gap-4 flex-none flex-wrap">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-slate-900">KPI Map</h1>
          <span class="text-sm text-slate-400 hidden sm:block">— dependency network between design KPIs</span>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- Team toggles (hidden in edit mode to save space) -->
          <div v-if="!editMode" class="flex items-center gap-1.5">
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

          <!-- Connection mode (hidden in edit mode) -->
          <div v-if="!editMode" class="flex items-center gap-0.5 bg-slate-100 rounded-lg p-1">
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
            >{{ mode.label }}</button>
          </div>

          <!-- Edit mode actions -->
          <template v-if="editMode">
            <button
              @click="openNewNodePanel"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Plus class="w-3.5 h-3.5" /> Add KPI
            </button>
            <button
              @click="toggleConnectMode"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                connectMode
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              ]"
            >
              <Link2 class="w-3.5 h-3.5" />
              {{ connectMode ? (connectSource ? 'Now click target…' : 'Click source node…') : 'Connect' }}
            </button>
          </template>

          <!-- Edit toggle -->
          <button
            @click="toggleEditMode"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              editMode
                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            ]"
          >
            <Pencil v-if="!editMode" class="w-3.5 h-3.5" />
            <X v-else class="w-3.5 h-3.5" />
            {{ editMode ? 'Done' : 'Edit' }}
          </button>
        </div>
      </div>

      <!-- ── Legend ── -->
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
          KPI node — hover or click
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full border-2 border-dashed border-red-300"></div>
          Validation KPI (Data)
        </div>
        <div v-if="editMode" class="flex items-center gap-1.5 text-orange-500 font-medium">
          <span class="w-2 h-2 rounded-full bg-orange-400 animate-pulse inline-block"></span>
          Edit mode — click nodes and edges to modify
        </div>
        <div v-if="saveError" class="text-red-500 font-medium">{{ saveError }}</div>
      </div>

      <!-- ── Graph container ── -->
      <div
        ref="containerRef"
        class="flex-1 min-h-0 relative bg-white rounded-xl border overflow-hidden transition-colors duration-300"
        :class="editMode ? 'border-orange-300 border-2' : 'border-slate-200'"
      >
        <!-- Loading state -->
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
          <div class="flex flex-col items-center gap-3 text-slate-400">
            <div class="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
            <span class="text-sm">Loading KPI Map…</span>
          </div>
        </div>

        <!-- SVG graph -->
        <svg
          v-else
          ref="svgRef"
          :viewBox="dynamicViewBox"
          preserveAspectRatio="xMidYMid meet"
          class="w-full h-full"
          :class="connectMode && !connectSource ? 'cursor-crosshair' : ''"
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

          <!-- Team halo rings -->
          <g>
            <circle v-if="teamFilters.program || editMode"
              cx="450" :cy="haloCy" r="150"
              fill="url(#grad-program)" stroke="#3b82f6"
              stroke-width="1" stroke-opacity="0.2" stroke-dasharray="6 4"
            />
            <circle v-if="teamFilters.structure || editMode"
              cx="730" :cy="haloCy" r="150"
              fill="url(#grad-structure)" stroke="#10b981"
              stroke-width="1" stroke-opacity="0.2" stroke-dasharray="6 4"
            />
            <circle v-if="teamFilters.data || editMode"
              cx="170" :cy="haloCy" r="150"
              fill="url(#grad-data)" stroke="#ef4444"
              stroke-width="1" stroke-opacity="0.2" stroke-dasharray="6 4"
            />
          </g>

          <!-- Team labels -->
          <g>
            <text v-if="teamFilters.program || editMode"
              x="450" :y="haloLabelY" text-anchor="middle"
              style="font-size: 13px; font-weight: 700; fill: #3b82f6; letter-spacing: 0.1em;"
            >PROGRAM</text>
            <text v-if="teamFilters.structure || editMode"
              x="730" :y="haloLabelY" text-anchor="middle"
              style="font-size: 13px; font-weight: 700; fill: #10b981; letter-spacing: 0.1em;"
            >STRUCTURE</text>
            <text v-if="teamFilters.data || editMode"
              x="170" :y="haloLabelY" text-anchor="middle"
              style="font-size: 13px; font-weight: 700; fill: #ef4444; letter-spacing: 0.1em;"
            >DATA</text>
            <text v-if="teamFilters.data || editMode"
              x="170" :y="haloLabelY + 16" text-anchor="middle"
              style="font-size: 11px; fill: #94a3b8; letter-spacing: 0.04em;"
            >(Validation)</text>
          </g>

          <!-- Edges -->
          <g>
            <g v-for="edge in visibleEdges" :key="edge.id">
              <!-- Invisible wide hit area for clicking in edit mode -->
              <path
                v-if="editMode"
                :d="edgePath(edge)"
                fill="none" stroke="transparent" stroke-width="16"
                class="cursor-pointer"
                @click.stop="openEdgePanel(edge)"
              />
              <!-- Visible edge -->
              <path
                :d="edgePath(edge)"
                fill="none"
                :stroke="edgeStrokeColor(edge)"
                :stroke-width="edge.strength === 'strong' ? 2.5 : 1.5"
                :stroke-dasharray="edgeDasharray(edge)"
                :stroke-opacity="edgeOpacity(edge)"
                :class="{ 'edge-animated': connectedEdgeIds.has(edge.id) }"
                style="transition: stroke-opacity 0.3s, stroke 0.3s; pointer-events: none;"
              />
            </g>
          </g>

          <!-- KPI nodes -->
          <g>
            <g
              v-for="node in visibleNodes"
              :key="node.id"
              :transform="`translate(${node.cx}, ${node.cy})`"
              :class="[
                'cursor-pointer',
                connectMode && connectSource?.id === node.id ? 'connect-source' : ''
              ]"
              @mouseenter="handleNodeHover(node)"
              @mouseleave="handleNodeLeave(node)"
              @click.stop="handleNodeClick(node)"
            >
              <!-- Connect-source pulse ring -->
              <circle
                v-if="connectSource?.id === node.id"
                r="38" fill="none"
                stroke="#10b981" stroke-width="2" stroke-opacity="0.7"
                class="connect-pulse"
              />

              <!-- Glow ring -->
              <circle r="36" :fill="TEAM_COLORS[node.team].hex"
                :fill-opacity="nodeGlowOpacity(node)"
                style="transition: fill-opacity 0.25s;"
              />

              <!-- Main circle -->
              <circle r="26"
                :fill="TEAM_COLORS[node.team].light"
                :fill-opacity="nodeFillOpacity(node)"
                :stroke="TEAM_COLORS[node.team].hex"
                :stroke-width="isNodeActive(node) ? 3 : 1.5"
                :stroke-opacity="nodeStrokeOpacity(node)"
                :stroke-dasharray="node.team === 'data' ? '4 2' : 'none'"
                style="transition: fill-opacity 0.25s, stroke-opacity 0.25s, stroke-width 0.2s;"
              />

              <!-- Node ID -->
              <text text-anchor="middle" dominant-baseline="central"
                :fill="TEAM_COLORS[node.team].hex"
                style="font-size: 12px; font-weight: 800;"
              >{{ node.id }}</text>

              <!-- Edit mode pencil dot -->
              <circle v-if="editMode" cx="18" cy="-18" r="7" fill="#f97316" fill-opacity="0.9" />
              <text v-if="editMode" x="18" y="-14" text-anchor="middle"
                style="font-size: 9px; fill: white; font-weight: 700;">✎</text>

              <!-- KPI label -->
              <text text-anchor="middle" :fill-opacity="nodeFillOpacity(node)" style="transition: fill-opacity 0.25s;">
                <tspan x="0" dy="36" style="font-size: 11px; fill: #475569; font-weight: 500;">{{ nodeLabelLine1(node) }}</tspan>
                <tspan x="0" dy="13" style="font-size: 11px; fill: #475569; font-weight: 500;">{{ nodeLabelLine2(node) }}</tspan>
              </text>
            </g>
          </g>
        </svg>

        <!-- ── View tooltip (hover/click info, non-edit mode) ── -->
        <Transition name="tooltip-fade">
          <div
            v-if="!editMode && tooltip.visible && activeNode"
            class="absolute z-20 pointer-events-none"
            :style="tooltipStyle"
          >
            <div class="bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-48">
              <div class="flex items-center gap-1.5 mb-1.5">
                <span class="inline-block w-2 h-2 rounded-full flex-none"
                  :style="{ backgroundColor: TEAM_COLORS[activeNode.team].hex }"></span>
                <span class="text-[10px] font-bold uppercase tracking-widest"
                  :style="{ color: TEAM_COLORS[activeNode.team].hex }">{{ activeNode.team }}</span>
                <span class="ml-auto text-[10px] text-slate-300 font-mono font-bold">{{ activeNode.id }}</span>
              </div>
              <p class="text-xs font-semibold text-slate-900 leading-snug">{{ activeNode.label }}</p>
              <p v-if="activeNode.sublabel" class="text-[10px] text-slate-400 mt-0.5">{{ activeNode.sublabel }}</p>
              <p class="text-[10px] text-slate-500 leading-relaxed mt-1.5">{{ activeNode.description }}</p>
              <div v-if="connectedNodeIds.size > 0" class="mt-2 pt-2 border-t border-slate-100">
                <p class="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Connects to</p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="cid in connectedNodeIds" :key="cid"
                    class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono"
                    :style="{ backgroundColor: TEAM_COLORS[nodeMap[cid]?.team]?.light, color: TEAM_COLORS[nodeMap[cid]?.team]?.hex }"
                  >{{ cid }}</span>
                </div>
              </div>
              <p v-if="!lockedNodeId" class="text-[9px] text-slate-300 mt-2">Click to lock · click canvas to clear</p>
              <p v-else class="text-[9px] text-slate-400 mt-2 font-medium">Locked — click canvas to release</p>
            </div>
          </div>
        </Transition>

        <!-- ── Edit panel (slide in from right) ── -->
        <Transition name="panel-slide">
          <div
            v-if="editMode && editPanel.open"
            class="absolute top-0 right-0 h-full w-72 bg-white border-l border-slate-200 shadow-xl z-30 flex flex-col overflow-y-auto"
          >
            <!-- Panel header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span class="text-sm font-semibold text-slate-800">
                {{ panelTitle }}
              </span>
              <button @click="closePanel" class="p-1 rounded hover:bg-slate-100 text-slate-400">
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Node edit form -->
            <div v-if="editPanel.type === 'node' || editPanel.type === 'new-node'" class="p-4 space-y-4 flex-1">
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Team</label>
                <select v-model="editPanel.data.team"
                  class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="program">Program</option>
                  <option value="structure">Structure</option>
                  <option value="data">Data</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Label</label>
                <input v-model="editPanel.data.label" type="text"
                  class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="KPI name" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Sublabel <span class="text-slate-300 font-normal">(optional)</span></label>
                <input v-model="editPanel.data.sublabel" type="text"
                  class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="e.g. m² / use" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                <textarea v-model="editPanel.data.description" rows="4"
                  class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  placeholder="Explain what this KPI measures…"></textarea>
              </div>
            </div>

            <!-- Edge edit form -->
            <div v-if="editPanel.type === 'edge' || editPanel.type === 'new-edge'" class="p-4 space-y-4 flex-1">
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-2">Connection</label>
                <div class="flex items-center gap-2 text-sm text-slate-700">
                  <span class="px-2 py-0.5 rounded-full font-mono font-bold text-xs"
                    :style="{ backgroundColor: TEAM_COLORS[nodeMap[editPanel.data.source_id || editPanel.data.source?.id]?.team]?.light, color: TEAM_COLORS[nodeMap[editPanel.data.source_id || editPanel.data.source?.id]?.team]?.hex }">
                    {{ editPanel.data.source_id || editPanel.data.source?.id }}
                  </span>
                  <span class="text-slate-400">→</span>
                  <span class="px-2 py-0.5 rounded-full font-mono font-bold text-xs"
                    :style="{ backgroundColor: TEAM_COLORS[nodeMap[editPanel.data.target_id || editPanel.data.target?.id]?.team]?.light, color: TEAM_COLORS[nodeMap[editPanel.data.target_id || editPanel.data.target?.id]?.team]?.hex }">
                    {{ editPanel.data.target_id || editPanel.data.target?.id }}
                  </span>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-2">Strength</label>
                <div class="flex gap-2">
                  <button @click="editPanel.data.strength = 'strong'"
                    :class="['flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors',
                      editPanel.data.strength === 'strong'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50']">
                    Strong
                  </button>
                  <button @click="editPanel.data.strength = 'medium'"
                    :class="['flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors',
                      editPanel.data.strength === 'medium'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50']">
                    Medium
                  </button>
                </div>
              </div>
            </div>

            <!-- Panel actions -->
            <div class="px-4 py-3 border-t border-slate-100 space-y-2">
              <button
                @click="savePanel"
                :disabled="saving"
                class="w-full py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {{ saving ? 'Saving…' : 'Save' }}
              </button>
              <button
                v-if="editPanel.type === 'node'"
                @click="deleteNode"
                :disabled="saving"
                class="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Delete KPI Node
              </button>
              <button
                v-if="editPanel.type === 'edge'"
                @click="deleteEdge"
                :disabled="saving"
                class="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Delete Connection
              </button>
            </div>
          </div>
        </Transition>
      </div>

    </main>
  </AppShell>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import AppShell from '@/components/AppShell.vue'
import { Pencil, X, Plus, Link2 } from 'lucide-vue-next'

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Reactive state ───────────────────────────────────────────────────────────

// Data (loaded from API)
const nodes   = ref([])
const edges   = ref([])
const loading = ref(true)
const saveError = ref(null)

// View filters
const teamFilters    = reactive({ program: true, structure: true, data: true })
const connectionMode = ref('all')
const hoveredNodeId  = ref(null)
const lockedNodeId   = ref(null)
const tooltip        = reactive({ visible: false, nodeId: null })

// Edit mode
const editMode      = ref(false)
const editPanel     = reactive({ open: false, type: null, data: {} })
const connectMode   = ref(false)
const connectSource = ref(null)
const saving        = ref(false)

// Refs
const svgRef       = ref(null)
const containerRef = ref(null)

// ─── Fetch on mount ───────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    const res = await fetch('/api/kpi-map')
    const data = await res.json()
    nodes.value = data.nodes
    edges.value = data.edges
  } catch (e) {
    saveError.value = 'Failed to load KPI map'
  } finally {
    loading.value = false
  }
})

// ─── Computed ─────────────────────────────────────────────────────────────────

const nodeMap = computed(() => Object.fromEntries(nodes.value.map(n => [n.id, n])))

const visibleNodes = computed(() =>
  editMode.value
    ? nodes.value  // show all in edit mode
    : nodes.value.filter(n => teamFilters[n.team])
)

const visibleEdges = computed(() => {
  return edges.value.filter(edge => {
    const src = nodeMap.value[edge.source_id]
    const tgt = nodeMap.value[edge.target_id]
    if (!src || !tgt) return false
    if (editMode.value) return true  // show all edges in edit mode
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
    if (e.source_id === activeNodeId.value) ids.add(e.target_id)
    if (e.target_id === activeNodeId.value) ids.add(e.source_id)
  }
  return ids
})

const connectedEdgeIds = computed(() => {
  if (!activeNodeId.value) return new Set()
  return new Set(
    visibleEdges.value
      .filter(e => e.source_id === activeNodeId.value || e.target_id === activeNodeId.value)
      .map(e => e.id)
  )
})

// Dynamic viewBox: 960-wide for a slight scale-down; grows downward for extra nodes
const maxNodeCy = computed(() => nodes.value.reduce((m, n) => Math.max(m, n.cy), 396))
const dynamicViewBox = computed(() => `0 0 960 ${Math.max(560, maxNodeCy.value + 150)}`)

// Halo ring and label Y positions — vertically centred on the node column
const haloCy     = computed(() => (140 + maxNodeCy.value) / 2)
const haloLabelY = computed(() => maxNodeCy.value + 90)

const tooltipStyle = computed(() => {
  if (!activeNode.value) return { display: 'none' }
  const svg = svgRef.value
  const container = containerRef.value
  if (!svg || !container) return { display: 'none' }

  // Use SVG's CTM to convert viewBox coords → screen coords → container-relative px.
  // This correctly handles preserveAspectRatio letterboxing for edge columns (D2, S2).
  const pt = svg.createSVGPoint()
  pt.x = activeNode.value.cx
  pt.y = activeNode.value.cy
  const ctm = svg.getScreenCTM()
  if (!ctm) return { display: 'none' }
  const screenPt = pt.matrixTransform(ctm)
  const containerRect = container.getBoundingClientRect()
  const nodeX = screenPt.x - containerRect.left
  const nodeY = screenPt.y - containerRect.top

  // Clamp horizontally so the 192px (w-48) card never overflows the container
  const halfCard = 96
  const clampedX = Math.min(Math.max(nodeX, halfCard + 8), containerRect.width - halfCard - 8)

  const showBelow = nodeY / containerRect.height < 0.28

  return {
    left:      `${clampedX}px`,
    top:       `${nodeY}px`,
    transform: showBelow
      ? 'translate(-50%, 32px)'
      : 'translate(-50%, calc(-100% - 18px))',
  }
})

const panelTitle = computed(() => {
  const t = editPanel.type
  if (t === 'node')     return `Edit KPI — ${editPanel.data.id}`
  if (t === 'new-node') return 'Add New KPI Node'
  if (t === 'edge')     return 'Edit Connection'
  if (t === 'new-edge') return 'New Connection'
  return ''
})

// ─── View interactions ────────────────────────────────────────────────────────

function handleNodeHover(node) {
  if (editMode.value) return
  hoveredNodeId.value = node.id
  tooltip.visible = true
}

function handleNodeLeave(node) {
  if (editMode.value) return
  if (lockedNodeId.value !== node.id) hoveredNodeId.value = null
  if (!lockedNodeId.value) { tooltip.visible = false; tooltip.nodeId = null }
}

function handleNodeClick(node) {
  if (editMode.value) {
    if (connectMode.value) {
      if (!connectSource.value) {
        connectSource.value = node
      } else if (connectSource.value.id !== node.id) {
        editPanel.type = 'new-edge'
        editPanel.data = { source: connectSource.value, target: node, strength: 'strong' }
        editPanel.open = true
        connectSource.value = null
        connectMode.value = false
      }
    } else {
      editPanel.type = 'node'
      editPanel.data = { ...node }
      editPanel.open = true
    }
    return
  }
  // Non-edit: lock/highlight
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

function openEdgePanel(edge) {
  if (!editMode.value) return
  editPanel.type = 'edge'
  editPanel.data = { ...edge }
  editPanel.open = true
}

function clearLock() {
  if (editMode.value) { closePanel(); return }
  lockedNodeId.value = null
  hoveredNodeId.value = null
  tooltip.visible = false
}

// ─── Edit mode ────────────────────────────────────────────────────────────────

function toggleEditMode() {
  editMode.value = !editMode.value
  if (!editMode.value) {
    closePanel()
    connectMode.value = false
    connectSource.value = null
  }
  // Clear any view-mode selection
  lockedNodeId.value = null
  hoveredNodeId.value = null
  tooltip.visible = false
}

function toggleConnectMode() {
  connectMode.value = !connectMode.value
  connectSource.value = null
  if (connectMode.value) closePanel()
}

function openNewNodePanel() {
  connectMode.value = false
  connectSource.value = null
  editPanel.type = 'new-node'
  editPanel.data = { team: 'program', label: '', sublabel: '', description: '' }
  editPanel.open = true
}

function closePanel() {
  editPanel.open = false
  editPanel.type = null
  editPanel.data = {}
}

// ─── API save / delete ────────────────────────────────────────────────────────

async function savePanel() {
  saving.value = true
  saveError.value = null
  try {
    if (editPanel.type === 'node') {
      const res = await fetch(`/api/kpi-map/nodes/${editPanel.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label:       editPanel.data.label,
          sublabel:    editPanel.data.sublabel,
          description: editPanel.data.description,
          team:        editPanel.data.team,
        }),
      })
      const updated = await res.json()
      const idx = nodes.value.findIndex(n => n.id === updated.id)
      if (idx !== -1) nodes.value[idx] = updated
    } else if (editPanel.type === 'new-node') {
      const res = await fetch('/api/kpi-map/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPanel.data),
      })
      const created = await res.json()
      nodes.value.push(created)
    } else if (editPanel.type === 'edge') {
      const res = await fetch(`/api/kpi-map/edges/${editPanel.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strength: editPanel.data.strength }),
      })
      const updated = await res.json()
      const idx = edges.value.findIndex(e => e.id === updated.id)
      if (idx !== -1) edges.value[idx] = updated
    } else if (editPanel.type === 'new-edge') {
      const res = await fetch('/api/kpi-map/edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_id: editPanel.data.source.id,
          target_id: editPanel.data.target.id,
          strength:  editPanel.data.strength,
        }),
      })
      const created = await res.json()
      edges.value.push(created)
    }
    closePanel()
  } catch (e) {
    saveError.value = 'Save failed — check connection'
  } finally {
    saving.value = false
  }
}

async function deleteNode() {
  if (!confirm(`Delete KPI node "${editPanel.data.label}"? Its connections will also be removed.`)) return
  saving.value = true
  try {
    await fetch(`/api/kpi-map/nodes/${editPanel.data.id}`, { method: 'DELETE' })
    nodes.value = nodes.value.filter(n => n.id !== editPanel.data.id)
    edges.value = edges.value.filter(e => e.source_id !== editPanel.data.id && e.target_id !== editPanel.data.id)
    closePanel()
  } catch (e) {
    saveError.value = 'Delete failed'
  } finally {
    saving.value = false
  }
}

async function deleteEdge() {
  if (!confirm('Remove this connection?')) return
  saving.value = true
  try {
    await fetch(`/api/kpi-map/edges/${editPanel.data.id}`, { method: 'DELETE' })
    edges.value = edges.value.filter(e => e.id !== editPanel.data.id)
    closePanel()
  } catch (e) {
    saveError.value = 'Delete failed'
  } finally {
    saving.value = false
  }
}

// ─── SVG helpers ─────────────────────────────────────────────────────────────

function edgePath(edge) {
  const src = nodeMap.value[edge.source_id]
  const tgt = nodeMap.value[edge.target_id]
  if (!src || !tgt) return ''
  const x1 = src.cx, y1 = src.cy, x2 = tgt.cx, y2 = tgt.cy

  if (edge.type === 'within') {
    const bowX = x1 >= 450 ? x1 + 80 : x1 - 80
    return `M ${x1} ${y1} Q ${bowX} ${(y1 + y2) / 2} ${x2} ${y2}`
  }
  const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return `M ${x1} ${y1} Q ${midX + (-dy / len) * 45} ${midY + (dx / len) * 45} ${x2} ${y2}`
}

function edgeDasharray(edge) {
  if (connectedEdgeIds.value.has(edge.id)) return '12 4'
  return edge.strength === 'medium' ? '8 4' : 'none'
}

function edgeStrokeColor(edge) {
  if (editMode.value) return '#cbd5e1'
  if (connectedEdgeIds.value.has(edge.id)) return TEAM_COLORS[nodeMap.value[edge.source_id]?.team]?.hex || '#94a3b8'
  return '#cbd5e1'
}

function edgeOpacity(edge) {
  if (editMode.value) return 0.5
  if (!activeNodeId.value) return 0.5
  return connectedEdgeIds.value.has(edge.id) ? 1 : 0.07
}

function isNodeActive(node) { return activeNodeId.value === node.id }

function nodeGlowOpacity(node) {
  if (editMode.value) return 0
  if (!activeNodeId.value) return 0
  if (isNodeActive(node)) return 0.2
  if (connectedNodeIds.value.has(node.id)) return 0.1
  return 0
}

function nodeFillOpacity(node) {
  if (editMode.value) return 0.9
  if (!activeNodeId.value) return 0.9
  return (isNodeActive(node) || connectedNodeIds.value.has(node.id)) ? 1 : 0.2
}

function nodeStrokeOpacity(node) {
  if (editMode.value) return 0.7
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
.edge-animated { animation: dash-flow 1.2s linear infinite; }

@keyframes connect-pulse {
  0%, 100% { opacity: 0.7; r: 36; }
  50%       { opacity: 0.3; r: 42; }
}
.connect-pulse { animation: connect-pulse 1s ease-in-out infinite; }

.tooltip-fade-enter-active,
.tooltip-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.tooltip-fade-enter-from,
.tooltip-fade-leave-to { opacity: 0; transform: translate(-50%, calc(-100% - 10px)); }

.panel-slide-enter-active,
.panel-slide-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
.panel-slide-enter-from,
.panel-slide-leave-to { transform: translateX(100%); opacity: 0; }
</style>
