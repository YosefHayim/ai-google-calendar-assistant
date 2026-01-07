'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventType) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventType) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEventType {
  resultIndex: number
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      [index: number]: { transcript: string }
    }
  }
}

interface SpeechRecognitionErrorEventType {
  error: string
}

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

export const useSpeechRecognition = (onFinalTranscription: (text: string) => void): UseSpeechRecognitionReturn => {
  const [isRecording, setIsRecording] = useState(false)
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false)
  const [speechRecognitionError, setSpeechRecognitionError] = useState<string | null>(null)
  const [interimTranscription, setInterimTranscription] = useState<string>('')

  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const isRecognitionRunning = useRef<boolean>(false)
  const onFinalTranscriptionRef = useRef(onFinalTranscription)
  
  useEffect(() => {
    onFinalTranscriptionRef.current = onFinalTranscription
  }, [onFinalTranscription])

  const stopRecording = useCallback((finalTranscription?: string | null) => {
    if (speechRecognitionRef.current && isRecognitionRunning.current) {
      try {
        speechRecognitionRef.current.stop()
      } catch {
        // Silently handle if already stopped
      }
      isRecognitionRunning.current = false
    }
    setIsRecording(false)

    setInterimTranscription((currentInterim) => {
      const textToSend = finalTranscription || currentInterim
      if (textToSend.trim()) {
        onFinalTranscriptionRef.current(textToSend)
      }
      return ''
    })
  }, [])

  const cancelRecording = useCallback(() => {
    if (speechRecognitionRef.current && isRecognitionRunning.current) {
      try {
        speechRecognitionRef.current.stop()
      } catch {
        // Silent recovery
      }
      isRecognitionRunning.current = false
    }
    setIsRecording(false)
    setInterimTranscription('')
  }, [])

  const startRecording = useCallback(async () => {
    if (isRecognitionRunning.current) return

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setSpeechRecognitionError(null)

      if (speechRecognitionRef.current) {
        setInterimTranscription('')
        speechRecognitionRef.current.start()
        isRecognitionRunning.current = true
        setIsRecording(true)
      }
    } catch {
      setSpeechRecognitionError('Microphone access denied.')
      setIsRecording(false)
      isRecognitionRunning.current = false
    }
  }, [])

  const toggleRecording = useCallback(() => {
    if (isRecording || isRecognitionRunning.current) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, stopRecording, startRecording])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = (window as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition || 
        (window as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition
      
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: SpeechRecognitionEventType) => {
          let interim = ''
          let final = ''
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript
            } else {
              interim += event.results[i][0].transcript
            }
          }
          setInterimTranscription(interim)
          if (final) {
            stopRecording(final)
          }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEventType) => {
          if (event.error !== 'aborted') {
            console.error('Speech recognition error:', event.error)
            if (event.error === 'not-allowed') {
              setSpeechRecognitionError('Microphone access denied.')
            }
          }
          setIsRecording(false)
          isRecognitionRunning.current = false
          setInterimTranscription('')
        }

        recognition.onend = () => {
          isRecognitionRunning.current = false
          setIsRecording(false)
        }

        speechRecognitionRef.current = recognition
        setSpeechRecognitionSupported(true)
      } else {
        setSpeechRecognitionError('Speech-to-Text not supported in this browser.')
      }
    }

    return () => {
      if (speechRecognitionRef.current && isRecognitionRunning.current) {
        try {
          speechRecognitionRef.current.stop()
        } catch {
          // Intentionally ignoring stop errors during cleanup
        }
      }
    }
  }, [stopRecording])

  return {
    isRecording,
    speechRecognitionSupported,
    speechRecognitionError,
    interimTranscription,
    startRecording,
    stopRecording,
    cancelRecording,
    toggleRecording,
  }
}
