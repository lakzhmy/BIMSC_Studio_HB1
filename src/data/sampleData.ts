// Sample data for KPI Dashboard
// This would typically come from Supabase in production

export interface KPISnapshot {
  id: string;
  date: string;
  embodied_carbon: number; // kgCO2e/m²
  floor_area: number; // m²
  energy_use: number; // kWh/m²/year
  facade_ratio: number; // window-to-wall ratio %
  structural_efficiency: number; // kg steel/m²
  daylight_factor: number; // % of spaces with adequate daylight
}

export interface Team {
  id: string;
  name: string;
  color: string;
  members: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  team: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignee: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  team: string;
  attendees: string[];
  summary: string;
  actionItems: string[];
}

// Teams data
export const teams: Team[] = [
  {
    id: 'structure-facade',
    name: 'Structure/Facade',
    color: '#ef4444',
    members: ['Alex', 'Maria', 'Chen'],
  },
  {
    id: 'program',
    name: 'Program',
    color: '#22c55e',
    members: ['Sofia', 'James', 'Yuki'],
  },
  {
    id: 'data',
    name: 'Data',
    color: '#3b82f6',
    members: ['Lakzhmy', 'Omar', 'Nina'],
  },
];

// Historical KPI data for charts
export const kpiHistory: KPISnapshot[] = [
  { id: '1', date: '2025-01-01', embodied_carbon: 450, floor_area: 12000, energy_use: 120, facade_ratio: 35, structural_efficiency: 45, daylight_factor: 65 },
  { id: '2', date: '2025-01-08', embodied_carbon: 440, floor_area: 12500, energy_use: 115, facade_ratio: 38, structural_efficiency: 43, daylight_factor: 68 },
  { id: '3', date: '2025-01-15', embodied_carbon: 420, floor_area: 13000, energy_use: 110, facade_ratio: 40, structural_efficiency: 42, daylight_factor: 72 },
  { id: '4', date: '2025-01-22', embodied_carbon: 410, floor_area: 13200, energy_use: 108, facade_ratio: 42, structural_efficiency: 40, daylight_factor: 75 },
  { id: '5', date: '2025-01-29', embodied_carbon: 395, floor_area: 13500, energy_use: 105, facade_ratio: 44, structural_efficiency: 38, daylight_factor: 78 },
  { id: '6', date: '2025-02-05', embodied_carbon: 385, floor_area: 13800, energy_use: 102, facade_ratio: 45, structural_efficiency: 36, daylight_factor: 80 },
  { id: '7', date: '2025-02-12', embodied_carbon: 370, floor_area: 14000, energy_use: 98, facade_ratio: 46, structural_efficiency: 35, daylight_factor: 82 },
  { id: '8', date: '2025-02-19', embodied_carbon: 360, floor_area: 14200, energy_use: 95, facade_ratio: 48, structural_efficiency: 34, daylight_factor: 84 },
];

// Current KPI values with targets
export const currentKPIs = {
  embodied_carbon: {
    value: 360,
    target: 350,
    unit: 'kgCO2e/m²',
    trend: -12.5,
    status: 'warning' as const,
    description: 'Embodied Carbon',
    team: 'structure-facade',
  },
  floor_area: {
    value: 14200,
    target: 15000,
    unit: 'm²',
    trend: 8.3,
    status: 'on-track' as const,
    description: 'Total Floor Area',
    team: 'program',
  },
  energy_use: {
    value: 95,
    target: 100,
    unit: 'kWh/m²/yr',
    trend: -15.2,
    status: 'on-track' as const,
    description: 'Energy Use Intensity',
    team: 'data',
  },
  facade_ratio: {
    value: 48,
    target: 45,
    unit: '%',
    trend: 6.7,
    status: 'over' as const,
    description: 'Window-Wall Ratio',
    team: 'structure-facade',
  },
  structural_efficiency: {
    value: 34,
    target: 35,
    unit: 'kg/m²',
    trend: -18.5,
    status: 'on-track' as const,
    description: 'Steel Usage',
    team: 'structure-facade',
  },
  daylight_factor: {
    value: 84,
    target: 80,
    unit: '%',
    trend: 12.3,
    status: 'on-track' as const,
    description: 'Daylight Compliance',
    team: 'program',
  },
};

// Sample action items
export const actionItems: ActionItem[] = [
  {
    id: '1',
    title: 'Optimize facade panels for carbon reduction',
    description: 'Review facade panel options to reduce embodied carbon by 15%',
    team: 'structure-facade',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2025-02-25',
    assignee: 'Alex',
  },
  {
    id: '2',
    title: 'Update floor area calculations',
    description: 'Incorporate latest design changes into GFA calculations',
    team: 'program',
    status: 'todo',
    priority: 'medium',
    dueDate: '2025-02-28',
    assignee: 'Sofia',
  },
  {
    id: '3',
    title: 'Run energy simulation batch',
    description: 'Execute energy simulations for 5 design variants',
    team: 'data',
    status: 'done',
    priority: 'high',
    dueDate: '2025-02-20',
    assignee: 'Lakzhmy',
  },
  {
    id: '4',
    title: 'Review structural grid options',
    description: 'Compare 8m vs 9m grid spacing for efficiency',
    team: 'structure-facade',
    status: 'todo',
    priority: 'medium',
    dueDate: '2025-03-01',
    assignee: 'Chen',
  },
  {
    id: '5',
    title: 'Daylight analysis for podium levels',
    description: 'Verify daylight compliance for retail and lobby spaces',
    team: 'program',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2025-02-22',
    assignee: 'James',
  },
];

// Sample meetings
export const meetings: Meeting[] = [
  {
    id: '1',
    title: 'Weekly Design Coordination',
    date: '2025-02-19T10:00:00',
    team: 'all',
    attendees: ['Alex', 'Sofia', 'Lakzhmy', 'Maria', 'James'],
    summary: 'Reviewed facade optimization results. Agreed to proceed with option B.',
    actionItems: ['1', '4'],
  },
  {
    id: '2',
    title: 'Structure/Facade Team Sync',
    date: '2025-02-18T14:00:00',
    team: 'structure-facade',
    attendees: ['Alex', 'Maria', 'Chen'],
    summary: 'Discussed steel reduction strategies. Chen to prepare comparison study.',
    actionItems: ['1'],
  },
  {
    id: '3',
    title: 'Data Team Analysis Review',
    date: '2025-02-17T11:00:00',
    team: 'data',
    attendees: ['Lakzhmy', 'Omar', 'Nina'],
    summary: 'Completed energy simulation batch. Results show 5% improvement.',
    actionItems: ['3'],
  },
];
