'use client'

import React from 'react'
import { Clock, MessageSquare, Search, Trash2, X } from 'lucide-react'
import { formatRelativeDate } from '@/lib/dateUtils'
import type { ConversationListItem } from '@/services/chatService'

interface ConversationListProps {
  conversations: ConversationListItem[]
  selectedConversationId: number | null
  isLoading: boolean
  isSearching: boolean
  localSearchValue: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearSearch: () => void
  onSelectConversation: (conversation: ConversationListItem) => void
  onInitiateDelete: (e: React.MouseEvent, id: number) => void
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  isLoading,
  isSearching,
  localSearchValue,
  onSearchChange,
  onClearSearch,
  onSelectConversation,
  onInitiateDelete,
}) => {
  return (
    <div className="flex-1 mt-4 px-4 overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between mb-2 px-2">
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Recent Chats</p>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={localSearchValue}
          onChange={onSearchChange}
          placeholder="Search conversations..."
          className="w-full pl-9 pr-8 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-md text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {localSearchValue && (
          <button
            onClick={onClearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {isLoading || isSearching ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse h-12 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-4 text-zinc-400 dark:text-zinc-500">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">{localSearchValue ? 'No matching conversations' : 'No conversations yet'}</p>
        </div>
      ) : (
        <div className="space-y-1 flex-1 overflow-y-auto">
          {conversations.slice(0, 15).map((conversation) => (
            <div
              key={conversation.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectConversation(conversation)}
              onKeyDown={(e) => e.key === 'Enter' && onSelectConversation(conversation)}
              className={`w-full text-left p-2 rounded-md transition-colors group cursor-pointer ${
                selectedConversationId === conversation.id
                  ? 'bg-zinc-100 dark:bg-zinc-800'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{conversation.title}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-zinc-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeDate(conversation.lastUpdated)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => onInitiateDelete(e, conversation.id)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ConversationList
