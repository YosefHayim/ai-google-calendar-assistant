import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import EventDurationDashboard from '@/components/dashboard/analytics/EventDurationDashboard'
import type { EventDurationCategory } from '@/types/analytics'
import { fn } from 'storybook/test'

const meta: Meta<typeof EventDurationDashboard> = {
  title: 'Dashboard/Analytics/EventDurationDashboard',
  component: EventDurationDashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const createMockCategories = (distribution: {
  short: number
  medium: number
  long: number
  extended: number
}): EventDurationCategory[] => {
  const total = distribution.short + distribution.medium + distribution.long + distribution.extended

  return [
    {
      key: 'short',
      label: 'Short',
      range: '< 30 min',
      color: '#10b981',
      count: distribution.short,
      percentage: Math.round((distribution.short / total) * 100),
      events: [],
    },
    {
      key: 'medium',
      label: 'Medium',
      range: '30 min - 1 hr',
      color: '#3b82f6',
      count: distribution.medium,
      percentage: Math.round((distribution.medium / total) * 100),
      events: [],
    },
    {
      key: 'long',
      label: 'Long',
      range: '1 - 2 hrs',
      color: '#f59e0b',
      count: distribution.long,
      percentage: Math.round((distribution.long / total) * 100),
      events: [],
    },
    {
      key: 'extended',
      label: 'Extended',
      range: '> 2 hrs',
      color: '#ef4444',
      count: distribution.extended,
      percentage: Math.round((distribution.extended / total) * 100),
      events: [],
    },
  ]
}

const balancedDistribution = createMockCategories({
  short: 35,
  medium: 48,
  long: 28,
  extended: 12,
})

const shortHeavyDistribution = createMockCategories({
  short: 85,
  medium: 32,
  long: 15,
  extended: 5,
})

const longHeavyDistribution = createMockCategories({
  short: 12,
  medium: 25,
  long: 55,
  extended: 38,
})

export const Default: Story = {
  args: {
    data: balancedDistribution,
    totalEvents: 123,
    onCategoryClick: fn(),
    isLoading: false,
  },
}

export const ShortEventsHeavy: Story = {
  args: {
    data: shortHeavyDistribution,
    totalEvents: 137,
    onCategoryClick: fn(),
    isLoading: false,
  },
}

export const LongEventsHeavy: Story = {
  args: {
    data: longHeavyDistribution,
    totalEvents: 130,
    onCategoryClick: fn(),
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    data: [],
    totalEvents: 0,
    onCategoryClick: fn(),
    isLoading: true,
  },
}

export const NoEvents: Story = {
  args: {
    data: createMockCategories({ short: 0, medium: 0, long: 0, extended: 0 }),
    totalEvents: 0,
    onCategoryClick: fn(),
    isLoading: false,
  },
}

export const SingleCategory: Story = {
  args: {
    data: createMockCategories({ short: 0, medium: 100, long: 0, extended: 0 }),
    totalEvents: 100,
    onCategoryClick: fn(),
    isLoading: false,
  },
}

export const HighVolume: Story = {
  args: {
    data: createMockCategories({
      short: 245,
      medium: 312,
      long: 156,
      extended: 87,
    }),
    totalEvents: 800,
    onCategoryClick: fn(),
    isLoading: false,
  },
}

export const LowVolume: Story = {
  args: {
    data: createMockCategories({
      short: 5,
      medium: 8,
      long: 3,
      extended: 2,
    }),
    totalEvents: 18,
    onCategoryClick: fn(),
    isLoading: false,
  },
}

export const WithoutClickHandler: Story = {
  args: {
    data: balancedDistribution,
    totalEvents: 123,
    isLoading: false,
  },
}
