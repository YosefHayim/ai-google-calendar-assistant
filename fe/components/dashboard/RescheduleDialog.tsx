'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, ArrowRight, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRescheduleSuggestions, useRescheduleEvent } from '@/hooks/queries/events/useReschedule'
import type { RescheduleSuggestion } from '@/services/events-service'

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  eventSummary: string
  calendarId?: string
  onSuccess?: () => void
}

export function RescheduleDialog({
  open,
  onOpenChange,
  eventId,
  eventSummary,
  calendarId,
  onSuccess,
}: RescheduleDialogProps) {
  const { t } = useTranslation()
  const [selectedSuggestion, setSelectedSuggestion] = useState<RescheduleSuggestion | null>(null)
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening' | 'any'>('any')

  const {
    data: suggestionsData,
    isLoading: isLoadingSuggestions,
    error: suggestionsError,
    refetch,
  } = useRescheduleSuggestions({
    eventId,
    calendarId,
    preferredTimeOfDay: preferredTime,
    daysToSearch: 7,
    enabled: open && !!eventId,
  })

  const { mutate: rescheduleEvent, isPending: isRescheduling } = useRescheduleEvent({
    onSuccess: () => {
      onOpenChange(false)
      setSelectedSuggestion(null)
      onSuccess?.()
    },
  })

  const suggestions = suggestionsData?.data?.suggestions ?? []
  const eventInfo = suggestionsData?.data?.event

  const handleReschedule = () => {
    if (!selectedSuggestion) return

    rescheduleEvent({
      eventId,
      newStart: selectedSuggestion.start,
      newEnd: selectedSuggestion.end,
      calendarId,
    })
  }

  const handleTimePreferenceChange = (time: typeof preferredTime) => {
    setPreferredTime(time)
    setSelectedSuggestion(null)
    refetch()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('rescheduleDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('rescheduleDialog.description')} <span className="font-medium text-foreground">{eventSummary}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Time Preference Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{t('rescheduleDialog.preferredTimeOfDay')}</label>
          <div className="flex flex-wrap gap-2">
            {(['any', 'morning', 'afternoon', 'evening'] as const).map((time) => (
              <Button
                key={time}
                variant={preferredTime === time ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimePreferenceChange(time)}
                className="capitalize"
              >
                {t(`rescheduleDialog.timeOptions.${time}`)}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Event Info */}
        {eventInfo && (
          <div className="rounded-lg border bg-muted/50 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{t('rescheduleDialog.current')} {eventInfo.start}</span>
              <ArrowRight className="h-3 w-3" />
              <span>{eventInfo.end}</span>
              <Badge variant="secondary" className="ml-auto">
                {eventInfo.duration} min
              </Badge>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingSuggestions && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <span className="text-sm">{t('rescheduleDialog.findingOptimalTimes')}</span>
          </div>
        )}

        {/* Error State */}
        {suggestionsError && (
          <div className="flex flex-col items-center justify-center py-8 text-destructive">
            <AlertCircle className="h-8 w-8 mb-2" />
            <span className="text-sm">{t('rescheduleDialog.failedToLoadSuggestions')}</span>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              {t('rescheduleDialog.tryAgain')}
            </Button>
          </div>
        )}

        {/* Suggestions List */}
        {!isLoadingSuggestions && !suggestionsError && (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {suggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('rescheduleDialog.noAvailableSlots')}</p>
                <p className="text-xs mt-1">{t('rescheduleDialog.tryDifferentTimePreference')}</p>
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSuggestion(suggestion)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedSuggestion === suggestion
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          selectedSuggestion === suggestion
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {selectedSuggestion === suggestion ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{suggestion.dayOfWeek}</p>
                        <p className="text-xs text-muted-foreground">{suggestion.startFormatted}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.reason}
                    </Badge>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('rescheduleDialog.cancel')}
          </Button>
          <Button onClick={handleReschedule} disabled={!selectedSuggestion || isRescheduling}>
            {isRescheduling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('rescheduleDialog.rescheduling')}
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                {t('rescheduleDialog.reschedule')}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
