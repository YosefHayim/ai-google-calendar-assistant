'use client'

import { useCallback, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { formatDate } from '@/lib/formatUtils'
import type { Event, ColorDefinition, ActionResult } from '../types'
import { CreateEventForm } from './CreateEventForm'
import { ViewEventDetails } from './ViewEventDetails'

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isCreating: boolean
  selectedEvent: Event | null
  newEvent: Partial<Event>
  onNewEventChange: (event: Partial<Event>) => void
  onCreateEvent: () => void
  onUpdateEvent: (id: string, event: Partial<Event>) => void
  onDeleteEvent: (id: string) => void
  categories: string[]
  colors: ColorDefinition[]
  availableTags: string[]
  getColorClasses: (color: string) => ColorDefinition
}

export function EventDialog({
  open,
  onOpenChange,
  isCreating,
  selectedEvent,
  newEvent,
  onNewEventChange,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  categories,
  colors,
  availableTags,
  getColorClasses,
}: EventDialogProps) {
  const [allyPrompt, setAllyPrompt] = useState('')
  const [allyResponse, setAllyResponse] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionResult, setActionResult] = useState<ActionResult | null>(null)

  const handleVoiceTranscription = useCallback((text: string) => {
    setAllyPrompt((prev) => (prev ? `${prev} ${text}` : text))
  }, [])

  const {
    isRecording,
    speechRecognitionSupported,
    speechRecognitionError,
    toggleRecording,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useSpeechRecognition(handleVoiceTranscription)

  const resetAllyState = useCallback(() => {
    setAllyPrompt('')
    setAllyResponse('')
    setIsProcessing(false)
    setActionResult(null)
  }, [])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onOpenChange(newOpen)
      if (!newOpen) {
        resetAllyState()
      }
    },
    [onOpenChange, resetAllyState],
  )

  const toggleTag = (tag: string) => {
    if (isCreating) {
      onNewEventChange({
        ...newEvent,
        tags: newEvent.tags?.includes(tag) ? newEvent.tags.filter((t) => t !== tag) : [...(newEvent.tags || []), tag],
      })
    }
  }

  const handleSendToAlly = useCallback(async () => {
    if (!allyPrompt.trim() || !selectedEvent || isProcessing) return

    setIsProcessing(true)
    setAllyResponse('')
    setActionResult(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const promptLower = allyPrompt.toLowerCase()

      if (promptLower.includes('delete') || promptLower.includes('remove') || promptLower.includes('cancel')) {
        setAllyResponse("I'll delete this event for you.")
        await new Promise((resolve) => setTimeout(resolve, 500))
        onDeleteEvent(selectedEvent.id)
        setActionResult({ type: 'deleted', message: 'Event deleted successfully' })
        setTimeout(() => {
          handleOpenChange(false)
        }, 1500)
      } else if (
        promptLower.includes('change') ||
        promptLower.includes('update') ||
        promptLower.includes('move') ||
        promptLower.includes('reschedule') ||
        promptLower.includes('rename') ||
        promptLower.includes('set')
      ) {
        let updatedEvent = { ...selectedEvent }
        let changeDescription = ''

        const titleMatch = promptLower.match(/(?:title|name|rename|call it)\s+(?:to\s+)?["']?([^"']+)["']?/i)
        if (titleMatch) {
          updatedEvent.title = titleMatch[1].trim()
          changeDescription = `Updated title to "${updatedEvent.title}"`
        }

        const timeMatch = promptLower.match(/(?:to|at)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
        if (timeMatch) {
          let hours = parseInt(timeMatch[1])
          const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0
          const ampm = timeMatch[3]?.toLowerCase()

          if (ampm === 'pm' && hours < 12) hours += 12
          if (ampm === 'am' && hours === 12) hours = 0

          const newStartTime = new Date(selectedEvent.startTime)
          newStartTime.setHours(hours, minutes)
          const duration = selectedEvent.endTime.getTime() - selectedEvent.startTime.getTime()
          const newEndTime = new Date(newStartTime.getTime() + duration)

          updatedEvent.startTime = newStartTime
          updatedEvent.endTime = newEndTime
          changeDescription = changeDescription
            ? `${changeDescription} and rescheduled to ${formatDate(newStartTime, 'TIME_12H')}`
            : `Rescheduled to ${formatDate(newStartTime, 'TIME_12H')}`
        }

        if (changeDescription) {
          setAllyResponse(`Done! ${changeDescription}.`)
          onUpdateEvent(selectedEvent.id, updatedEvent)
          setActionResult({ type: 'updated', message: changeDescription })
          setTimeout(() => {
            handleOpenChange(false)
          }, 1500)
        } else {
          setAllyResponse(
            'I understand you want to make changes. Could you be more specific? For example:\n• "Change the title to Weekly Standup"\n• "Move it to 3pm"\n• "Reschedule to tomorrow at 10am"',
          )
        }
      } else {
        setAllyResponse(
          'I can help you modify or delete this event. Try asking me to:\n• "Change the title to..."\n• "Move it to 3pm"\n• "Delete this event"',
        )
      }
    } catch (error) {
      console.error('Error processing Ally request:', error)
      setAllyResponse('Sorry, something went wrong. Please try again.')
      setActionResult({ type: 'error', message: 'Failed to process request' })
    } finally {
      setIsProcessing(false)
      setAllyPrompt('')
    }
  }, [allyPrompt, selectedEvent, isProcessing, onDeleteEvent, onUpdateEvent, handleOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {isCreating ? (
          <CreateEventForm
            newEvent={newEvent}
            onNewEventChange={onNewEventChange}
            onCreateEvent={onCreateEvent}
            onCancel={() => handleOpenChange(false)}
            categories={categories}
            colors={colors}
            availableTags={availableTags}
            toggleTag={toggleTag}
          />
        ) : (
          <ViewEventDetails
            selectedEvent={selectedEvent}
            getColorClasses={getColorClasses}
            allyPrompt={allyPrompt}
            setAllyPrompt={setAllyPrompt}
            allyResponse={allyResponse}
            isProcessing={isProcessing}
            actionResult={actionResult}
            isRecording={isRecording}
            speechRecognitionSupported={speechRecognitionSupported}
            speechRecognitionError={speechRecognitionError}
            toggleRecording={toggleRecording}
            startRecording={startRecording}
            stopRecording={stopRecording}
            cancelRecording={cancelRecording}
            handleSendToAlly={handleSendToAlly}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
