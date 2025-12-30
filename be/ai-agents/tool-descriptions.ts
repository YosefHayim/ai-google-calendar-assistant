export const TOOLS_DESCRIPTION = {
  generateGoogleAuthUrlDescription:
    "Generates Google OAuth consent URL for calendar authorization. Input: none. Output: URL string.",

  registerUserViaDb:
    "Creates a new user record. Input: { email, password }. Output: user record JSON or throws error.",

  insertEvent: `Creates a calendar event.

Input: { email, calendarId, summary, start, end, location?, description? }
Output: created event object from Google Calendar API

Defaults when missing: summary="Untitled Event", duration=60min, timezone from user's stored settings`,

  updateEvent: `Modifies an existing event. Preserves unspecified fields.

Input: { email, calendarId, eventId, updates: { summary?, start?, end?, location?, description? } }
Output: updated event object

Note: If duration provided without end, calculates end = start + duration`,

  deleteEvent:
    "Deletes an event permanently. Input: { email, eventId }. Output: confirmation JSON.",

  getEvent: `Retrieves events from user's calendars.

Input: { email, q?, timeMin?, searchAllCalendars?, calendarId? }
Output: array of event objects with calendar information

IMPORTANT: By default (searchAllCalendars=true), this tool searches across ALL user calendars to find events.
This ensures events are found regardless of which calendar they are in.
Set searchAllCalendars=false and provide calendarId to search only a specific calendar.

Defaults: timeMin = today, searchAllCalendars = true`,
} as const;
