import { InputGuardrailTripwireTriggered } from "@openai/agents"
import { ORCHESTRATOR_AGENT } from "@/ai-agents/agents"
import { runDPO } from "@/ai-agents/dpo"
import { activateAgent } from "@/domains/analytics/utils"
import { checkUserAccess } from "@/domains/payments/services/lemonsqueezy-service"
import { logger } from "@/lib/logger"
import { unifiedContextStore } from "@/shared/context"
import { getTranslatorFromLanguageCode } from "../i18n/translator"
import {
  sendButtonMessage as sendInteractiveButtons,
  sendListMessage as sendInteractiveList,
  sendTextMessage,
} from "../services/send-message"
import {
  type AllyBrainPreference,
  getAllyBrainForWhatsApp,
  getLanguagePreferenceForWhatsApp,
  updateAllyBrainForWhatsApp,
  updateLanguagePreferenceForWhatsApp,
} from "./ally-brain"
import {
  getUserIdFromWhatsApp,
  whatsAppConversation,
} from "./conversation-history"
import { getRelevantContext, storeEmbeddingAsync } from "./embeddings"
import { htmlToWhatsApp } from "./format-response"
import { buildAgentPromptWithContext, summarizeMessages } from "./prompts"

const SESSION_TTL_MINUTES = 10
const SECONDS_PER_MINUTE = 60
const MS_PER_SECOND = 1000
const SESSION_TTL_MS = SESSION_TTL_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND
const COMMAND_PREFIX_REGEX = /^\//
const WHITESPACE_SPLIT_REGEX = /\s+/

const pendingSessions = new Map<
  string,
  {
    state: "awaiting_brain_instructions" | "awaiting_language"
    timestamp: number
  }
>()

const cleanupSessions = (): void => {
  const now = Date.now()
  for (const [phone, session] of pendingSessions.entries()) {
    if (now - session.timestamp > SESSION_TTL_MS) {
      pendingSessions.delete(phone)
    }
  }
}

export type CommandContext = {
  from: string
  email?: string
  contactName?: string
}

export type CommandResult = {
  handled: boolean
  response?: string
}

const AGENT_COMMANDS: Record<string, { prompt: string; description: string }> =
  {
    today: {
      prompt:
        "Show me my calendar events for today. Give a concise summary with times and event names.",
      description: "Today's schedule",
    },
    tomorrow: {
      prompt:
        "Show me my calendar events for tomorrow. Give a concise summary with times and event names.",
      description: "Tomorrow's agenda",
    },
    week: {
      prompt:
        "Give me an overview of my calendar for the next 7 days. Summarize by day.",
      description: "Week at a glance",
    },
    month: {
      prompt:
        "Show my calendar overview for this month. Highlight busy days and key events.",
      description: "Monthly overview",
    },
    free: {
      prompt:
        "Find my available free time slots today and tomorrow. Show when I'm available for meetings.",
      description: "Find open slots",
    },
    busy: {
      prompt:
        "Show when I'm busy today and tomorrow. List my commitments and booked time.",
      description: "View commitments",
    },
    analytics: {
      prompt:
        "Give me insights about how I spend my time this week. Show meeting time vs focus time.",
      description: "Time insights",
    },
    calendars: {
      prompt: "Show me all my connected calendars with their names and colors.",
      description: "Your calendars",
    },
    status: {
      prompt:
        "Check my Google Calendar connection status and show my account email.",
      description: "Connection status",
    },
  }

const SIMPLE_COMMANDS = [
  "help",
  "start",
  "create",
  "update",
  "delete",
  "search",
  "quick",
  "cancel",
  "remind",
  "brain",
  "settings",
  "language",
  "feedback",
  "website",
  "exit",
  "aboutme",
  "subscription",
]

export const parseCommand = (
  text: string
): { command: string; args: string } | null => {
  const trimmed = text.trim().toLowerCase()

  if (COMMAND_PREFIX_REGEX.test(trimmed)) {
    const parts = text.trim().slice(1).split(WHITESPACE_SPLIT_REGEX)
    return { command: parts[0].toLowerCase(), args: parts.slice(1).join(" ") }
  }

  const firstWord = trimmed.split(WHITESPACE_SPLIT_REGEX)[0]
  if (AGENT_COMMANDS[firstWord] || SIMPLE_COMMANDS.includes(firstWord)) {
    const parts = text.trim().split(WHITESPACE_SPLIT_REGEX)
    return { command: parts[0].toLowerCase(), args: parts.slice(1).join(" ") }
  }

  return null
}

