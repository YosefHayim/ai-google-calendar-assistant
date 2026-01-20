import type { calendar_v3 } from "googleapis";
import OpenAI from "openai";
import isEmail from "validator/lib/isEmail";
import { env, SUPABASE } from "@/config";
import { MODELS } from "@/config/constants/ai";
import {
  type ConflictCheckResult,
  categorizeError,
  type HandlerContext,
} from "@/shared/types";
import { fetchCredentialsByEmail } from "@/utils/auth";
import {
  checkEventConflicts,
  checkEventConflictsAllCalendars,
  initUserSupabaseCalendarWithTokensAndUpdateTokens,
} from "@/utils/calendar";
import { userRepository } from "@/utils/repositories/UserRepository";
import type {
  CheckConflictsParams,
  PreCreateValidationParams,
  SelectCalendarParams,
} from "../schemas";

type Event = calendar_v3.Schema$Event;

const SUMMARIZATION_MODEL = MODELS.GPT_4_1_NANO;
const openai = new OpenAI({ apiKey: env.openAiApiKey });

export type { HandlerContext, ConflictCheckResult };

export type ValidateUserResult = {
  exists: boolean;
  user?: Record<string, unknown>;
  error?: string;
};

export type TimezoneResult = {
  timezone: string;
  error?: string;
};

export type SelectCalendarResult = {
  calendarId: string;
  calendarName: string;
  matchReason?: string;
};

export type PreCreateValidationResult = {
  valid: boolean;
  timezone: string;
  calendarId: string;
  calendarName: string;
  conflicts: ConflictCheckResult;
  error?: string;
};

/**
 * Validates user existence and access permissions.
 * Checks if the user exists in the database and has proper authentication status.
 *
 * @param ctx - Handler context containing user email
 * @returns Promise resolving to validation result with user existence status
 */
export async function validateUserHandler(
  ctx: HandlerContext
): Promise<ValidateUserResult> {
  const { email } = ctx;

  if (!(email && isEmail(email))) {
    return { exists: false, error: "Invalid email address." };
  }

  try {
    const result = await userRepository.validateUserExists(email);
    return result;
  } catch (error) {
    const categorized = categorizeError(error);
    return { exists: false, error: categorized.message };
  }
}

export async function getTimezoneHandler(
  ctx: HandlerContext
): Promise<TimezoneResult> {
  const { email } = ctx;

  if (!(email && isEmail(email))) {
    return { timezone: "UTC", error: "Invalid email address." };
  }

  try {
    const user = await userRepository.findUserByEmail(email);

    if (user?.timezone) {
      return { timezone: user.timezone };
    }

    const tokenProps = await fetchCredentialsByEmail(email);
    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenProps);
    const response = await calendar.settings.get({ setting: "timezone" });
    const timezone = response.data.value || "UTC";

    if (user) {
      userRepository.updateUserTimezone(email, timezone);
    }

    return { timezone };
  } catch (error) {
    const categorized = categorizeError(error);
    console.error("Failed to get user timezone:", error);

    return {
      timezone: "UTC",
      error:
        categorized.type === "auth"
          ? "No credentials found - authorization required."
          : categorized.type === "database"
            ? "Database error - please try again in a moment."
            : "Failed to fetch timezone, using UTC.",
    };
  }
}

export type UserCalendar = {
  calendar_id: string;
  calendar_name: string;
};

export async function getCalendarCategoriesByEmail(
  email: string
): Promise<UserCalendar[]> {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    return [];
  }

  const { data, error } = await SUPABASE.from("user_calendars")
    .select("calendar_id, calendar_name")
    .eq("user_id", user.id);

  if (error || !data) {
    return [];
  }

  return data
    .filter((row): row is { calendar_id: string; calendar_name: string } =>
      Boolean(row.calendar_id && row.calendar_name)
    )
    .map((row) => ({
      calendar_id: row.calendar_id,
      calendar_name: row.calendar_name,
    }));
}

