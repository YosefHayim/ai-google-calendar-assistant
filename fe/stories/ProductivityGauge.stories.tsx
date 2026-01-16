import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import ProductivityGauge from '@/components/ProductivityGauge'

const meta: Meta<typeof ProductivityGauge> = {
  title: 'Charts/ProductivityGauge',
  component: ProductivityGauge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An animated circular progress gauge showing productivity score from 0-100. Features smooth SVG animation, center score display, and descriptive label.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-background w-[280px] h-[280px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    score: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Productivity score from 0 to 100',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    score: 75,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default productivity gauge showing a good score of 75.',
      },
    },
  },
}

export const Perfect: Story = {
  args: {
    score: 100,
  },
  parameters: {
    docs: {
      description: {
        story: 'Maximum productivity score - full circle completion.',
      },
    },
  },
}

export const Excellent: Story = {
  args: {
    score: 92,
  },
  parameters: {
    docs: {
      description: {
        story: 'Excellent productivity score indicating a highly productive day.',
      },
    },
  },
}

export const Good: Story = {
  args: {
    score: 75,
  },
  parameters: {
    docs: {
      description: {
        story: 'Good productivity score - typical for a balanced workday.',
      },
    },
  },
}

export const Average: Story = {
  args: {
    score: 50,
  },
  parameters: {
    docs: {
      description: {
        story: 'Average productivity score - room for improvement.',
      },
    },
  },
}

export const Low: Story = {
  args: {
    score: 25,
  },
  parameters: {
    docs: {
      description: {
        story: 'Low productivity score - might indicate too many interruptions or meetings.',
      },
    },
  },
}

export const Minimal: Story = {
  args: {
    score: 5,
  },
  parameters: {
    docs: {
      description: {
        story: 'Very low score - almost empty gauge for vacation or sick days.',
      },
    },
  },
}

export const Zero: Story = {
  args: {
    score: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Zero score - empty gauge state.',
      },
    },
  },
}

export const ScoreComparison: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 justify-center">
      <div className="text-center">
        <div className="w-40 h-40">
          <ProductivityGauge score={25} />
        </div>
        <p className="mt-2 text-sm font-medium text-red-500">Needs Improvement</p>
      </div>
      <div className="text-center">
        <div className="w-40 h-40">
          <ProductivityGauge score={50} />
        </div>
        <p className="mt-2 text-sm font-medium text-amber-500">Average</p>
      </div>
      <div className="text-center">
        <div className="w-40 h-40">
          <ProductivityGauge score={75} />
        </div>
        <p className="mt-2 text-sm font-medium text-green-500">Good</p>
      </div>
      <div className="text-center">
        <div className="w-40 h-40">
          <ProductivityGauge score={95} />
        </div>
        <p className="mt-2 text-sm font-medium text-primary">Excellent</p>
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="p-8 bg-background min-w-[600px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Comparison of different productivity score levels.',
      },
    },
  },
}

export const InDashboardContext: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
      <div className="p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Today&apos;s Score</h3>
        <ProductivityGauge score={82} />
      </div>
      <div className="p-6 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Weekly Average</h3>
        <ProductivityGauge score={71} />
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="p-8 bg-zinc-50 dark:bg-zinc-950">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Productivity gauges in a dashboard card context.',
      },
    },
  },
}

export const DarkMode: Story = {
  args: {
    score: 85,
  },
  decorators: [
    (Story) => (
      <div className="dark p-8 bg-zinc-950 w-[280px] h-[280px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Gauge appearance in dark mode.',
      },
    },
  },
}

export const MobileView: Story = {
  args: {
    score: 68,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Responsive gauge on mobile devices.',
      },
    },
  },
}

export const AnimationDemo: Story = {
  args: {
    score: 88,
  },
  parameters: {
    docs: {
      description: {
        story: 'Watch the smooth 1.5-second animation as the gauge fills on load. The animation uses Framer Motion with easeOut easing.',
      },
    },
  },
}
