import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import TaskBreakdownChart from '@/components/TaskBreakdownChart'

const meta: Meta<typeof TaskBreakdownChart> = {
  title: 'Charts/TaskBreakdownChart',
  component: TaskBreakdownChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An animated donut chart showing task distribution across categories. Features smooth SVG animations, center total, and color-coded legend.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-background min-w-[400px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    data: {
      description: 'Array of category data with name, value, and color',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const defaultData = [
  { name: 'Meetings', value: 45, color: '#4F46E5' },
  { name: 'Deep Work', value: 30, color: '#10B981' },
  { name: 'Admin', value: 15, color: '#F59E0B' },
  { name: 'Breaks', value: 10, color: '#EF4444' },
]

export const Default: Story = {
  args: {
    data: defaultData,
  },
  parameters: {
    docs: {
      description: {
        story: 'Task breakdown with typical workday categories.',
      },
    },
  },
}

export const MeetingsHeavy: Story = {
  args: {
    data: [
      { name: 'Meetings', value: 65, color: '#4F46E5' },
      { name: 'Deep Work', value: 15, color: '#10B981' },
      { name: 'Admin', value: 12, color: '#F59E0B' },
      { name: 'Breaks', value: 8, color: '#EF4444' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Meeting-heavy schedule visualization - common for managers.',
      },
    },
  },
}

export const FocusedSchedule: Story = {
  args: {
    data: [
      { name: 'Deep Work', value: 50, color: '#10B981' },
      { name: 'Meetings', value: 20, color: '#4F46E5' },
      { name: 'Planning', value: 20, color: '#8B5CF6' },
      { name: 'Breaks', value: 10, color: '#EF4444' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus-optimized schedule with emphasis on deep work.',
      },
    },
  },
}

export const ProjectPhases: Story = {
  args: {
    data: [
      { name: 'Development', value: 40, color: '#3B82F6' },
      { name: 'Design', value: 25, color: '#EC4899' },
      { name: 'Testing', value: 20, color: '#14B8A6' },
      { name: 'Planning', value: 10, color: '#8B5CF6' },
      { name: 'Deployment', value: 5, color: '#F97316' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Project phase distribution for development teams.',
      },
    },
  },
}

export const TwoCategories: Story = {
  args: {
    data: [
      { name: 'Billable', value: 75, color: '#10B981' },
      { name: 'Non-Billable', value: 25, color: '#6B7280' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple two-category breakdown for billable hours tracking.',
      },
    },
  },
}

export const ManyCategories: Story = {
  args: {
    data: [
      { name: 'Meetings', value: 20, color: '#4F46E5' },
      { name: 'Coding', value: 25, color: '#10B981' },
      { name: 'Code Review', value: 10, color: '#06B6D4' },
      { name: 'Documentation', value: 8, color: '#8B5CF6' },
      { name: 'Planning', value: 12, color: '#F59E0B' },
      { name: 'Admin', value: 10, color: '#6B7280' },
      { name: 'Learning', value: 8, color: '#EC4899' },
      { name: 'Breaks', value: 7, color: '#EF4444' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Detailed breakdown with many categories - tests legend readability.',
      },
    },
  },
}

export const SmallNumbers: Story = {
  args: {
    data: [
      { name: 'Task A', value: 3, color: '#4F46E5' },
      { name: 'Task B', value: 2, color: '#10B981' },
      { name: 'Task C', value: 1, color: '#F59E0B' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Chart with small values - tests animation smoothness.',
      },
    },
  },
}

export const LargeNumbers: Story = {
  args: {
    data: [
      { name: 'Completed', value: 847, color: '#10B981' },
      { name: 'In Progress', value: 234, color: '#F59E0B' },
      { name: 'Pending', value: 156, color: '#6B7280' },
      { name: 'Blocked', value: 42, color: '#EF4444' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Large task counts - demonstrates total formatting in center.',
      },
    },
  },
}

export const DarkMode: Story = {
  args: {
    data: defaultData,
  },
  decorators: [
    (Story) => (
      <div className="dark p-8 bg-zinc-950 min-w-[400px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Chart appearance in dark mode.',
      },
    },
  },
}

export const MobileView: Story = {
  args: {
    data: defaultData,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Responsive layout on mobile - chart and legend stack vertically.',
      },
    },
  },
}
