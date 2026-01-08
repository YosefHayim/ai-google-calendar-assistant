'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { AvatarView } from './AvatarView'
import { ChatInput } from './ChatInput'
import { ChatView } from './ChatView'
import { Message } from '@/types'
import { ThreeDView } from './ThreeDView'
import { ViewSwitcher } from './ViewSwitcher'
import { useChatContext } from '@/contexts/ChatContext'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useStreamingChat } from '@/hooks/useStreamingChat'
import { ttsCache } from '@/lib/api/services/tts-cache.service'
import { useVoicePreference } from '@/hooks/queries'

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

  const { data: voiceData } = useVoicePreference()

  const [input, setInput] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat')
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const avatarScrollRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  const handleStreamComplete = useCallback(
    (conversationId: string, fullResponse: string) => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      if (conversationId && !selectedConversationId) {
        setConversationId(conversationId, true)
        addConversationToList({
          id: conversationId,
          title: 'New Conversation',
          messageCount: 2,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        })
      }

      // Auto-play voice response if enabled in settings, or always for avatar tab
      if (fullResponse && (voiceData?.value?.enabled || activeTab === 'avatar')) {
        speakText(fullResponse.split('\n')[0])
      }
    },
    [
      selectedConversationId,
      setConversationId,
      addConversationToList,
      setMessages,
      activeTab,
      voiceData?.value?.enabled,
    ],
  )

  const handleStreamError = useCallback((errorMessage: string) => {
    setError(errorMessage)
  }, [])

  const handleTitleGenerated = useCallback(
    (conversationId: string, title: string) => {
      updateConversationTitle(conversationId, title, true)
    },
    [updateConversationTitle],
  )

  const { streamingState, sendStreamingMessage, cancelStream, resetStreamingState } = useStreamingChat({
    onStreamComplete: handleStreamComplete,
    onStreamError: handleStreamError,
    onTitleGenerated: handleTitleGenerated,
  })

  const isLoading = streamingState.isStreaming

  const speakText = async (text: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }

    setIsSpeaking(true)
    try {
      const audioArrayBuffer = await ttsCache.synthesize(text, voiceData?.value?.voice)
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioArrayBuffer)

      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      source.onended = () => setIsSpeaking(false)
      source.start()
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
    setError(null)
    resetStreamingState()

    await sendStreamingMessage(textToSend, selectedConversationId || undefined)
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

  const handleCancel = () => {
    cancelStream()
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
  }, [messages, isLoading, activeTab, streamingState.streamedText])

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    avatarScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      <div className="flex-1 flex flex-col h-full  mx-auto w-full relative overflow-hidden">
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
              streamingText={streamingState.streamedText}
              currentTool={streamingState.currentTool}
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
          onCancel={isLoading ? handleCancel : undefined}
        />
      </div>
    </div>
  )
}

export default ChatInterface
