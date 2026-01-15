import { describe, expect, it, beforeEach, afterEach } from 'bun:test'
import { INPUT_LIMITS, validateInputLength } from '../../lib/security/sanitize'

describe('sanitize', () => {
  describe('INPUT_LIMITS', () => {
    it('should have correct limit values', () => {
      expect(INPUT_LIMITS.CHAT_MESSAGE).toBe(5000)
      expect(INPUT_LIMITS.EVENT_TITLE).toBe(500)
      expect(INPUT_LIMITS.EVENT_DESCRIPTION).toBe(10000)
      expect(INPUT_LIMITS.MAX_FILE_SIZE_MB).toBe(10)
    })

    it('should have all required properties', () => {
      expect('CHAT_MESSAGE' in INPUT_LIMITS).toBe(true)
      expect('EVENT_TITLE' in INPUT_LIMITS).toBe(true)
      expect('EVENT_DESCRIPTION' in INPUT_LIMITS).toBe(true)
      expect('MAX_FILE_SIZE_MB' in INPUT_LIMITS).toBe(true)
    })
  })

  describe('validateInputLength', () => {
    describe('valid inputs', () => {
      it('should validate input within limit', () => {
        const result = validateInputLength('Hello', 100)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
        expect(result.remaining).toBe(95)
      })

      it('should validate input at exact limit', () => {
        const result = validateInputLength('12345', 5)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
        expect(result.remaining).toBe(0)
      })

      it('should handle empty input', () => {
        const result = validateInputLength('', 100)
        expect(result.isValid).toBe(true)
        expect(result.remaining).toBe(100)
      })

      it('should handle single character', () => {
        const result = validateInputLength('a', 1)
        expect(result.isValid).toBe(true)
        expect(result.remaining).toBe(0)
      })
    })

    describe('invalid inputs', () => {
      it('should invalidate input over limit by 1', () => {
        const result = validateInputLength('123456', 5)
        expect(result.isValid).toBe(false)
        expect(result.error).toBeDefined()
        expect(result.error).toContain('exceeds maximum length')
        expect(result.error).toContain('5')
        expect(result.error).toContain('1 over limit')
        expect(result.remaining).toBe(-1)
      })

      it('should show correct over-limit amount', () => {
        const result = validateInputLength('1234567890', 5)
        expect(result.error).toContain('5 over limit')
        expect(result.remaining).toBe(-5)
      })

      it('should invalidate significantly over limit', () => {
        const result = validateInputLength('x'.repeat(1000), 100)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('900 over limit')
      })
    })

    describe('real-world limits', () => {
      it('should validate chat messages under limit', () => {
        const chatMessage = 'x'.repeat(4999)
        const result = validateInputLength(chatMessage, INPUT_LIMITS.CHAT_MESSAGE)
        expect(result.isValid).toBe(true)
        expect(result.remaining).toBe(1)
      })

      it('should validate chat messages at limit', () => {
        const chatMessage = 'x'.repeat(5000)
        const result = validateInputLength(chatMessage, INPUT_LIMITS.CHAT_MESSAGE)
        expect(result.isValid).toBe(true)
        expect(result.remaining).toBe(0)
      })

      it('should invalidate chat messages over limit', () => {
        const overLimit = 'x'.repeat(5001)
        const result = validateInputLength(overLimit, INPUT_LIMITS.CHAT_MESSAGE)
        expect(result.isValid).toBe(false)
      })

      it('should validate event titles under limit', () => {
        const title = 'Meeting with team about Q2 planning'
        const result = validateInputLength(title, INPUT_LIMITS.EVENT_TITLE)
        expect(result.isValid).toBe(true)
      })

      it('should invalidate event titles over limit', () => {
        const longTitle = 'x'.repeat(501)
        const result = validateInputLength(longTitle, INPUT_LIMITS.EVENT_TITLE)
        expect(result.isValid).toBe(false)
      })

      it('should validate event descriptions under limit', () => {
        const description = 'x'.repeat(9999)
        const result = validateInputLength(description, INPUT_LIMITS.EVENT_DESCRIPTION)
        expect(result.isValid).toBe(true)
      })

      it('should invalidate event descriptions over limit', () => {
        const longDescription = 'x'.repeat(10001)
        const result = validateInputLength(longDescription, INPUT_LIMITS.EVENT_DESCRIPTION)
        expect(result.isValid).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('should handle unicode characters correctly', () => {
        const unicodeText = '🎉🎊🎈'
        const result = validateInputLength(unicodeText, 10)
        expect(result.isValid).toBe(true)
      })

      it('should handle multi-byte characters', () => {
        const hebrewText = 'שלום'
        const result = validateInputLength(hebrewText, 10)
        expect(result.isValid).toBe(true)
      })

      it('should handle whitespace', () => {
        const whitespace = '   '
        const result = validateInputLength(whitespace, 5)
        expect(result.isValid).toBe(true)
        expect(result.remaining).toBe(2)
      })

      it('should handle newlines', () => {
        const textWithNewlines = 'line1\nline2\nline3'
        const result = validateInputLength(textWithNewlines, 20)
        expect(result.isValid).toBe(true)
      })

      it('should handle zero max length', () => {
        const result = validateInputLength('a', 0)
        expect(result.isValid).toBe(false)
        expect(result.remaining).toBe(-1)
      })
    })
  })
})
