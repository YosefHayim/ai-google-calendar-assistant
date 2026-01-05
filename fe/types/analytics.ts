import type { CalendarEvent, CalendarListEntry } from './api'

import type React from 'react'
import { z } from 'zod'

// --- Zod Schema Definitions ---

export const CalendarEventSchema = z.object({
  kind: z.string().optional(),
  etag: z.string().optional(),
  id: z.string(),
  status: z.string().optional(),
  htmlLink: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  creator: z
    .object({
      email: z.string().optional(),
      self: z.boolean().optional(),
    })
    .optional(),
  organizer: z
    .object({
      email: z.string().optional(),
      self: z.boolean().optional(),
    })
    .optional(),
  start: z.object({
    date: z.string().optional(),
    dateTime: z.string().optional(),
    timeZone: z.string().optional(),
  }),
  end: z.object({
    date: z.string().optional(),
    dateTime: z.string().optional(),
    timeZone: z.string().optional(),
  }),
  recurringEventId: z.string().optional(),
  originalStartTime: z
    .object({
      date: z.string().optional(),
      dateTime: z.string().optional(),
      timeZone: z.string().optional(),
    })
    .optional(),
  iCalUID: z.string().optional(),
  sequence: z.number().optional(),
  attendees: z
    .array(
      z.object({
        email: z.string().optional(),
        organizer: z.boolean().optional(),
        self: z.boolean().optional(),
        responseStatus: z.string().optional(),
      }),
    )
    .optional(),
  reminders: z
    .object({
      useDefault: z.boolean().optional(),
    })
    .optional(),
  eventType: z.string().optional(),
})

export const CalendarEventsGroupSchema = z.object({
  calendarId: z.string(),
  events: z.array(CalendarEventSchema),
})

export const AnalyticsResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    allEvents: z.array(CalendarEventsGroupSchema),
  }),
})

// --- Derived Types from Zod Schemas ---

export type AnalyticsEventData = z.infer<typeof CalendarEventSchema>
export type CalendarEventsGroup = z.infer<typeof CalendarEventsGroupSchema>
export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>

// --- Analytics Types ---

export interface CalendarBreakdownItem {
  category: string
  hours: number
  color: string
  calendarId?: string
}

export interface ProcessedActivity {
  action: string
  time: string
  icon: React.ElementType
  timestamp: number
  calendarName: string
  calendarId: string
  calendarColor: string
  event: CalendarEvent
}

export interface ProcessedAnalyticsData {
  totalEvents: number
  totalDurationHours: number
  averageEventDuration: number
  busiestDayHours: number
  calendarBreakdown: CalendarBreakdownItem[]
  recentActivities: ProcessedActivity[]
  dailyAvailableHours: DailyAvailableHoursDataPoint[]
}

// --- Comparison Types ---

export interface PeriodMetrics {
  totalEvents: number
  totalDurationHours: number
  averageEventDuration: number
  busiestDayHours: number
}

export interface TrendData {
  value: number
  previousValue: number
  percentageChange: number
  direction: 'up' | 'down' | 'neutral'
}

export interface ComparisonResult {
  current: PeriodMetrics
  previous: PeriodMetrics
  trends: {
    totalEvents: TrendData
    totalDuration: TrendData
    avgEventDuration: TrendData
    busiestDay: TrendData
  }
}

// --- Component Props Types ---

export interface TimeAllocationChartProps {
  data: CalendarBreakdownItem[]
  onCalendarClick?: (calendarId: string, calendarName: string, calendarColor: string) => void
  isLoading?: boolean
}

export type InsightColor = 'amber' | 'sky' | 'emerald' | 'rose' | 'indigo' | 'orange'

export interface InsightCardProps {
  icon: React.ElementType
  title: string
  value: string
  description: string
  color: InsightColor
}

export interface WeeklyInsight {
  icon: React.ElementType
  title: string
  value: string
  description: string
  color: InsightColor
}

export interface StatsCardProps {
  label: string
  value: number
  previousValue?: number
  suffix?: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  showTrend?: boolean
  trendDirection?: 'up' | 'down' | 'neutral'
  trendPercentage?: number
  sparklineData?: number[]
  isLoading?: boolean
}

export interface KPICardsSectionProps {
  totalEvents: number
  totalDurationHours: number
  averageEventDuration: number
  busiestDayHours: number
  comparison?: ComparisonResult | null
  isLoading?: boolean
}

// --- Dialog Props Types ---

export interface CalendarInfo {
  id: string
  name: string
  color: string
}

export interface EventDetailsDialogProps {
  isOpen: boolean
  event: CalendarEvent | null
  calendarColor: string
  calendarName: string
  onClose: () => void
}

export interface CalendarEventsDialogProps {
  isOpen: boolean
  calendarId: string
  calendarName: string
  calendarColor: string
  dateRange: { from: Date; to: Date } | undefined
  events: CalendarEvent[]
  isLoading: boolean
  totalHours?: number
  previousPeriodHours?: number
  percentageChange?: number
  onClose: () => void
  onEventClick: (event: CalendarEvent) => void
}

export interface CalendarSettingsDialogProps {
  isOpen: boolean
  calendar: CalendarListEntry | null
  onClose: () => void
}

export interface CreateCalendarDialogProps {
  isOpen: boolean
  existingCalendars: CalendarListEntry[]
  onClose: () => void
  onSuccess?: () => void
}

// --- Utility Types ---

export interface CalendarMap {
  [calendarId: string]: {
    name: string
    color: string
  }
}

export interface DailyAvailableHoursDataPoint {
  day: number
  date: string
  hours: number
}

// --- AI Insights Types ---

export const INSIGHT_ICON_NAMES = [
  'zap',
  'users',
  'coffee',
  'bar-chart',
  'calendar',
  'clock',
  'trending-up',
  'trending-down',
  'sun',
  'moon',
  'target',
  'activity',
  'award',
  'briefcase',
  'check-circle',
  'compass',
  'flame',
  'heart',
  'layers',
  'pie-chart',
] as const

export type InsightIconName = (typeof INSIGHT_ICON_NAMES)[number]

export interface AIInsight {
  id: string
  icon: InsightIconName
  title: string
  value: string
  description: string
  color: InsightColor
}

export interface AIInsightsResponse {
  insights: AIInsight[]
  generatedAt: string
  periodStart: string
  periodEnd: string
}
