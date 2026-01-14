'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { AgentProfileSelector } from './AgentProfileSelector'
import { AvatarView } from './AvatarView'
import { ChatInput, ImageFile } from './ChatInput'
import { ChatView } from './ChatView'
import { Message } from '@/types'
import { ThreeDView } from './ThreeDView'
import { ViewSwitcher } from './ViewSwitcher'
import { useChatContext } from '@/contexts/ChatContext'
import { useMutedSpeechDetection } from '@/hooks/useMutedSpeechDetection'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useStreamingChat } from '@/hooks/useStreamingChat'
import { ttsCache } from '@/services/tts-cache.service'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useVoicePreference } from '@/hooks/queries'
import { toast } from 'sonner'

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
    selectedProfileId,
  } = useChatContext()

  const { data: voiceData } = useVoicePreference()

  const [input, setInput] = useState('')
  const [images, setImages] = useState<ImageFile[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat')
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const avatarScrollRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const textInputRef = useRef<HTMLTextAreaElement>(null)
  const isDocumentVisibleRef = useRef<boolean>(true)

  // Track document visibility for background notifications
  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentVisibleRef.current = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

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

      // Show notification toast if user is not viewing the page
      if (!isDocumentVisibleRef.current) {
        const previewText = fullResponse.slice(0, 80) + (fullResponse.length > 80 ? '...' : '')
        toast.success('Ally has responded', {
          description: previewText,
          duration: 8000,
          action: {
            label: 'View',
            onClick: () => window.focus(),
          },
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
    profileId: selectedProfileId,
    onStreamComplete: handleStreamComplete,
    onStreamError: handleStreamError,
    onTitleGenerated: handleTitleGenerated,
  })

  const isLoading = streamingState.isStreaming

  const stopSpeaking = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop()
      } catch {
        // Ignore errors if audio already stopped
      }
      audioSourceRef.current = null
    }
    setIsSpeaking(false)
    setSpeakingMessageId(null)
  }

  const speakText = async (text: string, messageId?: string) => {
    // If the same message is already playing, stop it (toggle behavior)
    if (messageId && speakingMessageId === messageId && isSpeaking) {
      stopSpeaking()
      toast.info('Audio stopped')
      return
    }

    // Stop any currently playing audio before starting new one
    stopSpeaking()

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }

    setIsSpeaking(true)
    setSpeakingMessageId(messageId || null)
    toast.info('Playing audio...')
    try {
      const audioArrayBuffer = await ttsCache.synthesize(text, voiceData?.value?.voice)
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioArrayBuffer)

      const source = audioContextRef.current.createBufferSource()
      audioSourceRef.current = source
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      source.onended = () => {
        setIsSpeaking(false)
        setSpeakingMessageId(null)
        audioSourceRef.current = null
      }
      source.start()
    } catch (audioError) {
      console.error('Error fetching or playing audio:', audioError)
      setError('Could not play audio response.')
      toast.error('Failed to play audio')
      setIsSpeaking(false)
      setSpeakingMessageId(null)
      audioSourceRef.current = null
    }
  }

  const handleSend = async (e?: React.FormEvent, textToSend: string = input) => {
    e?.preventDefault()
    if ((!textToSend.trim() && images.length === 0) || isLoading) return

    // Build content with images if present
    const messageContent =
      images.length > 0
        ? `${textToSend || 'Please analyze these images and help me with any scheduling or calendar-related content.'}`
        : textToSend

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      images:
        images.length > 0
          ? images.map((img) => ({
              data: img.base64 || '',
              mimeType: img.file.type as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif',
            }))
          : undefined,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    // Clean up image previews and clear images state
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])

    setError(null)
    resetStreamingState()

    // Pass images to streaming message
    const imageData = userMessage.images?.map((img) => ({
      type: 'image' as const,
      data: img.data,
      mimeType: img.mimeType,
    }))

    await sendStreamingMessage(messageContent, selectedConversationId || undefined, imageData)
  }

  const handleResend = (text: string) => {
    toast.info('Regenerating response...')
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

  useMutedSpeechDetection({
    isRecording,
    speechRecognitionSupported,
    onActivateMic: toggleRecording,
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
        <div className="absolute top-4 left-16 md:left-4 z-30">
          <AgentProfileSelector />
        </div>
        <ViewSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {isLoadingConversation && <LoadingSpinner overlay />}

        <div className="flex-1 relative h-full overflow-hidden">
          {activeTab === 'avatar' ? (
            <AvatarView
              messages={messages}
              isRecording={isRecording}
              isSpeaking={isSpeaking}
              speakingMessageId={speakingMessageId}
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
              speakingMessageId={speakingMessageId}
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
          images={images}
          onInputChange={setInput}
          onSubmit={handleSend}
          onToggleRecording={toggleRecording}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onCancelRecording={cancelRecording}
          onCancel={isLoading ? handleCancel : undefined}
          onImagesChange={setImages}
        />
      </div>
    </div>
  )
}

export default ChatInterface
