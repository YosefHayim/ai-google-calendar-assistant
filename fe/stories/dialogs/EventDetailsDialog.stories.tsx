import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import EventDetailsDialog from '@/components/dialogs/EventDetailsDialog'
import { fn } from 'storybook/test'
import type { CalendarEvent } from '@/types/api'

const createMockEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent =>
  ({
    kind: 'calendar#event',
    id: 'evt-details-001',
    etag: '"abc123"',
    status: 'confirmed',
    htmlLink: 'https://calendar.google.com/event?eid=details123',
    summary: 'Product Strategy Meeting',
    description:
      'Discuss Q1 roadmap priorities and resource allocation.\n\nAgenda:\n1. Review Q4 results\n2. Prioritize Q1 initiatives\n3. Assign ownership',
    location: '123 Innovation Drive, San Francisco, CA 94102',
    creator: { email: 'alex.johnson@company.com' },
    organizer: { email: 'alex.johnson@company.com' },
    start: {
      dateTime: '2026-01-16T14:00:00-08:00',
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: '2026-01-16T15:30:00-08:00',
      timeZone: 'America/Los_Angeles',
    },
    attendees: [
      { email: 'sarah.chen@company.com', responseStatus: 'accepted' },
      { email: 'mike.wilson@company.com', responseStatus: 'tentative' },
      { email: 'lisa.garcia@company.com', responseStatus: 'needsAction' },
      { email: 'david.kim@company.com', responseStatus: 'declined' },
    ],
    reminders: { useDefault: true },
    created: '2026-01-10T10:00:00Z',
    updated: '2026-01-10T10:00:00Z',
    ...overrides,
  }) as CalendarEvent

const meta: Meta<typeof EventDetailsDialog> = {
  title: 'Dialogs/EventDetailsDialog',
  component: EventDetailsDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive dialog showing full event details including time, location, description, organizer, attendees, and status. Includes reschedule functionality.',
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
    event: createMockEvent(),
    calendarColor: '#4285f4',
    calendarName: 'Work',
    onClose: fn(),
  },
}

export const ConfirmedEvent: Story = {
  args: {
    isOpen: true,
    event: createMockEvent({ status: 'confirmed' }),
    calendarColor: '#0f9d58',
    calendarName: 'Meetings',
    onClose: fn(),
  },
}

export const TentativeEvent: Story = {
  args: {
    isOpen: true,
    event: createMockEvent({
      summary: 'Possible Team Lunch',
      status: 'tentative',
      description: 'Tentative team lunch - awaiting confirmations from team members.',
    }),
    calendarColor: '#f4b400',
    calendarName: 'Social',
    onClose: fn(),
  },
}

export const CancelledEvent: Story = {
  args: {
    isOpen: true,
    event: createMockEvent({
      summary: 'Cancelled: Weekly Sync',
      status: 'cancelled',
      description: 'This meeting has been cancelled due to schedule conflicts.',
    }),
    calendarColor: '#db4437',
    calendarName: 'Work',
    onClose: fn(),
  },
}

export const AllDayEvent: Story = {
  args: {
    isOpen: true,
    event: createMockEvent({
      summary: 'Company Offsite',
      description: 'Annual company offsite at the beach resort. Transportation provided.',
      location: 'Seaside Resort & Spa, Monterey, CA',
      start: { date: '2026-01-20' },
      end: { date: '2026-01-21' },
    }),
    calendarColor: '#9c27b0',
    calendarName: 'Company Events',
    onClose: fn(),
  },
}

export const NoLocation: Story = {
  args: {
    isOpen: true,
    event: createMockEvent({
      summary: 'Remote Team Call',
      location: undefined,
      description: 'Weekly remote sync via video call.',
    }),
    calendarColor: '#4285f4',
    calendarName: 'Remote',
    onClose: fn(),
  },
}

export const NoAttendees: Story = {
  args: {
    isOpen: true,
    event: createMockEvent({
      summary: 'Personal Focus Time',
      description: 'Blocked time for deep work on the new feature.',
      attendees: undefined,
      organizer: { email: 'me@company.com' },
    }),
    calendarColor: '#673ab7',
    calendarName: 'Focus',
    onClose: fn(),
  },
}

export const ManyAttendees: Story = {
  args: {
    isOpen: true,
    event: createMockEvent({
      summary: 'All-Hands Meeting',
      attendees: [
        { email: 'person1@company.com', responseStatus: 'accepted' },
        { email: 'person2@company.com', responseStatus: 'accepted' },
        { email: 'person3@company.com', responseStatus: 'tentative' },
        { email: 'person4@company.com', responseStatus: 'accepted' },
        { email: 'person5@company.com', responseStatus: 'needsAction' },
        { email: 'person6@company.com', responseStatus: 'accepted' },
        { email: 'person7@company.com', responseStatus: 'declined' },
        { email: 'person8@company.com', responseStatus: 'accepted' },
        { email: 'person9@company.com', responseStatus: 'tentative' },
        { email: 'person10@company.com', responseStatus: 'accepted' },
      ],
    }),
    calendarColor: '#e91e63',
    calendarName: 'Company',
    onClose: fn(),
  },
}

export const MinimalEvent: Story = {
  args: {
    isOpen: true,
    event: createMockEvent({
      id: 'evt-minimal',
      summary: 'Quick Call',
      description: undefined,
      location: undefined,
      attendees: undefined,
      start: {
        dateTime: '2026-01-16T10:00:00-08:00',
      },
      end: {
        dateTime: '2026-01-16T10:15:00-08:00',
      },
    }),
    calendarColor: '#607d8b',
    calendarName: 'Quick',
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'An event with minimal information - just title and time.',
      },
    },
  },
}

export const LongDescription: Story = {
  args: {
    isOpen: true,
    event: createMockEvent({
      summary: 'Architecture Review',
      description: `## Architecture Review: Microservices Migration

### Background
We're migrating our monolithic application to a microservices architecture. This meeting will cover the technical approach and timeline.

### Discussion Points
1. **Service boundaries** - How to define service boundaries
2. **Data management** - Database per service vs shared database
3. **Inter-service communication** - REST vs gRPC vs message queues
4. **Deployment strategy** - Kubernetes configuration and CI/CD pipeline

### Prerequisites
- Review the RFC document shared last week
- Come prepared with questions about your team's services

### Action Items from Last Meeting
- [ ] Complete API documentation
- [x] Set up monitoring dashboards
- [ ] Define SLAs for each service`,
    }),
    calendarColor: '#00bcd4',
    calendarName: 'Engineering',
    onClose: fn(),
  },
}
