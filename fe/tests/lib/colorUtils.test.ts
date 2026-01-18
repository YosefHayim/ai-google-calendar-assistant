import { describe, expect, it } from 'bun:test'
import {
  getValidHexColor,
  getActivityLevelColor,
  getHealthActivityColor,
  getInsightColorClasses,
  type HealthActivity,
  type InsightColor,
} from '../../lib/colorUtils'

describe('colorUtils', () => {
  describe('getValidHexColor', () => {
    it('should return valid 6-digit hex colors unchanged', () => {
      expect(getValidHexColor('#6366f1')).toBe('#6366f1')
      expect(getValidHexColor('#FFFFFF')).toBe('#FFFFFF')
      expect(getValidHexColor('#000000')).toBe('#000000')
      expect(getValidHexColor('#AbCdEf')).toBe('#AbCdEf')
    })

    it('should return valid 3-digit hex colors unchanged', () => {
      expect(getValidHexColor('#fff')).toBe('#fff')
      expect(getValidHexColor('#000')).toBe('#000')
      expect(getValidHexColor('#ABC')).toBe('#ABC')
    })

    it('should return default for invalid colors', () => {
      expect(getValidHexColor('invalid')).toBe('#6366f1')
      expect(getValidHexColor('red')).toBe('#6366f1')
      expect(getValidHexColor('6366f1')).toBe('#6366f1')
      expect(getValidHexColor('#12345')).toBe('#6366f1')
      expect(getValidHexColor('#1234567')).toBe('#6366f1')
    })

    it('should return default for null, undefined, or empty', () => {
      expect(getValidHexColor(null)).toBe('#6366f1')
      expect(getValidHexColor(undefined)).toBe('#6366f1')
      expect(getValidHexColor('')).toBe('#6366f1')
    })

    it('should use custom fallback when provided', () => {
      expect(getValidHexColor('invalid', '#ff0000')).toBe('#ff0000')
      expect(getValidHexColor(null, '#00ff00')).toBe('#00ff00')
    })
  })

  describe('getActivityLevelColor', () => {
    it('should return muted color for zero activity', () => {
      expect(getActivityLevelColor(0)).toBe('bg-secondary dark:bg-secondary/50')
    })

    it('should return lightest primary for low activity (1-4)', () => {
      expect(getActivityLevelColor(1)).toBe('bg-primary/20')
      expect(getActivityLevelColor(4)).toBe('bg-primary/20')
    })

    it('should return medium primary for moderate activity (5-9)', () => {
      expect(getActivityLevelColor(5)).toBe('bg-primary/40')
      expect(getActivityLevelColor(9)).toBe('bg-primary/40')
    })

    it('should return darker primary for high activity (10-14)', () => {
      expect(getActivityLevelColor(10)).toBe('bg-primary/70')
      expect(getActivityLevelColor(14)).toBe('bg-primary/70')
    })

    it('should return full primary for very high activity (15+)', () => {
      expect(getActivityLevelColor(15)).toBe('bg-primary')
      expect(getActivityLevelColor(100)).toBe('bg-primary')
    })
  })

  describe('getHealthActivityColor', () => {
    it('should return emerald for Gym', () => {
      expect(getHealthActivityColor('Gym')).toBe('bg-emerald-500')
    })

    it('should return sky for Run', () => {
      expect(getHealthActivityColor('Run')).toBe('bg-sky-500')
    })

    it('should return indigo for Swim', () => {
      expect(getHealthActivityColor('Swim')).toBe('bg-indigo-500')
    })

    it('should return muted color for Rest and unknown types', () => {
      expect(getHealthActivityColor('Rest')).toBe('bg-secondary dark:bg-secondary/50')
      expect(getHealthActivityColor('Unknown' as HealthActivity)).toBe('bg-secondary dark:bg-secondary/50')
    })
  })

  describe('getInsightColorClasses', () => {
    it('should return correct classes for amber', () => {
      const result = getInsightColorClasses('amber')
      expect(result.bg).toBe('bg-amber-100/50 dark:bg-amber-900/30')
      expect(result.text).toBe('text-amber-700 dark:text-amber-500')
    })

    it('should return correct classes for sky', () => {
      const result = getInsightColorClasses('sky')
      expect(result.bg).toBe('bg-sky-100/50 dark:bg-sky-900/30')
      expect(result.text).toBe('text-sky-600 dark:text-sky-500')
    })

    it('should return correct classes for emerald', () => {
      const result = getInsightColorClasses('emerald')
      expect(result.bg).toBe('bg-emerald-100/50 dark:bg-emerald-900/30')
      expect(result.text).toBe('text-emerald-600 dark:text-emerald-500')
    })

    it('should return correct classes for rose', () => {
      const result = getInsightColorClasses('rose')
      expect(result.bg).toBe('bg-rose-100/50 dark:bg-rose-900/30')
      expect(result.text).toBe('text-rose-600 dark:text-rose-500')
    })

    it('should return correct classes for indigo', () => {
      const result = getInsightColorClasses('indigo')
      expect(result.bg).toBe('bg-indigo-100/50 dark:bg-indigo-900/30')
      expect(result.text).toBe('text-indigo-600 dark:text-indigo-500')
    })

    it('should return correct classes for orange', () => {
      const result = getInsightColorClasses('orange')
      expect(result.bg).toBe('bg-orange-100/50 dark:bg-orange-900/30')
      expect(result.text).toBe('text-orange-600 dark:text-orange-500')
    })

    it('should fallback to amber for unknown colors', () => {
      const result = getInsightColorClasses('unknown' as InsightColor)
      expect(result.bg).toBe('bg-amber-100/50 dark:bg-amber-900/30')
      expect(result.text).toBe('text-amber-700 dark:text-amber-500')
    })
  })
})