export const handleCommand = async (
  command: string,
  args: string,
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  const session = pendingSessions.get(from)
  if (session) {
    return handleSessionState(session.state, args, ctx)
  }

  if (AGENT_COMMANDS[command]) {
    return handleAgentCommand(command, ctx)
  }

  switch (command) {
    case "help":
      return await handleHelpCommand(ctx)
    case "start":
      return await handleStartCommand(ctx)
    case "create":
      return await handleCreateCommand(ctx)
    case "update":
      return await handleUpdateCommand(ctx)
    case "delete":
      return await handleDeleteCommand(ctx)
    case "search":
      return await handleSearchCommand(ctx)
    case "quick":
      return await handleQuickCommand(ctx)
    case "cancel":
      return await handleCancelCommand(ctx)
    case "remind":
      return await handleRemindCommand(ctx)
    case "brain":
      return await handleBrainCommand(ctx)
    case "settings":
      return await handleSettingsCommand(ctx)
    case "language":
      return await handleLanguageCommand(ctx)
    case "feedback":
      return await handleFeedbackCommand(args, ctx)
    case "website":
      return await handleWebsiteCommand(ctx)
    case "exit":
      return await handleExitCommand(ctx)
    case "aboutme":
      return await handleAboutMeCommand(ctx)
    case "subscription":
      return await handleSubscriptionCommand(ctx)
    default:
      return { handled: false }
  }
}

const handleSessionState = async (
  state: string,
  input: string,
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx
  pendingSessions.delete(from)
  cleanupSessions()

  if (state === "awaiting_brain_instructions") {
    return await handleBrainInstructionsInput(input, ctx)
  }

  return await Promise.resolve({ handled: false })
}

const handleAgentCommand = async (
  command: string,
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from, email, contactName } = ctx
  const agentCmd = AGENT_COMMANDS[command]

  if (!agentCmd) {
    return { handled: false }
  }

  if (!email) {
    return { handled: false }
  }

  try {
    const languageCode = await getLanguagePreferenceForWhatsApp(from)

    const conversationContext = await whatsAppConversation.addMessageToContext(
      from,
      contactName,
      { role: "user", content: `/${command}` },
      summarizeMessages
    )

    storeEmbeddingAsync(from, agentCmd.prompt, "user")

    const contextPrompt =
      whatsAppConversation.buildContextPrompt(conversationContext)

    const semanticContext = await getRelevantContext(from, agentCmd.prompt, {
      threshold: 0.75,
      limit: 3,
    })

    const fullContext = [contextPrompt, semanticContext]
      .filter(Boolean)
      .join("\n\n")

    const userId = await getUserIdFromWhatsApp(from)
    const allyBrain = await getAllyBrainForWhatsApp(from)

    if (userId) {
      await unifiedContextStore.setModality(userId, "whatsapp")
      await unifiedContextStore.touch(userId)
    }

    const prompt = await buildAgentPromptWithContext(
      email,
      agentCmd.prompt,
      fullContext,
      {
        allyBrain,
        languageCode,
        userId: userId || undefined,
      }
    )

    const dpoResult = await runDPO({
      userId: userId || `whatsapp-${from}`,
      agentId: ORCHESTRATOR_AGENT.name,
      userQuery: agentCmd.prompt,
      basePrompt: prompt,
      isShadowRun: false,
    })

    if (dpoResult.wasRejected) {
      logger.warn(`WhatsApp: DPO rejected command for ${from}`, {
        reason: dpoResult.judgeOutput?.reasoning,
      })
      const rejectMsg =
        "Your request was flagged for safety review. Please rephrase your request."
      await sendTextMessage(from, rejectMsg)
      return { handled: true, response: rejectMsg }
    }

    const result = await activateAgent(
      ORCHESTRATOR_AGENT,
      dpoResult.effectivePrompt,
      {
        email,
        session: userId
          ? {
              userId,
              agentName: ORCHESTRATOR_AGENT.name,
              taskId: from,
            }
          : undefined,
      }
    )

    const finalOutput = result.finalOutput || ""

    if (finalOutput) {
      await whatsAppConversation.addMessageToContext(
        from,
        contactName,
        { role: "assistant", content: finalOutput },
        summarizeMessages
      )
      storeEmbeddingAsync(from, finalOutput, "assistant")
    }

    const response = htmlToWhatsApp(
      finalOutput || "I couldn't process your request."
    )

    await sendTextMessage(from, response)
    return { handled: true, response }
  } catch (error) {
    if (error instanceof InputGuardrailTripwireTriggered) {
      logger.warn(`WhatsApp: Guardrail triggered for ${from}: ${error.message}`)
      await sendTextMessage(from, error.message)
      return { handled: true, response: error.message }
    }

    logger.error(`WhatsApp: Agent command error for ${from}: ${error}`)
    const errorMsg = "Sorry, I couldn't process your request. Please try again."
    await sendTextMessage(from, errorMsg)
    return { handled: true, response: errorMsg }
  }
}

const handleHelpCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx
  const languageCode = await getLanguagePreferenceForWhatsApp(from)
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const helpText = `✨ *${t("commands.help.header")}*

${t("commands.help.description")}

📅 *${t("commands.help.sections.viewSchedule.title")}*
• today - ${t("botMenu.today")}
• tomorrow - ${t("botMenu.tomorrow")}
• week - ${t("botMenu.week")}
• month - ${t("botMenu.month")}
• free - ${t("botMenu.free")}
• busy - ${t("botMenu.busy")}

⚡ *${t("commands.help.sections.manageEvents.title")}*
• create - ${t("botMenu.create")}
• update - ${t("botMenu.update")}
• delete - ${t("botMenu.delete")}
• search - ${t("botMenu.search")}

📊 *${t("commands.help.sections.timeInsights.title")}*
• analytics - ${t("botMenu.analytics")}
• calendars - ${t("botMenu.calendars")}
• aboutme - ${t("botMenu.aboutme")}

🧠 *${t("commands.help.sections.personalization.title")}*
• brain - ${t("botMenu.brain")}
• settings - ${t("botMenu.settings")}
• language - ${t("botMenu.language")}

🛠️ *${t("commands.help.sections.settings.title")}*
• status - ${t("botMenu.status")}
• subscription - ${t("botMenu.subscription")}
• feedback - ${t("botMenu.feedback")}
• website - ${t("botMenu.website")}
• exit - ${t("botMenu.exit")}

💬 ${t("commands.help.naturalLanguageTip")}
_${t("commands.help.footerTip")}_`

  await sendTextMessage(from, helpText)
  return { handled: true, response: helpText }
}

const handleStartCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx
  const languageCode = await getLanguagePreferenceForWhatsApp(from)
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const startText = `👋 *${t("commands.start.header")}*

${t("commands.start.welcomeText")}

🚀 *${t("commands.start.sections.getStarted.title")}*
• ${t("commands.start.sections.getStarted.items.0")}
• ${t("commands.start.sections.getStarted.items.1")}

📅 *${t("commands.start.sections.trySaying.title")}*
• ${t("commands.start.sections.trySaying.items.0")}
• ${t("commands.start.sections.trySaying.items.1")}

${t("commands.start.footer")} ✨`

  await sendTextMessage(from, startText)
  return { handled: true, response: startText }
}

const handleCreateCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx
  const languageCode = await getLanguagePreferenceForWhatsApp(from)
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const text = `✨ *${t("commands.create.header")}*

${t("commands.create.text")}

📅 *${t("commands.create.sections.eventsMeetings.title")}*
• ${t("commands.create.sections.eventsMeetings.items.0")}
• ${t("commands.create.sections.eventsMeetings.items.1")}
• ${t("commands.create.sections.eventsMeetings.items.2")}

🧠 *${t("commands.create.sections.focusDeepWork.title")}*
• ${t("commands.create.sections.focusDeepWork.items.0")}
• ${t("commands.create.sections.focusDeepWork.items.1")}

⏱️ *${t("commands.create.sections.withDuration.title")}*
• ${t("commands.create.sections.withDuration.items.0")}
• ${t("commands.create.sections.withDuration.items.1")}

🎯 *${t("commands.create.sections.specificCalendar.title")}*
• ${t("commands.create.sections.specificCalendar.items.0")}

_${t("commands.create.footerTip")}_`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleUpdateCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx
  const languageCode = await getLanguagePreferenceForWhatsApp(from)
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const text = `✏️ *${t("commands.update.header")}*

${t("commands.update.text")}

🕐 *${t("commands.update.sections.reschedule.title")}*
• ${t("commands.update.sections.reschedule.items.0")}
• ${t("commands.update.sections.reschedule.items.1")}
• ${t("commands.update.sections.reschedule.items.2")}

📝 *${t("commands.update.sections.editDetails.title")}*
• ${t("commands.update.sections.editDetails.items.0")}
• ${t("commands.update.sections.editDetails.items.1")}
• ${t("commands.update.sections.editDetails.items.2")}

⏱️ *${t("commands.update.sections.adjustDuration.title")}*
• ${t("commands.update.sections.adjustDuration.items.0")}
• ${t("commands.update.sections.adjustDuration.items.1")}

_${t("commands.update.footerTip")}_`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleDeleteCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx
  const languageCode = await getLanguagePreferenceForWhatsApp(from)
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const text = `🗑️ *${t("commands.delete.header")}*

${t("commands.delete.text")}

❌ *${t("commands.delete.sections.cancelByName.title")}*
• ${t("commands.delete.sections.cancelByName.items.0")}
• ${t("commands.delete.sections.cancelByName.items.1")}
• ${t("commands.delete.sections.cancelByName.items.2")}

📅 *${t("commands.delete.sections.clearMultiple.title")}*
• ${t("commands.delete.sections.clearMultiple.items.0")}
• ${t("commands.delete.sections.clearMultiple.items.1")}

🔄 *${t("commands.delete.sections.recurringEvents.title")}*
• ${t("commands.delete.sections.recurringEvents.items.0")}
• ${t("commands.delete.sections.recurringEvents.items.1")}

⚠️ _${t("commands.delete.footerWarning")}_`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleSearchCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx
  const languageCode = await getLanguagePreferenceForWhatsApp(from)
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const text = `🔍 *${t("commands.search.header")}*

${t("commands.search.text")}

📝 *${t("commands.search.sections.searchByKeyword.title")}*
• ${t("commands.search.sections.searchByKeyword.items.0")}
• ${t("commands.search.sections.searchByKeyword.items.1")}
• ${t("commands.search.sections.searchByKeyword.items.2")}
• ${t("commands.search.sections.searchByKeyword.items.3")}

🗓️ *${t("commands.search.sections.filterByDate.title")}*
• ${t("commands.search.sections.filterByDate.items.0")}
• ${t("commands.search.sections.filterByDate.items.1")}

_${t("commands.search.footerTip")}_`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleQuickCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  const text = `⚡ *Quick Add*

Just tell me what to schedule:

• "Call with Sarah at 3pm"
• "Lunch tomorrow at noon"
• "Block Friday afternoon for focus time"

I'll handle the rest ✨`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleCancelCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  const text = `🗑️ *Cancel or Reschedule*

Need to make changes? Just tell me:

• "Cancel my 3pm meeting"
• "Push tomorrow's call to next week"
• "Clear my Friday afternoon"

_I'll handle the updates for you._`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleRemindCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  const text = `🔔 *Set a Reminder*

Never miss what matters. Try:

• "Remind me to call John at 5pm"
• "Set a reminder for tomorrow morning"
• "Remind me 30 min before my next meeting"

I've got you covered 💪`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleBrainCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  const allyBrain = await getAllyBrainForWhatsApp(from)

  const statusText = allyBrain?.enabled ? "✅ Enabled" : "❌ Disabled"
  const instructions =
    allyBrain?.instructions || "No custom instructions set yet."

  const text = `🧠 *Ally's Brain*

Teach Ally about your preferences. These instructions will be remembered in every conversation.

*Status:* ${statusText}

*Current Instructions:*
${instructions}

_Reply with your new instructions to update them, or use the buttons below._`

  await sendInteractiveButtons(from, text, [
    { id: "brain_enable", title: "Enable" },
    { id: "brain_disable", title: "Disable" },
    { id: "brain_edit", title: "Edit Instructions" },
  ])

  return { handled: true, response: text }
}

