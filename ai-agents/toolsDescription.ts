export const TOOLS_DESCRIPTION = {
  generateUserCbGoogleUrlDescription:
    "Generates a Google OAuth consent URL for calendar authentication. No input required. Returns a single URL string for user authorization.",

  registerUserViaDb:
    'Registers a new user in the authentication system. Requires "email" and "password". Validates email format and password length (6-72 chars). Returns auth provider JSON response on success, throws error on failure.',

  validateUser: `Validates user authentication by checking for stored Google Calendar tokens. Requires "email". Returns token record if found, throws "User not found or no tokens available" otherwise.`,

  validateEventFields: `Normalizes free-text event descriptions into Google Calendar event JSON. Requires "email". Returns normalized event fields (summary, start/end, optional location/description). Timezone precedence: explicit IANA > user default > "Asia/Jerusalem" > "UTC". Parses date ranges, single times (60m default), all-day events, and ensures end > start.`,

  insertEvent: `Creates a new calendar event. Requires "email" and event details (summary, start/end in RFC3339 or all-day dates; optional description/location). Applies defaults for missing fields: summary="Untitled Event", duration=60m, timezone from user settings. Returns created event object.`,

  updateEvent: `Modifies an existing calendar event. Requires "email", "eventId", and "updates" object with fields to change. Preserves unspecified fields. If "duration" provided without "end", recomputes end = start + duration. Returns updated event object.`,

  deleteEvent: `Deletes a calendar event permanently. Requires "email" and "eventId". Returns confirmation JSON from provider.`,

  getEvent: `Retrieves events from user's calendar. Requires "email". Optional: "q" (keyword query), "timeMin" (RFC3339 timestamp). Defaults timeMin to today if not provided. Returns array of event objects.`,

  getCalendarTypesByEventDetails: `Lists all calendars linked to the user. Requires "email". Returns array of { calendarName, calendarId } objects for calendar selection.`,

  getUserDefaultTimeZone: `Retrieves user's default timezone from Google Calendar settings. Requires "email". Returns settings response with timezone value (e.g., "Asia/Jerusalem").`,

  // Vector Search Tools (for future use)
  searchSimilarConversations: `Searches for similar past conversations using semantic similarity. Requires "user_id" and "query_embedding" (array of 1536 numbers). Optional: "limit" (default 5), "threshold" (default 0.7). Returns array of similar conversations with similarity scores.`,

  // Conversation Memory Tools (for future use)
  getConversationContext: `Retrieves conversation context including recent messages and summaries. Requires "user_id" and "chat_id". Returns formatted context ready for LLM prompts with recentMessages, summaries, and totalMessageCount.`,

  storeConversationMessage: `Stores a conversation message in memory. Requires "user_id", "chat_id", "message_id", "role" ("user" | "assistant" | "system"), and "content". Optional: "metadata". Automatically triggers summarization every 3 messages.`,
} as const;
