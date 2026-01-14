'use client'

import { Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Message } from '@/types'
import MessageBubble from '@/components/dashboard/chat/MessageBubble'
import React from 'react'

interface EditableMessageProps {
  message: Message
  isEditing: boolean
  editText: string
  editInputRef: React.RefObject<HTMLTextAreaElement | null>
  onEditTextChange: (text: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onConfirm: () => void
  onCancel: () => void
  hideTimestamp?: boolean
}

export const EditableMessage: React.FC<EditableMessageProps> = ({
  message,
  isEditing,
  editText,
  editInputRef,
  onEditTextChange,
  onKeyDown,
  onConfirm,
  onCancel,
  hideTimestamp = true,
}) => {
  if (!isEditing) {
    return (
      <MessageBubble
        role={message.role}
        content={message.content}
        timestamp={message.timestamp}
        images={message.images}
        hideTimestamp={hideTimestamp}
      />
    )
  }

  return (
    <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[85%] md:max-w-[75%] w-full flex flex-col gap-2">
        <textarea
          ref={editInputRef}
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full p-3 rounded-xl text-sm leading-relaxed bg-primary/10 text-zinc-900 dark:text-zinc-100 border-2 border-primary rounded-tr-none resize-none min-h-[60px] focus:outline-none focus:ring-1 focus:ring-primary/50"
          rows={Math.min(5, editText.split('\n').length + 1)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="icon" onClick={onCancel} className="h-7 w-7" title="Cancel (Esc)">
            <X size={14} />
          </Button>
          <Button size="icon" onClick={onConfirm} className="h-7 w-7" title="Confirm (Enter)">
            <Check size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
