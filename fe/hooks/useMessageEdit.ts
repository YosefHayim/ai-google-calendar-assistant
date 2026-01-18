'use client'

import { useEffect, useRef, useState } from 'react'

export interface UseMessageEditReturn {
  editingMessageId: string | null
  editText: string
  setEditText: (text: string) => void
  editInputRef: React.RefObject<HTMLTextAreaElement | null>
  startEdit: (messageId: string, content: string) => void
  cancelEdit: () => void
  confirmEdit: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  isEditing: (messageId: string) => boolean
}

/**
 * Hook for managing inline message editing functionality.
 *
 * Provides state management and event handlers for editing chat messages,
 * including keyboard shortcuts (Enter to confirm, Escape to cancel) and
 * automatic focus management.
 *
 * @param onEditAndResend - Callback function called when edit is confirmed with message ID and new text
 * @returns Object containing editing state and control functions
 */
export function useMessageEdit(onEditAndResend: (messageId: string, newText: string) => void): UseMessageEditReturn {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const editInputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.setSelectionRange(editText.length, editText.length)
    }
  }, [editingMessageId, editText.length])

  const startEdit = (messageId: string, content: string) => {
    setEditingMessageId(messageId)
    setEditText(content)
  }

  const cancelEdit = () => {
    setEditingMessageId(null)
    setEditText('')
  }

  const confirmEdit = () => {
    if (editingMessageId && editText.trim()) {
      onEditAndResend(editingMessageId, editText.trim())
      cancelEdit()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      confirmEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const isEditing = (messageId: string) => editingMessageId === messageId

  return {
    editingMessageId,
    editText,
    setEditText,
    editInputRef,
    startEdit,
    cancelEdit,
    confirmEdit,
    handleKeyDown,
    isEditing,
  }
}
