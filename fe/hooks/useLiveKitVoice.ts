'use client'

import { Participant, RemoteTrack, RemoteTrackPublication, Room, RoomEvent, Track } from 'livekit-client'
import { useCallback, useEffect, useRef, useState } from 'react'

import { voiceService } from '@/services/voice.service'

export type LiveKitVoiceState = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error'

interface UseLiveKitVoiceOptions {
  onTranscript?: (text: string, isFinal: boolean) => void
  onAgentSpeaking?: (isSpeaking: boolean) => void
  onError?: (error: string) => void
}

/**
 * Hook for managing real-time voice conversations using LiveKit.
 *
 * Handles connection to LiveKit room, audio track management, transcript processing,
 * and microphone control for AI voice interactions.
 *
 * @param options - Configuration options for voice interaction callbacks
 * @param options.onTranscript - Called when speech-to-text transcript is received
 * @param options.onAgentSpeaking - Called when agent starts/stops speaking
 * @param options.onError - Called when connection or audio errors occur
 * @returns Object containing voice state, controls, and connection methods
 */
export function useLiveKitVoice(options: UseLiveKitVoiceOptions = {}) {
  const { onTranscript, onAgentSpeaking, onError } = options

  const [state, setState] = useState<LiveKitVoiceState>('idle')
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')

  const roomRef = useRef<Room | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  const handleTrackSubscribed = useCallback(
    (track: RemoteTrack, publication: RemoteTrackPublication, participant: Participant) => {
      if (track.kind === Track.Kind.Audio) {
        if (!audioElementRef.current) {
          audioElementRef.current = document.createElement('audio')
          audioElementRef.current.autoplay = true
          document.body.appendChild(audioElementRef.current)
        }
        track.attach(audioElementRef.current)
        setIsAgentSpeaking(true)
        onAgentSpeaking?.(true)
      }
    },
    [onAgentSpeaking],
  )

  const handleTrackUnsubscribed = useCallback(
    (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Audio) {
        track.detach()
        setIsAgentSpeaking(false)
        onAgentSpeaking?.(false)
      }
    },
    [onAgentSpeaking],
  )

  const handleDataReceived = useCallback(
    (payload: Uint8Array, participant?: Participant) => {
      try {
        const decoder = new TextDecoder()
        const message = JSON.parse(decoder.decode(payload))

        if (message.type === 'transcript') {
          setTranscript(message.text)
          onTranscript?.(message.text, message.isFinal)
        }
      } catch {
        return
      }
    },
    [onTranscript],
  )

  const connect = useCallback(async () => {
    if (roomRef.current) {
      return
    }

    setState('connecting')

    try {
      const response = await voiceService.getLiveKitToken()

      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Failed to get LiveKit token')
      }

      const { token, wsUrl } = response.data

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      })

      room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
      room.on(RoomEvent.DataReceived, handleDataReceived)

      room.on(RoomEvent.Disconnected, () => {
        setState('idle')
        roomRef.current = null
      })

      await room.connect(wsUrl, token)

      await room.localParticipant.setMicrophoneEnabled(true)

      roomRef.current = room
      setState('connected')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed'
      setState('error')
      onError?.(message)
    }
  }, [handleTrackSubscribed, handleTrackUnsubscribed, handleDataReceived, onError])

  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect()
      roomRef.current = null
    }

    if (audioElementRef.current) {
      audioElementRef.current.remove()
      audioElementRef.current = null
    }

    setState('idle')
    setIsAgentSpeaking(false)
    setTranscript('')
  }, [])

  const toggleMicrophone = useCallback(async () => {
    if (!roomRef.current) return

    const currentEnabled = roomRef.current.localParticipant.isMicrophoneEnabled
    await roomRef.current.localParticipant.setMicrophoneEnabled(!currentEnabled)
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    state,
    isAgentSpeaking,
    transcript,
    isConnected: state === 'connected' || state === 'speaking' || state === 'listening',
    isMicrophoneEnabled: roomRef.current?.localParticipant?.isMicrophoneEnabled ?? false,
    connect,
    disconnect,
    toggleMicrophone,
  }
}
