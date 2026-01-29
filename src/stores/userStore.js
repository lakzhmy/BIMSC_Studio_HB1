import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  
  // State
  const currentUser = ref(storedData?.currentUser || {
    name: '',
    email: '',
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
  const teamMembers = ref(storedData?.teamMembers || {
    structure: [],
    program: [],
    data: []
  })
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
  // Actions
  function login(email, name = '') {
    currentUser.value.email = email
    currentUser.value.name = name || email.split('@')[0]
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
    currentUser.value = { name: '', email: '' }
    selectedTeam.value = ''
    avatarConfig.value = { complexity: 50, speed: 2, wobble: 30 }
    isLoggedIn.value = false
    teamMembers.value = { structure: [], program: [], data: [] }
    teamMeetings.value = { structure: [], program: [], data: [] }
    teamActions.value = { structure: [], program: [], data: [] }
    memberHours.value = {}
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
      memberHours: memberHours.value
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
    
    // Getters
    teamColor,
    teamName,
    activeNotes,
    completedNotes,
  }
})
