import type {
  DayOfWeek,
  FillGapRequest,
  GapAnalysisOptions,
  GapBoundaryEvent,
  GapCandidate,
  GapCandidateDTO,
  GapRecoverySettings,
  InferenceType,
  InferredContext,
} from "@/types";

import { asyncHandler } from "../http/async-handlers";
import type { calendar_v3 } from "googleapis";
import { fetchCalendarEvents } from "./get-events";
import { fetchCredentialsByEmail } from "../auth/get-user-calendar-tokens";
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "./init";
import { v4 as uuidv4 } from "uuid";

// =============================================================================
// Constants
// =============================================================================

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

export const DEFAULT_GAP_RECOVERY_SETTINGS: GapRecoverySettings = {
  autoGapAnalysis: true,
  minGapThreshold: 30, // 30 minutes
  maxGapThreshold: 480, // 8 hours
  ignoredDays: [],
  lookbackDays: 7,
  minConfidenceThreshold: 0.3,
  includedCalendars: [],
  excludedCalendars: [],
};

// Travel pattern regexes
const TRAVEL_PATTERNS = {
  arrival: [
    /^drive to (.+)$/i,
    /^travel to (.+)$/i,
    /^commute to (.+)$/i,
    /^arrive at (.+)$/i,
    /^heading to (.+)$/i,
    /^go to (.+)$/i,
    /^trip to (.+)$/i,
  ],
  departure: [
    /^drive home$/i,
    /^leave (.+)$/i,
    /^depart (.+)$/i,
    /^heading home$/i,
    /^go home$/i,
    /^return home$/i,
    /^drive from (.+)$/i,
  ],
};

// =============================================================================
// Helper Functions
// =============================================================================

function formatDuration(durationMs: number): string {
  const hours = Math.floor(durationMs / MS_PER_HOUR);
  const minutes = Math.floor((durationMs % MS_PER_HOUR) / MS_PER_MINUTE);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[date.getDay()];
}

function matchTravelPattern(
  summary: string,
  type: "arrival" | "departure"
): { matched: boolean; location: string | null } {
  const patterns = TRAVEL_PATTERNS[type];

  for (const pattern of patterns) {
    const match = summary.match(pattern);
    if (match) {
      return {
        matched: true,
        location: match[1]?.trim() || null,
      };
    }
  }

  return { matched: false, location: null };
}

function calculateTravelSandwichConfidence(
  arrivalLocation: string | null,
  departureLocation: string | null
): number {
  // High confidence if we have a location from arrival
  if (arrivalLocation) {
    // Extra high if departure matches or is "home"
    if (
      departureLocation === null ||
      departureLocation.toLowerCase() === "home"
    ) {
      return 0.9;
    }
    return 0.85;
  }
  return 0.7;
}

function detectTravelSandwich(
  precedingEvent: calendar_v3.Schema$Event,
  followingEvent: calendar_v3.Schema$Event
): InferredContext | null {
  const precedingSummary = precedingEvent.summary || "";
  const followingSummary = followingEvent.summary || "";

  const arrival = matchTravelPattern(precedingSummary, "arrival");
  const departure = matchTravelPattern(followingSummary, "departure");

  if (arrival.matched && departure.matched) {
    const confidence = calculateTravelSandwichConfidence(
      arrival.location,
      departure.location
    );
    const location = arrival.location || precedingEvent.location || null;

    return {
      type: "travel_sandwich",
      location,
      confidence,
      suggestion: location
        ? `Activity at ${location}`
        : "Activity at destination",
    };
  }

  // Check if arrival matches but departure doesn't (still useful context)
  if (arrival.matched) {
    const location = arrival.location || precedingEvent.location || null;
    return {
      type: "travel_sandwich",
      location,
      confidence: 0.6,
      suggestion: location
        ? `Time spent at ${location}`
        : "Time at destination",
    };
  }

  return null;
}

