import type { calendar_v3 } from "googleapis";
import OpenAI from "openai";
import isEmail from "validator/lib/isEmail";
import { env } from "@/config";
import { MODELS } from "@/config/constants/ai";
import {
  type ConflictCheckResult,
  checkConflictsHandler,
  getTimezoneHandler,
  type PreCreateValidationResult,
  preCreateValidationHandler,
  type SelectCalendarResult,
  selectCalendarHandler,
  type TimezoneResult,
  type ValidateUserResult,
  validateUserHandler,
} from "@/shared";

export type {
  ValidateUserResult,
  TimezoneResult,
  SelectCalendarResult,
  ConflictCheckResult,
  PreCreateValidationResult,
};

export {
  formatEventData,
  getCalendarCategoriesByEmail,
  type UserCalendar,
} from "./utils";

type Event = calendar_v3.Schema$Event;

export async function validateUserDirect(
  email: string
): Promise<ValidateUserResult> {
  return validateUserHandler({ email });
}

export async function getUserDefaultTimezoneDirect(
  email: string
): Promise<TimezoneResult> {
  return getTimezoneHandler({ email });
}

export async function selectCalendarByRules(
  email: string,
  eventInfo: {
    summary?: string | null;
    description?: string | null;
    location?: string | null;
  }
): Promise<SelectCalendarResult> {
  return selectCalendarHandler(
    {
      summary: eventInfo.summary ?? undefined,
      description: eventInfo.description ?? undefined,
      location: eventInfo.location ?? undefined,
    },
    { email }
  );
}

export async function checkConflictsDirect(params: {
  email: string;
  calendarId: string;
  start: calendar_v3.Schema$EventDateTime;
  end: calendar_v3.Schema$EventDateTime;
}): Promise<ConflictCheckResult> {
  return checkConflictsHandler(
    {
      calendarId: params.calendarId,
      start: {
        date: params.start.date ?? null,
        dateTime: params.start.dateTime ?? null,
        timeZone: params.start.timeZone ?? null,
      },
      end: {
        date: params.end.date ?? null,
        dateTime: params.end.dateTime ?? null,
        timeZone: params.end.timeZone ?? null,
      },
    },
    { email: params.email }
  );
}

export async function preCreateValidation(
  email: string,
  eventData: Partial<Event>
): Promise<PreCreateValidationResult> {
  return preCreateValidationHandler(
    {
      summary: eventData.summary ?? null,
      description: eventData.description ?? null,
      location: eventData.location ?? null,
      start: eventData.start
        ? {
            date: eventData.start.date ?? null,
            dateTime: eventData.start.dateTime ?? null,
            timeZone: eventData.start.timeZone ?? null,
          }
        : null,
      end: eventData.end
        ? {
            date: eventData.end.date ?? null,
            dateTime: eventData.end.dateTime ?? null,
            timeZone: eventData.end.timeZone ?? null,
          }
        : null,
    },
    { email }
  );
}

import { formatEventData as formatEvent } from "./utils";

export type ValidateEventResult = {
  valid: boolean;
  event?: Event & { email: string };
  error?: string;
};

export function validateEventDataDirect(
  eventData: Partial<Event> & { email: string }
): ValidateEventResult {
  const { email, ...eventLike } = eventData;

  if (!(email && isEmail(email))) {
    return { valid: false, error: "Invalid email address." };
  }

  try {
    const formatted = formatEvent(eventLike as Event);
    return { valid: true, event: { ...formatted, email } };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid event data.",
    };
  }
}

const openai = new OpenAI({ apiKey: env.openAiApiKey });
const SUMMARIZATION_MODEL = MODELS.GPT_4_1_NANO;

export async function summarizeEvents(
  events: calendar_v3.Schema$Event[]
): Promise<string> {
  if (!events || events.length === 0) {
    return "I couldn't find any events matching that. Would you like me to search differently?";
  }

  try {
    const eventsJson = JSON.stringify(events, null, 2);

    const response = await openai.chat.completions.create({
      model: SUMMARIZATION_MODEL,
      messages: [
        {
          role: "system",
          content: `Format calendar events as a compact Telegram list.

Rules:
- Use Telegram HTML: <b>bold</b>, <i>italic</i>
- Each event on ONE line: 📌 Title - Day Time (Location if exists)
- Short day names: Mon, Tue, Wed, Thu, Fri, Sat, Sun
- 12h time: 9:00 AM, 3:30 PM. Ranges: 9:00 AM-6:00 PM
- All-day events: just show the day
- Location in parentheses, keep short
- Start with: 📅 <b>Your Events</b> (or Hebrew: <b>האירועים שלך</b> if events are in Hebrew)
- NO intro/outro text. Just the list.
- Keep it scannable for mobile.`,
        },
        {
          role: "user",
          content: `Events:\n${eventsJson}`,
        },
      ],
      temperature: 0.3,
    });

    const summary = response.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error("No summary generated");
    }

    return summary;
  } catch (error) {
    console.error("Error summarizing events:", error);
    return createFallbackEventSummary(events);
  }
}

function createFallbackEventSummary(
  events: calendar_v3.Schema$Event[]
): string {
  if (events.length === 1) {
    const event = events[0];
    const title = event.summary || "Untitled Event";
    const start = event.start?.dateTime || event.start?.date || "Unknown time";
    const location = event.location ? ` at ${event.location}` : "";
    return `I found "${title}" scheduled for ${start}${location}.`;
  }

  return `I found ${events.length} events for you. Here's what I found:\n\n${events
    .slice(0, 10)
    .map((event, idx) => {
      const title = event.summary || "Untitled Event";
      const start =
        event.start?.dateTime || event.start?.date || "Unknown time";
      const location = event.location ? ` - ${event.location}` : "";
      return `${idx + 1}. "${title}" - ${start}${location}`;
    })
    .join(
      "\n"
    )}${events.length > 10 ? `\n\n...and ${events.length - 10} more events.` : ""}`;
}
