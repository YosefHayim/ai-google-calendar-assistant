import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EventPreview } from '@/components/dialogs/quick-event/EventPreview'
import type { ParsedEventData } from '@/types/api'

const meta: Meta<typeof EventPreview> = {
  title: 'Dialogs/QuickEvent/EventPreview',
  component: EventPreview,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A compact preview card showing parsed event details. Used in the QuickEventDialog to display what the AI understood from the user input.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    event: {
      summary: 'Team Planning Meeting',
      date: 'Tomorrow',
      time: '2:00 PM',
      duration: '1 hour',
      location: 'Conference Room B',
    },
    calendarName: 'Work',
  },
}

export const WithAllDetails: Story = {
  args: {
    event: {
      summary: 'Product Launch Presentation',
      date: 'January 20, 2026',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Main Auditorium, Building A',
    },
    calendarName: 'Marketing',
  },
}

export const MinimalEvent: Story = {
  args: {
    event: {
      summary: 'Quick Call',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'An event with only a title - minimal information parsed.',
      },
    },
  },
}

export const WithDateOnly: Story = {
  args: {
    event: {
      summary: 'All-Day Conference',
      date: 'March 15, 2026',
    },
    calendarName: 'Events',
  },
}

export const WithTimeOnly: Story = {
  args: {
    event: {
      summary: 'Morning Standup',
      time: '9:00 AM',
      duration: '15 minutes',
    },
    calendarName: 'Work',
  },
}

export const WithLocation: Story = {
  args: {
    event: {
      summary: 'Lunch with Sarah',
      date: 'Friday',
      time: '12:30 PM',
      location: 'Cafe Roma, 456 Main Street',
    },
    calendarName: 'Personal',
  },
}

export const LongEventTitle: Story = {
  args: {
    event: {
      summary: 'Quarterly Business Review Meeting with Executive Leadership Team and External Stakeholders',
      date: 'Next Monday',
      time: '9:00 AM',
      duration: '3 hours',
      location: 'Executive Boardroom',
    },
    calendarName: 'Executive',
  },
}

export const RecurringEventPreview: Story = {
  args: {
    event: {
      summary: 'Weekly Team Standup',
      date: 'Every Monday',
      time: '9:00 AM',
      duration: '30 minutes',
    },
    calendarName: 'Team',
  },
  parameters: {
    docs: {
      description: {
        story: 'Preview for a recurring event pattern.',
      },
    },
  },
}

export const RelativeDatePreview: Story = {
  args: {
    event: {
      summary: 'Doctor Appointment',
      date: 'In 2 weeks',
      time: '3:30 PM',
      duration: '1 hour',
      location: 'Medical Center',
    },
    calendarName: 'Health',
  },
}

export const NoCalendarName: Story = {
  args: {
    event: {
      summary: 'Personal Task',
      date: 'Today',
      time: '5:00 PM',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Preview without a calendar name specified.',
      },
    },
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 max-w-lg">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Event Preview Variants</h3>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-zinc-500 mb-2">FULL DETAILS</p>
          <EventPreview
            event={{
              summary: 'Product Demo',
              date: 'Tomorrow',
              time: '2:00 PM',
              duration: '1 hour',
              location: 'Meeting Room A',
            }}
            calendarName="Work"
          />
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500 mb-2">DATE & TIME ONLY</p>
          <EventPreview
            event={{
              summary: 'Quick Sync',
              date: 'Friday',
              time: '4:00 PM',
            }}
            calendarName="Team"
          />
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500 mb-2">MINIMAL</p>
          <EventPreview
            event={{
              summary: 'Remember to call John',
            }}
          />
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500 mb-2">WITH LOCATION</p>
          <EventPreview
            event={{
              summary: 'Dinner Reservation',
              date: 'Saturday',
              time: '7:30 PM',
              location: 'The Italian Place',
            }}
            calendarName="Personal"
          />
        </div>
      </div>
    </div>
  ),
  decorators: [],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Multiple variants of the EventPreview component shown together.',
      },
    },
  },
}
