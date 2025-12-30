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

  getEvent: `Retrieves events from user's calendar.

Input: { email, q?, timeMin?, customEvents? }
Output: array of event objects

Defaults: timeMin = today. Use customEvents=true for compact response.`,
} as const;
