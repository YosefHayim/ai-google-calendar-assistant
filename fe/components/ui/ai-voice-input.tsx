'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Mic } from 'lucide-react'
import { cn } from '@/components/../lib/utils' // Adjusted path for cn utility

interface AIVoiceInputProps {
  onStart?: () => void
  onStop?: (duration: number, transcribedText: string | null) => void
  onInterimResult?: (text: string) => void
  visualizerBars?: number
  demoMode?: boolean
  demoInterval?: number
  className?: string
  isRecordingProp: boolean // Prop to control recording state from parent
  onToggleRecording: () => void // Prop to signal parent to toggle recording
  speechRecognitionSupported: boolean
  speechRecognitionError: string | null
}

export function AIVoiceInput({
  onStart,
  onStop,
  onInterimResult,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
  isRecordingProp,
  onToggleRecording,
  speechRecognitionSupported,
  speechRecognitionError,
}: AIVoiceInputProps) {
  const [time, setTime] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [isDemo, setIsDemo] = useState(demoMode)
  const [audioLevels, setAudioLevels] = useState<number[]>(() => Array(visualizerBars).fill(5))

  // Audio analysis refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Generate deterministic heights for visualizer bars (fallback when not recording)
  const barHeights = useMemo(() => {
    return Array.from({ length: visualizerBars }, (_, i) => {
      // Use seeded pseudo-random based on index for consistent heights
      const seed = (i * 9301 + 49297) % 233280
      return 20 + (seed / 233280) * 80
    })
  }, [visualizerBars])

  // Analyze audio and update levels
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Sample frequency data to match number of bars
    const step = Math.floor(dataArray.length / visualizerBars)
    const levels = Array.from({ length: visualizerBars }, (_, i) => {
      const index = i * step
      // Get average of nearby frequencies for smoother visualization
      let sum = 0
      for (let j = 0; j < step; j++) {
        sum += dataArray[index + j] || 0
      }
      const avg = sum / step
      // Normalize to percentage (0-100) with minimum height
      return Math.max(5, (avg / 255) * 100)
    })

    setAudioLevels(levels)
    animationFrameRef.current = requestAnimationFrame(analyzeAudio)
  }, [visualizerBars])

  // Start audio analysis
  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      audioContextRef.current = new (
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.7

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      analyzeAudio()
    } catch (error) {
      console.error('Failed to start audio analysis:', error)
    }
  }, [analyzeAudio])

  // Stop audio analysis
  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    setAudioLevels(Array(visualizerBars).fill(5))
  }, [visualizerBars])

  // Handle recording state changes
  useEffect(() => {
    if (isRecordingProp) {
      startAudioAnalysis()
    } else {
      stopAudioAnalysis()
    }

    return () => {
      stopAudioAnalysis()
    }
  }, [isRecordingProp, startAudioAnalysis, stopAudioAnalysis])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Fix: Using ReturnType<typeof setInterval> instead of number to resolve NodeJS.Timeout type mismatch in hybrid environments
    let intervalId: ReturnType<typeof setInterval>

    if (isRecordingProp) {
      onStart?.()
      intervalId = setInterval(() => {
        setTime((t) => t + 1)
      }, 1000)
    } else {
      // onStop is called by the parent with transcribed text
      setTime(0)
    }

    return () => clearInterval(intervalId)
  }, [isRecordingProp, onStart]) // Removed onStop from dependencies here as it's triggered by parent

  useEffect(() => {
    if (!isDemo) return

    // Fix: Using ReturnType<typeof setTimeout> instead of number to resolve NodeJS.Timeout type mismatch in hybrid environments
    let timeoutId: ReturnType<typeof setTimeout>
    const runAnimation = () => {
      onToggleRecording() // Simulate start
      timeoutId = setTimeout(() => {
        onToggleRecording() // Simulate stop
        onStop?.(demoInterval / 1000, 'This is a demo transcription.') // Simulate transcription
        timeoutId = setTimeout(runAnimation, 1000)
      }, demoInterval)
    }

    const initialTimeout = setTimeout(runAnimation, 100)
    return () => {
      clearTimeout(timeoutId)
      clearTimeout(initialTimeout)
    }
  }, [isDemo, demoInterval, onToggleRecording, onStop])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleClick = () => {
    if (isDemo) {
      setIsDemo(false)
      onToggleRecording() // Stop demo, start actual recording
    } else {
      onToggleRecording() // Toggle actual recording
    }
  }

  const isButtonDisabled = !speechRecognitionSupported || !!speechRecognitionError

  return (
    <div className={cn('w-full py-4', className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            'group w-16 h-16 rounded-xl flex items-center justify-center transition-colors',
            isRecordingProp
              ? 'bg-none' // No specific background when active, the spinner is the focus
              : 'bg-none hover:bg-foreground/10 dark:hover:bg-background/10',
            isButtonDisabled && 'opacity-50 cursor-not-allowed',
          )}
          type="button"
          onClick={handleClick}
          disabled={isButtonDisabled}
          aria-label={isRecordingProp ? 'Stop recording' : 'Start recording'}
        >
          {isRecordingProp ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-primary dark:bg-primary cursor-pointer pointer-events-auto"
              style={{ animationDuration: '3s' }}
            />
          ) : (
            <Mic className="w-6 h-6 text-black/70 dark:text-white/70" />
          )}
        </button>

        <span
          className={cn(
            'font-mono text-sm transition-opacity duration-300',
            isRecordingProp ? 'text-black/70 dark:text-white/70' : 'text-black/30 dark:text-white/30',
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-8 w-64 flex items-center justify-center gap-0.5">
          {audioLevels.map((level, i) => (
            <div
              key={i}
              className={cn(
                'w-0.5 rounded-full transition-all',
                isRecordingProp
                  ? 'bg-primary dark:bg-primary duration-75'
                  : 'bg-foreground/10 dark:bg-background/10 duration-300 h-1',
              )}
              style={
                isRecordingProp && isClient
                  ? {
                      height: `${Math.max(8, level)}%`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-xs text-black/70 dark:text-white/70">
          {speechRecognitionError ? (
            <span className="text-destructive">{speechRecognitionError}</span>
          ) : isRecordingProp ? (
            'Listening... (speak in any language)'
          ) : (
            'Click to speak'
          )}
        </p>
      </div>
    </div>
  )
}
