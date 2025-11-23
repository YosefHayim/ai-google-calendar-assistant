import type { SupabaseClient } from "@supabase/supabase-js";
import { Logger } from "./logging/Logger";
import { GoogleCalendarEventRepository } from "@/infrastructure/repositories/GoogleCalendarEventRepository";
import { fetchCredentialsByEmail } from "@/utils/getUserCalendarTokens";
import { initCalendarWithUserTokensAndUpdateTokens } from "@/utils/initCalendarWithUserTokens";

/**
 * Statistics interfaces
 */
export interface ScheduleStatistics {
  totalEvents: number;
  totalHours: number;
  averageEventsPerDay: number;
  averageHoursPerDay: number;
  busiestDay?: {
    date: string;
    eventCount: number;
    hours: number;
  };
  freeTimeHours: number;
  dailyBreakdown: DailyBreakdown[];
  weeklyBreakdown: WeeklyBreakdown;
  monthlyBreakdown: MonthlyBreakdown[];
}

export interface DailyBreakdown {
  date: string;
  eventCount: number;
  hours: number;
  events: Array<{
    summary: string;
    start: string;
    end: string;
    duration: number;
  }>;
}

export interface WeeklyBreakdown {
  monday: { eventCount: number; hours: number };
  tuesday: { eventCount: number; hours: number };
  wednesday: { eventCount: number; hours: number };
  thursday: { eventCount: number; hours: number };
  friday: { eventCount: number; hours: number };
  saturday: { eventCount: number; hours: number };
  sunday: { eventCount: number; hours: number };
}

export interface MonthlyBreakdown {
  month: string; // YYYY-MM format
  eventCount: number;
  hours: number;
}

export interface HourlyStatistics {
  eventsPerHour: Array<{ hour: number; eventCount: number; totalHours: number }>;
  busiestHours: Array<{ hour: number; eventCount: number; totalHours: number }>;
  quietHours: Array<{ hour: number; eventCount: number; totalHours: number }>;
  peakActivityWindows: Array<{ startHour: number; endHour: number; eventCount: number }>;
  averageDurationPerHour: Array<{ hour: number; averageDuration: number }>;
}

export interface WorkTimeAnalysis {
  totalWorkHours: number;
  totalPersonalHours: number;
  totalRecurringHours: number;
  totalOneTimeHours: number;
  meetingHours: number;
  focusTimeHours: number;
  workHoursByDay: Array<{ date: string; hours: number; isOvertime: boolean }>;
  averageWorkHoursPerWeek: number;
  averageWorkHoursPerMonth: number;
  overtimeDetected: boolean;
  overtimeHours?: number;
  workLifeBalanceRatio: number; // work hours / personal hours
  workHoursByDayOfWeek: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
}

export interface RoutineInsights {
  recurringPatterns: Array<{
    summary: string;
    frequency: string;
    typicalTime: string;
    confidence: number;
  }>;
  mostCommonEventTypes: Array<{ type: string; count: number; percentage: number }>;
  timeSlotPreferences: Array<{ hour: number; preferenceScore: number }>;
  dayOfWeekPreferences: Array<{ day: string; preferenceScore: number }>;
  durationPatterns: Array<{ duration: number; count: number; percentage: number }>;
  actionableInsights: string[];
  optimizationSuggestions: string[];
}

export interface StatisticsOptions {
  includeCancelled?: boolean;
  calendarId?: string;
  workHoursStart?: number; // Default 9 (9 AM)
  workHoursEnd?: number; // Default 17 (5 PM)
  overtimeThreshold?: number; // Default 40 hours/week
  workKeywords?: string[];
  personalKeywords?: string[];
}

/**
 * Service for calculating schedule statistics and insights
 */
export class ScheduleStatisticsService {
  private client: SupabaseClient;
  private logger: Logger;
  private defaultWorkHoursStart: number = 9;
  private defaultWorkHoursEnd: number = 17;
  private defaultOvertimeThreshold: number = 40; // hours per week

  constructor(client: SupabaseClient) {
    this.client = client;
    this.logger = new Logger("ScheduleStatisticsService");
  }

