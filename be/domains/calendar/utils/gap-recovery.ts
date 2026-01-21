import { randomUUID } from "node:crypto"
import type { calendar_v3 } from "googleapis"
import type {
  DayOfWeek,
  FillGapRequest,
  GapAnalysisOptions,
  GapBoundaryEvent,
  GapCandidate,
  GapCandidateDTO,
  GapRecoverySettings,
  InferredContext,
} from "@/types"
import { fetchCredentialsByEmail } from "@/domains/auth/utils/get-user-calendar-tokens"
import { asyncHandler } from "@/lib/http/async-handlers"
import { fetchCalendarEvents } from "./get-events"
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "./init"
import {
  getCombinedPatternsForLanguages,
  isWorkRelatedEvent,
  matchTravelPatternMultilingual,
  type TravelPatternSet,
} from "./travel-patterns-i18n"

// =============================================================================
// Constants
// =============================================================================

const MS_PER_MINUTE = 60 * 1000
const MS_PER_HOUR = 60 * MS_PER_MINUTE

export const DEFAULT_GAP_RECOVERY_SETTINGS: GapRecoverySettings = {
  autoGapAnalysis: true,
  minGapThreshold: 30, // 30 minutes
  maxGapThreshold: 480, // 8 hours
  ignoredDays: [],
  lookbackDays: 7,
  minConfidenceThreshold: 0.3,
  includedCalendars: [],
  excludedCalendars: [],
  eventLanguages: ["en"],
  languageSetupComplete: false,
}

const DEFAULT_PATTERNS = getCombinedPatternsForLanguages(["en"])

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * @description Formats a duration in milliseconds into a human-readable string.
 * Returns the most concise representation (hours, minutes, or both).
 * @param {number} durationMs - The duration in milliseconds to format.
 * @returns {string} A formatted duration string (e.g., "30m", "2h", "1h 45m").
 * @example
 * formatDuration(1800000); // Returns "30m"
 * formatDuration(7200000); // Returns "2h"
 * formatDuration(5400000); // Returns "1h 30m"
 */
/**
 * Format a duration in milliseconds to a human-readable string.
 *
 * Converts millisecond duration to a concise "Xh Ym" format,
 * omitting units that are zero (e.g., "2h" for 2 hours exactly,
 * "30m" for 30 minutes, "1h 30m" for 1.5 hours).
 *
 * @param durationMs - Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 30m", "45m")
 */
function formatDuration(durationMs: number): string {
  const hours = Math.floor(durationMs / MS_PER_HOUR)
  const minutes = Math.floor((durationMs % MS_PER_HOUR) / MS_PER_MINUTE)

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  return `${minutes}m`
}

/**
 * @description Converts a Date object to a lowercase day of the week string.
 * Used for checking if gaps fall on user-configured ignored days.
 * @param {Date} date - The date to get the day of week from.
 * @returns {DayOfWeek} The lowercase day name (e.g., "monday", "tuesday").
 * @example
 * getDayOfWeek(new Date("2025-01-15")); // Returns "wednesday"
 */
function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ]
  return days[date.getDay()]
}

/**
 * @description Matches an event summary against travel-related patterns to detect arrival or departure events.
 * Delegates to the multilingual pattern matching function with a default pattern set.
 * @param {string} summary - The event summary/title to match against patterns.
 * @param {"arrival" | "departure"} type - The type of travel pattern to match.
 * @param {TravelPatternSet} [patterns=DEFAULT_PATTERNS] - Optional pattern set to use for matching.
 * @returns {{ matched: boolean; location: string | null }} Object indicating if pattern matched and extracted location.
 * @example
 * matchTravelPattern("Drive to airport", "arrival"); // Returns { matched: true, location: "airport" }
 * matchTravelPattern("Team meeting", "arrival"); // Returns { matched: false, location: null }
 */
function matchTravelPattern(
  summary: string,
  type: "arrival" | "departure",
  patterns: TravelPatternSet = DEFAULT_PATTERNS
): { matched: boolean; location: string | null } {
  return matchTravelPatternMultilingual(summary, type, patterns)
}

