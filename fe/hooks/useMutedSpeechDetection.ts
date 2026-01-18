'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { toast } from 'sonner'

interface UseMutedSpeechDetectionOptions {
  isRecording: boolean
  speechRecognitionSupported: boolean
  onActivateMic: () => void
  speechThreshold?: number
  toastCooldownMs?: number
  enabled?: boolean
}

const SPEECH_FRAMES_THRESHOLD = 5

/**
 * Hook for detecting speech when microphone is muted during voice interactions.
 *
 * Monitors audio input levels and shows toast notifications when speech is detected
 * while not actively recording, prompting users to activate their microphone.
 * Uses Web Audio API for real-time audio analysis and RMS calculations.
 *
 * @param options - Configuration options for speech detection
 * @param options.isRecording - Whether voice recording is currently active
 * @param options.speechRecognitionSupported - Whether speech recognition is supported
 * @param options.onActivateMic - Callback to activate microphone when speech is detected
 * @param options.speechThreshold - RMS threshold for speech detection (default: 0.02)
 * @param options.toastCooldownMs - Minimum time between toast notifications (default: 8000ms)
 * @param options.enabled - Whether speech detection is enabled (default: true)
 * @returns Object containing microphone permission status and listening controls
 */
export function useMutedSpeechDetection({
  isRecording,
  speechRecognitionSupported,
  onActivateMic,
  speechThreshold = 0.02,
  toastCooldownMs = 8000,
  enabled = true,
}: UseMutedSpeechDetectionOptions) {
  const [hasPermission, setHasPermission] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastToastTimeRef = useRef<number>(0)
  const consecutiveSpeechFramesRef = useRef<number>(0)
  const cleanedUpRef = useRef(false)

  const cleanup = useCallback(() => {
    cleanedUpRef.current = true

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    setIsListening(false)
  }, [])

  const showMutedToast = useCallback(() => {
    const now = Date.now()
    if (now - lastToastTimeRef.current < toastCooldownMs) {
      return
    }

    lastToastTimeRef.current = now

    toast.info('You seem to be speaking', {
      description: 'Click the microphone button to use voice input',
      duration: 5000,
      action: {
        label: 'Activate Mic',
        onClick: onActivateMic,
      },
    })
  }, [toastCooldownMs, onActivateMic])

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || cleanedUpRef.current || isRecording) {
      consecutiveSpeechFramesRef.current = 0
      return
    }

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current.getByteTimeDomainData(dataArray)

    // RMS (root mean square) calculation for audio level detection
    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      const normalizedValue = (dataArray[i] - 128) / 128
      sum += normalizedValue * normalizedValue
    }
    const rms = Math.sqrt(sum / bufferLength)

    if (rms > speechThreshold) {
      consecutiveSpeechFramesRef.current++

      if (consecutiveSpeechFramesRef.current >= SPEECH_FRAMES_THRESHOLD) {
        showMutedToast()
        consecutiveSpeechFramesRef.current = 0
      }
    } else {
      consecutiveSpeechFramesRef.current = 0
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudio)
  }, [isRecording, speechThreshold, showMutedToast])

  const startListening = useCallback(async () => {
    if (!speechRecognitionSupported || !enabled || cleanedUpRef.current) {
      return
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName })

      if (permissionStatus.state === 'denied') {
        return
      }

      if (permissionStatus.state !== 'granted') {
        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted') {
            setHasPermission(true)
          }
        }
        return
      }

      setHasPermission(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      if (cleanedUpRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      streamRef.current = stream

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.5

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      setIsListening(true)
      cleanedUpRef.current = false

      analyzeAudio()
    } catch (error) {
      console.debug('Muted speech detection: Could not access microphone', error)
    }
  }, [speechRecognitionSupported, enabled, analyzeAudio])

  const stopListening = useCallback(() => {
    cleanup()
  }, [cleanup])

  useEffect(() => {
    if (!enabled || !speechRecognitionSupported) {
      return
    }

    if (isRecording) {
      stopListening()
    } else if (hasPermission && !isListening) {
      cleanedUpRef.current = false
      startListening()
    }
  }, [isRecording, enabled, speechRecognitionSupported, hasPermission, isListening, startListening, stopListening])

  useEffect(() => {
    if (!enabled || !speechRecognitionSupported) {
      return
    }

    navigator.permissions?.query({ name: 'microphone' as PermissionName }).then((status) => {
      if (status.state === 'granted') {
        setHasPermission(true)
        cleanedUpRef.current = false
        startListening()
      }

      status.onchange = () => {
        if (status.state === 'granted') {
          setHasPermission(true)
          cleanedUpRef.current = false
          startListening()
        } else {
          setHasPermission(false)
          stopListening()
        }
      }
    })

    return () => {
      cleanup()
    }
  }, [enabled, speechRecognitionSupported, startListening, stopListening, cleanup])

  return {
    hasPermission,
    isListening,
    startListening,
    stopListening,
  }
}
