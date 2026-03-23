<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">

    <!-- ── HERO ─────────────────────────────────────────────── -->
    <section id="tour-tower-hero" class="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">

      <router-link
        to="/"
        class="absolute top-6 left-6 text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 z-10"
      >
        ← Login
      </router-link>

      <!-- Blob cluster — each at a different parallax depth -->
      <div class="relative w-72 h-72 mb-12">
        <div
          class="blob blob-moderate absolute"
          :style="{
            width: '160px', height: '160px',
            top: '0', left: '0',
            animationDuration: '7s',
            background: 'linear-gradient(135deg, #6ee7b7 0%, #10b981 60%, #059669 100%)',
            opacity: 0.75,
            transform: `translateY(${scrollY * 0.04}px)`,
          }"
        />
        <div
          class="blob blob-complex absolute"
          :style="{
            width: '140px', height: '140px',
            top: '20px', right: '0',
            animationDuration: '9s',
            background: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 60%, #2563eb 100%)',
            opacity: 0.70,
            transform: `translateY(${scrollY * 0.07}px)`,
          }"
        />
        <div
          class="blob blob-simple absolute"
          :style="{
            width: '120px', height: '120px',
            bottom: '0', left: '50%',
            animationDuration: '11s',
            background: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 60%, #dc2626 100%)',
            opacity: 0.65,
            transform: `translateX(-50%) translateY(${scrollY * 0.10}px)`,
          }"
        />
      </div>

      <div id="tour-tower-title" class="text-center z-10">
        <h1 class="text-6xl font-bold text-slate-900 tracking-tight mb-3">
          HB01 — The Lungs
        </h1>
        <p class="text-xl text-slate-500 mb-6">A hyperbuilding studio project</p>
        <span class="inline-block text-xs font-medium tracking-widest uppercase text-slate-400 bg-slate-100 rounded-full px-4 py-1.5">
          Santiago, Chile &nbsp;·&nbsp; Conceptual Design &nbsp;·&nbsp; MACAD 2026
        </span>
      </div>

      <div class="absolute bottom-8 flex flex-col items-center gap-1 text-slate-300">
        <span class="text-xs tracking-widest uppercase">Scroll</span>
        <div class="w-px h-8 bg-slate-200"></div>
      </div>
    </section>

    <!-- ── DESIGN CONCEPT ────────────────────────────────────── -->
    <section id="tour-tower-concept" class="py-32 px-6">
      <div id="tour-tower-breathes" class="max-w-3xl mx-auto text-center">
        <div class="blob blob-extreme mx-auto mb-16"
          style="width:200px;height:200px;animation-duration:13s;background:linear-gradient(135deg,#10b981 0%,#3b82f6 50%,#ef4444 100%);opacity:0.55;"
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
    <section id="tour-tower-systems" class="py-24 px-6 bg-slate-50">
      <div class="max-w-5xl mx-auto">

        <h2 class="text-4xl font-bold text-slate-900 text-center mb-4">Three Systems. One Tower.</h2>
        <p class="text-slate-400 text-center mb-16 text-sm tracking-wide uppercase">Structure · Program · Data</p>

        <!-- ── STRUCTURE CARD ── -->
        <div id="tour-tower-structure" class="system-card bg-white rounded-2xl p-8 md:p-10 mb-8 shadow-sm">
          <div class="flex items-center gap-4 mb-10">
            <div class="blob blob-moderate card-blob flex-shrink-0"
              style="width:52px;height:52px;animation-duration:8s;background:linear-gradient(135deg,#6ee7b7 0%,#10b981 60%,#059669 100%);opacity:0.9;"
            />
            <div>
              <h3 class="text-xl font-bold text-slate-800">Structure</h3>
              <p class="text-sm text-slate-400">Engineering and structural systems</p>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">

            <!-- 00 - Biological Inspiration -->
            <div class="concept-step flex flex-col gap-3" @mouseenter="hoveredStep = 0" @mouseleave="hoveredStep = null">
              <div class="w-full aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 64 64" class="w-20 h-20" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <!-- Base tree structure -->
                  <g :stroke="hoveredStep === 0 ? '#059669' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;">
                    <path d="M32 58 L32 38" />
                    <path d="M32 38 L18 24 M32 38 L46 24" />
                    <path d="M18 24 L10 14 M18 24 L24 14" />
                    <path d="M46 24 L40 14 M46 24 L54 14" />
                    <path d="M10 14 L7 8 M10 14 L13 9" />
                    <path d="M24 14 L21 8 M24 14 L27 9" />
                    <path d="M40 14 L37 8 M40 14 L43 9" />
                    <path d="M54 14 L51 8 M54 14 L57 9" />
                  </g>
                  <!-- Animated green upward flow arrows -->
                  <g v-if="hoveredStep === 0" class="flow-arrows">
                    <circle r="1.5" fill="#10b981" opacity="0.9">
                      <animateMotion dur="1.8s" repeatCount="indefinite" path="M32,58 L32,38" />
                    </circle>
                    <circle r="1.2" fill="#10b981" opacity="0.7">
                      <animateMotion dur="1.6s" repeatCount="indefinite" path="M32,38 L18,24 L10,14 L7,8" />
                    </circle>
                    <circle r="1.2" fill="#10b981" opacity="0.7">
                      <animateMotion dur="1.6s" repeatCount="indefinite" begin="0.3s" path="M32,38 L18,24 L24,14 L21,8" />
                    </circle>
                    <circle r="1.2" fill="#10b981" opacity="0.7">
                      <animateMotion dur="1.6s" repeatCount="indefinite" begin="0.15s" path="M32,38 L46,24 L40,14 L37,8" />
                    </circle>
                    <circle r="1.2" fill="#10b981" opacity="0.7">
                      <animateMotion dur="1.6s" repeatCount="indefinite" begin="0.45s" path="M32,38 L46,24 L54,14 L51,8" />
                    </circle>
                    <!-- Upward arrow tip at trunk -->
                    <path d="M30 46 L32 42 L34 46" stroke="#10b981" stroke-width="1.2" fill="none" class="arrow-pulse" />
                  </g>
                </svg>
              </div>
              <p class="text-xs font-mono text-slate-300">00</p>
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider leading-tight">Biological Inspiration</p>
              <p class="text-xs text-slate-400 leading-relaxed">The Bronchioles</p>
            </div>

            <!-- 01 - Porous Structural Core -->
            <div class="concept-step flex flex-col gap-3" @mouseenter="hoveredStep = 1" @mouseleave="hoveredStep = null">
              <div class="w-full aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 64 64" class="w-20 h-20" fill="none" stroke-linecap="round">
                  <!-- Core shell -->
                  <rect x="12" y="6" width="40" height="52" rx="3" :stroke="hoveredStep === 1 ? '#059669' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <!-- Pores —  fill green on hover to show filtration -->
                  <ellipse cx="24" cy="20" rx="5" ry="6" :stroke="hoveredStep === 1 ? '#10b981' : '#94a3b8'" :fill="hoveredStep === 1 ? '#d1fae5' : 'none'" stroke-width="1.5" style="transition: all 0.4s ease;" />
                  <ellipse cx="40" cy="20" rx="5" ry="6" :stroke="hoveredStep === 1 ? '#10b981' : '#94a3b8'" :fill="hoveredStep === 1 ? '#d1fae5' : 'none'" stroke-width="1.5" style="transition: all 0.4s ease 0.05s;" />
                  <circle cx="32" cy="34" r="5" :stroke="hoveredStep === 1 ? '#10b981' : '#94a3b8'" :fill="hoveredStep === 1 ? '#d1fae5' : 'none'" stroke-width="1.5" style="transition: all 0.4s ease 0.1s;" />
                  <ellipse cx="21" cy="46" rx="4" ry="5" :stroke="hoveredStep === 1 ? '#10b981' : '#94a3b8'" :fill="hoveredStep === 1 ? '#d1fae5' : 'none'" stroke-width="1.5" style="transition: all 0.4s ease 0.15s;" />
                  <ellipse cx="43" cy="46" rx="4" ry="5" :stroke="hoveredStep === 1 ? '#10b981' : '#94a3b8'" :fill="hoveredStep === 1 ? '#d1fae5' : 'none'" stroke-width="1.5" style="transition: all 0.4s ease 0.2s;" />
                  <!-- Animated particles flowing through pores -->
                  <g v-if="hoveredStep === 1">
                    <circle r="1" fill="#6ee7b7" opacity="0.8">
                      <animateMotion dur="2s" repeatCount="indefinite" path="M4,20 L24,20 L32,34 L43,46 L60,50" />
                    </circle>
                    <circle r="1" fill="#6ee7b7" opacity="0.8">
                      <animateMotion dur="2.2s" repeatCount="indefinite" begin="0.5s" path="M4,40 L21,46 L32,34 L40,20 L60,16" />
                    </circle>
                    <circle r="0.8" fill="#34d399" opacity="0.6">
                      <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.2s" path="M4,30 L24,20 L40,20 L60,14" />
                    </circle>
                    <!-- Direction arrows -->
                    <path d="M7 18 L12 20 L7 22" stroke="#10b981" stroke-width="1" fill="none" class="arrow-pulse" />
                    <path d="M57 14 L52 16 L57 18" stroke="#10b981" stroke-width="1" fill="none" class="arrow-pulse" style="animation-delay: 0.3s;" />
                  </g>
                </svg>
              </div>
              <p class="text-xs font-mono text-slate-300">01</p>
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider leading-tight">Porous Structural Core</p>
              <p class="text-xs text-slate-400 leading-relaxed">Air filters through Voronoi voids</p>
            </div>

            <!-- 02 - Program Massing Integration -->
            <div class="concept-step flex flex-col gap-3" @mouseenter="hoveredStep = 2" @mouseleave="hoveredStep = null">
              <div class="w-full aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 64 64" class="w-20 h-20" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <!-- Core spine -->
                  <rect x="27" y="6" width="10" height="52" rx="2" :stroke="hoveredStep === 2 ? '#059669' : '#94a3b8'" stroke-width="1.5" :fill="hoveredStep === 2 ? '#f0fdf4' : 'none'" style="transition: all 0.4s ease;" />
                  <!-- Capsules -->
                  <rect x="6" y="10" width="16" height="18" rx="3" :stroke="hoveredStep === 2 ? '#10b981' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <rect x="6" y="34" width="16" height="14" rx="3" :stroke="hoveredStep === 2 ? '#10b981' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease 0.05s;" />
                  <rect x="42" y="14" width="16" height="14" rx="3" :stroke="hoveredStep === 2 ? '#10b981' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease 0.1s;" />
                  <rect x="42" y="34" width="16" height="18" rx="3" :stroke="hoveredStep === 2 ? '#10b981' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease 0.15s;" />
                  <!-- Connections -->
                  <line x1="22" y1="19" x2="27" y2="19" :stroke="hoveredStep === 2 ? '#10b981' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <line x1="22" y1="41" x2="27" y2="41" :stroke="hoveredStep === 2 ? '#10b981' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <line x1="37" y1="21" x2="42" y2="21" :stroke="hoveredStep === 2 ? '#10b981' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <line x1="37" y1="43" x2="42" y2="43" :stroke="hoveredStep === 2 ? '#10b981' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <!-- Animated air circulation through connections -->
                  <g v-if="hoveredStep === 2">
                    <circle r="1" fill="#10b981" opacity="0.8">
                      <animateMotion dur="1.4s" repeatCount="indefinite" path="M14,19 L24,19 L32,30 L32,43 L42,43 L50,43" />
                    </circle>
                    <circle r="1" fill="#10b981" opacity="0.8">
                      <animateMotion dur="1.4s" repeatCount="indefinite" begin="0.4s" path="M50,21 L42,21 L32,30 L32,19 L22,19 L14,19" />
                    </circle>
                    <circle r="0.8" fill="#34d399" opacity="0.6">
                      <animateMotion dur="1.6s" repeatCount="indefinite" begin="0.7s" path="M14,41 L27,41 L32,30 L37,21 L50,21" />
                    </circle>
                    <!-- Directional arrows on connections -->
                    <path d="M24 17 L27 19 L24 21" stroke="#10b981" stroke-width="1" fill="none" class="arrow-pulse" />
                    <path d="M40 19 L37 21 L40 23" stroke="#10b981" stroke-width="1" fill="none" class="arrow-pulse" style="animation-delay: 0.2s;" />
                  </g>
                </svg>
              </div>
              <p class="text-xs font-mono text-slate-300">02</p>
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider leading-tight">Program Massing Integration</p>
              <p class="text-xs text-slate-400 leading-relaxed">Air circulates between capsules &amp; core</p>
            </div>

            <!-- 03 - Functional Airflow System -->
            <div class="concept-step flex flex-col gap-3" @mouseenter="hoveredStep = 3" @mouseleave="hoveredStep = null">
              <div class="w-full aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 64 64" class="w-20 h-20" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <!-- Tower structure -->
                  <rect x="27" y="6" width="10" height="52" rx="2" :stroke="hoveredStep === 3 ? '#059669' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <rect x="6" y="10" width="16" height="18" rx="3" :stroke="hoveredStep === 3 ? '#059669' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <rect x="6" y="34" width="16" height="14" rx="3" :stroke="hoveredStep === 3 ? '#059669' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <rect x="42" y="14" width="16" height="14" rx="3" :stroke="hoveredStep === 3 ? '#059669' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <rect x="42" y="34" width="16" height="18" rx="3" :stroke="hoveredStep === 3 ? '#059669' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <line x1="22" y1="19" x2="27" y2="19" :stroke="hoveredStep === 3 ? '#059669' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <line x1="22" y1="41" x2="27" y2="41" :stroke="hoveredStep === 3 ? '#059669' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <line x1="37" y1="21" x2="42" y2="21" :stroke="hoveredStep === 3 ? '#059669' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <line x1="37" y1="43" x2="42" y2="43" :stroke="hoveredStep === 3 ? '#059669' : '#94a3b8'" stroke-width="1.5" style="transition: stroke 0.4s ease;" />
                  <!-- Static dashed air hints -->
                  <g :stroke="hoveredStep === 3 ? '#94a3b8' : '#94a3b8'" stroke-width="1" stroke-dasharray="2 2" :opacity="hoveredStep === 3 ? 0.3 : 0.6" style="transition: opacity 0.3s ease;">
                    <path d="M1 22 L5 19" />
                    <path d="M1 38 L5 35" />
                    <path d="M63 22 L59 19" />
                    <path d="M63 38 L59 35" />
                    <path d="M28 6 L26 2 M32 5 L32 1 M36 6 L38 2" />
                  </g>
                  <!-- Animated airflow: dirty air IN from sides, clean air OUT from top -->
                  <g v-if="hoveredStep === 3">
                    <!-- Dirty air entering from left (gray/red) -->
                    <circle r="1.2" fill="#94a3b8" opacity="0.7">
                      <animateMotion dur="2s" repeatCount="indefinite" path="M0,20 L6,19 L14,19 L22,19 L27,19" />
                    </circle>
                    <circle r="1" fill="#94a3b8" opacity="0.5">
                      <animateMotion dur="2.2s" repeatCount="indefinite" begin="0.4s" path="M0,38 L6,36 L14,41 L22,41 L27,41" />
                    </circle>
                    <!-- Dirty air entering from right -->
                    <circle r="1.2" fill="#94a3b8" opacity="0.7">
                      <animateMotion dur="2s" repeatCount="indefinite" begin="0.2s" path="M64,20 L58,19 L50,21 L42,21 L37,21" />
                    </circle>
                    <circle r="1" fill="#94a3b8" opacity="0.5">
                      <animateMotion dur="2.2s" repeatCount="indefinite" begin="0.6s" path="M64,40 L58,38 L50,43 L42,43 L37,43" />
                    </circle>
                    <!-- Air moves through core (transition color) -->
                    <circle r="1" fill="#6ee7b7" opacity="0.6">
                      <animateMotion dur="1.6s" repeatCount="indefinite" begin="0.8s" path="M32,52 L32,40 L32,30 L32,20 L32,10" />
                    </circle>
                    <circle r="1" fill="#6ee7b7" opacity="0.6">
                      <animateMotion dur="1.6s" repeatCount="indefinite" begin="1.4s" path="M32,52 L32,40 L32,30 L32,20 L32,10" />
                    </circle>
                    <!-- Clean air exiting from top (green) -->
                    <circle r="1.5" fill="#10b981" opacity="0.9">
                      <animateMotion dur="1.2s" repeatCount="indefinite" path="M32,8 L32,2 L30,0" />
                    </circle>
                    <circle r="1.2" fill="#10b981" opacity="0.7">
                      <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.3s" path="M30,8 L26,2" />
                    </circle>
                    <circle r="1.2" fill="#10b981" opacity="0.7">
                      <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.6s" path="M34,8 L38,2" />
                    </circle>
                    <!-- Intake arrows (gray) -->
                    <path d="M2 18 L6 20 L2 22" stroke="#94a3b8" stroke-width="1.2" fill="none" class="arrow-pulse" />
                    <path d="M62 18 L58 20 L62 22" stroke="#94a3b8" stroke-width="1.2" fill="none" class="arrow-pulse" style="animation-delay: 0.2s;" />
                    <!-- Exhaust arrows (green) -->
                    <path d="M30 4 L32 0 L34 4" stroke="#10b981" stroke-width="1.5" fill="none" class="arrow-pulse" style="animation-delay: 0.4s;" />
                  </g>
                </svg>
              </div>
              <p class="text-xs font-mono text-slate-300">03</p>
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider leading-tight">Functional Airflow System</p>
              <p class="text-xs text-slate-400 leading-relaxed">Dirty air in · clean air out</p>
            </div>

          </div>
        </div>

        <!-- ── PROGRAM CARD ── -->
        <div id="tour-tower-program" class="system-card bg-white rounded-2xl p-8 md:p-10 mb-8 shadow-sm">
          <div class="flex items-center gap-4 mb-10">
            <div class="blob blob-complex card-blob flex-shrink-0"
              style="width:52px;height:52px;animation-duration:10s;background:linear-gradient(135deg,#93c5fd 0%,#3b82f6 60%,#2563eb 100%);opacity:0.9;"
            />
            <div>
              <h3 class="text-xl font-bold text-slate-800">Program</h3>
              <p class="text-sm text-slate-400">Spatial planning and user experience</p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-12 items-start">

            <!-- Donut chart + tooltip + legend -->
            <div class="flex flex-col items-center gap-4 flex-shrink-0">
              <svg
                viewBox="0 0 200 200" class="w-44 h-44 cursor-crosshair"
                role="img" aria-label="Program mix by area"
                @mouseleave="hoveredSeg = null"
              >
                <g transform="rotate(-90, 100, 100)">
                  <circle
                    v-for="seg in donutSegments" :key="seg.label"
                    cx="100" cy="100" r="65" fill="none"
                    :stroke="seg.color" stroke-width="30"
                    :stroke-dasharray="`${(seg.length + 1).toFixed(2)} ${(CIRC - seg.length).toFixed(2)}`"
                    :stroke-dashoffset="seg.offset.toFixed(2)"
                    :opacity="hoveredSeg && hoveredSeg.label !== seg.label ? 0.3 : 1"
                    style="transition: opacity 0.2s ease; cursor: pointer;"
                    @mouseenter="hoveredSeg = seg"
                  />
                </g>
              </svg>
              <!-- Tooltip pill -->
              <div class="h-6 text-center min-w-[160px]">
                <span v-if="hoveredSeg" class="text-sm font-semibold transition-all" :style="{ color: hoveredSeg.color }">
                  {{ hoveredSeg.label }} — {{ hoveredSeg.pct }}%
                </span>
                <span v-else class="text-xs text-slate-300">hover segments to explore</span>
              </div>
              <!-- Legend -->
              <div class="grid grid-cols-2 gap-x-5 gap-y-1.5">
                <div
                  v-for="seg in donutSegments" :key="seg.label"
                  class="flex items-center gap-1.5 cursor-default"
                  :style="{ opacity: hoveredSeg && hoveredSeg.label !== seg.label ? 0.35 : 1, transition: 'opacity 0.2s' }"
                  @mouseenter="hoveredSeg = seg"
                  @mouseleave="hoveredSeg = null"
                >
                  <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: seg.color }" />
                  <span class="text-xs text-slate-500">{{ seg.label }}</span>
                </div>
              </div>
            </div>

            <!-- Bar chart + total -->
            <div class="flex-1 w-full">
              <svg
                viewBox="0 0 260 185" class="w-full max-w-xs cursor-crosshair"
                role="img" aria-label="Area by building component"
                @mouseleave="hoveredBar = null"
              >
                <line x1="0" y1="35"  x2="260" y2="35"  stroke="#f1f5f9" stroke-width="1"/>
                <line x1="0" y1="75"  x2="260" y2="75"  stroke="#f1f5f9" stroke-width="1"/>
                <line x1="0" y1="115" x2="260" y2="115" stroke="#f1f5f9" stroke-width="1"/>
                <line x1="0" y1="155" x2="260" y2="155" stroke="#f1f5f9" stroke-width="1"/>
                <!-- Bars -->
                <rect
                  v-for="bar in barData" :key="bar.label"
                  :x="bar.x" :y="bar.y" :width="bar.w" :height="bar.h"
                  :fill="hoveredBar?.label === bar.label ? bar.hoverColor : bar.color"
                  rx="3"
                  style="transition: fill 0.15s ease; cursor: pointer;"
                  @mouseenter="hoveredBar = bar"
                />
                <!-- Hover value label -->
                <text
                  v-if="hoveredBar"
                  :x="hoveredBar.x + hoveredBar.w / 2" :y="hoveredBar.y - 8"
                  text-anchor="middle" font-size="10" font-weight="600"
                  :fill="hoveredBar.color" font-family="system-ui,sans-serif"
                >{{ hoveredBar.fullVal }}</text>
                <!-- Static short value labels -->
                <text
                  v-for="bar in barData" :key="bar.label + '-v'"
                  v-show="hoveredBar?.label !== bar.label"
                  :x="bar.x + bar.w / 2" :y="bar.y - 5"
                  text-anchor="middle" font-size="9" fill="#94a3b8" font-family="system-ui,sans-serif"
                >{{ bar.shortVal }}</text>
                <!-- X-axis labels -->
                <text
                  v-for="bar in barData" :key="bar.label + '-l'"
                  :x="bar.x + bar.w / 2" :y="180"
                  text-anchor="middle" font-size="9"
                  :fill="hoveredBar?.label === bar.label ? '#64748b' : '#cbd5e1'"
                  font-family="system-ui,sans-serif"
                  style="transition: fill 0.15s ease;"
                >{{ bar.label }}</text>
              </svg>
              <div class="mt-6">
                <p class="text-3xl font-bold text-slate-800">1,002,014</p>
                <p class="text-xs text-slate-400 uppercase tracking-widest mt-1">Total 2D Area · m²</p>
              </div>
            </div>

            <!-- Program key stats -->
            <div class="flex-1 w-full min-w-[180px]">
              <p class="text-xs font-medium tracking-widest uppercase text-slate-400 mb-5">Program highlights</p>
              <div class="space-y-4">
                <div v-for="stat in programStats" :key="stat.label" class="program-stat group">
                  <div class="flex items-baseline justify-between mb-1">
                    <span class="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">{{ stat.label }}</span>
                    <span class="text-sm font-bold text-slate-800">{{ stat.value }}</span>
                  </div>
                  <div class="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-700"
                      :style="{ width: stat.bar + '%', background: stat.color }"
                    />
                  </div>
                </div>
              </div>
              <div class="mt-6 pt-5 border-t border-slate-100">
                <div class="flex items-baseline justify-between mb-1">
                  <span class="text-xs text-slate-400">Public / Private Ratio</span>
                  <span class="text-sm font-bold text-slate-800">22 / 78</span>
                </div>
                <div class="flex h-1.5 rounded-full overflow-hidden mt-1">
                  <div class="h-full" style="width:22%;background:#3b82f6;"></div>
                  <div class="h-full" style="width:78%;background:#e2e8f0;"></div>
                </div>
                <div class="flex justify-between mt-1">
                  <span class="text-[10px] text-slate-300">Public</span>
                  <span class="text-[10px] text-slate-300">Private</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── DATA CARD ── -->
        <div id="tour-tower-data" ref="kpiSection" class="system-card bg-white rounded-2xl p-8 md:p-10 shadow-sm">
          <div class="flex items-center gap-4 mb-10">
            <div class="blob blob-simple card-blob flex-shrink-0"
              style="width:52px;height:52px;animation-duration:12s;background:linear-gradient(135deg,#fca5a5 0%,#ef4444 60%,#dc2626 100%);opacity:0.9;"
            />
            <div>
              <h3 class="text-xl font-bold text-slate-800">Data</h3>
              <p class="text-sm text-slate-400">Tower vitals &amp; environmental performance</p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-12 items-start">

            <!-- LEFT: Skyline comparison -->
            <div class="flex-1 w-full">
              <p class="text-xs font-medium tracking-widest uppercase text-slate-400 mb-5">Height comparison</p>
              <svg
                viewBox="0 0 400 260" class="w-full cursor-crosshair"
                role="img" aria-label="Tower height comparison skyline"
                @mouseleave="hoveredLandmark = null"
              >
                <!-- Ground line -->
                <line x1="0" y1="230" x2="400" y2="230" stroke="#e2e8f0" stroke-width="1" />

                <!-- Landmark bars -->
                <g v-for="(lm, i) in landmarks" :key="lm.name">
                  <!-- Bar -->
                  <rect
                    :x="lm.x" :y="230 - lm.barH" :width="lm.w" :height="lm.barH"
                    :rx="lm.isHB01 ? 4 : 2"
                    :fill="hoveredLandmark?.name === lm.name ? (lm.isHB01 ? '#059669' : '#94a3b8') : lm.color"
                    :opacity="hoveredLandmark && hoveredLandmark.name !== lm.name ? 0.35 : 1"
                    class="landmark-bar"
                    @mouseenter="hoveredLandmark = lm"
                  />
                  <!-- Height label on top -->
                  <text
                    :x="lm.x + lm.w / 2" :y="230 - lm.barH - 6"
                    text-anchor="middle" font-size="9" font-weight="600"
                    :fill="hoveredLandmark?.name === lm.name ? (lm.isHB01 ? '#059669' : '#64748b') : '#94a3b8'"
                    font-family="system-ui, sans-serif"
                    class="landmark-bar"
                  >{{ lm.heightLabel }}</text>
                  <!-- Name label below ground -->
                  <text
                    :x="lm.x + lm.w / 2" :y="245"
                    text-anchor="middle" font-size="7.5"
                    :fill="hoveredLandmark?.name === lm.name ? '#334155' : '#cbd5e1'"
                    font-family="system-ui, sans-serif"
                    class="landmark-bar"
                  >{{ lm.shortName }}</text>
                  <!-- HB01 marker dot -->
                  <circle
                    v-if="lm.isHB01"
                    :cx="lm.x + lm.w / 2" :cy="255"
                    r="2.5"
                    :fill="hoveredLandmark?.name === lm.name ? '#059669' : '#10b981'"
                    :opacity="hoveredLandmark && hoveredLandmark.name !== lm.name ? 0.3 : 1"
                    class="landmark-bar"
                  />
                </g>

                <!-- Hover tooltip -->
                <g v-if="hoveredLandmark">
                  <rect
                    :x="Math.min(Math.max(hoveredLandmark.x + hoveredLandmark.w / 2 - 55, 2), 290)"
                    y="2" width="110" height="22" rx="4"
                    :fill="hoveredLandmark.isHB01 ? '#f0fdf4' : '#f8fafc'"
                    :stroke="hoveredLandmark.isHB01 ? '#10b981' : '#e2e8f0'"
                    stroke-width="1"
                  />
                  <text
                    :x="Math.min(Math.max(hoveredLandmark.x + hoveredLandmark.w / 2, 57), 345)"
                    y="17" text-anchor="middle" font-size="9" font-weight="600"
                    :fill="hoveredLandmark.isHB01 ? '#059669' : '#475569'"
                    font-family="system-ui, sans-serif"
                  >{{ hoveredLandmark.name }} — {{ hoveredLandmark.height }}m</text>
                </g>
              </svg>
              <!-- Legend -->
              <div class="flex items-center gap-4 mt-3">
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
                  <span class="text-[10px] text-slate-400">HB01 Towers</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-sm bg-slate-200"></span>
                  <span class="text-[10px] text-slate-400">Global &amp; Local Landmarks</span>
                </div>
              </div>
            </div>

            <!-- RIGHT: Headlines + Sustainability -->
            <div class="flex-1 w-full min-w-[220px]">
              <!-- Headline numbers -->
              <p class="text-xs font-medium tracking-widest uppercase text-slate-400 mb-5">Tower vitals</p>
              <div class="grid grid-cols-2 gap-4 mb-8">
                <div v-for="stat in headlineStats" :key="stat.label" class="headline-stat p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p class="text-2xl font-bold text-slate-800 leading-none">{{ stat.value }}</p>
                  <p class="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5">{{ stat.label }}</p>
                </div>
              </div>

              <!-- Sustainability -->
              <p class="text-xs font-medium tracking-widest uppercase text-slate-400 mb-5">Environmental performance</p>
              <div class="flex flex-col gap-5">
                <!-- Air filtration ring -->
                <div class="flex items-center gap-4">
                  <svg viewBox="0 0 60 60" class="w-14 h-14 flex-shrink-0" role="img" aria-label="Air filtration">
                    <circle cx="30" cy="30" r="24" fill="none" stroke="#f1f5f9" stroke-width="5" />
                    <circle
                      cx="30" cy="30" r="24" fill="none"
                      stroke="#10b981" stroke-width="5"
                      stroke-linecap="round"
                      transform="rotate(-90, 30, 30)"
                      stroke-dasharray="150.80"
                      :stroke-dashoffset="ringsVisible ? '22.62' : '150.80'"
                      class="ring-fill"
                    />
                    <text x="30" y="33" text-anchor="middle" font-size="10" font-weight="700" fill="#1e293b" font-family="system-ui, sans-serif">12M</text>
                  </svg>
                  <div>
                    <p class="text-sm font-bold text-slate-800">12,000,000 m³ / year</p>
                    <p class="text-xs text-slate-400">Air filtered through porous cores</p>
                    <p class="text-xs text-emerald-500 mt-0.5">≈ 4,800 mature trees equivalent</p>
                  </div>
                </div>

                <!-- Certification badges -->
                <div class="flex flex-wrap gap-2">
                  <span class="badge-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span class="text-xs font-semibold text-emerald-700">Net Zero 2040</span>
                  </span>
                  <span class="badge-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span class="text-xs font-semibold text-blue-700">LEED Platinum</span>
                  </span>
                  <span class="badge-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span class="text-xs font-semibold text-amber-700">&lt; 350 kgCO₂e / m²</span>
                  </span>
                </div>
              </div>

              <!-- Live indicator -->
              <div class="flex items-center gap-2 mt-8">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
                <span class="text-xs text-slate-400">Based on latest computational models</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ── LOCATION & CONTEXT ─────────────────────────────────── -->
    <section class="py-32 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-12">

          <div>
            <p class="text-xs font-medium tracking-widest uppercase text-slate-400 mb-3">Location</p>
            <h2 class="text-5xl font-bold text-slate-900 leading-tight mb-2">Santiago,<br>Chile</h2>
            <p class="text-slate-400 text-sm mt-3">Conceptual Design &nbsp;·&nbsp; 2026</p>
          </div>

          <div class="blob blob-simple hidden md:block"
            style="width:80px;height:80px;flex-shrink:0;animation-duration:15s;background:linear-gradient(135deg,#e2e8f0 0%,#cbd5e1 100%);opacity:0.6;"
          />

          <div class="md:text-right">
            <p class="text-xs font-medium tracking-widest uppercase text-slate-400 mb-3">Studio</p>
            <p class="text-2xl font-semibold text-slate-700 leading-snug">MACAD at IAAC</p>
            <p class="text-slate-400 text-sm mt-2">Master in Advanced Computation<br>for Architecture and Design</p>
            <p class="text-slate-400 text-sm mt-3">Hyperbuilding HB01</p>
          </div>

        </div>
      </div>
    </section>

    <!-- ── FOOTER ─────────────────────────────────────────────── -->
    <footer class="py-12 border-t border-slate-100 text-center">
      <router-link to="/" class="text-sm text-slate-400 hover:text-slate-600 transition-colors">
        → Sign in to the studio platform
      </router-link>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// ── Parallax scroll ──────────────────────────────────────────
