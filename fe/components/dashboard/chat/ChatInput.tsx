'use client'

import { ArrowUp, Mic, X } from 'lucide-react'
import React, { forwardRef } from 'react'

import { AIVoiceInput } from '@/components/ui/ai-voice-input'

interface ChatInputProps {
  input: string
  isLoading: boolean
  isStreaming: boolean
  isRecording: boolean
  speechRecognitionSupported: boolean
  speechRecognitionError: string | null
  interimTranscription: string
  onInputChange: (value: string) => void
  onSubmit: (e?: React.FormEvent) => void
  onToggleRecording: () => void
  onStartRecording: () => void
  onStopRecording: (finalTranscription: string | null) => void
  onCancelRecording: () => void
  onInterimResult?: (text: string) => void
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  (
    {
      input,
      isLoading,
      isStreaming,
      isRecording,
      speechRecognitionSupported,
      speechRecognitionError,
      interimTranscription: _interimTranscription,
      onInputChange,
      onSubmit,
      onToggleRecording,
      onStartRecording,
      onStopRecording,
      onCancelRecording,
      onInterimResult,
    },
    textInputRef,
  ) => {
    const isDisabled = isLoading || isStreaming
    return (
      <div
        id="tour-chat-input"
        className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-white dark:from-zinc-950 via-white/80 to-transparent"
      >
        {isRecording ? (
          <div className="relative flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 transition-all">
            <AIVoiceInput
              onStart={onStartRecording}
              onStop={(duration, text) => onStopRecording(text)}
              onInterimResult={onInterimResult || (() => {})}
              isRecordingProp={isRecording}
              onToggleRecording={onToggleRecording}
              speechRecognitionSupported={speechRecognitionSupported}
              speechRecognitionError={speechRecognitionError}
            />
            <button
              onClick={onCancelRecording}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 gap-2"
          >
            <button
              type="button"
              onClick={onToggleRecording}
              className={`p-3 rounded-xl transition-all ${
                isRecording ? 'text-red-500 bg-red-50' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              disabled={isDisabled || !speechRecognitionSupported}
            >
              <Mic className="w-6 h-6" />
            </button>
            <input
              ref={textInputRef}
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="What do you have for me today? I'm ready to help you."
              className="flex-1 bg-transparent border-none outline-none py-4 px-2 text-zinc-800 dark:text-zinc-100 font-medium text-lg placeholder:italic placeholder:font-normal"
              disabled={isDisabled}
            />
            <button
              type="submit"
              disabled={!input.trim() || isDisabled}
              className={`p-3 rounded-xl transition-all ${
                input.trim() && !isDisabled
                  ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
              }`}
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          </form>
        )}
      </div>
    )
  },
)

ChatInput.displayName = 'ChatInput'
