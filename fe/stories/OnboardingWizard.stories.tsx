import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { fn } from 'storybook/test'

const meta: Meta<typeof OnboardingWizard> = {
  title: 'Onboarding/OnboardingWizard',
  component: OnboardingWizard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A multi-step onboarding wizard that introduces new users to Ally features. Includes audio narration support, step-by-step animations, and element highlighting.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-secondary dark:bg-secondary flex items-center justify-center">
        <div className="w-full max-w-4xl p-8">
          <div className="bg-background dark:bg-secondary rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg" data-onboarding="chat-input" />
              <div className="w-10 h-10 bg-primary/10 rounded-lg" data-onboarding="analytics" />
              <div className="w-10 h-10 bg-primary/10 rounded-lg" data-onboarding="gaps" />
            </div>
            <p className="text-muted-foreground text-sm">Dashboard mockup with target elements</p>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls wizard visibility',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when wizard is dismissed',
    },
    onComplete: {
      action: 'completed',
      description: 'Callback when user completes all steps',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'The onboarding wizard showing the first step (Welcome).',
      },
    },
  },
}

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: fn(),
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Wizard in closed state - not visible.',
      },
    },
  },
}

export const Steps: Story = {
  render: () => (
    <div className="min-h-screen bg-secondary dark:bg-secondary p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground dark:text-primary-foreground mb-4">
            Onboarding Steps Overview
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground">
            5-step wizard introducing Ally&apos;s core features
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-background dark:bg-secondary rounded-xl border ">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Welcome to Ally</h3>
                <p className="text-sm text-muted-foreground">Introduction to the AI calendar assistant</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-background dark:bg-secondary rounded-xl border ">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Chat with Ally</h3>
                <p className="text-sm text-muted-foreground">Natural language scheduling interface</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-background dark:bg-secondary rounded-xl border ">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Track Your Time</h3>
                <p className="text-sm text-muted-foreground">Analytics and insights dashboard</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-background dark:bg-secondary rounded-xl border ">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Recover Lost Time</h3>
                <p className="text-sm text-muted-foreground">Gap detection and recovery feature</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-background dark:bg-secondary rounded-xl border ">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl text-green-600">5</span>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">You&apos;re All Set!</h3>
                <p className="text-sm text-muted-foreground">Completion and getting started</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-primary/5 dark:bg-blue-900/20 rounded-xl border-primary/20 -blue-800">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Audio Features</h3>
          <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <li>Optional audio narration for each step</li>
            <li>Text-to-speech using OpenAI voice</li>
            <li>Progress bar during audio playback</li>
            <li>Can disable/enable at any time</li>
          </ul>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Visual breakdown of all onboarding wizard steps.',
      },
    },
  },
}

export const WithAudioEnabled: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Wizard with audio narration enabled. Users can toggle the speaker icon to enable TTS narration for each step.',
      },
    },
  },
}

export const DarkMode: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onComplete: fn(),
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-secondary flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Onboarding wizard appearance in dark mode.',
      },
    },
  },
}

export const MobileView: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onComplete: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Responsive wizard layout on mobile devices.',
      },
    },
  },
}
