import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFullscreen } from '@/composables/use-fullscreen'

// Mock DOM Fullscreen API
const mockRequestFullscreen = vi.fn()
const mockExitFullscreen = vi.fn()

Object.defineProperty(document.documentElement, 'requestFullscreen', {
  value: mockRequestFullscreen,
  writable: true,
})

Object.defineProperty(document, 'exitFullscreen', {
  value: mockExitFullscreen,
  writable: true,
})

let fullscreenElementValue: Element | null = null
Object.defineProperty(document, 'fullscreenElement', {
  get() { return fullscreenElementValue },
  configurable: true,
})

describe('useFullscreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fullscreenElementValue = null
  })

  it('should start not in fullscreen mode', () => {
    const { isFullscreen } = useFullscreen()
    expect(isFullscreen.value).toBe(false)
  })

  it('should call requestFullscreen API and set state to true on enter', async () => {
    const { enterFullscreen, isFullscreen } = useFullscreen()

    mockRequestFullscreen.mockResolvedValueOnce(undefined)
    
    await enterFullscreen()
    
    // enterFullscreen calls requestFullscreen then sets isFullscreen = true
    expect(mockRequestFullscreen).toHaveBeenCalled()
    expect(isFullscreen.value).toBe(true)
  })

  it('should call exitFullscreen API when in fullscreen mode', async () => {
    const { exitFullscreen, isFullscreen } = useFullscreen()
    
    // Simulate being in fullscreen
    fullscreenElementValue = document.documentElement
    mockExitFullscreen.mockResolvedValueOnce(undefined)
    
    await exitFullscreen()
    
    // exitFullscreen checks document.fullscreenElement (truthy), calls API, then sets false
    expect(mockExitFullscreen).toHaveBeenCalled()
    expect(isFullscreen.value).toBe(false)
  })

  it('should not call exitFullscreen API when not in fullscreen', async () => {
    const { exitFullscreen } = useFullscreen()
    
    // Not in fullscreen - should skip the API call
    await exitFullscreen()
    
    expect(mockExitFullscreen).not.toHaveBeenCalled()
  })

  it('should enter fullscreen via toggle when not in fullscreen', async () => {
    const { toggleFullscreen, isFullscreen } = useFullscreen()
    
    mockRequestFullscreen.mockResolvedValueOnce(undefined)
    
    await toggleFullscreen()
    
    // isFullscreen was false, so toggle calls enterFullscreen
    expect(mockRequestFullscreen).toHaveBeenCalled()
    expect(isFullscreen.value).toBe(true)
  })

  it('should handle requestFullscreen rejection gracefully', async () => {
    const { enterFullscreen, isFullscreen } = useFullscreen()
    
    mockRequestFullscreen.mockRejectedValueOnce(new Error('denied'))
    
    // Should not throw, just log error
    await enterFullscreen()
    
    // isFullscreen stays false because the catch block doesn't set it
    expect(isFullscreen.value).toBe(false)
  })

  it('should handle exitFullscreen rejection gracefully', async () => {
    const { exitFullscreen, isFullscreen } = useFullscreen()
    
    fullscreenElementValue = document.documentElement
    mockExitFullscreen.mockRejectedValueOnce(new Error('denied'))
    
    await exitFullscreen()
    
    // Even on error, isFullscreen is set to false after the try block
    expect(isFullscreen.value).toBe(false)
  })
})
