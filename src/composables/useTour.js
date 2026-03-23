import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useAnnotations } from './useAnnotations.js'

const { dbAnnotations, loadAnnotations } = useAnnotations()

// Routes listed here bypass the DB entirely — steps are hardcoded below.
// Use this for public pages where admins cannot use the element picker
// (e.g. /tower redirects logged-in users away via the router guard).
const HARDCODED_TOURS = {
  tower: [
    {
      element: '#tour-tower-hero',
      popover: {
        title: 'HB01 — The Lungs',
        description: 'A hyperbuilding studio project set in Santiago, Chile. The tower is a conceptual exploration of a building that functions as a living respiratory system — drawing air in, filtering it through its structure, and releasing it clean.',
        side: 'bottom', align: 'center',
      },
    },
    {
      element: '#tour-tower-concept',
      popover: {
        title: 'A Building that Breathes',
        description: 'The central design concept: every structural decision, spatial layout, and data flow mirrors the rhythm of a respiratory system — intake, distribution, and release. Structure, Program, and Data act as the organs of a single living body.',
        side: 'bottom', align: 'center',
      },
    },
    {
      element: '#tour-tower-structure',
      popover: {
        title: 'Structure',
        description: 'Inspired by the bronchioles of the human lung, a porous structural core with Voronoi-shaped voids acts as the air-filtration facade. Dirty air enters from the sides, passes through the structure, and exits clean from the top — purification is not an add-on, it is the architecture.',
        side: 'top', align: 'center',
      },
    },
    {
      element: '#tour-tower-program',
      popover: {
        title: 'Program',
        description: 'The tower spans 210 floors and over 1,000,000 m² of total built area, housing 5,200 residential units, 48 office floor plates, and 10,000 parking spaces across Core, Capsule, Podium, and Bridge components — with a peak occupancy of 42,000 people.',
        side: 'top', align: 'center',
      },
    },
    {
      element: '#tour-tower-data',
      popover: {
        title: 'Data',
        description: 'Three HB01 towers reach 400m, 500m, and 600m — surpassing the Eiffel Tower and Shanghai Tower. Together they filter 12,000,000 m³ of air per year (≈ 4,800 mature trees). Targets: Net Zero by 2040, LEED Platinum, and embodied carbon below 350 kgCO₂e/m².',
        side: 'top', align: 'center',
      },
    },
  ],
}

function buildSteps(routeName) {
  if (HARDCODED_TOURS[routeName]) {
    return HARDCODED_TOURS[routeName].filter((s) => {
      try { return !!document.querySelector(s.element) } catch { return false }
    })
  }

  const routeAnnotations = dbAnnotations.value[routeName] ?? []
  return routeAnnotations
    .filter((a) => a.selector && !!document.querySelector(a.selector))
    .map((a) => ({
      element: a.selector,
      popover: {
        title: a.title ?? '',
        description: a.label ?? '',
        side: a.side ?? 'bottom',
        align: 'center',
      },
    }))
}

export function useTour() {
  async function startTour(routeName) {
    // Ensure annotations are loaded before building steps
    if (!Object.keys(dbAnnotations.value).length) {
      await loadAnnotations()
    }

    const steps = buildSteps(routeName)
    if (!steps.length) return

    const driverObj = driver({
      showProgress: true,
      overlayColor: '#1a1a2e',
      overlayOpacity: 0.65,
      stagePadding: 10,
      stageRadius: 6,
      popoverClass: 'bimsc-tour-popover',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done',
      steps,
    })

    driverObj.drive()
  }

  return { startTour }
}
