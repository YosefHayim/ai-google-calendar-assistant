import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import BentoGridSection from '@/components/marketing/BentoGridSection'

const meta: Meta<typeof BentoGridSection> = {
  title: 'Marketing/BentoGridSection',
  component: BentoGridSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' },
    docs: {
      description: {
        component:
          'A bento grid layout showcasing Ask Ally key features with 3D visualizations. Includes interactive 3D wall calendar, rotating earth globe, and feature cards for deep work protection, flexible scheduling, global availability, quick actions, and security.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default bento grid with 5 feature cards arranged in an asymmetric grid layout. Hover over cards to see interactive effects.',
      },
    },
  },
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Bento grid in dark mode with adapted backgrounds and 3D visualization styling.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
}

export const InPageContext: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Bento grid shown in context between other marketing sections.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-white dark:bg-[#030303]">
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 block">Why Ask Ally</span>
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              The Smartest Way to Manage Your Time
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Stop wrestling with your calendar. Let AI handle the complexity while you focus on what matters.
            </p>
          </div>
        </section>
        <Story />
        <section className="py-20 px-4 bg-zinc-50 dark:bg-zinc-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">Trusted by Teams Everywhere</h2>
            <div className="flex items-center justify-center gap-12 opacity-50">
              {['Startup Co', 'Tech Corp', 'Agency Inc', 'Enterprise Ltd'].map((name) => (
                <span key={name} className="text-lg font-bold text-zinc-400">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    ),
  ],
}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile view with stacked single-column layout for all feature cards.',
      },
    },
  },
}

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Tablet view with responsive grid adjustments.',
      },
    },
  },
}

export const FocusOnDeepWork: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Highlighting the Deep Work Protection feature - Ally guards your focus time and blocks interruptions automatically.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-8 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <path d="M8.5 8.5v.01" />
                <path d="M16 15.5v.01" />
                <path d="M12 12v.01" />
                <path d="M11 17v.01" />
                <path d="M7 14v.01" />
              </svg>
              Deep Focus Mode
            </span>
          </div>
          <Story />
        </div>
      </div>
    ),
  ],
}

export const FocusOn3DCalendar: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Showcasing the interactive 3D wall calendar visualization that provides a unique view of your schedule.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-8 bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-950/20 dark:to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              3D Calendar View
            </span>
          </div>
          <Story />
        </div>
      </div>
    ),
  ],
}
