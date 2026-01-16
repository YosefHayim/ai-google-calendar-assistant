import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ConfirmDialog } from '@/components/dashboard/shared/ConfirmDialog'
import { fn } from 'storybook/test'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Dashboard/Shared/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A confirmation dialog for destructive or important actions. Supports multiple variants (destructive, warning, default) with loading state and keyboard navigation.',
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
    variant: {
      control: 'select',
      options: ['destructive', 'warning', 'default'],
      description: 'Visual style of the confirm button',
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows loading spinner on confirm button',
    },
    title: {
      control: 'text',
      description: 'Dialog title',
    },
    description: {
      control: 'text',
      description: 'Dialog description/message',
    },
    confirmLabel: {
      control: 'text',
      description: 'Text for confirm button',
    },
    cancelLabel: {
      control: 'text',
      description: 'Text for cancel button',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const DeleteConfirmation: Story = {
  args: {
    isOpen: true,
    title: 'Delete Conversation',
    description: 'Are you sure you want to delete this conversation? This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'destructive',
    isLoading: false,
    onClose: fn(),
    onConfirm: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'The most common use case - confirming a delete action with destructive styling.',
      },
    },
  },
}

export const GenericConfirmation: Story = {
  args: {
    isOpen: true,
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed with this action?',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'default',
    isLoading: false,
    onClose: fn(),
    onConfirm: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'A generic confirmation dialog with default styling for non-destructive actions.',
      },
    },
  },
}

export const WarningVariant: Story = {
  args: {
    isOpen: true,
    title: 'Disconnect Integration',
    description: 'This will disconnect your Google Calendar integration. You can reconnect it later from the settings page.',
    confirmLabel: 'Disconnect',
    cancelLabel: 'Keep Connected',
    variant: 'warning',
    isLoading: false,
    onClose: fn(),
    onConfirm: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Warning variant for actions that are reversible but potentially disruptive.',
      },
    },
  },
}

export const LoadingState: Story = {
  args: {
    isOpen: true,
    title: 'Delete Account',
    description: 'This will permanently delete your account and all associated data. This action cannot be undone.',
    confirmLabel: 'Delete Account',
    cancelLabel: 'Cancel',
    variant: 'destructive',
    isLoading: true,
    onClose: fn(),
    onConfirm: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state when an async operation is in progress. Both buttons are disabled during loading.',
      },
    },
  },
}

export const CustomLabels: Story = {
  args: {
    isOpen: true,
    title: 'Sign Out',
    description: 'Are you sure you want to sign out of your account?',
    confirmLabel: 'Sign Out',
    cancelLabel: 'Stay Logged In',
    variant: 'default',
    isLoading: false,
    onClose: fn(),
    onConfirm: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom button labels for context-specific actions.',
      },
    },
  },
}

export const LongDescription: Story = {
  args: {
    isOpen: true,
    title: 'Remove Team Member',
    description: 'This will remove the team member from your workspace. They will lose access to all shared calendars, conversations, and data. If they have any pending tasks, those will be reassigned to you. You can re-invite them later if needed.',
    confirmLabel: 'Remove Member',
    cancelLabel: 'Cancel',
    variant: 'destructive',
    isLoading: false,
    onClose: fn(),
    onConfirm: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Dialog with a longer description explaining the full impact of the action.',
      },
    },
  },
}

export const DarkMode: Story = {
  args: {
    isOpen: true,
    title: 'Clear All Data',
    description: 'This will permanently clear all your chat history and preferences.',
    confirmLabel: 'Clear Data',
    cancelLabel: 'Cancel',
    variant: 'destructive',
    isLoading: false,
    onClose: fn(),
    onConfirm: fn(),
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-zinc-950 flex items-center justify-center p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'The confirm dialog in dark mode.',
      },
    },
  },
}
