'use client'

import React, { useEffect, useRef } from 'react'
import { Check, Clock, Copy, Link as LinkIcon, MessageSquare, Search, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { useChatContext } from '@/contexts/ChatContext'
import { useSidebarContext } from '@/contexts/SidebarContext'
import { formatRelativeDate } from '@/lib/dateUtils'
import type { ConversationListItem } from '@/services/chatService'
import { createShareLink } from '@/services/chatService'
import { StreamingTitle } from '../../sidebar-components/StreamingTitle'

export function ConversationListSection() {
  const { state, isMobile, setOpenMobile } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const { conversations, isLoadingConversations, selectedConversationId, isSearching, streamingTitleConversationId } =
    useChatContext()
  const { localSearchValue, handleSearchChange, handleClearSearch, handleSelectConversation, initiateDelete } =
    useSidebarContext()

  const [sharingId, setSharingId] = React.useState<string | null>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const copiedTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current)
      }
    }
  }, [])

  if (isCollapsed) return null

  const handleShare = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    setSharingId(conversationId)

    try {
      const result = await createShareLink(conversationId)
      if (result) {
        const shareUrl = `${window.location.origin}/shared/${result.token}`
        await navigator.clipboard.writeText(shareUrl)
        setCopiedId(conversationId)
        toast.success('Share link copied to clipboard', {
          description: 'Link expires in 7 days',
        })
        if (copiedTimeoutRef.current) {
          clearTimeout(copiedTimeoutRef.current)
        }
        copiedTimeoutRef.current = setTimeout(() => setCopiedId(null), 2000)
      } else {
        toast.error('Failed to create share link')
      }
    } catch (error) {
      console.error('Share failed:', error)
      toast.error('Failed to create share link')
    } finally {
      setSharingId(null)
    }
  }

  const handleConversationClick = (conversation: ConversationListItem) => {
    handleSelectConversation(conversation, () => {
      if (isMobile) setOpenMobile(false)
    })
  }

  return (
    <SidebarGroup className="flex-1 overflow-hidden">
      <SidebarGroupLabel className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        Recent Chats
      </SidebarGroupLabel>
      <div className="relative px-2 mb-2">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
        <Input
          type="text"
          value={localSearchValue}
          onChange={handleSearchChange}
          placeholder="Search conversations..."
          className="w-full pl-9 pr-8 bg-zinc-100 dark:bg-zinc-800 border-0 h-8"
        />
        {localSearchValue && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-400"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <SidebarGroupContent className="overflow-y-auto flex-1">
        {isLoadingConversations || isSearching ? (
          <div className="space-y-2 px-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-4 text-zinc-400 dark:text-zinc-500 px-2">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">{localSearchValue ? 'No matching conversations' : 'No conversations yet'}</p>
          </div>
        ) : (
          <TooltipProvider>
            <div className="space-y-1 px-2">
              {conversations.slice(0, 15).map((conversation) => (
                <div
                  key={conversation.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleConversationClick(conversation)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConversationClick(conversation)}
                  className={`w-full text-left p-2 rounded-md transition-colors group cursor-pointer ${
                    selectedConversationId === conversation.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        <StreamingTitle
                          title={conversation.title}
                          isStreaming={streamingTitleConversationId === conversation.id}
                        />
                      </p>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-zinc-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeDate(conversation.lastUpdated)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleShare(e, conversation.id)}
                            disabled={sharingId === conversation.id}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-zinc-400 hover:text-blue-500"
                          >
                            {copiedId === conversation.id ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : sharingId === conversation.id ? (
                              <Copy className="w-3 h-3 animate-pulse" />
                            ) : (
                              <LinkIcon className="w-3 h-3" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Share conversation</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => initiateDelete(e, conversation.id)}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Delete conversation</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
