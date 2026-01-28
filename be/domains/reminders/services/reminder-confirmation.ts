/**
 * Reminder Confirmation Service
 * Handles pending reminder confirmations with Redis storage
 * Pattern follows OCR confirmation handler
 *
 * High-stakes actions that require confirmation:
 * - cancel_all: Cancel all pending reminders
 * - bulk_cancel: Cancel multiple selected reminders
 *
 * Simple actions (NO confirmation needed):
 * - create: Single reminder creation
 * - cancel: Single reminder cancellation
 */

import { redisClient } from "@/infrastructure/redis/redis"
import { SUPABASE } from "@/infrastructure/supabase/supabase"
import { logger } from "@/lib/logger"
import {
  type CreateReminderInput,
  cancelReminder,
  createReminder,
  getUserReminders,
  type ScheduledReminder,
} from "./reminder-service"

const LOG_PREFIX = "[ReminderConfirmation]"
const PENDING_KEY_PREFIX = "reminder:pending"
const MS_PER_SECOND = 1000
const DEFAULT_TIMEZONE = "UTC"

async function getUserTimezoneById(userId: string): Promise<string> {
  try {
    const { data } = await SUPABASE.from("users")
      .select("timezone")
      .eq("id", userId)
      .single()
    return data?.timezone || DEFAULT_TIMEZONE
  } catch {
    return DEFAULT_TIMEZONE
  }
}

