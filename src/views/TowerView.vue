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

    <!-- ── THE PROGRAM ────────────────────────────────────────── -->
    <section class="py-24 px-6 bg-slate-50">
      <div class="max-w-4xl mx-auto">

        <h2 class="text-4xl font-bold text-slate-900 text-center mb-4">Three Systems. One Tower.</h2>
        <p class="text-slate-400 text-center mb-20 text-sm tracking-wide uppercase">Structure · Program · Data</p>

        <!-- Three blobs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">

          <!-- Structure -->
          <div class="flex flex-col items-center text-center gap-5">
            <div class="blob blob-moderate"
              style="
                width: 120px; height: 120px;
                animation-duration: 8s;
                background: linear-gradient(135deg, #6ee7b7 0%, #10b981 60%, #059669 100%);
                opacity: 0.85;
              "
            />
            <div>
              <h3 class="text-lg font-semibold text-slate-800 mb-1">Structure</h3>
              <p class="text-sm text-slate-500 leading-relaxed">
                Engineering and structural systems. The skeleton that makes breathing possible.
              </p>
            </div>
          </div>

          <!-- Program -->
          <div class="flex flex-col items-center text-center gap-5">
            <div class="blob blob-complex"
              style="
                width: 120px; height: 120px;
                animation-duration: 10s;
                background: linear-gradient(135deg, #93c5fd 0%, #3b82f6 60%, #2563eb 100%);
                opacity: 0.85;
              "
            />
            <div>
              <h3 class="text-lg font-semibold text-slate-800 mb-1">Program</h3>
              <p class="text-sm text-slate-500 leading-relaxed">
                Spatial planning and user experience. The lungs themselves — volume, flow, occupation.
              </p>
            </div>
          </div>

          <!-- Data -->
          <div class="flex flex-col items-center text-center gap-5">
            <div class="blob blob-simple"
              style="
                width: 120px; height: 120px;
                animation-duration: 12s;
                background: linear-gradient(135deg, #fca5a5 0%, #ef4444 60%, #dc2626 100%);
                opacity: 0.85;
              "
            />
            <div>
              <h3 class="text-lg font-semibold text-slate-800 mb-1">Data</h3>
              <p class="text-sm text-slate-500 leading-relaxed">
                Analytics and performance. The nervous system reading and responding to every breath.
              </p>
            </div>
          </div>
        </div>

        <!-- Program diagram placeholder -->
        <div class="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center py-20 px-8 text-center">
          <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm text-slate-400 font-medium">Program diagram</p>
          <p class="text-xs text-slate-300 mt-1">Replace this placeholder with your diagram image</p>
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
// No data fetching — static public page
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
