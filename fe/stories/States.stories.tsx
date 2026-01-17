import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { Calendar, FileText, Inbox, MessageSquare, Search, Users, Wifi, WifiOff } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Card, CardContent } from '@/components/ui/card'

const emptyStateMeta: Meta<typeof EmptyState> = {
  title: 'UI/States/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default emptyStateMeta

type EmptyStateStory = StoryObj<typeof EmptyState>

export const Default: EmptyStateStory = {
  args: {
    icon: <Inbox />,
    title: 'No items found',
    description: 'Get started by creating your first item.',
    size: 'md',
  },
}

export const WithAction: EmptyStateStory = {
  args: {
    icon: <Calendar />,
    title: 'No events scheduled',
    description: 'Your calendar is empty. Create your first event to get started.',
    action: {
      label: 'Create Event',
      onClick: fn(),
    },
    size: 'md',
  },
}

export const Small: EmptyStateStory = {
  args: {
    icon: <MessageSquare />,
    title: 'No messages',
    size: 'sm',
  },
}

export const Large: EmptyStateStory = {
  args: {
    icon: <Users />,
    title: 'No team members',
    description: 'Invite your team members to collaborate on projects together.',
    action: {
      label: 'Invite Team',
      onClick: fn(),
    },
    size: 'lg',
  },
}

export const SearchEmpty: EmptyStateStory = {
  args: {
    icon: <Search />,
    title: 'No results found',
    description: 'Try adjusting your search or filter to find what you are looking for.',
    size: 'md',
  },
}

export const DocumentsEmpty: EmptyStateStory = {
  args: {
    icon: <FileText />,
    title: 'No documents yet',
    description: 'Upload your first document to get started.',
    action: {
      label: 'Upload Document',
      onClick: fn(),
    },
    size: 'md',
  },
}

export const InCard: EmptyStateStory = {
  render: () => (
    <Card className="w-[400px]">
      <CardContent className="pt-6">
        <EmptyState
          icon={<Calendar />}
          title="No upcoming events"
          description="Your schedule is clear for today."
          action={{
            label: 'Create Event',
            onClick: () => {},
          }}
        />
      </CardContent>
    </Card>
  ),
}

export const AllSizes: EmptyStateStory = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <EmptyState icon={<Inbox />} title="Small" description="Compact size" size="sm" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <EmptyState icon={<Inbox />} title="Medium" description="Default size" size="md" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <EmptyState icon={<Inbox />} title="Large" description="Prominent size" size="lg" />
        </CardContent>
      </Card>
    </div>
  ),
}

export const ErrorStateDefault: StoryObj<typeof ErrorState> = {
  render: () => <ErrorState />,
  name: 'Error State - Default',
}

export const ErrorStateWithTitle: StoryObj<typeof ErrorState> = {
  render: () => (
    <ErrorState
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection."
      onRetry={fn()}
    />
  ),
  name: 'Error State - With Title',
}

export const ErrorStateFullPage: StoryObj<typeof ErrorState> = {
  render: () => (
    <div className="border rounded-lg">
      <ErrorState
        title="Failed to load calendar"
        message="We couldn't load your calendar data. This might be a temporary issue."
        onRetry={fn()}
        fullPage
      />
    </div>
  ),
  name: 'Error State - Full Page',
}

export const ErrorStateCustomIcon: StoryObj<typeof ErrorState> = {
  render: () => (
    <ErrorState
      title="No internet connection"
      message="Please check your network settings and try again."
      icon={<WifiOff className="h-6 w-6 text-red-600 dark:text-red-400" />}
      onRetry={fn()}
    />
  ),
  name: 'Error State - Custom Icon',
}

export const ErrorStateInCard: StoryObj<typeof ErrorState> = {
  render: () => (
    <Card className="w-[400px]">
      <CardContent>
        <ErrorState
          title="Failed to load events"
          message="There was an error loading your events."
          onRetry={() => {}}
        />
      </CardContent>
    </Card>
  ),
  name: 'Error State - In Card',
}

export const StatesComparison: StoryObj = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<Calendar />}
            title="No events"
            description="Your calendar is empty"
            action={{ label: 'Create Event', onClick: () => {} }}
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <ErrorState title="Load failed" message="Could not load calendar" onRetry={() => {}} />
        </CardContent>
      </Card>
    </div>
  ),
  name: 'Empty vs Error State',
}
