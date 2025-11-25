import { OAUTH2CLIENT, SCOPES, SUPABASE, redirectUri } from "@/config/root-config";
import { coerceArgs, formatEventData, getCalendarCategoriesByEmail } from "./agentUtils";

import { ACTION } from "@/types";
import { ConversationMemoryService } from "@/services/ConversationMemoryService";
import { RoutineLearningService } from "@/services/RoutineLearningService";
import { ScheduleStatisticsService } from "@/services/ScheduleStatisticsService";
import { extractDateRangeFromQuery, parseNaturalLanguageDate } from "@/utils/parseNaturalLanguageDate";
import { TOKEN_FIELDS } from "@/utils/storage";
import { asyncHandler } from "@/utils/asyncHandlers";
import type { calendar_v3 } from "googleapis";
import { eventsHandler } from "@/utils/handleEvents";
import { fetchCredentialsByEmail } from "@/utils/getUserCalendarTokens";
import { initCalendarWithUserTokensAndUpdateTokens } from "@/utils/initCalendarWithUserTokens";
import isEmail from "validator/lib/isEmail";

type Event = calendar_v3.Schema$Event;

const MAX_PW = 72;
const MIN_PW = 6;

export const EXECUTION_TOOLS = {
  generateUserCbGoogleUrl: () => {
    const url = OAUTH2CLIENT.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
      include_granted_scopes: true,
      redirect_uri: redirectUri,
    });

    return url;
  },
  registerUser: asyncHandler(async (params: { email: string; password: string }) => {
    if (!(params.email && params.password)) {
      throw new Error("Email and password are required in order to register.");
    }
    if (!isEmail(params.email)) {
      throw new Error("Invalid email address.");
    }

    if (params.password.length < MIN_PW || params.password.length > MAX_PW) {
      throw new Error("Password must be between 6 and maximum of 72 characters long.");
    }

    const { data, error } = await SUPABASE.auth.signUp({
      email: params.email,
      password: params.password,
    });

    if (data) {
      return data;
    }
    throw error;
  }),
  validateUser: asyncHandler(async ({ email }: { email: string }) => {
    const { data, error } = await SUPABASE.from("user_calendar_tokens").select(TOKEN_FIELDS).eq("email", email.trim().toLowerCase());
    if (error || !data || data.length === 0) {
      throw new Error("User not found or no tokens available.");
    }
    return data[0];
  }),

  validateEventFields: asyncHandler((params: calendar_v3.Schema$Event & { email: string }) => {
    const { email, eventLike } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    const formatted = formatEventData(eventLike as Event);
    return { ...formatted, email };
  }),

  insertEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string; customEvents?: boolean }) => {
    const { email, calendarId, eventLike } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    const eventData: Event = formatEventData(eventLike as Event);
    const finalCalendarId = calendarId ?? "primary";
    
    // Warn if defaulting to 'primary' - this indicates calendar selection may have been skipped
    if (!calendarId) {
      console.warn(
        `[insertEvent] Defaulting to 'primary' calendar for event "${eventData.summary || 'Untitled'}" (${email}). ` +
        `Calendar selection should be performed before insert_event to intelligently match event to appropriate calendar.`
      );
    }
    
    return eventsHandler(null, ACTION.INSERT, eventData, { email, calendarId: finalCalendarId, customEvents: params.customEvents ?? false });
  }),

  updateEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string; eventId: string }) => {
    const { email, calendarId, eventId, eventLike } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    if (!eventId) {
      throw new Error("eventId is required for update.");
    }
    const eventData: Event = { ...formatEventData(eventLike as Event), id: eventId };
    const insureEventDataWithEventId = { ...eventData, id: eventId };
    return eventsHandler(null, ACTION.UPDATE, insureEventDataWithEventId, { email, calendarId: calendarId ?? "primary", eventId });
  }),

  getEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string; q?: string | null; timeMin?: string | null }) => {
    const startOfYear = new Date().toISOString().split("T")[0];

    const { email, calendarId } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    return eventsHandler(null, ACTION.GET, {}, { email, calendarId: calendarId ?? "primary", timeMin: params.timeMin ?? startOfYear, q: params.q || "" });
  }),

  getCalendarTypesByEventDetails: asyncHandler(async (params: { eventInformation: calendar_v3.Schema$Event; email: string }) => {
    if (!(params.email && isEmail(params.email))) {
      throw new Error("Invalid email address.");
    }
    const calendarsTypes = (await getCalendarCategoriesByEmail(params.email)).map((c) => {
      return {
        calendarId: c.calendar_id,
        calendarName: c.calendar_name,
      };
    });
    return calendarsTypes;
  }),

  deleteEvent: asyncHandler((params: { eventId: string; email: string }) => {
    const { email, eventId } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    if (!eventId) {
      throw new Error("Event ID is required to delete event.");
    }
    return eventsHandler(null, ACTION.DELETE, { id: eventId }, { email });
  }),
  getUserDefaultTimeZone: asyncHandler(async (params: { email: string }) => {
    const { email } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    const tokenProps = await fetchCredentialsByEmail(email);
    const CALENDAR = await initCalendarWithUserTokensAndUpdateTokens(tokenProps);
    const r = await CALENDAR.settings.get({ setting: "timezone" });
    return r;
  }),
  getAgentName: asyncHandler(async (params: { email: string; chatId: number }) => {
    if (!(params.email && isEmail(params.email))) {
      throw new Error("Invalid email address.");
    }
    if (!params.chatId || typeof params.chatId !== "number") {
      throw new Error("Valid chat ID is required.");
    }
    // Get user_id from email
    const { data: tokenData } = await SUPABASE.from("user_calendar_tokens").select("user_id").eq("email", params.email).maybeSingle();
    if (!tokenData?.user_id) {
      throw new Error("User not found.");
    }
    // Import ConversationMemoryService dynamically to avoid circular dependency
    const conversationMemoryService = new ConversationMemoryService(SUPABASE);
    const agentName = await conversationMemoryService.getAgentName(tokenData.user_id, params.chatId);
    return { agent_name: agentName || null };
  }),
  setAgentName: asyncHandler(async (params: { email: string; chatId: number; agentName: string }) => {
    if (!(params.email && isEmail(params.email))) {
      throw new Error("Invalid email address.");
    }
    if (!params.chatId || typeof params.chatId !== "number") {
      throw new Error("Valid chat ID is required.");
    }
    if (!params.agentName || params.agentName.trim().length === 0) {
      throw new Error("Agent name is required.");
    }
    // Get user_id from email
    const { data: tokenData } = await SUPABASE.from("user_calendar_tokens").select("user_id").eq("email", params.email).maybeSingle();
    if (!tokenData?.user_id) {
      throw new Error("User not found.");
    }
    // Import ConversationMemoryService dynamically to avoid circular dependency
    const conversationMemoryService = new ConversationMemoryService(SUPABASE);
    await conversationMemoryService.setAgentName(tokenData.user_id, params.chatId, params.agentName);
    return { success: true, agent_name: params.agentName.trim() };
  }),

  get_user_routines: asyncHandler(async (params: { email: string; routineType?: string | null }) => {
    if (!(params.email && isEmail(params.email))) {
      throw new Error("Invalid email address.");
    }
    const { data: tokenData } = await SUPABASE.from("user_calendar_tokens").select("user_id").eq("email", params.email).maybeSingle();
    if (!tokenData?.user_id) {
      throw new Error("User not found.");
    }
    const routineService = new RoutineLearningService(SUPABASE);
    const routineType = params.routineType ?? undefined;
    const routines = await routineService.getUserRoutine(
      tokenData.user_id,
      routineType as "daily" | "weekly" | "monthly" | "event_pattern" | "time_slot" | undefined
    );
    return { routines, count: routines.length };
  }),

  get_upcoming_predictions: asyncHandler(async (params: { email: string; daysAhead?: number | null }) => {
    if (!(params.email && isEmail(params.email))) {
      throw new Error("Invalid email address.");
    }
    const { data: tokenData } = await SUPABASE.from("user_calendar_tokens").select("user_id").eq("email", params.email).maybeSingle();
    if (!tokenData?.user_id) {
      throw new Error("User not found.");
    }
    const routineService = new RoutineLearningService(SUPABASE);
    const daysAhead = params.daysAhead ?? 7;
    const predictions = await routineService.predictUpcomingEvents(tokenData.user_id, daysAhead);
    return { predictions, count: predictions.length };
  }),

  suggest_optimal_time: asyncHandler(async (params: { email: string; eventDuration: number; preferredTime?: string | null }) => {
    if (!(params.email && isEmail(params.email))) {
      throw new Error("Invalid email address.");
    }
    if (!params.eventDuration || params.eventDuration < 15 || params.eventDuration > 480) {
      throw new Error("Event duration must be between 15 and 480 minutes.");
    }
    const { data: tokenData } = await SUPABASE.from("user_calendar_tokens").select("user_id").eq("email", params.email).maybeSingle();
    if (!tokenData?.user_id) {
      throw new Error("User not found.");
    }
    const routineService = new RoutineLearningService(SUPABASE);
    const preferredTime = params.preferredTime ?? undefined;
    const suggestion = await routineService.suggestOptimalTime(tokenData.user_id, params.eventDuration, preferredTime);
    if (!suggestion) {
      return { message: "No optimal time suggestions available at this time." };
    }
    return suggestion;
  }),

  get_routine_insights: asyncHandler(async (params: { email: string }) => {
    if (!(params.email && isEmail(params.email))) {
      throw new Error("Invalid email address.");
    }
    const { data: tokenData } = await SUPABASE.from("user_calendar_tokens").select("user_id").eq("email", params.email).maybeSingle();
    if (!tokenData?.user_id) {
      throw new Error("User not found.");
    }
    const routineService = new RoutineLearningService(SUPABASE);
    const routines = await routineService.getHighConfidenceRoutines(tokenData.user_id, 0.6);
    const insights = {
      total_routines: routines.length,
      routine_types: routines.reduce((acc, r) => {
        acc[r.routine_type] = (acc[r.routine_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      average_confidence: routines.length > 0 ? routines.reduce((sum, r) => sum + r.confidence_score, 0) / routines.length : 0,
      routines: routines.map((r) => ({
        type: r.routine_type,
        confidence: r.confidence_score,
        frequency: r.frequency,
        last_observed: r.last_observed_at,
      })),
    };
    return insights;
  }),

  set_user_goal: asyncHandler(async (params: { email: string; goalType: string; target: number; current?: number | null; deadline?: string | null; description?: string | null }) => {
    if (!(params.email && isEmail(params.email))) {
      throw new Error("Invalid email address.");
    }
    if (!params.goalType || params.goalType.trim().length === 0) {
      throw new Error("Goal type is required.");
    }
    if (!params.target || params.target < 1) {
      throw new Error("Target must be at least 1.");
    }
    const { data: tokenData } = await SUPABASE.from("user_calendar_tokens").select("user_id").eq("email", params.email).maybeSingle();
    if (!tokenData?.user_id) {
      throw new Error("User not found.");
    }
    const routineService = new RoutineLearningService(SUPABASE);
    const goal = await routineService.setUserGoal(tokenData.user_id, {
      type: params.goalType.trim(),
      target: params.target,
      current: params.current ?? undefined,
      deadline: params.deadline ?? undefined,
      description: params.description ?? undefined,
    });
    if (!goal) {
      throw new Error("Failed to set goal.");
    }
    return { success: true, goal: { type: params.goalType, target: params.target, current: params.current || 0 } };
  }),

  get_goal_progress: asyncHandler(async (params: { email: string; goalType?: string | null }) => {
    if (!(params.email && isEmail(params.email))) {
      throw new Error("Invalid email address.");
    }
    const { data: tokenData } = await SUPABASE.from("user_calendar_tokens").select("user_id").eq("email", params.email).maybeSingle();
    if (!tokenData?.user_id) {
      throw new Error("User not found.");
    }
    const routineService = new RoutineLearningService(SUPABASE);
    const goalType = params.goalType ?? undefined;
    const goals = await routineService.getGoalProgress(tokenData.user_id, goalType);
    return { goals, count: goals.length };
  }),

  get_schedule_statistics: asyncHandler(
    async (params: {
      email: string;
      startDate?: string | null;
      endDate?: string | null;
      periodType?: "daily" | "weekly" | "monthly" | "hourly" | "work_time" | "insights" | null;
      statisticsType?: "basic" | "hourly" | "work_time" | "insights" | null;
    }) => {
      if (!(params.email && isEmail(params.email))) {
        throw new Error("Invalid email address.");
      }
      const { data: tokenData } = await SUPABASE.from("user_calendar_tokens")
        .select("user_id")
        .eq("email", params.email)
        .maybeSingle();
      if (!tokenData?.user_id) {
        throw new Error("User not found.");
      }

      const statisticsService = new ScheduleStatisticsService(SUPABASE);

      // Parse natural language dates or use provided dates
      let startDate: Date;
      let endDate: Date;

      if (params.startDate) {
        const parsed = parseNaturalLanguageDate(params.startDate);
        startDate = parsed ? parsed.start : new Date(params.startDate);
      } else {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days ago
      }

      if (params.endDate) {
        const parsed = parseNaturalLanguageDate(params.endDate);
        endDate = parsed ? parsed.end : new Date(params.endDate);
      } else {
        endDate = new Date(); // Default: today
      }

      const periodType = params.periodType || params.statisticsType || "basic";

      let result: unknown;
      switch (periodType) {
        case "daily": {
          result = await statisticsService.getDailyStatistics(tokenData.user_id, params.email, startDate);
          break;
        }
        case "weekly": {
          result = await statisticsService.getWeeklyStatistics(tokenData.user_id, params.email, startDate);
          break;
        }
        case "monthly": {
          result = await statisticsService.getMonthlyStatistics(tokenData.user_id, params.email, startDate);
          break;
        }
        case "hourly": {
          result = await statisticsService.getHourlyStatistics(tokenData.user_id, params.email, startDate, endDate);
          break;
        }
        case "work_time": {
          result = await statisticsService.getWorkTimeAnalysis(tokenData.user_id, params.email, startDate, endDate);
          break;
        }
        case "insights": {
          result = await statisticsService.getRoutineInsights(tokenData.user_id, params.email, startDate, endDate);
          break;
        }
        default: {
          result = await statisticsService.getStatistics(tokenData.user_id, params.email, startDate, endDate);
        }
      }

      return result;
    }
  ),
};
