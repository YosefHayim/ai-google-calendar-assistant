import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import UpcomingWeekPreview from '@/components/dashboard/analytics/UpcomingWeekPreview'
import type { UpcomingWeekData, UpcomingDayData } from '@/hooks/queries/analytics/useUpcomingWeekData'
import { fn } from 'storybook/test'

const meta: Meta<typeof UpcomingWeekPreview> = {
  title: 'Dashboard/Analytics/UpcomingWeekPreview',
  component: UpcomingWeekPreview,
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

const FIXED_BASE_DATE = new Date('2026-01-15T00:00:00Z')

const createDay = (
  offset: number,
  busynessLevel: UpcomingDayData['busynessLevel'],
  eventCount: number,
): UpcomingDayData => {
  const date = new Date(FIXED_BASE_DATE)
  date.setDate(date.getDate() + offset)
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayShorts = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return {
    date,
    dateStr: date.toISOString().split('T')[0],
    dayName: dayNames[date.getDay()],
    dayShort: dayShorts[date.getDay()],
    isToday: offset === 0,
    isTomorrow: offset === 1,
    busynessLevel,
    eventCount,
    totalHours: eventCount * 0.75,
    events: Array.from({ length: Math.min(eventCount, 5) }, (_, i) => {
      const startTime = new Date(date)
      startTime.setHours(9 + i * 2, 0, 0, 0)
      const endTime = new Date(date)
      endTime.setHours(10 + i * 2, 0, 0, 0)
      return {
        id: `event-${offset}-${i}`,
        summary: `Event ${i + 1}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationMinutes: 60,
        isAllDay: false,
        isRecurring: i === 0,
        calendarId: 'work',
        calendarName: 'Work',
        calendarColor: '#4285f4',
      }
    }),
  }
}

const balancedWeek: UpcomingWeekData = {
  days: [
    createDay(0, 'moderate', 4),
    createDay(1, 'busy', 6),
    createDay(2, 'light', 2),
    createDay(3, 'moderate', 5),
    createDay(4, 'busy', 7),
    createDay(5, 'free', 0),
    createDay(6, 'light', 1),
  ],
  totalEvents: 25,
  totalHours: 18.75,
  busiestDay: 'Friday',
  freestDay: 'Saturday',
}

const packedWeek: UpcomingWeekData = {
  days: [
    createDay(0, 'packed', 10),
    createDay(1, 'packed', 12),
    createDay(2, 'busy', 8),
    createDay(3, 'packed', 11),
    createDay(4, 'busy', 9),
    createDay(5, 'moderate', 5),
    createDay(6, 'light', 2),
  ],
  totalEvents: 57,
  totalHours: 42.75,
  busiestDay: 'Tuesday',
  freestDay: 'Sunday',
}

const lightWeek: UpcomingWeekData = {
  days: [
    createDay(0, 'light', 2),
    createDay(1, 'free', 0),
    createDay(2, 'light', 1),
    createDay(3, 'moderate', 3),
    createDay(4, 'light', 2),
    createDay(5, 'free', 0),
    createDay(6, 'free', 0),
  ],
  totalEvents: 8,
  totalHours: 6,
  busiestDay: 'Thursday',
  freestDay: 'Tuesday',
}

const emptyWeek: UpcomingWeekData = {
  days: [
    createDay(0, 'free', 0),
    createDay(1, 'free', 0),
    createDay(2, 'free', 0),
    createDay(3, 'free', 0),
    createDay(4, 'free', 0),
    createDay(5, 'free', 0),
    createDay(6, 'free', 0),
  ],
  totalEvents: 0,
  totalHours: 0,
  busiestDay: 'N/A',
  freestDay: 'N/A',
}

export const Default: Story = {
  args: {
    data: balancedWeek,
    isLoading: false,
    isError: false,
  },
}

export const PackedSchedule: Story = {
  args: {
    data: packedWeek,
    isLoading: false,
    isError: false,
  },
}

export const LightSchedule: Story = {
  args: {
    data: lightWeek,
    isLoading: false,
    isError: false,
  },
}

export const EmptyWeek: Story = {
  args: {
    data: emptyWeek,
    isLoading: false,
    isError: false,
  },
}

export const Loading: Story = {
  args: {
    data: undefined,
    isLoading: true,
    isError: false,
  },
}

export const Error: Story = {
  args: {
    data: undefined,
    isLoading: false,
    isError: true,
    onRetry: fn(),
  },
}

export const NoData: Story = {
  args: {
    data: undefined,
    isLoading: false,
    isError: false,
  },
}

export const WithRetryHandler: Story = {
  args: {
    data: undefined,
    isLoading: false,
    isError: true,
    onRetry: fn(),
  },
}
