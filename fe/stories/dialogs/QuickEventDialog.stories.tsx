import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { QuickEventDialog } from '@/components/dialogs/QuickEventDialog'
import { fn } from 'storybook/test'

const meta: Meta<typeof QuickEventDialog> = {
  title: 'Dialogs/QuickEventDialog',
  component: QuickEventDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A powerful dialog for creating calendar events using natural language or voice input. Features AI-powered parsing, conflict detection, and real-time feedback.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls dialog visibility',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when dialog is closed',
    },
    onEventCreated: {
      action: 'event-created',
      description: 'Callback when an event is successfully created',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onEventCreated: fn(),
  },
}

export const WithPrefilledText: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onEventCreated: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'The dialog in its default input state, ready for natural language event creation. Users can type "Team standup tomorrow at 9am" or use voice input.',
      },
    },
  },
}

export const VoiceInputReady: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onEventCreated: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Users can click the microphone button to use voice input for hands-free event creation. The dialog supports speech-to-text via browser API.',
      },
    },
  },
}

export const ExamplesShowcase: Story = {
  render: () => (
    <div className="space-y-4 p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Quick Event Dialog Examples</h2>
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Natural Language Examples:</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            &quot;Meeting with John tomorrow at 3pm&quot;
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            &quot;Lunch at Cafe Roma on Friday 12:30pm for 1 hour&quot;
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            &quot;Team standup every Monday at 9am&quot;
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            &quot;Dentist appointment next Tuesday 2pm-3pm&quot;
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            &quot;Call with Sarah in 2 hours&quot;
          </li>
        </ul>
      </div>
      <QuickEventDialog isOpen={true} onClose={fn()} onEventCreated={fn()} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Showcases the types of natural language inputs the Quick Event Dialog can understand and parse into structured calendar events.',
      },
    },
  },
}
