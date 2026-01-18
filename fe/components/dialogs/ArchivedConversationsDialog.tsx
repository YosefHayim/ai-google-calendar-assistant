'use client'

import { Archive, Calendar, Loader2, MessageSquare, RotateCcw } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGetArchivedConversations, useRestoreAllArchivedConversations, useRestoreConversation } from '@/hooks/queries/conversations'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDate } from '@/lib/formatUtils'
import { toast } from 'sonner'

interface ArchivedConversationsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ArchivedConversationsDialog({ isOpen, onClose }: ArchivedConversationsDialogProps) {
  const { data: archivedData, isLoading, refetch } = useGetArchivedConversations({
    enabled: isOpen,
  })

  const { restoreConversation, isRestoring } = useRestoreConversation({
    onSuccess: () => {
      toast.success('Conversation restored successfully')
      refetch()
    },
    onError: (error) => {
      toast.error('Failed to restore conversation', {
        description: error.message || 'An error occurred',
      })
    },
  })

  const { restoreAllArchivedConversations, isRestoring: isRestoringAll } = useRestoreAllArchivedConversations({
    onSuccess: () => {
      toast.success('All archived conversations restored successfully')
      refetch()
      onClose()
    },
    onError: (error) => {
      toast.error('Failed to restore conversations', {
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
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Archived Conversations
          </DialogTitle>
          <DialogDescription>
            View and restore your archived conversations. Archived conversations are hidden from your main chat list.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {conversations.length > 0 && (
            <div className="flex justify-between items-center">
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
                {isRestoringAll ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Restore All
              </Button>
            </div>
          )}

          <ScrollArea className="max-h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading archived conversations...</span>
              </div>
            ) : conversations.length === 0 ? (
              <EmptyState
                icon={<Archive className="w-12 h-12 text-muted-foreground" />}
                title="No archived conversations"
                description="You haven't archived any conversations yet. Conversations you archive will appear here."
              />
            ) : (
              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <h4 className="font-medium truncate">
                          {conversation.title || 'Untitled Conversation'}
                        </h4>
                        {conversation.pinned && (
                          <Badge variant="secondary" className="text-xs">
                            Pinned
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {conversation.messageCount} messages
                        </div>

                        {conversation.archivedAt && (
                          <div className="flex items-center gap-1">
                            <Archive className="w-3 h-3" />
                            Archived {formatDate(conversation.archivedAt, 'RELATIVE')}
                          </div>
                        )}

                        {conversation.lastMessageAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Last updated {formatDate(conversation.lastMessageAt, 'RELATIVE')}
                          </div>
                        )}
                      </div>

                      {conversation.summary && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {conversation.summary}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreConversation(conversation.id)}
                      disabled={isRestoring}
                      className="ml-4 gap-2 flex-shrink-0"
                    >
                      {isRestoring ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
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