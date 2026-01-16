import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import TimeAllocationChart from '@/components/dashboard/analytics/TimeAllocationChart'
import TimeAllocationDashboard from '@/components/dashboard/analytics/TimeAllocationDashboard'
import type { CalendarBreakdownItem } from '@/types/analytics'
import { fn } from 'storybook/test'

const meta: Meta<typeof TimeAllocationChart> = {
  title: 'Dashboard/Analytics/TimeAllocationChart',
  component: TimeAllocationChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const mockData: CalendarBreakdownItem[] = [
  { category: 'Work Meetings', hours: 32.5, color: '#4285f4', calendarId: 'work-meetings' },
  { category: 'Personal', hours: 18.2, color: '#0b8043', calendarId: 'personal' },
  { category: 'Fitness', hours: 8.5, color: '#e67c73', calendarId: 'fitness' },
  { category: 'Family', hours: 6.0, color: '#f6bf26', calendarId: 'family' },
  { category: 'Side Projects', hours: 12.8, color: '#8e24aa', calendarId: 'projects' },
]

const singleCalendar: CalendarBreakdownItem[] = [
  { category: 'All Events', hours: 45.5, color: '#4285f4', calendarId: 'all' },
]

const manyCalendars: CalendarBreakdownItem[] = [
  { category: 'Work Meetings', hours: 28.5, color: '#4285f4', calendarId: 'work-meetings' },
  { category: 'One-on-Ones', hours: 12.0, color: '#039be5', calendarId: 'one-on-ones' },
  { category: 'Team Syncs', hours: 8.5, color: '#7986cb', calendarId: 'team-syncs' },
  { category: 'Personal', hours: 15.2, color: '#0b8043', calendarId: 'personal' },
  { category: 'Fitness', hours: 6.5, color: '#e67c73', calendarId: 'fitness' },
  { category: 'Family', hours: 4.0, color: '#f6bf26', calendarId: 'family' },
  { category: 'Doctor Appointments', hours: 2.5, color: '#f4511e', calendarId: 'health' },
  { category: 'Side Projects', hours: 9.8, color: '#8e24aa', calendarId: 'projects' },
]

export const Default: Story = {
  args: {
    data: mockData,
    onCalendarClick: action('calendar-clicked'),
  },
}

export const SingleCalendar: Story = {
  args: {
    data: singleCalendar,
    onCalendarClick: action('calendar-clicked'),
  },
}

export const ManyCalendars: Story = {
  args: {
    data: manyCalendars,
    onCalendarClick: action('calendar-clicked'),
  },
}

export const WithoutClickHandler: Story = {
  args: {
    data: mockData,
  },
}

export const EmptyData: Story = {
  args: {
    data: [],
    onCalendarClick: action('calendar-clicked'),
  },
}

export const HighHours: Story = {
  args: {
    data: [
      { category: 'Work', hours: 85.5, color: '#4285f4', calendarId: 'work' },
      { category: 'Personal', hours: 32.2, color: '#0b8043', calendarId: 'personal' },
      { category: 'Exercise', hours: 15.0, color: '#e67c73', calendarId: 'exercise' },
    ],
    onCalendarClick: action('calendar-clicked'),
  },
}

export const LowHours: Story = {
  args: {
    data: [
      { category: 'Work', hours: 2.5, color: '#4285f4', calendarId: 'work' },
      { category: 'Personal', hours: 1.2, color: '#0b8043', calendarId: 'personal' },
    ],
    onCalendarClick: action('calendar-clicked'),
  },
}

export const DashboardDefault: StoryObj<typeof TimeAllocationDashboard> = {
  render: () => (
    <TimeAllocationDashboard
      data={mockData}
      onCalendarClick={action('calendar-clicked')}
      isLoading={false}
    />
  ),
}

export const DashboardLoading: StoryObj<typeof TimeAllocationDashboard> = {
  render: () => (
    <TimeAllocationDashboard
      data={[]}
      onCalendarClick={action('calendar-clicked')}
      isLoading={true}
    />
  ),
}

export const DashboardManyCalendars: StoryObj<typeof TimeAllocationDashboard> = {
  render: () => (
    <TimeAllocationDashboard
      data={manyCalendars}
      onCalendarClick={action('calendar-clicked')}
      isLoading={false}
    />
  ),
}

export const DashboardEmpty: StoryObj<typeof TimeAllocationDashboard> = {
  render: () => (
    <TimeAllocationDashboard
      data={[]}
      onCalendarClick={action('calendar-clicked')}
      isLoading={false}
    />
  ),
}
