import { Logger } from "./logging/Logger";
import { RoutineLearningService } from "./RoutineLearningService";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Service for managing proactive reminders based on learned routines
 */
export class ReminderService {
  private client: SupabaseClient;
  private routineService: RoutineLearningService;
  private logger: Logger;

  constructor(client: SupabaseClient, routineService: RoutineLearningService) {
    this.client = client;
    this.routineService = routineService;
    this.logger = new Logger("ReminderService");
  }

  /**
   * Get reminders for predicted upcoming events
   * @param user_id - User identifier
   * @param daysAhead - Number of days to look ahead for reminders
   * @returns Array of reminder objects
   */
  async getUpcomingReminders(user_id: string, daysAhead: number = 7): Promise<Array<{ event: string; predicted_time: string; confidence: number; reminder_time: string }>> {
    try {
      this.logger.debug(`Getting reminders for user ${user_id} for next ${daysAhead} days`);

      // Get predicted events
      const predictions = await this.routineService.predictUpcomingEvents(user_id, daysAhead);

      // Generate reminders (1 day before for high confidence, 2 hours before for medium)
      const reminders = predictions
        .filter((p) => p.confidence >= 0.7) // Only high confidence predictions
        .map((prediction) => {
          const predictedTime = new Date(prediction.predicted_start);
          // Remind 1 day before, or 2 hours before if less than 1 day away
          const reminderTime = new Date(predictedTime);
          if (predictedTime.getTime() - Date.now() > 24 * 60 * 60 * 1000) {
            reminderTime.setDate(reminderTime.getDate() - 1);
          } else {
            reminderTime.setHours(reminderTime.getHours() - 2);
          }

          return {
            event: prediction.summary,
            predicted_time: prediction.predicted_start,
            confidence: prediction.confidence,
            reminder_time: reminderTime.toISOString(),
          };
        })
        .filter((r) => new Date(r.reminder_time) > new Date()); // Only future reminders

      this.logger.info(`Generated ${reminders.length} reminders for user ${user_id}`);
      return reminders;
    } catch (error) {
      this.logger.error("Failed to get upcoming reminders", error);
      throw error;
    }
  }

  /**
   * Check if reminders should be sent now
   * @param user_id - User identifier
   * @returns Array of reminders that should be sent now
   */
  async checkAndGetDueReminders(user_id: string): Promise<Array<{ event: string; predicted_time: string; confidence: number }>> {
    try {
      const now = new Date();
      const reminders = await this.getUpcomingReminders(user_id, 7);

      // Filter reminders that are due (within the next 5 minutes)
      const dueReminders = reminders
        .filter((r) => {
          const reminderTime = new Date(r.reminder_time);
          const timeDiff = reminderTime.getTime() - now.getTime();
          return timeDiff >= 0 && timeDiff <= 5 * 60 * 1000; // Within next 5 minutes
        })
        .map((r) => ({
          event: r.event,
          predicted_time: r.predicted_time,
          confidence: r.confidence,
        }));

      return dueReminders;
    } catch (error) {
      this.logger.error("Failed to check due reminders", error);
      throw error;
    }
  }
}