function detectWorkSession(
  gapStart: Date,
  gapEnd: Date,
  precedingEvent: calendar_v3.Schema$Event,
  followingEvent: calendar_v3.Schema$Event
): InferredContext | null {
  const startHour = gapStart.getHours();
  const endHour = gapEnd.getHours();

  // Work hours: 8 AM to 6 PM
  const isWorkHours = startHour >= 8 && endHour <= 18;

  // Check if surrounding events are work-related
  const workKeywords = [
    "meeting",
    "standup",
    "sync",
    "call",
    "review",
    "sprint",
    "planning",
    "retro",
  ];
  const precedingSummary = (precedingEvent.summary || "").toLowerCase();
  const followingSummary = (followingEvent.summary || "").toLowerCase();

  const precedingIsWork = workKeywords.some((kw) =>
    precedingSummary.includes(kw)
  );
  const followingIsWork = workKeywords.some((kw) =>
    followingSummary.includes(kw)
  );

  if (isWorkHours && (precedingIsWork || followingIsWork)) {
    return {
      type: "work_session",
      location: null,
      confidence: precedingIsWork && followingIsWork ? 0.75 : 0.55,
      suggestion: "Work session",
    };
  }

  return null;
}

function detectMealBreak(
  gapStart: Date,
  gapDurationMs: number
): InferredContext | null {
  const startHour = gapStart.getHours();
  const durationMinutes = gapDurationMs / MS_PER_MINUTE;

  // Breakfast: 7-9 AM, 30-90 min
  // Lunch: 11 AM - 2 PM, 30-120 min
  // Dinner: 5-8 PM, 45-150 min

  const isMealTime =
    (startHour >= 7 &&
      startHour <= 9 &&
      durationMinutes >= 30 &&
      durationMinutes <= 90) ||
    (startHour >= 11 &&
      startHour <= 14 &&
      durationMinutes >= 30 &&
      durationMinutes <= 120) ||
    (startHour >= 17 &&
      startHour <= 20 &&
      durationMinutes >= 45 &&
      durationMinutes <= 150);

  if (isMealTime) {
    let mealType = "Meal";
    if (startHour >= 7 && startHour <= 9) mealType = "Breakfast";
    else if (startHour >= 11 && startHour <= 14) mealType = "Lunch";
    else if (startHour >= 17 && startHour <= 20) mealType = "Dinner";

    return {
      type: "meal_break",
      location: null,
      confidence: 0.5,
      suggestion: `${mealType} break`,
    };
  }

  return null;
}

function createStandardGapContext(
  precedingEvent: calendar_v3.Schema$Event,
  followingEvent: calendar_v3.Schema$Event,
  durationMs: number
): InferredContext {
  const formattedDuration = formatDuration(durationMs);
  const precedingSummary = precedingEvent.summary || "previous event";
  const followingSummary = followingEvent.summary || "next event";

  return {
    type: "standard_gap",
    location: null,
    confidence: 0.5,
    suggestion: `${formattedDuration} untracked between "${precedingSummary}" and "${followingSummary}"`,
  };
}

function inferGapContext(
  gapStart: Date,
  gapEnd: Date,
  precedingEvent: calendar_v3.Schema$Event,
  followingEvent: calendar_v3.Schema$Event,
  durationMs: number
): InferredContext | null {
  // Try travel sandwich first (highest confidence potential)
  const travelContext = detectTravelSandwich(precedingEvent, followingEvent);
  if (travelContext && travelContext.confidence >= 0.6) {
    return travelContext;
  }

  // Try work session detection
  const workContext = detectWorkSession(
    gapStart,
    gapEnd,
    precedingEvent,
    followingEvent
  );
  if (workContext && workContext.confidence >= 0.55) {
    return workContext;
  }

  // Try meal break detection
  const mealContext = detectMealBreak(gapStart, durationMs);
  if (mealContext) {
    return mealContext;
  }

  // Return travel context if we got one (even lower confidence)
  if (travelContext) {
    return travelContext;
  }

  // Fall back to standard gap
  return createStandardGapContext(precedingEvent, followingEvent, durationMs);
}

