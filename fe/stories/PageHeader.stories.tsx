import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PageHeader, SectionHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Download,
  Filter,
  RefreshCcw,
  CreditCard,
  Users,
  Bell,
} from 'lucide-react'

const meta: Meta<typeof PageHeader> = {
  title: 'UI/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    tooltip: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Calendar',
    description: 'Manage your schedule and events',
  },
}

export const WithIcon: Story = {
  args: {
    title: 'Analytics',
    description: 'Track your productivity and time allocation',
    icon: <BarChart3 className="h-4 w-4" />,
  },
}

export const WithTooltip: Story = {
  args: {
    title: 'Focus Time',
    description: 'Blocks of uninterrupted work time',
    icon: <Calendar className="h-4 w-4" />,
    tooltip:
      'Focus time helps you protect deep work periods in your calendar. Events during focus time will be automatically declined.',
  },
}

export const WithAction: Story = {
  args: {
    title: 'Events',
    description: 'All your scheduled calendar events',
    icon: <Calendar className="h-4 w-4" />,
    action: (
      <Button size="sm">
        <Plus className="h-4 w-4 mr-1" />
        New Event
      </Button>
    ),
  },
}

export const WithMultipleActions: Story = {
  args: {
    title: 'Analytics Dashboard',
    description: 'Insights into your calendar usage',
    icon: <BarChart3 className="h-4 w-4" />,
    action: (
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-1" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Button size="sm">
          <RefreshCcw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
    ),
  },
}

export const SettingsPage: Story = {
  args: {
    title: 'Settings',
    description: 'Manage your account and preferences',
    icon: <Settings className="h-4 w-4" />,
    action: (
      <Button variant="outline" size="sm">
        Save Changes
      </Button>
    ),
  },
}

export const BillingPage: Story = {
  args: {
    title: 'Billing',
    description: 'Manage your subscription and payment methods',
    icon: <CreditCard className="h-4 w-4" />,
    action: <Button size="sm">Upgrade Plan</Button>,
  },
}

export const TeamPage: Story = {
  args: {
    title: 'Team Members',
    description: '12 active members in your organization',
    icon: <Users className="h-4 w-4" />,
    tooltip: 'Team members can view and edit shared calendars based on their permissions.',
    action: (
      <Button size="sm">
        <Plus className="h-4 w-4 mr-1" />
        Invite Member
      </Button>
    ),
  },
}

export const NotificationsPage: Story = {
  args: {
    title: 'Notifications',
    description: 'Configure how you receive alerts and reminders',
    icon: <Bell className="h-4 w-4" />,
  },
}

export const SectionHeaderDefault: Story = {
  render: () => <SectionHeader title="Recent Events" tooltip="Events from the last 7 days" />,
}

export const SectionHeaderWithAction: Story = {
  render: () => (
    <SectionHeader
      title="Upcoming Meetings"
      tooltip="Scheduled meetings for the next week"
      action={
        <Button variant="ghost" size="sm">
          View All
        </Button>
      }
    />
  ),
}

export const PageWithSections: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-4xl">
      <PageHeader
        title="Dashboard"
        description="Overview of your calendar activity"
        icon={<BarChart3 className="h-4 w-4" />}
        action={
          <Button size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </Button>
        }
      />

      <div className="space-y-4">
        <SectionHeader
          title="This Week"
          tooltip="Summary of events scheduled this week"
          action={
            <Button variant="ghost" size="sm">
              See Details
            </Button>
          }
        />
        <div className="h-32 bg-secondary dark:bg-secondary rounded-md flex items-center justify-center text-muted-foreground">
          Chart Placeholder
        </div>
      </div>

      <div className="space-y-4">
        <SectionHeader
          title="Recent Activity"
          action={
            <Button variant="ghost" size="sm">
              View All
            </Button>
          }
        />
        <div className="h-48 bg-secondary dark:bg-secondary rounded-md flex items-center justify-center text-muted-foreground">
          Activity List Placeholder
        </div>
      </div>

      <div className="space-y-4">
        <SectionHeader title="Connected Calendars" />
        <div className="h-24 bg-secondary dark:bg-secondary rounded-md flex items-center justify-center text-muted-foreground">
          Calendar Sources Placeholder
        </div>
      </div>
    </div>
  ),
}
