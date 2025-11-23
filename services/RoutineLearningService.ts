import { GoogleCalendarEventRepository } from "@/infrastructure/repositories/GoogleCalendarEventRepository";
import type { Json } from "@/database.types";
import { Logger } from "./logging/Logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchCredentialsByEmail } from "@/utils/getUserCalendarTokens";
import { initCalendarWithUserTokensAndUpdateTokens } from "@/utils/initCalendarWithUserTokens";

/**
 * Types for routine learning system
 */
export type RoutineType = "daily" | "weekly" | "monthly" | "event_pattern" | "time_slot";

export interface RoutinePattern {
  id?: number;
  user_id: string;
  routine_type: RoutineType;
  pattern_data: Json;
  confidence_score: number;
  frequency?: number;
  last_observed_at?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Json;
}

export interface EventPattern {
  key: string;
  event_summary: string;
  typical_start_time: string;
  typical_duration_minutes: number;
  day_of_week?: number[];
  frequency_per_week?: number;
}

export interface TimeSlotPattern {
  key: string;
  start_hour: number;
  end_hour: number;
  day_of_week?: number[];
  availability_percentage: number;
}

export interface EventRelationshipPattern {
  key: string;
  trigger_event: string;
  related_event: string;
  typical_delay_minutes: number;
  frequency_per_week: number;
}

export interface PredictedEvent {
  summary: string;
  predicted_start: string;
  predicted_end: string;
  confidence: number;
  pattern_key: string;
  routine_type: RoutineType;
}

export interface TimeOptimizationSuggestion {
  suggested_time: string;
  reason: string;
  confidence: number;
  alternative_times?: string[];
}

/**
 * Service for learning and analyzing user routines from calendar events
 * Detects patterns, predicts upcoming events, and suggests time optimizations
 */
export class RoutineLearningService {
  private client: SupabaseClient;
  private logger: Logger;

  constructor(client: SupabaseClient) {
    this.client = client;
    this.logger = new Logger("RoutineLearningService");
  }

  /**
   * Analyze past events to find patterns
   * @param user_id - User identifier
   * @param events - Array of calendar events to analyze
   * @returns Array of detected patterns
   */
  async analyzeEventPatterns(
    user_id: string,
    events: Array<{
      summary?: string | null;
      start?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
      end?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
      recurrence?: string[] | null;
    }>
  ): Promise<RoutinePattern[]> {
    try {
      this.logger.debug(`Analyzing ${events.length} events for user ${user_id}`);

      const patterns: RoutinePattern[] = [];

      // Filter out events without required data
      const validEvents = events.filter((e) => e.summary && e.start && (e.start.dateTime || e.start.date) && e.end && (e.end.dateTime || e.end.date));

      if (validEvents.length === 0) {
        this.logger.warn("No valid events to analyze");
        return patterns;
      }

      // 1. Detect recurring events (events with RRULE)
      const recurringPatterns = this.detectRecurringEventPatterns(user_id, validEvents);
      patterns.push(...recurringPatterns);

      // 2. Detect time slot patterns (similar times without explicit recurrence)
      const timeSlotPatterns = this.detectTimeSlotPatterns(user_id, validEvents);
      patterns.push(...timeSlotPatterns);

      // 3. Detect event relationship patterns (events that often follow each other)
      const relationshipPatterns = this.detectEventRelationshipPatterns(user_id, validEvents);
      patterns.push(...relationshipPatterns);

      this.logger.info(`Found ${patterns.length} patterns for user ${user_id}`);
      return patterns;
    } catch (error) {
      this.logger.error("Failed to analyze event patterns", error);
      throw error;
    }
  }

  /**
   * Parse RRULE to determine frequency type
   */
  private parseRRuleFrequency(rrule: string): "daily" | "weekly" | "monthly" | null {
    const upperRule = rrule.toUpperCase();
    if (upperRule.includes("FREQ=DAILY")) {
      return "daily";
    }
    if (upperRule.includes("FREQ=WEEKLY")) {
      return "weekly";
    }
    if (upperRule.includes("FREQ=MONTHLY")) {
      return "monthly";
    }
    return null;
  }

  /**
   * Extract day of week from event date
   */
  private getDayOfWeek(dateTime: string | null | undefined): number | null {
    if (!dateTime) return null;
    const date = new Date(dateTime);
    return date.getDay(); // 0 = Sunday, 6 = Saturday
  }

