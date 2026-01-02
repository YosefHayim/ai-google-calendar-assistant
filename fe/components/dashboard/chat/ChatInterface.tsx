'use client'

'use client'

import {
  AlertCircle,
  ArrowUp,
  BarChart2,
  Box,
  CalendarCheck,
  Clock,
  Edit2,
  Laptop,
  MessageSquare,
  Mic,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  User,
  Volume2,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { decodeAudioData, getSpeechFromGemini, sendMessageToGemini } from '@/services/geminiService'

import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { Message } from '@/types'
import MessageBubble from '@/components/dashboard/chat/MessageBubble'
import { Skeleton } from '@/components/ui/skeleton'
import { Typewriter } from '@/components/ui/typewriter'
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    webkitAudioContext: typeof AudioContext
  }
}

interface AssistantAvatarProps {
  isRecording: boolean
  isSpeaking: boolean
  isLoading: boolean
  compact?: boolean
}

const AssistantAvatar: React.FC<AssistantAvatarProps> = ({ isRecording, isSpeaking, isLoading, compact }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center transition-all duration-700 ${
        compact ? 'scale-75 md:scale-90' : 'h-full w-full animate-in zoom-in'
      }`}
    >
      <div
        className={`relative flex items-center justify-center ${
          compact
            ? 'w-[200px] h-[200px] md:w-[300px] md:h-[300px]'
            : 'w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[450px] md:h-[450px]'
        }`}
      >
        <div
          className={`absolute inset-0 rounded-full bg-primary/20 blur-[100px] transition-all duration-1000 ${
            isSpeaking || isLoading ? 'scale-125 opacity-40' : 'scale-100 opacity-10'
          }`}
        />
        <div className="w-full h-full relative">
          <VoicePoweredOrb
            enableVoiceControl={isRecording || isSpeaking}
            className="w-full h-full rounded-full"
            maxRotationSpeed={1.0}
            voiceSensitivity={1.5}
          />
        </div>
      </div>
      <div className={`${compact ? 'mt-4' : 'mt-8'} text-center relative z-10 px-4`}>
        <div
          className={`${
            compact ? 'text-xl' : 'text-3xl md:text-4xl'
          } font-medium text-zinc-900 dark:text-zinc-100 tracking-tight flex flex-col items-center justify-center gap-2`}
        >
          <div className="flex items-center gap-3">
            <Typewriter
              text={
                compact
                  ? ["I'm listening.", 'How can I help?', 'Monitoring schedule.', 'Awaiting command.']
                  : [
                      "I've prepared your daily briefing.",
                      'Your morning is optimized for deep work.',
                      'Shall I coordinate your upcoming briefings?',
                      "I'm monitoring for any calendar conflicts.",
                      'Your executive office is ready.',
                      "I've cleared your schedule for this afternoon.",
                    ]
              }
              speed={45}
              waitTime={4000}
              className="min-h-[1.5em] text-zinc-900 dark:text-zinc-100"
              cursorChar="_"
              cursorClassName="text-primary ml-1"
            />
          </div>

          {isRecording && (
            <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Listening...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ComingSoonPlaceholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full w-full animate-in fade-in zoom-in-95 duration-500 text-center px-6">
    <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mb-8 relative">
      <Box className="w-12 h-12 text-primary" />
      <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
        NEW
      </div>
    </div>
    <h2 className="text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight">3D Control Center</h2>
    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-lg leading-relaxed">
      A fully immersive workspace for scheduling and operations is currently in development.
    </p>
    <div className="mt-12 flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-full">
      <Laptop className="w-4 h-4 text-zinc-400" />
      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Targeting Phase 4 Release</span>
    </div>
  </div>
)

type ActiveTab = 'chat' | 'avatar' | '3d'

const ChatInterface: React.FC = () => {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Good morning. I've reviewed your schedule; you are clear until 11 AM. Shall I block that time for deep work?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat')
  const [error, setError] = useState<string | null>(null)

  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false)
  const [speechRecognitionError, setSpeechRecognitionError] = useState<string | null>(null)
  const [interimTranscription, setInterimTranscription] = useState<string>('')

  const speechRecognitionRef = useRef<any | null>(null)
  const isRecognitionRunning = useRef<boolean>(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const avatarScrollRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  const speakText = useCallback(async (text: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 })
    }

    setIsSpeaking(true)
    try {
      const audioContent = await getSpeechFromGemini(text)

      if (audioContent) {
        const audioBuffer = await decodeAudioData(audioContent, audioContextRef.current)
        const source = audioContextRef.current.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioContextRef.current.destination)
        source.onended = () => setIsSpeaking(false)
        source.start()
      } else {
        setIsSpeaking(false)
      }
    } catch (audioError) {
      console.error('Error fetching or playing audio:', audioError)
      setError('Could not play audio response.')
      setIsSpeaking(false)
    }
  }, [])

  const handleSend = useCallback(
    async (e?: React.FormEvent, textToSend: string = input) => {
      e?.preventDefault()
      if (!textToSend.trim() || isLoading) return

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: textToSend,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setInterimTranscription('')
      setIsLoading(true)
      setError(null)

      try {
        const history = messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }))
        const responseText = await sendMessageToGemini(textToSend, history)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText || 'I encountered an issue processing that instruction.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        if (activeTab === 'avatar' && responseText) speakText(responseText.split('\n')[0])
      } catch (err) {
        setError('Communication relay failed. Please retry.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    },
    [input, isLoading, messages, activeTab, speakText],
  )

  const handleResend = useCallback(
    (text: string) => {
      handleSend(undefined, text)
    },
    [handleSend],
  )

  const handleEditMessage = useCallback((text: string) => {
    setInput(text)
    textInputRef.current?.focus()
  }, [])

  const handleStopRecording = useCallback(
    (finalTranscription: string | null) => {
      if (speechRecognitionRef.current && isRecognitionRunning.current) {
        try {
          speechRecognitionRef.current.stop()
        } catch (e) {
          // Silently handle if already stopped
        }
        isRecognitionRunning.current = false
      }
      setIsRecording(false)

      const textToSend = finalTranscription || interimTranscription
      setInterimTranscription('')

      if (textToSend.trim()) {
        handleSend(undefined, textToSend)
      }
    },
    [interimTranscription, handleSend],
  )

  const handleCancelRecording = useCallback(() => {
    if (speechRecognitionRef.current && isRecognitionRunning.current) {
      try {
        speechRecognitionRef.current.stop()
      } catch (e) {
        // Silent recovery
      }
      isRecognitionRunning.current = false
    }
    setIsRecording(false)
    setInterimTranscription('')
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        let interim = ''
        let final = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript
          } else {
            interim += event.results[i][0].transcript
          }
        }
        setInterimTranscription(interim)
        if (final) {
          handleStopRecording(final)
        }
      }

      recognition.onerror = (event: any) => {
        if (event.error !== 'aborted') {
          console.error('Speech recognition error:', event.error)
          if (event.error === 'not-allowed') {
            setSpeechRecognitionError('Microphone access denied.')
          }
        }
        setIsRecording(false)
        isRecognitionRunning.current = false
        setInterimTranscription('')
      }

      recognition.onend = () => {
        isRecognitionRunning.current = false
        setIsRecording(false)
      }

      speechRecognitionRef.current = recognition
      setSpeechRecognitionSupported(true)
    } else {
      setSpeechRecognitionError('Speech-to-Text not supported in this browser.')
    }

    return () => {
      if (speechRecognitionRef.current && isRecognitionRunning.current) {
        try {
          speechRecognitionRef.current.stop()
        } catch (e) {}
      }
    }
  }, [handleStopRecording])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, activeTab])

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    avatarScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleStartRecording = useCallback(async () => {
    if (isRecognitionRunning.current) return

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setSpeechRecognitionError(null)

      if (speechRecognitionRef.current) {
        setInterimTranscription('')
        speechRecognitionRef.current.start()
        isRecognitionRunning.current = true
        setIsRecording(true)
      }
    } catch (err) {
      setSpeechRecognitionError('Microphone access denied.')
      setIsRecording(false)
      isRecognitionRunning.current = false
    }
  }, [])

  const handleToggleRecording = useCallback(() => {
    if (isRecording || isRecognitionRunning.current) {
      handleStopRecording(interimTranscription)
    } else {
      handleStartRecording()
    }
  }, [isRecording, handleStopRecording, interimTranscription, handleStartRecording])

  const hasConversation = messages.length > 1

  // Unified Message Action Buttons for User Messages (Reset, Audio, Edit, Time)
  const MessageActions = ({ msg }: { msg: Message }) => {
    if (msg.role === 'assistant') {
      return (
        <div className="flex items-center gap-2 mt-1 px-1">
          <button
            onClick={() => speakText(msg.content)}
            className="p-1 text-zinc-400 hover:text-primary transition-colors"
            title="Hear response"
          >
            <Volume2 className={`w-3 h-3 ${isSpeaking ? 'animate-pulse text-primary' : ''}`} />
          </button>
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-end gap-3 mt-1.5 px-1">
        <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
          <Clock className="w-2.5 h-2.5" />
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-2">
          <button
            onClick={() => handleResend(msg.content)}
            className="p-1 text-zinc-400 hover:text-primary transition-colors"
            title="Reset / Re-trigger"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            onClick={() => speakText(msg.content)}
            className="p-1 text-zinc-400 hover:text-primary transition-colors"
            title="Hear message"
          >
            <Volume2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleEditMessage(msg.content)}
            className="p-1 text-zinc-400 hover:text-primary transition-colors"
            title="Edit & Resend"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    )
  }

  const avatarView = useMemo(
    () => (
      <div className="absolute inset-0 z-10  dark:bg-zinc-950 flex flex-col md:flex-row items-center justify-center p-4">
        <div
          className={`flex flex-col items-center justify-center transition-all duration-700 w-full ${hasConversation ? 'md:w-1/2' : 'w-full'}`}
        >
          <AssistantAvatar
            isRecording={isRecording}
            isSpeaking={isSpeaking}
            isLoading={isLoading}
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
              <div className="flex items-center gap-2 mb-6 text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
                <MessageSquare className="w-3.5 h-3.5" /> Live Context
              </div>
              <div className="flex-1 space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className="animate-in fade-in slide-in-from-right-2 duration-300 flex flex-col">
                    <div
                      className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] shadow-sm ${
                        msg.role === 'assistant'
                          ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 ml-0 mr-auto rounded-tl-none'
                          : 'bg-primary text-white ml-auto mr-0 rounded-tr-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <MessageActions msg={msg} />
                  </div>
                ))}
                <div ref={avatarScrollRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ),
    [isRecording, isSpeaking, isLoading, hasConversation, messages, speakText, handleResend, handleEditMessage],
  )

  const threeDView = useMemo(
    () => (
      <div className="absolute inset-0 z-10 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-background opacity-20 pointer-events-none" />
        <ComingSoonPlaceholder />
      </div>
    ),
    [],
  )

  const chatView = (
    <div className="h-full overflow-y-auto px-4 pt-24 pb-32">
      <div id="tour-chat-history">
        {messages.map((msg) => (
          <div key={msg.id} className="group mb-8">
            <MessageBubble role={msg.role} content={msg.content} timestamp={msg.timestamp} hideTimestamp={true} />
            <div className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] md:max-w-[75%] w-full">
                <MessageActions msg={msg} />
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-md rounded-tl-none shadow-sm max-w-[85%] md:max-w-[75%]">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-xs font-medium text-zinc-500 italic">Ally is thinking...</span>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 text-red-600 px-4 py-2 rounded-md flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  )

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full relative overflow-hidden">
      {/* View Switcher Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md p-1 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 p-1.5 px-4 rounded-full text-xs font-bold transition-all ${
            activeTab === 'chat'
              ? 'bg-zinc-900 dark:bg-zinc-100 shadow-sm text-white dark:text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Chat
        </button>
        <button
          onClick={() => setActiveTab('avatar')}
          className={`flex items-center gap-2 p-1.5 px-4 rounded-full text-xs font-bold transition-all ${
            activeTab === 'avatar'
              ? 'bg-zinc-900 dark:bg-zinc-100 shadow-sm text-white dark:text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <User className="w-3.5 h-3.5" /> 2D
        </button>
        <button
          onClick={() => setActiveTab('3d')}
          className={`flex items-center gap-2 p-1.5 px-4 rounded-full text-xs font-bold transition-all ${
            activeTab === '3d'
              ? 'bg-zinc-900 dark:bg-zinc-100 shadow-sm text-white dark:text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <Box className="w-3.5 h-3.5" /> 3D (Coming Soon)
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {activeTab === 'avatar' ? avatarView : activeTab === '3d' ? threeDView : chatView}
      </div>

      {/* Input Section */}
      <div
        id="tour-chat-input"
        className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-white dark:from-zinc-950 via-white/80 to-transparent"
      >
        {isRecording ? (
          <div className="relative flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 transition-all">
            <AIVoiceInput
              onStart={handleStartRecording}
              onStop={(duration, text) => handleStopRecording(text)}
              onInterimResult={setInterimTranscription}
              isRecordingProp={isRecording}
              onToggleRecording={handleToggleRecording}
              speechRecognitionSupported={speechRecognitionSupported}
              speechRecognitionError={speechRecognitionError}
            />
            <button
              onClick={handleCancelRecording}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSend}
            className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 gap-2"
          >
            <button
              type="button"
              onClick={handleToggleRecording}
              className={`p-3 rounded-xl transition-all ${
                isRecording ? 'text-red-500 bg-red-50' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              disabled={isLoading || !speechRecognitionSupported}
            >
              <Mic className="w-6 h-6" />
            </button>
            <input
              ref={textInputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What do you have for me today? I'm ready to help you."
              className="flex-1 bg-transparent border-none outline-none py-4 px-2 text-zinc-800 dark:text-zinc-100 font-medium text-lg placeholder:italic placeholder:font-normal"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-xl transition-all ${
                input.trim() && !isLoading
                  ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
              }`}
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ChatInterface
