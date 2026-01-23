'use client'

import { Archive, Calendar, Loader2, MessageSquare, RotateCcw } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  useGetArchivedConversations,
  useRestoreAllArchivedConversations,
  useRestoreConversation,
} from '@/hooks/queries/conversations'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDate } from '@/lib/formatUtils'
import { formatRelativeDate } from '@/lib/dateUtils'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface ArchivedConversationsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ArchivedConversationsDialog({ isOpen, onClose }: ArchivedConversationsDialogProps) {
  const { t } = useTranslation()
  const {
    data: archivedData,
    isLoading,
    refetch,
  } = useGetArchivedConversations({
    enabled: isOpen,
  })

  const { restoreConversation, isRestoring } = useRestoreConversation({
    onSuccess: () => {
      toast.success(t('toast.conversationRestored'))
      refetch()
    },
    onError: (error) => {
      toast.error(t('toast.conversationRestoreFailed'), {
        description: error.message || 'An error occurred',
      })
    },
  })

  const { restoreAllArchivedConversations, isRestoring: isRestoringAll } = useRestoreAllArchivedConversations({
    onSuccess: () => {
      toast.success(t('toast.allConversationsRestored'))
      refetch()
      onClose()
    },
    onError: (error) => {
      toast.error(t('toast.conversationsRestoreFailed'), {
        description: error.message || 'An error occurred',
      })
    },
  })

  const conversations = archivedData?.conversations || []

  const handleRestoreConversation = (conversationId: string) => {
    restoreConversation(conversationId)
  }

  const handleRestoreAll = () => {
    restoreAllArchivedConversations()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Archived Conversations
          </DialogTitle>
          <DialogDescription>
            View and restore your archived conversations. Archived conversations are hidden from your main chat list.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {conversations.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {conversations.length} archived conversation{conversations.length !== 1 ? 's' : ''}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestoreAll}
                disabled={isRestoringAll}
                className="gap-2"
              >
                {isRestoringAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Restore All
              </Button>
            </div>
          )}

          <ScrollArea className="max-h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading archived conversations...</span>
              </div>
            ) : conversations.length === 0 ? (
              <EmptyState
                icon={<Archive className="h-12 w-12 text-muted-foreground" />}
                title="No archived conversations"
                description="You haven't archived any conversations yet. Conversations you archive will appear here."
              />
            ) : (
              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <h4 className="truncate font-medium">{conversation.title || 'Untitled Conversation'}</h4>
                        {conversation.pinned && (
                          <Badge variant="secondary" className="text-xs">
                            Pinned
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {conversation.messageCount} messages
                        </div>

                        {conversation.archivedAt && (
                          <div className="flex items-center gap-1">
                            <Archive className="h-3 w-3" />
                            Archived {formatRelativeDate(conversation.archivedAt)}
                          </div>
                        )}

                        {conversation.lastMessageAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last updated {formatRelativeDate(conversation.lastMessageAt)}
                          </div>
                        )}
                      </div>

                      {conversation.summary && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{conversation.summary}</p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreConversation(conversation.id)}
                      disabled={isRestoring}
                      className="ml-4 flex-shrink-0 gap-2"
                    >
                      {isRestoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
