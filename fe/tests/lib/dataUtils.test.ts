import { describe, expect, it } from 'bun:test'
import {
  sumBy,
  calculatePercentage,
  joinNonEmpty,
  calculateAverage,
  calculateMax,
  calculateAvailableHoursLeft,
  formatNumber,
} from '../../lib/dataUtils'

describe('dataUtils', () => {
  describe('sumBy', () => {
    it('should sum numeric values by key', () => {
      const data = [{ hours: 2 }, { hours: 3 }, { hours: 5 }]
      expect(sumBy(data, 'hours')).toBe(10)
    })

    it('should handle empty array', () => {
      expect(sumBy([], 'value')).toBe(0)
    })

    it('should handle non-numeric values as 0', () => {
      const data = [{ value: 'abc' }, { value: 5 }, { value: null }]
      expect(sumBy(data, 'value')).toBe(5)
    })

    it('should handle undefined values as 0', () => {
      const data = [{ value: undefined }, { value: 10 }]
      expect(sumBy(data, 'value')).toBe(10)
    })

    it('should handle decimal values', () => {
      const data = [{ amount: 1.5 }, { amount: 2.5 }, { amount: 3.0 }]
      expect(sumBy(data, 'amount')).toBe(7)
    })

    it('should handle string numbers', () => {
      const data = [{ count: '5' }, { count: '10' }]
      expect(sumBy(data, 'count')).toBe(15)
    })
  })

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50)
      expect(calculatePercentage(1, 4)).toBe(25)
      expect(calculatePercentage(3, 4)).toBe(75)
    })

    it('should return 0 when total is 0', () => {
      expect(calculatePercentage(50, 0)).toBe(0)
    })

    it('should handle decimals', () => {
      expect(calculatePercentage(1, 3, 1)).toBe(33.3)
      expect(calculatePercentage(2, 3, 2)).toBe(66.67)
    })

    it('should handle 100%', () => {
      expect(calculatePercentage(100, 100)).toBe(100)
    })

    it('should handle values greater than total', () => {
      expect(calculatePercentage(150, 100)).toBe(150)
    })
  })

  describe('joinNonEmpty', () => {
    it('should join non-empty strings with default separator', () => {
      expect(joinNonEmpty(['Hello', 'World'])).toBe('Hello World')
    })

    it('should filter out empty strings', () => {
      expect(joinNonEmpty(['a', '', 'b', '', 'c'])).toBe('a b c')
    })

    it('should filter out null and undefined', () => {
      expect(joinNonEmpty(['first', null, 'second', undefined, 'third'])).toBe('first second third')
    })

    it('should use custom separator', () => {
      expect(joinNonEmpty(['one', 'two', 'three'], ', ')).toBe('one, two, three')
      expect(joinNonEmpty(['a', 'b', 'c'], '-')).toBe('a-b-c')
      expect(joinNonEmpty(['x', 'y'], ' | ')).toBe('x | y')
    })

    it('should return empty string for empty array', () => {
      expect(joinNonEmpty([])).toBe('')
    })

    it('should return empty string for all falsy values', () => {
      expect(joinNonEmpty([null, undefined, ''])).toBe('')
    })

    it('should handle single element', () => {
      expect(joinNonEmpty(['single'])).toBe('single')
    })
  })

  describe('calculateAverage', () => {
    it('should calculate average of numbers', () => {
      expect(calculateAverage([2, 4, 6])).toBe(4)
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3)
    })

    it('should return 0 for empty array', () => {
      expect(calculateAverage([])).toBe(0)
    })

    it('should handle single element', () => {
      expect(calculateAverage([10])).toBe(10)
    })

    it('should handle decimal values', () => {
      expect(calculateAverage([1.5, 2.5])).toBe(2)
    })

    it('should handle negative numbers', () => {
      expect(calculateAverage([-5, 5])).toBe(0)
      expect(calculateAverage([-10, -20])).toBe(-15)
    })
  })

  describe('calculateMax', () => {
    it('should find maximum value', () => {
      expect(calculateMax([1, 5, 3, 9, 2])).toBe(9)
    })

    it('should return default value for empty array', () => {
      expect(calculateMax([])).toBe(1)
      expect(calculateMax([], 10)).toBe(10)
    })

    it('should handle negative numbers', () => {
      expect(calculateMax([-5, -2, -10])).toBe(-2)
    })

    it('should handle single element', () => {
      expect(calculateMax([42])).toBe(42)
    })

    it('should handle decimal values', () => {
      expect(calculateMax([1.5, 2.7, 1.8])).toBe(2.7)
    })

    it('should handle all same values', () => {
      expect(calculateMax([5, 5, 5])).toBe(5)
    })
  })

  describe('calculateAvailableHoursLeft', () => {
    it('should calculate remaining hours from default 17', () => {
      expect(calculateAvailableHoursLeft(5)).toBe(12)
      expect(calculateAvailableHoursLeft(0)).toBe(17)
      expect(calculateAvailableHoursLeft(17)).toBe(0)
    })

    it('should not go below 0', () => {
      expect(calculateAvailableHoursLeft(20)).toBe(0)
      expect(calculateAvailableHoursLeft(100)).toBe(0)
    })

    it('should use custom total available hours', () => {
      expect(calculateAvailableHoursLeft(5, 10)).toBe(5)
      expect(calculateAvailableHoursLeft(8, 24)).toBe(16)
    })

    it('should handle decimal hours', () => {
      expect(calculateAvailableHoursLeft(5.5)).toBe(11.5)
    })
  })

  describe('formatNumber', () => {
    it('should format with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })

    it('should preserve decimals when not specified', () => {
      expect(formatNumber(1234.5)).toBe('1,234.5')
      expect(formatNumber(1234.567)).toBe('1,234.567')
    })

    it('should format with specified decimals', () => {
      expect(formatNumber(1234.567, 2)).toBe('1,234.57')
      expect(formatNumber(1234, 2)).toBe('1,234.00')
    })

    it('should handle small numbers', () => {
      expect(formatNumber(5)).toBe('5')
      expect(formatNumber(99)).toBe('99')
    })

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0')
    })
  })
})
