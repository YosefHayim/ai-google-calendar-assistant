'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowRight, Clock, History, MessageSquare, RefreshCw, Search, Trash2, X } from 'lucide-react'
import { useGetConversations } from '@/hooks/queries/conversations/useGetConversations'
import { useDeleteConversationById } from '@/hooks/queries/conversations/useDeleteConversationById'
import { useDeleteAllConversations } from '@/hooks/queries/conversations/useDeleteAllConversations'
import { useChatContext } from '@/contexts/ChatContext'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import type { ConversationListItem } from '@/services/chatService'

function ConversationCard({
  conversation,
  onSelect,
  onDelete,
  isDeleting,
}: {
  conversation: ConversationListItem
  onSelect: () => void
  onDelete: () => void
  isDeleting: boolean
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg group hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
      <button onClick={onSelect} className="flex items-start gap-4 flex-1 text-left min-w-0">
        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {conversation.title || 'Untitled Conversation'}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(conversation.lastUpdated), { addSuffix: true })}
            </span>
            <Badge variant="outline" className="text-xs">
              {conversation.messageCount} messages
            </Badge>
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" onClick={onSelect}>
          <ArrowRight className="w-4 h-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this conversation and all its messages. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default function ActivityPage() {
  const router = useRouter()
  const { selectConversation } = useChatContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { conversations, isLoading, isError, refetch } = useGetConversations()

  const { deleteConversation } = useDeleteConversationById({
    onSuccess: () => {
      toast.success('Conversation deleted')
      setDeletingId(null)
      refetch()
    },
    onError: () => {
      toast.error('Failed to delete conversation')
      setDeletingId(null)
    },
  })

  const { deleteAll: deleteAllConversations, isDeleting: isDeletingAll } = useDeleteAllConversations({
    onSuccess: () => {
      toast.success('All conversations deleted')
      refetch()
    },
    onError: () => {
      toast.error('Failed to delete conversations')
    },
  })

  const filteredConversations = conversations.filter((conv) =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSelectConversation = (conversation: ConversationListItem) => {
    selectConversation(conversation)
    router.push('/dashboard')
  }

  const handleDeleteConversation = (conversationId: string) => {
    setDeletingId(conversationId)
    deleteConversation(conversationId)
  }

  const groupedConversations = filteredConversations.reduce<Record<string, ConversationListItem[]>>((groups, conv) => {
    const date = new Date(conv.lastUpdated)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let groupKey: string
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday'
    } else if (date > new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)) {
      groupKey = 'This Week'
    } else if (date > new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())) {
      groupKey = 'This Month'
    } else {
      groupKey = format(date, 'MMMM yyyy')
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(conv)
    return groups
  }, {})

  return (
    <div className="flex-1 h-full overflow-auto">
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <header className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <History className="w-6 h-6 text-purple-500" />
              </div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Activity History</h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">View and manage your past conversations with Ally.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {conversations.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Conversations?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {conversations.length} conversations and their messages. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteAllConversations()}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isDeletingAll}
                    >
                      {isDeletingAll ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </header>

        {conversations.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <Card className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <Skeleton className="w-9 h-9 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : isError ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <p className="text-red-500 font-medium mb-2">Failed to load conversations</p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          </Card>
        ) : conversations.length === 0 ? (
          <Card className="p-6">
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400 mb-4">No conversations yet</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
                Start chatting with Ally to see your conversation history here
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Start a Conversation
              </Button>
            </div>
          </Card>
        ) : filteredConversations.length === 0 ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <Search className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400">No conversations match "{searchQuery}"</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedConversations).map(([group, convs]) => (
              <Card key={group} className="p-6">
                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
                  {group}
                </h2>
                <div className="space-y-2">
                  {convs.map((conv) => (
                    <ConversationCard
                      key={conv.id}
                      conversation={conv}
                      onSelect={() => handleSelectConversation(conv)}
                      onDelete={() => handleDeleteConversation(conv.id)}
                      isDeleting={deletingId === conv.id}
                    />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredConversations.length > 0 && (
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            Showing {filteredConversations.length} of {conversations.length} conversations
          </p>
        )}
      </div>
    </div>
  )
}
