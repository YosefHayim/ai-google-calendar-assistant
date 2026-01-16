import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MessageActions } from '@/components/dashboard/chat/MessageActions'
import { Message } from '@/types'

const meta: Meta<typeof MessageActions> = {
  title: 'Dashboard/Chat/MessageActions',
  component: MessageActions,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-xl min-w-[400px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const baseUserMessage: Message = {
  id: 'msg-1',
  role: 'user',
  content: 'Schedule a meeting with Sarah tomorrow at 2pm',
  timestamp: new Date(),
}

const baseAssistantMessage: Message = {
  id: 'msg-2',
  role: 'assistant',
  content: "I've scheduled a meeting with Sarah for tomorrow at 2:00 PM.",
  timestamp: new Date(),
}

export const UserMessageActions: Story = {
  args: {
    msg: baseUserMessage,
    isSpeaking: false,
    onResend: () => console.log('Resend clicked'),
    onEdit: () => console.log('Edit clicked'),
    onSpeak: () => console.log('Speak clicked'),
  },
}

export const AssistantMessageActions: Story = {
  args: {
    msg: baseAssistantMessage,
    isSpeaking: false,
    onResend: () => console.log('Resend clicked'),
    onEdit: () => console.log('Edit clicked'),
    onSpeak: () => console.log('Speak clicked'),
  },
}

export const SpeakingState: Story = {
  args: {
    msg: baseAssistantMessage,
    isSpeaking: true,
    onResend: () => console.log('Resend clicked'),
    onEdit: () => console.log('Edit clicked'),
    onSpeak: () => console.log('Speak clicked'),
  },
}

export const WithLongTimestamp: Story = {
  args: {
    msg: {
      ...baseAssistantMessage,
      timestamp: new Date('2024-12-25T23:59:00'),
    },
    isSpeaking: false,
    onResend: () => console.log('Resend clicked'),
    onEdit: () => console.log('Edit clicked'),
    onSpeak: () => console.log('Speak clicked'),
  },
}

export const InContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <div className="flex justify-end mb-2">
          <div className="bg-primary text-white px-4 py-2 rounded-lg rounded-tr-none max-w-[80%]">
            {baseUserMessage.content}
          </div>
        </div>
        <MessageActions
          msg={baseUserMessage}
          isSpeaking={false}
          onResend={() => {}}
          onEdit={() => {}}
          onSpeak={() => {}}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <div className="flex justify-start mb-2">
          <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg rounded-tl-none max-w-[80%]">
            {baseAssistantMessage.content}
          </div>
        </div>
        <MessageActions
          msg={baseAssistantMessage}
          isSpeaking={false}
          onResend={() => {}}
          onEdit={() => {}}
          onSpeak={() => {}}
        />
      </div>
    </div>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">User Message Actions</p>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <MessageActions
            msg={baseUserMessage}
            isSpeaking={false}
            onResend={() => {}}
            onEdit={() => {}}
            onSpeak={() => {}}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">Assistant Message Actions (Idle)</p>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <MessageActions
            msg={baseAssistantMessage}
            isSpeaking={false}
            onResend={() => {}}
            onEdit={() => {}}
            onSpeak={() => {}}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">Assistant Message Actions (Speaking)</p>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <MessageActions
            msg={baseAssistantMessage}
            isSpeaking={true}
            onResend={() => {}}
            onEdit={() => {}}
            onSpeak={() => {}}
          />
        </div>
      </div>
    </div>
  ),
}

export const DarkTheme: Story = {
  args: {
    msg: baseAssistantMessage,
    isSpeaking: false,
    onResend: () => {},
    onEdit: () => {},
    onSpeak: () => {},
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-zinc-950 rounded-xl min-w-[400px]">
        <Story />
      </div>
    ),
  ],
}