function createGapBoundaryEvent(
  event: calendar_v3.Schema$Event,
  timestamp: Date,
  calendarId: string
): GapBoundaryEvent {
  return {
    eventId: event.id || "",
    summary: event.summary || "Untitled Event",
    timestamp,
    location: event.location || null,
    calendarId,
    htmlLink: event.htmlLink || null,
  };
}

function getEventEndTime(event: calendar_v3.Schema$Event): Date | null {
  const endStr = event.end?.dateTime || event.end?.date;
  if (!endStr) return null;
  return new Date(endStr);
}

function getEventStartTime(event: calendar_v3.Schema$Event): Date | null {
  const startStr = event.start?.dateTime || event.start?.date;
  if (!startStr) return null;
  return new Date(startStr);
}

function gapCandidateToDTO(gap: GapCandidate): GapCandidateDTO {
  return {
    id: gap.id,
    start: gap.start.toISOString(),
    end: gap.end.toISOString(),
    durationMinutes: Math.round(gap.durationMs / MS_PER_MINUTE),
    durationFormatted: gap.durationFormatted,
    precedingEventSummary: gap.precedingEvent.summary,
    precedingEventLink: gap.precedingEvent.htmlLink,
    followingEventSummary: gap.followingEvent.summary,
    followingEventLink: gap.followingEvent.htmlLink,
    suggestion: gap.inferredContext?.suggestion || null,
    confidence: gap.inferredContext?.confidence || 0,
  };
}

// =============================================================================
// Core Gap Analysis Functions
// =============================================================================

type AnalyzeGapsParams = {
  email: string;
  startDate: Date;
  endDate: Date;
  calendarId?: string;
  settings?: Partial<GapRecoverySettings>;
  options?: GapAnalysisOptions;
};

export const analyzeGaps = asyncHandler(
  async ({
    email,
    startDate,
    endDate,
    calendarId = "primary",
    settings: settingsOverride,
    options,
  }: AnalyzeGapsParams): Promise<GapCandidate[]> => {
    const settings: GapRecoverySettings = {
      ...DEFAULT_GAP_RECOVERY_SETTINGS,
      ...settingsOverride,
      ...options?.settingsOverride,
    };

    const minGapMs = settings.minGapThreshold * MS_PER_MINUTE;
    const maxGapMs = settings.maxGapThreshold * MS_PER_MINUTE;

    // Initialize calendar client
    const credentials = await fetchCredentialsByEmail(email);
    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials);

    const listParams: calendar_v3.Params$Resource$Events$List = {
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 500,
    };

    const eventsData = await fetchCalendarEvents(calendar.events, listParams);
    const events = eventsData.items || [];

    // Filter out all-day events and sort by start time
    const timedEvents = events
      .filter((event) => event.start?.dateTime && event.end?.dateTime)
      .sort((a, b) => {
        const aStart = getEventStartTime(a)?.getTime() || 0;
        const bStart = getEventStartTime(b)?.getTime() || 0;
        return aStart - bStart;
      });

    if (timedEvents.length < 2) {
      return [];
    }

    const gaps: GapCandidate[] = [];

    // Find gaps between consecutive events
    for (let i = 0; i < timedEvents.length - 1; i++) {
      const currentEvent = timedEvents[i];
      const nextEvent = timedEvents[i + 1];

      const currentEnd = getEventEndTime(currentEvent);
      const nextStart = getEventStartTime(nextEvent);

      if (!currentEnd || !nextStart) continue;

      const gapDurationMs = nextStart.getTime() - currentEnd.getTime();

      // Skip if gap doesn't meet duration constraints
      if (gapDurationMs < minGapMs || gapDurationMs >= maxGapMs) {
        continue;
      }

      // Skip if gap is on an ignored day
      const gapDay = getDayOfWeek(currentEnd);
      if (settings.ignoredDays.includes(gapDay)) {
        continue;
      }

      // Infer context for the gap
      const inferredContext = inferGapContext(
        currentEnd,
        nextStart,
        currentEvent,
        nextEvent,
        gapDurationMs
      );

      // Skip if confidence is below threshold
      if (
        inferredContext &&
        inferredContext.confidence < settings.minConfidenceThreshold
      ) {
        continue;
      }

      const gap: GapCandidate = {
        id: uuidv4(),
        userId: "", // Will be set by the caller
        start: currentEnd,
        end: nextStart,
        durationMs: gapDurationMs,
        durationFormatted: formatDuration(gapDurationMs),
        precedingEvent: createGapBoundaryEvent(
          currentEvent,
          currentEnd,
          calendarId
        ),
        followingEvent: createGapBoundaryEvent(
          nextEvent,
          nextStart,
          calendarId
        ),
        inferredContext,
        resolution: { status: "pending" },
        detectedAt: new Date(),
        resolvedAt: null,
      };

      gaps.push(gap);
    }

    return gaps;
  }
);

