'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Clock, AlertCircle, Sparkles, ArrowRight, User, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { getSharedConversation, type SharedConversation, type ChatMessage } from '@/services/chat-service'
import { formatRelativeDate } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'
import { AllyLogo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

function AllyAvatar() {
  return (
    <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/25">
      <AllyLogo className="w-4 h-4 sm:w-5 sm:h-5" />
    </div>
  )
}

function UserAvatar() {
  return (
    <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent dark:bg-secondary flex items-center justify-center">
      <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground dark:text-muted-foreground" />
    </div>
  )
}

function MessageBubble({ message, isUser, isFirst }: { message: ChatMessage; isUser: boolean; isFirst: boolean }) {
  return (
    <div
      className={cn('flex gap-2.5 sm:gap-3 animate-fade-in', isUser ? 'flex-row-reverse' : 'flex-row')}
      style={{ animationDelay: `${isFirst ? 0 : 50}ms` }}
    >
      {isUser ? <UserAvatar /> : <AllyAvatar />}
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5',
          isUser
            ? 'bg-primary text-white rounded-tr-md shadow-md shadow-primary/10'
            : 'bg-secondary dark:bg-secondary/80 text-foreground dark:text-primary-foreground rounded-tl-md border/50 -zinc-700/50',
        )}
      >
        <p className="text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-orange-400 flex items-center justify-center shadow-xl shadow-primary/30">
            <AllyLogo className="w-8 h-8" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-foreground dark:text-primary-foreground">Loading conversation</p>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">Just a moment...</p>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-destructive/5 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6 border-red-100 -red-900/30">
          <AlertCircle className="w-10 h-10 text-destructive dark:text-red-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground dark:text-primary-foreground mb-3">
          Conversation Not Found
        </h1>
        <p className="text-muted-foreground dark:text-muted-foreground mb-8 text-base sm:text-lg leading-relaxed">
          {error}
        </p>
        <Button
          asChild
          size="lg"
          className="gap-2 h-12 px-6 text-base font-medium rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
        >
          <Link href="/">
            Try Ask Ally
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function SharedConversationPage() {
  const params = useParams()
  const token = params?.token as string
  const [conversation, setConversation] = useState<SharedConversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadConversation() {
      if (!token) return

      setIsLoading(true)
      setError(null)

      try {
        const data = await getSharedConversation(token)
        if (data) {
          setConversation(data)
        } else {
          setError('This shared conversation is no longer available or the link has expired.')
        }
      } catch {
        setError('Failed to load the shared conversation.')
      } finally {
        setIsLoading(false)
      }
    }

    loadConversation()
  }, [token])

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !conversation) {
    return <ErrorState error={error || 'Something went wrong.'} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col">
      <div className="fixed inset-0 pointer-events-none grid-background opacity-50" />

      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/80 dark:bg-secondary/80 border-b border/80 /80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-orange-400 flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all group-hover:scale-105">
                <AllyLogo className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="font-semibold text-lg sm:text-xl text-foreground dark:text-primary-foreground hidden sm:block">
                Ask Ally
              </span>
            </Link>

            <div className="flex-1 min-w-0 sm:hidden">
              <h1 className="font-medium text-sm text-foreground dark:text-primary-foreground truncate">
                {conversation.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
                <span>{conversation.messageCount} msgs</span>
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                <span>{formatRelativeDate(conversation.createdAt)}</span>
                {conversation.expiresAt && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-600">•</span>
                    <span className="text-muted-foreground dark:text-muted-foreground">
                      Exp{' '}
                      {new Date(conversation.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </>
                )}
              </div>
            </div>

            <Button
              asChild
              size="sm"
              className="gap-1.5 h-9 sm:h-10 px-3 sm:px-4 text-sm font-medium rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all flex-shrink-0"
            >
              <Link href="/">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Try Ask Ally</span>
                <span className="sm:hidden">Try</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="hidden sm:block max-w-3xl mx-auto w-full px-4 sm:px-6 pt-6 pb-2">
        <div className="bg-background dark:bg-secondary rounded-2xl p-5 shadow-sm">
          <h1 className="font-semibold text-xl text-foreground dark:text-primary-foreground mb-2">
            {conversation.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground dark:text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatRelativeDate(conversation.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {conversation.messageCount} messages
            </span>
            {conversation.expiresAt && (
              <span className="flex items-center gap-1.5 text-muted-foreground dark:text-muted-foreground">
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                Expires{' '}
                {new Date(conversation.expiresAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 relative">
        {conversation.messages.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              icon={<MessageCircle />}
              title="No messages yet"
              description="This conversation doesn't have any messages to display."
              size="lg"
            />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {conversation.messages.map((message, index) => (
              <MessageBubble key={index} message={message} isUser={message.role === 'user'} isFirst={index === 0} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border/80 /80 bg-background/50 dark:bg-secondary/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary via-primary to-orange-400 flex items-center justify-center shadow-md shadow-primary/20">
                <AllyLogo className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-zinc-600 dark:text-muted-foreground">Powered by Ask Ally</span>
            </div>

            <span className="hidden sm:block text-zinc-300 dark:text-zinc-700">|</span>

            <p className="text-sm text-muted-foreground dark:text-muted-foreground text-center">
              Your AI-powered calendar assistant.{' '}
              <Link
                href="/"
                className="font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
              >
                Get started free
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
