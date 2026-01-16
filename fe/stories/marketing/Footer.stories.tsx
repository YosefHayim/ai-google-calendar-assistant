import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Footer from '@/components/marketing/Footer'

const meta: Meta<typeof Footer> = {
  title: 'Marketing/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' },
    docs: {
      description: {
        component:
          'The marketing footer for Ask Ally. Includes company branding, navigation links organized by category, social media icons, and a live system status indicator.',
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
        story: 'Default footer appearance in light mode with all navigation sections and social links.',
      },
    },
  },
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Footer appearance in dark mode with proper contrast and styling.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-[#030303]">
        <Story />
      </div>
    ),
  ],
}

export const WithPageContext: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Footer shown in context at the bottom of page content.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#030303]">
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Ask Ally - AI Calendar Assistant
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Transform your calendar management with natural language. Schedule meetings, block focus time,
              and get intelligent insights - all through simple conversation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Voice Commands', 'Multi-Platform', 'Smart Analytics'].map((feature) => (
                <div
                  key={feature}
                  className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
                >
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{feature}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                    Experience the future of calendar management.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Story />
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
        story: 'Footer layout on mobile devices with stacked sections.',
      },
    },
  },
}
