import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ThemeMode } from '@/composables/use-theme'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const themeMode = ref<ThemeMode>('dark')

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }

  return {
    sidebarCollapsed,
    themeMode,
    toggleSidebar,
    setSidebarCollapsed,
  }
})
