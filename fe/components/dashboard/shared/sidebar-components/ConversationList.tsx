'use client'

import React, { useState } from 'react'
import { Check, Clock, Copy, Link, MessageSquare, Search, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatRelativeDate } from '@/lib/dateUtils'
import type { ConversationListItem } from '@/services/chatService'
import { createShareLink } from '@/services/chatService'
import { StreamingTitle } from './StreamingTitle'
import { toast } from 'sonner'

interface ConversationListProps {
  conversations: ConversationListItem[]
  selectedConversationId: string | null
  streamingTitleConversationId: string | null
  isLoading: boolean
  isSearching: boolean
  localSearchValue: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearSearch: () => void
  onSelectConversation: (conversation: ConversationListItem) => void
  onInitiateDelete: (e: React.MouseEvent, id: string) => void
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  streamingTitleConversationId,
  isLoading,
  isSearching,
  localSearchValue,
  onSearchChange,
  onClearSearch,
  onSelectConversation,
  onInitiateDelete,
}) => {
  const [sharingId, setSharingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
        setTimeout(() => setCopiedId(null), 2000)
      } else {
        toast.error('Failed to create share link')
      }
    } catch {
      toast.error('Failed to create share link')
    } finally {
      setSharingId(null)
    }
  }

  return (
    <div className="flex-1 mt-4 px-4 overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between mb-2 px-2">
        <p className="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">Recent Chats</p>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <Input
          type="text"
          value={localSearchValue}
          onChange={onSearchChange}
          placeholder="Search conversations..."
          className="w-full pl-9 pr-8 bg-secondary dark:bg-secondary border-0"
        />
        {localSearchValue && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isLoading || isSearching ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse h-12 bg-secondary dark:bg-secondary rounded-md" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground dark:text-muted-foreground">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">{localSearchValue ? 'No matching conversations' : 'No conversations yet'}</p>
        </div>
      ) : (
        <div className="space-y-1 flex-1 overflow-y-auto">
          {conversations.slice(0, 15).map((conversation) => (
            <div
              key={conversation.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectConversation(conversation)}
              onKeyDown={(e) => e.key === 'Enter' && onSelectConversation(conversation)}
              className={`w-full text-left p-2 rounded-md transition-colors group cursor-pointer ${
                selectedConversationId === conversation.id
                  ? 'bg-secondary dark:bg-secondary'
                  : 'hover:bg-muted dark:hover:bg-secondary/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground dark:text-primary-foreground truncate">
                    <StreamingTitle
                      title={conversation.title}
                      isStreaming={streamingTitleConversationId === conversation.id}
                    />
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeDate(conversation.lastUpdated)}</span>
                  </div>
                </div>
                <TooltipProvider>
                  <div className="flex items-center gap-0.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleShare(e, conversation.id)}
                          disabled={sharingId === conversation.id}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-primary/10 dark:hover:bg-blue-900/30 text-muted-foreground hover:text-primary"
                        >
                          {copiedId === conversation.id ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : sharingId === conversation.id ? (
                            <Copy className="w-3 h-3 animate-pulse" />
                          ) : (
                            <Link className="w-3 h-3" />
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
                          onClick={(e) => onInitiateDelete(e, conversation.id)}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 dark:hover:bg-red-900/30 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Delete conversation</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ConversationList
