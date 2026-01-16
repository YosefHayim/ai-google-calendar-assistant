import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EditableMessage } from '@/components/dashboard/chat/EditableMessage'
import { Message } from '@/types'
import { useRef, useState } from 'react'

const meta: Meta<typeof EditableMessage> = {
  title: 'Dashboard/Chat/EditableMessage',
  component: EditableMessage,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto bg-zinc-50 dark:bg-zinc-950 p-6 rounded-xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const userMessage: Message = {
  id: 'msg-1',
  role: 'user',
  content: 'Schedule a meeting with Sarah tomorrow at 2pm',
  timestamp: new Date(),
}

const assistantMessage: Message = {
  id: 'msg-2',
  role: 'assistant',
  content: "I've scheduled a meeting with Sarah for tomorrow at 2:00 PM.",
  timestamp: new Date(),
}

const dummyRef = { current: null }

export const UserMessageNotEditing: Story = {
  args: {
    message: userMessage,
    isEditing: false,
    editText: '',
    editInputRef: dummyRef,
    onEditTextChange: () => {},
    onKeyDown: () => {},
    onConfirm: () => {},
    onCancel: () => {},
  },
}

export const UserMessageEditing: Story = {
  args: {
    message: userMessage,
    isEditing: true,
    editText: 'Schedule a meeting with Sarah tomorrow at 3pm',
    editInputRef: dummyRef,
    onEditTextChange: () => {},
    onKeyDown: () => {},
    onConfirm: () => {},
    onCancel: () => {},
  },
}

export const AssistantMessageNotEditing: Story = {
  args: {
    message: assistantMessage,
    isEditing: false,
    editText: '',
    editInputRef: dummyRef,
    onEditTextChange: () => {},
    onKeyDown: () => {},
    onConfirm: () => {},
    onCancel: () => {},
  },
}

export const AssistantMessageEditing: Story = {
  args: {
    message: assistantMessage,
    isEditing: true,
    editText: "I've rescheduled the meeting with Sarah to 3:00 PM.",
    editInputRef: dummyRef,
    onEditTextChange: () => {},
    onKeyDown: () => {},
    onConfirm: () => {},
    onCancel: () => {},
  },
}

export const LongEditText: Story = {
  args: {
    message: userMessage,
    isEditing: true,
    editText: `Schedule a series of meetings for next week:
- Monday 9am: Team standup
- Tuesday 2pm: Client call with Acme Corp
- Wednesday 11am: Design review
- Thursday 3pm: Sprint planning
- Friday 10am: All-hands meeting`,
    editInputRef: dummyRef,
    onEditTextChange: () => {},
    onKeyDown: () => {},
    onConfirm: () => {},
    onCancel: () => {},
  },
}

export const WithTimestamp: Story = {
  args: {
    message: userMessage,
    isEditing: false,
    editText: '',
    editInputRef: dummyRef,
    onEditTextChange: () => {},
    onKeyDown: () => {},
    onConfirm: () => {},
    onCancel: () => {},
    hideTimestamp: false,
  },
}

export const Interactive: Story = {
  render: function InteractiveEditableMessage() {
    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(userMessage.content)
    const [message, setMessage] = useState(userMessage)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const handleConfirm = () => {
      setMessage({ ...message, content: editText })
      setIsEditing(false)
    }

    const handleCancel = () => {
      setEditText(message.content)
      setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleConfirm()
      } else if (e.key === 'Escape') {
        handleCancel()
      }
    }

    return (
      <div className="space-y-4">
        <EditableMessage
          message={message}
          isEditing={isEditing}
          editText={editText}
          editInputRef={inputRef}
          onEditTextChange={setEditText}
          onKeyDown={handleKeyDown}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-primary hover:underline"
          >
            Click to edit message
          </button>
        )}
      </div>
    )
  },
}

export const EditingStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium mb-3 text-zinc-600 dark:text-zinc-400">User Message - View Mode</p>
        <EditableMessage
          message={userMessage}
          isEditing={false}
          editText=""
          editInputRef={dummyRef}
          onEditTextChange={() => {}}
          onKeyDown={() => {}}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-3 text-zinc-600 dark:text-zinc-400">User Message - Edit Mode</p>
        <EditableMessage
          message={userMessage}
          isEditing={true}
          editText="Schedule a meeting with Sarah tomorrow at 4pm instead"
          editInputRef={dummyRef}
          onEditTextChange={() => {}}
          onKeyDown={() => {}}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-3 text-zinc-600 dark:text-zinc-400">Assistant Message - View Mode</p>
        <EditableMessage
          message={assistantMessage}
          isEditing={false}
          editText=""
          editInputRef={dummyRef}
          onEditTextChange={() => {}}
          onKeyDown={() => {}}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-3 text-zinc-600 dark:text-zinc-400">Assistant Message - Edit Mode</p>
        <EditableMessage
          message={assistantMessage}
          isEditing={true}
          editText="I've rescheduled the meeting with Sarah to 4:00 PM tomorrow."
          editInputRef={dummyRef}
          onEditTextChange={() => {}}
          onKeyDown={() => {}}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      </div>
    </div>
  ),
}

export const RTLMessage: Story = {
  args: {
    message: {
      ...userMessage,
      content: 'קבע פגישה עם שרה מחר בשעה 2',
    },
    isEditing: true,
    editText: 'קבע פגישה עם שרה מחר בשעה 3',
    editInputRef: dummyRef,
    onEditTextChange: () => {},
    onKeyDown: () => {},
    onConfirm: () => {},
    onCancel: () => {},
  },
}
