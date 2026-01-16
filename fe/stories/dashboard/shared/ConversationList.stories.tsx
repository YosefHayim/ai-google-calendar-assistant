import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ConversationList } from '@/components/dashboard/shared/sidebar-components/ConversationList'
import type { ConversationListItem } from '@/services/chatService'
import { useState } from 'react'

const meta: Meta<typeof ConversationList> = {
  title: 'Dashboard/Shared/ConversationList',
  component: ConversationList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[280px] h-[500px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const mockConversations: ConversationListItem[] = [
  {
    id: 'conv-1',
    title: 'Schedule team meeting for next week',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    messageCount: 5,
  },
  {
    id: 'conv-2',
    title: 'Plan Q4 roadmap review sessions',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    messageCount: 8,
  },
  {
    id: 'conv-3',
    title: 'Reschedule dentist appointment',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    messageCount: 3,
  },
  {
    id: 'conv-4',
    title: 'Block focus time for project work',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    messageCount: 2,
  },
  {
    id: 'conv-5',
    title: 'Set up recurring 1:1 with manager',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    messageCount: 12,
  },
  {
    id: 'conv-6',
    title: 'Find time for gym workouts',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    messageCount: 4,
  },
  {
    id: 'conv-7',
    title: 'Schedule client call with Acme Corp',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    messageCount: 6,
  },
]

const defaultArgs = {
  conversations: mockConversations,
  selectedConversationId: null,
  streamingTitleConversationId: null,
  isLoading: false,
  isSearching: false,
  localSearchValue: '',
  onSearchChange: () => {},
  onClearSearch: () => {},
  onSelectConversation: () => {},
  onInitiateDelete: () => {},
}

export const Default: Story = {
  args: defaultArgs,
}

export const WithSelectedConversation: Story = {
  args: {
    ...defaultArgs,
    selectedConversationId: 'conv-2',
  },
}

export const Loading: Story = {
  args: {
    ...defaultArgs,
    isLoading: true,
    conversations: [],
  },
}

export const Searching: Story = {
  args: {
    ...defaultArgs,
    isSearching: true,
    localSearchValue: 'meeting',
  },
}

export const WithSearchResults: Story = {
  args: {
    ...defaultArgs,
    localSearchValue: 'meeting',
    conversations: mockConversations.filter((c) => c.title.toLowerCase().includes('meeting')),
  },
}

export const NoResults: Story = {
  args: {
    ...defaultArgs,
    localSearchValue: 'xyz123',
    conversations: [],
  },
}

export const Empty: Story = {
  args: {
    ...defaultArgs,
    conversations: [],
  },
}

export const StreamingTitle: Story = {
  args: {
    ...defaultArgs,
    streamingTitleConversationId: 'conv-1',
  },
}

export const ManyConversations: Story = {
  args: {
    ...defaultArgs,
    conversations: [
      ...mockConversations,
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `conv-extra-${i}`,
        title: `Additional conversation ${i + 1}`,
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i + 8)).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i + 9)).toISOString(),
        messageCount: Math.floor(Math.random() * 10) + 1,
      })),
    ],
  },
}

export const LongTitles: Story = {
  args: {
    ...defaultArgs,
    conversations: [
      {
        id: 'conv-long-1',
        title: 'Schedule a very important meeting with the entire leadership team to discuss Q4 goals and objectives',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        messageCount: 7,
      },
      {
        id: 'conv-long-2',
        title: 'Reschedule the product demo for the new client from Tuesday to Wednesday afternoon',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        messageCount: 4,
      },
      {
        id: 'conv-long-3',
        title: 'Find 2 hours of focus time every day this week for deep work on the new feature',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
        messageCount: 3,
      },
    ],
  },
}

export const Interactive: Story = {
  render: function InteractiveConversationList() {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [searchValue, setSearchValue] = useState('')
    const [conversations, setConversations] = useState(mockConversations)

    const filteredConversations = searchValue
      ? conversations.filter((c) => c.title.toLowerCase().includes(searchValue.toLowerCase()))
      : conversations

    const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (selectedId === id) setSelectedId(null)
    }

    return (
      <ConversationList
        conversations={filteredConversations}
        selectedConversationId={selectedId}
        streamingTitleConversationId={null}
        isLoading={false}
        isSearching={false}
        localSearchValue={searchValue}
        onSearchChange={(e) => setSearchValue(e.target.value)}
        onClearSearch={() => setSearchValue('')}
        onSelectConversation={(conv) => setSelectedId(conv.id)}
        onInitiateDelete={handleDelete}
      />
    )
  },
}

export const InSidebarContext: Story = {
  args: defaultArgs,
  decorators: [
    (Story) => (
      <div className="w-[280px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-sm font-bold">A</span>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Ask Ally</span>
          </div>
        </div>
        <div className="h-[400px] overflow-hidden">
          <Story />
        </div>
      </div>
    ),
  ],
}
