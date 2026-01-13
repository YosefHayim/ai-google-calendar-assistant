'use client'

import { ConversationList, DeleteConfirmDialog, SidebarFooter, SidebarHeader, SidebarNav } from './sidebar-components'
import { Info, Zap } from 'lucide-react'
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import { QuickEventDialog } from '@/components/dialogs/QuickEventDialog'
import React from 'react'
import { useChatContext } from '@/contexts/ChatContext'
import { useLanguage } from '@/contexts/LanguageContext'
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
  const { t } = useLanguage()
  const { conversations, isLoadingConversations, selectedConversationId, isSearching, streamingTitleConversationId } =
    useChatContext()
  const {
    pathname,
    conversationToDelete,
    setConversationToDelete,
    isDeletingConversation,
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
        isLoading={isDeletingConversation}
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
          <SidebarHeader
            isOpen={isOpen}
            onClose={onClose}
            onToggle={onToggle}
            onNewChat={() => handleNewChat(onClose)}
          />

          <SidebarNav pathname={pathname} isOpen={isOpen} onClose={onClose} />

          {isOpen && (
            <TooltipProvider>
              <div className="px-4 mt-4">
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => setIsQuickEventOpen(true)}
                    variant="ghost"
                    className="flex-1 justify-start bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    <Zap className="w-5 h-5 mr-2 shrink-0" />
                    <span className="text-sm font-medium">{t('sidebar.quickAddEvent')}</span>
                  </Button>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        aria-label="More information"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[220px] bg-zinc-900 dark:bg-zinc-800 text-zinc-100 border-zinc-700">
                      <p className="text-xs leading-relaxed">{t('sidebar.quickAddEventDescription')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>
          )}

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
            />
          )}

          <QuickEventDialog
            isOpen={isQuickEventOpen}
            onClose={() => setIsQuickEventOpen(false)}
            onEventCreated={() => {}}
          />

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
