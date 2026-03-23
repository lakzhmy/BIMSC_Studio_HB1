import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useAnnotations } from './useAnnotations.js'

const { dbAnnotations, loadAnnotations } = useAnnotations()

function buildSteps(routeName) {
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
