export const TOOLS_DESCRIPTION = {
  generateGoogleAuthUrlDescription:
    "Generates Google OAuth consent URL for calendar authorization. Input: none. Output: URL string.",

  registerUserViaDb:
    "Creates a new user record. Input: { email, password }. Output: user record JSON or throws error.",

  validateUser:
    'Checks if user has Google Calendar tokens. Input: { email }. Output: token record or throws "User not found or no tokens available."',

  validateEventFields: `Parses free-text into Google Calendar event JSON.

Input: { email, text }
Output: { summary, start, end, location?, description? }

Timezone precedence: explicit IANA > user's stored timezone > "Asia/Jerusalem" > "UTC"

Time parsing rules:
• "9 PM–10 PM" → start/end times
• Single time → 60min duration
• Date + duration (no time) → starts 09:00 local
• Date only → all-day event (end = start + 1 day)
• Ensures end > start (rolls to next day if needed)
• Uses RFC3339 dateTime with timeZone field`,

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

  selectCalendarByEventDetails:
    "Lists all user calendars. Input: { email }. Output: [{ calendarName, calendarId }]",

  checkConflicts: `Checks for conflicting events before creating a new event.

Input: { email, calendarId, start, end }
Output: { hasConflicts: boolean, conflictingEvents: [{ id, summary, start, end, calendarName }] }

Use to warn user about scheduling conflicts before proceeding with event creation.`,
} as const;
