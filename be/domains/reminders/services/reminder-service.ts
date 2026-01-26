import { SUPABASE } from "@/infrastructure/supabase/supabase"
import { logger } from "@/lib/logger"
import type { Json } from "@/database.types"

export type DeliveryChannel =
  | "telegram"
  | "whatsapp"
  | "slack"
  | "email"
  | "push"
  | "origin"

export type OriginModality = "web" | "telegram" | "whatsapp" | "slack"

export type ReminderStatus = "pending" | "sent" | "failed" | "cancelled"

export type ScheduledReminder = {
  id: string
  user_id: string
  message: string
  scheduled_at: string
  delivery_channel: DeliveryChannel
  origin_modality: OriginModality
  status: ReminderStatus
  sent_at: string | null
  error_message: string | null
  related_event_id: string | null
  metadata: Json
  created_at: string
  updated_at: string
}

export type CreateReminderInput = {
  userId: string
  message: string
  scheduledAt: Date
  deliveryChannel: DeliveryChannel
  originModality: OriginModality
  eventId?: string
  metadata?: Json
}

export type UpdateReminderInput = {
  message?: string
  scheduledAt?: Date
  deliveryChannel?: DeliveryChannel
  status?: ReminderStatus
}

export type GetRemindersOptions = {
  status?: ReminderStatus
  limit?: number
  offset?: number
}

const DEFAULT_LIMIT = 50
const DEFAULT_OFFSET = 0

export async function createReminder(
  input: CreateReminderInput
): Promise<ScheduledReminder | null> {
  const { data, error } = await SUPABASE.from("scheduled_reminders")
    .insert({
      user_id: input.userId,
      message: input.message,
      scheduled_at: input.scheduledAt.toISOString(),
      delivery_channel: input.deliveryChannel,
      origin_modality: input.originModality,
      related_event_id: input.eventId ?? null,
      metadata: input.metadata ?? null,
    })
    .select()
    .single()

  if (error) {
    logger.error("Failed to create reminder:", error)
    return null
  }

  return data as ScheduledReminder
}

export async function getReminder(
  reminderId: string,
  userId: string
): Promise<ScheduledReminder | null> {
  const { data, error } = await SUPABASE.from("scheduled_reminders")
    .select("*")
    .eq("id", reminderId)
    .eq("user_id", userId)
    .single()

  if (error) {
    logger.error("Failed to get reminder:", error)
    return null
  }

  return data as ScheduledReminder
}

export async function getUserReminders(
  userId: string,
  options: GetRemindersOptions = {}
): Promise<ScheduledReminder[]> {
  let query = SUPABASE.from("scheduled_reminders")
    .select("*")
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: true })

  if (options.status) {
    query = query.eq("status", options.status)
  }

  query = query
    .limit(options.limit ?? DEFAULT_LIMIT)
    .range(
      options.offset ?? DEFAULT_OFFSET,
      (options.offset ?? DEFAULT_OFFSET) + (options.limit ?? DEFAULT_LIMIT) - 1
    )

  const { data, error } = await query

  if (error) {
    logger.error("Failed to get user reminders:", error)
    return []
  }

  return (data ?? []) as ScheduledReminder[]
}

export async function updateReminder(
  reminderId: string,
  userId: string,
  updates: UpdateReminderInput
): Promise<ScheduledReminder | null> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.message !== undefined) {
    updateData.message = updates.message
  }
  if (updates.scheduledAt !== undefined) {
    updateData.scheduled_at = updates.scheduledAt.toISOString()
  }
  if (updates.deliveryChannel !== undefined) {
    updateData.delivery_channel = updates.deliveryChannel
  }
  if (updates.status !== undefined) {
    updateData.status = updates.status
  }

  const { data, error } = await SUPABASE.from("scheduled_reminders")
    .update(updateData)
    .eq("id", reminderId)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    logger.error("Failed to update reminder:", error)
    return null
  }

  return data as ScheduledReminder
}

export async function cancelReminder(
  reminderId: string,
  userId: string
): Promise<boolean> {
  const { error } = await SUPABASE.from("scheduled_reminders")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", reminderId)
    .eq("user_id", userId)
    .eq("status", "pending")

  if (error) {
    logger.error("Failed to cancel reminder:", error)
    return false
  }

  return true
}

export async function getPendingRemindersInWindow(
  windowStart: Date,
  windowEnd: Date
): Promise<ScheduledReminder[]> {
  const { data, error } = await SUPABASE.from("scheduled_reminders")
    .select("*")
    .eq("status", "pending")
    .gte("scheduled_at", windowStart.toISOString())
    .lte("scheduled_at", windowEnd.toISOString())
    .order("scheduled_at", { ascending: true })

  if (error) {
    logger.error("Failed to get pending reminders in window:", error)
    return []
  }

  return (data ?? []) as ScheduledReminder[]
}

export async function markReminderSent(reminderId: string): Promise<boolean> {
  const { error } = await SUPABASE.from("scheduled_reminders")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reminderId)

  if (error) {
    logger.error("Failed to mark reminder as sent:", error)
    return false
  }

  return true
}

export async function markReminderFailed(
  reminderId: string,
  errorMessage: string
): Promise<boolean> {
  const { error } = await SUPABASE.from("scheduled_reminders")
    .update({
      status: "failed",
      error_message: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reminderId)

  if (error) {
    logger.error("Failed to mark reminder as failed:", error)
    return false
  }

  return true
}
