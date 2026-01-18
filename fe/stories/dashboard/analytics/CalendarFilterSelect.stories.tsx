import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CalendarFilterSelect } from '@/components/dashboard/analytics/CalendarFilterSelect'
import { useState } from 'react'
import type { CalendarListEntry } from '@/types/api'

const meta: Meta<typeof CalendarFilterSelect> = {
  title: 'Dashboard/Analytics/CalendarFilterSelect',
  component: CalendarFilterSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
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
  {
    kind: 'calendar#calendarListEntry',
    etag: '"mno345"',
    id: 'projects@work.com',
    summary: 'Project Deadlines',
    backgroundColor: '#8e24aa',
    foregroundColor: '#ffffff',
    accessRole: 'reader',
  },
]

const CalendarFilterSelectWithState = ({
  calendars,
  initialSelection = [],
  isLoading = false,
}: {
  calendars: CalendarListEntry[]
  initialSelection?: string[]
  isLoading?: boolean
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelection)

  return (
    <div className="space-y-4">
      <CalendarFilterSelect
        calendars={calendars}
        selectedCalendarIds={selectedIds}
        onSelectionChange={setSelectedIds}
        isLoading={isLoading}
      />
      <div className="text-sm text-muted-foreground">
        Selected: {selectedIds.length === 0 ? 'All Calendars' : selectedIds.join(', ')}
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => <CalendarFilterSelectWithState calendars={mockCalendars} />,
}

export const AllSelected: Story = {
  render: () => <CalendarFilterSelectWithState calendars={mockCalendars} initialSelection={[]} />,
}

export const SingleSelected: Story = {
  render: () => <CalendarFilterSelectWithState calendars={mockCalendars} initialSelection={['primary']} />,
}

export const MultipleSelected: Story = {
  render: () => (
    <CalendarFilterSelectWithState calendars={mockCalendars} initialSelection={['primary', 'work@company.com']} />
  ),
}

export const Loading: Story = {
  render: () => <CalendarFilterSelectWithState calendars={[]} isLoading={true} />,
}

export const NoCalendars: Story = {
  render: () => <CalendarFilterSelectWithState calendars={[]} />,
}

export const ManyCalendars: Story = {
  render: () => {
    const manyCalendars: CalendarListEntry[] = [
      ...mockCalendars,
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
      {
        kind: 'calendar#calendarListEntry',
        etag: '"yz0567"',
        id: 'one-on-ones@work.com',
        summary: '1:1 Meetings',
        backgroundColor: '#f4511e',
        foregroundColor: '#ffffff',
        accessRole: 'owner',
      },
    ]
    return <CalendarFilterSelectWithState calendars={manyCalendars} />
  },
}
