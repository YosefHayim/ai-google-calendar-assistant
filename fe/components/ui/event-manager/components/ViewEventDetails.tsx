'use client'

import type { ActionResult, ColorDefinition, Event } from '../types'
import { Calendar, CheckCircle2, Clock, FileText, Mic, Send, Sparkles, Tag, X } from 'lucide-react'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDate, formatTimeRange } from '@/lib/formatUtils'

import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ViewEventDetailsProps {
  selectedEvent: Event | null
  getColorClasses: (color: string) => ColorDefinition
  allyPrompt: string
  setAllyPrompt: (prompt: string) => void
  allyResponse: string
  isProcessing: boolean
  actionResult: ActionResult | null
  isRecording: boolean
  speechRecognitionSupported: boolean
  speechRecognitionError: string | null
  toggleRecording: () => void
  startRecording: () => void
  stopRecording: (text?: string) => void
  cancelRecording: () => void
  handleSendToAlly: () => void
}

export function ViewEventDetails({
  selectedEvent,
  getColorClasses,
  allyPrompt,
  setAllyPrompt,
  allyResponse,
  isProcessing,
  actionResult,
  isRecording,
  speechRecognitionSupported,
  speechRecognitionError,
  toggleRecording,
  startRecording,
  stopRecording,
  cancelRecording,
  handleSendToAlly,
}: ViewEventDetailsProps) {
  if (!selectedEvent) return null

  return (
    <>
      <DialogHeader className="pb-2">
        <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          Event Details
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">Ask Ally to modify this event</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <EventDetailsCard selectedEvent={selectedEvent} getColorClasses={getColorClasses} />

        <AllyResponseArea allyResponse={allyResponse} isProcessing={isProcessing} actionResult={actionResult} />

        <AllyInputArea
          allyPrompt={allyPrompt}
          setAllyPrompt={setAllyPrompt}
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
      </div>
    </>
  )
}

function EventDetailsCard({
  selectedEvent,
  getColorClasses,
}: {
  selectedEvent: Event
  getColorClasses: (color: string) => ColorDefinition
}) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 space-y-3',
        'bg-gradient-to-br from-muted/60 via-muted/40 to-transparent',
        'border border-border/50',
        'relative overflow-hidden',
      )}
    >
      <div className={cn('absolute top-0 left-0 w-1 h-full rounded-l-xl', getColorClasses(selectedEvent.color).bg)} />

      <div className="flex items-start gap-3 pl-2">
        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate">{selectedEvent.title}</h3>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4 flex-shrink-0" />
        <span>
          {formatDate(selectedEvent.startTime, 'WEEKDAY_SHORT')} •{' '}
          {formatTimeRange(selectedEvent.startTime, selectedEvent.endTime)}
        </span>
      </div>

      {selectedEvent.description && (
        <div className="flex items-start gap-3 pl-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2">{selectedEvent.description}</p>
        </div>
      )}

      {(selectedEvent.category || (selectedEvent.tags && selectedEvent.tags.length > 0)) && (
        <div className="flex items-center gap-2 pl-2 flex-wrap">
          <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {selectedEvent.category && (
            <Badge variant="secondary" className="text-xs">
              {selectedEvent.category}
            </Badge>
          )}
          {selectedEvent.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function AllyResponseArea({
  allyResponse,
  isProcessing,
  actionResult,
}: {
  allyResponse: string
  isProcessing: boolean
  actionResult: ActionResult | null
}) {
  return (
    <div
      className={cn(
        'min-h-[80px] rounded-lg p-3 transition-all duration-300',
        'bg-gradient-to-br from-primary/5 to-transparent',
        'border border-primary/10',
        allyResponse || isProcessing || actionResult ? 'opacity-100' : 'opacity-60',
      )}
    >
      {isProcessing ? (
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="relative">
            <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
          <span className="text-sm">Ally is thinking...</span>
        </div>
      ) : actionResult ? (
        <div
          className={cn(
            'flex items-center gap-2 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300',
            actionResult.type === 'deleted' ? 'text-destructive' : 'text-green-600',
          )}
        >
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">{actionResult.message}</span>
        </div>
      ) : allyResponse ? (
        <div className="text-sm text-foreground whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2 duration-300">
          {allyResponse}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">Ask Ally to update, reschedule, or delete this event</p>
      )}
    </div>
  )
}

function AllyInputArea({
  allyPrompt,
  setAllyPrompt,
  isProcessing,
  actionResult,
  isRecording,
  speechRecognitionSupported,
  speechRecognitionError,
  toggleRecording,
  startRecording,
  stopRecording,
  cancelRecording,
  handleSendToAlly,
}: {
  allyPrompt: string
  setAllyPrompt: (prompt: string) => void
  isProcessing: boolean
  actionResult: ActionResult | null
  isRecording: boolean
  speechRecognitionSupported: boolean
  speechRecognitionError: string | null
  toggleRecording: () => void
  startRecording: () => void
  stopRecording: (text?: string) => void
  cancelRecording: () => void
  handleSendToAlly: () => void
}) {
  return (
    <div className="space-y-2">
      {isRecording ? (
        <div className="relative flex flex-col items-center justify-center bg-background dark:bg-secondary border-border rounded-xl p-4 transition-all">
          <AIVoiceInput
            onStart={startRecording}
            onStop={(duration, text) => stopRecording(text ?? undefined)}
            isRecordingProp={isRecording}
            onToggleRecording={toggleRecording}
            speechRecognitionSupported={speechRecognitionSupported}
            speechRecognitionError={speechRecognitionError}
            visualizerBars={32}
            className="py-2"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={cancelRecording}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Textarea
            value={allyPrompt}
            onChange={(e) => setAllyPrompt(e.target.value)}
            placeholder="e.g., 'Change to 3pm' or 'Delete this event'"
            className={cn(
              'min-h-[44px] max-h-[120px] resize-none flex-1',
              'bg-background/50 border-border/60',
              'focus:border-primary/50 focus:ring-primary/20',
              'transition-all duration-200',
            )}
            rows={1}
            disabled={isProcessing || !!actionResult}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendToAlly()
              }
            }}
          />
          {speechRecognitionSupported && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleRecording}
              disabled={isProcessing || !!actionResult}
              className="h-11 w-11 flex-shrink-0 transition-all duration-200"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <Button
        onClick={handleSendToAlly}
        disabled={!allyPrompt.trim() || isProcessing || !!actionResult || isRecording}
        className={cn(
          'w-full gap-2 h-10',
          'bg-gradient-to-r from-primary to-primary/80',
          'hover:from-primary/90 hover:to-primary/70',
          'shadow-lg shadow-primary/20',
          'transition-all duration-200',
        )}
      >
        {isProcessing ? (
          <>
            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send to Ally
          </>
        )}
      </Button>
    </div>
  )
}
