import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import WaitingList from '@/components/waiting-list/WaitingList'

const meta: Meta<typeof WaitingList> = {
  title: 'Marketing/WaitingList',
  component: WaitingList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An elegant waiting list signup page with sparkle effects, platform icons, trust indicators, and email capture. Designed to build anticipation for early access.',
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
        story: 'The full waiting list page with all visual effects and signup form.',
      },
    },
  },
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Waiting list page in dark mode, showcasing the sparkle particle effects against a dark background.',
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

export const LightMode: Story = {
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'Waiting list page in light mode with subtle particle effects.',
      },
    },
  },
}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile-responsive layout with stacked input fields and platform icons.',
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
        story: 'Tablet view showing balanced layout between mobile and desktop.',
      },
    },
  },
}

export const Features: Story = {
  render: () => (
    <div className="min-h-screen bg-muted dark:bg-secondary p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground dark:text-primary-foreground mb-4">
            Waiting List Features
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground">
            Key elements of the waiting list page design
          </p>
        </div>

        <div className="grid gap-6">
          <div className="p-6 bg-background dark:bg-secondary rounded-xl border ">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Visual Effects</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-muted-foreground">
              <li>Animated sparkle particles in background</li>
              <li>Radial gradient mask for depth</li>
              <li>Ambient glow behind content</li>
              <li>Motion animations on scroll</li>
            </ul>
          </div>

          <div className="p-6 bg-background dark:bg-secondary rounded-xl border ">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Platform Icons</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-muted-foreground">
              <li>Voice - Microphone icon</li>
              <li>Web Chat - Message square icon</li>
              <li>Telegram - Paper plane icon</li>
              <li>WhatsApp - Phone icon</li>
            </ul>
          </div>

          <div className="p-6 bg-background dark:bg-secondary rounded-xl border ">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Trust Indicators</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-muted-foreground">
              <li>Enterprise-grade security badge</li>
              <li>Sub-second response time</li>
              <li>5+ hours saved per week stat</li>
              <li>2,000+ professionals social proof</li>
            </ul>
          </div>

          <div className="p-6 bg-background dark:bg-secondary rounded-xl border ">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Form Features</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-muted-foreground">
              <li>Optional name field</li>
              <li>Required email field</li>
              <li>Interactive hover button</li>
              <li>Queue position confirmation</li>
              <li>Loading state during submission</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Documentation of all features and design elements of the waiting list page.',
      },
    },
  },
}
