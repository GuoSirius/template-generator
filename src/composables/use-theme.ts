import { ref, watch, onMounted } from 'vue'
import { getThemePreference, saveThemePreference } from '@/database'

export type ThemeMode = 'light' | 'dark' | 'system'

const currentMode = ref<ThemeMode>('dark')

export function useTheme() {
  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
      root.classList.toggle('light', !prefersDark)
    } else {
      root.classList.toggle('dark', mode === 'dark')
      root.classList.toggle('light', mode === 'light')
    }
  }

  const setTheme = (mode: ThemeMode) => {
    currentMode.value = mode
    applyTheme(mode)
    saveThemePreference(mode)
  }

  const toggleTheme = () => {
    const modes: ThemeMode[] = ['dark', 'light', 'system']
    const idx = modes.indexOf(currentMode.value)
    const next = modes[(idx + 1) % modes.length]
    setTheme(next)
  }

  const initTheme = async () => {
    const saved = await getThemePreference()
    currentMode.value = saved as ThemeMode
    applyTheme(currentMode.value)

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (currentMode.value === 'system') {
        applyTheme('system')
      }
    })
  }

  onMounted(() => {
    initTheme()
  })

  watch(currentMode, (val) => {
    applyTheme(val)
  })

  return {
    themeMode: currentMode,
    setTheme,
    toggleTheme,
    initTheme,
  }
}
