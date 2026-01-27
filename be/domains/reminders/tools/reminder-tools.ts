import { tool } from "@openai/agents"
import { getUserIdByEmail } from "@/domains/auth/utils/google-token"
import {
  type ReminderModality,
  storePendingReminderConfirmation,
} from "@/domains/reminders/services/reminder-confirmation"
import {
  cancelReminder,
  createReminder,
  type DeliveryChannel,
  getReminder,
  getUserReminders,
  type OriginModality,
} from "@/domains/reminders/services/reminder-service"
import { logger } from "@/lib/logger"
import {
  type AgentContext,
  type Modality,
  stringifyError,
} from "@/shared/types"
import {
  cancelAllRemindersSchema,
  cancelReminderSchema,
  createReminderSchema,
  getReminderSchema,
  listRemindersSchema,
} from "./reminder-schemas"

const DEFAULT_REMINDER_LIMIT = 20
const LOG_MESSAGE_PREVIEW_LENGTH = 50
const MS_PER_MINUTE = 60_000

function modalityToOrigin(modality?: Modality): OriginModality {
  switch (modality) {
    case "telegram":
      return "telegram"
    case "whatsapp":
      return "whatsapp"
    case "api":
      return "slack"
    default:
      return "web"
  }
}

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
    try {
      const email = runContext?.context?.email
      const modality = runContext?.context?.modality

      logger.debug("create_reminder called", {
        hasEmail: !!email,
        modality,
        scheduledAt: params.scheduledAt,
        message: params.message?.slice(0, LOG_MESSAGE_PREVIEW_LENGTH),
      })

      if (!email) {
        return {
          success: false,
          error: "Please link your account first to use reminders.",
        }
      }

      const userId = await getUserIdByEmail(email)
      if (!userId) {
        return { success: false, error: "User not found" }
      }

      const scheduledAt = new Date(params.scheduledAt)
      if (Number.isNaN(scheduledAt.getTime())) {
        logger.warn("create_reminder: Invalid scheduled time", {
          scheduledAt: params.scheduledAt,
        })
        return {
          success: false,
          error: `Could not parse the time "${params.scheduledAt}". Please provide a valid time like "in 5 minutes", "at 3pm", or "tomorrow at 9am".`,
        }
      }

      const now = new Date()
      if (scheduledAt <= now) {
        const timeDiff = now.getTime() - scheduledAt.getTime()
        const minutesAgo = Math.round(timeDiff / MS_PER_MINUTE)
        logger.warn("create_reminder: Time in past", {
          scheduledAt: scheduledAt.toISOString(),
          now: now.toISOString(),
          minutesAgo,
        })
        return {
          success: false,
          error: `That time has already passed (${minutesAgo} minute${minutesAgo !== 1 ? "s" : ""} ago). Please provide a future time.`,
        }
      }

      const originModality = modalityToOrigin(modality)

      const reminder = await createReminder({
        userId,
        message: params.message,
        scheduledAt,
        deliveryChannel: params.deliveryChannel as DeliveryChannel,
        originModality,
        eventId: params.relatedEventId ?? undefined,
      })

      if (!reminder) {
        logger.error("create_reminder: Database insert failed", { userId })
        return {
          success: false,
          error: "Could not save the reminder. Please try again in a moment.",
        }
      }

      logger.info("Reminder created successfully", {
        reminderId: reminder.id,
        userId,
        scheduledAt: reminder.scheduled_at,
        originModality,
      })

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
    } catch (err) {
      logger.error("create_reminder: Unexpected error", { error: err })
      return {
        success: false,
        error:
          "Something went wrong while creating your reminder. Please try again.",
      }
    }
  },
  errorFunction: () =>
    "Something went wrong while creating your reminder. Please try again.",
})

