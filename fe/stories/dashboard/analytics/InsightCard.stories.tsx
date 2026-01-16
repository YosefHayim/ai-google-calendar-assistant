import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import InsightCard from '@/components/dashboard/analytics/InsightCard'
import InsightCardSkeleton from '@/components/dashboard/analytics/InsightCardSkeleton'
import { Zap, Users, Coffee, TrendingUp, Target } from 'lucide-react'

const meta: Meta<typeof InsightCard> = {
  title: 'Dashboard/Analytics/InsightCard',
  component: InsightCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['amber', 'sky', 'emerald', 'rose', 'indigo', 'orange'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    icon: Zap,
    title: 'Focus Velocity',
    value: '87%',
    description: 'Your productivity is 12% higher than last week',
    color: 'amber',
  },
}

export const Amber: Story = {
  args: {
    icon: Zap,
    title: 'Energy Score',
    value: '92',
    description: 'Peak performance detected in morning hours',
    color: 'amber',
  },
}

export const Sky: Story = {
  args: {
    icon: Users,
    title: 'Collaboration',
    value: '24 hrs',
    description: 'Time spent in team meetings this week',
    color: 'sky',
  },
}

export const Emerald: Story = {
  args: {
    icon: Coffee,
    title: 'Focus Blocks',
    value: '18',
    description: '2+ hour uninterrupted deep work sessions',
    color: 'emerald',
  },
}

export const Rose: Story = {
  args: {
    icon: TrendingUp,
    title: 'Overbooked Alert',
    value: '3 days',
    description: 'Days with more than 6 hours of meetings',
    color: 'rose',
  },
}

export const Indigo: Story = {
  args: {
    icon: Target,
    title: 'Goal Progress',
    value: '78%',
    description: 'Weekly focus time goal completion',
    color: 'indigo',
  },
}

export const Orange: Story = {
  args: {
    icon: Zap,
    title: 'Peak Hours',
    value: '9-11 AM',
    description: 'Most productive time based on task completion',
    color: 'orange',
  },
}

export const LongContent: Story = {
  args: {
    icon: TrendingUp,
    title: 'Schedule Optimization Potential',
    value: '+4.5 hrs',
    description: 'Estimated time you could save by consolidating back-to-back meetings on Tuesday and Thursday',
    color: 'emerald',
  },
}

export const InsightGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <InsightCard
        icon={Zap}
        title="Focus Velocity"
        value="87%"
        description="12% higher than last week"
        color="amber"
      />
      <InsightCard
        icon={Users}
        title="Meeting Load"
        value="24 hrs"
        description="Optimal range achieved"
        color="sky"
      />
      <InsightCard
        icon={Coffee}
        title="Deep Work"
        value="18 blocks"
        description="2+ hour sessions"
        color="emerald"
      />
      <InsightCard
        icon={TrendingUp}
        title="Productivity"
        value="+15%"
        description="Week over week growth"
        color="indigo"
      />
      <InsightCard
        icon={Target}
        title="Goal Progress"
        value="78%"
        description="On track for weekly target"
        color="orange"
      />
    </div>
  ),
}

export const Skeleton: Story = {
  render: () => <InsightCardSkeleton />,
}

export const SkeletonGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <InsightCardSkeleton />
      <InsightCardSkeleton />
      <InsightCardSkeleton />
      <InsightCardSkeleton />
      <InsightCardSkeleton />
    </div>
  ),
}
