import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import TimeSavedChart from '@/components/dashboard/analytics/TimeSavedChart'
import TimeSavedColumnChart from '@/components/dashboard/analytics/TimeSavedColumnChart'

const meta: Meta<typeof TimeSavedChart> = {
  title: 'Dashboard/Analytics/TimeSavedChart',
  component: TimeSavedChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="h-[200px] w-full">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const generateLineChartData = (days: number, trend: 'up' | 'down' | 'steady' | 'variable') => {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return Array.from({ length: days }, (_, i) => {
    let baseHours: number
    switch (trend) {
      case 'up':
        baseHours = 1 + (i / days) * 4 + Math.random() * 0.5
        break
      case 'down':
        baseHours = 5 - (i / days) * 3 + Math.random() * 0.5
        break
      case 'steady':
        baseHours = 2.5 + Math.random() * 0.5
        break
      default:
        baseHours = 1 + Math.random() * 4
    }

    return {
      day: DAYS[i % 7],
      hours: parseFloat(baseHours.toFixed(1)),
    }
  })
}

const generateColumnChartData = (days: number, variance: 'low' | 'medium' | 'high') => {
  const varianceMap = { low: 1, medium: 2.5, high: 4 }
  const v = varianceMap[variance]
  const baseDate = new Date('2024-01-01')

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    const baseHours = 3 + Math.random() * v

    return {
      day: i + 1,
      date: date.toISOString().split('T')[0],
      hours: parseFloat(baseHours.toFixed(1)),
    }
  })
}

export const LineDefault: Story = {
  args: {
    data: generateLineChartData(14, 'variable'),
  },
}

export const LineUpwardTrend: Story = {
  args: {
    data: generateLineChartData(14, 'up'),
  },
}

export const LineDownwardTrend: Story = {
  args: {
    data: generateLineChartData(14, 'down'),
  },
}

export const LineSteadyTrend: Story = {
  args: {
    data: generateLineChartData(14, 'steady'),
  },
}

export const LineSevenDays: Story = {
  args: {
    data: generateLineChartData(7, 'variable'),
  },
}

export const LineThirtyDays: Story = {
  args: {
    data: generateLineChartData(30, 'variable'),
  },
}

export const LineEmpty: Story = {
  args: {
    data: [],
  },
}

export const ColumnDefault: StoryObj<typeof TimeSavedColumnChart> = {
  render: () => (
    <div className="h-[250px] w-full">
      <TimeSavedColumnChart data={generateColumnChartData(14, 'medium')} />
    </div>
  ),
}

export const ColumnHighVariance: StoryObj<typeof TimeSavedColumnChart> = {
  render: () => (
    <div className="h-[250px] w-full">
      <TimeSavedColumnChart data={generateColumnChartData(14, 'high')} />
    </div>
  ),
}

export const ColumnLowVariance: StoryObj<typeof TimeSavedColumnChart> = {
  render: () => (
    <div className="h-[250px] w-full">
      <TimeSavedColumnChart data={generateColumnChartData(14, 'low')} />
    </div>
  ),
}

export const ColumnSevenDays: StoryObj<typeof TimeSavedColumnChart> = {
  render: () => (
    <div className="h-[250px] w-full">
      <TimeSavedColumnChart data={generateColumnChartData(7, 'medium')} />
    </div>
  ),
}

export const ColumnThirtyDays: StoryObj<typeof TimeSavedColumnChart> = {
  render: () => (
    <div className="h-[250px] w-full">
      <TimeSavedColumnChart data={generateColumnChartData(30, 'medium')} />
    </div>
  ),
}

export const ColumnEmpty: StoryObj<typeof TimeSavedColumnChart> = {
  render: () => (
    <div className="h-[250px] w-full">
      <TimeSavedColumnChart data={[]} />
    </div>
  ),
}
