import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import FeatureShowcase from '@/components/marketing/FeatureShowcase'

const meta: Meta<typeof FeatureShowcase> = {
  title: 'Marketing/FeatureShowcase',
  component: FeatureShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' },
    docs: {
      description: {
        component:
          'An interactive 3D carousel showcasing Ask Ally features across multiple platforms (Telegram, Slack, WhatsApp). Features realistic chat interfaces with typing indicators, voice messages, and platform-specific styling. Auto-rotates every 6 seconds with pause on hover.',
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
          'Default feature showcase with Telegram selected. Use the platform toggle to switch between Telegram, Slack, and WhatsApp views. Navigation arrows allow manual carousel control.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-16 px-4 bg-white dark:bg-[#030303]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Your Calendar, Everywhere</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Manage your schedule from your favorite messaging platform. Natural conversations, powerful results.
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
        story: 'Feature showcase in dark mode with adapted styling and contrast.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark py-16 px-4 bg-[#030303]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-zinc-100 mb-4">Your Calendar, Everywhere</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Manage your schedule from your favorite messaging platform.
            </p>
          </div>
          <Story />
        </div>
      </div>
    ),
  ],
}

export const TelegramView: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Showcasing the Telegram interface with authentic chat bubbles, blue read receipts, typing indicators, and voice message waveforms.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-16 px-4 bg-gradient-to-b from-[#0088cc]/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0088cc]/10 text-[#0088cc] rounded-full text-sm font-medium mb-4">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              Telegram Integration
            </span>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Chat with Ally on Telegram</h3>
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
        story: 'Mobile-optimized view with adjusted carousel sizing and touch-friendly navigation.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="py-8 px-2 bg-white dark:bg-[#030303]">
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
        story: 'Tablet view with medium-sized carousel and optimized spacing.',
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
