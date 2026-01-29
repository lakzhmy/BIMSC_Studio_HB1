// Centralized data layer for Lung Tower Studio
// This file contains all mock data - ready for database integration

// KPI Metrics for environmental and building performance
export const kpiMetrics = [
  {
    id: 'embodied-carbon',
    name: 'Embodied Carbon',
    value: 342,
    unit: 'kgCO₂e/m²',
    target: 400,
    status: 'good', // 'good', 'warning', 'critical'
    trend: 'down', // 'up', 'down', 'stable'
    changePercent: -14.5,
    description: 'Total carbon emissions from materials and construction',
    history: [380, 365, 358, 352, 342],
    category: 'environmental'
  },
  {
    id: 'facade-ratio',
    name: 'Facade to Floor Ratio',
    value: 0.28,
    unit: 'ratio',
    target: 0.35,
    status: 'good',
    trend: 'stable',
    changePercent: 2.1,
    description: 'Ratio of external facade area to total floor area',
    history: [0.29, 0.28, 0.27, 0.28, 0.28],
    category: 'design'
  },
  {
    id: 'daylight-factor',
    name: 'Daylight Factor',
    value: 4.2,
    unit: '%',
    target: 3.0,
    status: 'good',
    trend: 'up',
    changePercent: 8.3,
    description: 'Percentage of daylight availability in occupied spaces',
    history: [3.6, 3.8, 3.9, 4.1, 4.2],
    category: 'environmental'
  },
  {
    id: 'energy-intensity',
    name: 'Energy Intensity',
    value: 87,
    unit: 'kWh/m²/yr',
    target: 100,
    status: 'good',
    trend: 'down',
    changePercent: -6.8,
    description: 'Annual energy consumption per square meter',
    history: [102, 98, 92, 89, 87],
    category: 'environmental'
  },
  {
    id: 'structural-efficiency',
    name: 'Structural Efficiency',
    value: 92,
    unit: '%',
    target: 85,
    status: 'good',
    trend: 'up',
    changePercent: 5.2,
    description: 'Optimization of structural material usage',
    history: [85, 87, 89, 91, 92],
    category: 'structural'
  },
  {
    id: 'ventilation-rate',
    name: 'Natural Ventilation',
    value: 42.5,
    unit: 'm³/min',
    target: 35.0,
    status: 'good',
    trend: 'stable',
    changePercent: 1.2,
    description: 'Air flow rate through natural ventilation systems',
    history: [41.2, 42.0, 41.8, 42.3, 42.5],
    category: 'environmental'
  }
]

// Team structure and members
export const teams = [
  {
    id: 'structure',
    name: 'Green Structure',
    color: '#10b981',
    colorLight: '#86efac',
    colorDark: '#059669',
    description: 'Engineering and structural systems',
    members: [
      { id: 1, name: 'Sarah Chen', role: 'Lead Structural Engineer', status: 'online', avatar: { complexity: 45, speed: 2.5, wobble: 25, shade: 1 } },
      { id: 2, name: 'Marcus Wu', role: 'Structural Analyst', status: 'online', avatar: { complexity: 55, speed: 2, wobble: 30, shade: 3 } },
      { id: 3, name: 'Elena Rodriguez', role: 'Materials Specialist', status: 'away', avatar: { complexity: 50, speed: 2.2, wobble: 28, shade: 2 } }
    ],
    progress: 33,
    activeProjects: 5,
    completedTasks: 24
  },
  {
    id: 'program',
    name: 'Blue Program',
    color: '#3b82f6',
    colorLight: '#93c5fd',
    colorDark: '#2563eb',
    description: 'Spatial planning and user experience',
    members: [
      { id: 4, name: 'David Park', role: 'Program Lead', status: 'online', avatar: { complexity: 60, speed: 1.8, wobble: 35, shade: 0 } },
      { id: 5, name: 'Amara Okafor', role: 'Space Planner', status: 'online', avatar: { complexity: 48, speed: 2.3, wobble: 26, shade: 2 } },
      { id: 6, name: 'Lucas Ferreira', role: 'UX Architect', status: 'online', avatar: { complexity: 52, speed: 2.1, wobble: 29, shade: 4 } },
      { id: 7, name: 'Priya Sharma', role: 'Circulation Designer', status: 'away', avatar: { complexity: 58, speed: 1.9, wobble: 32, shade: 1 } }
    ],
    progress: 44,
    activeProjects: 7,
    completedTasks: 31
  },
  {
    id: 'data',
    name: 'Red Data',
    color: '#ef4444',
    colorLight: '#fca5a5',
    colorDark: '#dc2626',
    description: 'Analytics and performance optimization',
    members: [
      { id: 8, name: 'Kenji Tanaka', role: 'Data Lead', status: 'online', avatar: { complexity: 65, speed: 1.7, wobble: 38, shade: 3 } },
      { id: 9, name: 'Zara Ahmed', role: 'Performance Analyst', status: 'online', avatar: { complexity: 47, speed: 2.4, wobble: 24, shade: 1 } }
    ],
    progress: 22,
    activeProjects: 4,
    completedTasks: 18
  }
]

