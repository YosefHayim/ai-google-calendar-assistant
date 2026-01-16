import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import DayEventsDialog from '@/components/dialogs/DayEventsDialog'
import { fn } from 'storybook/test'
import type { CalendarEvent } from '@/types/api'

const createCalendarMap = () => {
  return new Map([
    ['work@calendar.google.com', { name: 'Work', color: '#4285f4' }],
    ['personal@calendar.google.com', { name: 'Personal', color: '#0f9d58' }],
    ['health@calendar.google.com', { name: 'Health & Fitness', color: '#f4b400' }],
    ['social@calendar.google.com', { name: 'Social', color: '#e91e63' }],
  ])
}

const mockEvents: CalendarEvent[] = [
  {
    id: 'day-evt-001',
    summary: 'Morning Standup',
    description: 'Daily team sync to discuss blockers and progress',
    status: 'confirmed',
    start: { dateTime: '2026-01-16T09:00:00-08:00' },
    end: { dateTime: '2026-01-16T09:15:00-08:00' },
    organizer: { email: 'work@calendar.google.com' },
  },
  {
    id: 'day-evt-002',
    summary: 'Design Review: New Dashboard',
    description: 'Review mockups for the analytics dashboard redesign',
    status: 'confirmed',
    location: 'Conference Room A',
    start: { dateTime: '2026-01-16T10:00:00-08:00' },
    end: { dateTime: '2026-01-16T11:30:00-08:00' },
    organizer: { email: 'work@calendar.google.com' },
  },
  {
    id: 'day-evt-003',
    summary: 'Lunch Break',
    status: 'confirmed',
    start: { dateTime: '2026-01-16T12:00:00-08:00' },
    end: { dateTime: '2026-01-16T13:00:00-08:00' },
    organizer: { email: 'personal@calendar.google.com' },
  },
  {
    id: 'day-evt-004',
    summary: 'Client Call: Project Kickoff',
    description: 'Initial project kickoff call with the new client',
    status: 'confirmed',
    start: { dateTime: '2026-01-16T14:00:00-08:00' },
    end: { dateTime: '2026-01-16T15:00:00-08:00' },
    organizer: { email: 'work@calendar.google.com' },
  },
  {
    id: 'day-evt-005',
    summary: 'Gym - Upper Body',
    description: 'Focus on chest and shoulders today',
    status: 'confirmed',
    location: 'Downtown Fitness Center',
    start: { dateTime: '2026-01-16T18:00:00-08:00' },
    end: { dateTime: '2026-01-16T19:00:00-08:00' },
    organizer: { email: 'health@calendar.google.com' },
  },
  {
    id: 'day-evt-006',
    summary: 'Dinner with Friends',
    description: 'Monthly dinner at the new Italian place',
    status: 'tentative',
    location: 'Trattoria Roma, 456 Main St',
    start: { dateTime: '2026-01-16T19:30:00-08:00' },
    end: { dateTime: '2026-01-16T21:30:00-08:00' },
    organizer: { email: 'social@calendar.google.com' },
  },
]

const meta: Meta<typeof DayEventsDialog> = {
  title: 'Dialogs/DayEventsDialog',
  component: DayEventsDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Shows all events for a specific day with a 24-hour timeline visualization, search functionality, and available hours calculation.',
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
    date: '2026-01-16',
    availableHours: 8.75,
    events: mockEvents,
    calendarMap: createCalendarMap(),
    isLoading: false,
    onClose: fn(),
    onEventClick: fn(),
  },
}

export const BusyDay: Story = {
  args: {
    isOpen: true,
    date: '2026-01-16',
    availableHours: 3.5,
    events: [
      ...mockEvents,
      {
        id: 'day-evt-extra-1',
        summary: '1:1 with Manager',
        status: 'confirmed',
        start: { dateTime: '2026-01-16T09:30:00-08:00' },
        end: { dateTime: '2026-01-16T10:00:00-08:00' },
        organizer: { email: 'work@calendar.google.com' },
      },
      {
        id: 'day-evt-extra-2',
        summary: 'Sprint Retrospective',
        status: 'confirmed',
        start: { dateTime: '2026-01-16T15:30:00-08:00' },
        end: { dateTime: '2026-01-16T17:00:00-08:00' },
        organizer: { email: 'work@calendar.google.com' },
      },
    ],
    calendarMap: createCalendarMap(),
    isLoading: false,
    onClose: fn(),
    onEventClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A day with many overlapping events showing limited available time.',
      },
    },
  },
}

export const LightDay: Story = {
  args: {
    isOpen: true,
    date: '2026-01-16',
    availableHours: 14,
    events: [
      {
        id: 'day-evt-light-1',
        summary: 'Quick Team Sync',
        status: 'confirmed',
        start: { dateTime: '2026-01-16T10:00:00-08:00' },
        end: { dateTime: '2026-01-16T10:30:00-08:00' },
        organizer: { email: 'work@calendar.google.com' },
      },
      {
        id: 'day-evt-light-2',
        summary: 'Lunch',
        status: 'confirmed',
        start: { dateTime: '2026-01-16T12:30:00-08:00' },
        end: { dateTime: '2026-01-16T13:30:00-08:00' },
        organizer: { email: 'personal@calendar.google.com' },
      },
    ],
    calendarMap: createCalendarMap(),
    isLoading: false,
    onClose: fn(),
    onEventClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A light day with plenty of available time for focused work.',
      },
    },
  },
}

export const EmptyDay: Story = {
  args: {
    isOpen: true,
    date: '2026-01-18',
    availableHours: 16,
    events: [],
    calendarMap: createCalendarMap(),
    isLoading: false,
    onClose: fn(),
    onEventClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A completely free day with no scheduled events.',
      },
    },
  },
}

export const Loading: Story = {
  args: {
    isOpen: true,
    date: '2026-01-16',
    availableHours: 8,
    events: [],
    calendarMap: createCalendarMap(),
    isLoading: true,
    onClose: fn(),
    onEventClick: fn(),
  },
}

export const WithAllDayEvent: Story = {
  args: {
    isOpen: true,
    date: '2026-01-16',
    availableHours: 10,
    events: [
      {
        id: 'day-evt-allday',
        summary: 'Company Holiday',
        status: 'confirmed',
        start: { date: '2026-01-16' },
        end: { date: '2026-01-17' },
        organizer: { email: 'work@calendar.google.com' },
      },
      ...mockEvents.slice(0, 2),
    ],
    calendarMap: createCalendarMap(),
    isLoading: false,
    onClose: fn(),
    onEventClick: fn(),
  },
}

export const EarlyMorningLateNight: Story = {
  args: {
    isOpen: true,
    date: '2026-01-16',
    availableHours: 6,
    events: [
      {
        id: 'day-evt-early',
        summary: 'Early Morning Workout',
        status: 'confirmed',
        start: { dateTime: '2026-01-16T06:00:00-08:00' },
        end: { dateTime: '2026-01-16T07:00:00-08:00' },
        organizer: { email: 'health@calendar.google.com' },
      },
      ...mockEvents,
      {
        id: 'day-evt-late',
        summary: 'Late Night Call (Australia)',
        description: 'Sync with the Sydney team',
        status: 'confirmed',
        start: { dateTime: '2026-01-16T22:00:00-08:00' },
        end: { dateTime: '2026-01-16T23:00:00-08:00' },
        organizer: { email: 'work@calendar.google.com' },
      },
    ],
    calendarMap: createCalendarMap(),
    isLoading: false,
    onClose: fn(),
    onEventClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a day with events spanning from early morning to late night.',
      },
    },
  },
}
