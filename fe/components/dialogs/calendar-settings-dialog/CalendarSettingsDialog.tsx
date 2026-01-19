'use client'

import React from 'react'
import { CalendarDays, CheckCircle, Star } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { CalendarSettingsDialogProps } from '@/types/analytics'
import type { ExtendedCalendarEntry } from './types'
import {
  InfoSection,
  RemindersList,
  ColorDisplay,
  NotificationsSection,
  ConferenceSection,
  BooleanStatus,
} from './components'

export function CalendarSettingsDialog({ isOpen, calendar, onClose }: CalendarSettingsDialogProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  if (!calendar) {
    return null
  }

  const displayName = calendar.summary || calendar.id.split('@')[0]
  const calendarColor = calendar.backgroundColor || '#6366f1'
  const calendarEntry = calendar as ExtendedCalendarEntry

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-2xl w-full p-0 overflow-hidden border-none shadow-xl"
        style={{ borderTop: `4px solid ${calendarColor}` }}
      >
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader className="mb-6 text-left">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: calendarColor, opacity: 0.2 }}
              >
                <CalendarDays className="w-5 h-5" style={{ color: calendarColor }} />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold text-foreground dark:text-primary-foreground">
                  {displayName}
                </DialogTitle>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">Calendar Settings</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <InfoSection
              title="Calendar ID"
              tooltipTitle="Unique Calendar Identifier"
              tooltipDescription="A unique ID assigned by Google Calendar to identify this calendar. Used internally for API calls and syncing."
            >
              <p className="text-sm text-zinc-600 dark:text-muted-foreground font-mono break-all">{calendar.id}</p>
            </InfoSection>

            {calendar.summary && (
              <InfoSection
                title="Summary"
                tooltipTitle="Calendar Name"
                tooltipDescription="The display name of this calendar as shown in Google Calendar."
              >
                <p className="text-sm text-zinc-600 dark:text-muted-foreground">{calendar.summary}</p>
              </InfoSection>
            )}

            {calendar.description && (
              <InfoSection
                title="Description"
                tooltipTitle="Calendar Description"
                tooltipDescription="A user-defined description explaining the purpose or content of this calendar."
              >
                <p className="text-sm text-zinc-600 dark:text-muted-foreground">{calendar.description}</p>
              </InfoSection>
            )}

            {calendarEntry.location && (
              <InfoSection
                title="Location"
                tooltipTitle="Calendar Location"
                tooltipDescription="The geographic location associated with this calendar. Useful for region-specific calendars."
              >
                <p className="text-sm text-zinc-600 dark:text-muted-foreground">{calendarEntry.location}</p>
              </InfoSection>
            )}

            {calendar.timeZone && (
              <InfoSection
                title="Timezone"
                tooltipTitle="Calendar Timezone"
                tooltipDescription="The default timezone for events in this calendar. All-day events and recurring events use this timezone."
              >
                <p className="text-sm text-zinc-600 dark:text-muted-foreground">{calendar.timeZone}</p>
              </InfoSection>
            )}

            {calendar.accessRole && (
              <InfoSection
                title="Access Role"
                tooltipTitle="Your Access Level"
                tooltipDescription="Your permission level: Owner (full control), Writer (edit events), Reader (view only), or FreeBusyReader (availability only)."
              >
                <p className="text-sm text-zinc-600 dark:text-muted-foreground capitalize">{calendar.accessRole}</p>
              </InfoSection>
            )}

            {calendar.defaultReminders && calendar.defaultReminders.length > 0 && (
              <RemindersList reminders={calendar.defaultReminders} />
            )}

            {calendar.primary !== undefined && (
              <BooleanStatus
                title="Primary Calendar"
                tooltipTitle="Primary Calendar Status"
                tooltipDescription="Indicates whether this is your primary calendar. The primary calendar is typically your main personal calendar."
                value={calendar.primary}
                icon={<Star className="w-4 h-4 text-muted-foreground" />}
              />
            )}

            {calendar.selected !== undefined && (
              <BooleanStatus
                title="Selected"
                tooltipTitle="Calendar Selection Status"
                tooltipDescription="Indicates whether this calendar is currently selected and visible in your calendar view."
                value={calendar.selected}
                icon={<CheckCircle className="w-4 h-4 text-muted-foreground" />}
              />
            )}

            <ColorDisplay
              backgroundColor={calendar.backgroundColor}
              foregroundColor={calendar.foregroundColor}
              colorId={calendar.colorId}
            />

            {calendarEntry.notificationSettings?.notifications &&
              calendarEntry.notificationSettings.notifications.length > 0 && (
                <NotificationsSection notifications={calendarEntry.notificationSettings.notifications} />
              )}

            {calendarEntry.conferenceProperties?.allowedConferenceSolutionTypes &&
              calendarEntry.conferenceProperties.allowedConferenceSolutionTypes.length > 0 && (
                <ConferenceSection allowedTypes={calendarEntry.conferenceProperties.allowedConferenceSolutionTypes} />
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CalendarSettingsDialog
