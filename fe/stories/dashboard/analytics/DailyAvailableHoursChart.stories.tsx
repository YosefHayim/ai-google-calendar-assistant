import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import DailyAvailableHoursChart from '@/components/dashboard/analytics/DailyAvailableHoursChart'
import DailyAvailableHoursDashboard from '@/components/dashboard/analytics/DailyAvailableHoursDashboard'
import type { DailyAvailableHoursDataPoint } from '@/types/analytics'
import { fn } from 'storybook/test'

const meta: Meta<typeof DailyAvailableHoursChart> = {
  title: 'Dashboard/Analytics/DailyAvailableHoursChart',
  component: DailyAvailableHoursChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const generateMockData = (days: number, variance: 'low' | 'medium' | 'high' = 'medium'): DailyAvailableHoursDataPoint[] => {
  const baseDate = new Date('2024-01-01')
  const varianceMap = { low: 2, medium: 4, high: 8 }
  const v = varianceMap[variance]

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    const baseHours = 10 + Math.random() * v - v / 2

    return {
      day: i + 1,
      date: date.toISOString().split('T')[0],
      hours: Math.max(2, Math.min(16, parseFloat(baseHours.toFixed(1)))),
    }
  })
}

const mockData7Days = generateMockData(7)
const mockData14Days = generateMockData(14)
const mockData30Days = generateMockData(30)

export const Default: Story = {
  args: {
    data: mockData14Days,
    onDayClick: fn(),
  },
}

export const SevenDays: Story = {
  args: {
    data: mockData7Days,
    onDayClick: fn(),
  },
}

export const ThirtyDays: Story = {
  args: {
    data: mockData30Days,
    onDayClick: fn(),
  },
}

export const HighVariance: Story = {
  args: {
    data: generateMockData(14, 'high'),
    onDayClick: fn(),
  },
}

export const LowVariance: Story = {
  args: {
    data: generateMockData(14, 'low'),
    onDayClick: fn(),
  },
}

export const VeryBusySchedule: Story = {
  args: {
    data: Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
      hours: 2 + Math.random() * 3,
    })),
    onDayClick: fn(),
  },
}

export const LightSchedule: Story = {
  args: {
    data: Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
      hours: 12 + Math.random() * 4,
    })),
    onDayClick: fn(),
  },
}

export const EmptyData: Story = {
  args: {
    data: [],
    onDayClick: fn(),
  },
}

export const DashboardDefault: StoryObj<typeof DailyAvailableHoursDashboard> = {
  render: () => (
    <DailyAvailableHoursDashboard
      data={mockData14Days}
      onDayClick={fn()}
      isLoading={false}
    />
  ),
}

export const DashboardLoading: StoryObj<typeof DailyAvailableHoursDashboard> = {
  render: () => (
    <DailyAvailableHoursDashboard
      data={[]}
      onDayClick={fn()}
      isLoading={true}
    />
  ),
}

export const DashboardEmpty: StoryObj<typeof DailyAvailableHoursDashboard> = {
  render: () => (
    <DailyAvailableHoursDashboard
      data={[]}
      onDayClick={fn()}
      isLoading={false}
    />
  ),
}

export const DashboardThirtyDays: StoryObj<typeof DailyAvailableHoursDashboard> = {
  render: () => (
    <DailyAvailableHoursDashboard
      data={mockData30Days}
      onDayClick={fn()}
      isLoading={false}
    />
  ),
}
