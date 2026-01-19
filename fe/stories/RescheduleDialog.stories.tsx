import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { RescheduleDialog } from '@/components/dashboard/RescheduleDialog'
import { fn } from 'storybook/test'

const meta: Meta<typeof RescheduleDialog> = {
  title: 'Dialogs/RescheduleDialog',
  component: RescheduleDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Smart reschedule dialog that suggests optimal time slots for moving calendar events. Features time preference filters, conflict-free suggestions, and one-click rescheduling.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls dialog visibility',
    },
    onOpenChange: {
      action: 'open-change',
      description: 'Callback when dialog open state changes',
    },
    eventId: {
      control: 'text',
      description: 'ID of the event to reschedule',
    },
    eventSummary: {
      control: 'text',
      description: 'Title/summary of the event',
    },
    calendarId: {
      control: 'text',
      description: 'Optional calendar ID for the event',
    },
    onSuccess: {
      action: 'success',
      description: 'Callback when reschedule is successful',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: fn(),
    eventId: 'evt_123456789',
    eventSummary: 'Team Standup Meeting',
    calendarId: 'primary',
    onSuccess: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default reschedule dialog showing time preference options and loading suggestions.',
      },
    },
  },
}

export const LongEventTitle: Story = {
  args: {
    open: true,
    onOpenChange: fn(),
    eventId: 'evt_long_title',
    eventSummary: 'Quarterly Business Review with Marketing, Sales, and Product Teams - Q1 2026 Planning Session',
    calendarId: 'primary',
    onSuccess: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Dialog with a long event title to test text truncation/wrapping.',
      },
    },
  },
}

export const Closed: Story = {
  args: {
    open: false,
    onOpenChange: fn(),
    eventId: 'evt_123',
    eventSummary: 'Meeting',
    onSuccess: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Dialog in closed state.',
      },
    },
  },
}

export const Features: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground dark:text-primary-foreground mb-4">
          Smart Reschedule Features
        </h1>
        <p className="text-muted-foreground dark:text-muted-foreground">
          AI-powered event rescheduling with conflict detection
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-6 bg-background dark:bg-secondary rounded-xl border ">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Time Preferences</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">Any time</span>
            <span className="px-3 py-1 bg-secondary dark:bg-secondary text-zinc-700 dark:text-zinc-300 rounded-full text-sm">
              Morning
            </span>
            <span className="px-3 py-1 bg-secondary dark:bg-secondary text-zinc-700 dark:text-zinc-300 rounded-full text-sm">
              Afternoon
            </span>
            <span className="px-3 py-1 bg-secondary dark:bg-secondary text-zinc-700 dark:text-zinc-300 rounded-full text-sm">
              Evening
            </span>
          </div>
        </div>

        <div className="p-6 bg-background dark:bg-secondary rounded-xl border ">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Suggestion Features</h3>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Conflict-free time slots only
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Searches next 7 days by default
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Shows day of week and formatted time
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Explains why each slot is recommended
            </li>
          </ul>
        </div>

        <div className="p-6 bg-background dark:bg-secondary rounded-xl border ">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Current Event Display</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Current:</span>
            <span>Mon, Jan 20 at 10:00 AM</span>
            <span>→</span>
            <span>11:00 AM</span>
            <span className="ml-auto px-2 py-0.5 bg-secondary dark:bg-secondary rounded text-xs">60 min</span>
          </div>
        </div>

        <div className="p-6 bg-background dark:bg-secondary rounded-xl border ">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Suggested Slots Example</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 border-primary bg-primary/5 rounded-lg">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Tuesday</p>
                <p className="text-xs text-muted-foreground">2:00 PM - 3:00 PM</p>
              </div>
              <span className="text-xs text-primary font-medium">Best match</span>
            </div>
            <div className="flex items-center gap-3 p-3  rounded-lg">
              <div className="w-8 h-8 bg-secondary dark:bg-secondary rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Wednesday</p>
                <p className="text-xs text-muted-foreground">9:00 AM - 10:00 AM</p>
              </div>
              <span className="text-xs text-muted-foreground">Morning slot</span>
            </div>
            <div className="flex items-center gap-3 p-3  rounded-lg">
              <div className="w-8 h-8 bg-secondary dark:bg-secondary rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Thursday</p>
                <p className="text-xs text-muted-foreground">4:00 PM - 5:00 PM</p>
              </div>
              <span className="text-xs text-muted-foreground">End of day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Visual documentation of reschedule dialog features and UI elements.',
      },
    },
  },
}

export const DarkMode: Story = {
  args: {
    open: true,
    onOpenChange: fn(),
    eventId: 'evt_dark_mode',
    eventSummary: 'Product Review Meeting',
    calendarId: 'primary',
    onSuccess: fn(),
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-secondary flex items-center justify-center p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Reschedule dialog appearance in dark mode.',
      },
    },
  },
}

export const MobileView: Story = {
  args: {
    open: true,
    onOpenChange: fn(),
    eventId: 'evt_mobile',
    eventSummary: 'Coffee Chat with Alex',
    calendarId: 'primary',
    onSuccess: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Responsive dialog layout on mobile devices.',
      },
    },
  },
}
