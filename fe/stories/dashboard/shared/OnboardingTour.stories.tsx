import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { OnboardingTour } from '@/components/dashboard/shared/OnboardingTour'
import { fn } from 'storybook/test'

const meta: Meta<typeof OnboardingTour> = {
  title: 'Dashboard/Shared/OnboardingTour',
  component: OnboardingTour,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An interactive onboarding tour that guides new users through the key features of the Ally dashboard. Features spotlight highlighting, step indicators, and keyboard navigation.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 relative">
        {/* Mock dashboard layout with tour target elements */}
        <div className="flex">
          {/* Mock Sidebar */}
          <aside className="w-64 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg" />
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Ally</span>
            </div>
            <div id="tour-assistant" className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Assistant
            </div>
            <div id="tour-analytics" className="px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
              Analytics
            </div>
            <div id="tour-integrations" className="px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
              Integrations
            </div>
            <div className="flex-1" />
            <div id="tour-settings" className="px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
              Settings
            </div>
          </aside>
          {/* Mock Main Content */}
          <main className="flex-1 p-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Welcome to Ally</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Your AI-powered calendar assistant</p>
          </main>
        </div>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onComplete: {
      action: 'completed',
      description: 'Callback when the tour is completed or skipped',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const WelcomeStep: Story = {
  args: {
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'The welcome step that introduces the user to Ally. This is a centered modal without a spotlight highlight.',
      },
    },
  },
}

export const AssistantStep: Story = {
  args: {
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Highlights the Assistant navigation item and explains the main chat interface.',
      },
    },
  },
  play: async () => {
    // Simulate clicking next to reach the assistant step
    const nextButton = document.querySelector('button:has(.lucide-chevron-right)') as HTMLButtonElement
    if (nextButton) nextButton.click()
  },
}

export const AnalyticsStep: Story = {
  args: {
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the onboarding tour starting from the Welcome step. Click Next to navigate to the Analytics step.',
      },
    },
  },
}

export const MobileView: Story = {
  args: {
    onComplete: fn(),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 relative">
        <main className="p-4">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Ally Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Mobile onboarding view</p>
        </main>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'On mobile, the tour disables spotlight highlighting and shows a centered modal for all steps.',
      },
    },
  },
}

export const DarkMode: Story = {
  args: {
    onComplete: fn(),
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-zinc-950 relative">
        <div className="flex">
          <aside className="w-64 h-screen bg-zinc-900 border-r border-zinc-800 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg" />
              <span className="font-bold text-lg text-zinc-100">Ally</span>
            </div>
            <div id="tour-assistant" className="px-3 py-2 rounded-lg bg-zinc-800 text-sm font-medium text-zinc-100">
              Assistant
            </div>
            <div id="tour-analytics" className="px-3 py-2 rounded-lg text-sm text-zinc-400">
              Analytics
            </div>
            <div id="tour-integrations" className="px-3 py-2 rounded-lg text-sm text-zinc-400">
              Integrations
            </div>
            <div className="flex-1" />
            <div id="tour-settings" className="px-3 py-2 rounded-lg text-sm text-zinc-400">
              Settings
            </div>
          </aside>
          <main className="flex-1 p-8">
            <h1 className="text-2xl font-bold text-zinc-100 mb-4">Welcome to Ally</h1>
            <p className="text-zinc-400">Your AI-powered calendar assistant</p>
          </main>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'The onboarding tour in dark mode with proper contrast and styling.',
      },
    },
  },
}

export const LastStep: Story = {
  args: {
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the onboarding tour starting from the Welcome step. Navigate through all steps to reach the final Settings step where the button changes to "Start Audit".',
      },
    },
  },
}
