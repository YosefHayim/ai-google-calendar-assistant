import type { Job } from "bullmq";
import { SUPABASE } from "@/config/clients";
import { logger } from "@/utils/logger";

const ACTIVE_USER_WINDOW_DAYS = 7;

export type AnalyticsAggregationJobData = Record<string, never>;

export type AnalyticsAggregationResult = {
  activeUsers: number;
  newUsers: number;
  totalConversations: number;
  totalEvents: number;
  errors: string[];
};

export async function handleAnalyticsAggregation(
  job: Job<AnalyticsAggregationJobData>
): Promise<AnalyticsAggregationResult> {
  const result: AnalyticsAggregationResult = {
    activeUsers: 0,
    newUsers: 0,
    totalConversations: 0,
    totalEvents: 0,
    errors: [],
  };

  logger.info(`[Job ${job.id}] Starting analytics aggregation...`);

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: newUsersCount, error: newUsersError } = await SUPABASE.from(
      "users"
    )
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", today.toISOString());

    if (newUsersError) {
      result.errors.push(`New users count error: ${newUsersError.message}`);
    } else {
      result.newUsers = newUsersCount || 0;
    }

    const activeUserCutoff = new Date();
    activeUserCutoff.setDate(
      activeUserCutoff.getDate() - ACTIVE_USER_WINDOW_DAYS
    );

    const { count: activeUsersCount, error: activeUsersError } =
      await SUPABASE.from("conversations")
        .select("user_id", { count: "exact", head: true })
        .gte("updated_at", activeUserCutoff.toISOString());

    if (activeUsersError) {
      result.errors.push(
        `Active users count error: ${activeUsersError.message}`
      );
    } else {
      result.activeUsers = activeUsersCount || 0;
    }

    const { count: conversationsCount, error: conversationsError } =
      await SUPABASE.from("conversations").select("*", {
        count: "exact",
        head: true,
      });

    if (conversationsError) {
      result.errors.push(
        `Conversations count error: ${conversationsError.message}`
      );
    } else {
      result.totalConversations = conversationsCount || 0;
    }

    logger.info(`[Job ${job.id}] Analytics for ${yesterday.toDateString()}:`, {
      newUsers: result.newUsers,
      activeUsers: result.activeUsers,
      totalConversations: result.totalConversations,
    });

    logger.info(`[Job ${job.id}] Analytics aggregation completed`, result);
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    result.errors.push(errorMessage);
    logger.error(`[Job ${job.id}] Analytics aggregation failed:`, error);
    throw error;
  }
}
