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
import { calendarsService } from '@/services/calendars.service'
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
      <DialogContent className="sm:max-w-md bg-background dark:bg-secondary border ">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-foreground dark:text-primary-foreground">
            Create New Calendar
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
            Enter a name for your new calendar. It will be added to your Google Calendar account.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            type="text"
            value={calendarPrompt}
            onChange={(e) => setCalendarPrompt(e.target.value)}
            placeholder="e.g., Work Projects, Personal Goals, Fitness"
            className="w-full p-3 rounded-md border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
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

        {/* Using a grid layout here to match your original design 
          where buttons took up 50% width each 
        */}
        <DialogFooter className="sm:justify-between sm:space-x-0 w-full grid grid-cols-2 gap-2 items-center">
          <Button variant="outline" onClick={handleClose} disabled={isCreatingCalendar} className="w-full">
            Cancel
          </Button>
          <InteractiveHoverButton
            className="w-full"
            text="Create Calendar"
            Icon={<Plus size={12} />}
            onClick={handleCreate}
            loadingText="Creating..."
            isLoading={isCreatingCalendar}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateCalendarDialog
