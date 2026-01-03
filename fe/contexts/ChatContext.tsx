'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'
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

  // Actions
  selectConversation: (conversation: ConversationListItem) => Promise<void>
  startNewConversation: () => void
  refreshConversations: () => Promise<void>
  removeConversation: (id: number) => Promise<boolean>
  setConversationId: (id: number | null) => void

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
  const [messages, setMessages] = useState<Message[]>([])

  const refreshConversations = useCallback(async () => {
    setIsLoadingConversations(true)
    try {
      const response = await getConversations(20, 0)
      setConversations(response.conversations)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }, [])

  const selectConversation = useCallback(async (conversation: ConversationListItem) => {
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
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    } finally {
      setIsLoadingConversation(false)
    }
  }, [])

  const startNewConversation = useCallback(() => {
    setMessages([])
    setSelectedConversationId(null)
  }, [])

  const removeConversation = useCallback(async (id: number): Promise<boolean> => {
    const deleted = await deleteConversation(id)
    if (deleted) {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (selectedConversationId === id) {
        startNewConversation()
      }
    }
    return deleted
  }, [selectedConversationId, startNewConversation])

  const setConversationId = useCallback((id: number | null) => {
    setSelectedConversationId(id)
  }, [])

  return (
    <ChatContext.Provider
      value={{
        selectedConversationId,
        conversations,
        isLoadingConversations,
        isLoadingConversation,
        selectConversation,
        startNewConversation,
        refreshConversations,
        removeConversation,
        setConversationId,
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
