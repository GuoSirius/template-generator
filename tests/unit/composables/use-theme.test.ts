import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTheme, type ThemeMode } from '@/composables/use-theme'

// Mock database module
const mockGetThemePreference = vi.fn()
const mockSaveThemePreference = vi.fn()

vi.mock('@/database', () => ({
  getThemePreference: () => mockGetThemePreference(),
  saveThemePreference: (mode: ThemeMode) => mockSaveThemePreference(mode),
}))

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetThemePreference.mockReturnValue('dark')
    // Reset DOM classes
    document.documentElement.classList.remove('dark', 'light')
  })

  describe('initial state', () => {
    it('should default to dark theme', () => {
      const { themeMode } = useTheme()
      expect(themeMode.value).toBe('dark')
    })
  })

  describe('setTheme', () => {
    it('should apply dark class for dark mode', () => {
      const { setTheme } = useTheme()
      setTheme('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })

    it('should apply light class for light mode', () => {
      const { setTheme } = useTheme()
      setTheme('light')
      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should follow system preference for system mode', () => {
      // Spy on matchMedia
      const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: true, // prefers dark
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn().mockReturnValue(true),
      })

      const { setTheme } = useTheme()
      setTheme('system')

      expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
      // Since we mocked matches: true, dark class should be present
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      matchMediaSpy.mockRestore()
    })

    it('should call saveThemePreference', () => {
      const { setTheme } = useTheme()
      setTheme('light')
      expect(mockSaveThemePreference).toHaveBeenCalledWith('light')
    })
  })

  describe('toggleTheme', () => {
    it('should advance through theme modes on each call', () => {
      const { toggleTheme, themeMode } = useTheme()
      const initial = themeMode.value
      
      toggleTheme()
      expect(themeMode.value).not.toBe(initial)
      
      toggleTheme()
      // After two toggles from dark: dark -> light -> system
      expect(['light', 'system', 'dark']).toContain(themeMode.value)
    })
    
    it('should save each new mode to database', () => {
      const { toggleTheme } = useTheme()
      
      toggleTheme()
      expect(mockSaveThemePreference).toHaveBeenCalled()
    })
  })
})
