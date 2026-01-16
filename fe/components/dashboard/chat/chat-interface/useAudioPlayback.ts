'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ttsCache } from '@/services/tts-cache.service'

type VoiceType = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

interface AudioPlaybackOptions {
  voice?: VoiceType
  playbackSpeed?: number
}

export function useAudioPlayback(options: AudioPlaybackOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)

  const stopSpeaking = useCallback(() => {
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
  }, [])

  const speakText = useCallback(
    async (text: string, messageId?: string) => {
      if (messageId && speakingMessageId === messageId && isSpeaking) {
        stopSpeaking()
        toast.info('Audio stopped')
        return
      }

      stopSpeaking()

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }

      setIsSpeaking(true)
      setSpeakingMessageId(messageId || null)
      toast.info('Playing audio...')

      try {
        const audioArrayBuffer = await ttsCache.synthesize(text, options.voice)
        const audioBuffer = await audioContextRef.current.decodeAudioData(audioArrayBuffer)

        const source = audioContextRef.current.createBufferSource()
        audioSourceRef.current = source
        source.buffer = audioBuffer
        source.playbackRate.value = options.playbackSpeed ?? 1
        source.connect(audioContextRef.current.destination)
        source.onended = () => {
          setIsSpeaking(false)
          setSpeakingMessageId(null)
          audioSourceRef.current = null
        }
        source.start()
      } catch (audioError) {
        console.error('Error fetching or playing audio:', audioError)
        toast.error('Failed to play audio')
        setIsSpeaking(false)
        setSpeakingMessageId(null)
        audioSourceRef.current = null
        throw new Error('Could not play audio response.')
      }
    },
    [isSpeaking, speakingMessageId, stopSpeaking, options.voice, options.playbackSpeed]
  )

  return {
    isSpeaking,
    speakingMessageId,
    speakText,
    stopSpeaking,
  }
}
