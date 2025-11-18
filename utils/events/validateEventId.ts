import type { calendar_v3 } from "googleapis";
import { ACTION } from "@/types";

/**
 * Validates that event ID exists for UPDATE and DELETE operations
 * @throws Error if event ID is missing for UPDATE/DELETE actions
 */
export function validateEventId(
  action?: ACTION,
  eventData?: calendar_v3.Schema$Event | Record<string, string>
): void {
  if ((action === ACTION.UPDATE || action === ACTION.DELETE) && !eventData?.id) {
    throw new Error("Event ID is required for update or delete action");
  }
}