const handleBrainInstructionsInput = async (
  instructions: string,
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  const updated: AllyBrainPreference = {
    enabled: true,
    instructions: instructions.trim(),
  }

  const success = await updateAllyBrainForWhatsApp(from, updated)

  if (success) {
    const text = `✅ *Instructions Updated*

Your new instructions have been saved:

_"${instructions.trim()}"_

I'll remember these in every conversation.`
    await sendTextMessage(from, text)
    return { handled: true, response: text }
  }
  const text = "❌ Failed to update instructions. Please try again."
  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleSettingsCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from, email } = ctx
  const languageCode = await getLanguagePreferenceForWhatsApp(from)
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const notConnected = email || t("commands.settings.connectedAsText")
  const text = `⚙️ *${t("commands.settings.header")}*

*${t("commands.settings.connectedAsText")}* ${notConnected}

${t("commands.settings.footerText")}
• *brain* - ${t("botMenu.brain")}
• *language* - ${t("botMenu.language")}
• *status* - ${t("botMenu.status")}
• *website* - ${t("botMenu.website")}`

  await sendInteractiveButtons(from, text, [
    { id: "cmd_brain", title: "🧠 Brain" },
    { id: "cmd_language", title: "🌐 Language" },
    { id: "cmd_status", title: "📊 Status" },
  ])

  return { handled: true, response: text }
}

const handleLanguageCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx
  const languageCode = await getLanguagePreferenceForWhatsApp(from)
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const currentLangDisplay = t(`commands.language.languages.${languageCode}`)
  const text = `🌐 *${t("commands.language.header")}*

*${t("commands.language.currentLanguageText")}* ${currentLangDisplay}

${t("commands.language.selectPrompt")}`

  await sendInteractiveList(from, text, t("commands.language.selectPrompt"), [
    {
      title: t("commands.language.header"),
      rows: [
        { id: "lang_en", title: "English", description: t("commands.language.languages.en") },
        { id: "lang_he", title: "עברית", description: t("commands.language.languages.he") },
        { id: "lang_ar", title: "العربية", description: t("commands.language.languages.ar") },
        { id: "lang_fr", title: "Français", description: t("commands.language.languages.fr") },
        { id: "lang_de", title: "Deutsch", description: t("commands.language.languages.de") },
        { id: "lang_ru", title: "Русский", description: t("commands.language.languages.ru") },
      ],
    },
  ])

  return { handled: true, response: text }
}

const handleFeedbackCommand = async (
  feedback: string,
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx
  const languageCode = await getLanguagePreferenceForWhatsApp(from)
  const { t } = getTranslatorFromLanguageCode(languageCode)

  if (!feedback.trim()) {
    const text = `💬 *${t("commands.feedback.header")}*

${t("commands.feedback.text")}

• ${t("commands.feedback.options.0")}
• ${t("commands.feedback.options.1")}
• ${t("commands.feedback.options.2")}

_${t("commands.feedback.instructionText")}_

${t("commands.feedback.footer")} ✨`
    await sendTextMessage(from, text)
    return { handled: true, response: text }
  }

  logger.info(`WhatsApp: Feedback from ${from}: ${feedback}`)

  const text = `💬 *${t("commands.feedback.header")}*

${t("commands.feedback.footer")} ✨`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleWebsiteCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx
  const languageCode = await getLanguagePreferenceForWhatsApp(from)
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const baseUrl = process.env.FE_BASE_URL || "https://askally.ai"

  const text = `🌐 *${t("commands.website.header")}*

${t("commands.website.text")}

${baseUrl}`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleExitCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx
  const languageCode = await getLanguagePreferenceForWhatsApp(from)
  const { t } = getTranslatorFromLanguageCode(languageCode)

  pendingSessions.delete(from)

  const text = `👋 *${t("commands.exit.header")}*

${t("commands.exit.text")}

${t("commands.exit.footer")} ✨`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleAboutMeCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from, email } = ctx
  const languageCode = await getLanguagePreferenceForWhatsApp(from)
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const allyBrain = await getAllyBrainForWhatsApp(from)

  const statusText = allyBrain?.enabled
    ? t("commands.brain.statusEnabled")
    : t("commands.brain.statusDisabled")
  const instructionsText = allyBrain?.instructions
    ? `_"${allyBrain.instructions}"_`
    : `_${t("commands.brain.noInstructions")}_`

  const text = `👤 *${t("commands.aboutme.header")}*

*Email:* ${email || t("commands.settings.connectedAsText")}

*${t("commands.brain.currentInstructions")}:* ${statusText}
${instructionsText}

💡 _${t("commands.aboutme.footerTip")}_`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const UPGRADE_URL = "https://askally.ai/pricing"
const BILLING_URL = "https://askally.ai/dashboard/billing"
const TRIAL_WARNING_DAYS = 3
const USAGE_WARNING_PERCENT = 80
const PERCENT_MULTIPLIER = 100

