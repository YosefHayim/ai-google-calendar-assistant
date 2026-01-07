'use client'

import React from 'react'
import { Calendar } from 'lucide-react'
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext'
import { useChatContext } from '@/contexts/ChatContext'
import { useUser } from '@/hooks/queries/auth/useUser'
import { QuickEventDialog } from '@/components/dialogs/QuickEventDialog'
import { SidebarHeader, SidebarNav, ConversationList, SidebarFooter, DeleteConfirmDialog } from './sidebar-components'
import type { ConversationListItem } from '@/services/chatService'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
  onOpenSettings: () => void
  onSignOut?: () => void
}

const SidebarContent: React.FC<SidebarProps> = ({ isOpen, onClose, onToggle, onOpenSettings, onSignOut }) => {
  const { data: userData } = useUser({ customUser: true })
  const { conversations, isLoadingConversations, selectedConversationId, isSearching } = useChatContext()
  const {
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
  } = useSidebarContext()

  return (
    <>
      <DeleteConfirmDialog
        isOpen={!!conversationToDelete}
        onClose={() => setConversationToDelete(null)}
        onConfirm={confirmDelete}
      />

      {isOpen && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        id="tour-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 md:w-20'
        }`}
      >
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden">
          <SidebarHeader isOpen={isOpen} onClose={onClose} onToggle={onToggle} onNewChat={() => handleNewChat(onClose)} />

          <SidebarNav pathname={pathname} isOpen={isOpen} onClose={onClose} />

          {isOpen && (
            <div className="px-4 mt-4">
              <button
                onClick={() => setIsQuickEventOpen(true)}
                className="w-full flex items-center gap-3 p-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Quick Add Event</span>
              </button>
            </div>
          )}

          {isOpen && (
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              isLoading={isLoadingConversations}
              isSearching={isSearching}
              localSearchValue={localSearchValue}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              onSelectConversation={(conv) => handleSelectConversation(conv, onClose)}
              onInitiateDelete={initiateDelete}
            />
          )}

          <QuickEventDialog isOpen={isQuickEventOpen} onClose={() => setIsQuickEventOpen(false)} onEventCreated={() => {}} />

          <SidebarFooter
            isOpen={isOpen}
            userData={userData}
            onOpenSettings={onOpenSettings}
            onClose={onClose}
            onSignOut={onSignOut}
          />
        </div>
      </aside>
    </>
  )
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  return (
    <SidebarProvider>
      <SidebarContent {...props} />
    </SidebarProvider>
  )
}

export default Sidebar
