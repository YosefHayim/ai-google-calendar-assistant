'use client'

import { AlertCircle, Calendar, Check, ExternalLink, Loader2, Mic } from 'lucide-react'
import type { ParsedEventData, QuickAddConflict } from '@/types/api'

import { Button } from '@/components/ui/button'
import { EventPreview } from './EventPreview'
import React from 'react'
import { motion } from 'framer-motion'

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

interface InputViewProps {
  state: DialogState
}

export const InputView: React.FC<InputViewProps> = ({ state }) => (
  <motion.div
    key="input"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex flex-1 flex-col items-center justify-center text-center"
  >
    <div
      className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
        state === 'recording' ? 'bg-destructive/10/30' : 'bg-accent bg-secondary'
      }`}
    >
      {state === 'recording' ? (
        <Mic className="h-8 w-8 animate-pulse text-destructive" />
      ) : (
        <Calendar className="h-8 w-8 text-muted-foreground" />
      )}
    </div>
    <p className="text-sm text-muted-foreground">
      {state === 'recording' ? 'Listening... Speak your event details' : 'Type or speak your event details'}
    </p>
  </motion.div>
)

interface LoadingViewProps {
  message: string
}

export const LoadingView: React.FC<LoadingViewProps> = ({ message }) => (
  <motion.div
    key="loading"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex flex-1 flex-col items-center justify-center text-center"
  >
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
    <p className="text-sm text-muted-foreground">{message}</p>
  </motion.div>
)

interface ConfirmViewProps {
  event: ParsedEventData
  calendarName: string
  message: string
  onConfirm: () => void
}

export const ConfirmView: React.FC<ConfirmViewProps> = ({ event, calendarName, message, onConfirm }) => (
  <motion.div
    key="confirm"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex flex-1 flex-col"
  >
    <p className="mb-4 text-sm text-muted-foreground">{message}</p>
    <EventPreview event={event} calendarName={calendarName} />
    <Button onClick={onConfirm} className="w-full bg-primary text-foreground hover:bg-primary-hover">
      <Check className="mr-2 h-4 w-4" />
      Add to Calendar
    </Button>
  </motion.div>
)

interface ConflictViewProps {
  event: ParsedEventData
  calendarName: string
  conflicts: QuickAddConflict[]
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConflictView: React.FC<ConflictViewProps> = ({
  event,
  calendarName,
  conflicts,
  message,
  onConfirm,
  onCancel,
}) => (
  <motion.div
    key="conflict"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex flex-1 flex-col"
  >
    <p className="mb-3 text-sm text-secondary">{message}</p>
    <EventPreview event={event} calendarName={calendarName} />
    {conflicts.length > 0 && (
      <div className="mb-3 rounded border-secondary/20 bg-secondary/20 bg-secondary/5 p-2">
        <p className="mb-1 text-xs font-medium text-secondary">Conflicts with:</p>
        {conflicts.slice(0, 3).map((c) => (
          <p key={c.id} className="text-xs text-secondary">
            • {c.summary}
          </p>
        ))}
      </div>
    )}
    <div className="space-y-2">
      <Button onClick={onConfirm} className="w-full bg-secondary text-foreground hover:bg-secondary">
        Create Anyway
      </Button>
      <Button onClick={onCancel} variant="outline" className="w-full">
        Cancel
      </Button>
    </div>
  </motion.div>
)

interface SuccessViewProps {
  message: string
  calendarName: string
  eventUrl: string
  onClose: () => void
}

export const SuccessView: React.FC<SuccessViewProps> = ({ message, calendarName, eventUrl, onClose }) => (
  <motion.div
    key="success"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-1 flex-col items-center justify-center text-center"
  >
    <div className="bg-primary/10/30 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
      <Check className="h-8 w-8 text-primary" />
    </div>
    <p className="text-sm font-medium text-primary">{message}</p>
    {calendarName && <p className="mt-1 text-xs text-muted-foreground">Added to {calendarName}</p>}
    {eventUrl && (
      <a
        href={eventUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        View in Google Calendar
      </a>
    )}
    <Button onClick={onClose} variant="outline" size="sm" className="mt-4">
      Close
    </Button>
  </motion.div>
)

interface ErrorViewProps {
  message: string
  onRetry: () => void
}

export const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => (
  <motion.div
    key="error"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex flex-1 flex-col items-center justify-center text-center"
  >
    <div className="bg-destructive/10/30 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
      <AlertCircle className="h-8 w-8 text-destructive" />
    </div>
    <p className="mb-4 text-sm text-destructive">{message}</p>
    <Button onClick={onRetry} variant="outline" size="sm">
      Try Again
    </Button>
  </motion.div>
)
