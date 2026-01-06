'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AllyLogo } from '@/components/shared/logo'
import { Calendar, Clock, MapPin, FileText, Loader2, Check, Sparkles, AlertCircle, Mic, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { eventsService } from '@/lib/api/services/events.service'
import { voiceService } from '@/lib/api/services/voice.service'
import { toast } from 'sonner'
import type { QuickAddConflict, ParsedEventData } from '@/types/api'

type QuickEventDialogProps = {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: () => void
}

type DialogState =
  | 'input'
  | 'recording'
  | 'transcribing'
  | 'parsing'
  | 'confirm'
  | 'conflict'
  | 'creating'
  | 'success'
  | 'error'

export const QuickEventDialog: React.FC<QuickEventDialogProps> = ({ isOpen, onClose, onEventCreated }) => {
  const [text, setText] = useState('')
  const [state, setState] = useState<DialogState>('input')
  const [parsedEvent, setParsedEvent] = useState<ParsedEventData | null>(null)
  const [conflicts, setConflicts] = useState<QuickAddConflict[]>([])
  const [calendarName, setCalendarName] = useState<string>('')
  const [allyMessage, setAllyMessage] = useState<string>('')
  const [, setErrorMessage] = useState<string>('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (isOpen) {
      setText('')
      setState('input')
      setParsedEvent(null)
      setConflicts([])
      setCalendarName('')
      setAllyMessage('')
      setErrorMessage('')
    }
  }, [isOpen])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())

        if (chunksRef.current.length === 0) {
          setState('input')
          return
        }

        setState('transcribing')
        setAllyMessage('Listening to what you said...')

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })

        try {
          const result = await voiceService.transcribe(audioBlob)
          if (result.status === 'success' && result.data?.text) {
            setText(result.data.text)
            setState('input')
            setAllyMessage('')
          } else {
            setState('error')
            setAllyMessage(result.message || 'Could not transcribe audio.')
            setErrorMessage(result.message || 'Transcription failed')
          }
        } catch {
          setState('error')
          setAllyMessage('Failed to transcribe audio. Please try again.')
          setErrorMessage('Transcription failed')
        }
      }

      mediaRecorder.start()
      setState('recording')
      setAllyMessage('Listening... Click again to stop.')
    } catch {
      toast.error('Microphone access denied', {
        description: 'Please allow microphone access to use voice input.',
      })
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const toggleRecording = useCallback(() => {
    if (state === 'recording') {
      stopRecording()
    } else if (state === 'input') {
      startRecording()
    }
  }, [state, startRecording, stopRecording])

  const processText = useCallback(
    async (inputText: string) => {
      const minLength = 5
      if (!inputText.trim() || inputText.length < minLength) return

      setState('parsing')
      setAllyMessage('Understanding your request...')

      const response = await eventsService.quickAdd({ text: inputText, forceCreate: false })

      if (response.success) {
        const data = response.data
        if (data.event) {
          setState('success')
          setAllyMessage('Event added to your calendar!')
          setParsedEvent(data.parsed ?? null)
          setCalendarName(data.calendarName ?? '')
          toast.success('Event created successfully')
          onEventCreated?.()
          const closeDelay = 1500
          setTimeout(() => onClose(), closeDelay)
        }
      } else if (response.requiresConfirmation) {
        const conflictData = response.data
        setState('conflict')
        setParsedEvent(conflictData.parsed ?? null)
        setConflicts(conflictData.conflicts ?? [])
        setCalendarName(conflictData.calendarName ?? '')
        setAllyMessage('This conflicts with existing events.')
      } else {
        setState('error')
        setAllyMessage(response.error || 'Failed to create event.')
        setErrorMessage(response.error || 'Unknown error')
      }
    },
    [onClose, onEventCreated],
  )

  const handleForceCreate = useCallback(async () => {
    setState('creating')
    setAllyMessage('Creating event anyway...')

    const response = await eventsService.quickAdd({ text, forceCreate: true })

    if (response.success) {
      setState('success')
      setAllyMessage('Event added to your calendar!')
      toast.success('Event created successfully')
      onEventCreated?.()
      const closeDelay = 1500
      setTimeout(() => onClose(), closeDelay)
    } else {
      setState('error')
      const errorMsg = response.requiresConfirmation ? 'Unexpected conflict' : response.error
      setAllyMessage(errorMsg || 'Failed to create event.')
      setErrorMessage(errorMsg || 'Unknown error')
    }
  }, [text, onClose, onEventCreated])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    if (state !== 'input' && state !== 'recording') {
      setState('input')
      setParsedEvent(null)
      setConflicts([])
      setAllyMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const minLength = 5
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (text.trim().length >= minLength) {
        processText(text)
      }
    }
  }

  const resetState = () => {
    setState('input')
    setErrorMessage('')
    setAllyMessage('')
    setConflicts([])
  }

  const isDisabled = state === 'creating' || state === 'success' || state === 'transcribing' || state === 'parsing'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Add Event</DialogTitle>
          <DialogDescription>Add an event to your calendar using natural language or voice</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[400px]">
          <div className="flex-1 p-6 flex flex-col border-r border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Quick Add Event</h3>
            </div>

            <div className="relative flex-1">
              <textarea
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder={`Describe your event in natural language...

Examples:
• Meeting with John tomorrow at 3pm
• Lunch at Cafe Roma on Friday 12:30pm for 1 hour
• Team standup every Monday at 9am`}
                className="w-full h-full resize-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 pr-12 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isDisabled}
              />
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isDisabled}
                className={`absolute right-3 top-3 p-2 rounded-full transition-all ${
                  state === 'recording'
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {state === 'recording' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-zinc-400">
                {state === 'recording' ? 'Recording... Click mic to stop' : 'Press Enter to process'}
              </p>
              <Button
                onClick={() => processText(text)}
                disabled={text.trim().length < 5 || isDisabled}
                variant="outline"
                size="sm"
              >
                {state === 'parsing' || state === 'transcribing' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Event
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="w-72 p-6 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center">
                <AllyLogo className="w-6 h-6 text-white dark:text-zinc-900" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Ally</h4>
                <p className="text-xs text-zinc-500">Your AI Assistant</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {(state === 'input' || state === 'recording') && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col items-center justify-center text-center"
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      state === 'recording' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                  >
                    {state === 'recording' ? (
                      <Mic className="w-8 h-8 text-red-500 animate-pulse" />
                    ) : (
                      <Calendar className="w-8 h-8 text-zinc-400" />
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {state === 'recording'
                      ? 'Listening... Speak your event details'
                      : 'Type or speak your event details'}
                  </p>
                </motion.div>
              )}

              {(state === 'transcribing' || state === 'parsing' || state === 'creating') && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">{allyMessage}</p>
                </motion.div>
              )}

              {state === 'confirm' && parsedEvent && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col"
                >
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">{allyMessage}</p>
                  <EventPreview event={parsedEvent} calendarName={calendarName} />
                  <Button onClick={handleForceCreate} className="w-full bg-primary hover:bg-primary-hover text-white">
                    <Check className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                </motion.div>
              )}

              {state === 'conflict' && parsedEvent && (
                <motion.div
                  key="conflict"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col"
                >
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">{allyMessage}</p>
                  <EventPreview event={parsedEvent} calendarName={calendarName} />
                  {conflicts.length > 0 && (
                    <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">Conflicts with:</p>
                      {conflicts.slice(0, 3).map((c) => (
                        <p key={c.id} className="text-xs text-amber-600 dark:text-amber-400">
                          • {c.summary}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Button onClick={handleForceCreate} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                      Create Anyway
                    </Button>
                    <Button onClick={resetState} variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}

              {state === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex-1 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">{allyMessage}</p>
                  {calendarName && <p className="text-xs text-zinc-500 mt-1">Added to {calendarName}</p>}
                </motion.div>
              )}

              {state === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">{allyMessage}</p>
                  <Button onClick={resetState} variant="outline" size="sm">
                    Try Again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EventPreview({ event, calendarName }: { event: ParsedEventData; calendarName?: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800 space-y-2 mb-3 text-left">
      <div className="flex items-start gap-2">
        <FileText className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-zinc-400">Event</p>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{event.summary}</p>
        </div>
      </div>
      {(event.date || event.time) && (
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-zinc-400">When</p>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">
              {event.date} {event.time && `at ${event.time}`}
              {event.duration && ` (${event.duration})`}
            </p>
          </div>
        </div>
      )}
      {event.location && (
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-zinc-400">Location</p>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">{event.location}</p>
          </div>
        </div>
      )}
      {calendarName && (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-zinc-400">Calendar</p>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">{calendarName}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickEventDialog
