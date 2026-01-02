'use client'

import { MessageSquare, Plus, Trash2, Clock } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import {
  ConversationListItem,
  deleteConversation,
  getConversations,
} from '@/services/chatService'

interface ConversationListProps {
  onSelectConversation: (conversation: ConversationListItem) => void
  onNewConversation: () => void
  selectedConversationId?: number | null
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  onNewConversation,
  selectedConversationId,
}) => {
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getConversations(20, 0)
      setConversations(response.conversations)
    } catch {
      setError('Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const handleDelete = async (e: React.MouseEvent, conversationId: number) => {
    e.stopPropagation()
    if (!confirm('Delete this conversation?')) return

    const deleted = await deleteConversation(conversationId)
    if (deleted) {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId))
      if (selectedConversationId === conversationId) {
        onNewConversation()
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-zinc-500">
            <p>{error}</p>
            <button
              onClick={loadConversations}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No conversations yet</p>
            <p className="text-sm mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full text-left p-3 rounded-lg transition-colors group ${
                  selectedConversationId === conversation.id
                    ? 'bg-zinc-200 dark:bg-zinc-800'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {conversation.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(conversation.lastUpdated)}
                      </span>
                      <span>{conversation.messageCount} messages</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, conversation.id)}
                    className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition-all"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {conversations.length > 0 && (
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-xs text-zinc-400">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
