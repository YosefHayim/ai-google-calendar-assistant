export const TOOLS_DESCRIPTION = {
  generateUserCbGoogleUrlDescription:
    "Generates a Google OAuth consent URL for calendar authentication. No input required. Returns a single URL string for user authorization.",

  registerUserViaDb:
    'Registers a new user in the authentication system. Requires "email" and "password". Validates email format and password length (6-72 chars). Returns auth provider JSON response on success, throws error on failure.',

  validateUser: `Validates user authentication by checking for stored Google Calendar tokens. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Returns token record if found, throws "User not found or no tokens available" otherwise.`,

  validateEventFields: `Normalizes free-text event descriptions into Google Calendar event JSON. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Returns normalized event fields (summary, start/end, optional location/description). Timezone precedence: explicit IANA > user default > "Asia/Jerusalem" > "UTC". Parses date ranges, single times (60m default), all-day events, and ensures end > start.`,

  insertEvent: `Creates a new calendar event in the authenticated user's Google Calendar. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Requires event details (summary, start/end in RFC3339 or all-day dates; optional description/location). Applies defaults for missing fields: summary="Untitled Event", duration=60m, timezone from user settings. Returns created event object.`,

  updateEvent: `Modifies an existing calendar event in the authenticated user's Google Calendar. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Requires "eventId" and "updates" object with fields to change. Preserves unspecified fields. If "duration" provided without "end", recomputes end = start + duration. Returns updated event object.`,

  deleteEvent: `Deletes a calendar event permanently from the authenticated user's Google Calendar. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Requires "eventId". Returns confirmation JSON from provider.`,

  getEvent: `Searches and retrieves calendar events from the authenticated user's Google Calendar. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails like "me@example.com" or ask the user for their email. Optional parameters: "q" (keyword search query for event titles/descriptions), "timeMin" (RFC3339 timestamp for minimum event start time), "customEvents" (boolean to return custom event objects). If timeMin is not provided, defaults to start of current year. Returns array of up to 10 event objects sorted by start time.`,

  getCalendarTypesByEventDetails: `Lists all calendars linked to the authenticated user. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Returns array of { calendarName, calendarId } objects for calendar selection.`,

  getUserDefaultTimeZone: `Retrieves the authenticated user's default timezone from Google Calendar settings. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Returns settings response with timezone value (e.g., "Asia/Jerusalem").`,

  // Vector Search Tools (for future use)
  searchSimilarConversations: `Searches for similar past conversations using semantic similarity. Requires "user_id" and "query_embedding" (array of 1536 numbers). Optional: "limit" (default 5), "threshold" (default 0.7). Returns array of similar conversations with similarity scores.`,

  // Conversation Memory Tools (for future use)
  getConversationContext: `Retrieves conversation context including recent messages and summaries. Requires "user_id" and "chat_id". Returns formatted context ready for LLM prompts with recentMessages, summaries, and totalMessageCount.`,

  storeConversationMessage: `Stores a conversation message in memory. Requires "user_id", "chat_id", "message_id", "role" ("user" | "assistant" | "system"), and "content". Optional: "metadata". Automatically triggers summarization every 3 messages.`,

  getAgentName: `Retrieves the authenticated user's personalized agent name from conversation metadata. The "email" and "chatId" parameters are REQUIRED and must be taken from the conversation context (provided in the "User Email" and "Chat ID" sections) - DO NOT use placeholder emails like "me@example.com" or ask the user for these values. Returns { "agent_name": string | null }.`,

  setAgentName: `Sets or updates the user's personalized agent name in conversation metadata. Requires "email", "chatId", and "agentName". The email and chatId are automatically provided in the conversation context - use those values, do NOT ask the user for them. Returns { "success": true, "agent_name": string }.`,

  get_user_routines: `Retrieves learned routines for the authenticated user. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Optional: "routineType" (daily, weekly, monthly, event_pattern, time_slot). Returns array of routine patterns with confidence scores.`,

  get_upcoming_predictions: `Predicts likely upcoming events based on learned patterns for the authenticated user. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Optional: "daysAhead" (default 7). Returns array of predicted events with confidence scores and predicted times.`,

  suggest_optimal_time: `Suggests optimal time slots for scheduling a new event for the authenticated user. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Requires "eventDuration" (minutes). Optional: "preferredTime" (ISO string). Returns best suggestion with alternatives and confidence score.`,

  get_routine_insights: `Provides insights about the authenticated user's routines and schedule patterns. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Returns summary of learned routines, typical availability, and schedule patterns.`,

  set_user_goal: `Sets or updates a goal for the authenticated user for tracking progress. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Requires "goalType" (e.g., "gym", "meetings"), "target" (number), and optional "current", "deadline" (ISO string), "description". Returns goal confirmation.`,

  get_goal_progress: `Retrieves progress toward the authenticated user's goals. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Optional: "goalType" to filter by specific goal. Returns array of goals with current progress, target, and percentage complete.`,

  get_schedule_statistics: `Retrieves schedule statistics and insights for the authenticated user. The "email" parameter is REQUIRED and must be taken from the conversation context (provided in the "User Email" section) - DO NOT use placeholder emails or ask the user for their email. Optional: "startDate" (ISO string), "endDate" (ISO string), "periodType" (daily, weekly, monthly, hourly, work_time, insights), "statisticsType" (basic, hourly, work_time, insights). Defaults to last 30 days if dates not provided. Returns comprehensive statistics including total events, hours, averages, breakdowns, and insights.`,
} as const;
