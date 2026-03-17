import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useAnnotations } from './useAnnotations.js'
import { TOUR_STEPS_MAP } from '../data/tourStepsMap.js'

const { dbAnnotations, loadAnnotations } = useAnnotations()

function buildSteps(routeName) {
  const stepDefs = TOUR_STEPS_MAP[routeName] ?? []
  const routeAnnotations = dbAnnotations.value[routeName] ?? []
  const labelMap = Object.fromEntries(routeAnnotations.map((a) => [a.id, a.label]))

  return stepDefs
    .filter((def) => !!document.querySelector(def.selector))
    .map((def) => ({
      element: def.selector,
      popover: {
        title: def.title,
        description: labelMap[def.annId] ?? '',
        side: def.side ?? 'bottom',
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
