'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  type ConversationListItem,
  type ChatMessage,
  startNewConversation as startNewConversationApi,
} from '@/services/chatService'
import { Message } from '@/types'
import { useConversations, useConversation, useDeleteConversationById } from '@/hooks/queries'
import { useSelectedAgentProfile } from '@/hooks/queries/agent-profiles'
import { queryKeys } from '@/lib/query'

interface ChatContextValue {
  selectedConversationId: string | null
  conversations: ConversationListItem[]
  isLoadingConversations: boolean
  isLoadingConversation: boolean
  isPendingConversation: boolean

  searchQuery: string
  setSearchQuery: (query: string) => void
  isSearching: boolean

  streamingTitleConversationId: string | null

  selectedProfileId: string | null
  isLoadingProfile: boolean

  selectConversation: (conversation: ConversationListItem) => void
  startNewConversation: () => void
  refreshConversations: () => Promise<void>
  removeConversation: (id: string) => Promise<boolean>
  setConversationId: (id: string | null, isLocallyCreated?: boolean) => void
  updateConversationTitle: (id: string, title: string, isStreaming?: boolean) => void
  addConversationToList: (conversation: ConversationListItem) => void

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
  const [streamingTitleConversationId, setStreamingTitleConversationId] = useState<string | null>(null)

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

  const { profileId: selectedProfileId, isLoading: isLoadingProfile } = useSelectedAgentProfile()

  const prevFetchedRef = useRef<ConversationListItem[]>([])
  // Track if we just created this conversation locally (to avoid overwriting messages)
  const locallyCreatedConversationRef = useRef<string | null>(null)

  useEffect(() => {
    const prevIds = prevFetchedRef.current.map((c) => c.id).join(',')
    const newIds = fetchedConversations.map((c) => c.id).join(',')
    if (prevIds !== newIds) {
      setLocalConversations(fetchedConversations)
      prevFetchedRef.current = fetchedConversations
    }
  }, [fetchedConversations])

  // Convert conversation messages when a conversation is loaded
  // Skip if this conversation was just created locally (messages already exist)
  useEffect(() => {
    if (selectedConversationData && selectedConversationId) {
      // Skip overwriting if we just created this conversation locally
      if (locallyCreatedConversationRef.current === selectedConversationId) {
        return
      }
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

  const selectConversation = useCallback(
    (conversation: ConversationListItem) => {
      locallyCreatedConversationRef.current = null
      // Clear messages immediately when switching conversations to avoid showing stale data
      setMessages([])
      setSelectedConversationId(conversation.id)
      setIsPendingConversation(false)
      // Invalidate the specific conversation query to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.detail(conversation.id),
      })
    },
    [queryClient],
  )

  const startNewConversation = useCallback(async () => {
    locallyCreatedConversationRef.current = null
    setMessages([])
    setSelectedConversationId(null)
    setIsPendingConversation(true)
    await startNewConversationApi()
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

  const setConversationId = useCallback((id: string | null, isLocallyCreated = false) => {
    if (isLocallyCreated && id) {
      locallyCreatedConversationRef.current = id
    }
    setSelectedConversationId(id)
    if (id !== null) {
      setIsPendingConversation(false)
    }
  }, [])

  const updateConversationTitle = useCallback(
    (id: string, title: string, isStreaming = false) => {
      if (isStreaming) {
        setStreamingTitleConversationId(id)
      }
      setLocalConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)))
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      })
      if (isStreaming) {
        setTimeout(() => setStreamingTitleConversationId(null), 2000)
      }
    },
    [queryClient],
  )

  const addConversationToList = useCallback(
    (conversation: ConversationListItem) => {
      setLocalConversations((prev) => {
        const exists = prev.some((c) => c.id === conversation.id)
        if (exists) {
          return prev.map((c) => (c.id === conversation.id ? conversation : c))
        }
        return [conversation, ...prev]
      })
      // Also invalidate the query cache to ensure server data is refreshed
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      })
    },
    [queryClient],
  )

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
        streamingTitleConversationId,
        selectedProfileId,
        isLoadingProfile,
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
