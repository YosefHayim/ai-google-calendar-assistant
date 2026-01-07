'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { type ConversationListItem, type ChatMessage } from '@/services/chatService'
import { Message } from '@/types'
import { useConversations, useConversation, useDeleteConversationById } from '@/hooks/queries'
import { queryKeys } from '@/lib/query'

interface ChatContextValue {
  // Conversation state
  selectedConversationId: string | null
  conversations: ConversationListItem[]
  isLoadingConversations: boolean
  isLoadingConversation: boolean
  isPendingConversation: boolean // True when in a new, unsaved conversation

  // Search state
  searchQuery: string
  setSearchQuery: (query: string) => void
  isSearching: boolean // True when fetching search results

  // Actions
  selectConversation: (conversation: ConversationListItem) => void
  startNewConversation: () => void
  refreshConversations: () => Promise<void>
  removeConversation: (id: string) => Promise<boolean>
  setConversationId: (id: string | null) => void
  updateConversationTitle: (id: string, title: string) => void
  addConversationToList: (conversation: ConversationListItem) => void

  // Messages for the selected conversation
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  // Local state for messages and UI
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isPendingConversation, setIsPendingConversation] = useState(true)
  const [localConversations, setLocalConversations] = useState<ConversationListItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // TanStack Query hooks - pass search query when it has 2+ characters
  const {
    conversations: fetchedConversations,
    isLoading: isLoadingConversations,
    isFetching: isSearching,
    refetch: refetchConversations,
  } = useConversations({
    search: searchQuery.length >= 2 ? searchQuery : undefined,
  })

  const { conversation: selectedConversationData, isLoading: isLoadingConversation } = useConversation({
    conversationId: selectedConversationId,
    enabled: selectedConversationId !== null,
  })

  const { deleteConversationAsync } = useDeleteConversationById()

  const prevFetchedRef = useRef<ConversationListItem[]>([])

  useEffect(() => {
    const prevIds = prevFetchedRef.current.map((c) => c.id).join(',')
    const newIds = fetchedConversations.map((c) => c.id).join(',')
    if (prevIds !== newIds) {
      setLocalConversations(fetchedConversations)
      prevFetchedRef.current = fetchedConversations
    }
  }, [fetchedConversations])

  // Convert conversation messages when a conversation is loaded
  useEffect(() => {
    if (selectedConversationData && selectedConversationId) {
      const convertedMessages: Message[] = (selectedConversationData.messages || []).map(
        (msg: ChatMessage, index: number) => ({
          id: `${selectedConversationId}-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(),
        }),
      )
      setMessages(convertedMessages)
    }
  }, [selectedConversationData, selectedConversationId])

  const selectConversation = useCallback((conversation: ConversationListItem) => {
    setSelectedConversationId(conversation.id)
    setIsPendingConversation(false)
  }, [])

  const startNewConversation = useCallback(() => {
    setMessages([])
    setSelectedConversationId(null)
    setIsPendingConversation(true)
  }, [])

  const refreshConversations = useCallback(async () => {
    await refetchConversations()
  }, [refetchConversations])

  const removeConversation = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const deleted = await deleteConversationAsync(id)
        if (deleted) {
          setLocalConversations((prev) => prev.filter((c) => c.id !== id))
          if (selectedConversationId === id) {
            startNewConversation()
          }
        }
        return deleted
      } catch {
        return false
      }
    },
    [deleteConversationAsync, selectedConversationId, startNewConversation],
  )

  const setConversationId = useCallback((id: string | null) => {
    setSelectedConversationId(id)
    if (id !== null) {
      setIsPendingConversation(false)
    }
  }, [])

  const updateConversationTitle = useCallback(
    (id: string, title: string) => {
      setLocalConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)))
      // Also update the query cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      })
    },
    [queryClient],
  )

  const addConversationToList = useCallback((conversation: ConversationListItem) => {
    setLocalConversations((prev) => {
      const exists = prev.some((c) => c.id === conversation.id)
      if (exists) {
        return prev.map((c) => (c.id === conversation.id ? conversation : c))
      }
      return [conversation, ...prev]
    })
  }, [])

  return (
    <ChatContext.Provider
      value={{
        selectedConversationId,
        conversations: localConversations,
        isLoadingConversations,
        isLoadingConversation,
        isPendingConversation,
        searchQuery,
        setSearchQuery,
        isSearching,
        selectConversation,
        startNewConversation,
        refreshConversations,
        removeConversation,
        setConversationId,
        updateConversationTitle,
        addConversationToList,
        messages,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
