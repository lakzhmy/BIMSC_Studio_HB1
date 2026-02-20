<template>
  <main class="relative z-10 py-8 px-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Stress Test</h1>
          <p class="text-slate-500 mt-1">The blobs are waiting. What will you do?</p>
        </div>
        <!-- Play As selector -->
        <div class="flex items-center gap-3">
          <label class="text-sm font-medium text-slate-700">Playing as:</label>
          <select
            v-model="selectedMemberId"
            :disabled="gameState === 'playing'"
            class="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="member in allMembers" :key="member.id" :value="member.id">
              {{ member.name }} ({{ member.teamLabel }})
            </option>
          </select>
        </div>
      </div>

      <!-- Main Grid: Game Area + Sidebar -->
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Game Area (left 2/3) -->
        <div class="lg:col-span-2 flex flex-col gap-4">
          <div class="card p-6 flex flex-col gap-4">
            <!-- Status Bar -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-6">
                <div class="text-center">
                  <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Pops</p>
                  <p class="text-4xl font-bold text-slate-900 tabular-nums">{{ score }}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Time Left</p>
                  <p
                    class="text-4xl font-bold tabular-nums"
                    :class="timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-slate-900'"
                  >{{ timeLeft }}s</p>
                </div>
                <!-- Live stress indicator during play -->
                <div v-if="gameState === 'playing'" class="text-center">
                  <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Stress</p>
                  <p class="text-2xl">{{ liveStressEmoji }}</p>
                </div>
              </div>

              <!-- Result / Start button -->
              <div class="text-right">
                <template v-if="gameState === 'idle'">
                  <button @click="startGame" class="btn-primary">
                    Start Test
                  </button>
                </template>
                <template v-else-if="gameState === 'playing'">
                  <div
                    class="px-4 py-2 rounded-lg text-sm font-semibold"
                    :class="liveStressClass"
                  >
                    {{ liveStressLabel }}
                  </div>
                </template>
                <template v-else>
                  <div class="space-y-2">
                    <p class="text-2xl font-bold">{{ lastStress.emoji }}</p>
                    <p class="text-base font-bold text-slate-900">{{ lastStress.label }}</p>
                    <p class="text-sm font-medium" :class="healthColorClass">{{ lastHealth }}% health</p>
                    <p v-if="isNewBest" class="text-xs text-amber-600 font-semibold">✦ Personal best health!</p>
                    <button @click="startGame" class="btn-primary text-sm mt-1">
                      Try Again
                    </button>
                  </div>
                </template>
              </div>
            </div>

            <!-- Blob Playground -->
            <div
              ref="gameArea"
              class="relative rounded-xl overflow-hidden select-none"
              :class="gameState === 'playing' ? 'cursor-crosshair' : 'cursor-default'"
              style="height: 420px;"
              :style="gameAreaStyle"
            >
              <!-- Idle / Done overlay -->
              <transition name="fade">
                <div
                  v-if="gameState !== 'playing'"
                  class="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/70 backdrop-blur-sm rounded-xl gap-2"
                >
                  <template v-if="gameState === 'idle'">
                    <p class="text-2xl font-bold text-slate-700">Ready?</p>
                    <p class="text-slate-400 text-sm">Click "Start Test" to begin</p>
                  </template>
                  <template v-else>
                    <p class="text-5xl mb-1">{{ lastStress.emoji }}</p>
                    <p class="text-2xl font-bold text-slate-800">{{ lastStress.label }}</p>
                    <p class="text-4xl font-black mt-1" :class="healthColorClass">{{ lastHealth }}%</p>
                    <p class="text-slate-500 text-sm">{{ score }} pops · {{ lastStress.description }}</p>
                  </template>
                </div>
              </transition>

              <!-- Blobs -->
              <transition-group name="blob-pop" tag="div">
                <div
                  v-for="blob in activeBlobs"
                  :key="blob.id"
                  class="absolute blob-morphing"
                  :class="blob.morphClass"
                  :style="{
                    left: blob.x + 'px',
                    top: blob.y + 'px',
                    width: blob.size + 'px',
                    height: blob.size + 'px',
                    background: blob.gradient,
                    animationDuration: blob.speed + 's',
                    cursor: gameState === 'playing' ? 'pointer' : 'default',
                    opacity: 0.88,
                    filter: `blur(${blob.blur}px)`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 5
                  }"
                  @click.stop="popBlob(blob.id)"
                />
              </transition-group>
            </div>
          </div>

          <!-- Benchmark Scale -->
          <div class="card p-5">
            <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">How it's calculated</h3>
            <div class="grid grid-cols-5 gap-2">
              <div
                v-for="tier in STRESS_TIERS"
                :key="tier.label"
                class="text-center p-2 rounded-lg border"
                :class="tier.bgClass"
              >
                <p class="text-xl mb-1">{{ tier.emoji }}</p>
                <p class="text-xs font-bold" :class="tier.textClass">{{ tier.label }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ tier.popsLabel }}</p>
                <p class="text-xs font-semibold mt-0.5" :class="tier.textClass">{{ tier.healthLabel }}</p>
              </div>
            </div>
            <p class="text-xs text-slate-400 mt-3">Fewer pops = calmer = higher health. The blobs want to be popped — do you resist?</p>
          </div>
        </div>

        <!-- Sidebar: Leaderboard + Team Health -->
        <div class="space-y-4">
          <!-- Team Health Summary -->
          <div class="card p-5">
            <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Team Health</h2>
            <div class="space-y-4">
              <div v-for="team in teamHealthSummary" :key="team.id">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium" :class="team.textClass">{{ team.name }}</span>
                  <span class="text-sm font-bold text-slate-900">
                    {{ team.health > 0 ? team.health + '%' : '—' }}
                  </span>
                </div>
                <div class="h-2 bg-slate-200 rounded-full">
                  <div
                    class="h-2 rounded-full transition-all duration-700"
                    :class="healthBarColorClass(team.health)"
                    :style="{ width: team.health + '%' }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Member Leaderboard -->
          <div class="card p-5">
            <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Calmness Ranking</h2>
            <div class="space-y-3">
              <div
                v-for="(member, idx) in sortedLeaderboard"
                :key="member.id"
                class="flex items-center gap-3"
              >
                <div class="w-6 text-center flex-shrink-0">
                  <span v-if="idx === 0" class="text-amber-500 font-bold text-sm">1</span>
                  <span v-else-if="idx === 1" class="text-slate-400 font-bold text-sm">2</span>
                  <span v-else-if="idx === 2" class="text-amber-700 font-bold text-sm">3</span>
                  <span v-else class="text-slate-400 text-xs">{{ idx + 1 }}</span>
                </div>
                <div class="w-8 h-8 flex-shrink-0">
                  <MemberBlob :member="member" size="32px" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1">
                    <p class="text-xs font-medium text-slate-900 truncate">{{ member.name }}</p>
                    <span v-if="member.health > 0" class="text-xs">{{ stressEmoji(member.health) }}</span>
                  </div>
                  <div class="h-1 bg-slate-200 rounded-full mt-1">
                    <div
                      class="h-1 rounded-full transition-all duration-700"
                      :class="healthBarColorClass(member.health)"
                      :style="{ width: member.health + '%' }"
                    />
                  </div>
                </div>
                <span
                  class="text-xs font-bold w-10 text-right flex-shrink-0"
                  :class="member.health > 0 ? 'text-slate-800' : 'text-slate-400'"
                >
                  {{ member.health > 0 ? member.health + '%' : '—' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { teams as sampleTeams } from '@/data/sampleData'
import MemberBlob from '@/components/MemberBlob.vue'

const userStore = useUserStore()

// ── Stress benchmarks ────────────────────────────────────────────────────────
// Formula: health = max(0, round(100 − (pops / 60) × 100))
// Max meaningful pops in 30s ≈ 60 (2 per second sustained)
const STRESS_TIERS = [
  {
    label: 'Zen',
    emoji: '🌊',
    minHealth: 85,
    maxPops: 9,
    popsLabel: '0–9 pops',
    healthLabel: '85–100%',
    bgClass: 'bg-emerald-50 border-emerald-200',
    textClass: 'text-emerald-700',
  },
  {
    label: 'Calm',
    emoji: '😌',
    minHealth: 67,
    maxPops: 20,
    popsLabel: '10–20 pops',
    healthLabel: '67–83%',
    bgClass: 'bg-green-50 border-green-200',
    textClass: 'text-green-700',
  },
  {
    label: 'Moderate',
    emoji: '😐',
    minHealth: 45,
    maxPops: 33,
    popsLabel: '21–33 pops',
    healthLabel: '45–65%',
    bgClass: 'bg-yellow-50 border-yellow-200',
    textClass: 'text-yellow-700',
  },
  {
    label: 'Stressed',
    emoji: '😰',
    minHealth: 18,
    maxPops: 49,
    popsLabel: '34–49 pops',
    healthLabel: '18–43%',
    bgClass: 'bg-orange-50 border-orange-200',
    textClass: 'text-orange-700',
  },
  {
    label: 'Overwhelmed',
    emoji: '🔥',
    minHealth: 0,
    maxPops: Infinity,
    popsLabel: '50+ pops',
    healthLabel: '0–17%',
    bgClass: 'bg-red-50 border-red-200',
    textClass: 'text-red-700',
  },
]

function getTierByHealth(health) {
  if (health >= 85) return STRESS_TIERS[0]
  if (health >= 67) return STRESS_TIERS[1]
  if (health >= 45) return STRESS_TIERS[2]
  if (health >= 18) return STRESS_TIERS[3]
  return STRESS_TIERS[4]
}

const TIER_DESCRIPTIONS = {
  'Zen': 'Barely a ripple. Pure calm.',
  'Calm': 'Relaxed and measured. Nice.',
  'Moderate': 'Some tension showing. Breathe.',
  'Stressed': 'You fought the blobs. They won.',
  'Overwhelmed': 'Chaos. Pure chaos. Take a break.',
}

// ── All members ──────────────────────────────────────────────────────────────
const allMembers = computed(() => {
  const members = []
  const defaultAvatar = {
    complexity: userStore.avatarConfig?.complexity ?? 50,
    speed: userStore.avatarConfig?.speed ?? 2,
    wobble: userStore.avatarConfig?.wobble ?? 30,
    shade: userStore.avatarConfig?.shade ?? 2,
  }
  for (const [teamId, teamMemberList] of Object.entries(userStore.teamMembers)) {
    if (Array.isArray(teamMemberList)) {
      teamMemberList.forEach((member) => {
        members.push({
          id: member.id,
          name: member.name,
          role: member.role || 'Team Member',
          team: teamId,
          teamId,
          teamLabel: { structure: 'Structure', program: 'Program', data: 'Data' }[teamId] || teamId,
          status: member.status || 'online',
          avatar: member.avatar || defaultAvatar,
        })
      })
    }
  }
  if (members.length === 0) {
    return sampleTeams.flatMap((team) =>
      team.members.map((member) => ({
        ...member,
        team: team.id,
        teamId: team.id,
        teamLabel: { structure: 'Structure', program: 'Program', data: 'Data' }[team.id] || team.id,
      }))
    )
  }
  return members
})

// ── "Play As" selection ──────────────────────────────────────────────────────
const selectedMemberId = ref(null)

const defaultMemberId = computed(() => {
  if (!allMembers.value.length) return null
  const myTeamMembers = allMembers.value.filter((m) => m.teamId === userStore.selectedTeam)
  return (myTeamMembers[0] ?? allMembers.value[0]).id
})

function getSelectedMemberId() {
  return selectedMemberId.value ?? defaultMemberId.value
}

// ── Game State ───────────────────────────────────────────────────────────────
const gameState = ref('idle') // 'idle' | 'playing' | 'done'
const score = ref(0)
const timeLeft = ref(30)
const lastHealth = ref(0)
const lastStress = ref({ label: '', emoji: '', description: '' })
const isNewBest = ref(false)
const gameArea = ref(null)

let timerInterval = null
let spawnInterval = null

// ── Live stress indicator (updates in real-time during play) ─────────────────
const liveHealth = computed(() => Math.max(0, Math.min(100, Math.round(100 - (score.value / 60) * 100))))
const liveTier = computed(() => getTierByHealth(liveHealth.value))
const liveStressEmoji = computed(() => liveTier.value.emoji)
const liveStressLabel = computed(() => liveTier.value.label)
const liveStressClass = computed(() => {
  const t = liveTier.value
  const map = {
    'Zen': 'bg-emerald-100 text-emerald-700',
    'Calm': 'bg-green-100 text-green-700',
    'Moderate': 'bg-yellow-100 text-yellow-700',
    'Stressed': 'bg-orange-100 text-orange-700',
    'Overwhelmed': 'bg-red-100 text-red-700',
  }
  return map[t.label] || 'bg-slate-100 text-slate-700'
})

// ── Game area background shifts with stress ─────────────────────────────────
const gameAreaStyle = computed(() => {
  if (gameState.value !== 'playing') return 'background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);'
  const pops = score.value
  if (pops <= 9)  return 'background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);'
  if (pops <= 20) return 'background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);'
  if (pops <= 33) return 'background: linear-gradient(135deg, #fef9c3 0%, #fde68a 100%);'
  if (pops <= 49) return 'background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);'
  return 'background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);'
})

// ── Blob Management ──────────────────────────────────────────────────────────
const activeBlobs = ref([])
let blobCounter = 0

const BLOB_MORPH_CLASSES = ['blob-simple', 'blob-moderate', 'blob-complex', 'blob-extreme']

const ALL_GRADIENTS = [
  'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 50%, #10b981 100%)',
  'linear-gradient(135deg, #6ee7b7 0%, #10b981 50%, #059669 100%)',
  'linear-gradient(135deg, #dbeafe 0%, #93c5fd 50%, #3b82f6 100%)',
  'linear-gradient(135deg, #93c5fd 0%, #3b82f6 50%, #2563eb 100%)',
  'linear-gradient(135deg, #fee2e2 0%, #fca5a5 50%, #ef4444 100%)',
  'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 50%, #6366f1 100%)',
  'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%)',
  'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 50%, #ec4899 100%)',
]

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function spawnBlob() {
  if (!gameArea.value) return
  const { clientWidth: w, clientHeight: h } = gameArea.value
  const size = Math.round(randomBetween(44, 88))
  const padding = size / 2 + 8
  const x = Math.round(randomBetween(padding, w - padding))
  const y = Math.round(randomBetween(padding, h - padding))

  activeBlobs.value.push({
    id: ++blobCounter,
    x,
    y,
    size,
    gradient: ALL_GRADIENTS[Math.floor(Math.random() * ALL_GRADIENTS.length)],
    morphClass: BLOB_MORPH_CLASSES[Math.floor(Math.random() * BLOB_MORPH_CLASSES.length)],
    speed: randomBetween(1.5, 4),
    blur: randomBetween(1, 3),
  })
}

function popBlob(id) {
  if (gameState.value !== 'playing') return
  const idx = activeBlobs.value.findIndex((b) => b.id === id)
  if (idx === -1) return
  activeBlobs.value.splice(idx, 1)
  score.value++
  spawnBlob()
}

// ── Game Lifecycle ───────────────────────────────────────────────────────────
const MAX_BLOBS = 8

function startGame() {
  if (!selectedMemberId.value) selectedMemberId.value = defaultMemberId.value

  score.value = 0
  timeLeft.value = 30
  lastHealth.value = 0
  isNewBest.value = false
  activeBlobs.value = []
  gameState.value = 'playing'

  for (let i = 0; i < MAX_BLOBS; i++) spawnBlob()

  spawnInterval = setInterval(() => {
    if (activeBlobs.value.length < MAX_BLOBS) spawnBlob()
  }, 500)

  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) endGame()
  }, 1000)
}

