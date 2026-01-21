/**
 * Ownership Validation Utilities (Anti-BOLA/IDOR Protection)
 *
 * BOLA (Broken Object Level Authorization) is OWASP API Top 10 #1 vulnerability.
 * These utilities ensure users can only access their own resources.
 */

import type { Request, Response } from "express";

import { STATUS_RESPONSE } from "@/config";
import { SUPABASE } from "@/config/clients";
import { logger } from "@/lib/logger";
import sendR from "@/lib/send-response";

export type OwnedResourceType =
  | "conversation"
  | "user_calendar"
  | "telegram_user"
  | "whatsapp_user";

type ValidTableName =
  | "conversations"
  | "user_calendars"
  | "telegram_users"
  | "whatsapp_users";

const RESOURCE_TABLE_MAP: Record<
  OwnedResourceType,
  { table: ValidTableName; userIdColumn: string }
> = {
  conversation: { table: "conversations", userIdColumn: "user_id" },
  user_calendar: { table: "user_calendars", userIdColumn: "user_id" },
  telegram_user: { table: "telegram_users", userIdColumn: "user_id" },
  whatsapp_user: { table: "whatsapp_users", userIdColumn: "user_id" },
};

export type OwnershipValidationResult = {
  isOwner: boolean;
  error?: string;
};

export async function validateResourceOwnership(
  userId: string,
  resourceType: OwnedResourceType,
  resourceId: string
): Promise<OwnershipValidationResult> {
  const mapping = RESOURCE_TABLE_MAP[resourceType];
  if (!mapping) {
    logger.error(`SECURITY: Unknown resource type: ${resourceType}`);
    return { isOwner: false, error: "Invalid resource type" };
  }

  try {
    const { data, error } = await SUPABASE.from(mapping.table)
      .select(mapping.userIdColumn)
      .eq("id", resourceId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { isOwner: false, error: "Resource not found" };
      }
      logger.error(`SECURITY: Ownership check DB error: ${error.message}`);
      return { isOwner: false, error: "Validation failed" };
    }

    const ownerUserId = (data as unknown as Record<string, string>)?.[
      mapping.userIdColumn
    ];
    if (ownerUserId !== userId) {
      logger.warn(
        `SECURITY: BOLA attempt - User ${userId} tried to access ${resourceType}:${resourceId} owned by ${ownerUserId}`
      );
      return { isOwner: false, error: "Access denied" };
    }

    return { isOwner: true };
  } catch (err) {
    logger.error(`SECURITY: Ownership validation error: ${err}`);
    return { isOwner: false, error: "Validation failed" };
  }
}

export async function requireOwnership(
  req: Request,
  res: Response,
  resourceType: OwnedResourceType,
  resourceId: string
): Promise<boolean> {
  const userId = req.user!.id;

  if (!userId) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    return false;
  }

  const result = await validateResourceOwnership(
    userId,
    resourceType,
    resourceId
  );

  if (!result.isOwner) {
    // 404 for "not found" to avoid leaking resource existence, 403 for ownership failures
    const status =
      result.error === "Resource not found"
        ? STATUS_RESPONSE.NOT_FOUND
        : STATUS_RESPONSE.FORBIDDEN;
    sendR(res, status, result.error || "Access denied");
    return false;
  }

  return true;
}

export async function requireConversationOwnership(
  req: Request,
  res: Response,
  conversationId: string
): Promise<boolean> {
  return requireOwnership(req, res, "conversation", conversationId);
}

export function requireEmailOwnership(
  req: Request,
  res: Response,
  email: string
): boolean {
  const userEmail = req.user?.email;

  if (!userEmail) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    return false;
  }

  if (userEmail.toLowerCase() !== email.toLowerCase()) {
    logger.warn(
      `SECURITY: Email mismatch - User ${userEmail} tried to access data for ${email}`
    );
    sendR(res, STATUS_RESPONSE.FORBIDDEN, "Access denied");
    return false;
  }

  return true;
}

export function requireUserIdOwnership(
  req: Request,
  res: Response,
  targetUserId: string
): boolean {
  const userId = req.user!.id;

  if (!userId) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    return false;
  }

  if (userId !== targetUserId) {
    logger.warn(
      `SECURITY: User ID mismatch - User ${userId} tried to access data for ${targetUserId}`
    );
    sendR(res, STATUS_RESPONSE.FORBIDDEN, "Access denied");
    return false;
  }

  return true;
}
