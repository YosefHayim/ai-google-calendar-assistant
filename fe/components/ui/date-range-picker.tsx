'use client'

import * as React from 'react'

import { Calendar as CalendarIcon, Info } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  addMonths,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import CinematicGlowToggle from './cinematic-glow-toggle'
import { DateRange } from 'react-day-picker'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

type PresetKey =
  | 'yesterday'
  | 'today'
  | 'last7'
  | 'last30'
  | 'thisWeek'
  | 'thisMonth'
  | 'prevMonth'
  | 'thisYear'
  | 'custom'

export function DatePickerWithRange({ className, date, setDate }: DatePickerWithRangeProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = React.useState(false)
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(date)
  const [isCompareEnabled, setIsCompareEnabled] = React.useState(false)
  const [activePreset, setActivePreset] = React.useState<PresetKey | undefined>(undefined)

  // --- Independent Month State ---
  // Initialize Right Month to today, Left Month to previous month
  const [rightMonth, setRightMonth] = React.useState<Date>(new Date())
  const [leftMonth, setLeftMonth] = React.useState<Date>(subMonths(new Date(), 1))

  // --- Effects ---
  React.useEffect(() => {
    if (!date) {
      const defaultTo = new Date()
      const defaultFrom = subDays(defaultTo, 7)
      setInternalDate({ from: defaultFrom, to: defaultTo })
      setDate({ from: defaultFrom, to: defaultTo })
      setActivePreset('last7')
    }
  }, [])

  React.useEffect(() => {
    setInternalDate(date)
    // When external date changes, snap views to that range
    if (date?.to) {
      setRightMonth(date.to)
      setLeftMonth(date.from && !isSameMonth(date.from, date.to) ? date.from : subMonths(date.to, 1))
    }
  }, [date])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dateRangeCompareAnalyticsPage')
      if (saved) setIsCompareEnabled(JSON.parse(saved))
    }
  }, [])

  const handleCompareToggle = (checked: boolean) => {
    setIsCompareEnabled(checked)
    localStorage.setItem('dateRangeCompareAnalyticsPage', JSON.stringify(checked))
  }

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setInternalDate(selectedDate)
    setActivePreset(undefined)
  }

  const handleApply = () => {
    if (internalDate?.from && internalDate?.to) {
      setDate(internalDate)
      setIsOpen(false)
      toast.success(t('toast.dateRangeApplied'))
    } else {
      toast.error(t('toast.dateRangeSelectBoth'))
    }
  }

  const setPreset = (preset: PresetKey) => {
    const today = new Date()
    let newRange: DateRange | undefined

    switch (preset) {
      case 'yesterday': {
        const yest = subDays(today, 1)
        newRange = { from: yest, to: yest }
        break
      }
      case 'last7':
        newRange = { from: subDays(today, 7), to: today }
        break
      case 'last30':
        newRange = { from: subDays(today, 30), to: today }
        break
      case 'thisWeek':
        newRange = { from: startOfWeek(today), to: today }
        break
      case 'thisMonth':
        newRange = { from: startOfMonth(today), to: today }
        break
      case 'prevMonth': {
        const prevMonthDate = subMonths(today, 1)
        newRange = {
          from: startOfMonth(prevMonthDate),
          to: endOfMonth(prevMonthDate),
        }
        break
      }
      case 'thisYear':
        newRange = { from: startOfYear(today), to: today }
        break
      case 'custom':
        // Keep the current date range when switching to custom mode
        setActivePreset('custom')
        return
    }

    setInternalDate(newRange)
    setActivePreset(preset)

    // Smart View Update:
    // Right calendar focuses on the 'to' date (current context)
    // Left calendar focuses on the 'from' date, unless it's same month as right, then back 1 month
    if (newRange?.to) {
      setRightMonth(newRange.to)
      if (newRange.from) {
        if (isSameMonth(newRange.from, newRange.to)) {
          setLeftMonth(subMonths(newRange.to, 1))
        } else {
          setLeftMonth(newRange.from)
        }
      }
    }
  }

  const renderPresetButton = (label: string, presetKey: PresetKey) => (
    <Button
      variant={activePreset === presetKey ? 'default' : 'ghost'}
      className={cn(
        'w-auto justify-start font-normal lg:w-full',
        activePreset === presetKey ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-secondary',
      )}
      onClick={() => setPreset(presetKey)}
    >
      {label}
    </Button>
  )

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn('w-full justify-start text-left font-normal sm:w-[300px]', !date && 'text-muted-foreground')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex h-full flex-col sm:flex-row">
            {/* --- LEFT SIDEBAR (Presets) --- */}
            <div className="flex flex-row flex-wrap gap-1.5 border-b border-border p-3 lg:min-w-[150px] lg:flex-col lg:gap-1 lg:border-b-0 lg:border-r">
              <span className="mb-1 w-full px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:w-auto">
                Presets
              </span>
              {renderPresetButton('Yesterday', 'yesterday')}
              {renderPresetButton('Last 7 Days', 'last7')}
              {renderPresetButton('Last 30 Days', 'last30')}
              {renderPresetButton('This Week', 'thisWeek')}
              {renderPresetButton('This Month', 'thisMonth')}
              {renderPresetButton('Previous Month', 'prevMonth')}
              {renderPresetButton('This Year', 'thisYear')}
              {renderPresetButton('Custom', 'custom')}

              {/* Custom Date Range - Only visible when Custom preset is active */}
              {activePreset === 'custom' && (
                <div className="mt-3 border-t border-border pt-3">
                  <span className="mb-2 block px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Custom Range
                  </span>
                  <div className="flex flex-row gap-2 px-1">
                    <div className="flex-1">
                      <Label className="mb-1 block text-xs text-muted-foreground">From</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'h-8 w-full justify-start text-left text-xs font-normal',
                              !internalDate?.from && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {internalDate?.from ? format(internalDate.from, 'MMM dd, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start" side="right">
                          <Calendar
                            mode="single"
                            selected={internalDate?.from}
                            onSelect={(selectedDate) => {
                              if (selectedDate) {
                                const newRange = { ...internalDate, from: selectedDate }
                                setInternalDate(newRange as DateRange)
                                // Update calendar views
                                if (newRange.to) {
                                  setRightMonth(newRange.to)
                                  if (!isSameMonth(selectedDate, newRange.to)) {
                                    setLeftMonth(selectedDate)
                                  } else {
                                    setLeftMonth(subMonths(newRange.to, 1))
                                  }
                                }
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex-1">
                      <Label className="mb-1 block text-xs text-muted-foreground">To</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'h-8 w-full justify-start text-left text-xs font-normal',
                              !internalDate?.to && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {internalDate?.to ? format(internalDate.to, 'MMM dd, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start" side="right">
                          <Calendar
                            mode="single"
                            selected={internalDate?.to}
                            onSelect={(selectedDate) => {
                              if (selectedDate) {
                                const newRange = { ...internalDate, to: selectedDate }
                                setInternalDate(newRange as DateRange)
                                // Update calendar views
                                setRightMonth(selectedDate)
                                if (newRange.from && !isSameMonth(newRange.from, selectedDate)) {
                                  setLeftMonth(newRange.from)
                                } else {
                                  setLeftMonth(subMonths(selectedDate, 1))
                                }
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* --- RIGHT SIDE (Calendars) --- */}
            <div className="flex flex-col">
              {/* Dual Calendar Container */}
              <div className="flex items-start gap-4 p-3">
                {/* Left Calendar (Past) */}
                <div className="relative">
                  <Calendar
                    mode="range"
                    month={leftMonth}
                    onMonthChange={setLeftMonth}
                    selected={internalDate}
                    onSelect={handleSelect}
                    numberOfMonths={1}
                    showOutsideDays={false}
                    // Constraint: Cannot navigate past (RightMonth - 1)
                    toMonth={subMonths(rightMonth, 1)}
                    className="p-0"
                  />
                </div>

                {/* Vertical Separator */}
                <div className="w-[1px] self-stretch bg-border" />

                {/* Right Calendar (Future/Present) */}
                <div className="relative">
                  <Calendar
                    mode="range"
                    month={rightMonth}
                    onMonthChange={setRightMonth}
                    selected={internalDate}
                    onSelect={handleSelect}
                    numberOfMonths={1}
                    showOutsideDays={false}
                    // Constraint: Cannot navigate before (LeftMonth + 1)
                    fromMonth={addMonths(leftMonth, 1)}
                    className="p-0"
                  />
                </div>
              </div>

              {/* --- FOOTER (Toggle & Actions) --- */}
              <div className="flex items-center justify-between border-t border-border bg-background/50 p-3">
                <div className="flex items-center gap-3">
                  <CinematicGlowToggle id="compare-toggle" checked={isCompareEnabled} onChange={handleCompareToggle} />
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground opacity-70 transition-opacity hover:opacity-100" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Compare Mode</h4>
                        <p className="text-sm text-muted-foreground">Compare data with the previous period.</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setInternalDate(date)
                      setIsOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleApply}
                    disabled={!internalDate?.from || !internalDate?.to}
                    className={cn(
                      'bg-primary hover:bg-primary/90',
                      !internalDate?.from || (!internalDate?.to && 'cursor-not-allowed opacity-50'),
                    )}
                  >
                    Apply Range
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
