import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import UseCaseGrid from '@/components/marketing/UseCaseGrid'

const meta: Meta<typeof UseCaseGrid> = {
  title: 'Marketing/UseCaseGrid',
  component: UseCaseGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' },
    docs: {
      description: {
        component:
          'A 2x2 grid showcasing Ask Ally use cases with interactive chat illustrations. Features intelligent scheduling, focus protection, travel agent capabilities, and voice-to-action commands. Each card includes a simulated conversation demonstrating the feature.',
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
        story: 'Default use case grid showing all four primary use cases with their respective chat illustrations.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-20 px-4 bg-white dark:bg-[#030303]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 block">Use Cases</span>
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">How Professionals Use Ally</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Real scenarios where Ask Ally saves time and reduces calendar friction.
            </p>
          </div>
          <Story />
        </div>
      </div>
    ),
  ],
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Use case grid in dark mode with adapted card backgrounds and chat bubble styling.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark py-20 px-4 bg-[#030303]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 block">Use Cases</span>
            <h2 className="text-4xl font-bold text-zinc-100 mb-4">How Professionals Use Ally</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Real scenarios where Ask Ally saves time and reduces calendar friction.
            </p>
          </div>
          <Story />
        </div>
      </div>
    ),
  ],
}

export const IntelligentSchedulingFocus: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Highlighting intelligent scheduling - Ally finds optimal meeting times across multiple calendars and timezones.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-16 px-4 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-[#030303]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
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
              Smart Scheduling
            </span>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Find the perfect time, every time</h3>
          </div>
          <Story />
        </div>
      </div>
    ),
  ],
}

export const VoiceCommandFocus: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Showcasing voice-to-action capabilities - Record quick voice commands and Ally handles the rest.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-16 px-4 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-[#030303]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-medium mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
              Voice Commands
            </span>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Speak naturally, get things done</h3>
          </div>
          <Story />
        </div>
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
        story: 'Mobile view with single-column stacked layout for use case cards.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-12 px-4 bg-white dark:bg-[#030303]">
        <Story />
      </div>
    ),
  ],
}

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Tablet view maintaining 2-column grid layout.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-16 px-4 bg-white dark:bg-[#030303]">
        <Story />
      </div>
    ),
  ],
}

export const WithCTA: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Use case grid with call-to-action section encouraging users to try the features.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-16 px-4 bg-white dark:bg-[#030303]">
        <div className="max-w-5xl mx-auto">
          <Story />
          <div className="mt-16 text-center">
            <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Ready to Transform Your Calendar?
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-lg mx-auto">
                Join thousands of professionals who have already simplified their scheduling with Ask Ally.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button className="px-8 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
                  Get Started Free
                </button>
                <button className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                  See Pricing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  ],
}
