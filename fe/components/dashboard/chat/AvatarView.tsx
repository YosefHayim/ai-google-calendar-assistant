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
import { useTranslation } from 'react-i18next'

interface AvatarViewProps {
  messages: Message[]
  isRecording: boolean
  isSpeaking: boolean
  speakingMessageId: string | null
  isLoading: boolean
  isTyping?: boolean
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
  isTyping,
  onResend,
  onEditAndResend,
  onSpeak,
  avatarScrollRef,
}) => {
  const { t } = useTranslation()
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
    <div className="absolute inset-0 z-10 dark:bg-secondary flex flex-col items-center p-4 overflow-hidden">
      <div
        className={cn(
          'flex flex-col items-center justify-center transition-all duration-700 w-full shrink-0',
          hasConversation ? 'h-[35%] min-h-[180px]' : 'flex-1',
        )}
      >
        <AssistantAvatar
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          isLoading={isLoading}
          isTyping={isTyping}
          compact={hasConversation}
        />
      </div>

      <AnimatePresence>
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1 w-full items-center justify-center"
          >
            <EmptyState
              icon={<MessageSquare />}
              title={t('chat.avatarView.startConversation')}
              description={t('chat.avatarView.speakOrType')}
              size="lg"
            />
          </motion.div>
        )}
        {hasConversation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col w-full flex-1 border-t px-4 sm:px-8 py-4 overflow-y-auto"
          >
            <div className="flex items-center gap-2 mb-4 text-muted-foreground font-bold text-xs uppercase tracking-widest">
              <MessageSquare className="w-3.5 h-3.5" /> {t('chat.avatarView.liveContext')}
            </div>
            <div className="flex-1 space-y-2">
              {messages.map((msg) => {
                const isEditing = editingMessageId === msg.id

                return (
                  <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col">
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
                            title={t('chat.avatarView.cancelEdit')}
                          >
                            <X size={14} />
                          </Button>
                          <Button
                            size="icon"
                            onClick={handleConfirmEdit}
                            className="h-7 w-7"
                            title={t('chat.avatarView.confirmEdit')}
                          >
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
