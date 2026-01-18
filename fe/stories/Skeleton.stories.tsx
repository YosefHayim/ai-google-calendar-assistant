import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Skeleton,
  SkeletonCard,
  SkeletonChart,
  SkeletonDonutChart,
  SkeletonHeatmap,
  SkeletonInsightCard,
  SkeletonIntegrationCard,
  SkeletonLineChart,
  SkeletonList,
  SkeletonCalendarSources,
  SkeletonMessageBubble,
} from '@/components/ui/skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-[250px]" />,
}

export const TextLines: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-[300px]">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[80%]" />
      <Skeleton className="h-4 w-[60%]" />
    </div>
  ),
}

export const Avatar: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  ),
}

export const Card: Story = {
  render: () => <SkeletonCard className="w-[200px]" />,
}

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  ),
}

export const InsightCard: Story = {
  render: () => <SkeletonInsightCard className="w-[300px]" />,
}

export const ChartBar: Story = {
  render: () => <SkeletonChart className="w-[500px]" />,
}

export const ChartLine: Story = {
  render: () => <SkeletonLineChart className="w-[500px]" />,
}

export const ChartDonut: Story = {
  render: () => <SkeletonDonutChart className="w-[450px]" />,
}

export const Heatmap: Story = {
  render: () => <SkeletonHeatmap className="w-[600px]" />,
}

export const List: Story = {
  render: () => <SkeletonList className="w-[350px]" items={5} />,
}

export const CalendarSources: Story = {
  render: () => <SkeletonCalendarSources className="w-[300px]" items={4} />,
}

export const IntegrationCard: Story = {
  render: () => <SkeletonIntegrationCard className="w-[350px]" />,
}

export const MessageBubbleUser: Story = {
  render: () => (
    <div className="w-[500px]">
      <SkeletonMessageBubble isUser />
    </div>
  ),
}

export const MessageBubbleAssistant: Story = {
  render: () => (
    <div className="w-[500px]">
      <SkeletonMessageBubble />
    </div>
  ),
}

export const ChatConversation: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <SkeletonMessageBubble isUser />
      <SkeletonMessageBubble />
      <SkeletonMessageBubble isUser />
      <SkeletonMessageBubble />
    </div>
  ),
}

export const AnalyticsDashboard: Story = {
  render: () => (
    <div className="w-[900px] space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SkeletonChart />
        <SkeletonDonutChart />
      </div>
      <SkeletonLineChart />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground w-20">Small:</span>
        <Skeleton className="h-2 w-[100px]" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground w-20">Medium:</span>
        <Skeleton className="h-4 w-[150px]" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground w-20">Large:</span>
        <Skeleton className="h-8 w-[200px]" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground w-20">XL:</span>
        <Skeleton className="h-12 w-[250px]" />
      </div>
    </div>
  ),
}

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <Skeleton className="h-16 w-16 rounded-full mb-2" />
        <span className="text-xs text-muted-foreground">Circle</span>
      </div>
      <div className="text-center">
        <Skeleton className="h-16 w-16 rounded-md mb-2" />
        <span className="text-xs text-muted-foreground">Rounded</span>
      </div>
      <div className="text-center">
        <Skeleton className="h-16 w-16 rounded-none mb-2" />
        <span className="text-xs text-muted-foreground">Square</span>
      </div>
      <div className="text-center">
        <Skeleton className="h-16 w-32 rounded-md mb-2" />
        <span className="text-xs text-muted-foreground">Rectangle</span>
      </div>
    </div>
  ),
}
