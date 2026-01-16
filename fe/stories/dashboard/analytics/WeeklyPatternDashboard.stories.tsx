import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import WeeklyPatternDashboard from '@/components/dashboard/analytics/WeeklyPatternDashboard'
import type { WeeklyPatternDataPoint } from '@/types/analytics'
import { fn } from 'storybook/test'

const meta: Meta<typeof WeeklyPatternDashboard> = {
  title: 'Dashboard/Analytics/WeeklyPatternDashboard',
  component: WeeklyPatternDashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const createWeeklyPattern = (hoursPattern: number[]): WeeklyPatternDataPoint[] => {
  return hoursPattern.map((hours, index) => ({
    day: DAYS[index],
    dayShort: DAYS_SHORT[index],
    dayIndex: index,
    hours,
    eventCount: Math.round(hours * 1.5),
    events: [],
  }))
}

const balancedWeek = createWeeklyPattern([2, 7.5, 8, 7, 8.5, 6, 1.5])
const heavyMidweek = createWeeklyPattern([1, 5, 10, 12, 9, 4, 0.5])
const weekendWarrior = createWeeklyPattern([8, 3, 2, 3, 2, 4, 10])
const mondayHeavy = createWeeklyPattern([0, 12, 6, 5, 4, 3, 1])
const fridayLight = createWeeklyPattern([2, 8, 8, 8, 8, 2, 1])

export const Default: Story = {
  args: {
    data: balancedWeek,
    onDayClick: action('day-clicked'),
    isLoading: false,
  },
}

export const HeavyMidweek: Story = {
  args: {
    data: heavyMidweek,
    onDayClick: action('day-clicked'),
    isLoading: false,
  },
}

export const WeekendWarrior: Story = {
  args: {
    data: weekendWarrior,
    onDayClick: action('day-clicked'),
    isLoading: false,
  },
}

export const MondayHeavy: Story = {
  args: {
    data: mondayHeavy,
    onDayClick: action('day-clicked'),
    isLoading: false,
  },
}

export const FridayLight: Story = {
  args: {
    data: fridayLight,
    onDayClick: action('day-clicked'),
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    data: [],
    onDayClick: action('day-clicked'),
    isLoading: true,
  },
}

export const EmptyData: Story = {
  args: {
    data: [],
    onDayClick: action('day-clicked'),
    isLoading: false,
  },
}

export const AllZeros: Story = {
  args: {
    data: createWeeklyPattern([0, 0, 0, 0, 0, 0, 0]),
    onDayClick: action('day-clicked'),
    isLoading: false,
  },
}

export const VeryBusyWeek: Story = {
  args: {
    data: createWeeklyPattern([4, 10, 11, 12, 11, 10, 5]),
    onDayClick: action('day-clicked'),
    isLoading: false,
  },
}

export const LightWeek: Story = {
  args: {
    data: createWeeklyPattern([0.5, 2, 1.5, 2.5, 2, 1, 0]),
    onDayClick: action('day-clicked'),
    isLoading: false,
  },
}

export const WithoutClickHandler: Story = {
  args: {
    data: balancedWeek,
    isLoading: false,
  },
}
