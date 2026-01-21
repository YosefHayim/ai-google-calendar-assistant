/**
 * User Authentication Utilities
 *
 * Centralized utilities for extracting and validating user information
 * from authenticated requests. These utilities provide consistent error
 * handling and reduce code duplication across controllers.
 */

import type { Request, Response } from "express"

import { STATUS_RESPONSE } from "@/config"
import type { User } from "@supabase/supabase-js"
import sendR from "@/lib/send-response"

/**
 * Result type for user extraction utilities
 */
export type UserExtractionResult = {
  success: true
  userId: string
  userEmail: string
  user: User
}

export type UserExtractionError = {
  success: false
  handled: true
}

export type UserResult = UserExtractionResult | UserExtractionError

/**
 * Result type when only userId is required
 */
export type UserIdResult = {
  success: true
  userId: string
  user: User
}

export type UserIdExtractionResult = UserIdResult | UserExtractionError

/**
 * Extract and validate user ID from request
 *
 * Use this when you only need the user ID and don't require email.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns User ID result or error (already sent to client)
 *
 * @example
 * const userResult = requireUserId(req, res);
 * if (!userResult.success) return; // Response already sent
 * const { userId } = userResult;
 */
export function requireUserId(
  req: Request,
  res: Response
): UserIdExtractionResult {
  const user = req.user
  const userId = user?.id

  if (!userId) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    return { success: false, handled: true }
  }

  return { success: true, userId, user }
}

/**
 * Extract and validate user ID and email from request
 *
 * Use this when you need both user ID and email (common for most operations).
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns User result or error (already sent to client)
 *
 * @example
 * const userResult = requireUser(req, res);
 * if (!userResult.success) return; // Response already sent
 * const { userId, userEmail } = userResult;
 */
export function requireUser(req: Request, res: Response): UserResult {
  const user = req.user
  const userId = user?.id
  const userEmail = user?.email

  if (!(userId && userEmail)) {
    sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    return { success: false, handled: true }
  }

  return { success: true, userId, userEmail, user }
}

/**
 * Get user ID from request without sending error response
 *
 * Use this when you want to handle the error yourself or when
 * the user is optional.
 *
 * @param req - Express request object
 * @returns User ID or undefined
 */
export function getUserId(req: Request): string | undefined {
  return req.user!.id
}

/**
 * Get user email from request without sending error response
 *
 * @param req - Express request object
 * @returns User email or undefined
 */
export function getUserEmail(req: Request): string | undefined {
  return req.user?.email
}

/**
 * Check if the request has an authenticated user
 *
 * @param req - Express request object
 * @returns True if user is authenticated
 */
export function isAuthenticated(req: Request): boolean {
  return Boolean(req.user!.id)
}

/**
 * Check if the authenticated user has an email
 *
 * @param req - Express request object
 * @returns True if user has email
 */
export function hasUserEmail(req: Request): boolean {
  return Boolean(req.user?.email)
}
