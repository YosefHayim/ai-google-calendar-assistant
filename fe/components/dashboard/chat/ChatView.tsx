'use client'

import { MessageSquare, Sparkles } from 'lucide-react'

import { ChatError } from './ChatError'
import { EditableMessage } from './EditableMessage'
import { EmptyState } from '@/components/ui/empty-state'
import { Message } from '@/types'
import { MessageActions } from './MessageActions'
import React from 'react'
import { StreamingMessage } from './StreamingMessage'
import { cn } from '@/lib/utils'
import { useMessageEdit } from '@/hooks/useMessageEdit'
import { useAuthContext } from '@/contexts/AuthContext'

interface ChatViewProps {
  messages: Message[]
  isLoading: boolean
  error: string | null
  isSpeaking: boolean
  speakingMessageId: string | null
  onResend: (text: string) => void
  onEditAndResend: (messageId: string, newText: string) => void
  onSpeak: (text: string, messageId?: string) => void
  scrollRef: React.RefObject<HTMLDivElement | null>
  streamingText?: string
  currentTool?: string | null
}

function AssistantAvatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
      <Sparkles className="h-[18px] w-[18px] text-primary-foreground" />
    </div>
  )
}

function UserAvatar({ name }: { name?: string }) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
      <span className="text-xs font-semibold text-foreground">{initials}</span>
    </div>
  )
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  error,
  isSpeaking,
  speakingMessageId,
  onResend,
  onEditAndResend,
  onSpeak,
  scrollRef,
  streamingText = '',
  currentTool = null,
}) => {
  const { editingMessageId, editText, setEditText, editInputRef, startEdit, cancelEdit, confirmEdit, handleKeyDown } =
    useMessageEdit(onEditAndResend)
  const { user } = useAuthContext()

  const isEmpty = messages.length === 0 && !isLoading

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 pb-20 pt-6">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center px-2 py-8 sm:px-4">
            <EmptyState
              icon={<MessageSquare />}
              title="Start a Conversation"
              description="Ask Ally to help schedule meetings, find free time, or manage your calendar."
              hint={`"Schedule a meeting tomorrow at 2pm"`}
              variant="card"
              size="lg"
            />
          </div>
        ) : (
          <div id="tour-chat-history" className="space-y-6">
            {messages.map((msg) => {
              const isEditing = editingMessageId === msg.id
              const isUser = msg.role === 'user'

              return (
                <div key={msg.id} className="group">
                  <div
                    className={cn('flex gap-3', isUser ? 'flex-row-reverse justify-start' : 'flex-row justify-start')}
                  >
                    {isUser ? (
                      <UserAvatar
                        name={
                          user
                            ? 'display_name' in user && user.display_name
                              ? user.display_name
                              : 'first_name' in user && user.first_name
                                ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
                                : 'user_metadata' in user && user.user_metadata?.first_name
                                  ? `${user.user_metadata.first_name}${user.user_metadata?.last_name ? ` ${user.user_metadata.last_name}` : ''}`
                                  : user.email?.split('@')[0]
                            : undefined
                        }
                      />
                    ) : (
                      <AssistantAvatar />
                    )}
                    <div className={cn('flex max-w-[600px] flex-col gap-3', isUser && 'items-end')}>
                      <EditableMessage
                        message={msg}
                        isEditing={isEditing}
                        editText={editText}
                        editInputRef={editInputRef}
                        onEditTextChange={setEditText}
                        onKeyDown={handleKeyDown}
                        onConfirm={confirmEdit}
                        onCancel={cancelEdit}
                      />
                      <span className="px-1 text-xs text-muted-foreground">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  {!isEditing && (
                    <MessageActions
                      msg={msg}
                      isSpeaking={isSpeaking && speakingMessageId === msg.id}
                      onResend={onResend}
                      onEdit={() => startEdit(msg.id, msg.content)}
                      onSpeak={(text) => onSpeak(text, msg.id)}
                    />
                  )}
                </div>
              )
            })}
            {isLoading && (
              <div className="flex gap-3">
                <AssistantAvatar />
                <div className="max-w-[600px]">
                  <StreamingMessage content={streamingText} currentTool={currentTool} isStreaming={isLoading} />
                </div>
              </div>
            )}
          </div>
        )}
        <ChatError error={error} />
        <div ref={scrollRef} />
      </div>
    </div>
  )
}
