import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import EventsListDialog from '@/components/dialogs/EventsListDialog'
import { fn } from 'storybook/test'
import type { PatternEventSummary } from '@/types/analytics'

const mockEvents: PatternEventSummary[] = [
  {
    id: 'evt-001',
    summary: 'Weekly Team Standup',
    eventDate: '2026-01-16',
    startTime: '09:00',
    endTime: '09:30',
    durationMinutes: 30,
    calendarName: 'Work',
    calendarColor: '#4285f4',
    htmlLink: 'https://calendar.google.com/event?eid=abc123',
  },
  {
    id: 'evt-002',
    summary: 'Product Strategy Review',
    eventDate: '2026-01-16',
    startTime: '11:00',
    endTime: '12:00',
    durationMinutes: 60,
    calendarName: 'Work',
    calendarColor: '#4285f4',
    htmlLink: 'https://calendar.google.com/event?eid=def456',
  },
  {
    id: 'evt-003',
    summary: 'Lunch with Alex',
    eventDate: '2026-01-16',
    startTime: '12:30',
    endTime: '13:30',
    durationMinutes: 60,
    calendarName: 'Personal',
    calendarColor: '#0f9d58',
    htmlLink: 'https://calendar.google.com/event?eid=ghi789',
  },
  {
    id: 'evt-004',
    summary: 'Client Presentation: Q1 Roadmap',
    eventDate: '2026-01-16',
    startTime: '14:00',
    endTime: '15:30',
    durationMinutes: 90,
    calendarName: 'Work',
    calendarColor: '#4285f4',
    htmlLink: 'https://calendar.google.com/event?eid=jkl012',
  },
  {
    id: 'evt-005',
    summary: 'Gym Session',
    eventDate: '2026-01-16',
    startTime: '18:00',
    endTime: '19:00',
    durationMinutes: 60,
    calendarName: 'Health',
    calendarColor: '#f4b400',
  },
]

const meta: Meta<typeof EventsListDialog> = {
  title: 'Dialogs/EventsListDialog',
  component: EventsListDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Displays a list of calendar events with details like time, duration, and calendar. Used in analytics to show events matching specific patterns.',
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
    isOpen: { control: 'boolean' },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    events: { control: 'object' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Thursday Events',
    subtitle: 'January 16, 2026',
    events: mockEvents,
    onClose: fn(),
  },
}

export const WithSubtitle: Story = {
  args: {
    isOpen: true,
    title: 'Morning Meetings',
    subtitle: 'Events before 12:00 PM',
    events: mockEvents.filter((e) => parseInt(e.startTime) < 12),
    onClose: fn(),
  },
}

export const SingleEvent: Story = {
  args: {
    isOpen: true,
    title: 'Focus Time',
    subtitle: 'Deep work session',
    events: [
      {
        id: 'evt-focus',
        summary: 'Deep Work: Feature Development',
        eventDate: '2026-01-16',
        startTime: '10:00',
        endTime: '12:00',
        durationMinutes: 120,
        calendarName: 'Focus',
        calendarColor: '#9c27b0',
        htmlLink: 'https://calendar.google.com/event?eid=focus123',
      },
    ],
    onClose: fn(),
  },
}

export const ManyEvents: Story = {
  args: {
    isOpen: true,
    title: 'Weekly Overview',
    subtitle: 'All events this week',
    events: [
      ...mockEvents,
      {
        id: 'evt-006',
        summary: '1:1 with Manager',
        eventDate: '2026-01-17',
        startTime: '10:00',
        endTime: '10:30',
        durationMinutes: 30,
        calendarName: 'Work',
        calendarColor: '#4285f4',
      },
      {
        id: 'evt-007',
        summary: 'Sprint Planning',
        eventDate: '2026-01-17',
        startTime: '14:00',
        endTime: '16:00',
        durationMinutes: 120,
        calendarName: 'Work',
        calendarColor: '#4285f4',
      },
      {
        id: 'evt-008',
        summary: 'Coffee with Sarah',
        eventDate: '2026-01-18',
        startTime: '15:00',
        endTime: '15:30',
        durationMinutes: 30,
        calendarName: 'Personal',
        calendarColor: '#0f9d58',
      },
    ],
    onClose: fn(),
  },
}

export const EmptyState: Story = {
  args: {
    isOpen: true,
    title: 'Weekend Events',
    subtitle: 'January 18-19, 2026',
    events: [],
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the empty state when no events match the criteria.',
      },
    },
  },
}

export const LongEventTitles: Story = {
  args: {
    isOpen: true,
    title: 'Project Meetings',
    events: [
      {
        id: 'evt-long-1',
        summary: 'Quarterly Business Review Meeting with Leadership Team and External Stakeholders',
        eventDate: '2026-01-16',
        startTime: '09:00',
        endTime: '11:00',
        durationMinutes: 120,
        calendarName: 'Executive',
        calendarColor: '#673ab7',
        htmlLink: 'https://calendar.google.com/event?eid=long1',
      },
      {
        id: 'evt-long-2',
        summary: 'Technical Architecture Review: Microservices Migration Phase 2',
        eventDate: '2026-01-16',
        startTime: '13:00',
        endTime: '14:30',
        durationMinutes: 90,
        calendarName: 'Engineering',
        calendarColor: '#e91e63',
        htmlLink: 'https://calendar.google.com/event?eid=long2',
      },
    ],
    onClose: fn(),
  },
}
