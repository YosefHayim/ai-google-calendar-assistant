'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, MessageSquare, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { AssistantAvatar } from './AssistantAvatar'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Message } from '@/types'
import { MessageActions } from './MessageActions'
import { cn } from '@/lib/utils'

interface AvatarViewProps {
  messages: Message[]
  isRecording: boolean
  isSpeaking: boolean
  speakingMessageId: string | null
  isLoading: boolean
  onResend: (text: string) => void
  onEditAndResend: (messageId: string, newText: string) => void
  onSpeak: (text: string, messageId?: string) => void
  avatarScrollRef: React.RefObject<HTMLDivElement | null>
}

export const AvatarView: React.FC<AvatarViewProps> = ({
  messages,
  isRecording,
  isSpeaking,
  speakingMessageId,
  isLoading,
  onResend,
  onEditAndResend,
  onSpeak,
  avatarScrollRef,
}) => {
  const hasConversation = messages.length > 1
  const isEmpty = messages.length === 0
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const editInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.setSelectionRange(editText.length, editText.length)
    }
  }, [editingMessageId, editText.length])

  const handleStartEdit = (msg: Message) => {
    setEditingMessageId(msg.id)
    setEditText(msg.content)
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditText('')
  }

  const handleConfirmEdit = () => {
    if (editingMessageId && editText.trim()) {
      onEditAndResend(editingMessageId, editText.trim())
      setEditingMessageId(null)
      setEditText('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleConfirmEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div className="absolute inset-0 z-10  dark:bg-secondary flex flex-col md:flex-row items-center justify-center p-4">
      <div
        className={cn(
          'flex flex-col items-center justify-center transition-all duration-700 w-full',
          hasConversation ? 'md:w-1/2' : 'w-full',
        )}
      >
        <AssistantAvatar
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          isLoading={isLoading}
          compact={hasConversation}
        />
      </div>

      <AnimatePresence>
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden md:flex flex-col w-1/2 h-[70%] items-center justify-center"
          >
            <EmptyState
              icon={<MessageSquare />}
              title="Start a conversation"
              description="Speak or type to interact with Ally and manage your calendar."
              size="lg"
            />
          </motion.div>
        )}
        {hasConversation && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="hidden md:flex flex-col w-1/2 h-[70%] border-l px-8 py-4 overflow-y-auto"
          >
            <div className="flex items-center gap-2 mb-6 text-muted-foreground font-bold text-xs uppercase tracking-widest">
              <MessageSquare className="w-3.5 h-3.5" /> Live Context
            </div>
            <div className="flex-1 space-y-2">
              {messages.map((msg) => {
                const isEditing = editingMessageId === msg.id

                return (
                  <div key={msg.id} className="animate-in fade-in slide-in-from-right-2 duration-300 flex flex-col">
                    {isEditing ? (
                      <div className="flex flex-col gap-2 ml-auto mr-0 max-w-[90%] w-full">
                        <textarea
                          ref={editInputRef}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="p-3 rounded-xl text-xs leading-relaxed bg-primary/10 text-foreground dark:text-primary-foreground border-2 border-primary rounded-tr-none resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                          rows={Math.min(5, editText.split('\n').length + 1)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={handleCancelEdit}
                            className="h-7 w-7"
                            title="Cancel (Esc)"
                          >
                            <X size={14} />
                          </Button>
                          <Button size="icon" onClick={handleConfirmEdit} className="h-7 w-7" title="Confirm (Enter)">
                            <Check size={14} />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'p-3 rounded-xl text-xs leading-relaxed max-w-[90%] shadow-sm',
                          msg.role === 'assistant'
                            ? 'bg-secondary dark:bg-secondary text-foreground ml-0 mr-auto rounded-tl-none'
                            : 'bg-primary text-white ml-auto mr-0 rounded-tr-none',
                        )}
                      >
                        {msg.content}
                      </div>
                    )}
                    {!isEditing && (
                      <MessageActions
                        msg={msg}
                        isSpeaking={isSpeaking && speakingMessageId === msg.id}
                        onResend={onResend}
                        onEdit={() => handleStartEdit(msg)}
                        onSpeak={(text) => onSpeak(text, msg.id)}
                      />
                    )}
                  </div>
                )
              })}
              <div ref={avatarScrollRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
