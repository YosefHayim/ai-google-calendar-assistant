import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BentoStatsGrid } from '@/components/dashboard/analytics/BentoStatsGrid'
import type { EnhancedAnalyticsData, ComparisonResult } from '@/types/analytics'

const meta: Meta<typeof BentoStatsGrid> = {
  title: 'Dashboard/Analytics/BentoStatsGrid',
  component: BentoStatsGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const mockData: EnhancedAnalyticsData = {
  totalEvents: 156,
  totalDurationHours: 89.5,
  averageEventDuration: 0.57,
  busiestDayHours: 8.5,
  calendarBreakdown: [
    { category: 'Work', hours: 45, color: '#4285f4', calendarId: 'work' },
    { category: 'Personal', hours: 25, color: '#0b8043', calendarId: 'personal' },
    { category: 'Fitness', hours: 12, color: '#e67c73', calendarId: 'fitness' },
    { category: 'Family', hours: 7.5, color: '#f6bf26', calendarId: 'family' },
  ],
  recentActivities: [],
  dailyAvailableHours: [],
  weeklyPattern: [
    { day: 'Monday', dayShort: 'Mon', dayIndex: 0, hours: 6.5, eventCount: 8, events: [] },
    { day: 'Tuesday', dayShort: 'Tue', dayIndex: 1, hours: 7.2, eventCount: 9, events: [] },
    { day: 'Wednesday', dayShort: 'Wed', dayIndex: 2, hours: 5.8, eventCount: 7, events: [] },
    { day: 'Thursday', dayShort: 'Thu', dayIndex: 3, hours: 8.1, eventCount: 11, events: [] },
    { day: 'Friday', dayShort: 'Fri', dayIndex: 4, hours: 4.5, eventCount: 6, events: [] },
    { day: 'Saturday', dayShort: 'Sat', dayIndex: 5, hours: 2.0, eventCount: 3, events: [] },
    { day: 'Sunday', dayShort: 'Sun', dayIndex: 6, hours: 1.5, eventCount: 2, events: [] },
  ],
  monthlyPattern: [],
  timeOfDayDistribution: {
    morning: 45,
    afternoon: 62,
    evening: 38,
    night: 11,
  },
  eventDurationBreakdown: {
    short: 42,
    medium: 58,
    long: 38,
    extended: 18,
  },
  eventDurationCategories: [],
  focusTimeMetrics: {
    totalFocusBlocks: 24,
    averageFocusBlockLength: 2.3,
    longestFocusBlock: 4.5,
    focusTimePercentage: 65,
  },
  productivityMetrics: {
    productivityScore: 78,
    meetingLoad: 35,
    averageEventsPerDay: 5.2,
    mostProductiveDay: 'Thursday',
    leastProductiveDay: 'Sunday',
    peakHour: 10,
  },
  totalDays: 30,
  daysWithEvents: 24,
  eventFreeDays: 6,
  longestEvent: 4.0,
  shortestEvent: 0.25,
  recurringEventsCount: 28,
  allDayEventsCount: 12,
}

const mockComparison: ComparisonResult = {
  current: {
    totalEvents: 156,
    totalDurationHours: 89.5,
    averageEventDuration: 0.57,
    busiestDayHours: 8.5,
  },
  previous: {
    totalEvents: 142,
    totalDurationHours: 82.3,
    averageEventDuration: 0.58,
    busiestDayHours: 7.8,
  },
  trends: {
    totalEvents: {
      value: 156,
      previousValue: 142,
      percentageChange: 9.9,
      direction: 'up',
    },
    totalDuration: {
      value: 89.5,
      previousValue: 82.3,
      percentageChange: 8.7,
      direction: 'up',
    },
    avgEventDuration: {
      value: 0.57,
      previousValue: 0.58,
      percentageChange: -1.7,
      direction: 'down',
    },
    busiestDay: {
      value: 8.5,
      previousValue: 7.8,
      percentageChange: 9.0,
      direction: 'up',
    },
  },
}

export const Default: Story = {
  args: {
    data: mockData,
    comparison: mockComparison,
    isLoading: false,
  },
}

export const WithoutComparison: Story = {
  args: {
    data: mockData,
    comparison: null,
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    data: mockData,
    comparison: null,
    isLoading: true,
  },
}

export const HighProductivity: Story = {
  args: {
    data: {
      ...mockData,
      productivityMetrics: {
        ...mockData.productivityMetrics,
        productivityScore: 92,
        meetingLoad: 25,
      },
      focusTimeMetrics: {
        ...mockData.focusTimeMetrics,
        totalFocusBlocks: 35,
        focusTimePercentage: 78,
      },
    },
    comparison: mockComparison,
    isLoading: false,
  },
}

export const LowProductivity: Story = {
  args: {
    data: {
      ...mockData,
      productivityMetrics: {
        ...mockData.productivityMetrics,
        productivityScore: 35,
        meetingLoad: 72,
      },
      focusTimeMetrics: {
        ...mockData.focusTimeMetrics,
        totalFocusBlocks: 8,
        focusTimePercentage: 22,
      },
    },
    comparison: mockComparison,
    isLoading: false,
  },
}

export const BusySchedule: Story = {
  args: {
    data: {
      ...mockData,
      totalEvents: 245,
      totalDurationHours: 142,
      busiestDayHours: 12,
      daysWithEvents: 30,
      eventFreeDays: 0,
    },
    comparison: null,
    isLoading: false,
  },
}

export const LightSchedule: Story = {
  args: {
    data: {
      ...mockData,
      totalEvents: 28,
      totalDurationHours: 18.5,
      busiestDayHours: 3,
      daysWithEvents: 12,
      eventFreeDays: 18,
    },
    comparison: null,
    isLoading: false,
  },
}