  /**
   * Extract time from dateTime string (HH:MM format)
   */
  private extractTime(dateTime: string | null | undefined): string | null {
    if (!dateTime) return null;
    const date = new Date(dateTime);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  /**
   * Calculate duration in minutes from start and end times
   */
  private calculateDuration(
    start: { dateTime?: string | null; date?: string | null } | null | undefined,
    end: { dateTime?: string | null; date?: string | null } | null | undefined
  ): number | null {
    if (!start || !end) return null;
    const startTime = start.dateTime || start.date;
    const endTime = end.dateTime || end.date;
    if (!startTime || !endTime) return null;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  }

  /**
   * Detect recurring event patterns from RRULE
   */
  private detectRecurringEventPatterns(
    user_id: string,
    events: Array<{
      summary?: string | null;
      start?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
      end?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
      recurrence?: string[] | null;
    }>
  ): RoutinePattern[] {
    const patterns: RoutinePattern[] = [];
    const recurringEvents = events.filter((e) => e.recurrence && e.recurrence.length > 0);

    for (const event of recurringEvents) {
      if (!event.summary || !event.recurrence || !event.start) continue;

      const rrule = event.recurrence[0];
      const frequency = this.parseRRuleFrequency(rrule);
      if (!frequency) continue;

      const startTime = event.start.dateTime || event.start.date;
      if (!startTime) continue;

      const dayOfWeek = this.getDayOfWeek(startTime);
      const typicalStartTime = this.extractTime(startTime);
      const duration = this.calculateDuration(event.start, event.end);

      if (!typicalStartTime) continue;

      // Extract BYDAY from RRULE if present (e.g., "BYDAY=MO,WE,FR")
      const bydayMatch = rrule.match(/BYDAY=([A-Z,]+)/i);
      const daysOfWeek: number[] = [];
      if (bydayMatch) {
        const dayMap: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
        bydayMatch[1].split(",").forEach((day) => {
          if (dayMap[day.toUpperCase()] !== undefined) {
            daysOfWeek.push(dayMap[day.toUpperCase()]);
          }
        });
      } else if (dayOfWeek !== null) {
        daysOfWeek.push(dayOfWeek);
      }

      const patternKey = `${event.summary.toLowerCase().replace(/\s+/g, "_")}_${frequency}`;
      const patternData: EventPattern = {
        key: patternKey,
        event_summary: event.summary,
        typical_start_time: typicalStartTime,
        typical_duration_minutes: duration || 30,
        day_of_week: daysOfWeek.length > 0 ? daysOfWeek : undefined,
        frequency_per_week: frequency === "daily" ? 7 : frequency === "weekly" ? 1 : undefined,
      };

      // Calculate confidence based on RRULE explicitness and frequency
      const confidence = this.calculateConfidenceForRecurringPattern(frequency, daysOfWeek.length);

      patterns.push({
        user_id,
        routine_type: frequency,
        pattern_data: patternData as unknown as Json,
        confidence_score: confidence,
        frequency: frequency === "daily" ? 7 : frequency === "weekly" ? 1 : 1,
        last_observed_at: new Date().toISOString(),
      });
    }

    return patterns;
  }

  /**
   * Detect time slot patterns (events that occur at similar times)
   */
  private detectTimeSlotPatterns(
    user_id: string,
    events: Array<{
      summary?: string | null;
      start?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
      end?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
    }>
  ): RoutinePattern[] {
    const patterns: RoutinePattern[] = [];

    // Group events by day of week and hour
    const eventsByDayAndHour: Record<string, typeof events> = {};

    for (const event of events) {
      if (!event.start?.dateTime) continue; // Skip all-day events

      const startDate = new Date(event.start.dateTime);
      const hour = startDate.getHours();
      const dayOfWeek = startDate.getDay();

      const dayHourKey = `${dayOfWeek}_${hour}`;
      if (!eventsByDayAndHour[dayHourKey]) {
        eventsByDayAndHour[dayHourKey] = [];
      }
      eventsByDayAndHour[dayHourKey].push(event);
    }

    // Find time slots with high activity (3+ events at same hour)
    for (const [dayHourKey, hourEvents] of Object.entries(eventsByDayAndHour)) {
      if (hourEvents.length < 3) continue; // Need at least 3 occurrences

      const [dayOfWeek, hour] = dayHourKey.split("_").map(Number);
      const endHour = hour + 1;

      // Calculate availability percentage (how often this slot is free)
      const totalDaysForSlot = this.calculateTotalDays(events);
      const availabilityPercentage = Math.max(0, 1 - hourEvents.length / totalDaysForSlot);

      const patternKey = `time_slot_${dayOfWeek}_${hour}`;
      const patternData: TimeSlotPattern = {
        key: patternKey,
        start_hour: hour,
        end_hour: endHour,
        day_of_week: [dayOfWeek],
        availability_percentage: Math.min(1, Math.max(0, availabilityPercentage)),
      };

      // Calculate confidence based on frequency and consistency
      const totalDaysForTimeSlot = this.calculateTotalDays(events);
      const consistency = hourEvents.length / totalDaysForTimeSlot;
      const confidence = this.calculateConfidenceForTimeSlot(hourEvents.length, consistency);

      patterns.push({
        user_id,
        routine_type: "time_slot",
        pattern_data: patternData as unknown as Json,
        confidence_score: confidence,
        frequency: hourEvents.length,
        last_observed_at: new Date().toISOString(),
      });
    }

    return patterns;
  }

  /**
   * Detect event relationship patterns (events that often follow each other)
   */
  private detectEventRelationshipPatterns(
    user_id: string,
    events: Array<{
      summary?: string | null;
      start?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
      end?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
    }>
  ): RoutinePattern[] {
    const patterns: RoutinePattern[] = [];

    // Sort events by start time
    const sortedEvents = events
      .filter((e) => e.start?.dateTime && e.summary)
      .sort((a, b) => {
        const aTime = a.start?.dateTime ? new Date(a.start.dateTime).getTime() : 0;
        const bTime = b.start?.dateTime ? new Date(b.start.dateTime).getTime() : 0;
        return aTime - bTime;
      });

    // Track event pairs that occur close together
    const eventPairs: Map<string, { count: number; totalDelay: number }> = new Map();

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const current = sortedEvents[i];
      const next = sortedEvents[i + 1];

      if (!current.summary || !next.summary || !current.end?.dateTime || !next.start?.dateTime) continue;

      const currentEnd = new Date(current.end.dateTime);
      const nextStart = new Date(next.start.dateTime);
      const delayMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);

      // Only consider events within 2 hours of each other
      if (delayMinutes > 0 && delayMinutes < 120) {
        const pairKey = `${current.summary}->${next.summary}`;
        const existing = eventPairs.get(pairKey);
        if (existing) {
          existing.count++;
          existing.totalDelay += delayMinutes;
        } else {
          eventPairs.set(pairKey, { count: 1, totalDelay: delayMinutes });
        }
      }
    }

