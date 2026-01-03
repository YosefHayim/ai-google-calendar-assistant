'use client'

import { Bell, CalendarDays, CheckCircle, Info, Mail, Star, Video } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

import type { CalendarListEntry } from '@/types/api'
import type { CalendarSettingsDialogProps } from '@/types/analytics'
import React from 'react'

const CalendarSettingsDialog: React.FC<CalendarSettingsDialogProps> = ({ isOpen, calendar, onClose }) => {
  // Handle Shadcn's onOpenChange
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
  const calendarEntry = calendar as CalendarListEntry & {
    notificationSettings?: {
      notifications?: Array<{
        type: string
        method: string
      }>
    }
    conferenceProperties?: {
      allowedConferenceSolutionTypes?: string[]
    }
    location?: string
  }

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
                <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{displayName}</DialogTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Calendar Settings</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Calendar ID */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                Calendar ID
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 text-xs">
                    <p className="font-medium mb-1">Unique Calendar Identifier</p>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      A unique ID assigned by Google Calendar to identify this calendar. Used internally for API calls
                      and syncing.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono break-all">{calendar.id}</p>
            </div>

            {/* Summary */}
            {calendar.summary && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  Summary
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-xs">
                      <p className="font-medium mb-1">Calendar Name</p>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        The display name of this calendar as shown in Google Calendar.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{calendar.summary}</p>
              </div>
            )}

            {/* Description */}
            {calendar.description && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  Description
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-xs">
                      <p className="font-medium mb-1">Calendar Description</p>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        A user-defined description explaining the purpose or content of this calendar.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{calendar.description}</p>
              </div>
            )}

            {/* Location */}
            {calendarEntry.location && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  Location
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-xs">
                      <p className="font-medium mb-1">Calendar Location</p>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        The geographic location associated with this calendar. Useful for region-specific calendars.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{calendarEntry.location}</p>
              </div>
            )}

            {/* Timezone */}
            {calendar.timeZone && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  Timezone
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-xs">
                      <p className="font-medium mb-1">Calendar Timezone</p>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        The default timezone for events in this calendar. All-day events and recurring events use this
                        timezone.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{calendar.timeZone}</p>
              </div>
            )}

            {/* Access Role */}
            {calendar.accessRole && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  Access Role
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-xs">
                      <p className="font-medium mb-1">Your Access Level</p>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        Your permission level: <strong>Owner</strong> (full control), <strong>Writer</strong> (edit
                        events), <strong>Reader</strong> (view only), or <strong>FreeBusyReader</strong> (availability
                        only).
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">{calendar.accessRole}</p>
              </div>
            )}

            {/* Default Reminders */}
            {calendar.defaultReminders && calendar.defaultReminders.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-zinc-500" />
                  Default Reminders
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-xs">
                      <p className="font-medium mb-1">Default Reminder Settings</p>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        Default reminders that are applied to all events in this calendar unless overridden.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </h4>
                <div className="space-y-1">
                  {calendar.defaultReminders.map((reminder, index) => (
                    <div key={index} className="text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="capitalize">{reminder.method}</span>
                      {reminder.minutes !== undefined && (
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {' '}
                          - {reminder.minutes} {reminder.minutes === 1 ? 'minute' : 'minutes'} before
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Calendar */}
            {calendar.primary !== undefined && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-zinc-500" />
                  Primary Calendar
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-xs">
                      <p className="font-medium mb-1">Primary Calendar Status</p>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        Indicates whether this is your primary calendar. The primary calendar is typically your main
                        personal calendar.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </h4>
                <div className="flex items-center gap-2">
                  {calendar.primary ? (
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Yes</span>
                  ) : (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">No</span>
                  )}
                </div>
              </div>
            )}

            {/* Selected */}
            {calendar.selected !== undefined && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-zinc-500" />
                  Selected
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-xs">
                      <p className="font-medium mb-1">Calendar Selection Status</p>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        Indicates whether this calendar is currently selected and visible in your calendar view.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </h4>
                <div className="flex items-center gap-2">
                  {calendar.selected ? (
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Yes</span>
                  ) : (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">No</span>
                  )}
                </div>
              </div>
            )}

            {/* Color Information */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                Color
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 text-xs">
                    <p className="font-medium mb-1">Display Color</p>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      The color used to display this calendar and its events in the UI. Helps distinguish between
                      multiple calendars.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </h4>
              <div className="space-y-2">
                {calendar.backgroundColor && (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-md border border-zinc-200 dark:border-zinc-800"
                      style={{ backgroundColor: calendar.backgroundColor }}
                    />
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Background</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">{calendar.backgroundColor}</p>
                    </div>
                  </div>
                )}
                {calendar.foregroundColor && (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-md border border-zinc-200 dark:border-zinc-800"
                      style={{ backgroundColor: calendar.foregroundColor }}
                    />
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Foreground</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">{calendar.foregroundColor}</p>
                    </div>
                  </div>
                )}
                {calendar.colorId && (
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Color ID</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">{calendar.colorId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notification Settings */}
            {calendarEntry.notificationSettings?.notifications &&
              calendarEntry.notificationSettings.notifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-zinc-500" />
                    Notification Settings
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-64 text-xs">
                        <p className="font-medium mb-1">Notification Preferences</p>
                        <p className="text-zinc-500 dark:text-zinc-400">
                          How you receive notifications for events in this calendar (email, popup, etc.).
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </h4>
                  <div className="space-y-1">
                    {calendarEntry.notificationSettings.notifications.map((notification, index) => (
                      <div key={index} className="text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="capitalize">{notification.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-zinc-500 dark:text-zinc-400"> - {notification.method}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Conference Properties */}
            {calendarEntry.conferenceProperties?.allowedConferenceSolutionTypes &&
              calendarEntry.conferenceProperties.allowedConferenceSolutionTypes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-zinc-500" />
                    Conference Properties
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-64 text-xs">
                        <p className="font-medium mb-1">Allowed Conference Solutions</p>
                        <p className="text-zinc-500 dark:text-zinc-400">
                          Types of video conferencing solutions that can be added to events in this calendar.
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </h4>
                  <div className="space-y-1">
                    {calendarEntry.conferenceProperties.allowedConferenceSolutionTypes.map((type, index) => (
                      <div key={index} className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">
                        {type.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CalendarSettingsDialog
