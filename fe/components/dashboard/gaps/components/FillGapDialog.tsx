'use client'

import React, { useState, useEffect } from 'react'
import { CalendarPlus, Clock, MapPin, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { GapCandidate } from '@/types/api'

interface FillGapDialogProps {
  gap: GapCandidate | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (gap: GapCandidate, summary: string, location?: string) => void
  isLoading: boolean
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatEndTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const FillGapDialog: React.FC<FillGapDialogProps> = ({ gap, isOpen, onClose, onConfirm, isLoading }) => {
  const [summary, setSummary] = useState(gap?.suggestion || '')
  const [location, setLocation] = useState('')

  useEffect(() => {
    if (gap) {
      setSummary(gap.suggestion || '')
      setLocation('')
    }
  }, [gap])

  if (!gap) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20">
              <CalendarPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-zinc-900 dark:text-zinc-100">Schedule New Event</DialogTitle>
              <DialogDescription className="text-zinc-500 text-sm">
                Fill this time slot with a new calendar event
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Time Slot
            </p>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDateTime(gap.start)} – {formatEndTime(gap.end)}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">Duration: {gap.durationFormatted}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Event Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What would you like to schedule?"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Location <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add a location"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(gap, summary, location || undefined)}
            disabled={!summary.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 text-white shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Create Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FillGapDialog