export const list_reminders = tool<typeof listRemindersSchema, AgentContext>({
  name: "list_reminders",
  description:
    "List the user's scheduled reminders. Can filter by status (pending, sent, failed, cancelled). " +
    "Use when user asks 'show my reminders', 'what reminders do I have', or 'list pending reminders'.",
  parameters: listRemindersSchema,
  execute: async (params, runContext) => {
    try {
      const email = runContext?.context?.email
      if (!email) {
        return {
          success: false,
          error: "Please link your account first to use reminders.",
          reminders: [],
        }
      }

      const userId = await getUserIdByEmail(email)
      if (!userId) {
        return { success: false, error: "User not found", reminders: [] }
      }

      const reminders = await getUserReminders(userId, {
        status: params.status ?? undefined,
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
    } catch (err) {
      return { success: false, error: stringifyError(err), reminders: [] }
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
    try {
      const email = runContext?.context?.email
      if (!email) {
        return {
          success: false,
          error: "Please link your account first to use reminders.",
        }
      }

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
    } catch (err) {
      return { success: false, error: stringifyError(err) }
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
    try {
      const email = runContext?.context?.email
      if (!email) {
        return {
          success: false,
          error: "Please link your account first to use reminders.",
        }
      }

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
    } catch (err) {
      return { success: false, error: stringifyError(err) }
    }
  },
  errorFunction: (_, error) => `get_reminder: ${stringifyError(error)}`,
})

function modalityToReminderModality(modality?: Modality): ReminderModality {
  switch (modality) {
    case "telegram":
      return "telegram"
    case "whatsapp":
      return "whatsapp"
    case "api":
      return "slack"
    default:
      return "web"
  }
}

export const cancel_all_reminders = tool<
  typeof cancelAllRemindersSchema,
  AgentContext
>({
  name: "cancel_all_reminders",
  description:
    "Cancel ALL pending reminders for the user. This is a high-stakes action. " +
    "First call with confirm=false to get a list of reminders that will be cancelled. " +
    "Then call with confirm=true to actually cancel them after user confirms. " +
    "Use when user says 'cancel all my reminders' or 'delete all reminders'.",
  parameters: cancelAllRemindersSchema,
  execute: async (params, runContext) => {
    try {
      const email = runContext?.context?.email
      const modality = runContext?.context?.modality

      if (!email) {
        return {
          success: false,
          error: "Please link your account first to use reminders.",
        }
      }

      const userId = await getUserIdByEmail(email)
      if (!userId) {
        return { success: false, error: "User not found" }
      }

      const pendingReminders = await getUserReminders(userId, {
        status: "pending",
      })

      if (pendingReminders.length === 0) {
        return {
          success: true,
          message: "You have no pending reminders to cancel.",
          cancelledCount: 0,
        }
      }

      if (!params.confirm) {
        const reminderModality = modalityToReminderModality(modality)
        const reminderList = pendingReminders
          .map(
            (r) =>
              `• "${r.message}" - ${new Date(r.scheduled_at).toLocaleString()}`
          )
          .join("\n")

        await storePendingReminderConfirmation(
          userId,
          reminderModality,
          "cancel_all_reminders",
          {
            reminderIds: pendingReminders.map((r) => r.id),
            actionDescription: `${pendingReminders.length} reminder(s):\n${reminderList}`,
          }
        )

        return {
          success: true,
          needsConfirmation: true,
          message: `You have ${pendingReminders.length} pending reminder(s) that will be cancelled:\n\n${reminderList}\n\nReply "yes" to confirm or "no" to cancel.`,
          reminderCount: pendingReminders.length,
        }
      }

      let cancelledCount = 0
      const errors: string[] = []

      for (const reminder of pendingReminders) {
        const success = await cancelReminder(reminder.id, userId)
        if (success) {
          cancelledCount++
        } else {
          errors.push(`Failed to cancel: "${reminder.message}"`)
        }
      }

      logger.info("cancel_all_reminders completed", {
        userId,
        cancelledCount,
        errorCount: errors.length,
      })

      if (errors.length > 0) {
        return {
          success: false,
          message: `Cancelled ${cancelledCount} reminder(s), but some failed.`,
          cancelledCount,
          errors,
        }
      }

      return {
        success: true,
        message: `Successfully cancelled ${cancelledCount} reminder(s).`,
        cancelledCount,
      }
    } catch (err) {
      logger.error("cancel_all_reminders: Unexpected error", { error: err })
      return { success: false, error: stringifyError(err) }
    }
  },
  errorFunction: (_, error) => `cancel_all_reminders: ${stringifyError(error)}`,
})

export const REMINDER_TOOLS = {
  create_reminder,
  list_reminders,
  cancel_reminder,
  cancel_all_reminders,
  get_reminder,
}
