'use client'

import React from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DropdownOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface SettingsDropdownProps {
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className,
  id,
}) => {
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button id={id} variant="outline" className={cn('w-full justify-between gap-2 font-normal', className)}>
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.icon}
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </span>
            {value === option.value && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface MultiSelectDropdownProps {
  values: string[]
  options: DropdownOption[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
  id?: string
  minSelections?: number
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  values,
  options,
  onChange,
  placeholder = 'Select...',
  className,
  id,
  minSelections = 1,
}) => {
  const selectedOptions = options.filter((opt) => values.includes(opt.value))

  const getDisplayText = () => {
    if (selectedOptions.length === 0) return placeholder
    if (selectedOptions.length === 1) return selectedOptions[0].label
    if (selectedOptions.length === 2) return selectedOptions.map((o) => o.label).join(', ')
    return `${selectedOptions[0].label} +${selectedOptions.length - 1} more`
  }

  const toggleOption = (optionValue: string) => {
    const isCurrentlySelected = values.includes(optionValue)
    const wouldViolateMinimum = isCurrentlySelected && values.length <= minSelections

    if (wouldViolateMinimum) return

    if (isCurrentlySelected) {
      onChange(values.filter((v) => v !== optionValue))
    } else {
      onChange([...values, optionValue])
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button id={id} variant="outline" className={cn('w-full justify-between gap-2 font-normal', className)}>
          <span className="truncate">{getDisplayText()}</span>
          <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => {
          const isSelected = values.includes(option.value)
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={(e) => {
                e.preventDefault()
                toggleOption(option.value)
              }}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </span>
              <div
                className={cn(
                  'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  isSelected ? 'bg-primary border-primary' : 'border-zinc-300 dark:border-zinc-600',
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