// Actions and tasks tracking
export const actions = [
  {
    id: 'act-001',
    title: 'Foundation Load Analysis Review',
    description: 'Complete structural load analysis for foundation design',
    team: 'structure',
    assignee: 'Sarah Chen',
    status: 'on-track',
    priority: 'high',
    dueDate: '2026-02-05',
    progress: 75,
    createdAt: '2026-01-15',
    tags: ['structural', 'foundations', 'analysis']
  },
  {
    id: 'act-002',
    title: 'Daylight Analysis - North Facade',
    description: 'Run daylight simulations for north facade optimization',
    team: 'data',
    assignee: 'Kenji Tanaka',
    status: 'warning',
    priority: 'high',
    dueDate: '2026-02-02',
    progress: 45,
    createdAt: '2026-01-20',
    tags: ['daylighting', 'simulation', 'facade']
  },
  {
    id: 'act-003',
    title: 'Core Circulation Refinement',
    description: 'Optimize vertical circulation and egress paths',
    team: 'program',
    assignee: 'David Park',
    status: 'on-track',
    priority: 'medium',
    dueDate: '2026-02-10',
    progress: 60,
    createdAt: '2026-01-18',
    tags: ['circulation', 'planning', 'egress']
  },
  {
    id: 'act-004',
    title: 'Material Carbon Assessment',
    description: 'Update embodied carbon calculations for new materials',
    team: 'structure',
    assignee: 'Elena Rodriguez',
    status: 'at-risk',
    priority: 'critical',
    dueDate: '2026-01-31',
    progress: 30,
    createdAt: '2026-01-22',
    tags: ['sustainability', 'carbon', 'materials']
  },
  {
    id: 'act-005',
    title: 'Space Program Validation',
    description: 'Validate space program against client requirements',
    team: 'program',
    assignee: 'Amara Okafor',
    status: 'on-track',
    priority: 'medium',
    dueDate: '2026-02-08',
    progress: 85,
    createdAt: '2026-01-12',
    tags: ['planning', 'validation', 'client']
  },
  {
    id: 'act-006',
    title: 'Energy Model Update',
    description: 'Incorporate latest facade design into energy model',
    team: 'data',
    assignee: 'Zara Ahmed',
    status: 'warning',
    priority: 'high',
    dueDate: '2026-02-03',
    progress: 50,
    createdAt: '2026-01-25',
    tags: ['energy', 'simulation', 'facade']
  },
  {
    id: 'act-007',
    title: 'Structural Grid Optimization',
    description: 'Explore alternative structural grid configurations',
    team: 'structure',
    assignee: 'Marcus Wu',
    status: 'on-track',
    priority: 'low',
    dueDate: '2026-02-15',
    progress: 40,
    createdAt: '2026-01-20',
    tags: ['structural', 'optimization', 'grid']
  },
  {
    id: 'act-008',
    title: 'Accessibility Compliance Check',
    description: 'Verify all spaces meet accessibility requirements',
    team: 'program',
    assignee: 'Lucas Ferreira',
    status: 'on-track',
    priority: 'high',
    dueDate: '2026-02-12',
    progress: 70,
    createdAt: '2026-01-16',
    tags: ['compliance', 'accessibility', 'code']
  }
]

