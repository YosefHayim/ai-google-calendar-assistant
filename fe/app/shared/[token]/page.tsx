'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { MessageSquare, Calendar, Clock, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getSharedConversation, type SharedConversation, type ChatMessage } from '@/services/chatService'
import { formatRelativeDate } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

function MessageBubble({ message, isUser }: { message: ChatMessage; isUser: boolean }) {
  return (
    <div className={cn('flex gap-3 mb-4', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md',
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading shared conversation...</p>
        </div>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Conversation Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Go to homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">{conversation.title}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatRelativeDate(conversation.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {conversation.messageCount} messages
                  </span>
                </div>
              </div>
            </div>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Try Ask Ally
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-2">
          {conversation.messages.map((message, index) => (
            <MessageBubble key={index} message={message} isUser={message.role === 'user'} />
          ))}
        </div>

        {conversation.expiresAt && (
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            This shared link expires on {new Date(conversation.expiresAt).toLocaleDateString()}
          </div>
        )}
      </main>

      <footer className="border-t py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Shared via{' '}
            <Link href="/" className="text-primary hover:underline">
              Ask Ally
            </Link>{' '}
            - AI-powered calendar assistant
          </p>
        </div>
      </footer>
    </div>
  )
}