/**
 * @description Calculates a confidence score for a travel sandwich detection based on location matching.
 * Higher confidence is assigned when arrival location is known and departure matches "home" or is unspecified.
 * @param {string | null} arrivalLocation - The destination location extracted from the arrival event.
 * @param {string | null} departureLocation - The origin location extracted from the departure event.
 * @returns {number} A confidence score between 0.7 and 0.9.
 * @example
 * calculateTravelSandwichConfidence("office", "home"); // Returns 0.9
 * calculateTravelSandwichConfidence("office", null); // Returns 0.9
 * calculateTravelSandwichConfidence("office", "office"); // Returns 0.85
 * calculateTravelSandwichConfidence(null, null); // Returns 0.7
 */
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
      return 0.9
    }
    return 0.85
  }
  return 0.7
}

/**
 * @description Detects if a gap between two events represents a "travel sandwich" pattern.
 * A travel sandwich occurs when an arrival event is followed by a departure event, suggesting
 * the user spent time at a destination between travel events.
 * @param {calendar_v3.Schema$Event} precedingEvent - The event before the gap (potential arrival).
 * @param {calendar_v3.Schema$Event} followingEvent - The event after the gap (potential departure).
 * @param {TravelPatternSet} [patterns=DEFAULT_PATTERNS] - Optional pattern set for multilingual matching.
 * @returns {InferredContext | null} Context with suggestion and confidence, or null if not a travel sandwich.
 * @example
 * const context = detectTravelSandwich(arrivalEvent, departureEvent);
 * if (context) {
 *   console.log(context.suggestion); // "Activity at office"
 *   console.log(context.confidence); // 0.9
 * }
 */
function detectTravelSandwich(
  precedingEvent: calendar_v3.Schema$Event,
  followingEvent: calendar_v3.Schema$Event,
  patterns: TravelPatternSet = DEFAULT_PATTERNS
): InferredContext | null {
  const precedingSummary = precedingEvent.summary || ""
  const followingSummary = followingEvent.summary || ""

  const arrival = matchTravelPattern(precedingSummary, "arrival", patterns)
  const departure = matchTravelPattern(followingSummary, "departure", patterns)

  if (arrival.matched && departure.matched) {
    const confidence = calculateTravelSandwichConfidence(
      arrival.location,
      departure.location
    )
    const location = arrival.location || precedingEvent.location || null

    return {
      type: "travel_sandwich",
      location,
      confidence,
      suggestion: location
        ? `Activity at ${location}`
        : "Activity at destination",
    }
  }

  // Check if arrival matches but departure doesn't (still useful context)
  if (arrival.matched) {
    const location = arrival.location || precedingEvent.location || null
    return {
      type: "travel_sandwich",
      location,
      confidence: 0.6,
      suggestion: location
        ? `Time spent at ${location}`
        : "Time at destination",
    }
  }

  return null
}

type DetectWorkSessionParams = {
  gapStart: Date
  gapEnd: Date
  precedingEvent: calendar_v3.Schema$Event
  followingEvent: calendar_v3.Schema$Event
  patterns?: TravelPatternSet
}

/**
 * @description Detects if a gap likely represents an untracked work session.
 * Analyzes the gap timing (8 AM - 6 PM) and whether surrounding events are work-related
 * based on keyword matching in event summaries.
 * @param {DetectWorkSessionParams} params - Parameters for work session detection.
 * @param {Date} params.gapStart - The start time of the gap.
 * @param {Date} params.gapEnd - The end time of the gap.
 * @param {calendar_v3.Schema$Event} params.precedingEvent - The event before the gap.
 * @param {calendar_v3.Schema$Event} params.followingEvent - The event after the gap.
 * @param {TravelPatternSet} [params.patterns] - Optional pattern set for work keyword matching.
 * @returns {InferredContext | null} Context with "Work session" suggestion if detected, or null.
 * @example
 * const context = detectWorkSession({
 *   gapStart: new Date("2025-01-15T10:00:00"),
 *   gapEnd: new Date("2025-01-15T12:00:00"),
 *   precedingEvent: meetingEvent,
 *   followingEvent: syncEvent
 * });
 */
