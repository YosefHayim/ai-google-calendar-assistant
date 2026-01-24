'use client'

import { ChatInput, ImageFile } from '../ChatInput'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { ActiveTab } from './types'
import { AvatarView } from '../AvatarView'
import { ChatHeader } from '../ChatHeader'
import { ChatView } from '../ChatView'
import { EventConfirmationCard } from '../EventConfirmationCard'
import { QuickSuggestions } from '../QuickSuggestions'
import { SubscriptionBanner } from '../SubscriptionBanner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Message } from '@/types'
import type { SupportedMimeType } from '@/services/ocr-service'
import { ViewSwitcher } from '../ViewSwitcher'
import { queryKeys } from '@/lib/query'
import { toast } from 'sonner'
import { useAudioPlayback } from './useAudioPlayback'
import { useChatContext } from '@/contexts/ChatContext'
import { useMutedSpeechDetection } from '@/hooks/useMutedSpeechDetection'
import { useOCRUpload } from '@/hooks/useOCRUpload'
import { usePostHog } from 'posthog-js/react'
import { useQueryClient } from '@tanstack/react-query'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useStreamingChat } from '@/hooks/useStreamingChat'
import { useTranslation } from 'react-i18next'
import { useVoicePreference } from '@/hooks/queries'

export function ChatInterface() {
  const { t } = useTranslation()
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
  const queryClient = useQueryClient()
  const posthog = usePostHog()

  const [input, setInput] = useState('')
  const [images, setImages] = useState<ImageFile[]>([])
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat')
  const [error, setError] = useState<string | null>(null)

  const {
    isUploading: isOCRUploading,
    isConfirming: isOCRConfirming,
    pendingEvents,
    hasPendingEvents,
    shouldUseOCR,
    uploadForExtraction,
    confirmEvents: confirmOCREvents,
    cancelPendingEvents,
  } = useOCRUpload()

  const scrollRef = useRef<HTMLDivElement>(null)
  const avatarScrollRef = useRef<HTMLDivElement>(null)
  const textInputRef = useRef<HTMLTextAreaElement>(null)
  const isDocumentVisibleRef = useRef<boolean>(true)

  const { isSpeaking, speakingMessageId, speakText } = useAudioPlayback({
    voice: voiceData?.value?.voice,
    playbackSpeed: voiceData?.value?.playbackSpeed,
  })

  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentVisibleRef.current = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Cleanup image preview URLs on unmount to prevent memory leaks
  // Store images ref for cleanup to avoid revoking URLs that are still in use
  const imagesRef = useRef(images)
  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    return () => {
      // Only revoke on unmount using the latest ref value
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.preview))
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
          pinned: false,
        })
      }

      if (!isDocumentVisibleRef.current) {
        const previewText = fullResponse.slice(0, 80) + (fullResponse.length > 80 ? '...' : '')
        toast.success(t('toast.allyResponded'), {
          description: previewText,
          duration: 8000,
          action: {
            label: 'View',
            onClick: () => window.focus(),
          },
        })
      }

      if (fullResponse && (voiceData?.value?.enabled || activeTab === 'avatar')) {
        speakText(fullResponse.split('\n')[0])
      }
    },
    [
      t,
      selectedConversationId,
      setConversationId,
      addConversationToList,
      setMessages,
      activeTab,
      voiceData?.value?.enabled,
      speakText,
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

  const handleMemoryUpdated = useCallback(
    (_preference: string, action: 'added' | 'replaced' | 'duplicate') => {
      if (action !== 'duplicate') {
        queryClient.invalidateQueries({ queryKey: queryKeys.preferences.allyBrain() })
        toast.success(t('toast.memoryUpdated'), {
          description: action === 'added' ? "I've saved this to my memory." : "I've updated my memory.",
        })
      }
    },
    [t, queryClient],
  )

  const { streamingState, sendStreamingMessage, cancelStream, resetStreamingState } = useStreamingChat({
    onStreamComplete: handleStreamComplete,
    onStreamError: handleStreamError,
    onTitleGenerated: handleTitleGenerated,
    onMemoryUpdated: handleMemoryUpdated,
  })

  const isLoading = streamingState.isStreaming

  const handleSend = async (e?: React.FormEvent, textToSend: string = input) => {
    e?.preventDefault()
    if ((!textToSend.trim() && images.length === 0) || isLoading) return

    const messageContent =
      images.length > 0
        ? `${textToSend || 'Please analyze these images and help me with any scheduling or calendar-related content.'}`
        : textToSend

    posthog?.capture('chat_message_sent', {
      has_images: images.length > 0,
      image_count: images.length,
      message_length: messageContent.length,
      active_view: activeTab,
      is_new_conversation: !selectedConversationId,
    })

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

    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])

    setError(null)
    resetStreamingState()

    const imageData = userMessage.images?.map((img) => ({
      type: 'image' as const,
      data: img.data,
      mimeType: img.mimeType,
    }))

    try {
      await sendStreamingMessage(messageContent, selectedConversationId || undefined, imageData)
    } catch (error) {
      console.error('Failed to send message:', error)
      setError(error instanceof Error ? error.message : 'Failed to send message')
    }
  }

  const handleResend = (text: string) => {
    toast.info(t('toast.regeneratingResponse'))
    handleSend(undefined, text)
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
    startRecording: originalStartRecording,
    stopRecording,
    cancelRecording,
    toggleRecording: originalToggleRecording,
  } = useSpeechRecognition((finalTranscription) => {
    handleSend(undefined, finalTranscription)
  })

  const startRecording = () => {
    posthog?.capture('voice_recording_started', {
      active_view: activeTab,
    })
    originalStartRecording()
  }

  const toggleRecording = () => {
    if (!isRecording) {
      posthog?.capture('voice_recording_started', {
        active_view: activeTab,
      })
    }
    originalToggleRecording()
  }

  useMutedSpeechDetection({
    isRecording,
    speechRecognitionSupported,
    onActivateMic: toggleRecording,
  })

  const handleOCRFilesSelected = useCallback(
    async (files: ImageFile[]) => {
      const filesToProcess = files.map((f) => ({
        file: f.file,
        base64: f.base64 || '',
        mimeType: f.file.type as SupportedMimeType,
      }))
      await uploadForExtraction(filesToProcess)
    },
    [uploadForExtraction],
  )

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, activeTab, streamingState.streamedText, hasPendingEvents])

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    avatarScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleClearChat = useCallback(() => {
    setMessages([])
  }, [setMessages])

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      handleSend(undefined, suggestion)
    },
    [handleSend],
  )

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <div className="relative mx-auto flex h-full w-full flex-1 flex-col overflow-hidden">
        <SubscriptionBanner />

        <ChatHeader onClearChat={handleClearChat} />

        {isLoadingConversation && <LoadingSpinner overlay />}

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {activeTab === 'avatar' ? (
            <AvatarView
              messages={messages}
              isRecording={isRecording}
              isSpeaking={isSpeaking}
              speakingMessageId={speakingMessageId}
              isLoading={isLoading}
              isTyping={input.trim().length > 0}
              onResend={handleResend}
              onEditAndResend={handleEditAndResend}
              onSpeak={speakText}
              avatarScrollRef={avatarScrollRef}
            />
          ) : (
            <ChatView
              messages={messages}
              isLoading={isLoading}
              error={error}
              isSpeaking={isSpeaking}
              speakingMessageId={speakingMessageId}
              onResend={handleResend}
              onEditAndResend={handleEditAndResend}
              onSpeak={speakText}
              scrollRef={scrollRef}
              streamingText={streamingState.streamedText}
              currentTool={streamingState.currentTool}
            />
          )}
        </div>

        {hasPendingEvents && (
          <div className="px-4 pb-2">
            <EventConfirmationCard
              events={pendingEvents}
              onConfirm={confirmOCREvents}
              onCancel={cancelPendingEvents}
              isLoading={isOCRConfirming}
            />
          </div>
        )}

        <div className="border-t border-border">
          <QuickSuggestions onSuggestionClick={handleSuggestionClick} disabled={isLoading} className="px-6 pt-4" />
          <ChatInput
            ref={textInputRef}
            input={input}
            isLoading={isLoading || isOCRUploading}
            isRecording={isRecording}
            speechRecognitionSupported={speechRecognitionSupported}
            speechRecognitionError={speechRecognitionError}
            interimTranscription={interimTranscription}
            images={images}
            selectedAttendees={selectedAttendees}
            onInputChange={setInput}
            onSubmit={handleSend}
            onToggleRecording={toggleRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onCancelRecording={cancelRecording}
            onCancel={isLoading ? handleCancel : undefined}
            onImagesChange={setImages}
            onAttendeesChange={setSelectedAttendees}
            shouldUseOCR={shouldUseOCR}
            onOCRFilesSelected={handleOCRFilesSelected}
            isOCRUploading={isOCRUploading}
            data-onboarding="chat-input"
          />
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
