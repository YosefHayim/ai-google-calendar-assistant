import { TIMEZONE } from "@/types";
import validator from "validator";
import { z } from "zod";

const MIN_PW = 6;
const MAX_PW = 72;

const requiredString = (description: string, message = "Required.") => z.coerce.string({ description }).trim().min(1, { message });

const calendarSchema = z.coerce.string({ description: "The ID of the calendar to which the event belongs to, if provided use, else pass primary." }).nullable();

const emailSchema = z.coerce
  .string({
    description:
      "REQUIRED: The authenticated user's email address from the conversation context. This is automatically provided in the conversation context - use the email value from the 'User Email' section in the context. DO NOT use placeholder emails like 'me@example.com' or ask the user for their email. The email is used for authentication and authorization via database and Google Calendar.",
  })
  .includes("@", { message: "Must include @ symbol" })
  .refine((v) => validator.isEmail(v), { message: "Invalid email address." });

const makeEventTime = () =>
  z
    .object({
      date: z.coerce
        .string({
          description: 'The date, in the format "yyyy-mm-dd", if this is an all-day event, no need to pass if we have dateTime field.',
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
          description: 'The time zone in which the time is specified. (Formatted as an IANA Time Zone Database name, e.g. "Asia/Jerusalem".) ',
        })
        .nullable(),
    })
    .describe("Event start or end time, with optional timezone.");

const makeFullEventParams = () =>
  z
    .object({
      calendarId: calendarSchema,
      summary: requiredString("Title of the event.", "Summary is required."),
      description: z.coerce.string({ description: "Description of the event." }).nullable(),
      location: z.coerce.string({ description: "Geographic location of the event." }).nullable(),
      start: makeEventTime(),
      end: makeEventTime(),
      email: emailSchema,
    })
    .describe("Full event parameters including summary, description, location, start, and end times.");

