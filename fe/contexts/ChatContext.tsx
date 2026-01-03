'use client'

import React, { createContext, useContext, useState } from 'react'
import {
  getConversation,
  getConversations,
  deleteConversation,
  type ConversationListItem,
} from '@/services/chatService'
import { Message } from '@/types'

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
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  const [isPendingConversation, setIsPendingConversation] = useState(true) // Start as pending (no conversation selected)
  const [messages, setMessages] = useState<Message[]>([])

  const refreshConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const response = await getConversations(20, 0)
      setConversations(response.conversations)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const selectConversation = async (conversation: ConversationListItem) => {
    setIsLoadingConversation(true)
    try {
      const fullConversation = await getConversation(conversation.id)
      if (fullConversation) {
        const loadedMessages: Message[] = fullConversation.messages.map((msg, index) => ({
          id: `${conversation.id}-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(fullConversation.lastUpdated),
        }))
        setMessages(loadedMessages)
        setSelectedConversationId(conversation.id)
        setIsPendingConversation(false) // No longer pending when selecting existing conversation
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    } finally {
      setIsLoadingConversation(false)
    }
  }

  const startNewConversation = () => {
    setMessages([])
    setSelectedConversationId(null)
    setIsPendingConversation(true) // Mark as pending until first message is sent
  }

  const removeConversation = async (id: number): Promise<boolean> => {
    const deleted = await deleteConversation(id)
    if (deleted) {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (selectedConversationId === id) {
        startNewConversation()
      }
    }
    return deleted
  }

  const setConversationId = (id: number | null) => {
    setSelectedConversationId(id)
    if (id !== null) {
      setIsPendingConversation(false) // No longer pending when conversation ID is set
    }
  }

  const updateConversationTitle = (id: number, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    )
  }

  const addConversationToList = (conversation: ConversationListItem) => {
    setConversations((prev) => {
      // Check if conversation already exists
      const exists = prev.some((c) => c.id === conversation.id)
      if (exists) {
        // Update existing conversation
        return prev.map((c) => (c.id === conversation.id ? conversation : c))
      }
      // Add new conversation at the beginning
      return [conversation, ...prev]
    })
  }

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
