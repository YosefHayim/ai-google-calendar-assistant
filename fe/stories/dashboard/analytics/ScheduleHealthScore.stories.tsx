import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import ScheduleHealthScore from '@/components/dashboard/analytics/ScheduleHealthScore'
import type { EnhancedAnalyticsData } from '@/types/analytics'

const meta: Meta<typeof ScheduleHealthScore> = {
  title: 'Dashboard/Analytics/ScheduleHealthScore',
  component: ScheduleHealthScore,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const createMockData = (overrides: Partial<EnhancedAnalyticsData> = {}): EnhancedAnalyticsData => ({
  totalEvents: 120,
  totalDurationHours: 75,
  averageEventDuration: 0.6,
  busiestDayHours: 7,
  calendarBreakdown: [],
  recentActivities: [],
  dailyAvailableHours: [],
  weeklyPattern: [],
  monthlyPattern: [],
  timeOfDayDistribution: {
    morning: 40,
    afternoon: 50,
    evening: 25,
    night: 5,
  },
  timeOfDayCategories: [
    {
      key: 'morning',
      label: 'Morning',
      timeRange: '6am - 12pm',
      color: '#fbbf24',
      count: 40,
      percentage: 33.3,
      events: [],
    },
    {
      key: 'afternoon',
      label: 'Afternoon',
      timeRange: '12pm - 6pm',
      color: '#f97316',
      count: 50,
      percentage: 41.7,
      events: [],
    },
    {
      key: 'evening',
      label: 'Evening',
      timeRange: '6pm - 10pm',
      color: '#8b5cf6',
      count: 25,
      percentage: 20.8,
      events: [],
    },
    { key: 'night', label: 'Night', timeRange: '10pm - 6am', color: '#3b82f6', count: 5, percentage: 4.2, events: [] },
  ],
  eventDurationBreakdown: {
    short: 30,
    medium: 50,
    long: 30,
    extended: 10,
  },
  eventDurationCategories: [],
  focusTimeMetrics: {
    totalFocusBlocks: 20,
    averageFocusBlockLength: 2.5,
    longestFocusBlock: 4,
    focusTimePercentage: 55,
  },
  productivityMetrics: {
    productivityScore: 72,
    meetingLoad: 35,
    averageEventsPerDay: 4,
    mostProductiveDay: 'Tuesday',
    leastProductiveDay: 'Friday',
    peakHour: 10,
  },
  totalDays: 30,
  daysWithEvents: 22,
  eventFreeDays: 8,
  longestEvent: 3,
  shortestEvent: 0.25,
  recurringEventsCount: 25,
  allDayEventsCount: 8,
  ...overrides,
})

export const Excellent: Story = {
  args: {
    data: createMockData({
      productivityMetrics: {
        productivityScore: 85,
        meetingLoad: 30,
        averageEventsPerDay: 4,
        mostProductiveDay: 'Tuesday',
        leastProductiveDay: 'Friday',
        peakHour: 10,
      },
      focusTimeMetrics: {
        totalFocusBlocks: 28,
        averageFocusBlockLength: 2.8,
        longestFocusBlock: 5,
        focusTimePercentage: 70,
      },
      totalDays: 30,
      daysWithEvents: 20,
      timeOfDayDistribution: {
        morning: 45,
        afternoon: 50,
        evening: 20,
        night: 5,
      },
    }),
    isLoading: false,
  },
}

export const Good: Story = {
  args: {
    data: createMockData(),
    isLoading: false,
  },
}

export const Fair: Story = {
  args: {
    data: createMockData({
      productivityMetrics: {
        productivityScore: 55,
        meetingLoad: 50,
        averageEventsPerDay: 6,
        mostProductiveDay: 'Monday',
        leastProductiveDay: 'Friday',
        peakHour: 14,
      },
      focusTimeMetrics: {
        totalFocusBlocks: 12,
        averageFocusBlockLength: 2.0,
        longestFocusBlock: 3,
        focusTimePercentage: 35,
      },
      timeOfDayDistribution: {
        morning: 35,
        afternoon: 55,
        evening: 35,
        night: 15,
      },
    }),
    isLoading: false,
  },
}

export const NeedsWork: Story = {
  args: {
    data: createMockData({
      productivityMetrics: {
        productivityScore: 35,
        meetingLoad: 70,
        averageEventsPerDay: 9,
        mostProductiveDay: 'Wednesday',
        leastProductiveDay: 'Monday',
        peakHour: 15,
      },
      focusTimeMetrics: {
        totalFocusBlocks: 5,
        averageFocusBlockLength: 1.5,
        longestFocusBlock: 2,
        focusTimePercentage: 15,
      },
      totalDays: 30,
      daysWithEvents: 29,
      timeOfDayDistribution: {
        morning: 30,
        afternoon: 45,
        evening: 35,
        night: 30,
      },
    }),
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    data: createMockData(),
    isLoading: true,
  },
}

export const HighMeetingLoad: Story = {
  args: {
    data: createMockData({
      productivityMetrics: {
        productivityScore: 45,
        meetingLoad: 75,
        averageEventsPerDay: 8,
        mostProductiveDay: 'Tuesday',
        leastProductiveDay: 'Friday',
        peakHour: 11,
      },
    }),
    isLoading: false,
  },
}

export const TooManyNightEvents: Story = {
  args: {
    data: createMockData({
      timeOfDayDistribution: {
        morning: 25,
        afternoon: 40,
        evening: 30,
        night: 45,
      },
    }),
    isLoading: false,
  },
}

export const NoFreeDays: Story = {
  args: {
    data: createMockData({
      totalDays: 30,
      daysWithEvents: 30,
      eventFreeDays: 0,
    }),
    isLoading: false,
  },
}
