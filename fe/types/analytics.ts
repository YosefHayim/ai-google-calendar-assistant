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

// --- Enhanced Analytics Types ---

export interface PatternEventSummary {
  id: string
  summary: string
  startTime: string
  endTime: string
  durationMinutes: number
  calendarName: string
  calendarColor: string
}

export interface WeeklyPatternDataPoint {
  day: string
  dayShort: string
  dayIndex: number
  hours: number
  eventCount: number
  events: PatternEventSummary[]
}

export interface MonthlyPatternDataPoint {
  dayOfMonth: number
  hours: number
  eventCount: number
  events: PatternEventSummary[]
}

export interface EventDurationCategory {
  key: 'short' | 'medium' | 'long' | 'extended'
  label: string
  range: string
  color: string
  count: number
  percentage: number
  events: PatternEventSummary[]
}

export interface TimeOfDayDistribution {
  morning: number // 6am - 12pm
  afternoon: number // 12pm - 6pm
  evening: number // 6pm - 10pm
  night: number // 10pm - 6am
}

export interface EventDurationBreakdown {
  short: number // < 30 minutes
  medium: number // 30 min - 1 hour
  long: number // 1 - 2 hours
  extended: number // > 2 hours
}

export interface FocusTimeMetrics {
  totalFocusBlocks: number // 2+ hour blocks without meetings
  averageFocusBlockLength: number
  longestFocusBlock: number
  focusTimePercentage: number
}

export interface ProductivityMetrics {
  productivityScore: number // 0-100 calculated score
  meetingLoad: number // percentage of time in meetings
  averageEventsPerDay: number
  mostProductiveDay: string
  leastProductiveDay: string
  peakHour: number // hour of day with most events (0-23)
}

export interface EnhancedAnalyticsData {
  // Original metrics
  totalEvents: number
  totalDurationHours: number
  averageEventDuration: number
  busiestDayHours: number
  calendarBreakdown: CalendarBreakdownItem[]
  recentActivities: ProcessedActivity[]
  dailyAvailableHours: DailyAvailableHoursDataPoint[]

  // New enhanced metrics
  weeklyPattern: WeeklyPatternDataPoint[]
  monthlyPattern: MonthlyPatternDataPoint[]
  timeOfDayDistribution: TimeOfDayDistribution
  eventDurationBreakdown: EventDurationBreakdown
  eventDurationCategories: EventDurationCategory[]
  focusTimeMetrics: FocusTimeMetrics
  productivityMetrics: ProductivityMetrics

  // Additional stats
  totalDays: number
  daysWithEvents: number
  eventFreeDays: number
  longestEvent: number // in hours
  shortestEvent: number // in hours
  recurringEventsCount: number
  allDayEventsCount: number
}

// --- Bento Stats Grid Types ---

export interface BentoStatItem {
  id: string
  label: string
  value: number | string
  suffix?: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  description?: string
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
  }
  size: 'small' | 'medium' | 'large'
  sparklineData?: number[]
}

export interface BentoStatsGridProps {
  stats: BentoStatItem[]
  isLoading?: boolean
}

export interface WeeklyPatternChartProps {
  data: WeeklyPatternDataPoint[]
  isLoading?: boolean
}

export interface MonthlyPatternChartProps {
  data: MonthlyPatternDataPoint[]
  isLoading?: boolean
}

export interface TimeDistributionChartProps {
  data: TimeOfDayDistribution
  isLoading?: boolean
}

export interface EventDurationChartProps {
  data: EventDurationBreakdown
  totalEvents: number
  isLoading?: boolean
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
