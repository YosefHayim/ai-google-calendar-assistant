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

Input: { eventId, calendarId, summary?, start?, end?, location?, description? }
Output: updated event object

REQUIRED: eventId and calendarId (from the event returned by get_event)

CRITICAL - Only pass fields you want to change:
• Do NOT pass "summary" unless user explicitly asks to rename the event
• Moving an event? Only pass: eventId, calendarId, start, end
• Renaming an event? Pass: eventId, calendarId, summary
• NEVER use placeholder names like "Updated Event"

Example - Moving event to 3pm:
  Input: { eventId: "abc", calendarId: "work@...", start: {...}, end: {...} }
  (No summary! The original name "Team Meeting" is preserved)

Note: If duration provided without end, calculates end = start + duration`,

  deleteEvent: `Deletes an event permanently. Email is automatically provided from user context.

Input: { eventId, calendarId? }
Output: confirmation JSON

IMPORTANT: Use the calendarId from the event returned by get_event for accurate deletion.`,

  getEvent: `Retrieves events from user's calendars. Email is automatically provided from user context.

Input: { q?, timeMin?, searchAllCalendars?, calendarId? }
Output: { allEvents: [{ id, calendarId, summary, start, end, location?, description?, status?, htmlLink? }...] }

IMPORTANT: Each event includes its calendarId - use this when updating or deleting events.
Example event: { id: "abc123", calendarId: "work@group.calendar.google.com", summary: "Meeting", ... }

By default (searchAllCalendars=true), this tool searches across ALL user calendars to find events.
This ensures events are found regardless of which calendar they are in.
Set searchAllCalendars=false and provide calendarId to search only a specific calendar.

Defaults: timeMin = start of today (RFC3339 format), searchAllCalendars = true
Events are returned in chronological order (earliest first).`,
} as const;
