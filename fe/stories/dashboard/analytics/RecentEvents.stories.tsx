import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import RecentEvents from '@/components/dashboard/analytics/RecentEvents'
import type { ProcessedActivity } from '@/types/analytics'
import { fn } from 'storybook/test'
import { Calendar, Users, Video, Coffee, Briefcase, Phone, Dumbbell, Book } from 'lucide-react'

const meta: Meta<typeof RecentEvents> = {
  title: 'Dashboard/Analytics/RecentEvents',
  component: RecentEvents,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const mockActivities: ProcessedActivity[] = [
  {
    action: 'Team Standup Meeting',
    time: '9:00 AM',
    icon: Users,
    timestamp: Date.now() - 3600000,
    calendarName: 'Work',
    calendarId: 'work',
    calendarColor: '#4285f4',
    event: {} as ProcessedActivity['event'],
  },
  {
    action: 'Client Presentation - Q4 Review',
    time: '10:30 AM',
    icon: Video,
    timestamp: Date.now() - 7200000,
    calendarName: 'Work',
    calendarId: 'work',
    calendarColor: '#4285f4',
    event: {} as ProcessedActivity['event'],
  },
  {
    action: 'Lunch with Sarah',
    time: '12:00 PM',
    icon: Coffee,
    timestamp: Date.now() - 10800000,
    calendarName: 'Personal',
    calendarId: 'personal',
    calendarColor: '#0b8043',
    event: {} as ProcessedActivity['event'],
  },
  {
    action: 'Project Planning Session',
    time: '2:00 PM',
    icon: Briefcase,
    timestamp: Date.now() - 14400000,
    calendarName: 'Work',
    calendarId: 'work',
    calendarColor: '#4285f4',
    event: {} as ProcessedActivity['event'],
  },
  {
    action: 'Call with Accountant',
    time: '3:30 PM',
    icon: Phone,
    timestamp: Date.now() - 18000000,
    calendarName: 'Personal',
    calendarId: 'personal',
    calendarColor: '#0b8043',
    event: {} as ProcessedActivity['event'],
  },
  {
    action: 'Gym - Leg Day',
    time: '5:30 PM',
    icon: Dumbbell,
    timestamp: Date.now() - 21600000,
    calendarName: 'Fitness',
    calendarId: 'fitness',
    calendarColor: '#e67c73',
    event: {} as ProcessedActivity['event'],
  },
  {
    action: 'Book Club Meeting',
    time: '7:00 PM',
    icon: Book,
    timestamp: Date.now() - 25200000,
    calendarName: 'Personal',
    calendarId: 'personal',
    calendarColor: '#0b8043',
    event: {} as ProcessedActivity['event'],
  },
  {
    action: 'Weekly Review & Planning',
    time: '8:30 PM',
    icon: Calendar,
    timestamp: Date.now() - 28800000,
    calendarName: 'Work',
    calendarId: 'work',
    calendarColor: '#4285f4',
    event: {} as ProcessedActivity['event'],
  },
]

export const DefaultVertical: Story = {
  args: {
    activities: mockActivities,
    onActivityClick: fn(),
    isLoading: false,
    layout: 'vertical',
  },
}

export const HorizontalLayout: Story = {
  args: {
    activities: mockActivities,
    onActivityClick: fn(),
    isLoading: false,
    layout: 'horizontal',
  },
}

export const Loading: Story = {
  args: {
    activities: [],
    onActivityClick: fn(),
    isLoading: true,
    layout: 'vertical',
  },
}

export const LoadingHorizontal: Story = {
  args: {
    activities: [],
    onActivityClick: fn(),
    isLoading: true,
    layout: 'horizontal',
  },
}

export const Empty: Story = {
  args: {
    activities: [],
    onActivityClick: fn(),
    isLoading: false,
    layout: 'vertical',
  },
}

export const FewActivities: Story = {
  args: {
    activities: mockActivities.slice(0, 3),
    onActivityClick: fn(),
    isLoading: false,
    layout: 'vertical',
  },
}

export const ManyActivities: Story = {
  args: {
    activities: [
      ...mockActivities,
      ...mockActivities.map((a, i) => ({
        ...a,
        action: `${a.action} (Repeated ${i + 1})`,
        timestamp: a.timestamp - 86400000 * (i + 1),
      })),
    ],
    onActivityClick: fn(),
    isLoading: false,
    layout: 'vertical',
  },
}

export const LongEventNames: Story = {
  args: {
    activities: [
      {
        action: 'Very Long Meeting Title That Should Be Truncated When It Gets Too Long For The Container',
        time: '9:00 AM',
        icon: Users,
        timestamp: Date.now(),
        calendarName: 'Work Calendar With A Very Long Name',
        calendarId: 'work',
        calendarColor: '#4285f4',
        event: {} as ProcessedActivity['event'],
      },
      {
        action: 'Another Extremely Long Event Name That Tests The Text Truncation Behavior In Both Layouts',
        time: '2:00 PM',
        icon: Briefcase,
        timestamp: Date.now() - 7200000,
        calendarName: 'Projects',
        calendarId: 'projects',
        calendarColor: '#8e24aa',
        event: {} as ProcessedActivity['event'],
      },
    ],
    onActivityClick: fn(),
    isLoading: false,
    layout: 'vertical',
  },
}

export const SingleCalendar: Story = {
  args: {
    activities: mockActivities.filter((a) => a.calendarId === 'work').map((a) => ({ ...a, calendarName: 'Work' })),
    onActivityClick: fn(),
    isLoading: false,
    layout: 'vertical',
  },
}

export const HorizontalFiveCards: Story = {
  args: {
    activities: mockActivities.slice(0, 5),
    onActivityClick: fn(),
    isLoading: false,
    layout: 'horizontal',
  },
}
