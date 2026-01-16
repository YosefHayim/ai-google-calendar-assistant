import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AIAllySidebar } from '@/components/dashboard/shared/AIAllySidebar'
import { fn } from 'storybook/test'

const meta: Meta<typeof AIAllySidebar> = {
  title: 'Dashboard/Shared/AIAllySidebar',
  component: AIAllySidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A floating AI chat sidebar with an animated orb button. Features voice input, quick actions, and a modern chat interface powered by the Ally AI assistant.',
      },
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 p-8 relative">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard Content</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            This represents your dashboard content. The AI Ally sidebar appears as a floating chat panel.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700" />
            ))}
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the chat panel is open',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when the sidebar is closed',
    },
    onOpen: {
      action: 'opened',
      description: 'Callback when the sidebar is opened via the orb button',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: fn(),
    onOpen: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'The collapsed state showing only the floating orb button in the bottom-right corner. Click the orb to open the chat panel.',
      },
    },
  },
}

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onOpen: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'The expanded chat panel with the welcome message and quick action buttons. The orb button is hidden when the panel is open.',
      },
    },
  },
}

export const WithActiveConversation: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onOpen: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'The chat panel in an active conversation state. Messages are displayed with user messages on the right and AI responses on the left.',
      },
    },
  },
}

export const MobileView: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onOpen: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'The chat panel adapts to mobile viewport. The floating orb is hidden on mobile (shown via hamburger menu instead).',
      },
    },
  },
}

export const DarkMode: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onOpen: fn(),
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className="dark min-h-screen bg-zinc-950 p-8 relative">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard Content</h1>
          <p className="text-zinc-400">
            This represents your dashboard content in dark mode.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-zinc-800 rounded-xl shadow-sm border border-zinc-700" />
            ))}
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'The AI Ally sidebar in dark mode with proper contrast and styling.',
      },
    },
  },
}

export const QuickActionsVisible: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    onOpen: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the quick action buttons that appear when the conversation is fresh. These help users discover common tasks like optimizing schedules or finding free time.',
      },
    },
  },
}
