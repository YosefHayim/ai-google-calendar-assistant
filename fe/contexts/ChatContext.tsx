'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  getConversation,
  getConversations,
  deleteConversation,
  type ConversationListItem,
} from '@/services/chatService'
import { Message } from '@/types'
import { useUpdateConversationById } from '@/hooks/queries/conversations/useUpdateConversationById'
import { useDeleteConversationById } from '@/hooks/queries/conversations/useDeleteConversationById'
import { useGetConversations } from '@/hooks/queries/conversations/useGetConversations'
import { useGetConversationById } from '@/hooks/queries/conversations/useGetConversationById'

interface ChatContextValue {
  // Conversation state
  selectedConversationId: number | null
  conversations: ConversationListItem[]
  isLoadingConversations: boolean
  isLoadingConversation: boolean
  isPendingConversation: boolean // True when in a new, unsaved conversation

  // Actions
  selectConversation: (conversation: ConversationListItem) => Promise<void>
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
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [isPendingConversation, setIsPendingConversation] = useState(true)

  // Use tanstack query hooks for data fetching
  const conversationsQuery = useGetConversations()
  const conversationQuery = useGetConversationById(selectedConversationId)

  // Derive conversations from query
  const conversations = conversationsQuery.data ?? []
  const isLoadingConversations = conversationsQuery.isLoading
  const isLoadingConversation = conversationQuery.isLoading

  const startNewConversation = useCallback(() => {
    setMessages([])
    setSelectedConversationId(null)
    setIsPendingConversation(true) // Mark as pending until first message is sent
  }, [])

  const selectConversation = useCallback(async (conversation: ConversationListItem) => {
    setSelectedConversationId(conversation.id)
    setIsPendingConversation(false)
    // Messages will be loaded by the conversationQuery hook
    // You can set messages here if needed based on the conversation data
  }, [])

  const refreshConversations = useCallback(async () => {
    await conversationsQuery.refetch()
  }, [conversationsQuery])

  const removeConversation = useCallback(async (id: number): Promise<boolean> => {
    const deleted = await deleteConversation(id)
    if (deleted) {
      // Refetch to update the list
      await conversationsQuery.refetch()
      if (selectedConversationId === id) {
        startNewConversation()
      }
    }
    return deleted
  }, [conversationsQuery, selectedConversationId])

  const setConversationId = useCallback((id: number | null) => {
    setSelectedConversationId(id)
    if (id !== null) {
      setIsPendingConversation(false) // No longer pending when conversation ID is set
    }
  }, [])

  const updateConversationTitle = useCallback((id: number, title: string) => {
    // Optimistically update - refetch will sync with server
    conversationsQuery.refetch()
  }, [conversationsQuery])

  const addConversationToList = useCallback((conversation: ConversationListItem) => {
    // Refetch to get the latest list including the new conversation
    conversationsQuery.refetch()
  }, [conversationsQuery])

  return (
    <ChatContext.Provider
      value={{
        selectedConversationId,
        conversations,
        isLoadingConversations,
        isLoadingConversation,
        isPendingConversation,
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
