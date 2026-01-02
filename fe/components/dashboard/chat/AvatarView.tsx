'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import { Message } from '@/types'
import { AssistantAvatar } from './AssistantAvatar'
import { StreamingTypewriter } from '@/components/ui/streaming-typewriter'
import { MessageActions } from './MessageActions'

interface AvatarViewProps {
  messages: Message[]
  isRecording: boolean
  isSpeaking: boolean
  isLoading: boolean
  isStreaming: boolean
  streamingMessageId: string | null
  onResend: (text: string) => void
  onEdit: (text: string) => void
  onSpeak: (text: string) => void
  onTypewriterComplete?: () => void
  avatarScrollRef: React.RefObject<HTMLDivElement>
}

export const AvatarView: React.FC<AvatarViewProps> = ({
  messages,
  isRecording,
  isSpeaking,
  isLoading,
  isStreaming,
  streamingMessageId,
  onResend,
  onEdit,
  onSpeak,
  onTypewriterComplete,
  avatarScrollRef,
}) => {
  const hasConversation = messages.length > 1

  return (
    <div className="absolute inset-0 z-10  dark:bg-zinc-950 flex flex-col md:flex-row items-center justify-center p-4">
      <div
        className={`flex flex-col items-center justify-center transition-all duration-700 w-full ${hasConversation ? 'md:w-1/2' : 'w-full'}`}
      >
        <AssistantAvatar
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          isLoading={isLoading || isStreaming}
          compact={hasConversation}
        />
      </div>

      <AnimatePresence>
        {hasConversation && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="hidden md:flex flex-col w-1/2 h-[70%] border-l border-zinc-200 dark:border-zinc-800 px-8 py-4 overflow-y-auto"
          >
            <div className="flex items-center gap-2 mb-6 text-zinc-400 font-bold text-xs uppercase tracking-widest">
              <MessageSquare className="w-3.5 h-3.5" /> Live Context
              {isStreaming && (
                <span className="ml-2 flex items-center gap-1 text-primary">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  Streaming
                </span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              {messages.map((msg) => {
                const isCurrentlyStreaming = msg.id === streamingMessageId && isStreaming

                return (
                  <div key={msg.id} className="animate-in fade-in slide-in-from-right-2 duration-300 flex flex-col">
                    <div
                      className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] shadow-sm ${
                        msg.role === 'assistant'
                          ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 ml-0 mr-auto rounded-tl-none'
                          : 'bg-primary text-white ml-auto mr-0 rounded-tr-none'
                      }`}
                    >
                      {isCurrentlyStreaming ? (
                        <StreamingTypewriter
                          text={msg.content}
                          isStreaming={isCurrentlyStreaming}
                          className="inline"
                          cursorChar="_"
                          cursorClassName="ml-0.5 text-primary"
                          onComplete={onTypewriterComplete}
                        />
                      ) : (
                        msg.content
                      )}
                    </div>
                    {!isCurrentlyStreaming && (
                      <MessageActions msg={msg} isSpeaking={isSpeaking} onResend={onResend} onEdit={onEdit} onSpeak={onSpeak} />
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
