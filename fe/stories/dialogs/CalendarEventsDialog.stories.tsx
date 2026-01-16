import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import CalendarEventsDialog from '@/components/dialogs/CalendarEventsDialog'
import { fn } from 'storybook/test'
import type { CalendarEvent } from '@/types/api'

const createMockEvent = (overrides: Partial<CalendarEvent>): CalendarEvent =>
  ({
    kind: 'calendar#event',
    id: 'evt-001',
    etag: '"abc123"',
    status: 'confirmed',
    htmlLink: 'https://calendar.google.com/event?eid=abc',
    summary: 'Mock Event',
    creator: { email: 'creator@example.com' },
    organizer: { email: 'organizer@example.com' },
    start: { dateTime: '2026-01-13T09:00:00-08:00' },
    end: { dateTime: '2026-01-13T10:00:00-08:00' },
    reminders: { useDefault: true },
    created: '2026-01-10T10:00:00Z',
    updated: '2026-01-10T10:00:00Z',
    ...overrides,
  }) as CalendarEvent

const createMockEvents = (calendarEmail: string): CalendarEvent[] => [
  createMockEvent({
    id: 'cal-evt-001',
    summary: 'Weekly Planning Session',
    description: 'Review and plan tasks for the upcoming week',
    location: 'Main Office, Room 301',
    start: { dateTime: '2026-01-13T09:00:00-08:00' },
    end: { dateTime: '2026-01-13T10:00:00-08:00' },
    organizer: { email: calendarEmail },
  }),
  createMockEvent({
    id: 'cal-evt-002',
    summary: 'Project Alpha Sync',
    description: 'Status update on Project Alpha milestones',
    start: { dateTime: '2026-01-13T14:00:00-08:00' },
    end: { dateTime: '2026-01-13T15:00:00-08:00' },
    organizer: { email: calendarEmail },
  }),
  createMockEvent({
    id: 'cal-evt-003',
    summary: 'Team Retrospective',
    start: { dateTime: '2026-01-14T11:00:00-08:00' },
    end: { dateTime: '2026-01-14T12:00:00-08:00' },
    organizer: { email: calendarEmail },
  }),
  createMockEvent({
    id: 'cal-evt-004',
    summary: 'Client Demo',
    description: 'Demo new features to client stakeholders',
    status: 'tentative',
    location: 'Zoom Meeting',
    start: { dateTime: '2026-01-15T10:00:00-08:00' },
    end: { dateTime: '2026-01-15T11:30:00-08:00' },
    organizer: { email: calendarEmail },
  }),
  createMockEvent({
    id: 'cal-evt-005',
    summary: 'Friday All-Hands',
    description: 'Company-wide update and Q&A session',
    start: { dateTime: '2026-01-16T16:00:00-08:00' },
    end: { dateTime: '2026-01-16T17:00:00-08:00' },
    organizer: { email: calendarEmail },
  }),
]

const meta: Meta<typeof CalendarEventsDialog> = {
  title: 'Dialogs/CalendarEventsDialog',
  component: CalendarEventsDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Displays all events from a specific calendar within a date range. Features search functionality and total hours calculation.',
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
    calendarName: 'Work Calendar',
    calendarColor: '#4285f4',
    dateRange: {
      from: new Date('2026-01-13'),
      to: new Date('2026-01-19'),
    },
    events: createMockEvents('work@calendar.google.com'),
    isLoading: false,
    totalHours: 6.5,
    onClose: fn(),
    onEventClick: fn(),
  },
}

export const PersonalCalendar: Story = {
  args: {
    isOpen: true,
    calendarName: 'Personal',
    calendarColor: '#0f9d58',
    dateRange: {
      from: new Date('2026-01-13'),
      to: new Date('2026-01-19'),
    },
    events: [
      createMockEvent({
        id: 'personal-001',
        summary: 'Dentist Appointment',
        location: 'Downtown Dental, Suite 200',
        start: { dateTime: '2026-01-14T14:00:00-08:00' },
        end: { dateTime: '2026-01-14T15:00:00-08:00' },
        organizer: { email: 'personal@calendar.google.com' },
      }),
      createMockEvent({
        id: 'personal-002',
        summary: 'Birthday Party - Jake',
        description: 'Remember to bring gift!',
        location: '789 Party Lane',
        start: { dateTime: '2026-01-15T18:00:00-08:00' },
        end: { dateTime: '2026-01-15T21:00:00-08:00' },
        organizer: { email: 'personal@calendar.google.com' },
      }),
      createMockEvent({
        id: 'personal-003',
        summary: 'Car Service',
        location: 'AutoCare Plus',
        start: { dateTime: '2026-01-16T08:00:00-08:00' },
        end: { dateTime: '2026-01-16T09:00:00-08:00' },
        organizer: { email: 'personal@calendar.google.com' },
      }),
    ],
    isLoading: false,
    totalHours: 5,
    onClose: fn(),
    onEventClick: fn(),
  },
}

