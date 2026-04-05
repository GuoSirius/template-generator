import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAppStore } from '@/stores/app'
import type { ThemeMode } from '@/composables/use-theme'

describe('useAppStore', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('should have default state', () => {
    const store = useAppStore()
    expect(store.sidebarCollapsed).toBe(false)
    expect(store.themeMode).toBe('dark')
  })

  describe('toggleSidebar', () => {
    it('should toggle sidebarCollapsed from false to true', () => {
      const store = useAppStore()
      expect(store.sidebarCollapsed).toBe(false)
      
      store.toggleSidebar()
      expect(store.sidebarCollapsed).toBe(true)
    })

    it('should toggle sidebarCollapsed from true to false', () => {
      const store = useAppStore()
      store.toggleSidebar() // now true
      
      store.toggleSidebar()
      expect(store.sidebarCollapsed).toBe(false)
    })
  })

  describe('setSidebarCollapsed', () => {
    it('should set specific collapsed value', () => {
      const store = useAppStore()
      
      store.setSidebarCollapsed(true)
      expect(store.sidebarCollapsed).toBe(true)
      
      store.setSidebarCollapsed(false)
      expect(store.sidebarCollapsed).toBe(false)
    })
  })

  describe('themeMode', () => {
    it('should allow setting themeMode', () => {
      const store = useAppStore()
      const modes: ThemeMode[] = ['light', 'dark', 'system']
      
      for (const mode of modes) {
        store.themeMode = mode
        expect(store.themeMode).toBe(mode)
      }
    })
  })
})
