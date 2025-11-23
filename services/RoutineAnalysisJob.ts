/**
 * Routine Analysis Background Job
 *
 * Periodically analyzes user calendars to learn and update routines.
 * Runs on a schedule (configurable via cron expression) to:
 * - Fetch recent calendar events for all active users
 * - Analyze patterns and learn routines
 * - Update confidence scores
 * - Handle errors and retries gracefully
 */

import cron, { type ScheduledTask } from "node-cron";
import type { SupabaseClient } from "@supabase/supabase-js";
import { RoutineLearningService } from "./RoutineLearningService";
import { Logger } from "./logging/Logger";

export interface RoutineAnalysisJobConfig {
  /** Cron expression for job schedule (default: daily at 2 AM) */
  schedule?: string;
  /** Number of days to look back for analysis (default: 30) */
  lookbackDays?: number;
  /** Maximum number of users to process per run (default: 100) */
  maxUsersPerRun?: number;
  /** Enable/disable the job (default: true) */
  enabled?: boolean;
}

/**
 * Background job service for routine analysis
 */
export class RoutineAnalysisJob {
  private client: SupabaseClient;
  private routineService: RoutineLearningService;
  private logger: Logger;
  private cronJob: ScheduledTask | null = null;
  private config: Required<RoutineAnalysisJobConfig>;
  private isRunning = false;

  constructor(
    client: SupabaseClient,
    routineService: RoutineLearningService,
    config: RoutineAnalysisJobConfig = {}
  ) {
    this.client = client;
    this.routineService = routineService;
    this.logger = new Logger("RoutineAnalysisJob");

    // Default configuration
    this.config = {
      schedule: config.schedule || "0 2 * * *", // Daily at 2 AM
      lookbackDays: config.lookbackDays || 30,
      maxUsersPerRun: config.maxUsersPerRun || 100,
      enabled: config.enabled !== false,
    };
  }

  /**
   * Start the background job
   */
  start(): void {
    if (!this.config.enabled) {
      this.logger.info("Routine analysis job is disabled");
      return;
    }

    if (this.cronJob) {
      this.logger.warn("Job is already running");
      return;
    }

    this.logger.info(`Starting routine analysis job with schedule: ${this.config.schedule}`);

    this.cronJob = cron.schedule(this.config.schedule, async () => {
      await this.runAnalysis();
    });

    this.logger.info("Routine analysis job started successfully");
  }

  /**
   * Stop the background job
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      this.logger.info("Routine analysis job stopped");
    }
  }

  /**
   * Run the analysis job manually (for testing or on-demand execution)
   */
  async runAnalysis(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn("Analysis job is already running, skipping this execution");
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      this.logger.info("Starting routine analysis job execution");

      // Get all active users with calendar tokens
      const users = await this.getActiveUsers();

      if (users.length === 0) {
        this.logger.info("No active users found for routine analysis");
        return;
      }

      this.logger.info(`Found ${users.length} active users, processing up to ${this.config.maxUsersPerRun}`);

      // Process users (limit to maxUsersPerRun)
      const usersToProcess = users.slice(0, this.config.maxUsersPerRun);
      let successCount = 0;
      let errorCount = 0;

      for (const user of usersToProcess) {
        try {
          await this.analyzeUserRoutines(user.user_id, user.email);
          successCount++;
        } catch (error) {
          errorCount++;
          this.logger.error(`Failed to analyze routines for user ${user.user_id}`, error);
          // Continue with next user even if one fails
        }
      }

      const duration = Date.now() - startTime;
      this.logger.info(
        `Routine analysis job completed: ${successCount} succeeded, ${errorCount} failed, duration: ${duration}ms`
      );
    } catch (error) {
      this.logger.error("Routine analysis job failed", error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get active users with calendar tokens
   */
  private async getActiveUsers(): Promise<Array<{ user_id: string; email: string }>> {
    try {
      const { data, error } = await this.client
        .from("user_calendar_tokens")
        .select("user_id, email")
        .not("email", "is", null)
        .not("access_token", "is", null);

      if (error) {
        throw error;
      }

      // Remove duplicates (same user_id might have multiple entries)
      const uniqueUsers = new Map<string, { user_id: string; email: string }>();
      for (const user of data || []) {
        if (user.user_id && user.email && !uniqueUsers.has(user.user_id)) {
          uniqueUsers.set(user.user_id, {
            user_id: user.user_id,
            email: user.email,
          });
        }
      }

      return Array.from(uniqueUsers.values());
    } catch (error) {
      this.logger.error("Failed to get active users", error);
      throw error;
    }
  }

  /**
   * Analyze routines for a specific user
   */
  private async analyzeUserRoutines(user_id: string, email: string): Promise<void> {
    try {
      this.logger.debug(`Analyzing routines for user ${user_id}`);

      // Calculate date range (lookbackDays ago to today)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - this.config.lookbackDays);

      const timeRange = {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      };

      // Learn routines from calendar events
      const routines = await this.routineService.learnRoutine(user_id, email, timeRange);

      this.logger.info(`Learned ${routines.length} routines for user ${user_id}`);
    } catch (error) {
      this.logger.error(`Failed to analyze routines for user ${user_id}`, error);
      throw error;
    }
  }

  /**
   * Get job status
   */
  getStatus(): {
    enabled: boolean;
    running: boolean;
    schedule: string;
    lastRun?: Date;
  } {
    return {
      enabled: this.config.enabled,
      running: this.isRunning,
      schedule: this.config.schedule,
    };
  }
}

