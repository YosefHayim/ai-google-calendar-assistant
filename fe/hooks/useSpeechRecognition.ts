'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { transcribeAudio } from '@/services/voice.service'

interface UseSpeechRecognitionReturn {
  isRecording: boolean
  speechRecognitionSupported: boolean
  speechRecognitionError: string | null
  interimTranscription: string
  startRecording: () => Promise<void>
  stopRecording: (finalTranscription?: string | null) => void
  cancelRecording: () => void
  toggleRecording: () => void
}

/**
 * Hook for speech recognition using OpenAI Whisper API
 * Supports automatic language detection for any language
 */
export const useSpeechRecognition = (onFinalTranscription: (text: string) => void): UseSpeechRecognitionReturn => {
  const [isRecording, setIsRecording] = useState(false)
  const [speechRecognitionError, setSpeechRecognitionError] = useState<string | null>(null)
  const [interimTranscription, setInterimTranscription] = useState<string>('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const onFinalTranscriptionRef = useRef(onFinalTranscription)

  // Update ref when callback changes
  onFinalTranscriptionRef.current = onFinalTranscription

  // Check if MediaRecorder is supported (client-side only)
  useEffect(() => {
    setSpeechRecognitionSupported('MediaRecorder' in window)
  }, [])

  const cleanupRecording = useCallback(() => {
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    mediaRecorderRef.current = null
    audioChunksRef.current = []
  }, [])

  const processAudio = useCallback(async (audioBlob: Blob) => {
    setIsTranscribing(true)
    setInterimTranscription('Transcribing...')

    try {
      const result = await transcribeAudio(audioBlob)

      if (result.success && result.text) {
        onFinalTranscriptionRef.current(result.text)
        setInterimTranscription('')
      } else {
        setSpeechRecognitionError(result.error || 'Transcription failed')
        setInterimTranscription('')
      }
    } catch (error) {
      console.error('Transcription error:', error)
      setSpeechRecognitionError('Failed to transcribe audio')
      setInterimTranscription('')
    } finally {
      setIsTranscribing(false)
    }
  }, [])

  const stopRecording = useCallback(
    (finalTranscription?: string | null) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        // If a final transcription is provided (from parent), use it directly
        if (finalTranscription) {
          mediaRecorderRef.current.stop()
          cleanupRecording()
          setIsRecording(false)
          onFinalTranscriptionRef.current(finalTranscription)
          return
        }

        // Otherwise, stop recording and process the audio
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
    },
    [cleanupRecording],
  )

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    cleanupRecording()
    setIsRecording(false)
    setInterimTranscription('')
    setSpeechRecognitionError(null)
  }, [cleanupRecording])

  const startRecording = useCallback(async () => {
    if (isRecording || isTranscribing) return

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setSpeechRecognitionError(null)
      audioChunksRef.current = []

      // Determine supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : 'audio/wav'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Create blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        cleanupRecording()

        // Only process if we have audio data
        if (audioBlob.size > 0) {
          await processAudio(audioBlob)
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setSpeechRecognitionError('Recording failed')
        cleanupRecording()
        setIsRecording(false)
      }

      // Start recording
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setInterimTranscription('Listening...')
    } catch (error) {
      console.error('Failed to start recording:', error)
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setSpeechRecognitionError('Microphone access denied')
      } else {
        setSpeechRecognitionError('Failed to start recording')
      }
      setIsRecording(false)
    }
  }, [isRecording, isTranscribing, cleanupRecording, processAudio])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, stopRecording, startRecording])

  return {
    isRecording: isRecording || isTranscribing,
    speechRecognitionSupported,
    speechRecognitionError,
    interimTranscription,
    startRecording,
    stopRecording,
    cancelRecording,
    toggleRecording,
  }
}
