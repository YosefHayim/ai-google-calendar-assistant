import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Navbar from '@/components/marketing/Navbar'

const meta: Meta<typeof Navbar> = {
  title: 'Marketing/Navbar',
  component: Navbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' },
    docs: {
      description: {
        component:
          'The main navigation bar for Ask Ally marketing pages. Features responsive design with mobile hamburger menu, language/theme toggles, and scroll-triggered styling.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-[200vh] bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <Story />
        <div className="pt-32 px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              Scroll down to see navbar transition
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              The navbar transforms from transparent to a frosted glass effect when you scroll past 20px.
            </p>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6"
              >
                <div className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-700 rounded" />
                <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-700 rounded mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default navbar state with transparent background. Scroll to see the transition effect.',
      },
    },
  },
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Navbar appearance in dark mode with appropriate contrast and styling.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-[200vh] bg-gradient-to-b from-zinc-950 to-zinc-900">
        <Story />
        <div className="pt-32 px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-zinc-100">Dark Mode Navigation</h1>
            <p className="text-zinc-400">
              The navbar adapts seamlessly to dark mode with proper contrast ratios.
            </p>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-zinc-800 rounded-xl border border-zinc-700 p-6">
                <div className="h-4 w-3/4 bg-zinc-700 rounded" />
                <div className="h-4 w-1/2 bg-zinc-700 rounded mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  ],
}

export const ScrolledState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Shows the navbar after scrolling - with frosted glass background, shadow, and compact padding.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Story />
        <div className="pt-24 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-8">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Scrolled Navbar Preview
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Scroll this page to observe the navbar&apos;s frosted glass effect activate.
              </p>
            </div>
          </div>
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
          'Mobile responsive view with hamburger menu. Click the hamburger icon to reveal the full navigation sidebar.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Story />
        <div className="pt-24 px-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Mobile Navigation</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Tap the hamburger menu icon to open the mobile navigation sidebar with full menu options.
            </p>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700" />
            ))}
          </div>
        </div>
      </div>
    ),
  ],
}
