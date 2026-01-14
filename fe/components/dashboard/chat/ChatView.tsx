'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Message } from '@/types'
import { MessageActions } from './MessageActions'
import { EditableMessage } from './EditableMessage'
import { StreamingMessage } from './StreamingMessage'
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

  return (
    <div className="h-full overflow-y-auto px-4 pt-24 pb-32">
      <div id="tour-chat-history">
        {messages.map((msg) => {
          const isEditing = editingMessageId === msg.id

          return (
            <div key={msg.id} className="group mb-8">
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
                <div className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%] md:max-w-[75%] w-full">
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
      {error && (
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 text-red-600 px-4 py-2 rounded-md flex items-center gap-2 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  )
}