function detectWorkSession({
  gapStart,
  gapEnd,
  precedingEvent,
  followingEvent,
  patterns = DEFAULT_PATTERNS,
}: DetectWorkSessionParams): InferredContext | null {
  const startHour = gapStart.getHours()
  const endHour = gapEnd.getHours()

  // Work hours: 8 AM to 6 PM
  const isWorkHours = startHour >= 8 && endHour <= 18

  const precedingSummary = precedingEvent.summary || ""
  const followingSummary = followingEvent.summary || ""

  const precedingIsWork = isWorkRelatedEvent(precedingSummary, patterns)
  const followingIsWork = isWorkRelatedEvent(followingSummary, patterns)

  if (isWorkHours && (precedingIsWork || followingIsWork)) {
    return {
      type: "work_session",
      location: null,
      confidence: precedingIsWork && followingIsWork ? 0.75 : 0.55,
      suggestion: "Work session",
    }
  }

  return null
}

/**
 * @description Detects if a gap likely represents a meal break based on time of day and duration.
 * Identifies breakfast (7-9 AM, 30-90 min), lunch (11 AM-2 PM, 30-120 min), and dinner (5-8 PM, 45-150 min).
 * @param {Date} gapStart - The start time of the gap.
 * @param {number} gapDurationMs - The duration of the gap in milliseconds.
 * @returns {InferredContext | null} Context with meal type suggestion if detected, or null.
 * @example
 * detectMealBreak(new Date("2025-01-15T12:00:00"), 3600000); // Returns { type: "meal_break", suggestion: "Lunch break", ... }
 * detectMealBreak(new Date("2025-01-15T22:00:00"), 3600000); // Returns null (not meal time)
 */
function detectMealBreak(
  gapStart: Date,
  gapDurationMs: number
): InferredContext | null {
  const startHour = gapStart.getHours()
  const durationMinutes = gapDurationMs / MS_PER_MINUTE

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
      durationMinutes <= 150)

  if (isMealTime) {
    let mealType = "Meal"
    if (startHour >= 7 && startHour <= 9) {
      mealType = "Breakfast"
    } else if (startHour >= 11 && startHour <= 14) {
      mealType = "Lunch"
    } else if (startHour >= 17 && startHour <= 20) {
      mealType = "Dinner"
    }

    return {
      type: "meal_break",
      location: null,
      confidence: 0.5,
      suggestion: `${mealType} break`,
    }
  }

  return null
}

/**
 * @description Creates a generic context for gaps that don't match specific patterns.
 * Used as a fallback when travel, work, or meal patterns are not detected.
 * @param {calendar_v3.Schema$Event} precedingEvent - The event before the gap.
 * @param {calendar_v3.Schema$Event} followingEvent - The event after the gap.
 * @param {number} durationMs - The duration of the gap in milliseconds.
 * @returns {InferredContext} A standard gap context with descriptive suggestion.
 * @example
 * const context = createStandardGapContext(event1, event2, 3600000);
 * // Returns { type: "standard_gap", suggestion: "1h untracked between \"Meeting\" and \"Lunch\"", ... }
 */
function createStandardGapContext(
  precedingEvent: calendar_v3.Schema$Event,
  followingEvent: calendar_v3.Schema$Event,
  durationMs: number
): InferredContext {
  const formattedDuration = formatDuration(durationMs)
  const precedingSummary = precedingEvent.summary || "previous event"
  const followingSummary = followingEvent.summary || "next event"

  return {
    type: "standard_gap",
    location: null,
    confidence: 0.5,
    suggestion: `${formattedDuration} untracked between "${precedingSummary}" and "${followingSummary}"`,
  }
}

type InferGapContextParams = {
  gapStart: Date
  gapEnd: Date
  precedingEvent: calendar_v3.Schema$Event
  followingEvent: calendar_v3.Schema$Event
  durationMs: number
  patterns?: TravelPatternSet
}

/**
 * @description Infers the most likely context for a calendar gap using multiple detection strategies.
 * Tries travel sandwich, work session, and meal break detection in order of priority,
 * falling back to a standard gap context if no specific pattern is matched.
 * @param {InferGapContextParams} params - Parameters for gap context inference.
 * @param {Date} params.gapStart - The start time of the gap.
 * @param {Date} params.gapEnd - The end time of the gap.
 * @param {calendar_v3.Schema$Event} params.precedingEvent - The event before the gap.
 * @param {calendar_v3.Schema$Event} params.followingEvent - The event after the gap.
 * @param {number} params.durationMs - The duration of the gap in milliseconds.
 * @param {TravelPatternSet} [params.patterns] - Optional pattern set for multilingual matching.
 * @returns {InferredContext | null} The inferred context with type, suggestion, and confidence score.
 * @example
 * const context = inferGapContext({
 *   gapStart: new Date("2025-01-15T10:00:00"),
 *   gapEnd: new Date("2025-01-15T12:00:00"),
 *   precedingEvent: arrivalEvent,
 *   followingEvent: departureEvent,
 *   durationMs: 7200000
 * });
 */
