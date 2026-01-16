import type { Job } from "bullmq";
import { SUPABASE } from "@/config/clients";
import { logger } from "@/utils/logger";

const STALE_THRESHOLD_DAYS = 30;
const DELETE_THRESHOLD_DAYS = 90;

export type StaleConversationsJobData = Record<string, never>;

export type StaleConversationsResult = {
  markedStale: number;
  deleted: number;
  errors: string[];
};

export async function handleStaleConversationsCleanup(
  job: Job<StaleConversationsJobData>
): Promise<StaleConversationsResult> {
  const result: StaleConversationsResult = {
    markedStale: 0,
    deleted: 0,
    errors: [],
  };

  logger.info(`[Job ${job.id}] Starting stale conversations cleanup...`);

  try {
    const now = new Date();

    const staleDate = new Date(now);
    staleDate.setDate(staleDate.getDate() - STALE_THRESHOLD_DAYS);

    const deleteDate = new Date(now);
    deleteDate.setDate(deleteDate.getDate() - DELETE_THRESHOLD_DAYS);

    const { data: deletedData, error: deleteError } = await SUPABASE.from(
      "conversations"
    )
      .delete()
      .lt("updated_at", deleteDate.toISOString())
      .select("id");

    if (deleteError) {
      result.errors.push(`Delete error: ${deleteError.message}`);
      logger.error(
        `[Job ${job.id}] Error deleting old conversations:`,
        deleteError
      );
    } else {
      result.deleted = deletedData?.length || 0;
      logger.info(
        `[Job ${job.id}] Deleted ${result.deleted} conversations older than ${DELETE_THRESHOLD_DAYS} days`
      );
    }

    const { count: staleCount, error: countError } = await SUPABASE.from(
      "conversations"
    )
      .select("*", { count: "exact", head: true })
      .lt("updated_at", staleDate.toISOString())
      .gte("updated_at", deleteDate.toISOString());

    if (countError) {
      result.errors.push(`Count error: ${countError.message}`);
    } else {
      result.markedStale = staleCount || 0;
      logger.info(
        `[Job ${job.id}] Found ${result.markedStale} stale conversations (${STALE_THRESHOLD_DAYS}-${DELETE_THRESHOLD_DAYS} days old)`
      );
    }

    logger.info(
      `[Job ${job.id}] Stale conversations cleanup completed`,
      result
    );
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    result.errors.push(errorMessage);
    logger.error(`[Job ${job.id}] Stale conversations cleanup failed:`, error);
    throw error;
  }
}
