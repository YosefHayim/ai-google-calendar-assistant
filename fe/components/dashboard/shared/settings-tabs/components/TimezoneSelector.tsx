'use client'

import React, { useState, useMemo } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Common timezones grouped by region
const TIMEZONE_OPTIONS = [
  // Americas
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', offset: 'UTC-8' },
  { value: 'America/Anchorage', label: 'Alaska', offset: 'UTC-9' },
  { value: 'Pacific/Honolulu', label: 'Hawaii', offset: 'UTC-10' },
  { value: 'America/Toronto', label: 'Toronto', offset: 'UTC-5' },
  { value: 'America/Vancouver', label: 'Vancouver', offset: 'UTC-8' },
  { value: 'America/Mexico_City', label: 'Mexico City', offset: 'UTC-6' },
  { value: 'America/Sao_Paulo', label: 'Sao Paulo', offset: 'UTC-3' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires', offset: 'UTC-3' },
  // Europe
  { value: 'Europe/London', label: 'London', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Paris', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Berlin', offset: 'UTC+1' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam', offset: 'UTC+1' },
  { value: 'Europe/Rome', label: 'Rome', offset: 'UTC+1' },
  { value: 'Europe/Madrid', label: 'Madrid', offset: 'UTC+1' },
  { value: 'Europe/Stockholm', label: 'Stockholm', offset: 'UTC+1' },
  { value: 'Europe/Moscow', label: 'Moscow', offset: 'UTC+3' },
  { value: 'Europe/Istanbul', label: 'Istanbul', offset: 'UTC+3' },
  // Asia & Middle East
  { value: 'Asia/Jerusalem', label: 'Jerusalem', offset: 'UTC+2' },
  { value: 'Asia/Dubai', label: 'Dubai', offset: 'UTC+4' },
  { value: 'Asia/Kolkata', label: 'Mumbai, Kolkata', offset: 'UTC+5:30' },
  { value: 'Asia/Singapore', label: 'Singapore', offset: 'UTC+8' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', offset: 'UTC+8' },
  { value: 'Asia/Shanghai', label: 'Beijing, Shanghai', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo', offset: 'UTC+9' },
  { value: 'Asia/Seoul', label: 'Seoul', offset: 'UTC+9' },
  // Australia & Pacific
  { value: 'Australia/Sydney', label: 'Sydney', offset: 'UTC+11' },
  { value: 'Australia/Melbourne', label: 'Melbourne', offset: 'UTC+11' },
  { value: 'Australia/Perth', label: 'Perth', offset: 'UTC+8' },
  { value: 'Pacific/Auckland', label: 'Auckland', offset: 'UTC+13' },
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo', offset: 'UTC+2' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg', offset: 'UTC+2' },
  // UTC
  { value: 'UTC', label: 'UTC', offset: 'UTC+0' },
] as const

interface TimezoneSelectorProps {
  value: string
  onChange: (timezone: string) => void
  disabled?: boolean
  className?: string
  id?: string
}

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  value,
  onChange,
  disabled,
  className,
  id,
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredTimezones = useMemo(() => {
    if (!search) return TIMEZONE_OPTIONS
    const lowerSearch = search.toLowerCase()
    return TIMEZONE_OPTIONS.filter(
      (tz) =>
        tz.label.toLowerCase().includes(lowerSearch) ||
        tz.value.toLowerCase().includes(lowerSearch) ||
        tz.offset.toLowerCase().includes(lowerSearch),
    )
  }, [search])

  const selectedTimezone = TIMEZONE_OPTIONS.find((tz) => tz.value === value)
  const displayValue = selectedTimezone ? `${selectedTimezone.label} (${selectedTimezone.offset})` : value

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between gap-2 font-normal', className)}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            placeholder="Search timezone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredTimezones.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No timezone found.</div>
          ) : (
            filteredTimezones.map((tz) => (
              <button
                key={tz.value}
                onClick={() => {
                  onChange(tz.value)
                  setOpen(false)
                  setSearch('')
                }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                  value === tz.value && 'bg-accent',
                )}
              >
                <span className="flex flex-col items-start">
                  <span>{tz.label}</span>
                  <span className="text-xs text-muted-foreground">{tz.offset}</span>
                </span>
                {value === tz.value && <Check className="h-4 w-4" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
