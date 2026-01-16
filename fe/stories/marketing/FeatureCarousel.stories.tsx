import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import FeatureCarousel from '@/components/marketing/FeatureCarousel'

const meta: Meta<typeof FeatureCarousel> = {
  title: 'Marketing/FeatureCarousel',
  component: FeatureCarousel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' },
    docs: {
      description: {
        component:
          'A feature carousel with iPhone mockup showcasing Ask Ally capabilities. Features include intelligent scheduling, WhatsApp relay, executive digests, proactive logistics, focus protection, conflict arbitration, voice-to-action, and leverage analytics. Auto-rotates every 5 seconds.',
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
          'Default carousel view starting with Intelligent Scheduling feature. Use arrows or dot indicators to navigate between features.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-20 px-4 bg-white dark:bg-[#030303]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 block">
              Features
            </span>
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Built for Busy Professionals
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Ask Ally anticipates your needs and handles the complexity of modern scheduling.
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
        story: 'Feature carousel in dark mode with adapted card backgrounds and iPhone mockup.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark py-20 px-4 bg-[#030303]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 block">
              Features
            </span>
            <h2 className="text-4xl font-bold text-zinc-100 mb-4">Built for Busy Professionals</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Ask Ally anticipates your needs and handles the complexity of modern scheduling.
            </p>
          </div>
          <Story />
        </div>
      </div>
    ),
  ],
}

export const IntelligentSchedulingFeature: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Highlighting the intelligent scheduling feature - Ally orchestrates complex meetings across teams and timezones with zero friction.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-16 px-4 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-[#030303]">
        <div className="max-w-6xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
}

export const VoiceFeature: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Voice-to-Action feature showcase - Record commands on the go, Ally executes complex tasks from simple audio.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-16 px-4 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-[#030303]">
        <div className="max-w-6xl mx-auto">
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
        story:
          'Mobile-optimized carousel with stacked layout - feature info above, iPhone mockup below.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-8 px-4 bg-white dark:bg-[#030303]">
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
        story: 'Tablet view with side-by-side layout for feature info and iPhone mockup.',
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

export const WithCTA: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Feature carousel with call-to-action section below.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-16 px-4 bg-white dark:bg-[#030303]">
        <div className="max-w-6xl mx-auto">
          <Story />
          <div className="mt-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Ready to experience intelligent calendar management?
            </p>
            <div className="flex items-center justify-center gap-4">
              <button className="px-8 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
                Start Free Trial
              </button>
              <button className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
  ],
}
