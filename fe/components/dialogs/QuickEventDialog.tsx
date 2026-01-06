'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AllyLogo } from '@/components/shared/logo'
import { Calendar, Clock, MapPin, FileText, Loader2, Check, Sparkles, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { streamChatMessage } from '@/services/chatService'
import { toast } from 'sonner'

interface ParsedEvent {
  summary: string
  date: string
  time: string
  duration?: string
  location?: string
  description?: string
}

interface QuickEventDialogProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: () => void
}

type DialogState = 'input' | 'parsing' | 'confirm' | 'creating' | 'success' | 'error'

export const QuickEventDialog: React.FC<QuickEventDialogProps> = ({ isOpen, onClose, onEventCreated }) => {
  const [text, setText] = useState('')
  const [state, setState] = useState<DialogState>('input')
  const [parsedEvent, setParsedEvent] = useState<ParsedEvent | null>(null)
  const [allyMessage, setAllyMessage] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setText('')
      setState('input')
      setParsedEvent(null)
      setAllyMessage('')
      setError('')
    }
  }, [isOpen])

  // Parse text with AI when user stops typing
  const parseEventText = useCallback(async (inputText: string) => {
    if (!inputText.trim() || inputText.length < 5) return

    setState('parsing')
    setAllyMessage('Let me understand what you want to schedule...')

    try {
      await streamChatMessage(
        `Parse this event request and respond ONLY with a JSON object (no markdown, no explanation). If you cannot parse it, respond with {"error": "reason"}. Extract: summary, date (YYYY-MM-DD or "today"/"tomorrow"), time (HH:MM 24h format), duration (optional, like "1 hour"), location (optional), description (optional). Request: "${inputText}"`,
        [],
        {
          onChunk: () => {},
          onComplete: (response) => {
            try {
              // Try to extract JSON from the response
              const jsonMatch = response.match(/\{[\s\S]*\}/)
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0])
                if (parsed.error) {
                  setError(parsed.error)
                  setAllyMessage(`I couldn't understand that: ${parsed.error}`)
                  setState('error')
                } else {
                  setParsedEvent(parsed)
                  setAllyMessage(
                    `Got it! "${parsed.summary}" on ${parsed.date} at ${parsed.time}${parsed.duration ? ` for ${parsed.duration}` : ''}${parsed.location ? ` at ${parsed.location}` : ''}. Ready to add this to your calendar?`,
                  )
                  setState('confirm')
                }
              } else {
                throw new Error('Could not parse response')
              }
            } catch {
              setAllyMessage('I understood your request. Let me create this event for you.')
              // Fallback: just use the raw text
              setParsedEvent({
                summary: inputText,
                date: 'today',
                time: '09:00',
              })
              setState('confirm')
            }
          },
          onError: (errorMsg) => {
            setError(errorMsg)
            setAllyMessage('Something went wrong. Please try again.')
            setState('error')
          },
        },
      )
    } catch {
      setError('Failed to process your request')
      setState('error')
    }
  }, [])

  // Create the event
  const handleConfirm = async () => {
    if (!parsedEvent) return

    setState('creating')
    setAllyMessage('Adding to your calendar...')

    try {
      // Use the chat API to actually create the event
      await streamChatMessage(
        `Create a calendar event with these details: Title: "${parsedEvent.summary}", Date: ${parsedEvent.date}, Time: ${parsedEvent.time}${parsedEvent.duration ? `, Duration: ${parsedEvent.duration}` : ''}${parsedEvent.location ? `, Location: ${parsedEvent.location}` : ''}${parsedEvent.description ? `, Description: ${parsedEvent.description}` : ''}. Please create this event now.`,
        [],
        {
          onChunk: () => {},
          onComplete: (response) => {
            // Check if the response indicates success
            const isSuccess =
              response.toLowerCase().includes('created') ||
              response.toLowerCase().includes('added') ||
              response.toLowerCase().includes('scheduled')

            if (isSuccess) {
              setState('success')
              setAllyMessage('Event added to your calendar!')
              toast.success('Event created successfully', {
                description: `"${parsedEvent.summary}" has been added to your calendar.`,
              })
              onEventCreated?.()
              setTimeout(() => {
                onClose()
              }, 1500)
            } else {
              setAllyMessage(response)
              setState('confirm')
            }
          },
          onError: (errorMsg) => {
            setError(errorMsg)
            setAllyMessage('Failed to create the event. Please try again.')
            setState('error')
            toast.error('Failed to create event', {
              description: errorMsg,
            })
          },
        },
      )
    } catch {
      setError('Failed to create event')
      setState('error')
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)

    // Reset to input state when user types
    if (state !== 'input' && state !== 'parsing') {
      setState('input')
      setParsedEvent(null)
      setAllyMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (text.trim().length >= 5) {
        parseEventText(text)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Add Event</DialogTitle>
          <DialogDescription>Add an event to your calendar using natural language</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[400px]">
          {/* Left side - Text Input */}
          <div className="flex-1 p-6 flex flex-col border-r border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Quick Add Event</h3>
            </div>

            <textarea
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe your event in natural language...

Examples:
• Meeting with John tomorrow at 3pm
• Lunch at Cafe Roma on Friday 12:30pm for 1 hour
• Team standup every Monday at 9am"
              className="flex-1 w-full resize-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={state === 'creating' || state === 'success'}
            />

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-zinc-400">Press Enter to process</p>
              <Button
                onClick={() => parseEventText(text)}
                disabled={text.trim().length < 5 || state === 'parsing' || state === 'creating' || state === 'success'}
                variant="outline"
                size="sm"
              >
                {state === 'parsing' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Process
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right side - Ally Assistant */}
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
              {state === 'input' && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Type your event details and I'll help you schedule it
                  </p>
                </motion.div>
              )}

              {state === 'parsing' && (
                <motion.div
                  key="parsing"
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

                  <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-zinc-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-zinc-400">Event</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{parsedEvent.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-zinc-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-zinc-400">Date</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{parsedEvent.date}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-zinc-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-zinc-400">Time</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {parsedEvent.time}
                          {parsedEvent.duration && ` (${parsedEvent.duration})`}
                        </p>
                      </div>
                    </div>
                    {parsedEvent.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-zinc-400">Location</p>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{parsedEvent.location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button onClick={handleConfirm} className="w-full bg-primary hover:bg-primary-hover text-white">
                    <Check className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                </motion.div>
              )}

              {state === 'creating' && (
                <motion.div
                  key="creating"
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
                  <Button
                    onClick={() => {
                      setState('input')
                      setError('')
                      setAllyMessage('')
                    }}
                    variant="outline"
                    size="sm"
                  >
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

export default QuickEventDialog
