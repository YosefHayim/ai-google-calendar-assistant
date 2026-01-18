import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const UseCaseSimulatorPlaceholder = () => (
  <div className="p-8 bg-background max-w-2xl mx-auto">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-foreground dark:text-primary-foreground mb-4">Use Case Simulator</h1>
      <p className="text-muted-foreground dark:text-muted-foreground">
        Interactive demo showing how Ally handles different scheduling scenarios
      </p>
    </div>

    <div className="space-y-6">
      <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Component Under Development</h3>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          The UseCaseSimulator component is currently a placeholder. This story documents the planned functionality.
        </p>
      </div>

      <div className="p-6 bg-background dark:bg-secondary rounded-xl border border dark:border">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Planned Use Cases</h3>
        <ul className="space-y-3 text-sm text-zinc-600 dark:text-muted-foreground">
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary dark:text-blue-400 text-xs font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">Quick Meeting Scheduling</p>
              <p className="text-muted-foreground">User says &quot;Schedule a team sync tomorrow at 10am&quot;</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-400 text-xs font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">Conflict Resolution</p>
              <p className="text-muted-foreground">Ally detects a conflict and suggests alternatives</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">Recurring Events</p>
              <p className="text-muted-foreground">Setting up weekly standup meetings</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-orange-600 dark:text-orange-400 text-xs font-bold">4</span>
            </div>
            <div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">Reschedule Flow</p>
              <p className="text-muted-foreground">Moving an existing event to a new time</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-pink-600 dark:text-pink-400 text-xs font-bold">5</span>
            </div>
            <div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">Multi-Calendar Query</p>
              <p className="text-muted-foreground">&quot;What&apos;s on my work calendar this week?&quot;</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="p-6 bg-background dark:bg-secondary rounded-xl border border dark:border">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Simulator Features</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Interactive chat simulation with typed responses
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Animated calendar preview showing changes
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Step-by-step walkthrough with tooltips
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Voice input demonstration mode
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Mobile and desktop view toggle
          </li>
        </ul>
      </div>
    </div>
  </div>
)

const meta: Meta<typeof UseCaseSimulatorPlaceholder> = {
  title: 'Marketing/UseCaseSimulator',
  component: UseCaseSimulatorPlaceholder,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "An interactive simulator demonstrating Ally's capabilities across different use cases. Shows real-world scheduling scenarios with animated chat and calendar interactions. (Component currently under development)",
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
          'Placeholder documentation for the UseCaseSimulator component. The actual component is under development.',
      },
    },
  },
}

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark bg-secondary min-h-screen">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Dark mode appearance for the simulator documentation.',
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
        story: 'Responsive layout on mobile devices.',
      },
    },
  },
}
