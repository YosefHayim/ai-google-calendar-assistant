'use client'

import * as z from 'zod'

import {
  Archive,
  Check,
  Clock,
  Copy,
  Link as LinkIcon,
  MessageSquare,
  Pencil,
  Pin,
  Search,
  Trash2,
  X,
  MoreHorizontal,
} from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import React, { useEffect, useRef, useState } from 'react'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, useSidebar } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { StreamingTitle } from '../../sidebar-components/StreamingTitle'
import { ArchiveConfirmDialog } from '../../sidebar-components/ArchiveConfirmDialog'
import { createShareLink, toggleConversationPinned, type ConversationListItem } from '@/services/chat-service'
import { formatRelativeDate } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useChatContext } from '@/contexts/ChatContext'
import { useForm } from 'react-hook-form'
import { useSidebarContext } from '@/contexts/SidebarContext'
import { useUpdateConversationTitle } from '@/hooks/queries/conversations'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
})

export function ConversationListSection() {
  const { t } = useTranslation()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const { conversations, isLoadingConversations, selectedConversationId, isSearching, streamingTitleConversationId } =
    useChatContext()
  const {
    localSearchValue,
    handleSearchChange,
    handleClearSearch,
    handleSelectConversation,
    initiateDelete,
    initiateArchive,
    conversationToArchive,
    setConversationToArchive,
    isArchivingConversation,
    confirmArchive,
  } = useSidebarContext()

  const [sharingId, setSharingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [conversationToChangeTitleDialog, setConversationToChangeTitleDialog] = useState<ConversationListItem | null>(
    null,
  )
  const [pinningId, setPinningId] = useState<string | null>(null)

  const { updateConversationTitle: updateTitle, isUpdating } = useUpdateConversationTitle({
    onSuccess: () => {
      toast.success(t('toast.titleUpdated'))
      setConversationToChangeTitleDialog(null)
    },
    onError: (error) => {
      console.error('Failed to update title:', error)
      toast.error(t('toast.titleUpdateFailed'))
    },
  })

  const copiedTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  })

  // Sync form value when dialog opens
  useEffect(() => {
    if (conversationToChangeTitleDialog) {
      form.reset({ title: conversationToChangeTitleDialog.title })
    }
  }, [conversationToChangeTitleDialog, form])

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
        toast.success(t('toast.shareLinkCopied'), {
          description: 'Link expires in 7 days',
        })
        if (copiedTimeoutRef.current) {
          clearTimeout(copiedTimeoutRef.current)
        }
        copiedTimeoutRef.current = setTimeout(() => setCopiedId(null), 2000)
      } else {
        toast.error(t('toast.shareLinkCreateFailed'))
      }
    } catch (error) {
      console.error('Share failed:', error)
      toast.error('Failed to create share link')
    } finally {
      setSharingId(null)
    }
  }

  const handleChangeConversationTitle = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    const conversation = conversations.find((c) => c.id === conversationId)
    if (conversation) {
      setConversationToChangeTitleDialog(conversation)
    }
  }

  const handleTogglePin = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    setPinningId(conversationId)

    try {
      const result = await toggleConversationPinned(conversationId)
      if (result.success) {
        toast.success(result.pinned ? t('toast.conversationPinned') : t('toast.conversationUnpinned'))
      } else {
        toast.error(t('toast.conversationPinFailed'))
      }
    } catch (error) {
      console.error('Error toggling conversation pin:', error)
      toast.error(t('toast.conversationPinFailed'))
    } finally {
      setPinningId(null)
    }
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!conversationToChangeTitleDialog) return

    updateTitle({
      conversationId: conversationToChangeTitleDialog.id,
      title: values.title,
    })
  }

  const handleConversationClick = (conversation: ConversationListItem) => {
    handleSelectConversation(conversation, () => {
      if (isMobile) setOpenMobile(false)
    })
  }

  return (
    <SidebarGroup className="flex-1 overflow-hidden">
      <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Recent Chats
      </SidebarGroupLabel>
      <div className="relative mb-2 px-2">
        <Search className="absolute left-5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={localSearchValue}
          onChange={handleSearchChange}
          placeholder="Search conversations..."
          className="h-8 w-full border-0 bg-secondary pl-9 pr-8"
        />
        {localSearchValue && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <SidebarGroupContent className="flex-1 overflow-y-auto">
        {isLoadingConversations || isSearching ? (
          <div className="space-y-2 px-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-secondary" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-2 py-4 text-center text-muted-foreground">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
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
                  className={cn(
                    'group w-full cursor-pointer rounded-md p-2 text-left transition-colors',
                    selectedConversationId === conversation.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                        {conversation.pinned && <Pin className="h-3 w-3 shrink-0 fill-current text-muted-foreground" />}
                        <StreamingTitle
                          title={conversation.title}
                          isStreaming={streamingTitleConversationId === conversation.id}
                        />
                      </p>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeDate(conversation.lastUpdated)}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-6 w-6 text-muted-foreground hover:text-foreground',
                            conversation.pinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                          )}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => handleTogglePin(e, conversation.id)}
                          disabled={pinningId === conversation.id}
                          className="cursor-pointer"
                        >
                          <Pin className={cn('mr-2 h-4 w-4', conversation.pinned && 'fill-current')} />
                          {conversation.pinned ? 'Unpin' : 'Pin'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleShare(e, conversation.id)}
                          disabled={sharingId === conversation.id}
                          className="cursor-pointer"
                        >
                          {copiedId === conversation.id ? (
                            <Check className="mr-2 h-4 w-4 text-primary" />
                          ) : sharingId === conversation.id ? (
                            <Copy className="mr-2 h-4 w-4 animate-pulse" />
                          ) : (
                            <LinkIcon className="mr-2 h-4 w-4" />
                          )}
                          {copiedId === conversation.id ? 'Link copied!' : 'Share'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleChangeConversationTitle(e, conversation.id)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => initiateArchive(e, conversation.id)}
                          className="cursor-pointer"
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => initiateDelete(e, conversation.id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>
        )}
      </SidebarGroupContent>

      <Dialog
        open={!!conversationToChangeTitleDialog}
        onOpenChange={(open) => {
          if (!open) {
            setConversationToChangeTitleDialog(null)
            form.reset()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="py-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="New title..." autoFocus disabled={isUpdating} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConversationToChangeTitleDialog(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ArchiveConfirmDialog
        isOpen={!!conversationToArchive}
        onClose={() => setConversationToArchive?.(null)}
        onConfirm={confirmArchive}
        isLoading={isArchivingConversation}
      />
    </SidebarGroup>
  )
}
