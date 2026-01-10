'use client'

import { ArrowUp, Mic, Square, X } from 'lucide-react'
import React, { forwardRef, useMemo } from 'react'

import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getTextDirection } from '@/lib/utils'

interface ChatInputProps {
  input: string
  isLoading: boolean
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
  onCancel?: () => void
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  (
    {
      input,
      isLoading,
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
      onCancel,
    },
    textInputRef,
  ) => {
    const isDisabled = isLoading && !onCancel
    const inputDirection = useMemo(() => getTextDirection(input), [input])

    return (
      <div
        id="tour-chat-input"
        className="sticky bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-white dark:from-zinc-950 via-white/80 to-transparent"
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
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancelRecording}
              className="absolute top-4 right-4 text-zinc-400"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 gap-2"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggleRecording}
              className={`h-12 w-12 rounded-xl ${
                isRecording ? 'text-red-500 bg-red-50' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              disabled={isDisabled || !speechRecognitionSupported}
            >
              <Mic className="w-6 h-6" />
            </Button>
            <Input
              ref={textInputRef}
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="What do you have for me today? I'm ready to help you."
              className={`flex-1 h-14 bg-transparent border-0 shadow-none focus-visible:ring-0 text-lg font-medium placeholder:italic placeholder:font-normal ${inputDirection === 'rtl' ? 'text-right' : ''}`}
              disabled={isDisabled}
              dir={inputDirection}
            />
            {isLoading && onCancel ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={onCancel}
                className="h-12 w-12 rounded-xl"
              >
                <Square className="w-6 h-6" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className={`h-12 w-12 rounded-xl ${
                  input.trim() && !isLoading
                    ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}
              >
                <ArrowUp className="w-6 h-6" />
              </Button>
            )}
          </form>
        )}
      </div>
    )
  },
)

ChatInput.displayName = 'ChatInput'
