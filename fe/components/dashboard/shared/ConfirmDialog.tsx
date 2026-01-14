'use client'

import React, { useCallback, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
        return 'bg-red-500 hover:bg-red-600 text-white'
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 text-white'
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
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">{title}</DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
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
