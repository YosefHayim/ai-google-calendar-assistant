'use client'

<<<<<<< HEAD
import React, { createContext, useContext, useState, useCallback } from 'react'
import { deleteConversation, type ConversationListItem } from '@/services/chatService'
import { Message } from '@/types'
import { useGetConversations } from '@/hooks/queries/conversations/useGetConversations'
import { useGetConversationById } from '@/hooks/queries/conversations/useGetConversationById'
=======
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { type ConversationListItem } from '@/services/chatService'
import { Message } from '@/types'
import { useConversations, useConversation, useDeleteConversationById } from '@/hooks/queries'
import { queryKeys } from '@/lib/query'
>>>>>>> eea5701c053aa731dfb90eb1ded3b1260e070945

interface ChatContextValue {
  // Conversation state
  selectedConversationId: number | null
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
  removeConversation: (id: number) => Promise<boolean>
  setConversationId: (id: number | null) => void
  updateConversationTitle: (id: number, title: string) => void
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
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [isPendingConversation, setIsPendingConversation] = useState(true)
  const [localConversations, setLocalConversations] = useState<ConversationListItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

<<<<<<< HEAD
  // Use tanstack query hooks for data fetching
  const conversationsQuery = useGetConversations()
  const conversationQuery = useGetConversationById(selectedConversationId)

  // Derive conversations from query
  const conversations = conversationsQuery.data ?? []
  const isLoadingConversations = conversationsQuery.isLoading
  const isLoadingConversation = conversationQuery.isLoading

  // Extract stable refetch function
  const refetchConversations = conversationsQuery.refetch
=======
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

  // Sync fetched conversations to local state for optimistic updates
  useEffect(() => {
    setLocalConversations(fetchedConversations)
  }, [fetchedConversations])

  // Convert conversation messages when a conversation is loaded
  useEffect(() => {
    if (selectedConversationData && selectedConversationId) {
      const convertedMessages: Message[] = (selectedConversationData.messages || []).map((msg, index) => ({
        id: `${selectedConversationId}-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(),
      }))
      setMessages(convertedMessages)
    }
  }, [selectedConversationData, selectedConversationId])

  const selectConversation = useCallback((conversation: ConversationListItem) => {
    setSelectedConversationId(conversation.id)
    setIsPendingConversation(false)
  }, [])
>>>>>>> eea5701c053aa731dfb90eb1ded3b1260e070945

  const startNewConversation = useCallback(() => {
    setMessages([])
    setSelectedConversationId(null)
<<<<<<< HEAD
    setIsPendingConversation(true) // Mark as pending until first message is sent
  }, [])

  const selectConversation = useCallback(async (conversation: ConversationListItem) => {
    setSelectedConversationId(conversation.id)
    setIsPendingConversation(false)
    // Messages will be loaded by the conversationQuery hook
    // You can set messages here if needed based on the conversation data
  }, [])

=======
    setIsPendingConversation(true)
  }, [])

>>>>>>> eea5701c053aa731dfb90eb1ded3b1260e070945
  const refreshConversations = useCallback(async () => {
    await refetchConversations()
  }, [refetchConversations])

<<<<<<< HEAD
  const removeConversation = useCallback(async (id: number): Promise<boolean> => {
    const deleted = await deleteConversation(id)
    if (deleted) {
      // Refetch to update the list
      await refetchConversations()
      if (selectedConversationId === id) {
        startNewConversation()
      }
    }
    return deleted
  }, [refetchConversations, selectedConversationId, startNewConversation])
=======
  const removeConversation = useCallback(
    async (id: number): Promise<boolean> => {
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
>>>>>>> eea5701c053aa731dfb90eb1ded3b1260e070945

  const setConversationId = useCallback((id: number | null) => {
    setSelectedConversationId(id)
    if (id !== null) {
      setIsPendingConversation(false)
    }
  }, [])

<<<<<<< HEAD
  const updateConversationTitle = useCallback((id: number, title: string) => {
    // Optimistically update - refetch will sync with server
    refetchConversations()
  }, [refetchConversations])

  const addConversationToList = useCallback((conversation: ConversationListItem) => {
    // Refetch to get the latest list including the new conversation
    refetchConversations()
  }, [refetchConversations])
=======
  const updateConversationTitle = useCallback(
    (id: number, title: string) => {
      setLocalConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)))
      // Also update the query cache
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() })
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
>>>>>>> eea5701c053aa731dfb90eb1ded3b1260e070945

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
