export const TOOLS_DESCRIPTION = {
  generateUserCbGoogleUrlDescription:
    "Generates a new Google OAuth consent URL for the user to authorize or reauthorize calendar access. No input required. Returns a single URL string that the user must visit to complete authentication.",

  registerUserViaDb:
    'Registers a new user in the auth system. Requires "email" and "password". Validates email and password length. On success returns the auth provider’s JSON response; otherwise throws an error.',

  validateUser: `Checks if a user has stored Google Calendar tokens. Requires "email". Returns the single token record if found; throws "User not found or no tokens available." otherwise.
Example input:
{ "email": "user@example.com" }
Example success (shape varies by storage):
{ "email": "user@example.com", "access_token": "...", "refresh_token": "...", "expiry_date": 1720000000000 }`,

  validateEventFields: `Normalizes free-text into a minimal Google Calendar event object. Requires "email". Returns ONLY the normalized event fields (no calendarId). Time zone precedence: explicit IANA in text > user default (getUserDefaultTimeZone) > "Asia/Jerusalem" > "UTC".
Accepted inputs may include: Summary, Date, Start, End, Duration, Timezone, Location, Description.

Rules:
- Range like "9 PM–10 PM" → start/end.
- Single time → 60m duration.
- Date + duration (no time) → start 09:00 local; end = start + duration (timed).
- Date only → all-day (start.date=YYYY-MM-DD; end.date=YYYY-MM-DD+1).
- Ensure end > start; if not, roll end by +1 day.
- Use RFC3339 for dateTime and include timeZone on start/end when dateTime is used.
- Omit absent optional fields.

Example input:
{ "email": "user@example.com", "text": "Lunch with Sarah tomorrow at 13:00 in Tel Aviv" }

Example output (timed):
{
  "summary": "Lunch with Sarah",
  "start": { "dateTime": "2025-06-30T13:00:00+03:00", "timeZone": "Asia/Jerusalem" },
  "end":   { "dateTime": "2025-06-30T14:00:00+03:00", "timeZone": "Asia/Jerusalem" },
  "location": "Tel Aviv"
}`,

  insertEvent: `Creates a new calendar event for the specified user. Requires "email" and event details (summary, start/end in RFC3339 or all-day dates; optional description/location). If required fields are missing, applies one-time sensible defaults (summary="Untitled Event", duration=60m, timezone from getUserDefaultTimeZone→"Asia/Jerusalem"→"UTC"). Returns the created event object from the provider.
Example:
{
  "email": "user@example.com",
  "calendarId": "primary",
  "summary": "Quick Standup Meeting",
  "location": "Online - Google Meet",
  "description": "Daily standup.",
  "start": { "dateTime": "2025-06-29T15:00:00+03:00", "timeZone": "Asia/Jerusalem" },
  "end":   { "dateTime": "2025-06-29T15:30:00+03:00", "timeZone": "Asia/Jerusalem" }
}`,

  updateEvent: `Modifies an existing calendar event. Requires "email", "eventId", and an "updates" object with fields to change (summary, description, start/end, location, etc.). Preserves unspecified fields. If "duration" is supplied without "end", recomputes end = start + duration. Returns the updated event object.
Example:
{
  "email": "user@example.com",
  "calendarId": "primary",
  "eventId": "abc123def456",
  "updates": {
    "summary": "Updated Meeting Title",
    "start": { "dateTime": "2025-06-29T16:00:00+03:00", "timeZone": "Asia/Jerusalem" },
    "end":   { "dateTime": "2025-06-29T16:30:00+03:00", "timeZone": "Asia/Jerusalem" }
  }
}`,

  deleteEvent: `Deletes a calendar event permanently. Requires "email" and "eventId". Returns confirmation JSON from the provider.
Example:
{ "email": "user@example.com", "eventId": "abc123def456" }`,

  getEvent: `Retrieves events from the user's calendar. Requires "email". Optional: "q" (keyword query), "timeMin" (RFC3339). If not provided, the implementation defaults timeMin to today's date (YYYY-MM-DD). Returns an array of event objects.
Example:
{ "email": "user@example.com", "q": "standup", "timeMin": "2025-01-01" }`,

  getCalendarTypesByEventDetails: `Lists all calendars linked to the user. Requires "email". Returns an array of { calendarName, calendarId }.
Example return:
[
  { "calendarName": "משפחה וחברים", "calendarId": "49508390...@group.calendar.google.com" },
  { "calendarName": "Side Projects", "calendarId": "sideproj...@group.calendar.google.com" }
]`,

  getUserDefaultTimeZone: `Retrieves the user's default timezone from Google Calendar settings. Requires "email". Returns the provider settings response including the timezone value (e.g., { "kind": "calendar#setting", "etag": "...", "id": "timezone", "value": "Asia/Jerusalem" }).

Example input:
{ "email": "user@example.com" }

Example output:
{ "kind": "calendar#setting", "etag": "\\"1234567890\\"", "id": "timezone", "value": "Asia/Jerusalem" }`,

  // Vector Search Tools (for future use)
  searchSimilarConversations: `Searches for similar past conversations using semantic similarity. Requires "user_id" and "query_embedding" (array of 1536 numbers). Optional: "limit" (default 5), "threshold" (default 0.7). Returns array of similar conversations with similarity scores.

Example input:
{ "user_id": "123e4567-e89b-12d3-a456-426614174000", "query_embedding": [0.1, 0.2, ...], "limit": 3, "threshold": 0.6 }

Example output:
[
  { "id": 1, "content": "User: Schedule meeting...", "similarity": 0.85, "metadata": {...} },
  { "id": 2, "content": "User: Add event...", "similarity": 0.72, "metadata": {...} }
]`,

  // Conversation Memory Tools (for future use)
  getConversationContext: `Retrieves conversation context including recent messages and summaries. Requires "user_id" and "chat_id". Returns formatted context ready for LLM prompts.

Example input:
{ "user_id": "123e4567-e89b-12d3-a456-426614174000", "chat_id": 12345 }

Example output:
{
  "recentMessages": [
    { "role": "user", "content": "Schedule a meeting", "metadata": {...} },
    { "role": "assistant", "content": "I'll help you...", "metadata": {...} }
  ],
  "summaries": [
    { "summary_text": "Previous conversation about...", "message_count": 3, ... }
  ],
  "totalMessageCount": 5
}`,

  storeConversationMessage: `Stores a conversation message in memory. Requires "user_id", "chat_id", "message_id", "role" ("user" | "assistant" | "system"), and "content". Optional: "metadata". Automatically triggers summarization every 3 messages.

Example input:
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "chat_id": 12345,
  "message_id": 1,
  "role": "user",
  "content": "Schedule a meeting tomorrow at 2pm",
  "metadata": { "timestamp": "2025-01-23T12:00:00Z" }
}

Example output: void (message stored successfully)`,
} as const;
