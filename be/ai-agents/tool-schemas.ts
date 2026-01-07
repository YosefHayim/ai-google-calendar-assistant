import { TIMEZONE } from "@/config";
import validator from "validator";
import { z } from "zod";

const requiredString = (description: string, message = "Required.") =>
  z.coerce.string({ description }).trim().min(1, { message });

const calendarSchema = z.coerce
  .string({
    description:
      "The ID of the calendar to which the event belongs to. Use the calendarId from the event when updating. Falls back to 'primary' if not provided.",
  })
  .transform((val) => {
    // Reject obviously invalid values and normalize
    if (!val || val === "/" || val.trim() === "") return null;
    return val.trim();
  })
  .nullable();

// Email schema - only used for registration where user provides email
const emailSchema = z.coerce
  .string({
    description: "The email address of the user.",
  })
  .includes("@", { message: "Must include @ symbol" })
  .refine((v) => validator.isEmail(v), { message: "Invalid email address." });

export const makeEventTime = () =>
  z
    .object({
      date: z.coerce
        .string({
          description:
            'The date, in the format "yyyy-mm-dd", if this is an all-day event, no need to pass if we have dateTime field.',
          invalid_type_error: 'Invalid date format. Example: "2025-07-17"',
          message: "Invalid date format.",
        })
        .nullable(),
      dateTime: z.coerce
        .string({
          description:
            "The time, as a combined date-time value (formatted according to RFC3339). A time zone offset is required unless a time zone is explicitly specified in timeZone.",
          invalid_type_error: `Invalid date-time format. Example:"${new Date().toISOString()}" `,
          message: "Invalid date-time format.",
        })
        .nullable(),
      timeZone: z.coerce
        .string({
          invalid_type_error: "Must be a valid IANA Time Zone Database name.",
          message: `Must be a valid IANA Time Zone Database name. Example:"${TIMEZONE.ASIA_JERUSALEM}":`,
          description:
            'The time zone in which the time is specified. (Formatted as an IANA Time Zone Database name, e.g. "Asia/Jerusalem".) ',
        })
        .nullable(),
    })
    .describe("Event start or end time, with optional timezone.");

// Event parameters WITHOUT email - email comes from authenticated context
const makeFullEventParams = () =>
  z
    .object({
      calendarId: calendarSchema,
      summary: requiredString("Title of the event.", "Summary is required."),
      description: z.coerce
        .string({ description: "Description of the event." })
        .nullable(),
      location: z.coerce
        .string({ description: "Geographic location of the event." })
        .nullable(),
      start: makeEventTime(),
      end: makeEventTime(),
    })
    .describe(
      "Full event parameters including summary, description, location, start, and end times. Email is automatically provided from user context.",
    );

