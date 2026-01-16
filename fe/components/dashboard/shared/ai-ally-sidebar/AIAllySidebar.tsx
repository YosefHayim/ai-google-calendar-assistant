'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, MessageCircle, Mic, X } from 'lucide-react'
import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

import type { AIAllySidebarProps, ChatMessage, QuickAction } from './types'
import {
  AllyOrbButton,
  ChatHeader,
  MessageBubble,
  TypingIndicator,
  QuickActionsBar,
} from './components'

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Optimize schedule', emoji: '📅' },
  { label: 'Find free time', emoji: '🔍' },
  { label: 'Reschedule meeting', emoji: '🔄' },
]

const INITIAL_MESSAGE: ChatMessage = {
  id: 1,
  text: "Hey! I'm Ally, your AI assistant. How can I help optimize your calendar today?",
  isUser: false,
}

export function AIAllySidebar({ isOpen, onClose, onOpen }: AIAllySidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = (textToSend: string = inputText) => {
    if (!textToSend.trim()) return
    const newMessage: ChatMessage = {
      id: messages.length + 1,
      text: textToSend,
      isUser: true,
    }
    setMessages((prev) => [...prev, newMessage])
    setInputText('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: 'I understand! Let me analyze your calendar and suggest some optimizations.',
          isUser: false,
        },
      ])
    }, 1500)
  }

  const {
    isRecording,
    speechRecognitionSupported,
    speechRecognitionError,
    startRecording,
    stopRecording,
    cancelRecording,
    toggleRecording,
  } = useSpeechRecognition(handleSendMessage)

  const handleStopRecording = (text: string) => {
    stopRecording()
    if (text.trim()) {
      handleSendMessage(text)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && inputRef.current && !isRecording) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, isRecording])

  const handleQuickAction = (label: string) => {
    setInputText(label)
    inputRef.current?.focus()
  }

  return (
    <>
      <div className="hidden md:block fixed bottom-6 right-6 z-50">
        <AllyOrbButton onClick={() => onOpen?.()} isOpen={isOpen} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[80vh] flex flex-col rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/40 border border-zinc-200/60 dark:border-zinc-800/60 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl overflow-hidden"
          >
            <ChatHeader onClose={onClose} onMinimize={onClose} />

            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-64 max-h-80 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <EmptyState
                    icon={<MessageCircle />}
                    title="Start chatting"
                    description="Ask Ally anything about your calendar."
                    size="sm"
                  />
                </div>
              ) : (
                messages.map((message, index) => (
                  <MessageBubble key={message.id} message={message} index={index} />
                ))
              )}
              <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 2 && !isRecording && (
              <QuickActionsBar actions={QUICK_ACTIONS} onActionClick={handleQuickAction} />
            )}

            <div className="p-3 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
              {isRecording ? (
                <div className="relative flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3">
                  <AIVoiceInput
                    onStart={startRecording}
                    onStop={(duration, text) => handleStopRecording(text ?? '')}
                    isRecordingProp={isRecording}
                    onToggleRecording={toggleRecording}
                    speechRecognitionSupported={speechRecognitionSupported}
                    speechRecognitionError={speechRecognitionError}
                    visualizerBars={32}
                    className="py-2"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cancelRecording}
                    className="absolute top-2 right-2 h-7 w-7 text-zinc-400"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 gap-1.5"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleRecording}
                    className="h-10 w-10 flex-shrink-0 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    disabled={!speechRecognitionSupported}
                    title="Voice input"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>

                  <Input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask Ally anything..."
                    className="flex-1 h-10 bg-transparent border-0 shadow-none focus-visible:ring-0 text-sm"
                  />

                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputText.trim()}
                    className={cn(
                      'h-10 w-10 flex-shrink-0 rounded-xl',
                      inputText.trim()
                        ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600',
                    )}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </Button>
                </form>
              )}

              <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-2 font-medium">
                Powered by Ally AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIAllySidebar
