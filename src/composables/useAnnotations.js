import { ref } from 'vue'

// Singleton state — shared across all components that call useAnnotations()
const isVisible = ref(false)
let listenerRegistered = false

export function useAnnotations() {
  function toggleAnnotations() {
    isVisible.value = !isVisible.value
  }

  function hideAnnotations() {
    isVisible.value = false
  }

  function registerKeyListener() {
    if (listenerRegistered) return
    listenerRegistered = true

    window.addEventListener('keydown', (event) => {
      const tag = document.activeElement?.tagName?.toLowerCase()
      if (['input', 'textarea', 'select'].includes(tag)) return
      if (document.activeElement?.contentEditable === 'true') return

      if (event.code === 'Space') {
        event.preventDefault()
        toggleAnnotations()
      }
      if (event.code === 'Escape') {
        hideAnnotations()
      }
    })
  }

  return { isVisible, toggleAnnotations, hideAnnotations, registerKeyListener }
}
