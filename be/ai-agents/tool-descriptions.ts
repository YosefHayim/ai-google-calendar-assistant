export const TOOLS_DESCRIPTION = {
  generateGoogleAuthUrlDescription:
    "Generates Google OAuth consent URL for calendar authorization. Input: none. Output: URL string.",

  registerUserViaDb:
    "Registers a user for Google Calendar access. Input: { email, name? }. Output: Google OAuth URL for calendar authorization. Note: This app uses Google OAuth only, no passwords.",

  insertEvent: `Creates a calendar event. Email is automatically provided from user context.

Input: { calendarId, summary, start, end, location?, description? }
Output: created event object from Google Calendar API

Defaults when missing: summary="Untitled Event", duration=60min, timezone from user's stored settings`,

  updateEvent: `Modifies an existing event. Preserves unspecified fields. Email is automatically provided from user context.

Input: { calendarId, eventId, updates: { summary?, start?, end?, location?, description? } }
Output: updated event object

Note: If duration provided without end, calculates end = start + duration`,

  deleteEvent:
    "Deletes an event permanently. Email is automatically provided from user context. Input: { eventId }. Output: confirmation JSON.",

  getEvent: `Retrieves events from user's calendars. Email is automatically provided from user context.

Input: { q?, timeMin?, searchAllCalendars?, calendarId? }
Output: array of event objects with calendar information, sorted by start time

IMPORTANT: By default (searchAllCalendars=true), this tool searches across ALL user calendars to find events.
This ensures events are found regardless of which calendar they are in.
Set searchAllCalendars=false and provide calendarId to search only a specific calendar.

Defaults: timeMin = start of today (RFC3339 format), searchAllCalendars = true
Events are returned in chronological order (earliest first).`,
} as const;
