import { render } from "@react-email/components"
import { Resend } from "resend"
import {
  emitToUser,
  env,
  isUserConnected,
  type NotificationPayload,
  SUPABASE,
} from "@/config"
import { WelcomeEmail } from "@/emails/WelcomeEmail"
import { getBot } from "@/telegram-bot/init-bot"
import {
  getNotificationSettingsPreference,
  PREFERENCE_DEFAULTS,
  type NotificationChannel,
  type NotificationSettingsPreference,
} from "@/services/user-preferences-service"
import { userRepository } from "@/utils/repositories/UserRepository"
import { logger } from "@/utils/logger"

const resend = new Resend(env.resend.apiKey)

export type EventNotificationData = {
  summary: string
  start: string
  end: string
  location?: string
  calendarId: string
  htmlLink?: string
}

export type NotificationResult = {
  success: boolean
  channelsAttempted: NotificationChannel[]
  channelsSucceeded: NotificationChannel[]
  errors: Array<{ channel: NotificationChannel; error: string }>
}

type ChannelIdentifiers = {
  email: string
  userId: string
  telegramChatId?: number
}

async function getChannelIdentifiers(
  userId: string
): Promise<ChannelIdentifiers | null> {
  const { data: user, error: userError } = await SUPABASE.from("users")
    .select("id, email")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    logger.error(`[NotificationDispatcher] Failed to fetch user ${userId}:`, userError)
    return null
  }

  const { data: telegramUser } = await SUPABASE.from("telegram_users")
    .select("telegram_chat_id")
    .eq("user_id", userId)
    .single()

  return {
    email: user.email,
    userId: user.id,
    telegramChatId: telegramUser?.telegram_chat_id ?? undefined,
  }
}

function formatEventTime(dateTimeString: string): string {
  try {
    const date = new Date(dateTimeString)
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    return dateTimeString
  }
}

function formatEventConfirmationEmail(
  event: EventNotificationData,
  action: "created" | "updated"
): { subject: string; html: string; text: string } {
  const actionVerb = action === "created" ? "Created" : "Updated"
  const emoji = action === "created" ? "✅" : "📝"

  const subject = `${emoji} Event ${actionVerb}: ${event.summary}`

  const locationHtml = event.location
    ? `<p><strong>📍 Location:</strong> ${event.location}</p>`
    : ""
  const locationText = event.location ? `📍 Location: ${event.location}\n` : ""

  const linkHtml = event.htmlLink
    ? `<p><a href="${event.htmlLink}" style="color: #4285f4;">View in Google Calendar →</a></p>`
    : ""
  const linkText = event.htmlLink ? `\nView in Google Calendar: ${event.htmlLink}` : ""

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a; margin-bottom: 20px;">${emoji} Event ${actionVerb}</h2>
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 16px 0; color: #1a1a1a;">${event.summary}</h3>
        <p><strong>🕐 Start:</strong> ${formatEventTime(event.start)}</p>
        <p><strong>🕐 End:</strong> ${formatEventTime(event.end)}</p>
        ${locationHtml}
        <p><strong>📅 Calendar:</strong> ${event.calendarId}</p>
      </div>
      ${linkHtml}
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        You're receiving this because you have event confirmations enabled in Ask Ally.
      </p>
    </div>
  `

  const text = `${emoji} Event ${actionVerb}

📌 ${event.summary}
🕐 Start: ${formatEventTime(event.start)}
🕐 End: ${formatEventTime(event.end)}
${locationText}📅 Calendar: ${event.calendarId}
${linkText}

You're receiving this because you have event confirmations enabled in Ask Ally.`

  return { subject, html, text }
}

function formatEventConfirmationTelegram(
  event: EventNotificationData,
  action: "created" | "updated"
): string {
  const actionVerb = action === "created" ? "Created" : "Updated"
  const emoji = action === "created" ? "✅" : "📝"

  const location = event.location ? `\n📍 ${event.location}` : ""

  return `${emoji} <b>Event ${actionVerb}</b>

📌 ${event.summary}
🕐 ${formatEventTime(event.start)} - ${formatEventTime(event.end)}${location}
📅 ${event.calendarId}`
}

function formatConflictAlertEmail(
  event: EventNotificationData,
  conflicts: EventNotificationData[]
): { subject: string; html: string; text: string } {
  const subject = `⚠️ Scheduling Conflict: ${event.summary}`

  const conflictListHtml = conflicts
    .map(
      (c) =>
        `<li><strong>${c.summary}</strong> - ${formatEventTime(c.start)}</li>`
    )
    .join("")

  const conflictListText = conflicts
    .map((c) => `• ${c.summary} - ${formatEventTime(c.start)}`)
    .join("\n")

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d93025; margin-bottom: 20px;">⚠️ Scheduling Conflict Detected</h2>
      <div style="background: #fef7e0; border: 1px solid #f9ab00; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 16px 0; color: #1a1a1a;">New Event: ${event.summary}</h3>
        <p><strong>🕐 Time:</strong> ${formatEventTime(event.start)} - ${formatEventTime(event.end)}</p>
      </div>
      <h4 style="color: #1a1a1a;">Conflicts with:</h4>
      <ul style="padding-left: 20px;">
        ${conflictListHtml}
      </ul>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        You're receiving this because you have conflict alerts enabled in Ask Ally.
      </p>
    </div>
  `

  const text = `⚠️ Scheduling Conflict Detected

New Event: ${event.summary}
🕐 Time: ${formatEventTime(event.start)} - ${formatEventTime(event.end)}

Conflicts with:
${conflictListText}

You're receiving this because you have conflict alerts enabled in Ask Ally.`

  return { subject, html, text }
}

function formatConflictAlertTelegram(
  event: EventNotificationData,
  conflicts: EventNotificationData[]
): string {
  const conflictList = conflicts
    .map((c) => `• ${c.summary} - ${formatEventTime(c.start)}`)
    .join("\n")

  return `⚠️ <b>Scheduling Conflict</b>

📌 ${event.summary}
🕐 ${formatEventTime(event.start)} - ${formatEventTime(event.end)}

<b>Conflicts with:</b>
${conflictList}`
}