export async function selectCalendarHandler(
  params: SelectCalendarParams,
  ctx: HandlerContext
): Promise<SelectCalendarResult> {
  const { email } = ctx;
  const calendars = await getCalendarCategoriesByEmail(email);

  if (!calendars || calendars.length === 0) {
    return {
      calendarId: "primary",
      calendarName: "Primary",
      matchReason: "No calendars found",
    };
  }

  if (calendars.length === 1) {
    return {
      calendarId: calendars[0].calendar_id,
      calendarName: calendars[0].calendar_name,
      matchReason: "Only calendar available",
    };
  }

  const eventContext =
    [params.summary, params.description, params.location]
      .filter(Boolean)
      .join(" | ") || "No event details provided";

  const calendarOptions = calendars
    .map((c, i) => `${i + 1}. "${c.calendar_name}"`)
    .join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: SUMMARIZATION_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a calendar assistant that matches events to the most appropriate calendar.
Given an event and available calendars, return ONLY the number of the best matching calendar.

Rules:
- Match based on semantic meaning, not just keywords
- Consider the purpose/category each calendar name implies
- If unclear, prefer more specific calendars over generic ones
- Return ONLY a single number (1, 2, 3, etc.)`,
        },
        {
          role: "user",
          content: `Event: ${eventContext}

Available calendars:
${calendarOptions}

Which calendar number is the best match?`,
        },
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const result = response.choices[0]?.message?.content?.trim();
    const selectedIndex = Number.parseInt(result || "1", 10) - 1;

    if (selectedIndex >= 0 && selectedIndex < calendars.length) {
      return {
        calendarId: calendars[selectedIndex].calendar_id,
        calendarName: calendars[selectedIndex].calendar_name,
        matchReason: "AI semantic match",
      };
    }
    return {
      calendarId: calendars[0].calendar_id,
      calendarName: calendars[0].calendar_name,
      matchReason: "AI fallback to first",
    };
  } catch (error) {
    console.error("AI calendar selection failed:", error);
    const primary = calendars.find(
      (c) =>
        c.calendar_id === "primary" ||
        c.calendar_name.toLowerCase().includes("primary")
    );
    return {
      calendarId: primary?.calendar_id || calendars[0].calendar_id,
      calendarName: primary?.calendar_name || calendars[0].calendar_name,
      matchReason: "AI error fallback",
    };
  }
}

export async function checkConflictsHandler(
  params: CheckConflictsParams,
  ctx: HandlerContext
): Promise<ConflictCheckResult> {
  const { email } = ctx;

  if (!(email && isEmail(email))) {
    return {
      hasConflicts: false,
      conflictingEvents: [],
      error: "Invalid email address.",
    };
  }

  const startTime = params.start?.dateTime || params.start?.date;
  const endTime = params.end?.dateTime || params.end?.date;

  if (!(startTime && endTime)) {
    return {
      hasConflicts: false,
      conflictingEvents: [],
      error: "Start and end times required.",
    };
  }

  try {
    return await checkEventConflicts({
      email,
      calendarId: params.calendarId || "primary",
      startTime,
      endTime,
    });
  } catch (error) {
    console.error("Conflict check failed:", error);
    return {
      hasConflicts: false,
      conflictingEvents: [],
      error: "Failed to check conflicts.",
    };
  }
}

export async function preCreateValidationHandler(
  params: PreCreateValidationParams,
  ctx: HandlerContext
): Promise<PreCreateValidationResult> {
  const { email } = ctx;

  const [userResult, timezoneResult, calendarResult] = await Promise.all([
    validateUserHandler(ctx),
    getTimezoneHandler(ctx),
    selectCalendarHandler(
      {
        summary: params.summary || undefined,
        description: params.description || undefined,
        location: params.location || undefined,
      },
      ctx
    ),
  ]);

  if (!userResult.exists) {
    return {
      valid: false,
      timezone: "UTC",
      calendarId: "primary",
      calendarName: "Primary",
      conflicts: { hasConflicts: false, conflictingEvents: [] },
      error: userResult.error || "User not found or no tokens available.",
    };
  }

  let conflicts: ConflictCheckResult = {
    hasConflicts: false,
    conflictingEvents: [],
  };

  if (params.start && params.end) {
    const startTime = params.start.dateTime || params.start.date;
    const endTime = params.end.dateTime || params.end.date;
    if (startTime && endTime) {
      conflicts = await checkEventConflictsAllCalendars({
        email,
        startTime,
        endTime,
      });
    }
  }

  return {
    valid: true,
    timezone: timezoneResult.timezone,
    calendarId: calendarResult.calendarId,
    calendarName: calendarResult.calendarName,
    conflicts,
  };
}
