'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  value: string // HH:MM format
  onChange: (time: string) => void
  disabled?: boolean
  className?: string
  id?: string
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, disabled, className, id }) => {
  return (
    <input
      id={id}
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'flex h-9 w-full rounded-md border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    />
  )
}