const scrollY = ref(0)
const onScroll = () => { scrollY.value = window.scrollY }
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

// ── Chart hover state ─────────────────────────────────────────
const hoveredSeg = ref(null)
const hoveredBar = ref(null)
const hoveredStep = ref(null)
const hoveredLandmark = ref(null)

// ── KPI ring IntersectionObserver ────────────────────────────
const ringsVisible = ref(false)
const kpiSection = ref(null)
onMounted(() => {
  const obs = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) ringsVisible.value = true },
    { threshold: 0.25 }
  )
  if (kpiSection.value) obs.observe(kpiSection.value)
})

// ── Donut chart (circumference = 2·π·65 ≈ 408.41) ────────────
const CIRC = 2 * Math.PI * 65
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

// ── Bar chart ─────────────────────────────────────────────────
const BAR_MAX    = 397011028
const BAR_BOTTOM = 155
const BAR_HEIGHT = 120
const barData = [
  { label: 'Core',    val: 397011028, shortVal: '397M', fullVal: '397,011,028 m²', color: '#3b82f6', hoverColor: '#2563eb', x: 10,  w: 52 },
  { label: 'Capsule', val: 236332957, shortVal: '236M', fullVal: '236,332,957 m²', color: '#4ade80', hoverColor: '#16a34a', x: 75,  w: 52 },
  { label: 'Podium',  val: 230418453, shortVal: '230M', fullVal: '230,418,453 m²', color: '#facc15', hoverColor: '#ca8a04', x: 140, w: 52 },
  { label: 'Bridge',  val: 138251072, shortVal: '138M', fullVal: '138,251,072 m²', color: '#f87171', hoverColor: '#dc2626', x: 205, w: 52 },
].map(b => {
  const h = Math.round((b.val / BAR_MAX) * BAR_HEIGHT)
  return { ...b, h, y: BAR_BOTTOM - h }
})

