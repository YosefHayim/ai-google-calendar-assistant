'use client'

import React, { useEffect, useRef, useState } from 'react'
import { decodeAudioData, getSpeechFromGemini } from '@/services/geminiService'
import { sendChatMessage, continueConversation, type ChatMessage as ChatHistoryMessage } from '@/services/chatService'

import { Message } from '@/types'
import { AvatarView } from './AvatarView'
import { ChatInput } from './ChatInput'
import { ChatView } from './ChatView'
import { ThreeDView } from './ThreeDView'
import { ViewSwitcher } from './ViewSwitcher'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useChatContext } from '@/contexts/ChatContext'

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}

type ActiveTab = 'chat' | 'avatar' | '3d'

const ChatInterface: React.FC = () => {
  const {
    messages,
    setMessages,
    selectedConversationId,
    setConversationId,
    isLoadingConversation,
    addConversationToList,
    updateConversationTitle,
  } = useChatContext()

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat')
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const avatarScrollRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  const speakText = async (text: string) => {
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
  }

  const handleSend = async (e?: React.FormEvent, textToSend: string = input) => {
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
    setIsLoading(true)
    setError(null)

    try {
      let response
      if (selectedConversationId) {
        response = await continueConversation(selectedConversationId, textToSend)
      } else {
        const history: ChatHistoryMessage[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))
        response = await sendChatMessage(textToSend, history)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      if (response.conversationId && !selectedConversationId) {
        setConversationId(response.conversationId, true)
        addConversationToList({
          id: response.conversationId,
          title: response.title || 'New Conversation',
          messageCount: 2,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        })
      } else if (response.conversationId && response.title) {
        updateConversationTitle(response.conversationId, response.title)
      }

      if (activeTab === 'avatar' && response.content) {
        speakText(response.content.split('\n')[0])
      }
    } catch (err) {
      setError('Communication relay failed. Please retry.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = (text: string) => {
    handleSend(undefined, text)
  }

  const handleEditMessage = (text: string) => {
    setInput(text)
    textInputRef.current?.focus()
  }

  const handleEditAndResend = (messageId: string, newText: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId)
    if (messageIndex === -1) return

    const updatedMessages = messages.slice(0, messageIndex)
    setMessages(updatedMessages)

    handleSend(undefined, newText)
  }

  const {
    isRecording,
    speechRecognitionSupported,
    speechRecognitionError,
    interimTranscription,
    startRecording,
    stopRecording,
    cancelRecording,
    toggleRecording,
  } = useSpeechRecognition((finalTranscription) => {
    handleSend(undefined, finalTranscription)
  })

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, activeTab])

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    avatarScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full relative overflow-hidden">
        <ViewSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {isLoadingConversation && (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 z-20 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full" />
          </div>
        )}

        <div className="flex-1 relative">
          {activeTab === 'avatar' ? (
            <AvatarView
              messages={messages}
              isRecording={isRecording}
              isSpeaking={isSpeaking}
              isLoading={isLoading}
              onResend={handleResend}
              onEditAndResend={handleEditAndResend}
              onSpeak={speakText}
              avatarScrollRef={avatarScrollRef}
            />
          ) : activeTab === '3d' ? (
            <ThreeDView />
          ) : (
            <ChatView
              messages={messages}
              isLoading={isLoading}
              error={error}
              isSpeaking={isSpeaking}
              onResend={handleResend}
              onEdit={handleEditMessage}
              onSpeak={speakText}
              scrollRef={scrollRef}
            />
          )}
        </div>

        <ChatInput
          ref={textInputRef}
          input={input}
          isLoading={isLoading}
          isRecording={isRecording}
          speechRecognitionSupported={speechRecognitionSupported}
          speechRecognitionError={speechRecognitionError}
          interimTranscription={interimTranscription}
          onInputChange={setInput}
          onSubmit={handleSend}
          onToggleRecording={toggleRecording}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onCancelRecording={cancelRecording}
        />
      </div>
    </div>
  )
}

export default ChatInterface
