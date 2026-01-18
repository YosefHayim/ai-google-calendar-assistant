'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import React, { useCallback, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
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
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  isLoading = false,
}) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-destructive hover:bg-destructive text-white'
      case 'warning':
        return 'bg-orange-500 hover:bg-orange-600 text-white'
      default:
        return ''
    }
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isOpen && !isLoading) {
        e.preventDefault()
        onConfirm()
      }
    },
    [isOpen, isLoading, onConfirm],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md bg-background dark:bg-secondary border dark:border">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-primary-foreground">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border dark:border text-foreground dark:text-primary-foreground"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'default' ? 'default' : 'destructive'}
            onClick={onConfirm}
            disabled={isLoading}
            className={getButtonStyles()}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDialog
