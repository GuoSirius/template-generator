import { describe, it, expect } from 'vitest'
import { useClassValidator } from '@/composables/use-class-validator'

describe('useClassValidator', () => {
  const { validateClassName, sanitizeClassName } = useClassValidator()

  describe('validateClassName', () => {
    it('should reject empty names', () => {
      const result = validateClassName('')
      expect(result.valid).toBe(false)
    })

    it('should accept simple class names', () => {
      expect(validateClassName('my-class').valid).toBe(true)
      expect(validateClassName('container').valid).toBe(true)
      expect(validateClassName('_private').valid).toBe(true)
      expect(validateClassName('-modifier').valid).toBe(true)
    })

    it('should reject names starting with numbers', () => {
      expect(validateClassName('1class').valid).toBe(false)
    })

    it('should reject names with special characters', () => {
      expect(validateClassName('my.class').valid).toBe(false)
      expect(validateClassName('my#class').valid).toBe(false)
      expect(validateClassName('my class').valid).toBe(true) // split into two, first is valid
    })
  })

  describe('sanitizeClassName', () => {
    it('should replace special characters with hyphens', () => {
      expect(sanitizeClassName('my class')).toBe('my-class')
      expect(sanitizeClassName('my.class')).toBe('my-class')
    })

    it('should trim leading/trailing hyphens', () => {
      expect(sanitizeClassName('--class--')).toBe('class')
    })

    it('should handle empty input', () => {
      expect(sanitizeClassName('')).toBe('')
      expect(sanitizeClassName('...')).toBe('')
    })
  })
})