type WhatsAppUserAccess = Awaited<ReturnType<typeof checkUserAccess>>
type TranslateFunction = (
  key: string,
  options?: Record<string, unknown>
) => string

const getWhatsAppStatusText = (
  subscriptionStatus: string | null,
  trialDaysLeft: number | null,
  t: TranslateFunction
): string => {
  if (trialDaysLeft !== null && trialDaysLeft > 0) {
    return t("commands.subscription.statusTrial")
  }
  if (subscriptionStatus === "active") {
    return t("commands.subscription.statusActive")
  }
  if (subscriptionStatus === "cancelled") {
    return t("commands.subscription.statusCancelled")
  }
  return t("commands.subscription.statusExpired")
}

const buildTrialSection = (
  access: WhatsAppUserAccess,
  t: TranslateFunction
): string => {
  if (access.trial_days_left === null || access.trial_days_left <= 0) {
    return ""
  }

  let section = `\n• ${t("commands.subscription.trialDaysLeft")}: *${access.trial_days_left}*`
  if (access.trial_end_date) {
    const endDate = new Date(access.trial_end_date).toLocaleDateString()
    section += `\n• ${t("commands.subscription.trialEndsOn")}: ${endDate}`
  }
  return section
}

const buildUsageSection = (
  access: WhatsAppUserAccess,
  t: TranslateFunction
): string => {
  let section = `\n• ${t("commands.subscription.interactionsUsed")}: *${access.interactions_used}*`

  if (access.interactions_remaining !== null) {
    section += `\n• ${t("commands.subscription.interactionsRemaining")}: *${access.interactions_remaining}*`
  } else {
    section += `\n• ${t("commands.subscription.interactionsRemaining")}: ${t("commands.subscription.unlimited")}`
  }

  section += `\n• ${t("commands.subscription.creditsRemaining")}: *${access.credits_remaining}*`
  return section
}

const buildWarningsSection = (
  access: WhatsAppUserAccess,
  t: TranslateFunction
): string => {
  const warnings: string[] = []

  const hasTrialWarning =
    access.trial_days_left !== null &&
    access.trial_days_left <= TRIAL_WARNING_DAYS &&
    access.trial_days_left > 0

  if (hasTrialWarning) {
    warnings.push(
      t("commands.subscription.trialWarning", { days: access.trial_days_left })
    )
  }

  if (access.interactions_remaining !== null && access.interactions_used > 0) {
    const totalInteractions =
      access.interactions_used + access.interactions_remaining
    const usagePercent = Math.round(
      (access.interactions_used / totalInteractions) * PERCENT_MULTIPLIER
    )
    if (usagePercent >= USAGE_WARNING_PERCENT) {
      warnings.push(
        t("commands.subscription.usageWarning", { percent: usagePercent })
      )
    }
  }

  return warnings.length > 0 ? `\n\n${warnings.join("\n\n")}` : ""
}

