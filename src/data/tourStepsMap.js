// Maps route name → ordered array of step configs.
// Selectors point to DOM elements that have id="tour-{annId}" in the view templates.
// Labels/descriptions come from the DB (via useAnnotations), so only structural info lives here.
export const TOUR_STEPS_MAP = {
  dashboard: [
    { annId: 'kpi-health',   selector: '#tour-kpi-health',   title: 'KPI Health',       side: 'bottom' },
    { annId: 'milestone',    selector: '#tour-milestone',    title: 'Milestones',       side: 'bottom' },
    { annId: 'team-health',  selector: '#tour-team-health',  title: 'Team Health',      side: 'bottom' },
    { annId: 'team-members', selector: '#tour-team-members', title: 'Team Members',     side: 'top'    },
  ],
  kpi: [
    { annId: 'kpi-table', selector: '#tour-kpi-table', title: 'KPI Cards',          side: 'top'  },
    { annId: 'kpi-radar', selector: '#tour-kpi-radar', title: 'Performance Radar',  side: 'top'  },
  ],
  'kpi-map': [
    { annId: 'kpi-network',    selector: '#tour-kpi-network',    title: 'Dependency Network', side: 'right' },
    { annId: 'kpi-map-filter', selector: '#tour-kpi-map-filter', title: 'Team Filters',       side: 'bottom' },
  ],
  timeline: [
    { annId: 'timeline-track', selector: '#tour-timeline-track', title: 'Timeline Track', side: 'top'    },
    { annId: 'timeline-add',   selector: '#tour-timeline-add',   title: 'Add Milestone',  side: 'bottom' },
  ],
  viewer: [
    { annId: 'viewer-3d', selector: '#tour-viewer-3d', title: '3D Model Viewer', side: 'right' },
  ],
  'stress-test': [
    { annId: 'stress-game',        selector: '#tour-stress-game',        title: 'Stress Game',    side: 'right'  },
    { annId: 'stress-leaderboard', selector: '#tour-stress-leaderboard', title: 'Leaderboard',    side: 'left'   },
  ],
}
