'use client'

import {
  ArchiveConfirmDialog,
  ConversationList,
  DeleteConfirmDialog,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
} from './sidebar-components'
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext'

import React from 'react'
import { useChatContext } from '@/contexts/ChatContext'
import { useUser } from '@/hooks/queries/auth/useUser'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
  onOpenSettings: () => void
  onSignOut?: () => void
}

const SidebarContent: React.FC<SidebarProps> = ({ isOpen, onClose, onToggle, onOpenSettings, onSignOut }) => {
  const { data: userData } = useUser({ customUser: true })
  const { conversations, isLoadingConversations, selectedConversationId, isSearching, streamingTitleConversationId } =
    useChatContext()
  const {
    pathname,
    conversationToDelete,
    setConversationToDelete,
    isDeletingConversation,
    conversationToArchive,
    setConversationToArchive,
    isArchivingConversation,
    localSearchValue,
    handleSearchChange,
    handleClearSearch,
    handleNewChat,
    handleSelectConversation,
    initiateDelete,
    initiateArchive,
    confirmDelete,
    confirmArchive,
  } = useSidebarContext()

  return (
    <>
      <DeleteConfirmDialog
        isOpen={!!conversationToDelete}
        onClose={() => setConversationToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeletingConversation}
      />

      <ArchiveConfirmDialog
        isOpen={!!conversationToArchive}
        onClose={() => setConversationToArchive(null)}
        onConfirm={confirmArchive}
        isLoading={isArchivingConversation}
      />

      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 dark:bg-foreground/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="tour-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-background dark:bg-secondary border-r transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 md:w-20'
        }`}
      >
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden">
          <SidebarHeader
            isOpen={isOpen}
            onClose={onClose}
            onToggle={onToggle}
            onNewChat={() => handleNewChat(onClose)}
          />

          <SidebarNav pathname={pathname} isOpen={isOpen} onClose={onClose} />

          {isOpen && (
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              streamingTitleConversationId={streamingTitleConversationId}
              isLoading={isLoadingConversations}
              isSearching={isSearching}
              localSearchValue={localSearchValue}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              onSelectConversation={(conv) => handleSelectConversation(conv, onClose)}
              onInitiateDelete={initiateDelete}
              onInitiateArchive={initiateArchive}
            />
          )}

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
