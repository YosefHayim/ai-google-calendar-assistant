import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ViewSwitcher } from '@/components/dashboard/chat/ViewSwitcher'
import { useState } from 'react'

const meta: Meta<typeof ViewSwitcher> = {
  title: 'Dashboard/Chat/ViewSwitcher',
  component: ViewSwitcher,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="relative w-[400px] h-[100px] bg-secondary dark:bg-secondary rounded-xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const ChatActive: Story = {
  args: {
    activeTab: 'chat',
    onTabChange: () => {},
  },
}

export const AvatarActive: Story = {
  args: {
    activeTab: 'avatar',
    onTabChange: () => {},
  },
}

export const Interactive: Story = {
  render: function InteractiveViewSwitcher() {
    const [activeTab, setActiveTab] = useState<'chat' | 'avatar'>('chat')

    return (
      <div className="space-y-4">
        <ViewSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
          Current view: <span className="font-bold text-zinc-700 dark:text-zinc-300">{activeTab}</span>
        </div>
      </div>
    )
  },
}

export const OnLightBackground: Story = {
  args: {
    activeTab: 'chat',
    onTabChange: () => {},
  },
  decorators: [
    (Story) => (
      <div className="relative w-[400px] h-[100px] bg-background rounded-xl border">
        <Story />
      </div>
    ),
  ],
}

export const OnDarkBackground: Story = {
  args: {
    activeTab: 'avatar',
    onTabChange: () => {},
  },
  decorators: [
    (Story) => (
      <div className="relative w-[400px] h-[100px] bg-secondary rounded-xl">
        <Story />
      </div>
    ),
  ],
}

export const OnImageBackground: Story = {
  args: {
    activeTab: 'avatar',
    onTabChange: () => {},
  },
  decorators: [
    (Story) => (
      <div
        className="relative w-[400px] h-[100px] rounded-xl"
        style={{
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Story />
      </div>
    ),
  ],
}

export const AllTabs: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium mb-2 text-zinc-600 dark:text-muted-foreground">Chat View Selected</p>
        <div className="relative w-[400px] h-[80px] bg-secondary dark:bg-secondary rounded-xl mx-auto">
          <ViewSwitcher activeTab="chat" onTabChange={() => {}} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium mb-2 text-zinc-600 dark:text-muted-foreground">2D Avatar View Selected</p>
        <div className="relative w-[400px] h-[80px] bg-secondary dark:bg-secondary rounded-xl mx-auto">
          <ViewSwitcher activeTab="avatar" onTabChange={() => {}} />
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
