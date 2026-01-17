import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { ThreeDWallCalendar } from '@/components/3d/three-dwall-calendar'
import type { CalendarEvent } from '@/components/3d/three-dwall-calendar'

const mockEvents: CalendarEvent[] = [
  { id: '1', title: 'Team Standup', date: new Date().toISOString() },
  { id: '2', title: 'Project Review', date: new Date(Date.now() + 86400000).toISOString() },
  { id: '3', title: 'Client Call', date: new Date(Date.now() + 172800000).toISOString() },
  { id: '4', title: 'Sprint Planning', date: new Date(Date.now() + 259200000).toISOString() },
  { id: '5', title: '1:1 with Manager', date: new Date(Date.now() + 345600000).toISOString() },
]

const manyEvents: CalendarEvent[] = [
  ...mockEvents,
  { id: '6', title: 'Design Review', date: new Date(Date.now() + 432000000).toISOString() },
  { id: '7', title: 'Code Review', date: new Date(Date.now() + 518400000).toISOString() },
  { id: '8', title: 'Demo Day', date: new Date(Date.now() + 604800000).toISOString() },
  { id: '9', title: 'Retrospective', date: new Date(Date.now() + 691200000).toISOString() },
  { id: '10', title: 'All Hands Meeting', date: new Date(Date.now() + 777600000).toISOString() },
]

const meta: Meta<typeof ThreeDWallCalendar> = {
  title: '3D/ThreeDWallCalendar',
  component: ThreeDWallCalendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interactive 3D wall calendar with tilt controls. Displays calendar events in a visually engaging grid layout.',
      },
    },
  },
  argTypes: {
    panelWidth: {
      control: { type: 'range', min: 100, max: 250, step: 10 },
      description: 'Width of each day panel',
    },
    panelHeight: {
      control: { type: 'range', min: 80, max: 200, step: 10 },
      description: 'Height of each day panel',
    },
    columns: {
      control: { type: 'range', min: 5, max: 10, step: 1 },
      description: 'Number of columns in the grid',
    },
    hideControls: {
      control: 'boolean',
      description: 'Hide navigation and add event controls',
    },
  },
  args: {
    onAddEvent: fn(),
    onRemoveEvent: fn(),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-zinc-950 p-8">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    events: mockEvents,
    panelWidth: 160,
    panelHeight: 120,
    columns: 7,
    hideControls: false,
  },
}

export const WithManyEvents: Story = {
  args: {
    events: manyEvents,
    panelWidth: 160,
    panelHeight: 120,
    columns: 7,
    hideControls: false,
  },
}

export const EmptyCalendar: Story = {
  args: {
    events: [],
    panelWidth: 160,
    panelHeight: 120,
    columns: 7,
    hideControls: false,
  },
}

export const CompactView: Story = {
  args: {
    events: mockEvents,
    panelWidth: 120,
    panelHeight: 90,
    columns: 7,
    hideControls: false,
  },
}

export const LargeView: Story = {
  args: {
    events: mockEvents,
    panelWidth: 200,
    panelHeight: 150,
    columns: 7,
    hideControls: false,
  },
}

export const FiveColumns: Story = {
  args: {
    events: mockEvents,
    panelWidth: 180,
    panelHeight: 130,
    columns: 5,
    hideControls: false,
  },
}

export const WithoutControls: Story = {
  args: {
    events: mockEvents,
    panelWidth: 160,
    panelHeight: 120,
    columns: 7,
    hideControls: true,
  },
}

export const DarkMode: Story = {
  args: {
    events: mockEvents,
    panelWidth: 160,
    panelHeight: 120,
    columns: 7,
    hideControls: false,
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-black p-8">
        <Story />
      </div>
    ),
  ],
}
