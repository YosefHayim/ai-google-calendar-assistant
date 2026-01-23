'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'warning' | 'default'
  isLoading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'destructive',
  isLoading: externalLoading,
}) => {
  const { t } = useTranslation()
  const [internalLoading, setInternalLoading] = useState(false)
  const isLoading = externalLoading ?? internalLoading

  useEffect(() => {
    if (!isOpen) {
      setInternalLoading(false)
    }
  }, [isOpen])

  const getButtonStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-destructive hover:bg-destructive text-white'
      case 'warning':
        return 'bg-secondary hover:bg-secondary text-white'
      default:
        return ''
    }
  }

  const handleConfirm = useCallback(async () => {
    if (isLoading) return

    setInternalLoading(true)
    try {
      await onConfirm()
    } finally {
      setInternalLoading(false)
    }
  }, [isLoading, onConfirm])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isOpen && !isLoading) {
        e.preventDefault()
        handleConfirm()
      }
    },
    [isOpen, isLoading, handleConfirm],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md bg-background dark:bg-secondary border ">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-primary-foreground">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="text-foreground dark:text-primary-foreground"
          >
            {cancelLabel || t('dialogs.confirm.cancel')}
          </Button>
          <Button
            type="button"
            variant={variant === 'default' ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isLoading}
            className={getButtonStyles()}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmLabel || t('dialogs.confirm.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDialog
