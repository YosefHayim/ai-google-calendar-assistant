'use client'

import { Archive, Check, Clock, Copy, Link, MessageSquare, MoreHorizontal, Search, Trash2, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import React, { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import type { ConversationListItem } from '@/services/chat-service'
import { Input } from '@/components/ui/input'
import { StreamingTitle } from './StreamingTitle'
import { createShareLink } from '@/services/chat-service'
import { formatRelativeDate } from '@/lib/dateUtils'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

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
  onInitiateArchive: (e: React.MouseEvent, id: string) => void
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
  onInitiateArchive,
}) => {
  const { t } = useTranslation()
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
        toast.success(t('toast.shareLinkCopied'), {
          description: 'Link expires in 7 days',
        })
        setTimeout(() => setCopiedId(null), 2000)
      } else {
        toast.error(t('toast.shareLinkCreateFailed'))
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
        <p className="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
          Recent Chats
        </p>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={(e) => handleShare(e, conversation.id)}
                      disabled={sharingId === conversation.id}
                      className="cursor-pointer"
                    >
                      {copiedId === conversation.id ? (
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                      ) : sharingId === conversation.id ? (
                        <Copy className="w-4 h-4 mr-2 animate-pulse" />
                      ) : (
                        <Link className="w-4 h-4 mr-2" />
                      )}
                      {copiedId === conversation.id ? 'Link copied!' : 'Share conversation'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => onInitiateArchive(e, conversation.id)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive conversation
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => onInitiateDelete(e, conversation.id)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ConversationList