export const PARAMETERS_TOOLS = {
  generateGoogleAuthUrlParameters: z.object({}),
  // Registration still needs email as user provides it
  registerUserParameters: z.object({
    email: emailSchema.describe("The email address of the user."),
    name: z.string().optional().describe("Optional name of the user."),
  }),
  // GET events - no email needed, uses authenticated context
  getEventParameters: z
    .object({
      timeMin: z.coerce
        .string({
          description:
            "The minimum date and time for events to return, formatted as RFC3339 timestamp.",
        })
        .nullable(),
      timeMax: z.coerce
        .string({
          description:
            "The maximum date and time for events to return, formatted as RFC3339 timestamp. IMPORTANT: Always set this to limit the query scope. Default behavior: if timeMax is not provided, it will be automatically set to 1 day after timeMin to prevent fetching too many events. For 'today' queries, set timeMax to end of today. For 'tomorrow' queries, set timeMax to end of tomorrow. For 'this week' queries, set timeMax to end of the week.",
        })
        .nullable(),
      q: z.coerce
        .string({
          description:
            "Optional parameter to search for text matches across all event fields in Google Calendar.",
        })
        .nullable(),
      customEvents: z.coerce
        .boolean({
          description:
            "Optional parameter whether we want to receive back custom event object or not, default to true.",
        })
        .nullable(),
      searchAllCalendars: z.coerce
        .boolean({
          description:
            "When true, searches across ALL user calendars instead of just the primary one. IMPORTANT: Always set to true when searching for events by name/title (q parameter) to ensure the event is found regardless of which calendar it's in. Default is true.",
        })
        .default(true),
      calendarId: z.coerce
        .string({
          description:
            "The ID of a specific calendar to search. Only used when searchAllCalendars is false.",
        })
        .nullable(),
    })
    .describe(
      "Fetch events for the authenticated user. Email is automatically provided from user context. By default searches all calendars. IMPORTANT: Always provide timeMax to limit query scope.",
    ),

  // INSERT event - no email needed
  insertEventParameters: makeFullEventParams().describe(
    "Insert a new event into the user's calendar. Email is automatically provided from user context.",
  ),

  // UPDATE event - eventId required, all other fields optional with defaults
  // Only pass fields you want to change - unspecified fields are preserved
  // CRITICAL: Empty strings are transformed to null to prevent bad API requests
  updateEventParameters: z
    .object({
      eventId: requiredString(
        "The ID of the event to update.",
        "Event ID is required.",
      ),
      calendarId: calendarSchema.default(null),
      summary: z.coerce
        .string({
          description:
            "New title for the event. ONLY pass if explicitly renaming. Do NOT pass for time changes.",
        })
        .transform((val) => (val === "" ? null : val))
        .nullable()
        .default(null),
      description: z.coerce
        .string({ description: "New description. Only pass if changing." })
        .transform((val) => (val === "" ? null : val))
        .nullable()
        .default(null),
      location: z.coerce
        .string({ description: "New location. Only pass if changing." })
        .transform((val) => (val === "" ? null : val))
        .nullable()
        .default(null),
      start: makeEventTime()
        .transform((val) => {
          // Filter out empty values in start time object
          if (!val) return null;
          const cleaned = {
            date: val.date === "" ? null : val.date,
            dateTime: val.dateTime === "" ? null : val.dateTime,
            timeZone: val.timeZone === "" ? null : val.timeZone,
          };
          // Return null if all fields are empty/null
          if (!cleaned.date && !cleaned.dateTime) return null;
          return cleaned;
        })
        .nullable()
        .default(null),
      end: makeEventTime()
        .transform((val) => {
          // Filter out empty values in end time object
          if (!val) return null;
          const cleaned = {
            date: val.date === "" ? null : val.date,
            dateTime: val.dateTime === "" ? null : val.dateTime,
            timeZone: val.timeZone === "" ? null : val.timeZone,
          };
          // Return null if all fields are empty/null
          if (!cleaned.date && !cleaned.dateTime) return null;
          return cleaned;
        })
        .nullable()
        .default(null),
    })
    .describe(
      "Update an existing event by ID. CRITICAL: Only pass fields you want to change. Do NOT pass summary/description/location unless explicitly changing them. Empty strings are invalid.",
    ),

  // DELETE event - no email needed
  deleteEventParameter: z
    .object({
      eventId: requiredString(
        "The ID of the event to delete.",
        "Event ID is required.",
      ),
      calendarId: calendarSchema,
    })
    .describe(
      "Delete an event by ID. Use the calendarId from the event. Email is automatically provided from user context.",
    ),

  // Gap analysis parameters
  analyzeGapsParameters: z
    .object({
      lookbackDays: z.coerce
        .number()
        .int()
        .min(1)
        .max(90)
        .default(7)
        .describe("Number of days to look back for gaps. Default is 7 days."),
      calendarId: z.coerce
        .string()
        .default("primary")
        .describe("Calendar ID to analyze. Defaults to 'primary'."),
    })
    .describe(
      "Parameters for analyzing gaps in the user's calendar. Email is automatically provided from user context.",
    ),

  // Fill gap parameters
  fillGapParameters: z
    .object({
      gapStart: z.coerce
        .string()
        .describe("Start time of the gap in ISO format."),
      gapEnd: z.coerce.string().describe("End time of the gap in ISO format."),
      summary: z.coerce
        .string()
        .min(1)
        .describe("Title for the new event to fill the gap."),
      description: z.coerce
        .string()
        .nullable()
        .optional()
        .describe("Description for the new event."),
      location: z.coerce
        .string()
        .nullable()
        .optional()
        .describe("Location for the new event."),
      calendarId: z.coerce
        .string()
        .default("primary")
        .describe("Calendar ID to create the event in."),
    })
    .describe(
      "Parameters for filling a gap with a new calendar event. Email is automatically provided from user context.",
    ),
};
