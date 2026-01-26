import { tool } from "@openai/agents"
import { getUserIdByEmail } from "@/domains/auth/utils/google-token"
import {
  cancelReminder,
  createReminder,
  type DeliveryChannel,
  getReminder,
  getUserReminders,
  type OriginModality,
} from "@/domains/reminders/services/reminder-service"
import { getEmailFromContext } from "@/shared/adapters/openai-adapter"
import { type AgentContext, stringifyError } from "@/shared/types"
import {
  cancelReminderSchema,
  createReminderSchema,
  getReminderSchema,
  listRemindersSchema,
} from "./reminder-schemas"

const DEFAULT_REMINDER_LIMIT = 20

export const create_reminder = tool<typeof createReminderSchema, AgentContext>({
  name: "create_reminder",
  description:
    "Create a scheduled reminder that will be delivered to the user at a specific time. " +
    "Use when user says things like 'remind me at 5pm to call mom', " +
    "'set a reminder for tomorrow at 9am', or 'remind me in 2 hours about the meeting'. " +
    "The reminder message should be clear and actionable. " +
    "Parse relative times (e.g., 'in 2 hours', 'tomorrow at 3pm') using the user's timezone.",
  parameters: createReminderSchema,
  execute: async (params, runContext) => {
    const email = getEmailFromContext(runContext, "create_reminder")
    const userId = await getUserIdByEmail(email)

    if (!userId) {
      return { success: false, error: "User not found" }
    }

    const scheduledAt = new Date(params.scheduledAt)
    if (Number.isNaN(scheduledAt.getTime())) {
      return { success: false, error: "Invalid scheduled time format" }
    }

    if (scheduledAt <= new Date()) {
      return { success: false, error: "Scheduled time must be in the future" }
    }

    const reminder = await createReminder({
      userId,
      message: params.message,
      scheduledAt,
      deliveryChannel: params.deliveryChannel as DeliveryChannel,
      originModality: "web" as OriginModality,
      eventId: params.relatedEventId,
    })

    if (!reminder) {
      return { success: false, error: "Failed to create reminder" }
    }

    return {
      success: true,
      reminder: {
        id: reminder.id,
        message: reminder.message,
        scheduledAt: reminder.scheduled_at,
        deliveryChannel: reminder.delivery_channel,
        status: reminder.status,
      },
      confirmationMessage: `Reminder set for ${scheduledAt.toLocaleString()}: "${params.message}"`,
    }
  },
  errorFunction: (_, error) => `create_reminder: ${stringifyError(error)}`,
})

export const list_reminders = tool<typeof listRemindersSchema, AgentContext>({
  name: "list_reminders",
  description:
    "List the user's scheduled reminders. Can filter by status (pending, sent, failed, cancelled). " +
    "Use when user asks 'show my reminders', 'what reminders do I have', or 'list pending reminders'.",
  parameters: listRemindersSchema,
  execute: async (params, runContext) => {
    const email = getEmailFromContext(runContext, "list_reminders")
    const userId = await getUserIdByEmail(email)

    if (!userId) {
      return { success: false, error: "User not found", reminders: [] }
    }

    const reminders = await getUserReminders(userId, {
      status: params.status,
      limit: params.limit ?? DEFAULT_REMINDER_LIMIT,
    })

    return {
      success: true,
      reminders: reminders.map((r) => ({
        id: r.id,
        message: r.message,
        scheduledAt: r.scheduled_at,
        deliveryChannel: r.delivery_channel,
        status: r.status,
        sentAt: r.sent_at,
      })),
      count: reminders.length,
    }
  },
  errorFunction: (_, error) => `list_reminders: ${stringifyError(error)}`,
})

export const cancel_reminder = tool<typeof cancelReminderSchema, AgentContext>({
  name: "cancel_reminder",
  description:
    "Cancel a pending reminder by its ID. Only pending reminders can be cancelled. " +
    "Use when user says 'cancel reminder [id]' or 'remove that reminder'.",
  parameters: cancelReminderSchema,
  execute: async (params, runContext) => {
    const email = getEmailFromContext(runContext, "cancel_reminder")
    const userId = await getUserIdByEmail(email)

    if (!userId) {
      return { success: false, error: "User not found" }
    }

    const success = await cancelReminder(params.reminderId, userId)

    if (!success) {
      return {
        success: false,
        error:
          "Failed to cancel reminder. It may not exist, already been sent, or already cancelled.",
      }
    }

    return {
      success: true,
      message: `Reminder ${params.reminderId} has been cancelled.`,
    }
  },
  errorFunction: (_, error) => `cancel_reminder: ${stringifyError(error)}`,
})

export const get_reminder = tool<typeof getReminderSchema, AgentContext>({
  name: "get_reminder",
  description:
    "Get details of a specific reminder by its ID. " +
    "Use when user wants to see details about a particular reminder.",
  parameters: getReminderSchema,
  execute: async (params, runContext) => {
    const email = getEmailFromContext(runContext, "get_reminder")
    const userId = await getUserIdByEmail(email)

    if (!userId) {
      return { success: false, error: "User not found" }
    }

    const reminder = await getReminder(params.reminderId, userId)

    if (!reminder) {
      return { success: false, error: "Reminder not found" }
    }

    return {
      success: true,
      reminder: {
        id: reminder.id,
        message: reminder.message,
        scheduledAt: reminder.scheduled_at,
        deliveryChannel: reminder.delivery_channel,
        status: reminder.status,
        sentAt: reminder.sent_at,
        errorMessage: reminder.error_message,
        relatedEventId: reminder.related_event_id,
        createdAt: reminder.created_at,
      },
    }
  },
  errorFunction: (_, error) => `get_reminder: ${stringifyError(error)}`,
})

export const REMINDER_TOOLS = {
  create_reminder,
  list_reminders,
  cancel_reminder,
  get_reminder,
}
