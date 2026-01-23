'use client'

import { Calendar, CalendarRange, Clock, Grid3x3, List } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Button } from '@/components/ui/button'
import type { ViewType } from '../types'

interface ViewToggleProps {
  view: ViewType
  onViewChange: (view: ViewType) => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <>
      <div className="sm:hidden w-full sm:w-auto">
        <Select value={view} onValueChange={(value: ViewType) => onViewChange(value)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="year">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4" />
                Year View
              </div>
            </SelectItem>
            <SelectItem value="month">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Month View
              </div>
            </SelectItem>
            <SelectItem value="week">
              <div className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Week View
              </div>
            </SelectItem>
            <SelectItem value="day">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Day View
              </div>
            </SelectItem>
            <SelectItem value="list">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List View
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:flex items-center gap-1 rounded-lg border bg-background p-1">
        <Button
          variant={view === 'year' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('year')}
          className="h-8"
        >
          <CalendarRange className="h-4 w-4" />
          <span className="ml-1">Year</span>
        </Button>
        <Button
          variant={view === 'month' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('month')}
          className="h-8"
        >
          <Calendar className="h-4 w-4" />
          <span className="ml-1">Month</span>
        </Button>
        <Button
          variant={view === 'week' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('week')}
          className="h-8"
        >
          <Grid3x3 className="h-4 w-4" />
          <span className="ml-1">Week</span>
        </Button>
        <Button
          variant={view === 'day' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('day')}
          className="h-8"
        >
          <Clock className="h-4 w-4" />
          <span className="ml-1">Day</span>
        </Button>
        <Button
          variant={view === 'list' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('list')}
          className="h-8"
        >
          <List className="h-4 w-4" />
          <span className="ml-1">List</span>
        </Button>
      </div>
    </>
  )
}