async function sendEmail(
  email: string,
  content: { subject: string; html: string; text: string }
): Promise<{ success: boolean; error?: string }> {
  if (!env.resend.isEnabled) {
    return { success: false, error: "Email service not configured" }
  }

  try {
    const { error } = await resend.emails.send({
      from: env.resend.fromEmail,
      to: email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    })

    if (error) {
      logger.error(`[NotificationDispatcher] Email failed for ${email}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error"
    logger.error(`[NotificationDispatcher] Email error for ${email}:`, error)
    return { success: false, error: errMsg }
  }
}

async function sendTelegram(
  chatId: number,
  telegramMessage: string
): Promise<{ success: boolean; error?: string }> {
  const bot = getBot()

  if (!bot) {
    return { success: false, error: "Telegram bot not initialized" }
  }

  try {
    await bot.api.sendMessage(chatId, telegramMessage, { parse_mode: "HTML" })
    return { success: true }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error"

    if (errMsg.includes("Forbidden") || errMsg.includes("blocked")) {
      logger.warn(`[NotificationDispatcher] User blocked bot (chat: ${chatId})`)
      return { success: false, error: "User blocked bot" }
    }

    logger.error(`[NotificationDispatcher] Telegram failed for chat ${chatId}:`, error)
    return { success: false, error: errMsg }
  }
}

type PushOptions = {
  userId: string
  notificationType: NotificationPayload["type"]
  title: string
  body: string
  eventData?: EventNotificationData
}

function sendPush(options: PushOptions): { success: boolean; error?: string } {
  const { userId, notificationType, title, body, eventData } = options

  if (!isUserConnected(userId)) {
    logger.debug(`[NotificationDispatcher] User ${userId} not connected via WebSocket`)
    return { success: false, error: "User not connected" }
  }

  const payload: NotificationPayload = {
    type: notificationType,
    title,
    message: body,
    data: eventData ? { event: eventData } : undefined,
    timestamp: new Date().toISOString(),
  }

  const sent = emitToUser(userId, "notification", payload)

  if (sent) {
    logger.debug(`[NotificationDispatcher] Push notification sent to user ${userId}`)
    return { success: true }
  }

  return { success: false, error: "Failed to emit notification" }
}

type DispatchContent = {
  email: { subject: string; html: string; text: string }
  telegram: string
  push: {
    title: string
    body: string
    notificationType: NotificationPayload["type"]
    eventData?: EventNotificationData
  }
}

async function sendToEmail(
  email: string,
  content: { subject: string; html: string; text: string },
  result: NotificationResult
): Promise<void> {
  const sendResult = await sendEmail(email, content)
  if (sendResult.success) {
    result.channelsSucceeded.push("email")
  } else {
    result.errors.push({ channel: "email", error: sendResult.error || "Unknown error" })
  }
}

async function sendToTelegram(
  chatId: number | undefined,
  content: string,
  result: NotificationResult
): Promise<void> {
  if (!chatId) {
    result.errors.push({ channel: "telegram", error: "Telegram not linked" })
    return
  }
  const sendResult = await sendTelegram(chatId, content)
  if (sendResult.success) {
    result.channelsSucceeded.push("telegram")
  } else {
    result.errors.push({ channel: "telegram", error: sendResult.error || "Unknown error" })
  }
}

function sendToPush(
  userId: string,
  content: DispatchContent["push"],
  result: NotificationResult
): void {
  const sendResult = sendPush({
    userId,
    notificationType: content.notificationType,
    title: content.title,
    body: content.body,
    eventData: content.eventData,
  })
  if (sendResult.success) {
    result.channelsSucceeded.push("push")
  } else {
    result.errors.push({ channel: "push", error: sendResult.error || "Unknown error" })
  }
}

async function dispatchToChannels(
  channels: NotificationChannel[],
  identifiers: ChannelIdentifiers,
  content: DispatchContent,
  result: NotificationResult
): Promise<void> {
  for (const channel of channels) {
    result.channelsAttempted.push(channel)

    if (channel === "email") {
      await sendToEmail(identifiers.email, content.email, result)
    } else if (channel === "telegram") {
      await sendToTelegram(identifiers.telegramChatId, content.telegram, result)
    } else if (channel === "push") {
      sendToPush(identifiers.userId, content.push, result)
    }
  }
}

export async function dispatchEventConfirmation(
  userEmail: string,
  event: EventNotificationData,
  action: "created" | "updated"
): Promise<NotificationResult> {
  const result: NotificationResult = {
    success: false,
    channelsAttempted: [],
    channelsSucceeded: [],
    errors: [],
  }

  try {
    const userId = await userRepository.findUserIdByEmail(userEmail)
    if (!userId) {
      logger.warn(`[NotificationDispatcher] User not found for email: ${userEmail}`)
  return result
}

    const settings = await getNotificationSettingsPreference(userId)
    const channels =
      settings?.conflictAlerts ??
      (PREFERENCE_DEFAULTS.notification_settings as NotificationSettingsPreference).conflictAlerts

    if (channels.length === 0) {
      logger.debug("[NotificationDispatcher] No channels configured for conflictAlerts")
      result.success = true
      return result
    }

    const identifiers = await getChannelIdentifiers(userId)
    if (!identifiers) {
      result.errors.push({ channel: "email", error: "Failed to fetch user identifiers" })
      return result
    }

    const content: DispatchContent = {
      email: formatConflictAlertEmail(event, conflicts),
      telegram: formatConflictAlertTelegram(event, conflicts),
      push: {
        title: "Scheduling Conflict",
        body: `${event.summary} conflicts with ${conflicts.length} event(s)`,
        notificationType: "conflict_alert",
        eventData: event,
      },
    }

    await dispatchToChannels(channels, identifiers, content, result)

    result.success = result.channelsSucceeded.length > 0 || channels.length === 0
    logger.info(
      `[NotificationDispatcher] Conflict alert dispatched: ${result.channelsSucceeded.length}/${result.channelsAttempted.length} channels succeeded`
    )
  } catch (error) {
    logger.error("[NotificationDispatcher] dispatchConflictAlert error:", error)
    result.errors.push({
      channel: "email",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }

  return result
}

export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  if (!env.resend.isEnabled) {
    logger.debug("[NotificationDispatcher] Email service not configured, skipping welcome email")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const dashboardUrl = `${env.urls.frontend}/dashboard`
    const docsUrl = `${env.urls.frontend}/docs`
    const supportUrl = `${env.urls.frontend}/support`

    const html = await render(
      WelcomeEmail({
        userName,
        dashboardUrl,
        docsUrl,
        supportUrl,
      })
    )

    const { error } = await resend.emails.send({
      from: env.resend.fromEmail,
      to: email,
      subject: "Welcome to Ally - Your AI Calendar Assistant is Ready!",
      html,
    })

    if (error) {
      logger.error(`[NotificationDispatcher] Welcome email failed for ${email}:`, error)
      return { success: false, error: error.message }
    }

    logger.info(`[NotificationDispatcher] Welcome email sent to ${email}`)
    return { success: true }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error"
    logger.error(`[NotificationDispatcher] Welcome email error for ${email}:`, error)
    return { success: false, error: errMsg }
  }
}

  try {
    const dashboardUrl = `${env.urls.frontend}/dashboard`
    const docsUrl = `${env.urls.frontend}/docs`
    const supportUrl = `${env.urls.frontend}/support`

    const html = await render(
      WelcomeEmail({
        userName,
        dashboardUrl,
        docsUrl,
        supportUrl,
      })
    )

    const { error } = await resend.emails.send({
      from: env.resend.fromEmail,
      to: email,
      subject: "Welcome to Ally - Your AI Calendar Assistant is Ready!",
      html,
    })

    if (error) {
      logger.error(`[NotificationDispatcher] Welcome email failed for ${email}:`, error)
      return { success: false, error: error.message }
    }

    logger.info(`[NotificationDispatcher] Welcome email sent to ${email}`)
    return { success: true }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error"
    logger.error(`[NotificationDispatcher] Welcome email error for ${email}:`, error)
    return { success: false, error: errMsg }
  }
}


    const identifiers = await getChannelIdentifiers(userId)
    if (!identifiers) {
      result.errors.push({ channel: "email", error: "Failed to fetch user identifiers" })
      return result
    }

    const content: DispatchContent = {
      email: formatEventConfirmationEmail(event, action),
      telegram: formatEventConfirmationTelegram(event, action),
      push: {
        title: action === "created" ? "Event Created" : "Event Updated",
        body: event.summary,
        notificationType: action === "created" ? "event_created" : "event_updated",
        eventData: event,
      },
    }

    await dispatchToChannels(channels, identifiers, content, result)

    result.success = result.channelsSucceeded.length > 0 || channels.length === 0
    logger.info(
      `[NotificationDispatcher] Event confirmation dispatched: ${result.channelsSucceeded.length}/${result.channelsAttempted.length} channels succeeded`
    )
  } catch (error) {
    logger.error("[NotificationDispatcher] dispatchEventConfirmation error:", error)
    result.errors.push({
      channel: "email",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }

  return result
}

export async function dispatchConflictAlert(
  userEmail: string,
  event: EventNotificationData,
  conflicts: EventNotificationData[]
): Promise<NotificationResult> {
  const result: NotificationResult = {
    success: false,
    channelsAttempted: [],
    channelsSucceeded: [],
    errors: [],
  }

  try {
    const userId = await userRepository.findUserIdByEmail(userEmail)
    if (!userId) {
      logger.warn(`[NotificationDispatcher] User not found for email: ${userEmail}`)
      return result
    }

    const settings = await getNotificationSettingsPreference(userId)
    const channels =
      settings?.conflictAlerts ??
      (PREFERENCE_DEFAULTS.notification_settings as NotificationSettingsPreference).conflictAlerts

    if (channels.length === 0) {
      logger.debug("[NotificationDispatcher] No channels configured for conflictAlerts")
      result.success = true
      return result
    }

    const identifiers = await getChannelIdentifiers(userId)
    if (!identifiers) {
      result.errors.push({ channel: "email", error: "Failed to fetch user identifiers" })
      return result
    }

    const content: DispatchContent = {
      email: formatConflictAlertEmail(event, conflicts),
      telegram: formatConflictAlertTelegram(event, conflicts),
      push: {
        title: "Scheduling Conflict",
        body: `${event.summary} conflicts with ${conflicts.length} event(s)`,
        notificationType: "conflict_alert",
        eventData: event,
      },
    }

    await dispatchToChannels(channels, identifiers, content, result)

    result.success = result.channelsSucceeded.length > 0 || channels.length === 0
    logger.info(
      `[NotificationDispatcher] Conflict alert dispatched: ${result.channelsSucceeded.length}/${result.channelsAttempted.length} channels succeeded`
    )
  } catch (error) {
    logger.error("[NotificationDispatcher] dispatchConflictAlert error:", error)
    result.errors.push({
      channel: "email",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }

  return result
}
