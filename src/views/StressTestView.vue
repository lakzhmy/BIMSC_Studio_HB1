<template>
  <main class="relative z-10 py-8 px-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Stress Test</h1>
          <p class="text-slate-500 mt-1">The blobs are waiting. What will you do?</p>
        </div>
        <!-- Play As display (locked to logged-in user) -->
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-slate-700">Playing as:</span>
          <span class="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800">
            {{ playingAsName }}
            <span v-if="isGuest" class="ml-1 text-xs font-normal text-slate-400">(guest)</span>
          </span>
        </div>
      </div>

      <!-- Main Grid: game takes 3/5, sidebar takes 2/5 -->
      <!-- Row 1: Game ↔ Team Health + Calmness Ranking (aligned heights) -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">

        <!-- ── Game Area (left 3/5) ─────────────────────────────────────── -->
        <div id="tour-stress-game" class="lg:col-span-3">
          <div class="card p-5 flex flex-col gap-4 h-full">

            <!-- Status Bar -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-5">
                <div class="text-center">
                  <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Pops</p>
                  <p class="text-3xl font-bold text-slate-900 tabular-nums">{{ score }}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Time Left</p>
                  <p class="text-3xl font-bold tabular-nums"
                    :class="timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-slate-900'"
                  >{{ timeLeft }}s</p>
                </div>
                <div v-if="gameState === 'playing'" class="text-center">
                  <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Stress</p>
                  <p class="text-2xl">{{ liveStressEmoji }}</p>
                </div>
              </div>

              <div class="text-right">
                <template v-if="gameState === 'idle'">
                  <button @click="startGame" class="btn-primary">Start Test</button>
                </template>
                <template v-else-if="gameState === 'playing'">
                  <div class="px-3 py-1.5 rounded-lg text-sm font-semibold" :class="liveStressClass">
                    {{ liveStressLabel }}
                  </div>
                </template>
                <template v-else>
                  <div class="space-y-1">
                    <p class="text-xl font-bold">{{ lastStress.emoji }}</p>
                    <p class="text-sm font-bold text-slate-900">{{ lastStress.label }}</p>
                    <p class="text-sm font-semibold" :class="healthColorClass">{{ lastHealth }}% health</p>
                    <p v-if="isNewBest" class="text-xs text-amber-600 font-semibold">✦ Personal best!</p>
                    <button @click="startGame" class="btn-primary text-sm mt-1">Try Again</button>
                  </div>
                </template>
              </div>
            </div>

            <!-- Blob Playground (fills remaining height) -->
            <div
              ref="gameArea"
              class="relative rounded-xl overflow-hidden select-none bg-slate-50 flex-1"
              :class="gameState === 'playing' ? 'cursor-crosshair' : 'cursor-default'"
              style="min-height: 240px;"
            >
              <transition name="fade">
                <div
                  v-if="gameState !== 'playing'"
                  class="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/70 backdrop-blur-sm rounded-xl gap-1"
                >
                  <template v-if="gameState === 'idle'">
                    <p class="text-xl font-bold text-slate-700">Ready?</p>
                    <p class="text-slate-400 text-sm">Click "Start Test" to begin</p>
                  </template>
                  <template v-else>
                    <p class="text-4xl mb-1">{{ lastStress.emoji }}</p>
                    <p class="text-xl font-bold text-slate-800">{{ lastStress.label }}</p>
                    <p class="text-3xl font-black mt-1" :class="healthColorClass">{{ lastHealth }}%</p>
                    <p class="text-slate-500 text-sm">{{ score }} pops · {{ lastStress.description }}</p>
                  </template>
                </div>
              </transition>

              <transition-group name="blob-pop" tag="div">
                <div
                  v-for="blob in activeBlobs"
                  :key="blob.id"
                  class="absolute blob-morphing"
                  :class="blob.morphClass"
                  :style="{
                    left: blob.x + 'px', top: blob.y + 'px',
                    width: blob.size + 'px', height: blob.size + 'px',
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
        </div>

        <!-- ── Right column row 1: Team Health + Calmness Ranking ────────── -->
        <div class="lg:col-span-2 flex flex-col gap-5 h-full">

          <!-- Team Health -->
          <div class="card p-4">
            <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Team Health</h2>
            <div class="space-y-3">
              <div v-for="team in teamHealthSummary" :key="team.id">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-medium" :class="team.textClass">{{ team.name }}</span>
                  <span class="text-xs font-bold text-slate-900">{{ team.health > 0 ? team.health + '%' : '—' }}</span>
                </div>
                <div class="h-1.5 bg-slate-200 rounded-full">
                  <div class="h-1.5 rounded-full transition-all duration-700"
                    :class="healthBarColorClass(team.health)"
                    :style="{ width: team.health + '%' }" />
                </div>
              </div>
            </div>
          </div>

          <!-- Calmness Ranking — fills remaining space to match game height -->
          <div id="tour-stress-leaderboard" class="card p-4 flex-1 flex flex-col">
            <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Calmness Ranking</h2>
            <div class="space-y-1.5 flex-1">
              <div
                v-for="(member, idx) in sortedLeaderboard"
                :key="member.id"
                class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg"
                :class="idx < 3 ? 'bg-slate-50' : ''"
              >
                <!-- Rank -->
                <span class="w-5 text-xs font-bold text-center flex-shrink-0"
                  :class="idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-300'"
                >{{ idx + 1 }}</span>
                <!-- Avatar -->
                <div class="w-7 h-7 flex-shrink-0">
                  <MemberBlob :member="member" size="28px" />
                </div>
                <!-- Name -->
                <p class="text-xs font-medium text-slate-900 truncate flex-1">{{ member.name }}</p>
                <!-- Health -->
                <span class="text-xs font-bold flex-shrink-0"
                  :class="member.health > 0 ? healthColorClass2(member.health) : 'text-slate-300'"
                >
                  {{ member.health > 0 ? member.health + '%' : '—' }}
                  <span v-if="member.health > 0">{{ stressEmoji(member.health) }}</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Row 2: How It Works ↔ Top Poppers (aligned heights) -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch mt-6">

        <!-- ── Benchmark / How It Works (left 3/5) ──────────────────────── -->
        <div class="lg:col-span-3">
          <div class="card p-5 h-full flex flex-col">
            <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">How It Works</h2>
            <div class="flex gap-2 flex-1">
              <div
                v-for="tier in STRESS_TIERS"
                :key="tier.label"
                class="flex-1 text-center py-2.5 px-1.5 rounded-lg border text-xs flex flex-col items-center justify-center"
                :class="tier.bgClass"
              >
                <span class="text-xl">{{ tier.emoji }}</span>
                <p class="font-semibold leading-tight mt-1" :class="tier.textClass">{{ tier.label }}</p>
                <p class="text-slate-500 leading-tight mt-0.5">{{ tier.popsLabel }}</p>
                <p class="font-bold leading-tight" :class="tier.textClass">{{ tier.healthLabel }}</p>
              </div>
            </div>
            <p class="text-xs text-slate-400 mt-3">Fewer pops = calmer = higher health. Resist the urge.</p>
          </div>
        </div>

        <!-- ── Top Poppers (right 2/5) ──────────────────────────────────── -->
        <div class="lg:col-span-2">
          <div class="card p-4 h-full flex flex-col">
            <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Top Poppers</h2>
            <div v-if="topPoppers.length" class="space-y-2 flex-1">
              <div v-for="(entry, idx) in topPoppers" :key="entry.id" class="flex items-center gap-2">
                <span class="text-base flex-shrink-0 w-5 text-center">
                  {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉' }}
                </span>
                <div class="w-7 h-7 flex-shrink-0">
                  <MemberBlob :member="entry" size="28px" />
                </div>
                <p class="text-xs font-medium text-slate-900 truncate flex-1">{{ entry.name.split(' ')[0] }}</p>
                <span class="text-xs font-bold text-slate-800 flex-shrink-0">
                  {{ entry.bestScore }} <span class="font-normal text-slate-400">pops</span>
                </span>
              </div>
            </div>
            <p v-else class="text-xs text-slate-400 italic flex-1">No games played yet.</p>
            <div class="border-t border-slate-100 pt-2 flex items-center justify-between mt-auto">
              <span class="text-xs text-slate-500">Total pops logged</span>
              <span class="text-sm font-bold text-slate-900">{{ totalPops }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// ── "Play As" — always the logged-in user, no impersonation ─────────────────

// Find the team member whose name matches the logged-in user's Google name.
// Returns null if no match (guest mode).
const loggedInMemberId = computed(() => {
  if (!allMembers.value.length) return null
  if (!userStore.isLoggedIn || !userStore.currentUser.name) return null

  const userName = userStore.currentUser.name.toLowerCase().trim()
  const givenName = userStore.currentUser.givenName?.toLowerCase().trim()

  // Exact full-name match
  const exactMatch = allMembers.value.find((m) => m.name.toLowerCase().trim() === userName)
  if (exactMatch) return exactMatch.id

  // Given-name prefix match within the user's own team
  if (givenName) {
    const teamMatch = allMembers.value.find(
      (m) => m.teamId === userStore.selectedTeam && m.name.toLowerCase().startsWith(givenName)
    )
    if (teamMatch) return teamMatch.id
  }

  return null // guest — no matching team member
})

const isGuest = computed(() => loggedInMemberId.value === null)

const playingAsName = computed(() => {
  if (!userStore.isLoggedIn) return 'Guest'
  if (loggedInMemberId.value !== null) {
    return allMembers.value.find((m) => m.id === loggedInMemberId.value)?.name ?? userStore.currentUser.name
  }
  return userStore.currentUser.name || 'Guest'
})

// On mount: pull all scores from DB so leaderboard is always current
onMounted(async () => {
  await userStore.loadStressScores()
})

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

  // Inverted formula: fewer pops = less stressed = higher health (min 1%)
  const health = Math.max(1, Math.min(100, Math.round(100 - (score.value / 60) * 100)))
  lastHealth.value = health

  const tier = getTierByHealth(health)
  lastStress.value = {
    label: tier.label,
    emoji: tier.emoji,
    description: TIER_DESCRIPTIONS[tier.label] || '',
  }

  // Only save to leaderboard if the user maps to a real team member (not a guest)
  if (loggedInMemberId.value !== null) {
    isNewBest.value = userStore.saveStressTestScore(loggedInMemberId.value, score.value)
  } else {
    isNewBest.value = false
  }
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

function healthColorClass2(health) {
  if (health >= 67) return 'text-green-600'
  if (health >= 45) return 'text-yellow-600'
  if (health >= 18) return 'text-orange-600'
  return 'text-red-600'
}

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

// ── Top Poppers (engagement — highest raw pop count per member) ──────────────
const topPoppers = computed(() => {
  return [...allMembers.value]
    .map((m) => {
      const entry = userStore.stressTestScores[m.id]
      return { ...m, bestScore: entry?.highestPops ?? entry?.lastScore ?? entry?.bestScore ?? 0 }
    })
    .filter((m) => m.bestScore > 0)
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, 3)
})

const totalPops = computed(() =>
  Object.values(userStore.stressTestScores).reduce((sum, e) => sum + (e.totalPops ?? 0), 0)
)
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
