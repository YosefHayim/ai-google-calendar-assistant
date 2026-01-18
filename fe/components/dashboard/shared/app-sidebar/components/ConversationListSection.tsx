'use client'

import * as z from 'zod'

import { Check, Clock, Copy, Link as LinkIcon, MessageSquare, Pencil, Pin, Search, Trash2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import React, { useEffect, useRef, useState } from 'react'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StreamingTitle } from '../../sidebar-components/StreamingTitle'
import { createShareLink, toggleConversationPinned, type ConversationListItem } from '@/services/chatService'
import { formatRelativeDate } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useChatContext } from '@/contexts/ChatContext'
import { useForm } from 'react-hook-form'
import { useSidebarContext } from '@/contexts/SidebarContext'
import { useUpdateConversationTitle } from '@/hooks/queries/conversations'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
})

export function ConversationListSection() {
  const { state, isMobile, setOpenMobile } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const { conversations, isLoadingConversations, selectedConversationId, isSearching, streamingTitleConversationId } =
    useChatContext()
  const { localSearchValue, handleSearchChange, handleClearSearch, handleSelectConversation, initiateDelete } =
    useSidebarContext()

  const [sharingId, setSharingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [conversationToChangeTitleDialog, setConversationToChangeTitleDialog] = useState<ConversationListItem | null>(
    null,
  )
  const [pinningId, setPinningId] = useState<string | null>(null)

  const { updateConversationTitle: updateTitle, isUpdating } = useUpdateConversationTitle({
    onSuccess: () => {
      toast.success('Title updated successfully')
      setConversationToChangeTitleDialog(null)
    },
    onError: (error) => {
      console.error('Failed to update title:', error)
      toast.error('Failed to update title')
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
        toast.success(`Conversation ${result.pinned ? 'pinned' : 'unpinned'} successfully`)
      } else {
        toast.error('Failed to toggle conversation pin status')
      }
    } catch (error) {
      console.error('Error toggling conversation pin:', error)
      toast.error('Failed to toggle conversation pin status')
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
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Recent Chats
      </SidebarGroupLabel>
      <div className="relative px-2 mb-2">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <Input
          type="text"
          value={localSearchValue}
          onChange={handleSearchChange}
          placeholder="Search conversations..."
          className="w-full pl-9 pr-8 bg-secondary border-0 h-8"
        />
        {localSearchValue && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <SidebarGroupContent className="overflow-y-auto flex-1">
        {isLoadingConversations || isSearching ? (
          <div className="space-y-2 px-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-secondary rounded-md" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground px-2">
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
                  className={cn(
                    'w-full text-left p-2 rounded-md transition-colors group cursor-pointer',
                    selectedConversationId === conversation.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
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
                    <div className="flex items-center gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleTogglePin(e, conversation.id)}
                            disabled={pinningId === conversation.id}
                            className={cn(
                              'h-6 w-6 hover:bg-accent text-muted-foreground hover:text-primary',
                              conversation.pinned
                                ? 'opacity-100 text-primary'
                                : 'opacity-0 group-hover:opacity-100'
                            )}
                          >
                            <Pin className={cn('w-3 h-3', conversation.pinned && 'fill-current')} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">{conversation.pinned ? 'Unpin' : 'Pin'}</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleShare(e, conversation.id)}
                            disabled={sharingId === conversation.id}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-accent text-muted-foreground hover:text-primary"
                          >
                            {copiedId === conversation.id ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : sharingId === conversation.id ? (
                              <Copy className="w-3 h-3 animate-pulse" />
                            ) : (
                              <LinkIcon className="w-3 h-3" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Share</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleChangeConversationTitle(e, conversation.id)}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-accent text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Rename</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => initiateDelete(e, conversation.id)}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Delete</TooltipContent>
                      </Tooltip>
                    </div>
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
    </SidebarGroup>
  )
}
