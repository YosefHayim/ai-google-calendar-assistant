import { useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { voiceService } from '@/services/voice.service'
import type { TTSVoice, PlaybackSpeed } from '@/lib/validations/preferences'

interface UseVoicePreviewOptions {
  previewText: string
}

interface UseVoicePreviewReturn {
  isPlaying: boolean
  isLoading: boolean
  playPreview: (voice: TTSVoice, speed: PlaybackSpeed) => Promise<void>
  stopPreview: () => void
}

export function useVoicePreview({
  previewText,
}: UseVoicePreviewOptions): UseVoicePreviewReturn {
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const isPlayingRef = useRef(false)
  const isLoadingRef = useRef(false)

  const stopPreview = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop()
      } catch {
        // Already stopped
      }
      sourceRef.current = null
    }
    isPlayingRef.current = false
  }, [])

  const playPreview = useCallback(async (voice: TTSVoice, speed: PlaybackSpeed) => {
    if (isPlayingRef.current) {
      stopPreview()
      return
    }

    isLoadingRef.current = true
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
        isPlayingRef.current = false
        sourceRef.current = null
      }

      sourceRef.current = source
      isPlayingRef.current = true
      isLoadingRef.current = false
      source.start()
    } catch (error) {
      console.error('Error playing voice preview:', error)
      toast.error('Failed to play voice preview')
      isPlayingRef.current = false
      isLoadingRef.current = false
    }
  }, [previewText, stopPreview])

  useEffect(() => {
    return () => {
      stopPreview()
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [stopPreview])

  return {
    isPlaying: isPlayingRef.current,
    isLoading: isLoadingRef.current,
    playPreview,
    stopPreview,
  }
}
