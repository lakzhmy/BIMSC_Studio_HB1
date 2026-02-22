import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { teams as sampleTeams } from '@/data/sampleData'
import { fetchKPIsByCategory } from '@/services/googleSheetsService'

const STORAGE_KEY = 'bimsc_studio_data'

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    console.error('Failed to save to localStorage')
  }
}

export const useUserStore = defineStore('user', () => {
  const storedData = loadFromStorage()

  function buildDefaultTeamMembers() {
    const defaults = { structure: [], program: [], data: [] }

    sampleTeams.forEach((team) => {
      if (!defaults[team.id]) {
        return
      }
      defaults[team.id] = (team.members || []).map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        mood: member.mood,
        status: member.status || 'online',
        avatar: member.avatar || {
          complexity: 50,
          speed: 2,
          wobble: 30,
          shade: 2
        }
      }))
    })

    return defaults
  }
  
  // State
  const currentUser = ref(storedData?.currentUser || {
    googleId: '',
    name: '',
    email: '',
    verifiedEmail: false,
    givenName: '',
    familyName: '',
    photoURL: '',
    locale: '',
  })

  const selectedTeam = ref(storedData?.selectedTeam || '')

  const avatarConfig = ref(storedData?.avatarConfig || {
    complexity: 50,
    speed: 2,
    wobble: 30,
    shade: 2,
  })

  const isLoggedIn = ref(storedData?.isLoggedIn || false)

  // Team Members State - stores user-added members per team
  const teamMembers = ref(storedData?.teamMembers || buildDefaultTeamMembers())
  const meetingNotes = ref(storedData?.meetingNotes || [
    { 
      id: 1, 
      text: 'Foundation Review completed', 
      team: 'structure', 
      time: '2h ago',
      completed: false,
      author: 'System'
    },
    { 
      id: 2, 
      text: 'UX Flow updates pending review', 
      team: 'program', 
      time: '4h ago',
      completed: false,
      author: 'System'
    },
    { 
      id: 3, 
      text: 'Analytics Sprint planned for next week', 
      team: 'data', 
      time: '1d ago',
      completed: true,
      author: 'System'
    },
  ])
  
  // Team Meetings - stores meetings per team
  const teamMeetings = ref(storedData?.teamMeetings || {
    structure: [],
    program: [],
    data: []
  })

  // Team Actions - stores actions assigned to team members
  const teamActions = ref(storedData?.teamActions || {
    structure: [],
    program: [],
    data: []
  })

  // Member Hours - tracks hours worked per member
  const memberHours = ref(storedData?.memberHours || {})

  // Stress Test Scores - best score per member (used for team health)
  const stressTestScores = ref(storedData?.stressTestScores || {})

  // Live KPI Health - updated by KPIDashboardView when data loads
  const kpiHealth = ref({ total: 0, onTarget: 0, warnings: 0 })

  function setKpiHealth(health) {
    kpiHealth.value = { ...health }
  }

  async function loadKpiHealth() {
    // Skip if already populated by KPIDashboardView's live selection
    if (kpiHealth.value.total > 0) return
    try {
      const [programData, structureData, dataData] = await Promise.all([
        fetchKPIsByCategory('program'),
        fetchKPIsByCategory('structure'),
        fetchKPIsByCategory('data'),
      ])

      const parse = (v) => {
        if (typeof v === 'number') return v
        const m = String(v || '').replace(/,/g, '').match(/-?\d*\.?\d+/)
        return m ? Number(m[0]) : 0
      }

      const msPerWeek = 7 * 24 * 60 * 60 * 1000
      const currentWeek = Math.max(1, Math.min(10,
        Math.round((Date.now() - new Date(2026, 0, 12).getTime()) / msPerWeek) + 1
      ))

      const bestWeekRow = (sheetData) => {
        if (!sheetData?.data?.length) return null
        const weeks = [...new Set(sheetData.data.map(r => r.week))].sort((a, b) => Number(a) - Number(b))
        const past = weeks.filter(w => Number(w) <= currentWeek)
        const targetWeek = past.length ? past[past.length - 1] : weeks[0]
        return sheetData.data.find(r => r.week === targetWeek) || null
      }

      let total = 0
      let onTarget = 0

      // Program: aggregate sum/avg vs targets
      if (programData?.data?.length) {
        const data = programData.data
        const targets = programData.targets || []
        const sum = (idx) => data.reduce((acc, r) => acc + parse((r.kpis || [])[idx]?.value), 0)
        const avg = (idx) => {
          const rows = data.filter(r => (r.kpis || [])[idx])
          return rows.length ? rows.reduce((acc, r) => acc + parse(r.kpis[idx].value), 0) / rows.length : 0
        }
        ;[sum(0), avg(1), avg(2)].forEach((v, i) => {
          total++
          if (parse(targets[i]) === 0 || v <= parse(targets[i])) onTarget++
        })
      }

      // Structure: use row closest to current week
      const strRow = bestWeekRow(structureData)
      if (strRow) {
        const targets = (structureData.targetsByScenario || {})[strRow.scenario] || []
        ;(strRow.kpis || []).forEach((kpi, i) => {
          total++
          if (parse(kpi.value) - parse(targets[i]) <= 0) onTarget++
        })
      }

      // Data: same
      const dataRow = bestWeekRow(dataData)
      if (dataRow) {
        const targets = (dataData.targetsByScenario || {})[dataRow.scenario] || []
        ;(dataRow.kpis || []).forEach((kpi, i) => {
          total++
          if (parse(kpi.value) - parse(targets[i]) <= 0) onTarget++
        })
      }

      kpiHealth.value = { total, onTarget, warnings: total - onTarget }
    } catch (err) {
      console.error('Failed to load KPI health:', err)
    }
  }
  // Actions
  function login({ email, name, photoURL, googleId, verifiedEmail, givenName, familyName, locale } = {}) {
    currentUser.value.googleId = googleId || ''
    currentUser.value.email = email || ''
    currentUser.value.name = name || email?.split('@')[0] || ''
    currentUser.value.verifiedEmail = verifiedEmail === 'true' || verifiedEmail === true
    currentUser.value.givenName = givenName || ''
    currentUser.value.familyName = familyName || ''
    currentUser.value.photoURL = photoURL || ''
    currentUser.value.locale = locale || ''
    isLoggedIn.value = true
    persistData()
  }

  function selectTeam(team) {
    selectedTeam.value = team
    persistData()
  }

  function updateAvatar(config) {
    avatarConfig.value = { ...avatarConfig.value, ...config }
    persistData()
  }

  function updateProfile(data) {
    if (data.name) currentUser.value.name = data.name
    if (data.email) currentUser.value.email = data.email
    if (data.team) selectedTeam.value = data.team
    if (data.avatar) avatarConfig.value = { ...avatarConfig.value, ...data.avatar }
    persistData()
  }

  function logout() {
    currentUser.value = { googleId: '', name: '', email: '', verifiedEmail: false, givenName: '', familyName: '', photoURL: '', locale: '' }
    selectedTeam.value = ''
    avatarConfig.value = { complexity: 50, speed: 2, wobble: 30 }
    isLoggedIn.value = false
    teamMembers.value = buildDefaultTeamMembers()
    teamMeetings.value = { structure: [], program: [], data: [] }
    teamActions.value = { structure: [], program: [], data: [] }
    memberHours.value = {}
    stressTestScores.value = {}
    persistData()
  }

  function persistData() {
    const dataToSave = {
      currentUser: currentUser.value,
      selectedTeam: selectedTeam.value,
      avatarConfig: avatarConfig.value,
      isLoggedIn: isLoggedIn.value,
      teamMembers: teamMembers.value,
      meetingNotes: meetingNotes.value,
      teamMeetings: teamMeetings.value,
      teamActions: teamActions.value,
      memberHours: memberHours.value,
      stressTestScores: stressTestScores.value
    }
    saveToStorage(dataToSave)
  }
  // Notes Management Actions
  function addNote(text) {
    if (!text || !text.trim()) return
    
    const newNote = {
      id: Date.now(),
      text: text.trim(),
      team: selectedTeam.value || 'program',
      time: 'Just now',
      completed: false,
      author: currentUser.value.name || 'You'
    }
    
    meetingNotes.value.unshift(newNote)
    persistData()
  }

  function toggleTask(id) {
    const note = meetingNotes.value.find(n => n.id === id)
    if (note) {
      note.completed = !note.completed
      persistData()
    }
  }

  function deleteNote(id) {
    const index = meetingNotes.value.findIndex(n => n.id === id)
    if (index > -1) {
      meetingNotes.value.splice(index, 1)
      persistData()
    }
  }

  // Team Members Management Actions
  function addTeamMember(teamId, memberData) {
    if (!teamMembers.value[teamId]) {
      teamMembers.value[teamId] = []
    }
    
    const newMember = {
      id: Date.now(),
      name: memberData.name,
      role: memberData.role,
      mood: memberData.mood,
      status: 'online',
      avatar: memberData.avatar || {
        complexity: 50,
        speed: 2,
        wobble: 30,
        shade: 2
      }
    }
    
    teamMembers.value[teamId].push(newMember)
    persistData()
    return newMember
  }

  function getTeamMembers(teamId) {
    return teamMembers.value[teamId] || []
  }

  function removeTeamMember(teamId, memberId) {
    if (teamMembers.value[teamId]) {
      const index = teamMembers.value[teamId].findIndex(m => m.id === memberId)
      if (index > -1) {
        teamMembers.value[teamId].splice(index, 1)
        persistData()
      }
    }
  }

  // Getters
  // Team Meetings Management
  function addTeamMeeting(teamId, meetingData) {
    if (!teamMeetings.value[teamId]) {
      teamMeetings.value[teamId] = []
    }
    const meeting = { id: Date.now(), ...meetingData }
    teamMeetings.value[teamId].push(meeting)
    persistData()
    return meeting
  }

  function getTeamMeetings(teamId) {
    return teamMeetings.value[teamId] || []
  }

  // Team Actions Management
  function addTeamAction(teamId, actionData) {
    if (!teamActions.value[teamId]) {
      teamActions.value[teamId] = []
    }
    const action = { id: Date.now(), ...actionData, status: actionData.status || 'pending' }
    teamActions.value[teamId].push(action)
    persistData()
    return action
  }

  function getTeamActions(teamId) {
    return teamActions.value[teamId] || []
  }

  function updateActionStatus(teamId, actionId, status) {
    if (teamActions.value[teamId]) {
      const action = teamActions.value[teamId].find(a => a.id === actionId)
      if (action) {
        action.status = status
        persistData()
      }
    }
  }

  // Member Hours Management
  function addMemberHours(memberId, hours, description = '') {
    if (!memberHours.value[memberId]) {
      memberHours.value[memberId] = []
    }
    memberHours.value[memberId].push({ id: Date.now(), hours, description, date: new Date().toISOString() })
    persistData()
  }

  function getTotalMemberHours(memberId) {
    return (memberHours.value[memberId] || []).reduce((total, entry) => total + entry.hours, 0)
  }

  // Stress Test Score Management
  // Inverted: fewer pops = less stressed = higher health
  // health = max(0, round(100 - (pops / 60) * 100))
  function computeStressHealth(score) {
    const raw = Math.max(0, Math.min(100, Math.round(100 - (score / 60) * 100)))
    // Minimum 1% so a played game always shows as recorded
    return Math.max(1, raw)
  }

  // Load all stress test scores from the database and merge into local state
  async function loadStressScores() {
    try {
      const res = await fetch('/api/stress-test/scores')
      if (!res.ok) return
      const rows = await res.json()
      rows.forEach((row) => {
        stressTestScores.value[row.member_id] = {
          lastScore: row.last_score,
          lastHealth: row.last_health,
          bestScore: row.best_score,
          bestHealth: row.best_health,
          highestPops: row.highest_pops,
          totalPops: row.total_pops,
          totalGames: row.total_games,
          timestamp: row.updated_at,
        }
      })
      persistData()
    } catch (err) {
      console.error('Failed to load stress scores from DB:', err)
    }
  }

  function saveStressTestScore(memberId, score) {
    const health = computeStressHealth(score)
    const existing = stressTestScores.value[memberId]
    const isNewBest = !existing || health > (existing.bestHealth ?? 0)
    const newEntry = {
      lastScore: score,
      lastHealth: health,
      bestScore: isNewBest ? score : (existing?.bestScore ?? score),
      bestHealth: isNewBest ? health : (existing?.bestHealth ?? health),
      highestPops: Math.max(score, existing?.highestPops ?? 0),
      totalPops: (existing?.totalPops ?? 0) + score,
      totalGames: (existing?.totalGames ?? 0) + 1,
      timestamp: new Date().toISOString(),
    }
    stressTestScores.value[memberId] = newEntry
    persistData()

    // Persist to database (fire-and-forget)
    fetch('/api/stress-test/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        member_id: memberId,
        google_id: currentUser.value.googleId || null,
        last_score: newEntry.lastScore,
        last_health: newEntry.lastHealth,
        best_score: newEntry.bestScore,
        best_health: newEntry.bestHealth,
        highest_pops: newEntry.highestPops,
        total_pops: newEntry.totalPops,
        total_games: newEntry.totalGames,
      }),
    }).catch((err) => console.error('Failed to save stress score to DB:', err))

    return isNewBest
  }

  function getMemberHealth(memberId) {
    const entry = stressTestScores.value[memberId]
    if (!entry) return 0
    // Use latest health so the UI always reflects the most recent game
    if (entry.lastHealth !== undefined) return entry.lastHealth
    if (entry.bestHealth !== undefined) return entry.bestHealth
    return computeStressHealth(entry.bestScore ?? entry.lastScore ?? 0)
  }

  function getTeamHealth(teamId) {
    const members = teamMembers.value[teamId] || []
    if (!members.length) return 0
    const total = members.reduce((sum, m) => sum + getMemberHealth(m.id), 0)
    return Math.round(total / members.length)
  }

  // Getters
  const teamColor = computed(() => {
    const colors = {
      structure: 'structure',
      program: 'program',
      data: 'data',
    }
    return colors[selectedTeam.value] || 'slate'
  })

  const teamName = computed(() => {
    const names = {
      structure: 'Green Structure',
      program: 'Blue Program',
      data: 'Red Data',
    }
    return names[selectedTeam.value] || 'No Team'
  })

  const activeNotes = computed(() => {
    return meetingNotes.value.filter(n => !n.completed)
  })

  const completedNotes = computed(() => {
    return meetingNotes.value.filter(n => n.completed)
  })

  return {
    // State
    currentUser,
    selectedTeam,
    avatarConfig,
    isLoggedIn,
    meetingNotes,
    teamMembers,
    teamMeetings,
    teamActions,
    memberHours,
    stressTestScores,
    kpiHealth,

    // Actions
    login,
    selectTeam,
    updateAvatar,
    updateProfile,
    logout,
    addNote,
    toggleTask,
    deleteNote,
    addTeamMember,
    getTeamMembers,
    removeTeamMember,
    addTeamMeeting,
    getTeamMeetings,
    addTeamAction,
    getTeamActions,
    updateActionStatus,
    addMemberHours,
    getTotalMemberHours,
    loadStressScores,
    saveStressTestScore,
    getMemberHealth,
    getTeamHealth,
    setKpiHealth,
    loadKpiHealth,

    // Getters
    teamColor,
    teamName,
    activeNotes,
    completedNotes,
  }
})