function inferGapContext({
  gapStart,
  gapEnd,
  precedingEvent,
  followingEvent,
  durationMs,
  patterns = DEFAULT_PATTERNS,
}: InferGapContextParams): InferredContext | null {
  const travelContext = detectTravelSandwich(
    precedingEvent,
    followingEvent,
    patterns
  )
  if (travelContext && travelContext.confidence >= 0.6) {
    return travelContext
  }

  const workContext = detectWorkSession({
    gapStart,
    gapEnd,
    precedingEvent,
    followingEvent,
    patterns,
  })
  if (workContext && workContext.confidence >= 0.55) {
    return workContext
  }

  const mealContext = detectMealBreak(gapStart, durationMs)
  if (mealContext) {
    return mealContext
  }

  if (travelContext) {
    return travelContext
  }

  return createStandardGapContext(precedingEvent, followingEvent, durationMs)
}

/**
 * @description Creates a simplified boundary event object from a Google Calendar event.
 * Used to represent the events that bookend a detected gap.
 * @param {calendar_v3.Schema$Event} event - The Google Calendar event to convert.
 * @param {Date} timestamp - The relevant timestamp (start or end) for this boundary.
 * @param {string} calendarId - The ID of the calendar containing the event.
 * @returns {GapBoundaryEvent} A simplified event object with essential display information.
 * @example
 * const boundary = createGapBoundaryEvent(calendarEvent, new Date(), "primary");
 * // Returns { eventId: "abc123", summary: "Meeting", timestamp: Date, ... }
 */
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
  }
}

/**
 * @description Extracts the end time from a Google Calendar event as a Date object.
 * Handles both timed events (dateTime) and all-day events (date).
 * @param {calendar_v3.Schema$Event} event - The Google Calendar event.
 * @returns {Date | null} The event end time as a Date, or null if not available.
 * @example
 * const endTime = getEventEndTime(calendarEvent);
 * if (endTime) {
 *   console.log("Event ends at:", endTime.toISOString());
 * }
 */
function getEventEndTime(event: calendar_v3.Schema$Event): Date | null {
  const endStr = event.end?.dateTime || event.end?.date
  if (!endStr) {
    return null
  }
  return new Date(endStr)
}

/**
 * @description Extracts the start time from a Google Calendar event as a Date object.
 * Handles both timed events (dateTime) and all-day events (date).
 * @param {calendar_v3.Schema$Event} event - The Google Calendar event.
 * @returns {Date | null} The event start time as a Date, or null if not available.
 * @example
 * const startTime = getEventStartTime(calendarEvent);
 * if (startTime) {
 *   console.log("Event starts at:", startTime.toISOString());
 * }
 */
function getEventStartTime(event: calendar_v3.Schema$Event): Date | null {
  const startStr = event.start?.dateTime || event.start?.date
  if (!startStr) {
    return null
  }
  return new Date(startStr)
}

/**
 * @description Converts a GapCandidate internal object to a GapCandidateDTO for API responses.
 * Transforms Date objects to ISO strings and calculates duration in minutes.
 * @param {GapCandidate} gap - The internal gap candidate object with Date instances.
 * @returns {GapCandidateDTO} A serializable DTO suitable for JSON responses.
 * @example
 * const dto = gapCandidateToDTO(gapCandidate);
 * // Returns { id: "uuid", start: "2025-01-15T10:00:00Z", durationMinutes: 60, ... }
 */
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
  }
}

// =============================================================================
// Core Gap Analysis Functions
// =============================================================================

type AnalyzeGapsParams = {
  email: string
  startDate: Date
  endDate: Date
  calendarId?: string
  settings?: Partial<GapRecoverySettings>
  options?: GapAnalysisOptions
}