function formatDateInTimezone(date: Date | string, timezone: string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

/**
 * TTL for pending confirmations (5 minutes)
 * Silent expiry - no notification when expired
 */
const PENDING_CONFIRMATION_TTL_SECONDS = 300

export type ReminderModality = "web" | "telegram" | "slack" | "whatsapp"

export type ReminderConfirmationType =
  | "create_reminder"
  | "cancel_reminder"
  | "cancel_all_reminders"
  | "bulk_cancel_reminders"

export type PendingReminderConfirmation = {
  userId: string
  modality: ReminderModality
  type: ReminderConfirmationType
  payload: {
    /** For create_reminder: the reminder to create */
    reminderInput?: CreateReminderInput
    /** For cancel operations: IDs to cancel */
    reminderIds?: string[]
    /** Human-readable description of what will happen */
    actionDescription: string
  }
  expiresAt: number
  createdAt: number
}

export type ReminderConfirmationAction = "confirm" | "cancel"

export type ReminderConfirmationResult = {
  success: boolean
  message: string
  /** Created reminder (for create_reminder) */
  reminder?: ScheduledReminder
  /** Number of reminders affected (for bulk operations) */
  affectedCount?: number
  errors?: string[]
}

const buildPendingKey = (userId: string, modality: ReminderModality): string =>
  `${PENDING_KEY_PREFIX}:${userId}:${modality}`

/**
 * Store a pending reminder confirmation in Redis
 * Used for high-stakes actions that need user confirmation
 */
export const storePendingReminderConfirmation = async (
  userId: string,
  modality: ReminderModality,
  type: ReminderConfirmationType,
  payload: PendingReminderConfirmation["payload"]
): Promise<string> => {
  const key = buildPendingKey(userId, modality)
  const now = Date.now()

  const pending: PendingReminderConfirmation = {
    userId,
    modality,
    type,
    payload,
    expiresAt: now + PENDING_CONFIRMATION_TTL_SECONDS * MS_PER_SECOND,
    createdAt: now,
  }

  await redisClient.setex(
    key,
    PENDING_CONFIRMATION_TTL_SECONDS,
    JSON.stringify(pending)
  )

  logger.info(
    `${LOG_PREFIX} Stored pending ${type} confirmation for user ${userId}`
  )

  return key
}

/**
 * Get pending reminder confirmation for a user
 * Returns null if no pending confirmation or if expired
 */
export const getPendingReminderConfirmation = async (
  userId: string,
  modality: ReminderModality
): Promise<PendingReminderConfirmation | null> => {
  const key = buildPendingKey(userId, modality)
  const data = await redisClient.get(key)

  if (!data) {
    return null
  }

  try {
    const pending = JSON.parse(data) as PendingReminderConfirmation

    if (pending.expiresAt < Date.now()) {
      await redisClient.del(key)
      return null
    }

    return pending
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to parse pending confirmation:`, error)
    return null
  }
}

/**
 * Clear pending reminder confirmation
 */
export const clearPendingReminderConfirmation = async (
  userId: string,
  modality: ReminderModality
): Promise<void> => {
  const key = buildPendingKey(userId, modality)
  await redisClient.del(key)
  logger.info(`${LOG_PREFIX} Cleared pending confirmation for user ${userId}`)
}

/**
 * Check if user has pending reminder confirmation
 */
export const hasPendingReminderConfirmation = async (
  userId: string,
  modality: ReminderModality
): Promise<boolean> => {
  const pending = await getPendingReminderConfirmation(userId, modality)
  return pending !== null
}

/**
 * Execute reminder confirmation based on user action
 */
export const executeReminderConfirmation = async (
  userId: string,
  modality: ReminderModality,
  action: ReminderConfirmationAction
): Promise<ReminderConfirmationResult> => {
  const pending = await getPendingReminderConfirmation(userId, modality)

  if (!pending) {
    return {
      success: false,
      message: "No pending confirmation found or it has expired.",
    }
  }

  if (action === "cancel") {
    await clearPendingReminderConfirmation(userId, modality)
    return {
      success: true,
      message: "Operation cancelled.",
    }
  }

  let result: ReminderConfirmationResult

  switch (pending.type) {
    case "create_reminder":
      result = await executeCreateReminder(pending)
      break

    case "cancel_reminder":
      result = await executeCancelReminder(pending)
      break

    case "cancel_all_reminders":
      result = await executeCancelAllReminders(pending)
      break

    case "bulk_cancel_reminders":
      result = await executeBulkCancelReminders(pending)
      break

    default:
      result = {
        success: false,
        message: `Unknown confirmation type: ${pending.type}`,
      }
  }

  await clearPendingReminderConfirmation(userId, modality)

  logger.info(
    `${LOG_PREFIX} Executed ${pending.type} for user ${userId}: ${result.success ? "success" : "failed"}`
  )

  return result
}

/**
 * Execute create reminder action
 */
const executeCreateReminder = async (
  pending: PendingReminderConfirmation
): Promise<ReminderConfirmationResult> => {
  const { reminderInput } = pending.payload

  if (!reminderInput) {
    return {
      success: false,
      message: "Missing reminder data for creation.",
    }
  }

  const reminder = await createReminder(reminderInput)

  if (!reminder) {
    return {
      success: false,
      message: "Failed to create reminder. Please try again.",
    }
  }

  const userTimezone = await getUserTimezoneById(pending.userId)
  const formattedTime = formatDateInTimezone(
    reminder.scheduled_at,
    userTimezone
  )

  return {
    success: true,
    message: `Reminder set for ${formattedTime}: "${reminder.message}"`,
    reminder,
    affectedCount: 1,
  }
}

/**
 * Execute single reminder cancellation
 */
const executeCancelReminder = async (
  pending: PendingReminderConfirmation
): Promise<ReminderConfirmationResult> => {
  const { reminderIds } = pending.payload

  if (!reminderIds || reminderIds.length === 0) {
    return {
      success: false,
      message: "No reminder specified for cancellation.",
    }
  }

  const reminderId = reminderIds[0]
  const success = await cancelReminder(reminderId, pending.userId)

  if (!success) {
    return {
      success: false,
      message:
        "Failed to cancel reminder. It may have already been sent or cancelled.",
    }
  }

  return {
    success: true,
    message: "Reminder cancelled.",
    affectedCount: 1,
  }
}

/**
 * Execute cancel all reminders action
 */
const executeCancelAllReminders = async (
  pending: PendingReminderConfirmation
): Promise<ReminderConfirmationResult> => {
  const reminders = await getUserReminders(pending.userId, {
    status: "pending",
  })

  if (reminders.length === 0) {
    return {
      success: true,
      message: "No pending reminders to cancel.",
      affectedCount: 0,
    }
  }

  const errors: string[] = []
  let cancelledCount = 0

  for (const reminder of reminders) {
    const success = await cancelReminder(reminder.id, pending.userId)
    if (success) {
      cancelledCount++
    } else {
      errors.push(`Failed to cancel: ${reminder.message}`)
    }
  }

  return {
    success: errors.length === 0,
    message:
      cancelledCount > 0
        ? `Cancelled ${cancelledCount} reminder${cancelledCount !== 1 ? "s" : ""}.`
        : "No reminders were cancelled.",
    affectedCount: cancelledCount,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Execute bulk cancel reminders action
 */
const executeBulkCancelReminders = async (
  pending: PendingReminderConfirmation
): Promise<ReminderConfirmationResult> => {
  const { reminderIds } = pending.payload

  if (!reminderIds || reminderIds.length === 0) {
    return {
      success: false,
      message: "No reminders specified for cancellation.",
    }
  }

  const errors: string[] = []
  let cancelledCount = 0

  for (const reminderId of reminderIds) {
    const success = await cancelReminder(reminderId, pending.userId)
    if (success) {
      cancelledCount++
    } else {
      errors.push(`Failed to cancel reminder ${reminderId}`)
    }
  }

  return {
    success: errors.length === 0,
    message:
      cancelledCount > 0
        ? `Cancelled ${cancelledCount} reminder${cancelledCount !== 1 ? "s" : ""}.`
        : "No reminders were cancelled.",
    affectedCount: cancelledCount,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Format confirmation prompt for high-stakes actions
 */
export const formatReminderConfirmationPrompt = (
  type: ReminderConfirmationType,
  details: string
): string => {
  switch (type) {
    case "cancel_all_reminders":
      return `Are you sure you want to cancel all your pending reminders?\n\n${details}\n\nReply "yes" to confirm or "no" to cancel.`

    case "bulk_cancel_reminders":
      return `Are you sure you want to cancel these reminders?\n\n${details}\n\nReply "yes" to confirm or "no" to cancel.`

    case "create_reminder":
      return `${details}\n\nReply "yes" to confirm or "no" to cancel.`

    case "cancel_reminder":
      return `Cancel this reminder?\n\n${details}\n\nReply "yes" to confirm or "no" to cancel.`

    default:
      return `${details}\n\nReply "yes" to confirm or "no" to cancel.`
  }
}

/**
 * Determine if an action requires confirmation (high-stakes)
 * Simple creates and single cancels do NOT require confirmation
 */
export const requiresConfirmation = (
  type: ReminderConfirmationType,
  count = 1
): boolean => {
  if (type === "cancel_all_reminders") {
    return true
  }

  if (type === "bulk_cancel_reminders") {
    return count > 1
  }

  return false
}
