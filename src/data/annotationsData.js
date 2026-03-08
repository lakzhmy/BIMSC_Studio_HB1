// Annotation configs per route name.
//
// COORDINATE SYSTEM
//   x  →  fraction of the DESIGN viewport width  (0 = left edge, 1 = right edge)
//   y  →  fraction of the DESIGN viewport height (0 = top, 1 = bottom)
//
// Coordinates are stored relative to the viewport at authoring time ("design viewport").
// The design viewport is auto-saved to localStorage when an admin saves any annotation.
// This keeps annotations correctly aligned at any browser zoom level.
//
// arrowPath: [[x1,y1], [cx1,cy1], [cx2,cy2], [x2,y2]]
//   cubic bezier — index 0 = arrow tail (near label), index 3 = arrowhead tip (on UI element)
// labelAnchor: { x, y } — top-left corner of the label box
//
// TUNING
//   Open the page at 100 % zoom, press Space, open DevTools console and run:
//     el = document.querySelector('.some-selector')
//     r  = el.getBoundingClientRect()
//     xFrac = r.left / window.innerWidth
//     yFrac = (r.top + window.scrollY) / window.innerHeight
//   Use xFrac / yFrac as the arrowhead tip coordinates (index 3 of arrowPath).
//   Always tune at 100 % browser zoom so the saved design viewport matches.

export const annotations = {
  dashboard: [
    {
      id: 'kpi-health',
      arrowPath: [
        [0.08, 0.50],
        [0.06, 0.40],
        [0.14, 0.32],
        [0.22, 0.34],
      ],
      label: 'KPI health and Warning detecting\nbased on set targets.\nConnected to the KPI Tab.',
      labelAnchor: { x: 0.03, y: 0.51 },
      color: '#c0392b',
    },
    {
      id: 'milestone',
      arrowPath: [
        [0.38, 0.62],
        [0.40, 0.52],
        [0.42, 0.42],
        [0.44, 0.34],
      ],
      label: 'Milestones summary to keep\nthe motivation up. Connected\nto the Timeline Tab.',
      labelAnchor: { x: 0.28, y: 0.62 },
      color: '#c0392b',
    },
    {
      id: 'team-health',
      arrowPath: [
        [0.88, 0.50],
        [0.90, 0.42],
        [0.86, 0.34],
        [0.76, 0.34],
      ],
      label: 'Team Health calculated\nfrom the "Stress Test"\nmini game.',
      labelAnchor: { x: 0.82, y: 0.51 },
      color: '#c0392b',
    },
    {
      id: 'team-members',
      arrowPath: [
        [0.84, 0.86],
        [0.78, 0.82],
        [0.60, 0.76],
        [0.48, 0.72],
      ],
      label: 'Team members with their\npersonal avatar and info.',
      labelAnchor: { x: 0.78, y: 0.87 },
      color: '#c0392b',
    },
  ],

  kpi: [
    {
      id: 'kpi-table',
      arrowPath: [
        [0.08, 0.48],
        [0.06, 0.38],
        [0.12, 0.30],
        [0.24, 0.32],
      ],
      label: 'KPI cards pulled live from\nGoogle Sheets. Green = on target,\nRed = outside target range.',
      labelAnchor: { x: 0.03, y: 0.49 },
      color: '#c0392b',
    },
    {
      id: 'kpi-radar',
      arrowPath: [
        [0.80, 0.56],
        [0.82, 0.48],
        [0.78, 0.40],
        [0.68, 0.42],
      ],
      label: 'Radar chart: relative KPI\nperformance per team.\nUse toggles to filter teams.',
      labelAnchor: { x: 0.74, y: 0.57 },
      color: '#c0392b',
    },
  ],

  'kpi-map': [
    {
      id: 'kpi-network',
      arrowPath: [
        [0.08, 0.52],
        [0.06, 0.42],
        [0.14, 0.36],
        [0.28, 0.42],
      ],
      label: 'KPI dependency network.\nNodes represent design parameters.\nDrag to reorganise.',
      labelAnchor: { x: 0.03, y: 0.53 },
      color: '#c0392b',
    },
    {
      id: 'kpi-map-filter',
      arrowPath: [
        [0.82, 0.24],
        [0.84, 0.18],
        [0.88, 0.14],
        [0.92, 0.13],
      ],
      label: 'Filter by team to highlight\nrelevant KPI connections.',
      labelAnchor: { x: 0.72, y: 0.25 },
      color: '#c0392b',
    },
  ],

  timeline: [
    {
      id: 'timeline-track',
      arrowPath: [
        [0.10, 0.46],
        [0.08, 0.36],
        [0.16, 0.28],
        [0.30, 0.32],
      ],
      label: 'Weekly milestone track.\nEach lane = one team.\nToday marker shows current week.',
      labelAnchor: { x: 0.04, y: 0.47 },
      color: '#c0392b',
    },
    {
      id: 'timeline-add',
      arrowPath: [
        [0.76, 0.22],
        [0.80, 0.17],
        [0.86, 0.14],
        [0.90, 0.15],
      ],
      label: 'Add Milestone to log\nteam deliverables.',
      labelAnchor: { x: 0.66, y: 0.22 },
      color: '#c0392b',
    },
  ],

  viewer: [
    {
      id: 'viewer-3d',
      arrowPath: [
        [0.10, 0.54],
        [0.08, 0.44],
        [0.16, 0.36],
        [0.30, 0.42],
      ],
      label: '3D model viewer powered by\nSpeckle. Navigate with mouse.\nToggle model versions on the right.',
      labelAnchor: { x: 0.04, y: 0.55 },
      color: '#c0392b',
    },
  ],

  'stress-test': [
    {
      id: 'stress-game',
      arrowPath: [
        [0.10, 0.56],
        [0.08, 0.46],
        [0.16, 0.38],
        [0.30, 0.44],
      ],
      label: 'Pop the blobs to score.\nYour result becomes your\npersonal Health score.',
      labelAnchor: { x: 0.03, y: 0.57 },
      color: '#c0392b',
    },
    {
      id: 'stress-leaderboard',
      arrowPath: [
        [0.82, 0.50],
        [0.84, 0.42],
        [0.80, 0.36],
        [0.72, 0.38],
      ],
      label: 'Team calmness ranking\nand health breakdown\nper member.',
      labelAnchor: { x: 0.76, y: 0.51 },
      color: '#c0392b',
    },
  ],
}
