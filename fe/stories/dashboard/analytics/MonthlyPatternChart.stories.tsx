import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import MonthlyPatternChart from '@/components/dashboard/analytics/MonthlyPatternChart'
import MonthlyPatternDashboard from '@/components/dashboard/analytics/MonthlyPatternDashboard'
import type { MonthlyPatternDataPoint } from '@/types/analytics'
import { fn } from 'storybook/test'

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

const meta: Meta<typeof MonthlyPatternChart> = {
  title: 'Dashboard/Analytics/MonthlyPatternChart',
  component: MonthlyPatternChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const generateMonthlyData = (pattern: 'balanced' | 'busyStart' | 'busyEnd' | 'midMonthPeak', seed = 12345): MonthlyPatternDataPoint[] => {
  const days = 31
  const random = seededRandom(seed)

  return Array.from({ length: days }, (_, i) => {
    const dayOfMonth = i + 1
    let baseHours: number

    switch (pattern) {
      case 'busyStart':
        baseHours = dayOfMonth <= 10 ? 6 + random() * 4 : 2 + random() * 3
        break
      case 'busyEnd':
        baseHours = dayOfMonth >= 20 ? 6 + random() * 4 : 2 + random() * 3
        break
      case 'midMonthPeak':
        baseHours = dayOfMonth >= 10 && dayOfMonth <= 20 ? 5 + random() * 4 : 1 + random() * 2
        break
      default:
        baseHours = 3 + random() * 4
    }

    const isWeekend = [6, 7, 13, 14, 20, 21, 27, 28].includes(dayOfMonth)
    if (isWeekend) baseHours *= 0.3

    return {
      dayOfMonth,
      hours: parseFloat(baseHours.toFixed(1)),
      eventCount: Math.round(baseHours * 1.5),
      events: [],
    }
  })
}

const balancedData = generateMonthlyData('balanced')
const busyStartData = generateMonthlyData('busyStart')
const busyEndData = generateMonthlyData('busyEnd')
const midMonthPeakData = generateMonthlyData('midMonthPeak')

export const Default: Story = {
  args: {
    data: balancedData,
    isLoading: false,
  },
}

export const BusyMonthStart: Story = {
  args: {
    data: busyStartData,
    isLoading: false,
  },
}

export const BusyMonthEnd: Story = {
  args: {
    data: busyEndData,
    isLoading: false,
  },
}

export const MidMonthPeak: Story = {
  args: {
    data: midMonthPeakData,
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    data: [],
    isLoading: true,
  },
}

export const EmptyData: Story = {
  args: {
    data: [],
    isLoading: false,
  },
}

const sparseRandom = seededRandom(54321)
export const SparseData: Story = {
  args: {
    data: Array.from({ length: 31 }, (_, i) => ({
      dayOfMonth: i + 1,
      hours: [5, 12, 18, 25].includes(i + 1) ? 4 + sparseRandom() * 3 : 0,
      eventCount: [5, 12, 18, 25].includes(i + 1) ? 5 : 0,
      events: [],
    })),
    isLoading: false,
  },
}

export const DashboardDefault: StoryObj<typeof MonthlyPatternDashboard> = {
  render: () => (
    <MonthlyPatternDashboard
      data={balancedData}
      onDayClick={fn()}
      isLoading={false}
    />
  ),
}

export const DashboardLoading: StoryObj<typeof MonthlyPatternDashboard> = {
  render: () => (
    <MonthlyPatternDashboard
      data={[]}
      onDayClick={fn()}
      isLoading={true}
    />
  ),
}

export const DashboardEmpty: StoryObj<typeof MonthlyPatternDashboard> = {
  render: () => (
    <MonthlyPatternDashboard
      data={[]}
      onDayClick={fn()}
      isLoading={false}
    />
  ),
}

export const DashboardBusyEnd: StoryObj<typeof MonthlyPatternDashboard> = {
  render: () => (
    <MonthlyPatternDashboard
      data={busyEndData}
      onDayClick={fn()}
      isLoading={false}
    />
  ),
}