    // Create patterns for pairs that occur 3+ times
    for (const [pairKey, data] of eventPairs.entries()) {
      if (data.count < 3) continue; // Need at least 3 occurrences

      const [triggerEvent, relatedEvent] = pairKey.split("->");
      const avgDelay = Math.round(data.totalDelay / data.count);

      const patternKey = `${triggerEvent.toLowerCase().replace(/\s+/g, "_")}_to_${relatedEvent.toLowerCase().replace(/\s+/g, "_")}`;
      const patternData: EventRelationshipPattern = {
        key: patternKey,
        trigger_event: triggerEvent,
        related_event: relatedEvent,
        typical_delay_minutes: avgDelay,
        frequency_per_week: Math.round((data.count / this.calculateTotalDays(events)) * 7),
      };

      // Calculate confidence based on frequency and consistency
      const totalDaysForRelationship = this.calculateTotalDays(events);
      const consistency = data.count / totalDaysForRelationship;
      const confidence = this.calculateConfidenceForEventRelationship(data.count, consistency);

      patterns.push({
        user_id,
        routine_type: "event_pattern",
        pattern_data: patternData as unknown as Json,
        confidence_score: confidence,
        frequency: data.count,
        last_observed_at: new Date().toISOString(),
      });
    }

    return patterns;
  }

  /**
   * Calculate total days spanned by events (for frequency calculations)
   */
  private calculateTotalDays(
    events: Array<{
      start?: { dateTime?: string | null; date?: string | null } | null;
    }>
  ): number {
    if (events.length === 0) return 1;

    const dates = events
      .map((e) => {
        const dateTime = e.start?.dateTime || e.start?.date;
        return dateTime ? new Date(dateTime) : null;
      })
      .filter((d): d is Date => d !== null)
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) return 1;

    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    const diffTime = lastDate.getTime() - firstDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(1, diffDays); // At least 1 day
  }

  /**
   * Fetch events from Google Calendar for a user within a date range
   * @param email - User email address
   * @param timeRange - Object with start and end dates
   * @param calendarId - Optional calendar ID (defaults to "primary")
   * @returns Array of calendar events
   */
  async fetchEventsForAnalysis(
    email: string,
    timeRange: { start: string; end: string },
    calendarId: string = "primary"
  ): Promise<
    Array<{
      summary?: string | null;
      start?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
      end?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
      recurrence?: string[] | null;
      description?: string | null;
      location?: string | null;
    }>
  > {
    try {
      this.logger.debug(`Fetching events for ${email} from ${timeRange.start} to ${timeRange.end}`);

      // Get user's OAuth tokens
      const tokens = await fetchCredentialsByEmail(email);

      // Initialize calendar client with user tokens
      const calendarClient = await initCalendarWithUserTokensAndUpdateTokens(tokens);

      // Create event repository
      const eventRepository = new GoogleCalendarEventRepository(calendarClient);

      // Fetch events from Google Calendar
      const startDate = new Date(timeRange.start);
      const endDate = new Date(timeRange.end);

      const events = await eventRepository.findByDateRange(calendarId, startDate, endDate, {
        includeRecurring: true,
        maxResults: 2500,
        orderBy: "startTime",
      });

      // Transform domain events to analysis format
      const analysisEvents = events.map((event) => ({
        summary: event.summary,
        start: event.start,
        end: event.end,
        recurrence: event.recurrence ? [event.recurrence.rule] : null,
        description: event.description || null,
        location: event.location || null,
      }));

      this.logger.info(`Fetched ${analysisEvents.length} events for analysis`);
      return analysisEvents;
    } catch (error) {
      this.logger.error("Failed to fetch events for analysis", error);
      throw error;
    }
  }

  /**
   * Learn routines from calendar data for a given time range
   * @param user_id - User identifier
   * @param email - User email address (for fetching calendar events)
   * @param timeRange - Object with start and end dates
   * @param calendarId - Optional calendar ID (defaults to "primary")
   * @returns Array of learned routines
   */
  async learnRoutine(user_id: string, email: string, timeRange: { start: string; end: string }, calendarId: string = "primary"): Promise<RoutinePattern[]> {
    try {
      this.logger.debug(`Learning routines for user ${user_id} from ${timeRange.start} to ${timeRange.end}`);

      // Fetch events from Google Calendar
      const events = await this.fetchEventsForAnalysis(email, timeRange, calendarId);

      if (events.length === 0) {
        this.logger.warn(`No events found for user ${user_id} in the specified time range`);
        return [];
      }

      // Analyze patterns from events
      const patterns = await this.analyzeEventPatterns(user_id, events);

      // Store learned routines in database
      const routines: RoutinePattern[] = [];

      for (const pattern of patterns) {
        try {
          // Extract key from pattern_data for querying
          const patternDataObj = pattern.pattern_data as unknown as { key?: string };
          const patternKey = patternDataObj?.key;

          if (!patternKey) {
            this.logger.warn("Pattern data missing key, skipping", { pattern });
            continue;
          }

          // Check if routine already exists using the unique index
          const { data: existing, error: queryError } = await this.client
            .from("user_routines")
            .select("*")
            .eq("user_id", pattern.user_id)
            .eq("routine_type", pattern.routine_type)
            .eq("pattern_data->>key", patternKey)
            .maybeSingle();

          if (queryError && queryError.code !== "PGRST116") {
            // PGRST116 is "not found", which is fine
            this.logger.warn(`Failed to query existing routine: ${queryError.message}`, { pattern });
            continue;
          }

          // Prepare data for upsert
          const routineData = {
            user_id: pattern.user_id,
            routine_type: pattern.routine_type,
            pattern_data: pattern.pattern_data,
            confidence_score: pattern.confidence_score,
            frequency: pattern.frequency,
            last_observed_at: pattern.last_observed_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: pattern.metadata,
          };

          let result;
          if (existing) {
            // Update existing routine
            const { data, error } = await this.client.from("user_routines").update(routineData).eq("id", existing.id).select().single();

            if (error) {
              this.logger.warn(`Failed to update routine pattern: ${error.message}`, { pattern });
              continue;
            }
            result = data;
          } else {
            // Insert new routine
            const { data, error } = await this.client.from("user_routines").insert(routineData).select().single();

            if (error) {
              this.logger.warn(`Failed to insert routine pattern: ${error.message}`, { pattern });
              continue;
            }
            result = data;
          }

          routines.push(result as RoutinePattern);
        } catch (error) {
          this.logger.warn(`Error storing routine pattern`, { error, pattern });
        }
      }

      this.logger.info(`Learned ${routines.length} routines for user ${user_id}`);
      return routines;
    } catch (error) {
      this.logger.error("Failed to learn routine", error);
      throw error;
    }
  }

  /**
   * Retrieve learned routines for a user
   * @param user_id - User identifier
   * @param routineType - Optional filter by routine type
   * @returns Array of learned routines
   */
  async getUserRoutine(user_id: string, routineType?: RoutineType): Promise<RoutinePattern[]> {
    try {
      this.logger.debug(`Getting routines for user ${user_id}${routineType ? ` (type: ${routineType})` : ""}`);

      let query = this.client.from("user_routines").select("*").eq("user_id", user_id).order("updated_at", { ascending: false });

      if (routineType) {
        query = query.eq("routine_type", routineType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      this.logger.debug(`Retrieved ${data?.length || 0} routines for user ${user_id}`);
      return (data as RoutinePattern[]) || [];
    } catch (error) {
      this.logger.error("Failed to get user routine", error);
      throw error;
    }
  }

  /**
   * Predict likely upcoming events based on learned patterns
   * @param user_id - User identifier
   * @param daysAhead - Number of days to predict ahead
   * @returns Array of predicted events
   */
  async predictUpcomingEvents(user_id: string, daysAhead: number = 7): Promise<PredictedEvent[]> {
    try {
      this.logger.debug(`Predicting events for user ${user_id} for next ${daysAhead} days`);

      // TODO: Implement prediction logic
      // - Get learned routines
      // - Calculate predicted events based on patterns
      // - Return predictions with confidence scores

      const predictions: PredictedEvent[] = [];

      this.logger.info(`Predicted ${predictions.length} events for user ${user_id}`);
      return predictions;
    } catch (error) {
      this.logger.error("Failed to predict upcoming events", error);
      throw error;
    }
  }

  /**
   * Suggest optimal time slots for a new event
   * @param user_id - User identifier
   * @param eventDuration - Duration in minutes
   * @param preferredTime - Optional preferred time (ISO string)
   * @returns Time optimization suggestion
   */
  async suggestOptimalTime(user_id: string, eventDuration: number, preferredTime?: string): Promise<TimeOptimizationSuggestion | null> {
    try {
      this.logger.debug(`Suggesting optimal time for user ${user_id}, duration: ${eventDuration} minutes`);

      // TODO: Implement time optimization logic
      // - Get user's routines and existing events
      // - Find free time slots
      // - Consider preferred time if provided
      // - Return best suggestion with alternatives

      return null;
    } catch (error) {
      this.logger.error("Failed to suggest optimal time", error);
      throw error;
    }
  }

  /**
   * Get time optimization suggestions for the user
   * @param user_id - User identifier
   * @returns Array of optimization suggestions
   */
  async getTimeOptimizationSuggestions(user_id: string): Promise<TimeOptimizationSuggestion[]> {
    try {
      this.logger.debug(`Getting time optimization suggestions for user ${user_id}`);

      // TODO: Implement optimization suggestions
      // - Analyze current schedule
      // - Identify inefficiencies
      // - Suggest improvements

      const suggestions: TimeOptimizationSuggestion[] = [];

      this.logger.info(`Generated ${suggestions.length} optimization suggestions for user ${user_id}`);
      return suggestions;
    } catch (error) {
      this.logger.error("Failed to get time optimization suggestions", error);
      throw error;
    }
  }

  /**
   * Calculate confidence score for recurring patterns
   * Higher confidence for explicit RRULE patterns
   */
  private calculateConfidenceForRecurringPattern(frequency: "daily" | "weekly" | "monthly", dayCount: number): number {
    // Base confidence for explicit RRULE patterns
    let confidence = 0.9;

    // Adjust based on frequency type
    if (frequency === "daily") {
      confidence = 0.95; // Daily patterns are most reliable
    } else if (frequency === "weekly") {
      confidence = 0.9; // Weekly patterns are reliable
    } else {
      confidence = 0.85; // Monthly patterns are less consistent
    }

    // Adjust based on number of days (more days = more reliable)
    if (dayCount > 1) {
      confidence = Math.min(0.98, confidence + dayCount * 0.01);
    }

    return Math.min(1.0, Math.max(0.0, confidence));
  }

  /**
   * Calculate confidence score for time slot patterns
   * Based on frequency and consistency
   */
  private calculateConfidenceForTimeSlot(occurrenceCount: number, consistency: number): number {
    // Base confidence starts at 0.5
    let confidence = 0.5;

    // Increase based on occurrence count (more occurrences = more reliable)
    confidence += Math.min(0.3, occurrenceCount * 0.05);

    // Increase based on consistency (how often it occurs relative to total days)
    confidence += Math.min(0.2, consistency * 0.4);

    return Math.min(0.9, Math.max(0.0, confidence));
  }

  /**
   * Calculate confidence score for event relationship patterns
   * Based on frequency and consistency
   */
  private calculateConfidenceForEventRelationship(occurrenceCount: number, consistency: number): number {
    // Base confidence starts at 0.4 (relationships are less reliable than explicit patterns)
    let confidence = 0.4;

    // Increase based on occurrence count
    confidence += Math.min(0.25, occurrenceCount * 0.04);

    // Increase based on consistency
    confidence += Math.min(0.15, consistency * 0.3);

    return Math.min(0.8, Math.max(0.0, confidence));
  }

  /**
   * Update confidence score for a routine pattern based on validation
   * Uses adaptive learning: larger adjustments for low-confidence patterns,
   * smaller adjustments for high-confidence patterns
   * @param user_id - User identifier
   * @param routineKey - Key of the routine pattern (from pattern_data->>'key')
   * @param success - Whether the prediction was successful
   * @returns Updated routine pattern
   */
  async updateRoutineConfidence(user_id: string, routineKey: string, success: boolean): Promise<RoutinePattern | null> {
    try {
      this.logger.debug(`Updating confidence for routine ${routineKey} for user ${user_id}, success: ${success}`);

      // Find the routine by user_id and pattern key
      const { data: routines, error: fetchError } = await this.client
        .from("user_routines")
        .select("*")
        .eq("user_id", user_id)
        .eq("pattern_data->>key", routineKey)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!routines) {
        this.logger.warn(`Routine ${routineKey} not found for user ${user_id}`);
        return null;
      }

      const currentConfidence = Number(routines.confidence_score) || 0.5;
      const frequency = routines.frequency || 1;

      // Adaptive confidence adjustment:
      // - Low confidence patterns adjust faster (more learning)
      // - High confidence patterns adjust slower (more stable)
      // - Adjustment also considers frequency (more frequent = more reliable)
      const baseAdjustment = success ? 0.05 : -0.05;
      const confidenceFactor = 1 - currentConfidence; // Lower confidence = larger adjustment
      const frequencyFactor = Math.min(1.0, frequency / 10); // More frequency = smaller adjustment
      const adjustment = baseAdjustment * (0.5 + confidenceFactor * 0.5) * (1 - frequencyFactor * 0.3);

      const newConfidence = Math.max(0.0, Math.min(1.0, currentConfidence + adjustment));

      // Update frequency if successful
      const newFrequency = success ? frequency + 1 : frequency;

      const { data: updated, error: updateError } = await this.client
        .from("user_routines")
        .update({
          confidence_score: newConfidence,
          frequency: newFrequency,
          last_observed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", routines.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      this.logger.info(`Updated confidence for routine ${routineKey} to ${newConfidence} (frequency: ${newFrequency})`);
      return updated as RoutinePattern;
    } catch (error) {
      this.logger.error("Failed to update routine confidence", error);
      throw error;
    }
  }

  /**
   * Get routines above a confidence threshold
   * @param user_id - User identifier
   * @param threshold - Minimum confidence score (default: 0.7)
   * @returns Array of high-confidence routines
   */
  async getHighConfidenceRoutines(user_id: string, threshold: number = 0.7): Promise<RoutinePattern[]> {
    try {
      this.logger.debug(`Getting high-confidence routines for user ${user_id} (threshold: ${threshold})`);

      const { data, error } = await this.client
        .from("user_routines")
        .select("*")
        .eq("user_id", user_id)
        .gte("confidence_score", threshold)
        .order("confidence_score", { ascending: false });

      if (error) {
        throw error;
      }

      this.logger.debug(`Found ${data?.length || 0} high-confidence routines`);
      return (data as RoutinePattern[]) || [];
    } catch (error) {
      this.logger.error("Failed to get high-confidence routines", error);
      throw error;
    }
  }
}
