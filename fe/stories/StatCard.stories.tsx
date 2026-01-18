import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card'
import { Calendar, Clock, Users, TrendingUp, CheckCircle2, BarChart3 } from 'lucide-react'

const meta: Meta<typeof StatCard> = {
  title: 'UI/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' },
    description: { control: 'text' },
    iconBgColor: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    icon: <Calendar className="h-4 w-4 text-primary" />,
    title: 'Total Events',
    value: '128',
    description: 'This month',
  },
}

export const WithPositiveTrend: Story = {
  args: {
    icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
    title: 'Productivity Score',
    value: '87%',
    description: 'Based on scheduled vs completed',
    trend: {
      value: 12,
      isPositive: true,
    },
    iconBgColor: 'bg-emerald-500/10',
  },
}

export const WithNegativeTrend: Story = {
  args: {
    icon: <Clock className="h-4 w-4 text-orange-500" />,
    title: 'Avg Meeting Duration',
    value: '52 min',
    description: 'Across all meetings',
    trend: {
      value: 8,
      isPositive: false,
    },
    iconBgColor: 'bg-orange-500/10',
  },
}

export const MeetingsToday: Story = {
  args: {
    icon: <Users className="h-4 w-4 text-primary" />,
    title: 'Meetings Today',
    value: '6',
    description: '3 remaining',
    iconBgColor: 'bg-primary/10',
  },
}

export const TasksCompleted: Story = {
  args: {
    icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    title: 'Tasks Completed',
    value: '24',
    description: 'This week',
    trend: {
      value: 15,
      isPositive: true,
    },
    iconBgColor: 'bg-green-500/10',
  },
}

export const FocusTime: Story = {
  args: {
    icon: <BarChart3 className="h-4 w-4 text-violet-500" />,
    title: 'Focus Time',
    value: '18h',
    description: 'Deep work this week',
    trend: {
      value: 22,
      isPositive: true,
    },
    iconBgColor: 'bg-violet-500/10',
  },
}

export const Skeleton: Story = {
  render: () => <StatCardSkeleton className="w-[220px]" />,
}

export const StatsGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
      <StatCard
        icon={<Calendar className="h-4 w-4 text-primary" />}
        title="Total Events"
        value="128"
        description="This month"
        trend={{ value: 8, isPositive: true }}
      />
      <StatCard
        icon={<Clock className="h-4 w-4 text-orange-500" />}
        title="Hours Scheduled"
        value="64h"
        description="This week"
        iconBgColor="bg-orange-500/10"
      />
      <StatCard
        icon={<Users className="h-4 w-4 text-primary" />}
        title="Meetings"
        value="32"
        description="With 18 attendees"
        iconBgColor="bg-primary/10"
        trend={{ value: 5, isPositive: false }}
      />
      <StatCard
        icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
        title="Productivity"
        value="94%"
        description="Events completed"
        iconBgColor="bg-emerald-500/10"
        trend={{ value: 12, isPositive: true }}
      />
    </div>
  ),
}

export const LoadingGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  ),
}

export const WithChildren: Story = {
  render: () => (
    <StatCard
      icon={<Calendar className="h-4 w-4 text-primary" />}
      title="Upcoming Events"
      value="5"
      description="Next 24 hours"
      className="w-[280px]"
    >
      <div className="mt-2 pt-3 border-t border dark:border">
        <ul className="text-xs text-zinc-600 dark:text-muted-foreground space-y-1">
          <li>09:00 - Team Standup</li>
          <li>11:00 - Client Call</li>
          <li>14:00 - Design Review</li>
        </ul>
      </div>
    </StatCard>
  ),
}

export const LargeValue: Story = {
  args: {
    icon: <BarChart3 className="h-4 w-4 text-indigo-500" />,
    title: 'Total Minutes',
    value: '12,847',
    description: 'Time tracked this year',
    iconBgColor: 'bg-indigo-500/10',
  },
}

export const CustomColors: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        icon={<Calendar className="h-4 w-4 text-rose-500" />}
        title="Overdue"
        value="3"
        description="Tasks past deadline"
        iconBgColor="bg-rose-500/10"
      />
      <StatCard
        icon={<Clock className="h-4 w-4 text-amber-500" />}
        title="Pending"
        value="12"
        description="Awaiting action"
        iconBgColor="bg-amber-500/10"
      />
      <StatCard
        icon={<CheckCircle2 className="h-4 w-4 text-teal-500" />}
        title="Completed"
        value="47"
        description="This sprint"
        iconBgColor="bg-teal-500/10"
      />
    </div>
  ),
}
