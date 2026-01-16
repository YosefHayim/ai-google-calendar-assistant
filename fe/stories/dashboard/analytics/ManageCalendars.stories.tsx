import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import ManageCalendars from '@/components/dashboard/analytics/ManageCalendars'
import type { CalendarListEntry } from '@/types/api'
import { fn } from 'storybook/test'

const meta: Meta<typeof ManageCalendars> = {
  title: 'Dashboard/Analytics/ManageCalendars',
  component: ManageCalendars,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const mockCalendars: CalendarListEntry[] = [
  {
    kind: 'calendar#calendarListEntry',
    etag: '"abc123"',
    id: 'primary',
    summary: 'Personal',
    backgroundColor: '#4285f4',
    foregroundColor: '#ffffff',
    accessRole: 'owner',
    primary: true,
  },
  {
    kind: 'calendar#calendarListEntry',
    etag: '"def456"',
    id: 'work@company.com',
    summary: 'Work',
    backgroundColor: '#0b8043',
    foregroundColor: '#ffffff',
    accessRole: 'owner',
  },
  {
    kind: 'calendar#calendarListEntry',
    etag: '"ghi789"',
    id: 'fitness@gmail.com',
    summary: 'Fitness & Health',
    backgroundColor: '#e67c73',
    foregroundColor: '#ffffff',
    accessRole: 'owner',
  },
  {
    kind: 'calendar#calendarListEntry',
    etag: '"jkl012"',
    id: 'family@gmail.com',
    summary: 'Family Events',
    backgroundColor: '#f6bf26',
    foregroundColor: '#000000',
    accessRole: 'writer',
  },
]

const calendarMap = new Map<string, { name: string; color: string }>([
  ['primary', { name: 'Personal', color: '#4285f4' }],
  ['work@company.com', { name: 'Work', color: '#0b8043' }],
  ['fitness@gmail.com', { name: 'Fitness & Health', color: '#e67c73' }],
  ['family@gmail.com', { name: 'Family Events', color: '#f6bf26' }],
])

export const Default: Story = {
  args: {
    calendars: mockCalendars,
    calendarMap,
    onCalendarClick: fn(),
    onCreateCalendar: fn(),
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    calendars: [],
    calendarMap: new Map(),
    onCalendarClick: fn(),
    onCreateCalendar: fn(),
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    calendars: [],
    calendarMap: new Map(),
    onCalendarClick: fn(),
    onCreateCalendar: fn(),
    isLoading: false,
  },
}

export const SingleCalendar: Story = {
  args: {
    calendars: [mockCalendars[0]],
    calendarMap: new Map([['primary', { name: 'Personal', color: '#4285f4' }]]),
    onCalendarClick: fn(),
    onCreateCalendar: fn(),
    isLoading: false,
  },
}

export const ManyCalendars: Story = {
  args: {
    calendars: [
      ...mockCalendars,
      {
        kind: 'calendar#calendarListEntry',
        etag: '"mno345"',
        id: 'projects@work.com',
        summary: 'Project Deadlines',
        backgroundColor: '#8e24aa',
        foregroundColor: '#ffffff',
        accessRole: 'reader',
      },
      {
        kind: 'calendar#calendarListEntry',
        etag: '"pqr678"',
        id: 'holidays@google.com',
        summary: 'US Holidays',
        backgroundColor: '#039be5',
        foregroundColor: '#ffffff',
        accessRole: 'reader',
      },
      {
        kind: 'calendar#calendarListEntry',
        etag: '"stu901"',
        id: 'birthdays@google.com',
        summary: 'Birthdays',
        backgroundColor: '#7986cb',
        foregroundColor: '#ffffff',
        accessRole: 'reader',
      },
      {
        kind: 'calendar#calendarListEntry',
        etag: '"vwx234"',
        id: 'team-meetings@work.com',
        summary: 'Team Meetings',
        backgroundColor: '#33b679',
        foregroundColor: '#ffffff',
        accessRole: 'writer',
      },
    ],
    calendarMap: new Map([
      ['primary', { name: 'Personal', color: '#4285f4' }],
      ['work@company.com', { name: 'Work', color: '#0b8043' }],
      ['fitness@gmail.com', { name: 'Fitness & Health', color: '#e67c73' }],
      ['family@gmail.com', { name: 'Family Events', color: '#f6bf26' }],
      ['projects@work.com', { name: 'Project Deadlines', color: '#8e24aa' }],
      ['holidays@google.com', { name: 'US Holidays', color: '#039be5' }],
      ['birthdays@google.com', { name: 'Birthdays', color: '#7986cb' }],
      ['team-meetings@work.com', { name: 'Team Meetings', color: '#33b679' }],
    ]),
    onCalendarClick: fn(),
    onCreateCalendar: fn(),
    isLoading: false,
  },
}

export const LongCalendarNames: Story = {
  args: {
    calendars: [
      {
        kind: 'calendar#calendarListEntry',
        etag: '"xyz789"',
        id: 'long-name@example.com',
        summary: 'Very Long Calendar Name That Should Be Truncated',
        backgroundColor: '#4285f4',
        foregroundColor: '#ffffff',
        accessRole: 'owner',
      },
      {
        kind: 'calendar#calendarListEntry',
        etag: '"abc012"',
        id: 'another-long@example.com',
        summary: 'Another Extremely Long Calendar Name For Testing Purposes',
        backgroundColor: '#0b8043',
        foregroundColor: '#ffffff',
        accessRole: 'owner',
      },
    ],
    calendarMap: new Map([
      ['long-name@example.com', { name: 'Very Long Calendar Name That Should Be Truncated', color: '#4285f4' }],
      ['another-long@example.com', { name: 'Another Extremely Long Calendar Name For Testing Purposes', color: '#0b8043' }],
    ]),
    onCalendarClick: fn(),
    onCreateCalendar: fn(),
    isLoading: false,
  },
}