// ── Program key stats ────────────────────────────────────────
const programStats = [
  { label: 'Total Floors',         value: '210',       bar: 100, color: '#3b82f6' },
  { label: 'Residential Units',    value: '5,200',     bar: 72,  color: '#4ade80' },
  { label: 'Office Floor Plates',  value: '48',        bar: 46,  color: '#f87171' },
  { label: 'Parking Capacity',     value: '10,000',    bar: 54,  color: '#facc15' },
  { label: 'Avg. Floor Area',      value: '4,771 m²',  bar: 65,  color: '#7dd3fc' },
  { label: 'Occupancy Capacity',   value: '42,000',    bar: 88,  color: '#2dd4bf' },
]

// ── Skyline landmarks ───────────────────────────────────────
const MAX_HEIGHT = 828 // Burj Khalifa
const BAR_AREA_H = 200 // max pixel height for tallest bar
const rawLandmarks = [
  { name: 'Gran Torre Santiago', shortName: 'Gran Torre',   height: 300, isHB01: false },
  { name: 'Eiffel Tower',       shortName: 'Eiffel',       height: 330, isHB01: false },
  { name: 'HB01 Tower A',       shortName: 'HB01-A',       height: 400, isHB01: true  },
  { name: 'Empire State',       shortName: 'Empire St.',   height: 443, isHB01: false },
  { name: 'HB01 Tower B',       shortName: 'HB01-B',       height: 500, isHB01: true  },
  { name: 'HB01 Tower C',       shortName: 'HB01-C',       height: 600, isHB01: true  },
  { name: 'Shanghai Tower',     shortName: 'Shanghai',     height: 632, isHB01: false },
  { name: 'Burj Khalifa',       shortName: 'Burj Khalifa', height: 828, isHB01: false },
]
const landmarks = rawLandmarks.map((lm, i) => {
  const barH = Math.round((lm.height / MAX_HEIGHT) * BAR_AREA_H)
  const w = lm.isHB01 ? 34 : 26
  const gap = (400 - rawLandmarks.length * 40) / (rawLandmarks.length + 1)
  const x = gap + i * (40 + gap) + (40 - w) / 2
  return {
    ...lm,
    barH,
    w,
    x: Math.round(x),
    heightLabel: `${lm.height}m`,
    color: lm.isHB01 ? '#10b981' : '#e2e8f0',
  }
})

