'use client'

import { useState, useEffect, useRef } from 'react'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
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

  const speechRecognitionRef = useRef<any | null>(null)
  const isRecognitionRunning = useRef<boolean>(false)

  const stopRecording = (finalTranscription?: string | null) => {
    if (speechRecognitionRef.current && isRecognitionRunning.current) {
      try {
        speechRecognitionRef.current.stop()
      } catch (e) {
        // Silently handle if already stopped
      }
      isRecognitionRunning.current = false
    }
    setIsRecording(false)

    const textToSend = finalTranscription || interimTranscription
    setInterimTranscription('')

    if (textToSend.trim()) {
      onFinalTranscription(textToSend)
    }
  }

  const cancelRecording = () => {
    if (speechRecognitionRef.current && isRecognitionRunning.current) {
      try {
        speechRecognitionRef.current.stop()
      } catch (e) {
        // Silent recovery
      }
      isRecognitionRunning.current = false
    }
    setIsRecording(false)
    setInterimTranscription('')
  }

  const startRecording = async () => {
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
    } catch (err) {
      setSpeechRecognitionError('Microphone access denied.')
      setIsRecording(false)
      isRecognitionRunning.current = false
    }
  }

  const toggleRecording = () => {
    if (isRecording || isRecognitionRunning.current) {
      stopRecording(interimTranscription)
    } else {
      startRecording()
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
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

      recognition.onerror = (event: any) => {
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