const buildLinksSection = (
  access: WhatsAppUserAccess,
  t: TranslateFunction
): string => {
  let section = "\n\n🔗 *Links*"

  if (!access.has_access || access.subscription_status !== "active") {
    section += `\n• ${t("commands.subscription.upgrade")}: ${UPGRADE_URL}`
  }
  section += `\n• ${t("commands.subscription.manageBilling")}: ${BILLING_URL}`
  return section
}

const handleSubscriptionCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from, email } = ctx
  const languageCode = await getLanguagePreferenceForWhatsApp(from)
  const { t } = getTranslatorFromLanguageCode(languageCode)

  if (!email) {
    const text = `💳 *${t("commands.subscription.header")}*

${t("commands.subscription.noUser")}

${t("commands.subscription.manageBilling")}: ${BILLING_URL}`
    await sendTextMessage(from, text)
    return { handled: true, response: text }
  }

  try {
    const userId = await getUserIdFromWhatsApp(from)
    const access = await checkUserAccess(userId || `whatsapp-${from}`, email)

    const planName = access.plan_name || t("commands.subscription.freeTier")
    const statusText = getWhatsAppStatusText(
      access.subscription_status,
      access.trial_days_left,
      t
    )

    let text = `💳 *${t("commands.subscription.header")}*

📊 *${t("commands.subscription.sections.status.title")}*
• ${t("commands.subscription.planName")}: *${planName}*
• ${t("commands.subscription.status")}: ${statusText}`

    text += buildTrialSection(access, t)
    text += `\n\n📈 *${t("commands.subscription.sections.usage.title")}*`
    text += buildUsageSection(access, t)
    text += buildWarningsSection(access, t)
    text += buildLinksSection(access, t)

    await sendTextMessage(from, text)
    return { handled: true, response: text }
  } catch (error) {
    logger.error(`WhatsApp: Subscription command error for ${from}: ${error}`)
    const text = `💳 *${t("commands.subscription.header")}*

${t("commands.subscription.error")}

${t("commands.subscription.manageBilling")}: ${BILLING_URL}`
    await sendTextMessage(from, text)
    return { handled: true, response: text }
  }
}

export const handleInteractiveReply = async (
  replyId: string,
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  if (replyId === "brain_enable") {
    const current = await getAllyBrainForWhatsApp(from)
    await updateAllyBrainForWhatsApp(from, {
      enabled: true,
      instructions: current?.instructions || "",
    })
    await sendTextMessage(from, "✅ Custom instructions enabled!")
    return { handled: true }
  }

  if (replyId === "brain_disable") {
    const current = await getAllyBrainForWhatsApp(from)
    await updateAllyBrainForWhatsApp(from, {
      enabled: false,
      instructions: current?.instructions || "",
    })
    await sendTextMessage(from, "❌ Custom instructions disabled.")
    return { handled: true }
  }

  if (replyId === "brain_edit") {
    pendingSessions.set(from, {
      state: "awaiting_brain_instructions",
      timestamp: Date.now(),
    })
    await sendTextMessage(
      from,
      '📝 Please send me your new instructions. I\'ll remember them in every conversation.\n\n_Example: "I prefer morning meetings. Always suggest 30-minute slots. My timezone is PST."_'
    )
    return { handled: true }
  }

  if (replyId.startsWith("cmd_")) {
    const cmd = replyId.replace("cmd_", "")
    return handleCommand(cmd, "", ctx)
  }

  if (replyId.startsWith("lang_")) {
    const langCode = replyId.replace("lang_", "")
    const langNames: Record<string, string> = {
      en: "English",
      he: "Hebrew (עברית)",
      ar: "Arabic (العربية)",
      fr: "French (Français)",
      de: "German (Deutsch)",
      ru: "Russian (Русский)",
    }

    const success = await updateLanguagePreferenceForWhatsApp(from, langCode)
    if (success) {
      await sendTextMessage(
        from,
        `✅ Language changed to ${langNames[langCode] || langCode}`
      )
    } else {
      await sendTextMessage(
        from,
        "⚠️ Could not save language preference. Please try again."
      )
    }
    return { handled: true }
  }

  return { handled: false }
}

export const hasPendingSession = (from: string): boolean => {
  cleanupSessions()
  return pendingSessions.has(from)
}
