import { ref, onMounted, onUnmounted } from 'vue'

export function useFullscreen() {
  const isFullscreen = ref(false)

  const enterFullscreen = async (element?: HTMLElement) => {
    try {
      const el = element || document.documentElement
      await el.requestFullscreen()
      isFullscreen.value = true
    } catch (e) {
      console.error('Fullscreen request failed:', e)
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
      isFullscreen.value = false
    } catch (e) {
      console.error('Exit fullscreen failed:', e)
    }
  }

  const toggleFullscreen = async (element?: HTMLElement) => {
    if (isFullscreen.value) {
      await exitFullscreen()
    } else {
      await enterFullscreen(element)
    }
  }

  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
  })

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  }
}
