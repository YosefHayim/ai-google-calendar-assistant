import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AssistantAvatar } from '@/components/dashboard/chat/AssistantAvatar'

const meta: Meta<typeof AssistantAvatar> = {
  title: 'Dashboard/Chat/AssistantAvatar',
  component: AssistantAvatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] h-[600px] bg-muted dark:bg-secondary flex items-center justify-center rounded-xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isRecording: false,
    isSpeaking: false,
    isLoading: false,
    compact: false,
  },
}

export const Recording: Story = {
  args: {
    isRecording: true,
    isSpeaking: false,
    isLoading: false,
    compact: false,
  },
}

export const Speaking: Story = {
  args: {
    isRecording: false,
    isSpeaking: true,
    isLoading: false,
    compact: false,
  },
}

export const Loading: Story = {
  args: {
    isRecording: false,
    isSpeaking: false,
    isLoading: true,
    compact: false,
  },
}

export const RecordingAndSpeaking: Story = {
  args: {
    isRecording: true,
    isSpeaking: true,
    isLoading: false,
    compact: false,
  },
}

export const Compact: Story = {
  args: {
    isRecording: false,
    isSpeaking: false,
    isLoading: false,
    compact: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] h-[400px] bg-muted dark:bg-secondary flex items-center justify-center rounded-xl">
        <Story />
      </div>
    ),
  ],
}

export const CompactRecording: Story = {
  args: {
    isRecording: true,
    isSpeaking: false,
    isLoading: false,
    compact: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] h-[400px] bg-muted dark:bg-secondary flex items-center justify-center rounded-xl">
        <Story />
      </div>
    ),
  ],
}

export const CompactSpeaking: Story = {
  args: {
    isRecording: false,
    isSpeaking: true,
    isLoading: false,
    compact: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] h-[400px] bg-muted dark:bg-secondary flex items-center justify-center rounded-xl">
        <Story />
      </div>
    ),
  ],
}

export const CompactLoading: Story = {
  args: {
    isRecording: false,
    isSpeaking: false,
    isLoading: true,
    compact: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] h-[400px] bg-muted dark:bg-secondary flex items-center justify-center rounded-xl">
        <Story />
      </div>
    ),
  ],
}

export const DarkBackground: Story = {
  args: {
    isRecording: false,
    isSpeaking: false,
    isLoading: false,
    compact: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] h-[600px] bg-secondary flex items-center justify-center rounded-xl">
        <Story />
      </div>
    ),
  ],
}

export const AllStates: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <div className="text-center">
        <p className="text-sm font-medium mb-4 text-zinc-600 dark:text-muted-foreground">Idle</p>
        <div className="w-[250px] h-[250px] bg-secondary dark:bg-secondary rounded-xl flex items-center justify-center">
          <AssistantAvatar isRecording={false} isSpeaking={false} isLoading={false} compact={true} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium mb-4 text-zinc-600 dark:text-muted-foreground">Recording</p>
        <div className="w-[250px] h-[250px] bg-secondary dark:bg-secondary rounded-xl flex items-center justify-center">
          <AssistantAvatar isRecording={true} isSpeaking={false} isLoading={false} compact={true} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium mb-4 text-zinc-600 dark:text-muted-foreground">Speaking</p>
        <div className="w-[250px] h-[250px] bg-secondary dark:bg-secondary rounded-xl flex items-center justify-center">
          <AssistantAvatar isRecording={false} isSpeaking={true} isLoading={false} compact={true} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium mb-4 text-zinc-600 dark:text-muted-foreground">Loading</p>
        <div className="w-[250px] h-[250px] bg-secondary dark:bg-secondary rounded-xl flex items-center justify-center">
          <AssistantAvatar isRecording={false} isSpeaking={false} isLoading={true} compact={true} />
        </div>
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="p-8 bg-muted dark:bg-secondary rounded-xl">
        <Story />
      </div>
    ),
  ],
}
