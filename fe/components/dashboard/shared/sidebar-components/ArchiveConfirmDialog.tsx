'use client'

import React from 'react'
import { ConfirmDialog } from '../ConfirmDialog'

interface ArchiveConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export const ArchiveConfirmDialog: React.FC<ArchiveConfirmDialogProps> = ({
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
      title="Archive Conversation"
      description="Are you sure you want to archive this conversation? It will be hidden from your main chat list but can be restored later from Settings."
      confirmLabel="Archive"
      cancelLabel="Cancel"
      variant="default"
      isLoading={isLoading}
    />
  )
}

export default ArchiveConfirmDialog