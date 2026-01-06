# Contextual Gap Recovery (Smart Gap Fill)

**Version:** 1.0.0
**Status:** Draft
**Author:** Systems Architecture Team
**Date:** 2026-01-04

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Core Logic & Heuristics](#2-core-logic--heuristics)
3. [User Flow & UX](#3-user-flow--ux)
4. [Configuration & Settings](#4-configuration--settings)
5. [Technical Definitions](#5-technical-definitions)
6. [API Contracts](#6-api-contracts)
7. [Data Persistence](#7-data-persistence)
8. [Error Handling](#8-error-handling)
9. [Security Considerations](#9-security-considerations)
10. [Future Enhancements](#10-future-enhancements)

---

## 1. Feature Overview

### 1.1 Purpose

Contextual Gap Recovery is a background intelligence feature that identifies unassigned time slots between scheduled calendar events to maximize timeline accuracy and user context awareness.

### 1.2 Problem Statement

Users often have implicit activities that occur between explicitly scheduled events. For example:

- Time spent at a destination between arrival and departure
- Work sessions between meetings
- Meals or breaks between activities

These "gaps" represent undocumented time that reduces the accuracy of the user's activity timeline and limits Ally's contextual understanding.

### 1.3 Solution

The system proactively analyzes the user's calendar to:

1. Detect gaps between events that fall below a configurable threshold (default: < 8 hours)
2. Apply inference heuristics to hypothesize likely activities
3. Present candidates to the user for confirmation, filling, or dismissal
4. Learn from user responses to improve future inferences

### 1.4 Success Metrics

| Metric                 | Target                             |
| ---------------------- | ---------------------------------- |
| Gap Detection Accuracy | > 95% of valid gaps identified     |
| Inference Relevance    | > 70% of inferences marked helpful |
| User Engagement Rate   | > 40% of presented gaps resolved   |
| Feature Retention      | < 15% disable rate after 30 days   |

---

## 2. Core Logic & Heuristics

### 2.1 The Duration Constraint

**Rule:** Only flag gaps where `duration < MAX_GAP_THRESHOLD` (default: 8 hours).

**Rationale:** Gaps exceeding 8 hours typically represent:

- Sleep periods
- Extended downtime
- Multi-day breaks between activities

These are not actionable gaps and should be excluded from analysis.

```typescript
const MAX_GAP_THRESHOLD_MS = 8 * 60 * 60 * 1000; // 8 hours

function isActionableGap(gapDurationMs: number): boolean {
  return gapDurationMs < MAX_GAP_THRESHOLD_MS;
}
```

### 2.2 The Minimum Gap Threshold

**Rule:** Ignore gaps shorter than `MIN_GAP_THRESHOLD` (default: 30 minutes).

**Rationale:** Very short gaps typically represent:

- Buffer time between meetings
- Transit within the same location
- Intentional breaks

```typescript
const MIN_GAP_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

function exceedsMinimumThreshold(gapDurationMs: number): boolean {
  return gapDurationMs >= MIN_GAP_THRESHOLD_MS;
}
```

### 2.3 The "Travel Sandwich" Inference

**Pattern Recognition:**

```
IF Event A = "Drive to [Location]" OR "Travel to [Location]" OR "Commute to [Location]"
AND Event B = "Drive Home" OR "Drive to [Different Location]" OR "Leave [Location]"
AND Gap between A.end and B.start is actionable
THEN Gap = "Activity at [Location]"
```

**Implementation:**

```typescript
interface TravelEvent {
  type: "arrival" | "departure";
  location: string | null;
  timestamp: Date;
}

const TRAVEL_PATTERNS = {
  arrival: [/^drive to (.+)$/i, /^travel to (.+)$/i, /^commute to (.+)$/i, /^arrive at (.+)$/i, /^heading to (.+)$/i],
  departure: [
    /^drive home$/i,
    /^leave (.+)$/i,
    /^depart (.+)$/i,
    /^heading home$/i,
    /^drive to (.+)$/i, // When followed by different location
  ],
};

function detectTravelSandwich(eventBefore: CalendarEvent, eventAfter: CalendarEvent): InferredContext | null {
  const arrival = matchTravelPattern(eventBefore, "arrival");
  const departure = matchTravelPattern(eventAfter, "departure");

  if (arrival && departure) {
    return {
      type: "travel_sandwich",
      location: arrival.location,
      confidence: calculateConfidence(arrival, departure),
      suggestion: `Activity at ${arrival.location}`,
    };
  }

  return null;
}
```

### 2.4 The "Standard Gap" Inference

**Definition:** Any gap between two distinct events that:

- Meets duration constraints (MIN < gap < MAX)
- Does not match a specific pattern (travel sandwich, etc.)

**Handling:**

```typescript
function createStandardGapContext(eventBefore: CalendarEvent, eventAfter: CalendarEvent, gapDuration: number): InferredContext {
  return {
    type: "standard_gap",
    location: null,
    confidence: 0.5, // Neutral confidence for unpatternized gaps
    suggestion: generateStandardSuggestion(eventBefore, eventAfter, gapDuration),
  };
}

function generateStandardSuggestion(before: CalendarEvent, after: CalendarEvent, durationMs: number): string {
  const hours = Math.floor(durationMs / (60 * 60 * 1000));
  const minutes = Math.floor((durationMs % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m untracked between "${before.summary}" and "${after.summary}"`;
  }
  return `${minutes}m untracked between "${before.summary}" and "${after.summary}"`;
}
```

### 2.5 Confidence Scoring

Each inferred context includes a confidence score (0.0 - 1.0):

| Score Range | Interpretation    | UI Treatment                        |
| ----------- | ----------------- | ----------------------------------- |
| 0.8 - 1.0   | High confidence   | Show with pre-filled suggestion     |
| 0.5 - 0.79  | Medium confidence | Show with suggestion as placeholder |
| 0.3 - 0.49  | Low confidence    | Show without suggestion             |
| < 0.3       | Very low          | Do not present to user              |

---

## 3. User Flow & UX

### 3.1 Login Trigger Flow

```
+-------------------------------------------------------------------+
|                        USER LOGS IN                                |
+-------------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------------+
|              Check: autoGapAnalysis === true?                      |
+-------------------------------------------------------------------+
                              |
              +---------------+---------------+
              | YES                           | NO
              v                               v
+-------------------------+     +-----------------------------------+
|  Fetch GapCandidates    |     |  Skip gap analysis                |
|  from past X days       |     |  (proceed to normal session)      |
+-------------------------+     +-----------------------------------+
              |
              v
+-------------------------------------------------------------------+
|                  GapCandidates.length > 0?                         |
+-------------------------------------------------------------------+
              |
              v
+-------------------------------------------------------------------+
|              Present Interactive Gap Prompt                        |
+-------------------------------------------------------------------+
```

### 3.2 Interactive Prompt Design

**Ally's Presentation Format:**

```
I noticed some gaps in your calendar from the past few days:

1. **Tuesday, Jan 2** | 2:30 PM - 5:00 PM (2h 30m)
   Between: "Drive to Downtown Office" -> "Drive Home"
   Suggested: Activity at Downtown Office

2. **Wednesday, Jan 3** | 10:00 AM - 12:30 PM (2h 30m)
   Between: "Team Standup" -> "Lunch with Client"

What would you like to do?
- Reply with a number + description to fill (e.g., "1 Working on Q1 report")
- Reply "skip [number]" to ignore a specific gap
- Reply "skip all" to dismiss all gaps for now
- Reply "disable" to turn off gap detection
```

### 3.3 User Actions

| Action       | Input Format             | Result                                                   |
| ------------ | ------------------------ | -------------------------------------------------------- |
| **FILL**     | `[number] [description]` | Creates calendar event with description                  |
| **SKIP**     | `skip [number]`          | Marks gap as skipped (won't re-prompt for this instance) |
| **SKIP ALL** | `skip all`               | Dismisses all current candidates                         |
| **DISABLE**  | `disable`                | Sets `autoGapAnalysis = false`                           |

### 3.4 On-Demand Analysis

**User Trigger Phrases:**

- "Check for gaps in my past week"
- "Analyze my calendar gaps"
- "What did I miss logging?"
- "Find untracked time"

**Response:**

```typescript
interface OnDemandGapRequest {
  lookbackDays?: number; // Default: 7
  startDate?: string; // ISO date
  endDate?: string; // ISO date
}
```

### 3.5 State Machine

```
                    +------------+
                    |   PENDING  |
                    +------------+
                          |
          +---------------+---------------+
          v               v               v
    +----------+   +----------+   +--------------+
    |  FILLED  |   |  SKIPPED |   |  DISMISSED   |
    +----------+   +----------+   +--------------+
```

---

## 4. Configuration & Settings

### 4.1 User Preferences Schema

```typescript
interface GapRecoverySettings {
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
}
```

### 4.2 Default Values

```typescript
const DEFAULT_GAP_RECOVERY_SETTINGS: GapRecoverySettings = {
  autoGapAnalysis: true,
  minGapThreshold: 30, // 30 minutes
  maxGapThreshold: 480, // 8 hours
  ignoredDays: [], // Analyze all days
  lookbackDays: 7, // Past week
  minConfidenceThreshold: 0.3,
  includedCalendars: [], // All calendars
  excludedCalendars: [],
};
```

### 4.3 Day of Week Type

```typescript
type DayOfWeek = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
```

### 4.4 Configuration Commands

Users can modify settings via natural language:

| Command                             | Effect                                 |
| ----------------------------------- | -------------------------------------- |
| "Set minimum gap to 1 hour"         | `minGapThreshold = 60`                 |
| "Ignore weekends for gap detection" | `ignoredDays = ['saturday', 'sunday']` |
| "Look back 14 days for gaps"        | `lookbackDays = 14`                    |
| "Disable gap detection"             | `autoGapAnalysis = false`              |
| "Enable gap detection"              | `autoGapAnalysis = true`               |

---

## 5. Technical Definitions

### 5.1 Core Interfaces

```typescript
/**
 * Represents a detected gap between calendar events
 */
interface GapCandidate {
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
}

/**
 * Minimal event data for gap boundaries
 */
interface GapBoundaryEvent {
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
}

/**
 * AI-generated context inference for a gap
 */
interface InferredContext {
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
}

/**
 * Types of inference patterns
 */
type InferenceType =
  | "travel_sandwich" // Gap between travel events
  | "work_session" // Gap during work hours
  | "meal_break" // Gap around typical meal times
  | "standard_gap"; // Unpatternized gap

/**
 * Resolution status of a gap
 */
type GapResolution =
  | { status: "pending" }
  | { status: "filled"; eventId: string; filledAt: Date }
  | { status: "skipped"; skippedAt: Date; reason?: string }
  | { status: "dismissed"; dismissedAt: Date };
```

### 5.2 Service Interface

```typescript
interface GapRecoveryService {
  /**
   * Analyze calendar for gaps within the specified time range
   */
  analyzeGaps(userId: string, startDate: Date, endDate: Date, options?: GapAnalysisOptions): Promise<GapCandidate[]>;

  /**
   * Get pending gap candidates for a user
   */
  getPendingGaps(userId: string): Promise<GapCandidate[]>;

  /**
   * Fill a gap with a new calendar event
   */
  fillGap(gapId: string, eventDetails: CreateEventParams): Promise<{ success: boolean; eventId?: string }>;

  /**
   * Skip a specific gap instance
   */
  skipGap(gapId: string, reason?: string): Promise<void>;

  /**
   * Dismiss all pending gaps for a user
   */
  dismissAllGaps(userId: string): Promise<void>;

  /**
   * Update gap recovery settings
   */
  updateSettings(userId: string, settings: Partial<GapRecoverySettings>): Promise<GapRecoverySettings>;

  /**
   * Get current settings for a user
   */
  getSettings(userId: string): Promise<GapRecoverySettings>;
}

interface GapAnalysisOptions {
  /** Override default settings for this analysis */
  settingsOverride?: Partial<GapRecoverySettings>;

  /** Include previously skipped gaps */
  includeSkipped?: boolean;

  /** Force re-analysis of already processed periods */
  forceReanalysis?: boolean;
}

interface CreateEventParams {
  summary: string;
  description?: string;
  location?: string;
  calendarId?: string;
}
```

### 5.3 DTOs

```typescript
/**
 * Response DTO for gap analysis
 */
interface GapAnalysisResponse {
  gaps: GapCandidateDTO[];
  totalCount: number;
  analyzedRange: {
    start: string; // ISO date
    end: string; // ISO date
  };
  settings: GapRecoverySettings;
}

/**
 * Client-facing gap candidate
 */
interface GapCandidateDTO {
  id: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  durationMinutes: number;
  durationFormatted: string;
  precedingEventSummary: string;
  followingEventSummary: string;
  suggestion: string | null;
  confidence: number;
}

/**
 * Request to fill a gap
 */
interface FillGapRequest {
  gapId: string;
  summary: string;
  description?: string;
  location?: string;
}

/**
 * Request to update settings
 */
interface UpdateGapSettingsRequest {
  autoGapAnalysis?: boolean;
  minGapThreshold?: number;
  maxGapThreshold?: number;
  ignoredDays?: DayOfWeek[];
  lookbackDays?: number;
}
```

---

## 6. API Contracts

### 6.1 Endpoints

#### GET /api/gaps

Retrieve pending gap candidates for the authenticated user.

**Query Parameters:**

| Parameter   | Type     | Default    | Description         |
| ----------- | -------- | ---------- | ------------------- |
| `startDate` | ISO date | 7 days ago | Analysis start date |
| `endDate`   | ISO date | today      | Analysis end date   |
| `limit`     | number   | 10         | Max gaps to return  |

**Response:**

```json
{
  "success": true,
  "data": {
    "gaps": [
      {
        "id": "gap_abc123",
        "start": "2026-01-02T14:30:00Z",
        "end": "2026-01-02T17:00:00Z",
        "durationMinutes": 150,
        "durationFormatted": "2h 30m",
        "precedingEventSummary": "Drive to Downtown Office",
        "followingEventSummary": "Drive Home",
        "suggestion": "Activity at Downtown Office",
        "confidence": 0.85
      }
    ],
    "totalCount": 3,
    "analyzedRange": {
      "start": "2025-12-28",
      "end": "2026-01-04"
    }
  }
}
```

#### POST /api/gaps/:gapId/fill

Fill a gap with a new calendar event.

**Request Body:**

```json
{
  "summary": "Working on Q1 report",
  "description": "Focused work session at the office",
  "location": "Downtown Office"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "eventId": "google_event_xyz789",
    "message": "Event created successfully"
  }
}
```

#### POST /api/gaps/:gapId/skip

Skip a specific gap instance.

**Request Body:**

```json
{
  "reason": "personal time"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Gap skipped"
}
```

#### POST /api/gaps/dismiss-all

Dismiss all pending gaps for the authenticated user.

**Response:**

```json
{
  "success": true,
  "message": "All gaps dismissed",
  "count": 5
}
```

#### PATCH /api/users/settings/gap-recovery

Update gap recovery settings.

**Request Body:**

```json
{
  "autoGapAnalysis": true,
  "minGapThreshold": 45,
  "ignoredDays": ["saturday", "sunday"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "autoGapAnalysis": true,
    "minGapThreshold": 45,
    "maxGapThreshold": 480,
    "ignoredDays": ["saturday", "sunday"],
    "lookbackDays": 7,
    "minConfidenceThreshold": 0.3,
    "includedCalendars": [],
    "excludedCalendars": []
  }
}
```

---

## 7. Data Persistence

### 7.1 Database Schema

```sql
-- Gap candidates table
CREATE TABLE gap_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_ms BIGINT NOT NULL,
  preceding_event_id TEXT NOT NULL,
  preceding_event_summary TEXT NOT NULL,
  following_event_id TEXT NOT NULL,
  following_event_summary TEXT NOT NULL,
  inferred_context JSONB,
  resolution_status TEXT NOT NULL DEFAULT 'pending',
  resolution_data JSONB,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_resolution_status CHECK (
    resolution_status IN ('pending', 'filled', 'skipped', 'dismissed')
  )
);

-- Indexes for common queries
CREATE INDEX idx_gap_candidates_user_status
  ON gap_candidates(user_id, resolution_status);
CREATE INDEX idx_gap_candidates_user_time
  ON gap_candidates(user_id, start_time DESC);

-- Gap recovery settings (extend existing user preferences)
ALTER TABLE user_preferences
ADD COLUMN gap_recovery_settings JSONB DEFAULT '{
  "autoGapAnalysis": true,
  "minGapThreshold": 30,
  "maxGapThreshold": 480,
  "ignoredDays": [],
  "lookbackDays": 7,
  "minConfidenceThreshold": 0.3,
  "includedCalendars": [],
  "excludedCalendars": []
}'::jsonb;
```

### 7.2 Retention Policy

| Gap State | Retention Period | Action                 |
| --------- | ---------------- | ---------------------- |
| Pending   | 30 days          | Auto-dismissed         |
| Filled    | 90 days          | Retained for analytics |
| Skipped   | 30 days          | Prevents re-prompting  |
| Dismissed | 7 days           | Soft deleted           |

---

## 8. Error Handling

### 8.1 Error Types

```typescript
class GapRecoveryError extends Error {
  constructor(message: string, public code: GapErrorCode, public details?: Record<string, unknown>) {
    super(message);
    this.name = "GapRecoveryError";
  }
}

type GapErrorCode =
  | "GAP_NOT_FOUND"
  | "GAP_ALREADY_RESOLVED"
  | "CALENDAR_ACCESS_DENIED"
  | "EVENT_CREATION_FAILED"
  | "INVALID_TIME_RANGE"
  | "SETTINGS_VALIDATION_FAILED";
```

### 8.2 Error Responses

| Code                         | HTTP Status | Message                                  |
| ---------------------------- | ----------- | ---------------------------------------- |
| `GAP_NOT_FOUND`              | 404         | Gap candidate not found                  |
| `GAP_ALREADY_RESOLVED`       | 409         | Gap has already been resolved            |
| `CALENDAR_ACCESS_DENIED`     | 403         | Calendar access token expired or revoked |
| `EVENT_CREATION_FAILED`      | 500         | Failed to create calendar event          |
| `INVALID_TIME_RANGE`         | 400         | Invalid date range specified             |
| `SETTINGS_VALIDATION_FAILED` | 400         | Invalid settings values provided         |

---

## 9. Security Considerations

### 9.1 Data Access

- Gap candidates are strictly scoped to the authenticated user
- Calendar data is accessed using the user's OAuth tokens
- No calendar content is stored beyond event summaries for gap boundaries
- All gap-related queries include user_id in WHERE clauses (RLS enforced)

### 9.2 Rate Limiting

| Operation       | Limit                 |
| --------------- | --------------------- |
| Gap analysis    | 10 requests/hour/user |
| Gap fill        | 30 requests/hour/user |
| Settings update | 20 requests/hour/user |

### 9.3 Input Validation

- Event summaries sanitized before calendar creation (XSS prevention)
- Date ranges validated (max 90 day lookback)
- Settings values bounded to valid ranges:
  - `minGapThreshold`: 5-480 minutes
  - `maxGapThreshold`: 60-1440 minutes
  - `lookbackDays`: 1-90 days

---

## 10. Future Enhancements

### 10.1 Machine Learning Integration

- Learn from user's fill patterns to improve inference accuracy
- Personalized confidence scoring based on historical acceptance rates
- Time-of-day and day-of-week pattern recognition
- Automatic category detection for filled events

### 10.2 Proactive Suggestions

- Real-time gap detection as events are created
- Predictive suggestions based on recurring patterns
- Integration with location services for travel inference
- Smart notifications for detected gaps

### 10.3 Multi-Calendar Intelligence

- Cross-calendar gap analysis
- Work vs personal calendar heuristics
- Shared calendar awareness
- Team availability consideration

### 10.4 Analytics Dashboard

- Gap fill rate over time
- Most common gap patterns
- Time tracking insights
- Productivity metrics

---

## Appendix A: Implementation Checklist

- [ ] Database migrations for `gap_candidates` table
- [ ] Extend `user_preferences` with `gap_recovery_settings`
- [ ] GapRecoveryService implementation
- [ ] Travel pattern detection utilities
- [ ] Confidence scoring algorithm
- [ ] API route handlers (Express)
- [ ] Zod validation schemas
- [ ] Agent tool for gap analysis trigger
- [ ] Agent tool for gap resolution (fill/skip/dismiss)
- [ ] Settings management integration
- [ ] Login trigger hook (Telegram/WhatsApp)
- [ ] Natural language command parsing
- [ ] Unit tests for inference heuristics
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user flows
- [ ] Documentation updates

---

## Appendix B: Related Documents

- [Security Controls](../../SECURITY.md)
- [Database Schema](../../database.types.ts)
- [Agent System](../../ai-agents/README.md)
