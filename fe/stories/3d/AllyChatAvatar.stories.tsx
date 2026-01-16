import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AllyChatAvatar } from '@/components/3d/ally-chat-avatar'

const meta: Meta<typeof AllyChatAvatar> = {
  title: '3D/AllyChatAvatar',
  component: AllyChatAvatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Chat avatar wrapper for the 3D Ally character. Maps chat states to animations with visual feedback.',
      },
    },
  },
  argTypes: {
    chatState: {
      control: 'select',
      options: ['idle', 'listening', 'processing', 'speaking', 'error'],
      description: 'Current chat state',
    },
    audioLevel: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
      description: 'Audio level for visual feedback (0-1)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size variant of the avatar',
    },
    showBackground: {
      control: 'boolean',
      description: 'Show gradient background',
    },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-8 bg-zinc-950 min-h-[300px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {
  args: {
    chatState: 'idle',
    size: 'lg',
    showBackground: true,
  },
}

export const Listening: Story = {
  args: {
    chatState: 'listening',
    size: 'lg',
    audioLevel: 0.5,
    showBackground: true,
  },
}

export const Processing: Story = {
  args: {
    chatState: 'processing',
    size: 'lg',
    showBackground: true,
  },
}

export const Speaking: Story = {
  args: {
    chatState: 'speaking',
    size: 'lg',
    audioLevel: 0.7,
    showBackground: true,
  },
}

export const Error: Story = {
  args: {
    chatState: 'error',
    size: 'lg',
    showBackground: true,
  },
}

export const SizeSmall: Story = {
  args: {
    chatState: 'idle',
    size: 'sm',
    showBackground: true,
  },
}

export const SizeMedium: Story = {
  args: {
    chatState: 'idle',
    size: 'md',
    showBackground: true,
  },
}

export const SizeXL: Story = {
  args: {
    chatState: 'idle',
    size: 'xl',
    showBackground: true,
  },
}

export const WithoutBackground: Story = {
  args: {
    chatState: 'idle',
    size: 'lg',
    showBackground: false,
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-8">
      <div className="flex flex-col items-center">
        <AllyChatAvatar chatState="idle" size="sm" showBackground />
        <span className="mt-2 text-xs text-zinc-400">Small</span>
      </div>
      <div className="flex flex-col items-center">
        <AllyChatAvatar chatState="idle" size="md" showBackground />
        <span className="mt-2 text-xs text-zinc-400">Medium</span>
      </div>
      <div className="flex flex-col items-center">
        <AllyChatAvatar chatState="idle" size="lg" showBackground />
        <span className="mt-2 text-xs text-zinc-400">Large</span>
      </div>
      <div className="flex flex-col items-center">
        <AllyChatAvatar chatState="idle" size="xl" showBackground />
        <span className="mt-2 text-xs text-zinc-400">XL</span>
      </div>
    </div>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div className="flex gap-6">
      {(['idle', 'listening', 'processing', 'speaking', 'error'] as const).map((state) => (
        <div key={state} className="flex flex-col items-center">
          <AllyChatAvatar chatState={state} size="md" showBackground />
          <span className="mt-2 text-xs text-zinc-400 capitalize">{state}</span>
        </div>
      ))}
    </div>
  ),
}
