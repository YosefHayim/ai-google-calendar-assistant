'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, ChevronDown, Mic, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb'
import { cn } from '@/lib/utils'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

interface AIAllySidebarProps {
  isOpen: boolean
  onClose: () => void
  onOpen?: () => void
}

// Floating Orb Button using VoicePoweredOrb
const AllyOrbButton: React.FC<{ onClick: () => void; isOpen: boolean }> = ({ onClick, isOpen }) => {
  return (
    <motion.button
      onClick={onClick}
      className="group relative w-16 h-16 rounded-full flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={false}
      animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      suppressHydrationWarning
    >
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse" />

      {/* VoicePoweredOrb as the icon */}
      <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-2xl shadow-primary/40">
        <VoicePoweredOrb enableVoiceControl={false} className="w-full h-full" maxRotationSpeed={0.3} />
      </div>

      {/* Hover tooltip */}
      <div className="absolute -left-28 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
        Chat with Ally
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-zinc-900 dark:bg-zinc-800 rotate-45" />
      </div>
    </motion.button>
  )
}

// Tab-style animated header
const ChatHeader: React.FC<{ onClose: () => void; onMinimize: () => void }> = ({ onClose, onMinimize }) => {
  return (
    <div className="relative flex items-center justify-between px-4 py-3 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-gradient-to-r from-zinc-50/80 to-white/80 dark:from-zinc-900/80 dark:to-zinc-950/80 backdrop-blur-xl rounded-t-2xl">
      {/* Animated tab indicator */}
      <motion.div
        className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-primary via-orange-500 to-primary rounded-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      <div className="flex items-center gap-3">
        {/* Small animated orb avatar */}
        <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-primary/20">
          <VoicePoweredOrb enableVoiceControl={false} className="w-full h-full" maxRotationSpeed={0.2} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            Ally
            <span className="px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-md">
              AI
            </span>
          </h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMinimize}
          className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          title="Minimize"
        >
          <ChevronDown size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          title="Close"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  )
}

// Message bubble component
const MessageBubble: React.FC<{
  message: { id: number; text: string; isUser: boolean }
  index: number
}> = ({ message, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn('flex', message.isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm',
          message.isUser
            ? 'bg-gradient-to-br from-primary to-orange-500 text-white rounded-br-md'
            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 rounded-bl-md border border-zinc-200/50 dark:border-zinc-700/50',
        )}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
      </div>
    </motion.div>
  )
}

// Typing indicator
const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex justify-start"
  >
    <div className="bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl rounded-bl-md px-4 py-3 border border-zinc-200/50 dark:border-zinc-700/50">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  </motion.div>
)

const AIAllySidebar: React.FC<AIAllySidebarProps> = ({ isOpen, onClose, onOpen }) => {
  const [messages, setMessages] = useState<Array<{ id: number; text: string; isUser: boolean }>>([
    {
      id: 1,
      text: "Hey! I'm Ally, your AI assistant. How can I help optimize your calendar today?",
      isUser: false,
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = (textToSend: string = inputText) => {
    if (!textToSend.trim()) return
    const newMessage = {
      id: messages.length + 1,
      text: textToSend,
      isUser: true,
    }
    setMessages((prev) => [...prev, newMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate AI response
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
    interimTranscription: _interimTranscription,
    startRecording,
    stopRecording,
    cancelRecording,
    toggleRecording,
  } = useSpeechRecognition(handleSendMessage)

  // Handler wrappers for AIVoiceInput component
  const handleStartRecording = () => {
    startRecording()
  }

  const handleStopRecording = (text: string) => {
    stopRecording()
    if (text.trim()) {
      handleSendMessage(text)
    }
  }

  const handleCancelRecording = () => {
    cancelRecording()
  }

  const handleToggleRecording = () => {
    toggleRecording()
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

  const quickActions = [
    { label: 'Optimize schedule', emoji: '📅' },
    { label: 'Find free time', emoji: '🔍' },
    { label: 'Reschedule meeting', emoji: '🔄' },
  ]

  return (
    <>
      {/* Floating Orb Button - hidden on mobile */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50">
        <AllyOrbButton onClick={() => onOpen?.()} isOpen={isOpen} />
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[80vh] flex flex-col rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/40 border border-zinc-200/60 dark:border-zinc-800/60 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl overflow-hidden"
          >
            {/* Header */}
            <ChatHeader onClose={onClose} onMinimize={onClose} />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-64 max-h-80 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              {messages.map((message, index) => (
                <MessageBubble key={message.id} message={message} index={index} />
              ))}
              <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && !isRecording && (
              <motion.div
                className="px-4 pb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputText(action.label)
                        inputRef.current?.focus()
                      }}
                      className="rounded-full text-xs font-medium"
                    >
                      {action.emoji} {action.label}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
              {isRecording ? (
                <div className="relative flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3">
                  <AIVoiceInput
                    onStart={handleStartRecording}
                    onStop={(duration, text) => handleStopRecording(text ?? '')}
                    isRecordingProp={isRecording}
                    onToggleRecording={handleToggleRecording}
                    speechRecognitionSupported={speechRecognitionSupported}
                    speechRecognitionError={speechRecognitionError}
                    visualizerBars={32}
                    className="py-2"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelRecording}
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
                  {/* Voice Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleRecording}
                    className="h-10 w-10 flex-shrink-0 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    disabled={!speechRecognitionSupported}
                    title="Voice input"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>

                  {/* Text Input */}
                  <Input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask Ally anything..."
                    className="flex-1 h-10 bg-transparent border-0 shadow-none focus-visible:ring-0 text-sm"
                  />

                  {/* Send Button */}
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

              {/* Powered by badge */}
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
