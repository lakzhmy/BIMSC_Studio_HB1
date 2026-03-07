<template>
  <!-- Hint button: hidden on login/auth/profile pages -->
  <button
    v-if="showHintButton"
    class="fixed bottom-4 right-4 z-[9998] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-white shadow-sm transition-all select-none"
    @click="toggleAnnotations"
    title="Toggle page hints (Spacebar)"
  >
    <PenLine :size="13" />
    <span>Click here / Space for Hints</span>
  </button>

  <!-- Full-screen overlay teleported to body root -->
  <Teleport to="body">
    <Transition name="annotation-fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[9999] select-none cursor-pointer"
        style="background: rgba(0, 0, 0, 0.07);"
        @click="hideAnnotations"
      >
        <!--
          SVG is viewport-sized (fixed). All annotations are drawn inside <g>,
          which is offset by -scrollY so they track document positions as you scroll.
        -->
        <svg
          ref="svgRef"
          class="absolute inset-0 pointer-events-none"
          :width="vw"
          :height="vh"
          :viewBox="`0 0 ${vw} ${vh}`"
          xmlns="http://www.w3.org/2000/svg"
          style="width: 100%; height: 100%;"
        >
          <g ref="groupRef" />
        </svg>

        <!-- Dismiss hint (stays fixed in viewport) -->
        <div
          class="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none"
          style="font-family: 'Caveat', cursive; font-size: 1.05rem; font-style: italic; color: rgba(255,255,255,0.75); letter-spacing: 0.02em;"
        >
          Press Space or Esc to dismiss · click anywhere to close
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { PenLine } from 'lucide-vue-next'
import rough from 'roughjs'
import { useAnnotations } from '@/composables/useAnnotations'
import { annotations } from '@/data/annotationsData'

const { isVisible, toggleAnnotations, hideAnnotations } = useAnnotations()
const route = useRoute()
const svgRef = ref(null)
const groupRef = ref(null)

const showHintButton = computed(() =>
  !['login', 'auth-success', 'profile'].includes(route.name)
)

// Viewport dimensions (SVG size)
const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)

// Current scroll position — updated via passive scroll listener
let currentScrollY = window.scrollY

function updateSize() {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
  if (isVisible.value) drawAnnotations()
}

function updateScroll() {
  currentScrollY = window.scrollY
  // Shift the group without redrawing — very cheap
  if (groupRef.value) {
    groupRef.value.setAttribute('transform', `translate(0, ${-currentScrollY})`)
  }
}

