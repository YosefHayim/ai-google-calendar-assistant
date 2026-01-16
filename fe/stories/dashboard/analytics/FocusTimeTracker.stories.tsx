import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import FocusTimeTracker from '@/components/dashboard/analytics/FocusTimeTracker'
import type { FocusTimeMetrics } from '@/types/analytics'

const meta: Meta<typeof FocusTimeTracker> = {
  title: 'Dashboard/Analytics/FocusTimeTracker',
  component: FocusTimeTracker,
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

const excellentFocusData: FocusTimeMetrics = {
  totalFocusBlocks: 32,
  averageFocusBlockLength: 2.8,
  longestFocusBlock: 5.0,
  focusTimePercentage: 75,
}

const goodFocusData: FocusTimeMetrics = {
  totalFocusBlocks: 24,
  averageFocusBlockLength: 2.3,
  longestFocusBlock: 4.0,
  focusTimePercentage: 58,
}

const fairFocusData: FocusTimeMetrics = {
  totalFocusBlocks: 14,
  averageFocusBlockLength: 2.1,
  longestFocusBlock: 3.0,
  focusTimePercentage: 38,
}

const needsImprovementData: FocusTimeMetrics = {
  totalFocusBlocks: 6,
  averageFocusBlockLength: 1.8,
  longestFocusBlock: 2.5,
  focusTimePercentage: 18,
}

export const Excellent: Story = {
  args: {
    data: excellentFocusData,
    totalDays: 30,
    isLoading: false,
  },
}

export const Good: Story = {
  args: {
    data: goodFocusData,
    totalDays: 30,
    isLoading: false,
  },
}

export const Fair: Story = {
  args: {
    data: fairFocusData,
    totalDays: 30,
    isLoading: false,
  },
}

export const NeedsImprovement: Story = {
  args: {
    data: needsImprovementData,
    totalDays: 30,
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    data: goodFocusData,
    totalDays: 30,
    isLoading: true,
  },
}

export const SevenDayPeriod: Story = {
  args: {
    data: {
      totalFocusBlocks: 8,
      averageFocusBlockLength: 2.5,
      longestFocusBlock: 4.0,
      focusTimePercentage: 62,
    },
    totalDays: 7,
    isLoading: false,
  },
}

export const NinetyDayPeriod: Story = {
  args: {
    data: {
      totalFocusBlocks: 95,
      averageFocusBlockLength: 2.4,
      longestFocusBlock: 6.0,
      focusTimePercentage: 55,
    },
    totalDays: 90,
    isLoading: false,
  },
}

export const ZeroFocusBlocks: Story = {
  args: {
    data: {
      totalFocusBlocks: 0,
      averageFocusBlockLength: 0,
      longestFocusBlock: 0,
      focusTimePercentage: 0,
    },
    totalDays: 30,
    isLoading: false,
  },
}