// Meeting records and schedules
export const meetings = [
  {
    id: 'meet-001',
    title: 'Weekly Design Coordination',
    type: 'coordination',
    date: '2026-02-03',
    time: '10:00 AM',
    duration: 60,
    location: 'Conference Room A',
    attendees: ['Sarah Chen', 'David Park', 'Kenji Tanaka'],
    teams: ['structure', 'program', 'data'],
    status: 'scheduled',
    agenda: [
      'Review structural grid with program layout',
      'Discuss daylight analysis results',
      'Coordinate facade design changes'
    ],
    notes: ''
  },
  {
    id: 'meet-002',
    title: 'Client Presentation - Concept Design',
    type: 'presentation',
    date: '2026-02-07',
    time: '2:00 PM',
    duration: 90,
    location: 'Virtual - Teams',
    attendees: ['Sarah Chen', 'David Park', 'Elena Rodriguez', 'Amara Okafor'],
    teams: ['structure', 'program'],
    status: 'scheduled',
    agenda: [
      'Present updated concept design',
      'Review sustainability metrics',
      'Discuss timeline and next steps'
    ],
    notes: ''
  },
  {
    id: 'meet-003',
    title: 'Structural Review Session',
    type: 'technical',
    date: '2026-01-28',
    time: '9:00 AM',
    duration: 120,
    location: 'Studio',
    attendees: ['Sarah Chen', 'Marcus Wu', 'Elena Rodriguez'],
    teams: ['structure'],
    status: 'completed',
    agenda: [
      'Foundation design review',
      'Load path analysis',
      'Material selection discussion'
    ],
    notes: 'Foundation design approved. Need to follow up on material carbon calculations.'
  },
  {
    id: 'meet-004',
    title: 'Data Analytics Sprint Planning',
    type: 'planning',
    date: '2026-02-01',
    time: '11:00 AM',
    duration: 45,
    location: 'Virtual - Teams',
    attendees: ['Kenji Tanaka', 'Zara Ahmed'],
    teams: ['data'],
    status: 'scheduled',
    agenda: [
      'Define sprint goals',
      'Prioritize analysis tasks',
      'Assign responsibilities'
    ],
    notes: ''
  },
  {
    id: 'meet-005',
    title: 'Space Planning Workshop',
    type: 'workshop',
    date: '2026-01-26',
    time: '1:00 PM',
    duration: 180,
    location: 'Studio',
    attendees: ['David Park', 'Amara Okafor', 'Lucas Ferreira', 'Priya Sharma'],
    teams: ['program'],
    status: 'completed',
    agenda: [
      'Collaborative space planning session',
      'Circulation diagram development',
      'Vertical zoning strategy'
    ],
    notes: 'Productive session. Core location finalized. Need to validate egress paths.'
  }
]

// Project health metrics
export const projectHealth = {
  overall: 87,
  breakdown: {
    schedule: 92,
    budget: 85,
    quality: 88,
    team: 84
  },
  risks: [
    { id: 1, description: 'Material carbon data delayed', severity: 'medium', team: 'structure' },
    { id: 2, description: 'Daylight simulation timeline tight', severity: 'medium', team: 'data' }
  ],
  milestones: [
    { id: 1, name: 'Concept Design', date: '2026-02-15', status: 'on-track', progress: 85 },
    { id: 2, name: 'Schematic Design', date: '2026-03-30', status: 'on-track', progress: 35 },
    { id: 3, name: 'Design Development', date: '2026-05-15', status: 'pending', progress: 0 }
  ]
}

// Recent activity feed
export const recentActivity = [
  { id: 1, type: 'update', user: 'Sarah Chen', action: 'updated', target: 'Foundation Load Analysis', timestamp: '2h ago', team: 'structure' },
  { id: 2, type: 'comment', user: 'David Park', action: 'commented on', target: 'Core Circulation Refinement', timestamp: '3h ago', team: 'program' },
  { id: 3, type: 'complete', user: 'Amara Okafor', action: 'completed', target: 'Space Program Validation', timestamp: '5h ago', team: 'program' },
  { id: 4, type: 'create', user: 'Kenji Tanaka', action: 'created', target: 'Energy Model Update', timestamp: '1d ago', team: 'data' },
  { id: 5, type: 'update', user: 'Elena Rodriguez', action: 'updated', target: 'Material Carbon Assessment', timestamp: '1d ago', team: 'structure' }
]