onMounted(() => {
  window.addEventListener('resize', updateSize)
  window.addEventListener('scroll', updateScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
  window.removeEventListener('scroll', updateScroll)
})

// ─── Drawing ─────────────────────────────────────────────────────────────────
// Coordinate system:
//   x → fraction of window.innerWidth  (0..1)
//   y → fraction of document.documentElement.scrollHeight  (0..1, full document)
// The <g> transform compensates for scrollY so annotations track their elements.

function drawAnnotations() {
  const group = groupRef.value
  if (!group) return

  // Clear previous drawings
  while (group.firstChild) group.removeChild(group.firstChild)

  const routeAnnotations = annotations[route.name] ?? []
  const W = vw.value
  const DH = document.documentElement.scrollHeight

  if (!routeAnnotations.length) {
    // Place "no annotations" text in the center of the current viewport
    drawCenteredText(group, 'No annotations for this page yet.', W / 2, currentScrollY + vh.value / 2)
    group.setAttribute('transform', `translate(0, ${-currentScrollY})`)
    return
  }

  // rough.svg() needs the SVG element to create elements in the correct namespace
  const rc = rough.svg(svgRef.value)

  routeAnnotations.forEach((ann) => {
    const opts = {
      stroke: ann.color,
      strokeWidth: 2.2,
      roughness: 1.8,
      bowing: 1.5,
    }

    // Convert bezier: x = fraction of viewport width, y = fraction of document height
    const [[x1p, y1p], [cx1p, cy1p], [cx2p, cy2p], [x2p, y2p]] = ann.arrowPath
    const x1 = x1p * W,  y1 = y1p * DH
    const cx1 = cx1p * W, cy1 = cy1p * DH
    const cx2 = cx2p * W, cy2 = cy2p * DH
    const x2 = x2p * W,  y2 = y2p * DH

    // Arrow shaft
    const pathStr = `M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`
    group.appendChild(rc.path(pathStr, opts))

    // Arrowhead
    drawArrowhead(group, rc, x2, y2, cx2, cy2, opts)

    // Label box + text
    drawLabel(group, rc, ann.label, ann.labelAnchor, W, DH, ann.color)
  })

  // Apply current scroll offset to the group
  group.setAttribute('transform', `translate(0, ${-currentScrollY})`)
}

function drawArrowhead(group, rc, x2, y2, cx2, cy2, opts) {
  const dx = x2 - cx2
  const dy = y2 - cy2
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len, uy = dy / len
  const px = -uy, py = ux
  const headLen = 16
  const spread = 6

  group.appendChild(rc.line(
    x2, y2,
    x2 - ux * headLen + px * spread,
    y2 - uy * headLen + py * spread,
    { ...opts, roughness: 1.2 }
  ))
  group.appendChild(rc.line(
    x2, y2,
    x2 - ux * headLen - px * spread,
    y2 - uy * headLen - py * spread,
    { ...opts, roughness: 1.2 }
  ))
}

function drawLabel(group, rc, labelText, anchor, W, DH, color) {
  const lines = labelText.split('\n')
  const fontSize = 15
  const lineHeight = 22
  const padX = 12
  const padY = 10
  const boxW = 230
  const boxH = lines.length * lineHeight + padY * 2

  const bx = Math.min(anchor.x * W, W - boxW - 8)
  const by = anchor.y * DH  // no clamping vertically — it lives in document space

  // Sketchy white label box
  group.appendChild(rc.rectangle(bx, by, boxW, boxH, {
    stroke: color,
    strokeWidth: 1.8,
    roughness: 2.0,
    bowing: 0.5,
    fill: 'rgba(255,255,255,0.88)',
    fillStyle: 'solid',
  }))

  // Caveat italic text
  const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  textEl.setAttribute('x', bx + padX)
  textEl.setAttribute('y', by + padY + fontSize)
  textEl.setAttribute('font-family', "'Caveat', cursive")
  textEl.setAttribute('font-size', fontSize)
  textEl.setAttribute('font-style', 'italic')
  textEl.setAttribute('font-weight', '600')
  textEl.setAttribute('fill', color)

  lines.forEach((line, i) => {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    tspan.setAttribute('x', bx + padX)
    tspan.setAttribute('dy', i === 0 ? 0 : lineHeight)
    tspan.textContent = line
    textEl.appendChild(tspan)
  })

  group.appendChild(textEl)
}

function drawCenteredText(group, text, cx, cy) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  el.setAttribute('x', cx)
  el.setAttribute('y', cy)
  el.setAttribute('text-anchor', 'middle')
  el.setAttribute('font-family', "'Caveat', cursive")
  el.setAttribute('font-size', '22')
  el.setAttribute('font-style', 'italic')
  el.setAttribute('fill', '#c0392b')
  el.setAttribute('opacity', '0.7')
  el.textContent = text
  group.appendChild(el)
}

// ─── Reactivity ──────────────────────────────────────────────────────────────

watch(
  [isVisible, () => route.name, vw, vh],
  ([visible]) => {
    if (visible) {
      nextTick(() => document.fonts.ready.then(() => drawAnnotations()))
    }
  }
)
</script>

<style>
.annotation-fade-enter-active {
  animation: annotFadeIn 0.25s ease-out;
}
.annotation-fade-leave-active {
  animation: annotFadeIn 0.15s ease-in reverse;
}
@keyframes annotFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>
