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
      <div className="relative w-[400px] h-[100px] bg-zinc-100 dark:bg-zinc-900 rounded-xl">
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

export const ThreeDActive: Story = {
  args: {
    activeTab: '3d',
    onTabChange: () => {},
  },
}

export const Interactive: Story = {
  render: function InteractiveViewSwitcher() {
    const [activeTab, setActiveTab] = useState<'chat' | 'avatar' | '3d'>('chat')

    return (
      <div className="space-y-4">
        <ViewSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-zinc-500">
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
      <div className="relative w-[400px] h-[100px] bg-white rounded-xl border border-zinc-200">
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
      <div className="relative w-[400px] h-[100px] bg-zinc-950 rounded-xl">
        <Story />
      </div>
    ),
  ],
}

export const OnImageBackground: Story = {
  args: {
    activeTab: '3d',
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
        <p className="text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">Chat View Selected</p>
        <div className="relative w-[400px] h-[80px] bg-zinc-100 dark:bg-zinc-900 rounded-xl mx-auto">
          <ViewSwitcher activeTab="chat" onTabChange={() => {}} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">2D Avatar View Selected</p>
        <div className="relative w-[400px] h-[80px] bg-zinc-100 dark:bg-zinc-900 rounded-xl mx-auto">
          <ViewSwitcher activeTab="avatar" onTabChange={() => {}} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">3D View Selected</p>
        <div className="relative w-[400px] h-[80px] bg-zinc-100 dark:bg-zinc-900 rounded-xl mx-auto">
          <ViewSwitcher activeTab="3d" onTabChange={() => {}} />
        </div>
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="p-8 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
        <Story />
      </div>
    ),
  ],
}
