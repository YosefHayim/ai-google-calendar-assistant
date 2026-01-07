'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { useChatContext } from '@/contexts/ChatContext'
import { toast } from 'sonner'
import type { ConversationListItem } from '@/services/chatService'

interface SidebarContextValue {
  pathname: string
  conversationToDelete: number | null
  setConversationToDelete: (id: number | null) => void
  localSearchValue: string
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleClearSearch: () => void
  isQuickEventOpen: boolean
  setIsQuickEventOpen: (open: boolean) => void
  handleNewChat: (onClose: () => void) => void
  handleSelectConversation: (conversation: ConversationListItem, onClose: () => void) => Promise<void>
  initiateDelete: (e: React.MouseEvent, id: number) => void
  confirmDelete: () => Promise<void>
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { selectConversation, startNewConversation, removeConversation, searchQuery, setSearchQuery } = useChatContext()

  const [conversationToDelete, setConversationToDelete] = useState<number | null>(null)
  const [localSearchValue, setLocalSearchValue] = useState(searchQuery)
  const [isQuickEventOpen, setIsQuickEventOpen] = useState(false)

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value)
  }, 300)

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setLocalSearchValue(value)
      debouncedSetSearch(value)
    },
    [debouncedSetSearch]
  )

  const handleClearSearch = useCallback(() => {
    setLocalSearchValue('')
    setSearchQuery('')
  }, [setSearchQuery])

  const handleNewChat = useCallback(
    (onClose: () => void) => {
      startNewConversation()
      if (pathname !== '/dashboard') {
        router.push('/dashboard')
      }
      onClose()
    },
    [pathname, router, startNewConversation]
  )

  const handleSelectConversation = useCallback(
    async (conversation: ConversationListItem, onClose: () => void) => {
      await selectConversation(conversation)
      if (pathname !== '/dashboard') {
        router.push('/dashboard')
      }
      onClose()
    },
    [pathname, router, selectConversation]
  )

  const initiateDelete = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setConversationToDelete(id)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (conversationToDelete) {
      const success = await removeConversation(conversationToDelete)
      if (success) {
        toast.success('Conversation deleted')
      } else {
        toast.error('Failed to delete conversation')
      }
      setConversationToDelete(null)
    }
  }, [conversationToDelete, removeConversation])

  const value = useMemo<SidebarContextValue>(
    () => ({
      pathname,
      conversationToDelete,
      setConversationToDelete,
      localSearchValue,
      handleSearchChange,
      handleClearSearch,
      isQuickEventOpen,
      setIsQuickEventOpen,
      handleNewChat,
      handleSelectConversation,
      initiateDelete,
      confirmDelete,
    }),
    [
      pathname,
      conversationToDelete,
      localSearchValue,
      handleSearchChange,
      handleClearSearch,
      isQuickEventOpen,
      handleNewChat,
      handleSelectConversation,
      initiateDelete,
      confirmDelete,
    ]
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebarContext() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider')
  }
  return context
}
