import type { PlaybackSpeed, TTSVoice } from '@/lib/validations/preferences'
import { useCallback, useEffect, useRef, useState } from 'react'

import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { voiceService } from '@/services/voice.service'

interface UseVoicePreviewOptions {
  previewText: string
}

interface UseVoicePreviewReturn {
  isPlaying: boolean
  isLoading: boolean
  playPreview: (voice: TTSVoice, speed: PlaybackSpeed) => Promise<void>
  stopPreview: () => void
}

export function useVoicePreview({ previewText }: UseVoicePreviewOptions): UseVoicePreviewReturn {
  const { t } = useTranslation()
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const stopPreview = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop()
      } catch {
        // Already stopped
      }
      sourceRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const playPreview = useCallback(
    async (voice: TTSVoice, speed: PlaybackSpeed) => {
      if (isPlaying) {
        stopPreview()
        return
      }

      setIsLoading(true)
      try {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new (
            window.AudioContext ||
            (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          )()
        }

        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }

        const audioArrayBuffer = await voiceService.synthesize(previewText, voice)
        const audioBuffer = await audioContextRef.current.decodeAudioData(audioArrayBuffer)

        const source = audioContextRef.current.createBufferSource()
        source.buffer = audioBuffer
        source.playbackRate.value = speed
        source.connect(audioContextRef.current.destination)
        source.onended = () => {
          setIsPlaying(false)
          sourceRef.current = null
        }

        sourceRef.current = source
        setIsPlaying(true)
        setIsLoading(false)
        source.start()
      } catch (error) {
        console.error('Error playing voice preview:', error)
        toast.error(t('toast.voicePreviewError'))
        setIsPlaying(false)
        setIsLoading(false)
      }
    },
    [previewText, stopPreview, isPlaying],
  )

  useEffect(() => {
    return () => {
      stopPreview()
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [stopPreview])

  return {
    isPlaying,
    isLoading,
    playPreview,
    stopPreview,
  }
}
