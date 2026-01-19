'use client'

import React from 'react'
import { Typewriter } from '@/components/ui/typewriter'
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb'
import { cn } from '@/lib/utils'

interface AssistantAvatarProps {
  isRecording: boolean
  isSpeaking: boolean
  isLoading: boolean
  compact?: boolean
}

export const AssistantAvatar: React.FC<AssistantAvatarProps> = ({ isRecording, isSpeaking, isLoading, compact }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center transition-all duration-700',
        compact ? 'scale-75 md:scale-90' : 'h-full w-full animate-in zoom-in',
      )}
    >
      <div
        className={cn(
          'relative flex items-center justify-center',
          compact
            ? 'w-[200px] h-[200px] md:w-[300px] md:h-[300px]'
            : 'w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[450px] md:h-[450px]',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-primary/20 blur-[100px] transition-all duration-1000',
            isSpeaking || isLoading ? 'scale-125 opacity-40' : 'scale-100 opacity-10',
          )}
        />
        <div className="w-full h-full relative">
          <VoicePoweredOrb
            enableVoiceControl={isRecording || isSpeaking}
            isLoading={isLoading}
            className="w-full h-full rounded-full"
            maxRotationSpeed={1.0}
            voiceSensitivity={1.5}
          />
        </div>
      </div>
      <div className={cn('text-center relative z-10 px-4', compact ? 'mt-4' : 'mt-8')}>
        <div
          className={cn(
            'font-medium text-foreground dark:text-primary-foreground tracking-tight flex flex-col items-center justify-center gap-2',
            compact ? 'text-xl' : 'text-3xl md:text-4xl',
          )}
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
              className="min-h-[1.5em] text-foreground dark:text-primary-foreground"
              cursorChar="_"
              cursorClassName="text-primary ml-1"
            />
          </div>

          {isRecording && (
            <div className="flex items-center gap-2 text-destructive text-xs font-bold uppercase tracking-widest animate-pulse mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
              Listening...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