/**
 * @description Analyzes a user's calendar to find gaps between events that may represent untracked time.
 * Fetches events from Google Calendar, identifies gaps meeting duration thresholds, and infers
 * context for each gap based on surrounding events and time of day.
 * @param {AnalyzeGapsParams} params - Parameters for gap analysis.
 * @param {string} params.email - The user's email address for authentication.
 * @param {Date} params.startDate - The start of the analysis period.
 * @param {Date} params.endDate - The end of the analysis period.
 * @param {string} [params.calendarId="primary"] - The calendar ID to analyze.
 * @param {Partial<GapRecoverySettings>} [params.settings] - Override default gap recovery settings.
 * @param {GapAnalysisOptions} [params.options] - Additional analysis options.
 * @returns {Promise<GapCandidate[]>} Array of detected gaps with inferred context and metadata.
 * @example
 * const gaps = await analyzeGaps({
 *   email: "user@example.com",
 *   startDate: new Date("2025-01-08"),
 *   endDate: new Date("2025-01-15"),
 *   settings: { minGapThreshold: 60 }
 * });
 */
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
    }

    const minGapMs = settings.minGapThreshold * MS_PER_MINUTE
    const maxGapMs = settings.maxGapThreshold * MS_PER_MINUTE
    const patterns = getCombinedPatternsForLanguages(
      settings.eventLanguages || ["en"]
    )

    // Initialize calendar client
    const credentials = await fetchCredentialsByEmail(email)
    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials)

    const listParams: calendar_v3.Params$Resource$Events$List = {
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 500,
    }

    const eventsData = await fetchCalendarEvents(calendar.events, listParams)
    const events = eventsData.items || []

    // Filter out all-day events and sort by start time
    const timedEvents = events
      .filter((event) => event.start?.dateTime && event.end?.dateTime)
      .sort((a, b) => {
        const aStart = getEventStartTime(a)?.getTime() || 0
        const bStart = getEventStartTime(b)?.getTime() || 0
        return aStart - bStart
      })

    if (timedEvents.length < 2) {
      return []
    }

    const gaps: GapCandidate[] = []

    // Find gaps between consecutive events
    for (let i = 0; i < timedEvents.length - 1; i++) {
      const currentEvent = timedEvents[i]
      const nextEvent = timedEvents[i + 1]

      const currentEnd = getEventEndTime(currentEvent)
      const nextStart = getEventStartTime(nextEvent)

      if (!(currentEnd && nextStart)) {
        continue
      }

      const gapDurationMs = nextStart.getTime() - currentEnd.getTime()

      // Skip if gap doesn't meet duration constraints
      if (gapDurationMs < minGapMs || gapDurationMs >= maxGapMs) {
        continue
      }

      // Skip if gap is on an ignored day
      const gapDay = getDayOfWeek(currentEnd)
      if (settings.ignoredDays.includes(gapDay)) {
        continue
      }

      const inferredContext = inferGapContext({
        gapStart: currentEnd,
        gapEnd: nextStart,
        precedingEvent: currentEvent,
        followingEvent: nextEvent,
        durationMs: gapDurationMs,
        patterns,
      })

      // Skip if confidence is below threshold
      if (
        inferredContext &&
        inferredContext.confidence < settings.minConfidenceThreshold
      ) {
        continue
      }

      const gap: GapCandidate = {
        id: randomUUID(),
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
      }

      gaps.push(gap)
    }

    return gaps
  }
)

type AnalyzeGapsForUserParams = {
  email: string
  lookbackDays?: number
  calendarId?: string
  settings?: Partial<GapRecoverySettings>
}

/**
 * @description High-level function to analyze gaps for a user over a specified lookback period.
 * Wraps analyzeGaps with sensible defaults and returns DTOs ready for API responses.
 * @param {AnalyzeGapsForUserParams} params - Parameters for user gap analysis.
 * @param {string} params.email - The user's email address for authentication.
 * @param {number} [params.lookbackDays=7] - Number of days to look back for gap analysis.
 * @param {string} [params.calendarId="primary"] - The calendar ID to analyze.
 * @param {Partial<GapRecoverySettings>} [params.settings] - Override default gap recovery settings.
 * @returns {Promise<GapCandidateDTO[]>} Array of gap DTOs suitable for API responses.
 * @example
 * const gaps = await analyzeGapsForUser({
 *   email: "user@example.com",
 *   lookbackDays: 14
 * });
 */