function endGame() {
  clearInterval(timerInterval)
  clearInterval(spawnInterval)
  activeBlobs.value = []
  gameState.value = 'done'

  // Inverted formula: fewer pops = less stressed = higher health
  const health = Math.max(0, Math.min(100, Math.round(100 - (score.value / 60) * 100)))
  lastHealth.value = health

  const tier = getTierByHealth(health)
  lastStress.value = {
    label: tier.label,
    emoji: tier.emoji,
    description: TIER_DESCRIPTIONS[tier.label] || '',
  }

  const memberId = getSelectedMemberId()
  isNewBest.value = userStore.saveStressTestScore(memberId, score.value)
}

onUnmounted(() => {
  clearInterval(timerInterval)
  clearInterval(spawnInterval)
})

// ── Health display helpers ───────────────────────────────────────────────────
const healthColorClass = computed(() => {
  if (lastHealth.value >= 67) return 'text-green-600'
  if (lastHealth.value >= 45) return 'text-yellow-600'
  if (lastHealth.value >= 18) return 'text-orange-600'
  return 'text-red-600'
})

function healthBarColorClass(health) {
  if (health >= 67) return 'bg-green-500'
  if (health >= 45) return 'bg-yellow-500'
  if (health >= 18) return 'bg-orange-500'
  return 'bg-red-500'
}