// ── Headline stats ───────────────────────────────────────────
const headlineStats = [
  { label: 'Tallest Tower',    value: '600m' },
  { label: 'Total Floors',     value: '210' },
  { label: 'Gross Floor Area', value: '1M m²' },
  { label: 'Peak Occupancy',   value: '42,000' },
]
</script>

<style scoped>
/* ── Blob base ────────────────────────────────────────────── */
.blob {
  border-radius: 50%;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  transition: transform 0.4s ease, opacity 0.4s ease;
}
.blob:hover {
  opacity: 1 !important;
  cursor: default;
}

/* ── System card hover lift ──────────────────────────────── */
.system-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.system-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}
.card-blob {
  transition: transform 0.3s ease;
}
.system-card:hover .card-blob {
  transform: scale(1.1);
}

/* ── Program stat hover ──────────────────────────────────── */
.program-stat:hover div:last-child div {
  filter: brightness(1.1);
}

/* ── Concept step hover ──────────────────────────────────── */
.concept-step > div:first-child {
  transition: border-color 0.2s ease, background 0.2s ease;
}
.concept-step:hover > div:first-child {
  border-color: #10b981;
  background: #f0fdf4;
}

/* ── Airflow arrow pulse ─────────────────────────────────── */
.arrow-pulse {
  animation: arrowPulse 1.2s ease-in-out infinite;
}
@keyframes arrowPulse {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 1; }
}

