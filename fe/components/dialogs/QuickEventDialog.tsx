'use client'

import { Calendar, Loader2, Mic, MicOff, Sparkles } from 'lucide-react'
import { ConfirmView, ConflictView, ErrorView, InputView, LoadingView, SuccessView } from './quick-event'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ParsedEventData, QuickAddConflict } from '@/types/api'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { AllyLogo } from '@/components/shared/logo'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ContactPicker } from '@/components/ui/contact-picker'
import { eventsService } from '@/services/events-service'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { voiceService } from '@/services/voice-service'

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
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])
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
      setSelectedAttendees([])
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
        setAllyMessage(t('dialogs.quickEvent.listeningToYou'))

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })

        try {
          const result = await voiceService.transcribe(audioBlob)
          if (result.status === 'success' && result.data?.text) {
            setText(result.data.text)
            setState('input')
            setAllyMessage('')
          } else {
            setState('error')
            setAllyMessage(result.message || t('dialogs.quickEvent.couldNotTranscribe'))
          }
        } catch {
          setState('error')
          setAllyMessage(t('dialogs.quickEvent.failedTranscribe'))
        }
      }

      mediaRecorder.start()
      setState('recording')
      setAllyMessage(t('dialogs.quickEvent.listening'))
    } catch {
      toast.error(t('toast.microphoneAccessDenied'), {
        description: t('dialogs.quickEvent.allowMicrophone'),
      })
    }
  }, [t])

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
    async (inputText: string, attendees: string[]) => {
      if (!inputText.trim() || inputText.length < MIN_TEXT_LENGTH) return

      setState('parsing')
      setAllyMessage(t('dialogs.quickEvent.understanding'))

      const fullText = attendees.length > 0 ? `${inputText}. Invite ${attendees.join(', ')}` : inputText
      const response = await eventsService.quickAdd({ text: fullText, forceCreate: false })

      if (response.success) {
        const data = response.data
        setState('success')
        setAllyMessage(t('dialogs.quickEvent.eventAdded'))
        setParsedEvent(data.parsed ?? null)
        setCalendarName(data.calendarName ?? '')
        setEventUrl(data.eventUrl ?? '')
        toast.success(t('toast.eventCreated'))
        onEventCreated?.()
      } else if (response.requiresConfirmation) {
        const conflictData = response.data
        setState('conflict')
        setParsedEvent(conflictData.parsed ?? null)
        setConflicts(conflictData.conflicts ?? [])
        setCalendarName(conflictData.calendarName ?? '')
        setAllyMessage(t('dialogs.quickEvent.conflictDetected'))
      } else {
        setState('error')
        setAllyMessage(response.error || t('dialogs.quickEvent.failedCreate'))
      }
    },
    [onEventCreated, t],
  )

  const handleForceCreate = useCallback(async () => {
    setState('creating')
    setAllyMessage(t('dialogs.quickEvent.creatingAnyway'))

    const fullText = selectedAttendees.length > 0 ? `${text}. Invite ${selectedAttendees.join(', ')}` : text
    const response = await eventsService.quickAdd({ text: fullText, forceCreate: true })

    if (response.success) {
      setState('success')
      setAllyMessage(t('dialogs.quickEvent.eventAdded'))
      setParsedEvent(response.data.parsed ?? null)
      setCalendarName(response.data.calendarName ?? '')
      setEventUrl(response.data.eventUrl ?? '')
      toast.success(t('toast.eventCreated'))
      onEventCreated?.()
    } else {
      setState('error')
      const errorMsg = response.requiresConfirmation ? t('dialogs.quickEvent.unexpectedConflict') : response.error
      setAllyMessage(errorMsg || t('dialogs.quickEvent.failedCreate'))
    }
  }, [text, selectedAttendees, onEventCreated, t])

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
        processText(text, selectedAttendees)
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
      <DialogContent className="w-[95vw] max-w-2xl gap-0 overflow-hidden border bg-background bg-secondary p-0 sm:w-full">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('dialogs.quickEvent.title')}</DialogTitle>
          <DialogDescription>{t('dialogs.quickEvent.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[400px] flex-col sm:min-h-[500px] sm:flex-row">
          <div className="flex flex-1 flex-col border-r p-4 sm:border-r sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">{t('dialogs.quickEvent.title')}</h3>
            </div>

            <div className="relative flex-1">
              <textarea
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder={`${t('dialogs.quickEvent.placeholder')}

${t('dialogs.quickEvent.examples')}
• ${t('dialogs.quickEvent.example1')}
• ${t('dialogs.quickEvent.example2')}
• ${t('dialogs.quickEvent.example3')}`}
                className="h-full w-full resize-none rounded-lg bg-muted bg-secondary p-4 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                    ? 'animate-pulse bg-destructive text-foreground hover:bg-destructive'
                    : 'bg-accent text-muted-foreground hover:bg-muted'
                }`}
              >
                {state === 'recording' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              <ContactPicker
                selectedEmails={selectedAttendees}
                onSelectionChange={setSelectedAttendees}
                placeholder={t('dialogs.quickEvent.addAttendees', 'Add attendees (optional)')}
                disabled={isDisabled}
              />

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  {state === 'recording' ? t('dialogs.quickEvent.recording') : t('dialogs.quickEvent.pressEnter')}
                </p>
                <Button
                  onClick={() => processText(text, selectedAttendees)}
                  disabled={text.trim().length < MIN_TEXT_LENGTH || isDisabled}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  {state === 'parsing' || state === 'transcribing' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('dialogs.quickEvent.processing')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t('dialogs.quickEvent.createEvent')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col border border-t bg-muted bg-secondary/50 p-4 sm:w-72 sm:border-l sm:border-t-0 sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background bg-secondary">
                <AllyLogo className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{t('dialogs.quickEvent.ally')}</h4>
                <p className="text-xs text-muted-foreground">{t('dialogs.quickEvent.yourAIAssistant')}</p>
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
