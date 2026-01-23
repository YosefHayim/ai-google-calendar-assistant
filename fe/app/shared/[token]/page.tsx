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
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-orange-400 shadow-lg shadow-primary/25 sm:h-9 sm:w-9">
      <AllyLogo className="h-4 w-4 sm:h-5 sm:w-5" />
    </div>
  )
}

function UserAvatar() {
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-accent dark:bg-secondary sm:h-9 sm:w-9">
      <User className="h-4 w-4 text-muted-foreground dark:text-muted-foreground sm:h-5 sm:w-5" />
    </div>
  )
}

function MessageBubble({ message, isUser, isFirst }: { message: ChatMessage; isUser: boolean; isFirst: boolean }) {
  return (
    <div
      className={cn('flex animate-fade-in gap-2.5 sm:gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
      style={{ animationDelay: `${isFirst ? 0 : 50}ms` }}
    >
      {isUser ? <UserAvatar /> : <AllyAvatar />}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] sm:px-5 sm:py-3.5 lg:max-w-[70%]',
          isUser
            ? 'rounded-tr-md bg-primary text-white shadow-md shadow-primary/10'
            : 'border/50 -zinc-700/50 rounded-tl-md bg-secondary text-foreground dark:bg-secondary/80 dark:text-primary-foreground',
        )}
      >
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed sm:text-base">{message.content}</p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white p-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-orange-400 shadow-xl shadow-primary/30">
            <AllyLogo className="h-8 w-8" />
          </div>
          <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-foreground dark:text-primary-foreground">Loading conversation</p>
          <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">Just a moment...</p>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white p-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md text-center">
        <div className="-red-900/30 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-red-100 bg-destructive/5 dark:bg-red-900/20">
          <AlertCircle className="h-10 w-10 text-destructive dark:text-red-400" />
        </div>
        <h1 className="mb-3 text-2xl font-semibold text-foreground dark:text-primary-foreground sm:text-3xl">
          Conversation Not Found
        </h1>
        <p className="mb-8 text-base leading-relaxed text-muted-foreground dark:text-muted-foreground sm:text-lg">
          {error}
        </p>
        <Button
          asChild
          size="lg"
          className="h-12 gap-2 rounded-xl px-6 text-base font-medium shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          <Link href="/">
            Try Ask Ally
            <ArrowRight className="h-4 w-4" />
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="grid-background pointer-events-none fixed inset-0 opacity-50" />

      <header className="border/80 /80 sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl dark:bg-secondary/80">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="group flex flex-shrink-0 items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-orange-400 shadow-md shadow-primary/20 transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30 sm:h-10 sm:w-10">
                <AllyLogo className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="hidden text-lg font-semibold text-foreground dark:text-primary-foreground sm:block sm:text-xl">
                Ask Ally
              </span>
            </Link>

            <div className="min-w-0 flex-1 sm:hidden">
              <h1 className="truncate text-sm font-medium text-foreground dark:text-primary-foreground">
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
              className="h-9 flex-shrink-0 gap-1.5 rounded-xl px-3 text-sm font-medium shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25 sm:h-10 sm:px-4"
            >
              <Link href="/">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Try Ask Ally</span>
                <span className="sm:hidden">Try</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto hidden w-full max-w-3xl px-4 pb-2 pt-6 sm:block sm:px-6">
        <div className="rounded-2xl bg-background p-5 shadow-sm dark:bg-secondary">
          <h1 className="mb-2 text-xl font-semibold text-foreground dark:text-primary-foreground">
            {conversation.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground dark:text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatRelativeDate(conversation.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
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

      <main className="relative mx-auto w-full max-w-3xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
        {conversation.messages.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center">
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

      <footer className="border/80 /80 border-t bg-background/50 backdrop-blur-sm dark:bg-secondary/50">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary to-orange-400 shadow-md shadow-primary/20">
                <AllyLogo className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-zinc-600 dark:text-muted-foreground">Powered by Ask Ally</span>
            </div>

            <span className="hidden text-zinc-300 dark:text-zinc-700 sm:block">|</span>

            <p className="text-center text-sm text-muted-foreground dark:text-muted-foreground">
              Your AI-powered calendar assistant.{' '}
              <Link
                href="/"
                className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
              >
                Get started free
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
