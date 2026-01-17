export const TOOLS_DESCRIPTION = {
  generateGoogleAuthUrlDescription:
    "Generates Google OAuth consent URL for calendar authorization. Input: none. Output: URL string.",

  registerUserViaDb:
    "Registers a user for Google Calendar access. Input: { email, name? }. Output: Google OAuth URL for calendar authorization. Note: This app uses Google OAuth only, no passwords.",

  insertEvent: `Creates a calendar event. Email is automatically provided from user context.

Input: { calendarId, summary, start, end, location?, description?, reminders? }
Output: created event object from Google Calendar API

Defaults when missing: summary="Untitled Event", duration=60min, timezone from user's stored settings

Reminder behavior:
- If reminders explicitly provided, uses those
- If not provided, checks user's stored reminder preferences
- User can configure defaults via update_user_reminder_preferences tool
- Set reminders.useDefault=true to use calendar's default reminders
- Or provide reminders.overrides with custom [{method: "email"|"popup", minutes: number}]`,

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

SEARCH BEHAVIOR (q parameter):
• The q parameter performs PARTIAL/CONTAINS matching across event fields (summary, description, location)
• "Predicto" will find "Predicto Startup", "Predicto Daily Standup", "Meeting at Predicto"
• Use SHORT keywords for best results: "Predicto" not "Predicto Startup Daily Meeting"
• If no results, try WITHOUT q parameter to get all events in the time range

SMART SEARCH STRATEGY:
1) First try: Use key word(s) from user's request
2) If no results: Remove qualifiers, try single keyword
3) If still no results: Search without q, filter results manually
4) NEVER say "event not found" - list available events instead

By default (searchAllCalendars=true), this tool searches across ALL user calendars to find events.
This ensures events are found regardless of which calendar they are in.
Set searchAllCalendars=false and provide calendarId to search only a specific calendar.

Defaults: timeMin = start of today (RFC3339 format), searchAllCalendars = true
Events are returned in chronological order (earliest first).`,

  analyzeGaps: `Analyzes the user's calendar for untracked time gaps between events. Email is automatically provided from user context.

Input: { lookbackDays?, calendarId? }
Output: { gaps: [{ id, start, end, durationMinutes, durationFormatted, precedingEventSummary, followingEventSummary, suggestion?, confidence }...], totalCount, analyzedRange }

Gap detection rules:
- Only gaps between 30 minutes and 8 hours are flagged
- All-day events are excluded from analysis
- Gaps on ignored days (per user settings) are excluded

Inference types:
- travel_sandwich: Gap between "Drive to X" and "Drive home" events
- work_session: Gap during work hours between work-related events
- meal_break: Gap during typical meal times
- standard_gap: Any other gap with generic suggestion

Use this when the user asks about:
- "What gaps are in my calendar?"
- "Find untracked time"
- "Check for missing events"
- "Analyze my schedule gaps"`,

  fillGap: `Creates a new calendar event to fill a detected time gap. Email is automatically provided from user context.

Input: { gapStart, gapEnd, summary, description?, location?, calendarId? }
Output: { success: boolean, eventId?: string }

Use this after analyze_gaps_direct to fill in gaps the user wants to document.
The event will be created spanning the exact gap time period.`,

  formatGapsForDisplay: `Formats gap analysis results into a user-friendly message for chat interfaces.

Input: { gaps: GapCandidateDTO[] }
Output: { formatted: string, count: number }

The formatted output includes:
- Numbered list of gaps with dates and times
- Duration of each gap
- Events before and after each gap
- Suggestions (if confidence >= 0.5)
- Action instructions for the user`,

  setEventReminders: `Set reminders for an existing calendar event. Email is automatically provided from user context.

Input: { eventId, calendarId?, reminders: { useDefault: boolean, overrides?: [{ method: "email"|"popup", minutes: number }] } }
Output: Updated event object with reminders

Use when user explicitly asks to:
- "Remind me 30 minutes before the meeting"
- "Set a notification for this event"
- "Add an email reminder 1 day before"

Note: Maximum 5 reminder overrides, minutes range 0-40320 (4 weeks).`,

  getCalendarDefaultReminders: `Get the default reminders configured for a calendar. Email is automatically provided from user context.

Input: { calendarId? }
Output: { defaultReminders: [{ method, minutes }], calendarName: string }

Use when user asks about their default reminder settings for a calendar.`,

  updateCalendarDefaultReminders: `Update the default reminders for a calendar. These apply to all new events unless overridden. Email is automatically provided from user context.

Input: { calendarId?, defaultReminders: [{ method: "email"|"popup", minutes: number }] }
Output: Updated calendar list entry

Use when user wants to change their default reminder behavior for a calendar.
Maximum 5 default reminders allowed.`,

  getUserReminderPreferences: `Get the user's stored reminder preferences from Ally's brain. Email is automatically provided from user context.

Input: {}
Output: { enabled: boolean, defaultReminders: [], useCalendarDefaults: boolean } or null if not set

Use to check user's reminder preferences before creating events.`,

  updateUserReminderPreferences: `Update the user's reminder preferences stored in Ally's brain. Email is automatically provided from user context.

Input: { enabled: boolean, defaultReminders: [{ method, minutes }], useCalendarDefaults: boolean }
Output: { success: boolean }

Use when user wants Ally to remember their preferred reminder settings:
- "Always remind me 15 minutes before events"
- "I like email reminders 1 day before"
- "Use my calendar's default reminders"`,

  updateUserBrain: `Save a permanent user preference or rule to memory. Email is automatically provided from user context.

Input: { preference: string, category?: string, replacesExisting?: string }
Output: { success: boolean, message: string }

WHEN TO USE:
- User states a lasting preference: "Always keep Fridays free", "Call me Captain"
- User defines locations: "My gym is Planet Fitness", "I work at Company X"
- User sets scheduling rules: "Never schedule before 9am", "I prefer morning meetings"

WHEN NOT TO USE:
- Temporary commands: "Cancel tomorrow's meeting", "Move my 3pm call"
- One-time requests: "Schedule a meeting with John tomorrow"

CATEGORIES: "scheduling", "communication", "naming", "location", "general"

The tool automatically:
- Detects and avoids duplicate preferences
- Replaces conflicting preferences when replacesExisting is provided
- Preserves existing instructions while adding new ones`,
} as const;
