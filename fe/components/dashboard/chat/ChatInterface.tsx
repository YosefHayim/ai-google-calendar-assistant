'use client'

import React, { useEffect, useRef, useState } from 'react'
import { decodeAudioData, getSpeechFromGemini } from '@/services/geminiService'
import { streamChatMessage, continueConversation, type ChatMessage as ChatHistoryMessage } from '@/services/chatService'

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
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
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
    if (!textToSend.trim() || isLoading || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsStreaming(true)
    setError(null)

    // Create placeholder for streaming message
    const assistantMessageId = (Date.now() + 1).toString()
    setStreamingMessageId(assistantMessageId)

    // Add empty assistant message that will be updated during streaming
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    const callbacks = {
      onChunk: () => {
        // Not used anymore - typewriter component handles animation
      },
      onComplete: (fullText: string, conversationId?: string, title?: string) => {
        // Set the full text immediately - typewriter will animate it
        setMessages((prev) => prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: fullText } : msg)))
        // Handle new conversation creation
        if (conversationId && !selectedConversationId) {
          setConversationId(conversationId)
          // Add new conversation to the list immediately with the generated title
          addConversationToList({
            id: conversationId,
            title: title || 'New Conversation',
            messageCount: 2, // user message + assistant response
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          })
        } else if (conversationId && title) {
          // Update title for existing conversation if a new title is provided
          updateConversationTitle(conversationId, title)
        }
        // Keep streaming flag true so typewriter animates
        // Note: isStreaming will be set to false when typewriter completes via handleTypewriterComplete
      },
      onError: (errorMsg: string) => {
        setError(errorMsg || 'Communication relay failed. Please retry.')
        setIsStreaming(false)
        setIsLoading(false)
        setStreamingMessageId(null)
        // Remove the empty assistant message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))
      },
    }

    try {
      if (selectedConversationId) {
        // Continue existing conversation
        await continueConversation(selectedConversationId, textToSend, callbacks)
      } else {
        // New conversation - build history for the API
        const history: ChatHistoryMessage[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))
        await streamChatMessage(textToSend, history, callbacks)
      }
    } catch (err) {
      setError('Communication relay failed. Please retry.')
      setIsStreaming(false)
      setIsLoading(false)
      setStreamingMessageId(null)
      console.error(err)
    }
  }

  const handleResend = (text: string) => {
    handleSend(undefined, text)
  }

  const handleEditMessage = (text: string) => {
    setInput(text)
    textInputRef.current?.focus()
  }

  const handleTypewriterComplete = () => {
    // Get the message before clearing the streaming ID
    const currentStreamingId = streamingMessageId
    const lastMessage = currentStreamingId
      ? messages.find((msg) => msg.role === 'assistant' && msg.id === currentStreamingId)
      : null

    setIsStreaming(false)
    setIsLoading(false)
    setStreamingMessageId(null)

    // Speak the response in avatar mode
    if (activeTab === 'avatar' && lastMessage?.content) {
      speakText(lastMessage.content.split('\n')[0])
    }
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
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full relative overflow-hidden">
        <ViewSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Loading overlay for conversation */}
        {isLoadingConversation && (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 z-20 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full" />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 relative">
          {activeTab === 'avatar' ? (
            <AvatarView
              messages={messages}
              isRecording={isRecording}
              isSpeaking={isSpeaking}
              isLoading={isLoading}
              isStreaming={isStreaming}
              streamingMessageId={streamingMessageId}
              onResend={handleResend}
              onEdit={handleEditMessage}
              onSpeak={speakText}
              onTypewriterComplete={handleTypewriterComplete}
              avatarScrollRef={avatarScrollRef}
            />
          ) : activeTab === '3d' ? (
            <ThreeDView />
          ) : (
            <ChatView
              messages={messages}
              isLoading={isLoading}
              isStreaming={isStreaming}
              streamingMessageId={streamingMessageId}
              error={error}
              isSpeaking={isSpeaking}
              onResend={handleResend}
              onEdit={handleEditMessage}
              onSpeak={speakText}
              onTypewriterComplete={handleTypewriterComplete}
              scrollRef={scrollRef}
            />
          )}
        </div>

        <ChatInput
          ref={textInputRef}
          input={input}
          isLoading={isLoading}
          isStreaming={isStreaming}
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
