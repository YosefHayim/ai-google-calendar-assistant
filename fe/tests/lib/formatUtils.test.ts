import { describe, expect, it } from 'bun:test'
import {
  DATE_FORMATS,
  formatDate,
  formatBlogDate,
  formatTimeRange,
  formatDuration,
  formatDurationMs,
  formatHours,
  formatMinutesAsHours,
  formatNumber,
  roundToDecimals,
  formatPercentage,
  calculatePercentage,
  formatCurrency,
  formatMoney,
  joinNonEmpty,
} from '../../lib/formatUtils'

describe('formatUtils', () => {
  describe('DATE_FORMATS', () => {
    it('should have all expected format constants', () => {
      expect(DATE_FORMATS.FULL).toBe('MMM d, yyyy')
      expect(DATE_FORMATS.FULL_LONG).toBe('MMMM d, yyyy')
      expect(DATE_FORMATS.SHORT).toBe('MMM d')
      expect(DATE_FORMATS.WEEKDAY_SHORT).toBe('EEE, MMM d')
      expect(DATE_FORMATS.WEEKDAY_FULL).toBe('EEEE, MMMM d, yyyy')
      expect(DATE_FORMATS.TIME_12H).toBe('h:mm a')
      expect(DATE_FORMATS.TIME_24H).toBe('HH:mm')
      expect(DATE_FORMATS.DATE_TIME).toBe("MMM d, yyyy 'at' h:mm a")
      expect(DATE_FORMATS.ISO_DATE).toBe('yyyy-MM-dd')
      expect(DATE_FORMATS.WEEKDAY_NAME).toBe('EEEE')
      expect(DATE_FORMATS.WEEKDAY_NAME_SHORT).toBe('EEE')
    })
  })

  describe('formatDate', () => {
    const testDate = new Date('2026-01-15T15:30:00')

    it('should format date with FULL format', () => {
      expect(formatDate(testDate, 'FULL')).toBe('Jan 15, 2026')
    })

    it('should format date with FULL_LONG format', () => {
      expect(formatDate(testDate, 'FULL_LONG')).toBe('January 15, 2026')
    })

    it('should format date with SHORT format', () => {
      expect(formatDate(testDate, 'SHORT')).toBe('Jan 15')
    })

    it('should format date with WEEKDAY_SHORT format', () => {
      expect(formatDate(testDate, 'WEEKDAY_SHORT')).toBe('Thu, Jan 15')
    })

    it('should format date with TIME_12H format', () => {
      expect(formatDate(testDate, 'TIME_12H')).toBe('3:30 PM')
    })

    it('should format date with TIME_24H format', () => {
      expect(formatDate(testDate, 'TIME_24H')).toBe('15:30')
    })

    it('should format date with ISO_DATE format', () => {
      expect(formatDate(testDate, 'ISO_DATE')).toBe('2026-01-15')
    })

    it('should format date with WEEKDAY_NAME format', () => {
      expect(formatDate(testDate, 'WEEKDAY_NAME')).toBe('Thursday')
    })

    it('should accept string date input', () => {
      expect(formatDate('2026-01-15', 'FULL')).toBe('Jan 15, 2026')
    })

    it('should accept timestamp input', () => {
      const timestamp = new Date('2026-01-15').getTime()
      expect(formatDate(timestamp, 'FULL')).toBe('Jan 15, 2026')
    })

    it('should accept custom format string', () => {
      expect(formatDate(testDate, 'dd/MM/yyyy')).toBe('15/01/2026')
    })
  })

  describe('formatBlogDate', () => {
    it('should format date in blog format', () => {
      expect(formatBlogDate('2026-01-15')).toBe('January 15, 2026')
    })

    it('should handle ISO date strings', () => {
      expect(formatBlogDate('2026-12-25T10:30:00.000Z')).toContain('December')
      expect(formatBlogDate('2026-12-25T10:30:00.000Z')).toContain('2026')
    })
  })

  describe('formatTimeRange', () => {
    it('should format time range correctly', () => {
      const result = formatTimeRange('2026-01-15T15:30:00', '2026-01-15T16:30:00')
      expect(result).toBe('3:30 PM - 4:30 PM')
    })

    it('should handle Date objects', () => {
      const start = new Date('2026-01-15T09:00:00')
      const end = new Date('2026-01-15T10:30:00')
      expect(formatTimeRange(start, end)).toBe('9:00 AM - 10:30 AM')
    })

    it('should handle midnight correctly', () => {
      const result = formatTimeRange('2026-01-15T00:00:00', '2026-01-15T01:00:00')
      expect(result).toBe('12:00 AM - 1:00 AM')
    })
  })

  describe('formatDuration', () => {
    describe('short style (default)', () => {
      it('should format minutes under 60', () => {
        expect(formatDuration(45)).toBe('45m')
        expect(formatDuration(1)).toBe('1m')
        expect(formatDuration(59)).toBe('59m')
      })

      it('should format exact hours', () => {
        expect(formatDuration(60)).toBe('1h')
        expect(formatDuration(120)).toBe('2h')
        expect(formatDuration(180)).toBe('3h')
      })

      it('should format hours with minutes', () => {
        expect(formatDuration(90)).toBe('1h 30m')
        expect(formatDuration(150)).toBe('2h 30m')
        expect(formatDuration(75)).toBe('1h 15m')
      })

      it('should round fractional minutes', () => {
        expect(formatDuration(45.4)).toBe('45m')
        expect(formatDuration(45.6)).toBe('46m')
      })
    })

    describe('long style', () => {
      it('should format minutes under 60 with full words', () => {
        expect(formatDuration(1, { style: 'long' })).toBe('1 minute')
        expect(formatDuration(45, { style: 'long' })).toBe('45 minutes')
      })

      it('should format exact hours with full words', () => {
        expect(formatDuration(60, { style: 'long' })).toBe('1 hour')
        expect(formatDuration(120, { style: 'long' })).toBe('2 hours')
      })

      it('should format hours with minutes using full words', () => {
        expect(formatDuration(90, { style: 'long' })).toBe('1 hour 30 minutes')
        expect(formatDuration(61, { style: 'long' })).toBe('1 hour 1 minute')
      })
    })

    it('should handle zero', () => {
      expect(formatDuration(0)).toBe('0m')
    })
  })

  describe('formatDurationMs', () => {
    it('should convert milliseconds to minutes and format', () => {
      expect(formatDurationMs(5400000)).toBe('1h 30m')
      expect(formatDurationMs(1800000)).toBe('30m')
      expect(formatDurationMs(3600000)).toBe('1h')
    })

    it('should support long style', () => {
      expect(formatDurationMs(5400000, { style: 'long' })).toBe('1 hour 30 minutes')
    })
  })

  describe('formatHours', () => {
    it('should format hours with default 1 decimal', () => {
      expect(formatHours(2.567)).toBe('2.6h')
      expect(formatHours(3)).toBe('3.0h')
    })

    it('should format hours with custom decimals', () => {
      expect(formatHours(2.567, 2)).toBe('2.57h')
      expect(formatHours(2.567, 0)).toBe('3h')
    })
  })

  describe('formatMinutesAsHours', () => {
    it('should convert minutes to hours and format', () => {
      expect(formatMinutesAsHours(150)).toBe('2.5h')
      expect(formatMinutesAsHours(45)).toBe('0.8h')
      expect(formatMinutesAsHours(60)).toBe('1.0h')
    })

    it('should support custom decimals', () => {
      expect(formatMinutesAsHours(95, 2)).toBe('1.58h')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with thousand separators', () => {
      expect(formatNumber(1234)).toBe('1,234')
      expect(formatNumber(1234567)).toBe('1,234,567')
      expect(formatNumber(100)).toBe('100')
    })

    it('should preserve original decimals when not specified', () => {
      expect(formatNumber(1234.5)).toBe('1,234.5')
      expect(formatNumber(1234.567)).toBe('1,234.567')
    })

    it('should format with specified decimals', () => {
      expect(formatNumber(1234.567, 2)).toBe('1,234.57')
      expect(formatNumber(1234, 2)).toBe('1,234.00')
      expect(formatNumber(1234.5, 0)).toBe('1,235')
    })
  })

  describe('roundToDecimals', () => {
    it('should round to default 1 decimal', () => {
      expect(roundToDecimals(2.567)).toBe(2.6)
      expect(roundToDecimals(2.544)).toBe(2.5)
    })

    it('should round to specified decimals', () => {
      expect(roundToDecimals(2.567, 2)).toBe(2.57)
      expect(roundToDecimals(2.5, 0)).toBe(3)
      expect(roundToDecimals(2.4, 0)).toBe(2)
    })

    it('should handle edge cases', () => {
      expect(roundToDecimals(0)).toBe(0)
      expect(roundToDecimals(1, 3)).toBe(1)
    })
  })

  describe('formatPercentage', () => {
    it('should calculate and format percentage', () => {
      expect(formatPercentage(3, 4)).toBe('75%')
      expect(formatPercentage(1, 2)).toBe('50%')
      expect(formatPercentage(1, 4)).toBe('25%')
    })

    it('should format with decimals', () => {
      expect(formatPercentage(1, 3, 1)).toBe('33.3%')
      expect(formatPercentage(2, 3, 2)).toBe('66.67%')
    })

    it('should handle zero total', () => {
      expect(formatPercentage(5, 0)).toBe('0%')
    })

    it('should handle zero value', () => {
      expect(formatPercentage(0, 10)).toBe('0%')
    })

    it('should handle 100%', () => {
      expect(formatPercentage(10, 10)).toBe('100%')
    })
  })

  describe('calculatePercentage', () => {
    it('should return percentage as number', () => {
      expect(calculatePercentage(3, 4)).toBe(75)
      expect(calculatePercentage(1, 2)).toBe(50)
    })

    it('should return with decimals', () => {
      expect(calculatePercentage(1, 3, 1)).toBe(33.3)
      expect(calculatePercentage(2, 3, 2)).toBe(66.67)
    })

    it('should handle zero total', () => {
      expect(calculatePercentage(5, 0)).toBe(0)
    })
  })

  describe('formatCurrency', () => {
    it('should format cents to USD by default', () => {
      expect(formatCurrency(1999)).toBe('$19.99')
      expect(formatCurrency(100)).toBe('$1.00')
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should format with different currencies', () => {
      expect(formatCurrency(1999, { currency: 'EUR' })).toBe('€19.99')
      expect(formatCurrency(1999, { currency: 'GBP' })).toBe('£19.99')
    })

    it('should handle custom fraction digits', () => {
      expect(formatCurrency(1000, { minimumFractionDigits: 0, maximumFractionDigits: 0 })).toBe('$10')
    })

    it('should handle large amounts', () => {
      expect(formatCurrency(1999999)).toBe('$19,999.99')
    })
  })

  describe('formatMoney', () => {
    it('should format dollars directly', () => {
      expect(formatMoney(19.99)).toBe('$19.99')
      expect(formatMoney(1)).toBe('$1.00')
      expect(formatMoney(0)).toBe('$0.00')
    })

    it('should format with different currencies', () => {
      expect(formatMoney(19.99, { currency: 'EUR' })).toBe('€19.99')
    })

    it('should handle custom fraction digits', () => {
      expect(formatMoney(10, { minimumFractionDigits: 0, maximumFractionDigits: 0 })).toBe('$10')
    })
  })

  describe('joinNonEmpty', () => {
    it('should join non-empty strings', () => {
      expect(joinNonEmpty(['Hello', 'World'])).toBe('Hello World')
    })

    it('should filter out empty strings', () => {
      expect(joinNonEmpty(['Hello', '', 'World'])).toBe('Hello World')
    })

    it('should filter out undefined and null', () => {
      expect(joinNonEmpty(['Hello', undefined, 'World', null])).toBe('Hello World')
    })

    it('should use custom separator', () => {
      expect(joinNonEmpty(['a', 'b', 'c'], ', ')).toBe('a, b, c')
      expect(joinNonEmpty(['a', 'b', 'c'], '-')).toBe('a-b-c')
    })

    it('should handle empty array', () => {
      expect(joinNonEmpty([])).toBe('')
    })

    it('should handle all empty/null values', () => {
      expect(joinNonEmpty(['', undefined, null])).toBe('')
    })
  })
})
