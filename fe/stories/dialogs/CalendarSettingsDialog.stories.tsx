import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import CalendarSettingsDialog from '@/components/dialogs/CalendarSettingsDialog'
import { fn } from 'storybook/test'
import type { CalendarListEntry } from '@/types/api'

const createMockCalendar = (overrides: Partial<CalendarListEntry> = {}): CalendarListEntry => ({
  id: 'work@group.calendar.google.com',
  summary: 'Work Calendar',
  description: 'Professional meetings and work-related events',
  timeZone: 'America/Los_Angeles',
  accessRole: 'owner',
  backgroundColor: '#4285f4',
  foregroundColor: '#ffffff',
  colorId: '9',
  primary: false,
  selected: true,
  defaultReminders: [
    { method: 'popup', minutes: 30 },
    { method: 'email', minutes: 1440 },
  ],
  ...overrides,
})

const meta: Meta<typeof CalendarSettingsDialog> = {
  title: 'Dialogs/CalendarSettingsDialog',
  component: CalendarSettingsDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Displays detailed calendar settings including ID, timezone, access role, reminders, notifications, and conference properties. Read-only view with helpful tooltips.',
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
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isOpen: true,
    calendar: createMockCalendar(),
    onClose: fn(),
  },
}

export const PrimaryCalendar: Story = {
  args: {
    isOpen: true,
    calendar: createMockCalendar({
      id: 'user@gmail.com',
      summary: 'user@gmail.com',
      description: undefined,
      primary: true,
      accessRole: 'owner',
      backgroundColor: '#0f9d58',
      foregroundColor: '#ffffff',
    }),
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'The primary calendar associated with the user\'s Google account.',
      },
    },
  },
}

export const SharedCalendar: Story = {
  args: {
    isOpen: true,
    calendar: createMockCalendar({
      id: 'team-shared@group.calendar.google.com',
      summary: 'Team Shared Calendar',
      description: 'Shared calendar for the engineering team',
      accessRole: 'writer',
      primary: false,
      backgroundColor: '#9c27b0',
      defaultReminders: [],
    }),
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A shared calendar where the user has write access but is not the owner.',
      },
    },
  },
}

export const ReadOnlyCalendar: Story = {
  args: {
    isOpen: true,
    calendar: createMockCalendar({
      id: 'holidays@group.v.calendar.google.com',
      summary: 'US Holidays',
      description: 'Official US holiday calendar',
      accessRole: 'reader',
      primary: false,
      selected: true,
      backgroundColor: '#f4b400',
      foregroundColor: '#000000',
      defaultReminders: [],
    }),
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A read-only calendar like public holidays that cannot be modified.',
      },
    },
  },
}

export const WithNotifications: Story = {
  args: {
    isOpen: true,
    calendar: {
      ...createMockCalendar(),
      notificationSettings: {
        notifications: [
          { type: 'eventCreation', method: 'email' },
          { type: 'eventChange', method: 'email' },
          { type: 'eventCancellation', method: 'email' },
          { type: 'eventResponse', method: 'email' },
        ],
      },
    } as CalendarListEntry,
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar with email notifications configured for various event types.',
      },
    },
  },
}

export const WithConferenceProperties: Story = {
  args: {
    isOpen: true,
    calendar: {
      ...createMockCalendar({
        summary: 'Meeting Room Calendar',
        description: 'Calendar for booking the main conference room',
      }),
      conferenceProperties: {
        allowedConferenceSolutionTypes: ['hangoutsMeet', 'eventHangout'],
      },
    } as CalendarListEntry,
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar with video conferencing options enabled.',
      },
    },
  },
}

export const MinimalCalendar: Story = {
  args: {
    isOpen: true,
    calendar: {
      id: 'simple@group.calendar.google.com',
      summary: 'Simple Calendar',
      backgroundColor: '#607d8b',
      accessRole: 'owner',
    } as CalendarListEntry,
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A calendar with minimal settings configured.',
      },
    },
  },
}

export const FullyConfigured: Story = {
  args: {
    isOpen: true,
    calendar: {
      id: 'comprehensive@group.calendar.google.com',
      summary: 'Comprehensive Calendar',
      description: 'A fully configured calendar with all settings enabled',
      timeZone: 'America/New_York',
      accessRole: 'owner',
      backgroundColor: '#e91e63',
      foregroundColor: '#ffffff',
      colorId: '4',
      primary: false,
      selected: true,
      defaultReminders: [
        { method: 'popup', minutes: 10 },
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 1440 },
      ],
      notificationSettings: {
        notifications: [
          { type: 'eventCreation', method: 'email' },
          { type: 'eventChange', method: 'email' },
          { type: 'eventCancellation', method: 'email' },
        ],
      },
      conferenceProperties: {
        allowedConferenceSolutionTypes: ['hangoutsMeet'],
      },
      location: 'San Francisco Office',
    } as CalendarListEntry,
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A calendar with all possible settings configured and visible.',
      },
    },
  },
}

export const DifferentTimezone: Story = {
  args: {
    isOpen: true,
    calendar: createMockCalendar({
      summary: 'Tokyo Office',
      description: 'Calendar for the Tokyo office team',
      timeZone: 'Asia/Tokyo',
      backgroundColor: '#00bcd4',
    }),
    onClose: fn(),
  },
}
