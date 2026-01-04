import type { AGENTS, AGENT_TOOLS } from "@/ai-agents";

import type { User } from "@supabase/supabase-js";
import type { calendar_v3 } from "googleapis";

export type EventParametersProps = {
  summary?: string | null | undefined;
  description?: string | null | undefined;
  start?: calendar_v3.Schema$EventDateTime | undefined;
  end?: calendar_v3.Schema$EventDateTime | undefined;
};

export type UpdateCalendarCategoriesProps = {
  calendarName: string | null | undefined;
  calendarId: string | null | undefined;
  calendarColorForEvents: string | null | undefined;
  accessRole: string | null | undefined;
  timeZoneForCalendar: string | null | undefined;
  defaultReminders: calendar_v3.Schema$EventReminder[] | undefined;
};

export type AuthedRequest = Request & { user: User };

export type GoogleIdTokenPayloadProps = {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash?: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
};

export type PendingConflictConfirmation = {
  eventData: {
    summary: string;
    start: { dateTime?: string; date?: string; timeZone?: string };
    end: { dateTime?: string; date?: string; timeZone?: string };
    calendarId: string;
    calendarName: string;
    email: string;
    location?: string;
    description?: string;
  };
  conflictingEvents: Array<{
    id: string;
    summary: string;
    start: string;
    end: string;
    calendarName: string;
  }>;
};

export type PendingEmailChange = {
  newEmail: string;
  expiresAt: number;
};

export type SessionData = {
  chatId: number;
  firstName: string | undefined;
  username: string | undefined;
  userId: number;
  codeLang: string | undefined;
  messageCount: number;
  email: string | undefined;
  lastProcessedMsgId: number;
  agentActive: boolean;
  isProcessing: boolean;
  pendingConfirmation?: PendingConflictConfirmation;
  googleTokens?: TokensProps;
  // Email verification state for Telegram
  pendingEmailVerification?: {
    email: string;
    expiresAt: number;
  };
  // Session expiry tracking (24h TTL)
  lastActivity: number;
  // Email change flow state
  pendingEmailChange?: PendingEmailChange;
  // Flag for awaiting new email input
  awaitingEmailChange?: boolean;
};

export type TokensProps = {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string;
  token_type?: string | null;
  id_token?: string | null;
  expiry_date?: number | null;
  refresh_token_expires_in?: number | null;
  email?: string | null;
  timezone?: string | null;
  is_active?: boolean | null;
};

export type userAndAiMessageProps = {
  role: "user" | "assistant";
  content: string | undefined;
};

export type TOOLS = keyof typeof AGENT_TOOLS;
export type AGENTS_LIST = keyof typeof AGENTS;

// =============================================================================
// Gap Recovery Types
// =============================================================================

/**
 * Days of the week for gap analysis configuration
 */
export type DayOfWeek =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

/**
 * Types of inference patterns for gap analysis
 */
export type InferenceType =
  | "travel_sandwich" // Gap between travel events
  | "work_session" // Gap during work hours
  | "meal_break" // Gap around typical meal times
  | "standard_gap"; // Unpatternized gap

/**
 * Resolution status of a gap
 */
export type GapResolution =
  | { status: "pending" }
  | { status: "filled"; eventId: string; filledAt: Date }
  | { status: "skipped"; skippedAt: Date; reason?: string }
  | { status: "dismissed"; dismissedAt: Date };

/**
 * AI-generated context inference for a gap
 */
export type InferredContext = {
  /** Type of inference pattern matched */
  type: InferenceType;
  /** Inferred location (if determinable) */
  location: string | null;
  /** Confidence score (0.0 - 1.0) */
  confidence: number;
  /** Human-readable suggestion */
  suggestion: string;
  /** Additional metadata for the inference */
  metadata?: Record<string, unknown>;
};

/**
 * Minimal event data for gap boundaries
 */
export type GapBoundaryEvent = {
  /** Google Calendar event ID */
  eventId: string;
  /** Event title/summary */
  summary: string;
  /** Event end time (for preceding) or start time (for following) */
  timestamp: Date;
  /** Event location if available */
  location: string | null;
  /** Calendar ID this event belongs to */
  calendarId: string;
};

/**
 * Represents a detected gap between calendar events
 */
export type GapCandidate = {
  /** Unique identifier for this gap instance */
  id: string;
  /** User ID this gap belongs to */
  userId: string;
  /** Start time of the gap (end of previous event) */
  start: Date;
  /** End time of the gap (start of next event) */
  end: Date;
  /** Duration in milliseconds */
  durationMs: number;
  /** Duration formatted for display */
  durationFormatted: string;
  /** The event that precedes this gap */
  precedingEvent: GapBoundaryEvent;
  /** The event that follows this gap */
  followingEvent: GapBoundaryEvent;
  /** AI-inferred context about this gap */
  inferredContext: InferredContext | null;
  /** Current resolution status */
  resolution: GapResolution;
  /** When this gap was detected */
  detectedAt: Date;
  /** When this gap was resolved (if applicable) */
  resolvedAt: Date | null;
};

/**
 * User preferences for gap recovery feature
 */
export type GapRecoverySettings = {
  /** Enable automatic gap analysis on login */
  autoGapAnalysis: boolean;
  /** Minimum gap duration to flag (in minutes) */
  minGapThreshold: number;
  /** Maximum gap duration to flag (in minutes) */
  maxGapThreshold: number;
  /** Days of the week to exclude from analysis */
  ignoredDays: DayOfWeek[];
  /** Number of days to look back on login trigger */
  lookbackDays: number;
  /** Minimum confidence score to present to user */
  minConfidenceThreshold: number;
  /** Calendar IDs to include (empty = all calendars) */
  includedCalendars: string[];
  /** Calendar IDs to exclude */
  excludedCalendars: string[];
};

/**
 * Client-facing gap candidate DTO
 */
export type GapCandidateDTO = {
  id: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  durationMinutes: number;
  durationFormatted: string;
  precedingEventSummary: string;
  followingEventSummary: string;
  suggestion: string | null;
  confidence: number;
};

/**
 * Response DTO for gap analysis
 */
export type GapAnalysisResponse = {
  gaps: GapCandidateDTO[];
  totalCount: number;
  analyzedRange: {
    start: string; // ISO date
    end: string; // ISO date
  };
  settings: GapRecoverySettings;
};

/**
 * Request to fill a gap
 */
export type FillGapRequest = {
  summary: string;
  description?: string;
  location?: string;
  calendarId?: string;
};

/**
 * Request to update gap recovery settings
 */
export type UpdateGapSettingsRequest = {
  autoGapAnalysis?: boolean;
  minGapThreshold?: number;
  maxGapThreshold?: number;
  ignoredDays?: DayOfWeek[];
  lookbackDays?: number;
  minConfidenceThreshold?: number;
};

/**
 * Gap analysis options
 */
export type GapAnalysisOptions = {
  /** Override default settings for this analysis */
  settingsOverride?: Partial<GapRecoverySettings>;
  /** Include previously skipped gaps */
  includeSkipped?: boolean;
  /** Force re-analysis of already processed periods */
  forceReanalysis?: boolean;
};

/**
 * Error codes for gap recovery operations
 */
export type GapErrorCode =
  | "GAP_NOT_FOUND"
  | "GAP_ALREADY_RESOLVED"
  | "CALENDAR_ACCESS_DENIED"
  | "EVENT_CREATION_FAILED"
  | "INVALID_TIME_RANGE"
  | "SETTINGS_VALIDATION_FAILED";
