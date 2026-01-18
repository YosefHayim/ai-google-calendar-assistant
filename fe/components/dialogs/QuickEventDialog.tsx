'use client'

import { Calendar, Loader2, Mic, MicOff, Sparkles } from 'lucide-react'
import { ConfirmView, ConflictView, ErrorView, InputView, LoadingView, SuccessView } from './quick-event'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ParsedEventData, QuickAddConflict } from '@/types/api'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { AllyLogo } from '@/components/shared/logo'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { eventsService } from '@/services/events.service'
import { toast } from 'sonner'
import { voiceService } from '@/services/voice.service'

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

const MIN_TEXT_LENGTH = 5

export const QuickEventDialog: React.FC<QuickEventDialogProps> = ({ isOpen, onClose, onEventCreated }) => {
  const [text, setText] = useState('')
  const [state, setState] = useState<DialogState>('input')
  const [parsedEvent, setParsedEvent] = useState<ParsedEventData | null>(null)
  const [conflicts, setConflicts] = useState<QuickAddConflict[]>([])
  const [calendarName, setCalendarName] = useState<string>('')
  const [eventUrl, setEventUrl] = useState<string>('')
  const [allyMessage, setAllyMessage] = useState<string>('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (isOpen) {
      setText('')
      setState('input')
      setParsedEvent(null)
      setConflicts([])
      setCalendarName('')
      setEventUrl('')
      setAllyMessage('')
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
          }
        } catch {
          setState('error')
          setAllyMessage('Failed to transcribe audio. Please try again.')
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
      if (!inputText.trim() || inputText.length < MIN_TEXT_LENGTH) return

      setState('parsing')
      setAllyMessage('Understanding your request...')

      const response = await eventsService.quickAdd({ text: inputText, forceCreate: false })

      if (response.success) {
        const data = response.data
        setState('success')
        setAllyMessage('Event added to your calendar!')
        setParsedEvent(data.parsed ?? null)
        setCalendarName(data.calendarName ?? '')
        setEventUrl(data.eventUrl ?? '')
        toast.success('Event created successfully')
        onEventCreated?.()
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
      }
    },
    [onEventCreated],
  )

  const handleForceCreate = useCallback(async () => {
    setState('creating')
    setAllyMessage('Creating event anyway...')

    const response = await eventsService.quickAdd({ text, forceCreate: true })

    if (response.success) {
      setState('success')
      setAllyMessage('Event added to your calendar!')
      setParsedEvent(response.data.parsed ?? null)
      setCalendarName(response.data.calendarName ?? '')
      setEventUrl(response.data.eventUrl ?? '')
      toast.success('Event created successfully')
      onEventCreated?.()
    } else {
      setState('error')
      const errorMsg = response.requiresConfirmation ? 'Unexpected conflict' : response.error
      setAllyMessage(errorMsg || 'Failed to create event.')
    }
  }, [text, onEventCreated])

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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (text.trim().length >= MIN_TEXT_LENGTH) {
        processText(text)
      }
    }
  }

  const resetState = () => {
    setState('input')
    setAllyMessage('')
    setConflicts([])
  }

  const isDisabled = state === 'creating' || state === 'success' || state === 'transcribing' || state === 'parsing'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full p-0 gap-0 overflow-hidden bg-background dark:bg-secondary border dark:border">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Add Event</DialogTitle>
          <DialogDescription>Add an event to your calendar using natural language or voice</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row min-h-[400px] sm:min-h-[500px]">
          <div className="flex-1 p-4 sm:p-6 flex flex-col border-r border dark:border sm:border-r">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground dark:text-primary-foreground">Quick Add Event</h3>
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
                className="w-full h-full resize-none bg-muted dark:bg-secondary border border dark:border rounded-lg p-4 pr-12 text-foreground dark:text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isDisabled}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleRecording}
                disabled={isDisabled}
                className={`absolute right-3 top-3 rounded-full ${
                  state === 'recording'
                    ? 'bg-destructive text-white animate-pulse hover:bg-destructive'
                    : 'bg-accent dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                }`}
              >
                {state === 'recording' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {state === 'recording' ? 'Recording... Click mic to stop' : 'Press Enter to process'}
              </p>
              <Button
                onClick={() => processText(text)}
                disabled={text.trim().length < MIN_TEXT_LENGTH || isDisabled}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
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

          <div className="w-full sm:w-72 p-4 sm:p-6 bg-muted dark:bg-secondary/50 flex flex-col border-t sm:border-t-0 sm:border-l border dark:border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-secondary dark:bg-background rounded-lg flex items-center justify-center">
                <AllyLogo className="w-6 h-6 text-white dark:text-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground dark:text-primary-foreground">Ally</h4>
                <p className="text-xs text-muted-foreground">Your AI Assistant</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {(state === 'input' || state === 'recording') && <InputView state={state} />}

              {(state === 'transcribing' || state === 'parsing' || state === 'creating') && (
                <LoadingView message={allyMessage} />
              )}

              {state === 'confirm' && parsedEvent && (
                <ConfirmView
                  event={parsedEvent}
                  calendarName={calendarName}
                  message={allyMessage}
                  onConfirm={handleForceCreate}
                />
              )}

              {state === 'conflict' && parsedEvent && (
                <ConflictView
                  event={parsedEvent}
                  calendarName={calendarName}
                  conflicts={conflicts}
                  message={allyMessage}
                  onConfirm={handleForceCreate}
                  onCancel={resetState}
                />
              )}

              {state === 'success' && (
                <SuccessView message={allyMessage} calendarName={calendarName} eventUrl={eventUrl} onClose={onClose} />
              )}

              {state === 'error' && <ErrorView message={allyMessage} onRetry={resetState} />}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QuickEventDialog
