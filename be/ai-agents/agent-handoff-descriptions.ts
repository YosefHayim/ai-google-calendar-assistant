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
};
