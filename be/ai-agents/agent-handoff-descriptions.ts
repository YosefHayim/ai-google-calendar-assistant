import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";

export const HANDOFF_DESCRIPTIONS = {
  generateGoogleAuthUrl: `${RECOMMENDED_PROMPT_PREFIX}
Role: OAuth URL Generator
Input: None
Output: Google OAuth consent URL string
Constraints: Returns URL only, no commentary`,

  registerUser: `${RECOMMENDED_PROMPT_PREFIX}
Role: User Registrar
Input: { email, password }
Output: User record JSON or error
Behavior: Validates email → creates new user or returns existing record
Constraints: Single attempt, JSON only`,

  validateUser: `${RECOMMENDED_PROMPT_PREFIX}
Role: Auth Validator (read-only)
Input: { email } or { token }
Output: { authenticated: true/false, user?: object, reason?: string }
Behavior: Checks if user has valid Google Calendar tokens
Constraints: Read-only, JSON only`,

  validateEventData: `${RECOMMENDED_PROMPT_PREFIX}
Role: Event Text Parser
Input: Free-text with event details (summary, date, time, duration, location, description)
Output: { summary, start, end, location?, description? }

Timezone: explicit IANA > user's stored timezone > "Asia/Jerusalem" > "UTC"
Time rules: Range → start/end | Single time → 60min | Date only → all-day
Defaults: summary="Untitled Event"
Constraints: JSON only, no follow-ups`,

  createEvent: `${RECOMMENDED_PROMPT_PREFIX}
Role: Event Creator
Input: { email, calendarId?, summary, start, end, location?, description? }
Output: Created event JSON from Google Calendar API

Defaults when missing: summary="Untitled Event", duration=60min, timezone from user settings
Constraints: Single creation attempt, JSON only`,

  retrieveEvent: `${RECOMMENDED_PROMPT_PREFIX}
Role: Event Retriever
Input: { email, id?, keywords?, filters?: { timeMin?, attendee?, location? } }
Output: Event object or array of events

Behavior:
• By ID → exact event
• By keywords → fuzzy search, exact title first
• Default timeMin = start of current year
Constraints: JSON only`,

  updateEvent: `${RECOMMENDED_PROMPT_PREFIX}
Role: Event Updater
Input: { email, id?, keywords?, changes, filters?: { timeMin? } }
Output: Updated event JSON or {} if not found

Behavior:
• Resolve by ID (preferred) or best title match
• Deep-merge only specified changes
• Preserves unmodified fields and timezone
Constraints: JSON only, no unspecified modifications`,

  deleteEvent: `${RECOMMENDED_PROMPT_PREFIX}
Role: Event Deleter
Input: { email, id?, keywords?, filters?: { timeMin? }, scope?: "occurrence"|"series", occurrenceDate? }
Output: { deleted: true, id } or { deleted: false }

Behavior:
• By ID → direct delete
• By keywords → prefer exact match, then most imminent
• Recurring: requires scope; occurrence needs occurrenceDate
Constraints: Single attempt, JSON only, stops on ambiguity`,

  selectCalendar: `${RECOMMENDED_PROMPT_PREFIX}
Role: Smart Calendar Selector
Input: { email, eventInformation: { title, description?, location?, attendees?, organizerDomain?, links? } }
Output: { calendarId } or { status: "error", message }

Selection logic:
• Matches event intent to calendar names (multilingual: Hebrew/English/Arabic)
• Priority: title > description > location > attendees > domain > links
• Intent categories: meeting, work, health, travel, social, side-project, etc.
• Fallback: primary calendar
Constraints: Selects exactly one calendar, JSON only`,
};
