'use client'

import React from 'react'
import { ConfirmDialog } from '../ConfirmDialog'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Conversation"
      description="Are you sure you want to delete this conversation? This action cannot be reversed."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      isLoading={isLoading}
    />
  )
}

export default DeleteConfirmDialog