type AnalyzeGapsForUserParams = {
  email: string;
  lookbackDays?: number;
  calendarId?: string;
  settings?: Partial<GapRecoverySettings>;
};

export const analyzeGapsForUser = asyncHandler(
  async ({
    email,
    lookbackDays = 7,
    calendarId = "primary",
    settings,
  }: AnalyzeGapsForUserParams): Promise<GapCandidateDTO[]> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    const gaps = await analyzeGaps({
      email,
      startDate,
      endDate,
      calendarId,
      settings,
    });

    return gaps.map(gapCandidateToDTO);
  }
);

type FillGapParams = {
  email: string;
  gapId: string;
  gapStart: Date;
  gapEnd: Date;
  calendarId: string;
  eventDetails: FillGapRequest;
};

export const fillGap = asyncHandler(
  async ({
    email,
    gapStart,
    gapEnd,
    calendarId,
    eventDetails,
  }: FillGapParams): Promise<{ success: boolean; eventId?: string }> => {
    const credentials = await fetchCredentialsByEmail(email);
    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials);

    const event: calendar_v3.Schema$Event = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      location: eventDetails.location,
      start: {
        dateTime: gapStart.toISOString(),
      },
      end: {
        dateTime: gapEnd.toISOString(),
      },
    };

    const response = await calendar.events.insert({
      calendarId: eventDetails.calendarId || calendarId,
      requestBody: event,
    });

    return {
      success: true,
      eventId: response.data.id || undefined,
    };
  }
);

export const formatGapsForDisplay = (gaps: GapCandidateDTO[]): string => {
  if (gaps.length === 0) {
    return "No gaps found in your calendar for the specified period.";
  }

  const lines = ["I noticed some gaps in your calendar:\n"];

  gaps.forEach((gap, index) => {
    const date = new Date(gap.start);
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const startTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const endTime = new Date(gap.end).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    lines.push(
      `${index + 1}. **${dateStr}** | ${startTime} - ${endTime} (${gap.durationFormatted})`
    );
    lines.push(
      `   Between: "${gap.precedingEventSummary}" -> "${gap.followingEventSummary}"`
    );

    if (gap.suggestion && gap.confidence >= 0.5) {
      lines.push(`   Suggested: ${gap.suggestion}`);
    }

    lines.push("");
  });

  lines.push("What would you like to do?");
  lines.push(
    '- Reply with a number + description to fill (e.g., "1 Working on project")'
  );
  lines.push('- Reply "skip [number]" to ignore a specific gap');
  lines.push('- Reply "skip all" to dismiss all gaps');

  return lines.join("\n");
};

// Export types for use elsewhere
export type { AnalyzeGapsParams, AnalyzeGapsForUserParams, FillGapParams };
