import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import TimeDistributionChart from '@/components/dashboard/analytics/TimeDistributionChart'
import type { TimeOfDayDistribution } from '@/types/analytics'

const meta: Meta<typeof TimeDistributionChart> = {
  title: 'Dashboard/Analytics/TimeDistributionChart',
  component: TimeDistributionChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const balancedDistribution: TimeOfDayDistribution = {
  morning: 42,
  afternoon: 58,
  evening: 28,
  night: 8,
}

const morningPerson: TimeOfDayDistribution = {
  morning: 85,
  afternoon: 35,
  evening: 12,
  night: 3,
}

const nightOwl: TimeOfDayDistribution = {
  morning: 15,
  afternoon: 40,
  evening: 55,
  night: 35,
}

const afternoonFocused: TimeOfDayDistribution = {
  morning: 25,
  afternoon: 95,
  evening: 20,
  night: 5,
}

const evenlyDistributed: TimeOfDayDistribution = {
  morning: 35,
  afternoon: 38,
  evening: 32,
  night: 30,
}

export const Default: Story = {
  args: {
    data: balancedDistribution,
    isLoading: false,
  },
}

export const MorningPerson: Story = {
  args: {
    data: morningPerson,
    isLoading: false,
  },
}

export const NightOwl: Story = {
  args: {
    data: nightOwl,
    isLoading: false,
  },
}

export const AfternoonFocused: Story = {
  args: {
    data: afternoonFocused,
    isLoading: false,
  },
}

export const EvenlyDistributed: Story = {
  args: {
    data: evenlyDistributed,
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    data: { morning: 0, afternoon: 0, evening: 0, night: 0 },
    isLoading: true,
  },
}

export const NoEvents: Story = {
  args: {
    data: { morning: 0, afternoon: 0, evening: 0, night: 0 },
    isLoading: false,
  },
}

export const SinglePeriod: Story = {
  args: {
    data: { morning: 50, afternoon: 0, evening: 0, night: 0 },
    isLoading: false,
  },
}

export const HighVolume: Story = {
  args: {
    data: {
      morning: 145,
      afternoon: 198,
      evening: 87,
      night: 25,
    },
    isLoading: false,
  },
}

export const LowVolume: Story = {
  args: {
    data: {
      morning: 3,
      afternoon: 5,
      evening: 2,
      night: 1,
    },
    isLoading: false,
  },
}