/* ── KPI ring fill animation ─────────────────────────────── */
.ring-fill {
  transition: stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Landmark skyline bars ────────────────────────────── */
.landmark-bar {
  transition: fill 0.2s ease, opacity 0.2s ease;
  cursor: pointer;
}

/* ── Headline stat hover ─────────────────────────────── */
.headline-stat {
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.headline-stat:hover {
  border-color: #10b981;
  transform: translateY(-2px);
}

/* ── Badge pill ─────────────────────────────────────── */
.badge-pill {
  transition: transform 0.2s ease;
}
.badge-pill:hover {
  transform: scale(1.05);
}

/* ── Blob morph keyframes ────────────────────────────────── */
.blob-simple { animation-name: morph-simple; }
@keyframes morph-simple {
  0%, 100% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; }
  25%       { border-radius: 55% 45% 50% 50% / 50% 55% 45% 50%; }
  50%       { border-radius: 50% 50% 45% 55% / 50% 50% 50% 50%; }
  75%       { border-radius: 45% 55% 50% 50% / 55% 45% 50% 50%; }
}

.blob-moderate { animation-name: morph-moderate; }
@keyframes morph-moderate {
  0%, 100% { border-radius: 60% 40% 55% 45% / 50% 55% 45% 50%; }
  20%       { border-radius: 45% 55% 60% 40% / 55% 50% 50% 45%; }
  40%       { border-radius: 55% 45% 40% 60% / 45% 60% 40% 55%; }
  60%       { border-radius: 40% 60% 50% 50% / 60% 40% 55% 45%; }
  80%       { border-radius: 50% 50% 45% 55% / 50% 55% 45% 60%; }
}

.blob-complex { animation-name: morph-complex; }
@keyframes morph-complex {
  0%, 100% { border-radius: 65% 35% 70% 30% / 40% 60% 35% 65%; }
  16%       { border-radius: 35% 65% 40% 60% / 70% 30% 65% 35%; }
  33%       { border-radius: 60% 40% 35% 65% / 30% 70% 40% 60%; }
  50%       { border-radius: 40% 60% 65% 35% / 65% 35% 70% 30%; }
  66%       { border-radius: 70% 30% 60% 40% / 35% 65% 30% 70%; }
  83%       { border-radius: 30% 70% 40% 60% / 60% 40% 65% 35%; }
}

.blob-extreme { animation-name: morph-extreme; }
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
