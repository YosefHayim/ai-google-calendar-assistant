'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar, CheckCircle2, Clock, ExternalLink, Plus, RefreshCw, Settings } from 'lucide-react'
import { useCalendars, useCalendarColors } from '@/hooks/queries/calendars'
import { useCreateCalendar } from '@/hooks/queries/calendars/useCreateCalendar'
import { toast } from 'sonner'
import type { CustomCalendar, CreateCalendarRequest } from '@/types/api'

const ACCESS_ROLE_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  owner: { label: 'Owner', variant: 'default' },
  writer: { label: 'Editor', variant: 'secondary' },
  reader: { label: 'Viewer', variant: 'outline' },
  freeBusyReader: { label: 'Free/Busy', variant: 'outline' },
}

function CalendarCard({ calendar }: { calendar: CustomCalendar }) {
  const roleInfo = ACCESS_ROLE_LABELS[calendar.accessRole ?? 'reader'] || ACCESS_ROLE_LABELS.reader

  return (
    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
      <div className="flex items-center gap-4">
        <div
          className="w-4 h-4 rounded-full border-2"
          style={{ backgroundColor: calendar.calendarColorForEvents ?? '#4285f4' }}
        />
        <div className="min-w-0">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {calendar.calendarName || 'Unnamed Calendar'}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
            {calendar.calendarDescription || calendar.calendarId}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {calendar.timeZoneForCalendar && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline">
            <Clock className="w-3 h-3 inline mr-1" />
            {calendar.timeZoneForCalendar}
          </span>
        )}
        <Badge variant={roleInfo.variant} className="text-xs">
          {roleInfo.label}
        </Badge>
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <a
            href={`https://calendar.google.com/calendar/r/settings/calendar/${encodeURIComponent(calendar.calendarId)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}

function CreateCalendarDialog({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<CreateCalendarRequest>({
    summary: '',
    description: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  const { mutate: createCalendar, isPending } = useCreateCalendar({
    onSuccess: () => {
      toast.success('Calendar created successfully')
      setIsOpen(false)
      setFormData({ summary: '', description: '', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
      onSuccess()
    },
    onError: () => {
      toast.error('Failed to create calendar')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.summary.trim()) {
      toast.error('Calendar name is required')
      return
    }
    createCalendar(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Calendar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Calendar</DialogTitle>
          <DialogDescription>Create a new secondary calendar in your Google Calendar account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Calendar Name</Label>
            <Input
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="e.g., Work Projects"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="What is this calendar for?"
              disabled={isPending}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeZone">Timezone</Label>
            <Input id="timeZone" value={formData.timeZone} disabled className="bg-zinc-50 dark:bg-zinc-900" />
            <p className="text-xs text-zinc-500">Timezone is set to your browser's timezone</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !formData.summary.trim()}>
              {isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Calendar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function CalendarsPage() {
  const { data: calendars, isLoading, isError, refetch } = useCalendars({ custom: true })
  const { data: colors } = useCalendarColors()

  const calendarList = (calendars as CustomCalendar[] | null) ?? []
  const primaryCalendar = calendarList.find((cal) => cal.accessRole === 'owner' && cal.calendarId.includes('@'))
  const secondaryCalendars = calendarList.filter((cal) => cal !== primaryCalendar)

  return (
    <div className="flex-1 h-full overflow-auto">
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <header className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Calendars</h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              Manage your Google Calendar sources and create new calendars.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <CreateCalendarDialog onSuccess={() => refetch()} />
          </div>
        </header>

        {isLoading ? (
          <Card className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </Card>
        ) : isError ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <p className="text-red-500 font-medium mb-2">Failed to load calendars</p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          </Card>
        ) : calendarList.length === 0 ? (
          <Card className="p-6">
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400 mb-4">No calendars found</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
                Connect your Google Calendar to see your calendars here
              </p>
              <Button variant="outline" asChild>
                <a href="/dashboard/integrations">Connect Google Calendar</a>
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {primaryCalendar && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Primary Calendar</h2>
                  <Badge className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <CalendarCard calendar={primaryCalendar} />
              </Card>
            )}

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  All Calendars ({calendarList.length})
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://calendar.google.com/calendar/r/settings" target="_blank" rel="noopener noreferrer">
                    <Settings className="w-4 h-4 mr-2" />
                    Google Settings
                  </a>
                </Button>
              </div>

              <div className="space-y-2">
                {(primaryCalendar ? [primaryCalendar, ...secondaryCalendars] : secondaryCalendars).map((calendar) => (
                  <CalendarCard key={calendar.calendarId} calendar={calendar} />
                ))}
              </div>
            </Card>

            {colors && Object.keys(colors).length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Available Colors</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(colors).map(([id, color]) => (
                    <div
                      key={id}
                      className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.background }}
                      title={`Color ${id}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">
                  Calendar colors can be changed in Google Calendar settings
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