function stressEmoji(health) {
  return getTierByHealth(health).emoji
}

// ── Leaderboard ──────────────────────────────────────────────────────────────
const sortedLeaderboard = computed(() => {
  return [...allMembers.value]
    .map((m) => ({ ...m, health: userStore.getMemberHealth(m.id) }))
    .sort((a, b) => b.health - a.health)
})

// ── Team Health Summary ──────────────────────────────────────────────────────
const teamHealthSummary = computed(() => {
  return [
    { id: 'structure', name: 'Green Structure', textClass: 'text-green-700' },
    { id: 'program', name: 'Blue Program', textClass: 'text-blue-700' },
    { id: 'data', name: 'Red Data', textClass: 'text-red-700' },
  ].map((t) => ({ ...t, health: userStore.getTeamHealth(t.id) }))
})
</script>

<style scoped>
.card {
  background-color: white;
  border: 1px solid rgb(226, 232, 240);
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-primary {
  padding: 0.5rem 1.25rem;
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: background-color 0.15s;
}
.btn-primary:hover { background-color: #2563eb; }

/* Blob morphing */
.blob-morphing {
  border-radius: 50%;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.blob-morphing:hover { transform: translate(-50%, -50%) scale(1.12) !important; }
.blob-simple   { animation-name: morph-simple; }
.blob-moderate { animation-name: morph-moderate; }
.blob-complex  { animation-name: morph-complex; }
.blob-extreme  { animation-name: morph-extreme; }

@keyframes morph-simple {
  0%,100% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; }
  25%     { border-radius: 55% 45% 50% 50% / 50% 55% 45% 50%; }
  50%     { border-radius: 50% 50% 45% 55% / 50% 50% 50% 50%; }
  75%     { border-radius: 45% 55% 50% 50% / 55% 45% 50% 50%; }
}
@keyframes morph-moderate {
  0%,100% { border-radius: 60% 40% 55% 45% / 50% 55% 45% 50%; }
  20%     { border-radius: 45% 55% 60% 40% / 55% 50% 50% 45%; }
  40%     { border-radius: 55% 45% 40% 60% / 45% 60% 40% 55%; }
  60%     { border-radius: 40% 60% 50% 50% / 60% 40% 55% 45%; }
  80%     { border-radius: 50% 50% 45% 55% / 50% 55% 45% 60%; }
}
@keyframes morph-complex {
  0%,100% { border-radius: 65% 35% 70% 30% / 40% 60% 35% 65%; }
  16%     { border-radius: 35% 65% 40% 60% / 70% 30% 65% 35%; }
  33%     { border-radius: 60% 40% 35% 65% / 30% 70% 40% 60%; }
  50%     { border-radius: 40% 60% 65% 35% / 65% 35% 70% 30%; }
  66%     { border-radius: 70% 30% 60% 40% / 35% 65% 30% 70%; }
  83%     { border-radius: 30% 70% 40% 60% / 60% 40% 65% 35%; }
}
@keyframes morph-extreme {
  0%,100% { border-radius: 73% 27% 80% 20% / 30% 75% 25% 70%; }
  12.5%   { border-radius: 25% 75% 35% 65% / 80% 20% 70% 30%; }
  25%     { border-radius: 70% 30% 25% 75% / 20% 80% 35% 65%; }
  37.5%   { border-radius: 35% 65% 73% 27% / 75% 25% 80% 20%; }
  50%     { border-radius: 80% 20% 65% 35% / 27% 73% 30% 70%; }
  62.5%   { border-radius: 20% 80% 30% 70% / 65% 35% 75% 25%; }
  75%     { border-radius: 75% 25% 70% 30% / 35% 65% 20% 80%; }
  87.5%   { border-radius: 30% 70% 20% 80% / 73% 27% 65% 35%; }
}

/* Blob transitions */
.blob-pop-enter-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.blob-pop-leave-active { transition: transform 0.18s ease, opacity 0.18s ease; }
.blob-pop-enter-from  { transform: translate(-50%, -50%) scale(0) !important; opacity: 0; }
.blob-pop-leave-to    { transform: translate(-50%, -50%) scale(0) !important; opacity: 0; }

/* Overlay fade */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