export const analyzeGapsForUser = asyncHandler(
  async ({
    email,
    lookbackDays = 7,
    calendarId = "primary",
    settings,
  }: AnalyzeGapsForUserParams): Promise<GapCandidateDTO[]> => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - lookbackDays)

    const gaps = await analyzeGaps({
      email,
      startDate,
      endDate,
      calendarId,
      settings,
    })

    return gaps.map(gapCandidateToDTO)
  }
)

type FillGapParams = {
  email: string
  gapId: string
  gapStart: Date
  gapEnd: Date
  calendarId: string
  eventDetails: FillGapRequest
}

/**
 * @description Creates a new calendar event to fill a detected gap with user-specified activity.
 * Uses the gap's time boundaries and user-provided event details to create the event.
 * @param {FillGapParams} params - Parameters for filling the gap.
 * @param {string} params.email - The user's email address for authentication.
 * @param {string} params.gapId - The unique identifier of the gap being filled.
 * @param {Date} params.gapStart - The start time of the gap.
 * @param {Date} params.gapEnd - The end time of the gap.
 * @param {string} params.calendarId - The default calendar ID if not specified in eventDetails.
 * @param {FillGapRequest} params.eventDetails - Event details including summary, description, location.
 * @returns {Promise<{ success: boolean; eventId?: string }>} Result indicating success and the new event ID.
 * @example
 * const result = await fillGap({
 *   email: "user@example.com",
 *   gapId: "gap-uuid",
 *   gapStart: new Date("2025-01-15T10:00:00"),
 *   gapEnd: new Date("2025-01-15T12:00:00"),
 *   calendarId: "primary",
 *   eventDetails: { summary: "Deep work session" }
 * });
 */
export const fillGap = asyncHandler(
  async ({
    email,
    gapStart,
    gapEnd,
    calendarId,
    eventDetails,
  }: FillGapParams): Promise<{ success: boolean; eventId?: string }> => {
    const credentials = await fetchCredentialsByEmail(email)
    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials)

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
    }

    const response = await calendar.events.insert({
      calendarId: eventDetails.calendarId || calendarId,
      requestBody: event,
    })

    return {
      success: true,
      eventId: response.data.id || undefined,
    }
  }
)

/**
 * @description Formats an array of gap candidates into a human-readable string for display.
 * Creates a numbered list with dates, times, surrounding events, and suggested activities.
 * Includes interactive instructions for users to fill or skip gaps.
 * @param {GapCandidateDTO[]} gaps - Array of gap DTOs to format for display.
 * @returns {string} A formatted multi-line string suitable for chat or UI display.
 * @example
 * const displayText = formatGapsForDisplay(gaps);
 * // Returns:
 * // "I noticed some gaps in your calendar:
 * //  1. **Wednesday, Jan 15** | 10:00 AM - 12:00 PM (2h)
 * //     Between: \"Meeting\" -> \"Lunch\"
 * //     Suggested: Work session
 * //  ..."
 */
export const formatGapsForDisplay = (gaps: GapCandidateDTO[]): string => {
  if (gaps.length === 0) {
    return "No gaps found in your calendar for the specified period."
  }

  const lines = ["I noticed some gaps in your calendar:\n"]

  gaps.forEach((gap, index) => {
    const date = new Date(gap.start)
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
    const startTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
    const endTime = new Date(gap.end).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })

    lines.push(
      `${index + 1}. **${dateStr}** | ${startTime} - ${endTime} (${gap.durationFormatted})`
    )
    lines.push(
      `   Between: "${gap.precedingEventSummary}" -> "${gap.followingEventSummary}"`
    )

    if (gap.suggestion && gap.confidence >= 0.5) {
      lines.push(`   Suggested: ${gap.suggestion}`)
    }

    lines.push("")
  })

  lines.push("What would you like to do?")
  lines.push(
    '- Reply with a number + description to fill (e.g., "1 Working on project")'
  )
  lines.push('- Reply "skip [number]" to ignore a specific gap')
  lines.push('- Reply "skip all" to dismiss all gaps')

  return lines.join("\n")
}

// Export types for use elsewhere
export type { AnalyzeGapsParams, AnalyzeGapsForUserParams, FillGapParams }
