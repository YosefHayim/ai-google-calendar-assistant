import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge } from '@/components/ui/badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}

export const StatusBadges: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      <Badge className="bg-destructive hover:bg-destructive">Inactive</Badge>
      <Badge className="bg-primary hover:bg-primary">In Progress</Badge>
    </div>
  ),
}

export const PlanBadges: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="secondary">Free</Badge>
      <Badge variant="default">Pro</Badge>
      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0">Executive</Badge>
    </div>
  ),
}

export const WithCount: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="default">Messages 5</Badge>
      <Badge variant="secondary">Notifications 12</Badge>
      <Badge variant="destructive">Alerts 3</Badge>
    </div>
  ),
}

export const InContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">User Status:</span>
        <Badge className="bg-green-500">Online</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium">Subscription:</span>
        <Badge variant="default">Pro Plan</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium">Trial:</span>
        <Badge variant="outline">14 days left</Badge>
      </div>
    </div>
  ),
}
