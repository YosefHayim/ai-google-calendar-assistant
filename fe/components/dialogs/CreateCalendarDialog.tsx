'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Plus } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '../ui/button'
import type { CreateCalendarDialogProps } from '@/types/analytics'
import { Input } from '../ui/input'
import { InteractiveHoverButton } from '../ui/interactive-hover-button'
import { calendarsService } from '@/services/calendars-service'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

const CreateCalendarDialog: React.FC<CreateCalendarDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const [calendarPrompt, setCalendarPrompt] = useState('')
  const [isCreatingCalendar, setIsCreatingCalendar] = useState(false)
  const queryClient = useQueryClient()

  // Helper to clear state when closing
  const handleClose = () => {
    setCalendarPrompt('')
    onClose()
  }

  const handleCreate = async () => {
    if (!calendarPrompt.trim()) {
      toast.error(t('toast.calendarNameRequired'))
      return
    }

    setIsCreatingCalendar(true)
    try {
      const response = await calendarsService.createCalendar({
        summary: calendarPrompt.trim(),
        description: `Created from Analytics Dashboard`,
      })

      if (response.status === 'success') {
        toast.success(t('toast.calendarCreated'))
        queryClient.invalidateQueries({ queryKey: ['calendars-list'] })
        onSuccess?.()
        handleClose()
      } else {
        toast.error(response.message || t('toast.calendarCreateFailed'))
      }
    } catch (error) {
      console.error('Error creating calendar:', error)
      toast.error(t('toast.calendarCreateFailedGeneric'))
    } finally {
      setIsCreatingCalendar(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="border bg-background bg-secondary sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-foreground">{t('dialogs.createCalendar.title')}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('dialogs.createCalendar.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            type="text"
            value={calendarPrompt}
            onChange={(e) => setCalendarPrompt(e.target.value)}
            placeholder={t('dialogs.createCalendar.namePlaceholder')}
            className="w-full rounded-md border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isCreatingCalendar}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isCreatingCalendar && calendarPrompt.trim()) {
                e.preventDefault()
                handleCreate()
              }
            }}
          />
        </div>

        <DialogFooter className="grid w-full grid-cols-2 items-center gap-2 sm:justify-between sm:space-x-0">
          <Button variant="outline" onClick={handleClose} disabled={isCreatingCalendar} className="w-full">
            {t('common.cancel')}
          </Button>
          <InteractiveHoverButton
            className="w-full"
            text={t('dialogs.createCalendar.create')}
            Icon={<Plus size={12} />}
            onClick={handleCreate}
            loadingText={t('dialogs.createCalendar.creating')}
            isLoading={isCreatingCalendar}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateCalendarDialog
