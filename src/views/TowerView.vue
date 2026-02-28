<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">

    <!-- ── HERO ─────────────────────────────────────────────── -->
    <section class="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">

      <!-- Back link -->
      <router-link
        to="/"
        class="absolute top-6 left-6 text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
      >
        ← Login
      </router-link>

      <!-- Blob cluster -->
      <div class="relative w-72 h-72 mb-12">
        <!-- Structure blob — green, top-left -->
        <div class="blob blob-moderate absolute"
          style="
            width: 160px; height: 160px;
            top: 0; left: 0;
            animation-duration: 7s;
            background: linear-gradient(135deg, #6ee7b7 0%, #10b981 60%, #059669 100%);
            opacity: 0.75;
          "
        />
        <!-- Program blob — blue, top-right -->
        <div class="blob blob-complex absolute"
          style="
            width: 140px; height: 140px;
            top: 20px; right: 0;
            animation-duration: 9s;
            background: linear-gradient(135deg, #93c5fd 0%, #3b82f6 60%, #2563eb 100%);
            opacity: 0.70;
          "
        />
        <!-- Data blob — red, bottom-center -->
        <div class="blob blob-simple absolute"
          style="
            width: 120px; height: 120px;
            bottom: 0; left: 50%; transform: translateX(-50%);
            animation-duration: 11s;
            background: linear-gradient(135deg, #fca5a5 0%, #ef4444 60%, #dc2626 100%);
            opacity: 0.65;
          "
        />
      </div>

      <!-- Title -->
      <div class="text-center z-10">
        <h1 class="text-6xl font-bold text-slate-900 tracking-tight mb-3">
          HB01 — The Lungs
        </h1>
        <p class="text-xl text-slate-500 mb-6">A hyperbuilding studio project</p>
        <span class="inline-block text-xs font-medium tracking-widest uppercase text-slate-400 bg-slate-100 rounded-full px-4 py-1.5">
          Santiago, Chile &nbsp;·&nbsp; Conceptual Design &nbsp;·&nbsp; MACAD 2026
        </span>
      </div>

      <!-- Scroll cue -->
      <div class="absolute bottom-8 flex flex-col items-center gap-1 text-slate-300">
        <span class="text-xs tracking-widest uppercase">Scroll</span>
        <div class="w-px h-8 bg-slate-200"></div>
      </div>
    </section>

    <!-- ── DESIGN CONCEPT ────────────────────────────────────── -->
    <section class="py-32 px-6">
      <div class="max-w-3xl mx-auto text-center">

        <!-- Tricolor blob -->
        <div class="blob blob-extreme mx-auto mb-16"
          style="
            width: 200px; height: 200px;
            animation-duration: 13s;
            background: linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #ef4444 100%);
            opacity: 0.55;
          "
        />

        <h2 class="text-4xl font-bold text-slate-900 mb-8">A Building that Breathes</h2>
        <p class="text-lg text-slate-500 leading-relaxed mb-6">
          The Lungs is a conceptual hyperbuilding designed around a single biological analogy:
          the tower breathes. Every structural decision, spatial choice, and data flow mirrors
          the rhythm of a respiratory system — intake, distribution, and release.
        </p>
        <p class="text-lg text-slate-500 leading-relaxed">
          Three disciplines — Structure, Program, and Data — act as the organs of a single
          living body. Their interdependencies are not constraints; they are the architecture.
          The building performs as a unified organism.
        </p>
      </div>
    </section>

    <!-- ── THREE SYSTEMS ─────────────────────────────────────── -->
    <section class="py-24 px-6 bg-slate-50">
      <div class="max-w-5xl mx-auto">

        <h2 class="text-4xl font-bold text-slate-900 text-center mb-4">Three Systems. One Tower.</h2>
        <p class="text-slate-400 text-center mb-16 text-sm tracking-wide uppercase">Structure · Program · Data</p>

        <!-- ── STRUCTURE CARD ── -->
        <div class="bg-white rounded-2xl p-8 md:p-10 mb-8 shadow-sm">
          <div class="flex items-center gap-4 mb-10">
            <div class="blob blob-moderate flex-shrink-0"
              style="width:52px;height:52px;animation-duration:8s;background:linear-gradient(135deg,#6ee7b7 0%,#10b981 60%,#059669 100%);opacity:0.9;"
            />
            <div>
              <h3 class="text-xl font-bold text-slate-800">Structure</h3>
              <p class="text-sm text-slate-400">Engineering and structural systems</p>
            </div>
          </div>

          <!-- 4-step concept sequence -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">

            <!-- 00 - Biological Inspiration -->
            <div class="flex flex-col gap-3">
              <div class="w-full aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                <svg viewBox="0 0 64 64" class="w-20 h-20" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M32 58 L32 38" />
                  <path d="M32 38 L18 24 M32 38 L46 24" />
                  <path d="M18 24 L10 14 M18 24 L24 14" />
                  <path d="M46 24 L40 14 M46 24 L54 14" />
                  <path d="M10 14 L7 8 M10 14 L13 9" />
                  <path d="M24 14 L21 8 M24 14 L27 9" />
                  <path d="M40 14 L37 8 M40 14 L43 9" />
                  <path d="M54 14 L51 8 M54 14 L57 9" />
                </svg>
              </div>
              <p class="text-xs font-mono text-slate-300">00</p>
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider leading-tight">Biological Inspiration</p>
              <p class="text-xs text-slate-400 leading-relaxed">The Bronchioles</p>
            </div>

            <!-- 01 - Porous Structural Core -->
            <div class="flex flex-col gap-3">
              <div class="w-full aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                <svg viewBox="0 0 64 64" class="w-20 h-20" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round">
                  <rect x="12" y="6" width="40" height="52" rx="3" />
                  <ellipse cx="24" cy="20" rx="5" ry="6" />
                  <ellipse cx="40" cy="20" rx="5" ry="6" />
                  <circle cx="32" cy="34" r="5" />
                  <ellipse cx="21" cy="46" rx="4" ry="5" />
                  <ellipse cx="43" cy="46" rx="4" ry="5" />
                </svg>
              </div>
              <p class="text-xs font-mono text-slate-300">01</p>
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider leading-tight">Porous Structural Core</p>
              <p class="text-xs text-slate-400 leading-relaxed">Voronoi-based load distribution</p>
            </div>

            <!-- 02 - Program Massing Integration -->
            <div class="flex flex-col gap-3">
              <div class="w-full aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                <svg viewBox="0 0 64 64" class="w-20 h-20" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="27" y="6" width="10" height="52" rx="2" />
                  <rect x="6" y="10" width="16" height="18" rx="3" />
                  <line x1="22" y1="19" x2="27" y2="19" />
                  <rect x="6" y="34" width="16" height="14" rx="3" />
                  <line x1="22" y1="41" x2="27" y2="41" />
                  <rect x="42" y="14" width="16" height="14" rx="3" />
                  <line x1="37" y1="21" x2="42" y2="21" />
                  <rect x="42" y="34" width="16" height="18" rx="3" />
                  <line x1="37" y1="43" x2="42" y2="43" />
                </svg>
              </div>
              <p class="text-xs font-mono text-slate-300">02</p>
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider leading-tight">Program Massing Integration</p>
              <p class="text-xs text-slate-400 leading-relaxed">Capsule volumes attached to core</p>
            </div>

            <!-- 03 - Functional Airflow System -->
            <div class="flex flex-col gap-3">
              <div class="w-full aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                <svg viewBox="0 0 64 64" class="w-20 h-20" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="27" y="6" width="10" height="52" rx="2" />
                  <rect x="6" y="10" width="16" height="18" rx="3" />
                  <line x1="22" y1="19" x2="27" y2="19" />
                  <rect x="6" y="34" width="16" height="14" rx="3" />
                  <line x1="22" y1="41" x2="27" y2="41" />
                  <rect x="42" y="14" width="16" height="14" rx="3" />
                  <line x1="37" y1="21" x2="42" y2="21" />
                  <rect x="42" y="34" width="16" height="18" rx="3" />
                  <line x1="37" y1="43" x2="42" y2="43" />
                  <!-- dirty air arrows in -->
                  <path d="M1 22 L5 19" stroke-dasharray="2 2" />
                  <path d="M1 38 L5 35" stroke-dasharray="2 2" />
                  <path d="M63 22 L59 19" stroke-dasharray="2 2" />
                  <path d="M63 38 L59 35" stroke-dasharray="2 2" />
                  <!-- clean air arrows out top -->
                  <path d="M28 6 L26 2 M32 5 L32 1 M36 6 L38 2" />
                </svg>
              </div>
              <p class="text-xs font-mono text-slate-300">03</p>
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider leading-tight">Functional Airflow System</p>
              <p class="text-xs text-slate-400 leading-relaxed">Dirty air in · clean air out</p>
            </div>

          </div>
        </div>

        <!-- ── PROGRAM CARD ── -->
        <div class="bg-white rounded-2xl p-8 md:p-10 mb-8 shadow-sm">
          <div class="flex items-center gap-4 mb-10">
            <div class="blob blob-complex flex-shrink-0"
              style="width:52px;height:52px;animation-duration:10s;background:linear-gradient(135deg,#93c5fd 0%,#3b82f6 60%,#2563eb 100%);opacity:0.9;"
            />
            <div>
              <h3 class="text-xl font-bold text-slate-800">Program</h3>
              <p class="text-sm text-slate-400">Spatial planning and user experience</p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-12 items-start">

            <!-- Donut chart + legend -->
            <div class="flex flex-col items-center gap-6 flex-shrink-0">
              <svg viewBox="0 0 200 200" class="w-44 h-44" role="img" aria-label="Program mix by area">
                <g transform="rotate(-90, 100, 100)">
                  <circle v-for="seg in donutSegments" :key="seg.label"
                    cx="100" cy="100" r="65" fill="none"
                    :stroke="seg.color" stroke-width="30"
                    :stroke-dasharray="`${seg.length.toFixed(2)} 408.41`"
                    :stroke-dashoffset="seg.offset.toFixed(2)"
                  />
                </g>
              </svg>
              <div class="grid grid-cols-2 gap-x-5 gap-y-1.5">
                <div v-for="seg in donutSegments" :key="seg.label" class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: seg.color }" />
                  <span class="text-xs text-slate-500">{{ seg.label }}</span>
                </div>
              </div>
            </div>

            <!-- Bar chart + total -->
            <div class="flex-1 w-full">
              <svg viewBox="0 0 260 185" class="w-full max-w-xs" role="img" aria-label="Area by building component">
                <!-- Subtle gridlines -->
                <line x1="0" y1="35"  x2="260" y2="35"  stroke="#f1f5f9" stroke-width="1"/>
                <line x1="0" y1="75"  x2="260" y2="75"  stroke="#f1f5f9" stroke-width="1"/>
                <line x1="0" y1="115" x2="260" y2="115" stroke="#f1f5f9" stroke-width="1"/>
                <line x1="0" y1="155" x2="260" y2="155" stroke="#f1f5f9" stroke-width="1"/>
                <!-- Bars -->
                <rect v-for="bar in barData" :key="bar.label"
                  :x="bar.x" :y="bar.y" :width="bar.w" :height="bar.h"
                  :fill="bar.color" rx="3"
                />
                <!-- Value labels above bars -->
                <text v-for="bar in barData" :key="bar.label + '-v'"
                  :x="bar.x + bar.w / 2" :y="bar.y - 5"
                  text-anchor="middle" font-size="9" fill="#94a3b8" font-family="system-ui,sans-serif"
                >{{ bar.shortVal }}</text>
                <!-- X-axis labels -->
                <text v-for="bar in barData" :key="bar.label + '-l'"
                  :x="bar.x + bar.w / 2" :y="180"
                  text-anchor="middle" font-size="9" fill="#cbd5e1" font-family="system-ui,sans-serif"
                >{{ bar.label }}</text>
              </svg>
              <div class="mt-6">
                <p class="text-3xl font-bold text-slate-800">1,002,013,509</p>
                <p class="text-xs text-slate-400 uppercase tracking-widest mt-1">Total 2D Area · m²</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── DATA CARD ── -->
        <div class="bg-white rounded-2xl p-8 md:p-10 shadow-sm">
          <div class="flex items-center gap-4 mb-10">
            <div class="blob blob-simple flex-shrink-0"
              style="width:52px;height:52px;animation-duration:12s;background:linear-gradient(135deg,#fca5a5 0%,#ef4444 60%,#dc2626 100%);opacity:0.9;"
            />
            <div>
              <h3 class="text-xl font-bold text-slate-800">Data</h3>
              <p class="text-sm text-slate-400">Analytics and performance optimization</p>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">
            <div v-for="kpi in kpiStats" :key="kpi.label">
              <p class="text-4xl font-bold text-slate-900 tracking-tight">{{ kpi.value }}</p>
              <p class="text-xs font-medium text-slate-500 mt-1">{{ kpi.unit }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ kpi.label }}</p>
              <p class="text-xs text-emerald-500 mt-2">{{ kpi.trend }}</p>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ── LOCATION & CONTEXT ─────────────────────────────────── -->
    <section class="py-32 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-12">

          <!-- Left: location -->
          <div>
            <p class="text-xs font-medium tracking-widest uppercase text-slate-400 mb-3">Location</p>
            <h2 class="text-5xl font-bold text-slate-900 leading-tight mb-2">Santiago,<br>Chile</h2>
            <p class="text-slate-400 text-sm mt-3">Conceptual Design &nbsp;·&nbsp; 2026</p>
          </div>

          <!-- Divider blob -->
          <div class="blob blob-simple hidden md:block"
            style="
              width: 80px; height: 80px;
              flex-shrink: 0;
              animation-duration: 15s;
              background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
              opacity: 0.6;
            "
          />

          <!-- Right: credits -->
          <div class="md:text-right">
            <p class="text-xs font-medium tracking-widest uppercase text-slate-400 mb-3">Studio</p>
            <p class="text-2xl font-semibold text-slate-700 leading-snug">
              MACAD at IAAC
            </p>
            <p class="text-slate-400 text-sm mt-2">Master in Advanced Computation<br>for Architecture and Design</p>
            <p class="text-slate-400 text-sm mt-3">Hyperbuilding HB01</p>
          </div>

        </div>
      </div>
    </section>

    <!-- ── FOOTER ─────────────────────────────────────────────── -->
    <footer class="py-12 border-t border-slate-100 text-center">
      <router-link
        to="/"
        class="text-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        → Sign in to the studio platform
      </router-link>
    </footer>

  </div>
</template>

<script setup>
// ── Donut chart — circumference = 2·π·65 ≈ 408.41 ──────────
const CIRC = 408.41
const rawProgram = [
  { label: 'core',             pct: 43, color: '#3b82f6' },
  { label: 'residential',      pct: 16, color: '#4ade80' },
  { label: 'car parking',      pct: 13, color: '#facc15' },
  { label: 'offices',          pct:  9, color: '#f87171' },
  { label: 'hotel',            pct:  6, color: '#7dd3fc' },
  { label: 'laboratory',       pct:  5, color: '#2dd4bf' },
  { label: 'MEP & parking',    pct:  4, color: '#fb923c' },
  { label: 'sky amenities',    pct:  2, color: '#86efac' },
  { label: 'public amenities', pct:  2, color: '#f9a8d4' },
]
let _cum = 0
const donutSegments = rawProgram.map(seg => {
  const length = (seg.pct / 100) * CIRC
  const offset = CIRC - _cum
  _cum += length
  return { ...seg, length, offset }
})

// ── Bar chart ────────────────────────────────────────────────
const BAR_MAX    = 397011028
const BAR_BOTTOM = 155
const BAR_HEIGHT = 120
const barData = [
  { label: 'Core',    val: 397011028, shortVal: '397M', color: '#3b82f6', x: 10,  w: 52 },
  { label: 'Capsule', val: 236332957, shortVal: '236M', color: '#4ade80', x: 75,  w: 52 },
  { label: 'Podium',  val: 230418453, shortVal: '230M', color: '#facc15', x: 140, w: 52 },
  { label: 'Bridge',  val: 138251072, shortVal: '138M', color: '#f87171', x: 205, w: 52 },
].map(b => {
  const h = Math.round((b.val / BAR_MAX) * BAR_HEIGHT)
  return { ...b, h, y: BAR_BOTTOM - h }
})

// ── KPI stats ────────────────────────────────────────────────
const kpiStats = [
  { value: '342',   unit: 'kgCO₂e / m²',      label: 'Embodied Carbon',        trend: '↓ 14.5% below target' },
  { value: '4.2%',  unit: 'Daylight Factor',   label: 'Adequate daylight coverage', trend: '↑ 40% above target'  },
  { value: '87',    unit: 'kWh / m² / yr',     label: 'Energy Intensity',       trend: '↓ 13% below target'  },
  { value: '92%',   unit: 'Structural Efficiency', label: 'Material optimization', trend: '↑ 8% above target'  },
  { value: '42.5',  unit: 'm³ / min',          label: 'Natural Ventilation',    trend: '↑ 21% above target'  },
  { value: '87%',   unit: 'Overall Health',    label: 'Project performance',    trend: '↑ On track'           },
]
</script>

<style scoped>
.blob {
  border-radius: 50%;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.blob-simple {
  animation-name: morph-simple;
}
@keyframes morph-simple {
  0%, 100% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; }
  25%       { border-radius: 55% 45% 50% 50% / 50% 55% 45% 50%; }
  50%       { border-radius: 50% 50% 45% 55% / 50% 50% 50% 50%; }
  75%       { border-radius: 45% 55% 50% 50% / 55% 45% 50% 50%; }
}

.blob-moderate {
  animation-name: morph-moderate;
}
@keyframes morph-moderate {
  0%, 100% { border-radius: 60% 40% 55% 45% / 50% 55% 45% 50%; }
  20%       { border-radius: 45% 55% 60% 40% / 55% 50% 50% 45%; }
  40%       { border-radius: 55% 45% 40% 60% / 45% 60% 40% 55%; }
  60%       { border-radius: 40% 60% 50% 50% / 60% 40% 55% 45%; }
  80%       { border-radius: 50% 50% 45% 55% / 50% 55% 45% 60%; }
}

.blob-complex {
  animation-name: morph-complex;
}
@keyframes morph-complex {
  0%, 100% { border-radius: 65% 35% 70% 30% / 40% 60% 35% 65%; }
  16%       { border-radius: 35% 65% 40% 60% / 70% 30% 65% 35%; }
  33%       { border-radius: 60% 40% 35% 65% / 30% 70% 40% 60%; }
  50%       { border-radius: 40% 60% 65% 35% / 65% 35% 70% 30%; }
  66%       { border-radius: 70% 30% 60% 40% / 35% 65% 30% 70%; }
  83%       { border-radius: 30% 70% 40% 60% / 60% 40% 65% 35%; }
}

.blob-extreme {
  animation-name: morph-extreme;
}
@keyframes morph-extreme {
  0%, 100%  { border-radius: 73% 27% 80% 20% / 30% 75% 25% 70%; }
  12.5%     { border-radius: 25% 75% 35% 65% / 80% 20% 70% 30%; }
  25%       { border-radius: 70% 30% 25% 75% / 20% 80% 35% 65%; }
  37.5%     { border-radius: 35% 65% 73% 27% / 75% 25% 80% 20%; }
  50%       { border-radius: 80% 20% 65% 35% / 27% 73% 30% 70%; }
  62.5%     { border-radius: 20% 80% 30% 70% / 65% 35% 75% 25%; }
  75%       { border-radius: 75% 25% 70% 30% / 35% 65% 20% 80%; }
  87.5%     { border-radius: 30% 70% 20% 80% / 73% 27% 65% 35%; }
}
</style>
