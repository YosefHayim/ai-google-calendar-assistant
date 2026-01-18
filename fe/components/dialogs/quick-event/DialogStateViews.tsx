'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Calendar, Check, ExternalLink, Loader2, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ParsedEventData, QuickAddConflict } from '@/types/api'
import { EventPreview } from './EventPreview'

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
    className="flex-1 flex flex-col items-center justify-center text-center"
  >
    <div
      className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
        state === 'recording' ? 'bg-destructive/10 dark:bg-red-900/30' : 'bg-accent dark:bg-secondary'
      }`}
    >
      {state === 'recording' ? (
        <Mic className="w-8 h-8 text-destructive animate-pulse" />
      ) : (
        <Calendar className="w-8 h-8 text-muted-foreground" />
      )}
    </div>
    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
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
    className="flex-1 flex flex-col items-center justify-center text-center"
  >
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
    <p className="text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
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
    className="flex-1 flex flex-col"
  >
    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">{message}</p>
    <EventPreview event={event} calendarName={calendarName} />
    <Button onClick={onConfirm} className="w-full bg-primary hover:bg-primary-hover text-white">
      <Check className="w-4 h-4 mr-2" />
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
    className="flex-1 flex flex-col"
  >
    <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">{message}</p>
    <EventPreview event={event} calendarName={calendarName} />
    {conflicts.length > 0 && (
      <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">Conflicts with:</p>
        {conflicts.slice(0, 3).map((c) => (
          <p key={c.id} className="text-xs text-amber-700 dark:text-amber-400">
            • {c.summary}
          </p>
        ))}
      </div>
    )}
    <div className="space-y-2">
      <Button onClick={onConfirm} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
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
    className="flex-1 flex flex-col items-center justify-center text-center"
  >
    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
      <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
    </div>
    <p className="text-sm font-medium text-green-600 dark:text-green-400">{message}</p>
    {calendarName && <p className="text-xs text-muted-foreground mt-1">Added to {calendarName}</p>}
    {eventUrl && (
      <a
        href={eventUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
      >
        <ExternalLink className="w-4 h-4" />
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
    className="flex-1 flex flex-col items-center justify-center text-center"
  >
    <div className="w-16 h-16 rounded-full bg-destructive/10 dark:bg-red-900/30 flex items-center justify-center mb-4">
      <AlertCircle className="w-8 h-8 text-destructive dark:text-red-400" />
    </div>
    <p className="text-sm text-destructive dark:text-red-400 mb-4">{message}</p>
    <Button onClick={onRetry} variant="outline" size="sm">
      Try Again
    </Button>
  </motion.div>
)