export const HealthCalendar: Story = {
  args: {
    isOpen: true,
    calendarName: 'Health & Fitness',
    calendarColor: '#f4b400',
    dateRange: {
      from: new Date('2026-01-13'),
      to: new Date('2026-01-19'),
    },
    events: [
      createMockEvent({
        id: 'health-001',
        summary: 'Morning Yoga',
        location: 'Living Room',
        start: { dateTime: '2026-01-13T07:00:00-08:00' },
        end: { dateTime: '2026-01-13T07:45:00-08:00' },
        organizer: { email: 'health@calendar.google.com' },
      }),
      createMockEvent({
        id: 'health-002',
        summary: 'Gym - Leg Day',
        location: 'Downtown Gym',
        start: { dateTime: '2026-01-14T18:00:00-08:00' },
        end: { dateTime: '2026-01-14T19:30:00-08:00' },
        organizer: { email: 'health@calendar.google.com' },
      }),
      createMockEvent({
        id: 'health-003',
        summary: 'Running Club',
        description: '5K group run in the park',
        location: 'Central Park Entrance',
        start: { dateTime: '2026-01-15T06:30:00-08:00' },
        end: { dateTime: '2026-01-15T07:30:00-08:00' },
        organizer: { email: 'health@calendar.google.com' },
      }),
      createMockEvent({
        id: 'health-004',
        summary: 'Physical Therapy',
        location: 'PT Associates',
        start: { dateTime: '2026-01-16T10:00:00-08:00' },
        end: { dateTime: '2026-01-16T11:00:00-08:00' },
        organizer: { email: 'health@calendar.google.com' },
      }),
    ],
    isLoading: false,
    totalHours: 4.75,
    onClose: fn(),
    onEventClick: fn(),
  },
}

export const EmptyCalendar: Story = {
  args: {
    isOpen: true,
    calendarName: 'Holidays',
    calendarColor: '#9c27b0',
    dateRange: {
      from: new Date('2026-01-13'),
      to: new Date('2026-01-19'),
    },
    events: [],
    isLoading: false,
    totalHours: 0,
    onClose: fn(),
    onEventClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the empty state when no events exist in the selected date range.',
      },
    },
  },
}

export const Loading: Story = {
  args: {
    isOpen: true,
    calendarName: 'Work Calendar',
    calendarColor: '#4285f4',
    dateRange: {
      from: new Date('2026-01-13'),
      to: new Date('2026-01-19'),
    },
    events: [],
    isLoading: true,
    totalHours: 0,
    onClose: fn(),
    onEventClick: fn(),
  },
}

export const ManyEvents: Story = {
  args: {
    isOpen: true,
    calendarName: 'Team Meetings',
    calendarColor: '#e91e63',
    dateRange: {
      from: new Date('2026-01-13'),
      to: new Date('2026-01-19'),
    },
    events: [
      ...createMockEvents('team@calendar.google.com'),
      createMockEvent({
        id: 'cal-evt-006',
        summary: 'Sprint Review',
        start: { dateTime: '2026-01-14T15:00:00-08:00' },
        end: { dateTime: '2026-01-14T16:30:00-08:00' },
        organizer: { email: 'team@calendar.google.com' },
      }),
      createMockEvent({
        id: 'cal-evt-007',
        summary: 'Design Critique',
        start: { dateTime: '2026-01-15T13:00:00-08:00' },
        end: { dateTime: '2026-01-15T14:00:00-08:00' },
        organizer: { email: 'team@calendar.google.com' },
      }),
      createMockEvent({
        id: 'cal-evt-008',
        summary: 'Tech Talk: GraphQL',
        description: 'Introduction to GraphQL best practices',
        start: { dateTime: '2026-01-16T11:00:00-08:00' },
        end: { dateTime: '2026-01-16T12:00:00-08:00' },
        organizer: { email: 'team@calendar.google.com' },
      }),
    ],
    isLoading: false,
    totalHours: 11.5,
    onClose: fn(),
    onEventClick: fn(),
  },
}

export const MonthlyView: Story = {
  args: {
    isOpen: true,
    calendarName: 'Work Calendar',
    calendarColor: '#00bcd4',
    dateRange: {
      from: new Date('2026-01-01'),
      to: new Date('2026-01-31'),
    },
    events: createMockEvents('work@calendar.google.com'),
    isLoading: false,
    totalHours: 42.5,
    onClose: fn(),
    onEventClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Viewing calendar events for an entire month.',
      },
    },
  },
}