  /**
   * Get comprehensive statistics for a date range
   */
  async getStatistics(
    userId: string,
    email: string,
    startDate: Date,
    endDate: Date,
    options?: StatisticsOptions
  ): Promise<ScheduleStatistics> {
    try {
      this.logger.debug(`Getting statistics for user ${userId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

      const events = await this.fetchEvents(
        email,
        startDate,
        endDate,
        options?.calendarId || "primary",
        options?.includeCancelled || false
      );

      return this.calculateStatistics(events, startDate, endDate);
    } catch (error) {
      this.logger.error("Failed to get statistics", error);
      throw error;
    }
  }

  /**
   * Get daily statistics for a specific date
   */
  async getDailyStatistics(
    userId: string,
    email: string,
    date: Date,
    options?: StatisticsOptions
  ): Promise<DailyBreakdown> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const events = await this.fetchEvents(
        email,
        startOfDay,
        endOfDay,
        options?.calendarId || "primary",
        options?.includeCancelled || false
      );

      const dateKey = date.toISOString().split("T")[0];
      const dailyMap = new Map<string, { eventCount: number; hours: number; events: Array<{ summary: string; start: string; end: string; duration: number }> }>();

      for (const event of events) {
        if (!event.start || !event.end) continue;

        const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date || "");
        const end = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date || "");

        if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, { eventCount: 0, hours: 0, events: [] });
        }
        const daily = dailyMap.get(dateKey)!;
        daily.eventCount++;
        daily.hours += durationHours;
        daily.events.push({
          summary: event.summary || "Untitled",
          start: start.toISOString(),
          end: end.toISOString(),
          duration: durationHours,
        });
      }

      const dailyData = dailyMap.get(dateKey) || { eventCount: 0, hours: 0, events: [] };
      return {
        date: dateKey,
        eventCount: dailyData.eventCount,
        hours: dailyData.hours,
        events: dailyData.events,
      };
    } catch (error) {
      this.logger.error("Failed to get daily statistics", error);
      throw error;
    }
  }

  /**
   * Get weekly statistics for a week starting from weekStart
   */
  async getWeeklyStatistics(
    userId: string,
    email: string,
    weekStart: Date,
    options?: StatisticsOptions
  ): Promise<ScheduleStatistics> {
    try {
      const start = new Date(weekStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(weekStart);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      return this.getStatistics(userId, email, start, end, options);
    } catch (error) {
      this.logger.error("Failed to get weekly statistics", error);
      throw error;
    }
  }

  /**
   * Get monthly statistics for a specific month
   */
  async getMonthlyStatistics(
    userId: string,
    email: string,
    month: Date, // First day of the month
    options?: StatisticsOptions
  ): Promise<ScheduleStatistics> {
    try {
      const start = new Date(month.getFullYear(), month.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);

      return this.getStatistics(userId, email, start, end, options);
    } catch (error) {
      this.logger.error("Failed to get monthly statistics", error);
      throw error;
    }
  }

  /**
   * Get hourly statistics for a date range
   */
  async getHourlyStatistics(
    userId: string,
    email: string,
    startDate: Date,
    endDate: Date,
    options?: StatisticsOptions
  ): Promise<HourlyStatistics> {
    try {
      const events = await this.fetchEvents(
        email,
        startDate,
        endDate,
        options?.calendarId || "primary",
        options?.includeCancelled || false
      );

      // Initialize hourly arrays
      const hourlyEventCount = new Array(24).fill(0);
      const hourlyTotalHours = new Array(24).fill(0);
      const hourlyDurations: number[][] = Array(24)
        .fill(null)
        .map(() => []);

      // Process each event
      for (const event of events) {
        if (!event.start || !event.end) continue;

        const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date || "");
        const end = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date || "");

        if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

        // Handle all-day events (skip for hourly analysis or distribute)
        if (!event.start.dateTime || !event.end.dateTime) continue;

        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        // Get start hour
        const startHour = start.getHours();

        // Handle midnight crossover
        const endHour = end.getHours();
        if (startHour === endHour || (endHour === 0 && startHour === 23)) {
          // Event within same hour or crosses midnight
          const hour = startHour;
          hourlyEventCount[hour]++;
          hourlyTotalHours[hour] += durationHours;
          hourlyDurations[hour].push(durationHours);
        } else {
          // Event spans multiple hours - distribute proportionally
          const totalHoursInEvent = Math.ceil(durationHours);
          for (let h = startHour; h <= endHour && h < 24; h++) {
            hourlyEventCount[h]++;
            const hourDuration = h === startHour ? 1 - (start.getMinutes() / 60) : h === endHour ? end.getMinutes() / 60 : 1;
            hourlyTotalHours[h] += hourDuration;
            hourlyDurations[h].push(hourDuration);
          }
        }
      }

      // Build events per hour array
      const eventsPerHour = hourlyEventCount.map((count, hour) => ({
        hour,
        eventCount: count,
        totalHours: hourlyTotalHours[hour],
      }));

      // Find busiest hours (top 5)
      const busiestHours = [...eventsPerHour]
        .sort((a, b) => b.eventCount - a.eventCount)
        .slice(0, 5)
        .filter((h) => h.eventCount > 0);

      // Find quiet hours (bottom 5)
      const quietHours = [...eventsPerHour]
        .sort((a, b) => a.eventCount - b.eventCount)
        .slice(0, 5)
        .filter((h) => h.eventCount === 0 || h.eventCount < 2);

      // Find peak activity windows (consecutive busy hours)
      const peakWindows: Array<{ startHour: number; endHour: number; eventCount: number }> = [];
      let currentWindowStart: number | null = null;
      let currentWindowCount = 0;

      for (let h = 0; h < 24; h++) {
        if (hourlyEventCount[h] >= 2) {
          // Busy hour
          if (currentWindowStart === null) {
            currentWindowStart = h;
            currentWindowCount = hourlyEventCount[h];
          } else {
            currentWindowCount += hourlyEventCount[h];
          }
        } else {
          // Not busy - close window if exists
          if (currentWindowStart !== null) {
            peakWindows.push({
              startHour: currentWindowStart,
              endHour: h - 1,
              eventCount: currentWindowCount,
            });
            currentWindowStart = null;
            currentWindowCount = 0;
          }
        }
      }
      // Close window if still open
      if (currentWindowStart !== null) {
        peakWindows.push({
          startHour: currentWindowStart,
          endHour: 23,
          eventCount: currentWindowCount,
        });
      }

      // Calculate average duration per hour
      const averageDurationPerHour = hourlyDurations.map((durations, hour) => ({
        hour,
        averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      }));

      return {
        eventsPerHour,
        busiestHours,
        quietHours,
        peakActivityWindows: peakWindows,
        averageDurationPerHour,
      };
    } catch (error) {
      this.logger.error("Failed to get hourly statistics", error);
      throw error;
    }
  }

  /**
   * Get work time analysis for a date range
   */
  async getWorkTimeAnalysis(
    userId: string,
    email: string,
    startDate: Date,
    endDate: Date,
    options?: StatisticsOptions
  ): Promise<WorkTimeAnalysis> {
    try {
      const events = await this.fetchEvents(
        email,
        startDate,
        endDate,
        options?.calendarId || "primary",
        options?.includeCancelled || false
      );

      const workHoursStart = options?.workHoursStart ?? this.defaultWorkHoursStart;
      const workHoursEnd = options?.workHoursEnd ?? this.defaultWorkHoursEnd;
      const overtimeThreshold = options?.overtimeThreshold ?? this.defaultOvertimeThreshold;

      const workKeywords = options?.workKeywords || ["meeting", "call", "work", "project", "conference", "standup", "review"];
      const personalKeywords = options?.personalKeywords || ["personal", "family", "vacation", "holiday", "birthday"];

      let totalWorkHours = 0;
      let totalPersonalHours = 0;
      let totalRecurringHours = 0;
      let totalOneTimeHours = 0;
      let meetingHours = 0;
      let focusTimeHours = 0;

      const workHoursByDay = new Map<string, number>();
      const workHoursByDayOfWeek = new Map<number, number>();

      // Initialize day of week map
      for (let i = 0; i < 7; i++) {
        workHoursByDayOfWeek.set(i, 0);
      }

      // Process each event
      for (const event of events) {
        if (!event.start || !event.end) continue;

        const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date || "");
        const end = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date || "");

        if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        // Skip all-day events for work time analysis
        if (!event.start.dateTime || !event.end.dateTime) continue;

        // Categorize event
        const summary = (event.summary || "").toLowerCase();
        const description = (event.description || "").toLowerCase();
        const isWork = workKeywords.some((keyword) => summary.includes(keyword) || description.includes(keyword));
        const isPersonal = personalKeywords.some((keyword) => summary.includes(keyword) || description.includes(keyword));
        const isRecurring = !!event.recurrence && event.recurrence.length > 0;
        const isMeeting = summary.includes("meeting") || summary.includes("call") || summary.includes("conference");

        if (isWork && !isPersonal) {
          totalWorkHours += durationHours;
          if (isMeeting) {
            meetingHours += durationHours;
          } else {
            focusTimeHours += durationHours;
          }

          // Track by day
          const dateKey = start.toISOString().split("T")[0];
          workHoursByDay.set(dateKey, (workHoursByDay.get(dateKey) || 0) + durationHours);

          // Track by day of week
          const dayOfWeek = start.getDay();
          workHoursByDayOfWeek.set(dayOfWeek, (workHoursByDayOfWeek.get(dayOfWeek) || 0) + durationHours);
        } else if (isPersonal) {
          totalPersonalHours += durationHours;
        }

        if (isRecurring) {
          totalRecurringHours += durationHours;
        } else {
          totalOneTimeHours += durationHours;
        }
      }

      // Calculate weekly average
      const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const totalWeeks = Math.max(1, totalDays / 7);
      const averageWorkHoursPerWeek = totalWorkHours / totalWeeks;
      const averageWorkHoursPerMonth = (totalWorkHours / totalDays) * 30;

      // Detect overtime
      const overtimeDetected = averageWorkHoursPerWeek > overtimeThreshold;
      const overtimeHours = overtimeDetected ? averageWorkHoursPerWeek - overtimeThreshold : undefined;

      // Build work hours by day array
      const workHoursByDayArray = Array.from(workHoursByDay.entries()).map(([date, hours]) => ({
        date,
        hours,
        isOvertime: hours > 8, // Consider > 8 hours per day as overtime
      }));

      // Calculate work-life balance ratio
      const workLifeBalanceRatio = totalPersonalHours > 0 ? totalWorkHours / totalPersonalHours : totalWorkHours;

      return {
        totalWorkHours,
        totalPersonalHours,
        totalRecurringHours,
        totalOneTimeHours,
        meetingHours,
        focusTimeHours,
        workHoursByDay: workHoursByDayArray,
        averageWorkHoursPerWeek,
        averageWorkHoursPerMonth,
        overtimeDetected,
        overtimeHours,
        workLifeBalanceRatio,
        workHoursByDayOfWeek: {
          monday: workHoursByDayOfWeek.get(1) || 0,
          tuesday: workHoursByDayOfWeek.get(2) || 0,
          wednesday: workHoursByDayOfWeek.get(3) || 0,
          thursday: workHoursByDayOfWeek.get(4) || 0,
          friday: workHoursByDayOfWeek.get(5) || 0,
          saturday: workHoursByDayOfWeek.get(6) || 0,
          sunday: workHoursByDayOfWeek.get(0) || 0,
        },
      };
    } catch (error) {
      this.logger.error("Failed to get work time analysis", error);
      throw error;
    }
  }

  /**
   * Get routine insights and pattern detection
   */
  async getRoutineInsights(
    userId: string,
    email: string,
    startDate: Date,
    endDate: Date,
    options?: StatisticsOptions
  ): Promise<RoutineInsights> {
    try {
      const events = await this.fetchEvents(
        email,
        startDate,
        endDate,
        options?.calendarId || "primary",
        options?.includeCancelled || false
      );

      // Detect recurring patterns
      const recurringPatterns: Array<{ summary: string; frequency: string; typicalTime: string; confidence: number }> = [];
      const eventFrequency = new Map<string, { count: number; times: Date[]; summaries: Set<string> }>();

      // Track event types
      const eventTypeCount = new Map<string, number>();
      const timeSlotPreferences = new Array(24).fill(0);
      const dayOfWeekPreferences = new Array(7).fill(0);
      const durationPatterns = new Map<number, number>();

      for (const event of events) {
        if (!event.start || !event.end) continue;

        const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date || "");
        const end = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date || "");

        if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

        const summary = event.summary || "Untitled";
        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        // Track recurring events
        if (event.recurrence && event.recurrence.length > 0) {
          const key = summary.toLowerCase();
          if (!eventFrequency.has(key)) {
            eventFrequency.set(key, { count: 0, times: [], summaries: new Set() });
          }
          const freq = eventFrequency.get(key)!;
          freq.count++;
          freq.times.push(start);
          freq.summaries.add(summary);
        }

        // Track event types (by keywords)
        const keywords = summary.toLowerCase().split(/\s+/);
        for (const keyword of keywords) {
          if (keyword.length > 3) {
            eventTypeCount.set(keyword, (eventTypeCount.get(keyword) || 0) + 1);
          }
        }

        // Track time slot preferences
        if (event.start.dateTime) {
          const hour = start.getHours();
          timeSlotPreferences[hour]++;
        }

        // Track day of week preferences
        const dayOfWeek = start.getDay();
        dayOfWeekPreferences[dayOfWeek]++;

        // Track duration patterns (round to nearest 0.5 hour)
        const roundedDuration = Math.round(durationHours * 2) / 2;
        durationPatterns.set(roundedDuration, (durationPatterns.get(roundedDuration) || 0) + 1);
      }

      // Build recurring patterns
      for (const [key, freq] of eventFrequency.entries()) {
        if (freq.count >= 3) {
          // Calculate typical time
          const avgHour = freq.times.reduce((sum, time) => sum + time.getHours(), 0) / freq.times.length;
          const avgMinute = freq.times.reduce((sum, time) => sum + time.getMinutes(), 0) / freq.times.length;
          const typicalTime = `${Math.floor(avgHour)}:${String(Math.floor(avgMinute)).padStart(2, "0")}`;

          // Determine frequency
          const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
          const frequencyPerWeek = (freq.count / totalDays) * 7;
          let frequency = "occasional";
          if (frequencyPerWeek >= 5) frequency = "daily";
          else if (frequencyPerWeek >= 3) frequency = "several times a week";
          else if (frequencyPerWeek >= 1) frequency = "weekly";
          else frequency = "occasional";

          recurringPatterns.push({
            summary: Array.from(freq.summaries)[0],
            frequency,
            typicalTime,
            confidence: Math.min(100, (freq.count / totalDays) * 100),
          });
        }
      }

      // Get most common event types
      const mostCommonEventTypes = Array.from(eventTypeCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([type, count]) => ({
          type,
          count,
          percentage: (count / events.length) * 100,
        }));

      // Get time slot preferences (top 5)
      const timeSlotPrefs = timeSlotPreferences
        .map((score, hour) => ({ hour, preferenceScore: score }))
        .sort((a, b) => b.preferenceScore - a.preferenceScore)
        .slice(0, 5);

      // Get day of week preferences
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayOfWeekPrefs = dayOfWeekPreferences
        .map((score, day) => ({ day: dayNames[day], preferenceScore: score }))
        .sort((a, b) => b.preferenceScore - a.preferenceScore);

      // Get duration patterns
      const durationPatternsArray = Array.from(durationPatterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([duration, count]) => ({
          duration,
          count,
          percentage: (count / events.length) * 100,
        }));

      // Generate actionable insights
      const actionableInsights: string[] = [];
      if (recurringPatterns.length > 0) {
        const topPattern = recurringPatterns[0];
        actionableInsights.push(`You have "${topPattern.summary}" ${topPattern.frequency} at ${topPattern.typicalTime}`);
      }
      if (timeSlotPrefs.length > 0) {
        const topHour = timeSlotPrefs[0];
        actionableInsights.push(`Your busiest hour is ${topHour.hour}:00 with ${topHour.preferenceScore} events`);
      }
      if (dayOfWeekPrefs.length > 0) {
        const topDay = dayOfWeekPrefs[0];
        actionableInsights.push(`You're most active on ${topDay.day} with ${topDay.preferenceScore} events`);
      }

      // Generate optimization suggestions
      const optimizationSuggestions: string[] = [];
      const quietHours = timeSlotPreferences
        .map((score, hour) => ({ hour, score }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);
      if (quietHours.length > 0 && quietHours[0].score === 0) {
        optimizationSuggestions.push(`You have free time slots at ${quietHours.map((h) => `${h.hour}:00`).join(", ")}`);
      }

      return {
        recurringPatterns,
        mostCommonEventTypes,
        timeSlotPreferences: timeSlotPrefs,
        dayOfWeekPreferences: dayOfWeekPrefs,
        durationPatterns: durationPatternsArray,
        actionableInsights,
        optimizationSuggestions,
      };
    } catch (error) {
      this.logger.error("Failed to get routine insights", error);
      throw error;
    }
  }

  /**
   * Fetch events from Google Calendar for a user within a date range
   * @private
   */
  private async fetchEvents(
    email: string,
    startDate: Date,
    endDate: Date,
    calendarId: string = "primary",
    includeCancelled: boolean = false
  ): Promise<
    Array<{
      summary?: string | null;
      start?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
      end?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
      recurrence?: string[] | null;
      description?: string | null;
      location?: string | null;
      status?: string | null;
    }>
  > {
    try {
      this.logger.debug(`Fetching events for ${email} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

      // Get user's OAuth tokens
      const tokens = await fetchCredentialsByEmail(email);

      // Initialize calendar client with user tokens
      const calendarClient = await initCalendarWithUserTokensAndUpdateTokens(tokens);

      // Create event repository
      const eventRepository = new GoogleCalendarEventRepository(calendarClient);

      // Fetch events from Google Calendar
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
        status: event.status || null,
      }));

      // Filter out cancelled events if needed
      const filteredEvents = includeCancelled
        ? analysisEvents
        : analysisEvents.filter((event) => event.status !== "cancelled");

      this.logger.info(`Fetched ${filteredEvents.length} events for statistics`);
      return filteredEvents;
    } catch (error) {
      this.logger.error("Failed to fetch events for statistics", error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive statistics from events
   * @private
   */
  private calculateStatistics(
    events: Array<{
      summary?: string | null;
      start?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
      end?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
    }>,
    startDate: Date,
    endDate: Date
  ): ScheduleStatistics {
    const totalEvents = events.length;
    let totalHours = 0;
    const dailyMap = new Map<string, { eventCount: number; hours: number; events: Array<{ summary: string; start: string; end: string; duration: number }> }>();
    const weeklyMap = new Map<number, { eventCount: number; hours: number }>();
    const monthlyMap = new Map<string, { eventCount: number; hours: number }>();

    // Initialize weekly map
    for (let i = 0; i < 7; i++) {
      weeklyMap.set(i, { eventCount: 0, hours: 0 });
    }

    // Process each event
    for (const event of events) {
      if (!event.start || !event.end) continue;

      const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date || "");
      const end = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date || "");

      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

      const durationMs = end.getTime() - start.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      totalHours += durationHours;

      // Daily breakdown
      const dateKey = start.toISOString().split("T")[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { eventCount: 0, hours: 0, events: [] });
      }
      const daily = dailyMap.get(dateKey)!;
      daily.eventCount++;
      daily.hours += durationHours;
      daily.events.push({
        summary: event.summary || "Untitled",
        start: start.toISOString(),
        end: end.toISOString(),
        duration: durationHours,
      });

      // Weekly breakdown (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const dayOfWeek = start.getDay();
      const weekly = weeklyMap.get(dayOfWeek)!;
      weekly.eventCount++;
      weekly.hours += durationHours;

      // Monthly breakdown
      const monthKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { eventCount: 0, hours: 0 });
      }
      const monthly = monthlyMap.get(monthKey)!;
      monthly.eventCount++;
      monthly.hours += durationHours;
    }

    // Calculate averages
    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const averageEventsPerDay = totalEvents / totalDays;
    const averageHoursPerDay = totalHours / totalDays;

    // Find busiest day
    let busiestDay: { date: string; eventCount: number; hours: number } | undefined;
    for (const [date, data] of dailyMap.entries()) {
      if (!busiestDay || data.eventCount > busiestDay.eventCount) {
        busiestDay = { date, eventCount: data.eventCount, hours: data.hours };
      }
    }

    // Calculate free time (24 hours - scheduled hours per day on average)
    const freeTimeHours = 24 - averageHoursPerDay;

    // Convert maps to arrays
    const dailyBreakdown: DailyBreakdown[] = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        eventCount: data.eventCount,
        hours: data.hours,
        events: data.events,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const weeklyBreakdown: WeeklyBreakdown = {
      monday: weeklyMap.get(1) || { eventCount: 0, hours: 0 },
      tuesday: weeklyMap.get(2) || { eventCount: 0, hours: 0 },
      wednesday: weeklyMap.get(3) || { eventCount: 0, hours: 0 },
      thursday: weeklyMap.get(4) || { eventCount: 0, hours: 0 },
      friday: weeklyMap.get(5) || { eventCount: 0, hours: 0 },
      saturday: weeklyMap.get(6) || { eventCount: 0, hours: 0 },
      sunday: weeklyMap.get(0) || { eventCount: 0, hours: 0 },
    };

    const monthlyBreakdown: MonthlyBreakdown[] = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        eventCount: data.eventCount,
        hours: data.hours,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalEvents,
      totalHours,
      averageEventsPerDay,
      averageHoursPerDay,
      busiestDay,
      freeTimeHours: Math.max(0, freeTimeHours),
      dailyBreakdown,
      weeklyBreakdown,
      monthlyBreakdown,
    };
  }
}

