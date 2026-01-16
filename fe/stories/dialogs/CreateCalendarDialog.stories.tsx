import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import CreateCalendarDialog from '@/components/dialogs/CreateCalendarDialog'
import { fn } from 'storybook/test'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { CalendarListEntry } from '@/types/api'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const mockExistingCalendars: CalendarListEntry[] = [
  {
    kind: 'calendar#calendarListEntry',
    etag: '"abc123"',
    id: 'primary@gmail.com',
    summary: 'Primary Calendar',
    backgroundColor: '#4285f4',
    primary: true,
  } as CalendarListEntry,
  {
    kind: 'calendar#calendarListEntry',
    etag: '"def456"',
    id: 'work@group.calendar.google.com',
    summary: 'Work',
    backgroundColor: '#0f9d58',
  } as CalendarListEntry,
]

const meta: Meta<typeof CreateCalendarDialog> = {
  title: 'Dialogs/CreateCalendarDialog',
  component: CreateCalendarDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A simple dialog for creating new secondary calendars in Google Calendar. Supports keyboard shortcuts and provides clear feedback on creation.',
      },
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onSuccess: fn(),
    existingCalendars: mockExistingCalendars,
  },
}

export const WithSuggestions: Story = {
  render: () => (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 space-y-3">
        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Calendar Name Ideas:</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            Work Projects
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            Personal Goals
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            Fitness & Health
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            Side Projects
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-pink-500" />
            Family Events
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            Travel Plans
          </li>
        </ul>
      </div>
      <QueryClientProvider client={queryClient}>
        <CreateCalendarDialog
          isOpen={true}
          onClose={fn()}
          onSuccess={fn()}
          existingCalendars={mockExistingCalendars}
        />
      </QueryClientProvider>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows the dialog with suggested calendar names for inspiration.',
      },
    },
  },
}

export const UseCases: Story = {
  render: () => (
    <div className="space-y-6 p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Create Calendar Dialog</h2>

      <div className="grid gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">When to Create Calendars</h3>
          <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
            <li>• Separate work from personal events</li>
            <li>• Track specific projects or goals</li>
            <li>• Organize events by category (fitness, social, etc.)</li>
            <li>• Share specific calendars with others</li>
            <li>• Create themed calendars for different life areas</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Tips</h3>
          <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
            <li>• Use descriptive names for easy identification</li>
            <li>• Press Enter to quickly create the calendar</li>
            <li>• New calendars sync automatically with Google Calendar</li>
          </ul>
        </div>
      </div>

      <QueryClientProvider client={queryClient}>
        <CreateCalendarDialog
          isOpen={true}
          onClose={fn()}
          onSuccess={fn()}
          existingCalendars={mockExistingCalendars}
        />
      </QueryClientProvider>
    </div>
  ),
}