export const PARAMETERS_TOOLS = {
  generateUserCbGoogleUrlParameters: z.object({}),
  registerUserParameters: z.object({
    email: emailSchema.describe("The email address of the user."),
    password: z
      .string()
      .min(MIN_PW, "Password must be at least 6 characters long.")
      .max(MAX_PW, "Password cannot exceed 72 characters.")
      .describe("The password for the user account. Must be between 6 and 72 characters long."),
  }),
  validateUserDbParametersToRegisterUser: z.object({ email: emailSchema }).describe("Register user to our db."),
  validateUserDbParameter: z
    .object({
      email: emailSchema.describe(
        "REQUIRED: The authenticated user's email from conversation context. Use the email value from the 'User Email' section in the context. DO NOT use placeholder emails like 'me@example.com'."
      ),
    })
    .describe("Validate user authentication by email. The email must come from conversation context."),
  getUserDefaultTimeZone: z
    .object({
      email: emailSchema.describe(
        "REQUIRED: The authenticated user's email from conversation context. Use the email value from the 'User Email' section in the context. DO NOT use placeholder emails like 'me@example.com'."
      ),
    })
    .describe("Fetch the authenticated user's default timezone from Google Calendar settings. The email must come from conversation context."),
  getEventParameters: z
    .object({
      email: emailSchema.describe(
        "REQUIRED: The authenticated user's email from conversation context. Use the email value from the 'User Email' section in the context. DO NOT use placeholder emails like 'me@example.com'."
      ),
      timeMin: z.coerce
        .string({
          description:
            "The minimum date and time for events to return, formatted as RFC3339 timestamp (e.g., '2025-11-25T00:00:00+02:00'). If not provided, defaults to start of current year.",
        })
        .nullable(),
      q: z.coerce
        .string({
          description: "Optional keyword search query to match against event titles, descriptions, and locations. Case-insensitive, supports partial matches.",
        })
        .nullable(),
      customEvents: z.coerce
        .boolean({ description: "Optional parameter to return custom event objects instead of standard Google Calendar format. Defaults to false." })
        .nullable(),
    })
    .describe("Search and retrieve calendar events for the authenticated user. The email must come from conversation context."),

  getCalendarTypesByEventParameters: z
    .object({ email: emailSchema, eventInformation: makeFullEventParams() })
    .describe("Fetch all calendars Ids for the user to find out the best matching calendar type for the event."),

  listCalendarsParameters: z
    .object({
      email: emailSchema.describe(
        "REQUIRED: The authenticated user's email from conversation context. Use the email value from the 'User Email' section in the context. DO NOT use placeholder emails like 'me@example.com'."
      ),
    })
    .describe("List all calendars for the authenticated user. Returns array of { calendarId, calendarName } objects with the total count."),
  insertEventParameters: makeFullEventParams().describe("Insert a new event into the user calendar."),
  updateEventParameters: makeFullEventParams()
    .extend({
      eventId: requiredString("The ID of the event to update.", "Event ID is required."),
      email: emailSchema,
    })
    .describe("Update an existing event by ID."),
  deleteEventParameter: z
    .object({
      eventId: requiredString("The ID of the event to delete.", "Event ID is required."),
      email: emailSchema,
    })
    .describe("Delete an event by ID."),
  normalizedEventParams: makeFullEventParams().extend({ email: emailSchema }).describe("Normalize an event payload for insertion/update."),
  getAgentName: z
    .object({
      email: emailSchema.describe(
        "REQUIRED: The authenticated user's email from conversation context. Use the email value from the 'User Email' section in the context. DO NOT use placeholder emails like 'me@example.com'."
      ),
      chatId: z.coerce.number({
        description:
          "REQUIRED: The Telegram chat ID from conversation context. Use the chatId value from the 'Chat ID' section in the context. DO NOT ask the user for this.",
      }),
    })
    .describe("Get the authenticated user's personalized agent name from conversation metadata. Both email and chatId must come from conversation context."),
  setAgentName: z
    .object({
      email: emailSchema.describe(
        "REQUIRED: The authenticated user's email from conversation context. Use the email value from the 'User Email' section in the context. DO NOT use placeholder emails like 'me@example.com'."
      ),
      chatId: z.coerce.number({
        description:
          "REQUIRED: The Telegram chat ID from conversation context. Use the chatId value from the 'Chat ID' section in the context. DO NOT ask the user for this.",
      }),
      agentName: requiredString("The name the user wants to call their personal assistant", "Agent name is required."),
    })
    .describe(
      "Set or update the authenticated user's personalized agent name in conversation metadata. Both email and chatId must come from conversation context."
    ),

  get_user_routines: z
    .object({
      email: emailSchema,
      routineType: z.enum(["daily", "weekly", "monthly", "event_pattern", "time_slot"]).nullish().describe("Filter by routine type"),
    })
    .describe("Get learned routines for a user."),

  get_upcoming_predictions: z
    .object({
      email: emailSchema,
      daysAhead: z.coerce.number().int().min(1).max(30).default(7).nullish().describe("Number of days to predict ahead"),
    })
    .describe("Predict upcoming events based on learned patterns."),

  suggest_optimal_time: z
    .object({
      email: emailSchema,
      eventDuration: z.coerce.number().int().min(15).max(480).describe("Event duration in minutes"),
      preferredTime: z.coerce.string().nullish().describe("Preferred time in ISO format (optional)"),
    })
    .describe("Suggest optimal time slots for scheduling a new event."),

  get_routine_insights: z
    .object({
      email: emailSchema,
    })
    .describe("Get insights about user's routines and schedule patterns."),

  set_user_goal: z
    .object({
      email: emailSchema,
      goalType: requiredString("The type of goal (e.g., 'gym', 'meetings', 'workouts')"),
      target: z.coerce.number().int().min(1).describe("Target number to achieve"),
      current: z.coerce.number().int().min(0).nullish().describe("Current progress (defaults to 0)"),
      deadline: z.coerce.string().nullish().describe("Deadline in ISO format (optional)"),
      description: z.coerce.string().nullish().describe("Goal description (optional)"),
    })
    .describe("Set or update a user goal for tracking progress."),

  get_goal_progress: z
    .object({
      email: emailSchema,
      goalType: z.coerce.string().nullish().describe("Filter by specific goal type (optional)"),
    })
    .describe("Get progress toward user goals."),

  get_schedule_statistics: z
    .object({
      email: emailSchema,
      startDate: z.coerce.string().nullish().describe("Start date in ISO format (defaults to 30 days ago)"),
      endDate: z.coerce.string().nullish().describe("End date in ISO format (defaults to today)"),
      periodType: z
        .enum(["daily", "weekly", "monthly", "hourly", "work_time", "insights"])
        .nullish()
        .describe("Type of statistics to retrieve (defaults to basic statistics)"),
      statisticsType: z.enum(["basic", "hourly", "work_time", "insights"]).nullish().describe("Specific statistics type (defaults to basic)"),
    })
    .describe("Get schedule statistics and insights for a user."),
};
