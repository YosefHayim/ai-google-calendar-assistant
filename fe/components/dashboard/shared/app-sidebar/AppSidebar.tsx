'use client'

import React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { SidebarProvider as ChatSidebarProvider, useSidebarContext } from '@/contexts/SidebarContext'
import { DeleteConfirmDialog } from '../sidebar-components/DeleteConfirmDialog'

import type { AppSidebarProps } from './types'
import { NavSection } from './components/NavSection'
import { ConversationListSection } from './components/ConversationListSection'
import { UserFooter } from './components/UserFooter'
import { SidebarHeaderSection } from './components/SidebarHeaderSection'

function AppSidebarContent({ onOpenSettings, onSignOut }: AppSidebarProps) {
  const {
    conversationToDelete,
    setConversationToDelete,
    isDeletingConversation,
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

      <Sidebar id="tour-sidebar" collapsible="icon">
        <SidebarHeaderSection />
        <SidebarContent>
          <NavSection />
          <ConversationListSection />
        </SidebarContent>
        <UserFooter onOpenSettings={onOpenSettings} onSignOut={onSignOut} />
        <SidebarRail />
      </Sidebar>
    </>
  )
}

export function AppSidebar(props: AppSidebarProps) {
  return (
    <ChatSidebarProvider>
      <AppSidebarContent {...props} />
    </ChatSidebarProvider>
  )
}

export { useSidebar }
