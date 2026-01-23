'use client'

import type { AIAllySidebarProps, ChatMessage, QuickAction } from './types'
import { AllyOrbButton, ChatHeader, MessageBubble, QuickActionsBar, TypingIndicator } from './components'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, HelpCircle, Mic, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { SupportModal } from '@/components/dialogs/SupportModal'
import { useTranslation } from 'react-i18next'

const INITIAL_MESSAGE: ChatMessage = {
  id: Date.now(),
  text: "Hey! I'm Ally, your AI assistant. How can I help optimize your calendar today?",
  isUser: false,
}

export function AIAllySidebar({ isOpen, onClose, onOpen }: AIAllySidebarProps) {
  const { t } = useTranslation()

  const QUICK_ACTIONS: QuickAction[] = [
    { label: t('allySidebar.quickActions.optimizeSchedule'), emoji: '📅' },
    { label: t('allySidebar.quickActions.findFreeTime'), emoji: '🔍' },
    { label: t('allySidebar.quickActions.rescheduleMeeting'), emoji: '🔄' },
  ]

  const INITIAL_MESSAGE: ChatMessage = {
    id: Date.now(),
    text: t('allySidebar.initialMessage'),
    isUser: false,
  }

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = (textToSend: string = inputText) => {
    if (!textToSend.trim()) return
    const newMessage: ChatMessage = {
      id: Date.now(),
      text: textToSend,
      isUser: true,
    }
    setMessages((prev) => [...prev, newMessage])
    setInputText('')
    setIsTyping(true)

    const timeoutId = setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: t('allySidebar.responseMessage'),
          isUser: false,
        },
      ])
    }, 1500)

    return () => clearTimeout(timeoutId)
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
      const timeoutId = setTimeout(() => inputRef.current?.focus(), 300)
      return () => clearTimeout(timeoutId)
    }
  }, [isOpen, isRecording])

  const handleQuickAction = (label: string) => {
    setInputText(label)
    inputRef.current?.focus()
  }

  // Hide entire sidebar on mobile - not optimized for small screens
  return (
    <div className="hidden md:block">
      <div className="fixed bottom-6 right-6 z-50">
        <AllyOrbButton onClick={() => onOpen?.()} isOpen={isOpen} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="border/60 /60 fixed bottom-6 right-6 z-50 flex max-h-[80vh] w-96 flex-col overflow-hidden rounded-2xl bg-background/95 bg-secondary/95 shadow-2xl shadow-black/40 backdrop-blur-2xl"
          >
            <ChatHeader onClose={onClose} onMinimize={onClose} />

            <div className="scrollbar-thin scrollbar-thumb-muted scrollbar-thumb-muted scrollbar-track-transparent max-h-80 min-h-64 flex-1 space-y-2 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <MessageBubble key={message.id} message={message} index={index} />
              ))}
              <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 2 && !isRecording && (
              <QuickActionsBar actions={QUICK_ACTIONS} onActionClick={handleQuickAction} />
            )}

            <div className="border/50 /50 border-t bg-muted/50 bg-secondary/50 p-3">
              {isRecording ? (
                <div className="relative flex flex-col items-center justify-center rounded-2xl bg-background bg-secondary p-3">
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
                    className="absolute right-2 top-2 h-7 w-7 text-muted-foreground"
                    aria-label={t('allySidebar.cancelVoiceRecording')}
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
                  className="relative flex items-center gap-1.5 rounded-2xl bg-background bg-secondary p-1.5"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleRecording}
                    className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-foreground hover:text-primary-foreground"
                    disabled={!speechRecognitionSupported}
                    aria-label={t('allySidebar.toggleVoiceInput')}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>

                  <Input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t('allySidebar.placeholder')}
                    className="h-10 flex-1 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                  />

                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputText.trim()}
                    className={cn(
                      'h-10 w-10 flex-shrink-0 rounded-xl',
                      inputText.trim()
                        ? 'bg-secondary text-primary-foreground hover:bg-accent hover:bg-secondary'
                        : 'bg-secondary text-muted-foreground',
                    )}
                    aria-label={t('allySidebar.sendMessage')}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                </form>
              )}

              <div className="mt-2 flex items-center justify-center gap-2">
                <p className="text-xs font-medium text-muted-foreground">{t('allySidebar.poweredBy')}</p>
                <span className="text-muted-foreground">·</span>
                <button
                  onClick={() => setIsSupportModalOpen(true)}
                  className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <HelpCircle className="h-3 w-3" />
                  {t('allySidebar.support')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
    </div>
  )
}
