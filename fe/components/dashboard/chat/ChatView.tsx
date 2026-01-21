'use client'

import { MessageSquare } from 'lucide-react'

import { ChatError } from './ChatError'
import { EditableMessage } from './EditableMessage'
import { EmptyState } from '@/components/ui/empty-state'
import { Message } from '@/types'
import { MessageActions } from './MessageActions'
import React from 'react'
import { StreamingMessage } from './StreamingMessage'
import { cn } from '@/lib/utils'
import { useMessageEdit } from '@/hooks/useMessageEdit'

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

  const isEmpty = messages.length === 0 && !isLoading

  return (
    <div className="h-full overflow-y-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-24 sm:pb-32">
      {isEmpty ? (
        <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] px-4">
          <EmptyState
            icon={<MessageSquare />}
            title="Start a conversation"
            description="Ask Ally to help manage your calendar, schedule events, or find free time."
            size="lg"
          />
        </div>
      ) : (
        <div id="tour-chat-history" className="space-y-4 sm:space-y-6">
          {messages.map((msg) => {
            const isEditing = editingMessageId === msg.id

            return (
              <div key={msg.id} className="group mb-6 sm:mb-8">
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
                {!isEditing && (
                  <div className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[75%] w-full">
                      <MessageActions
                        msg={msg}
                        isSpeaking={isSpeaking && speakingMessageId === msg.id}
                        onResend={onResend}
                        onEdit={() => startEdit(msg.id, msg.content)}
                        onSpeak={(text) => onSpeak(text, msg.id)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {isLoading && <StreamingMessage content={streamingText} currentTool={currentTool} isStreaming={isLoading} />}
        </div>
      )}
      <ChatError error={error} />
      <div ref={scrollRef} />
    </div>
  )
}
