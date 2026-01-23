import { InputGuardrailTripwireTriggered } from "@openai/agents"
import { ORCHESTRATOR_AGENT } from "@/ai-agents/agents"
import { runDPO } from "@/ai-agents/dpo"
import { activateAgent } from "@/domains/analytics/utils"
import { checkUserAccess } from "@/domains/payments/services/lemonsqueezy-service"
import { logger } from "@/lib/logger"
import { unifiedContextStore } from "@/shared/context"
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

    const prompt = buildAgentPromptWithContext(
      email,
      agentCmd.prompt,
      fullContext,
      {
        allyBrain,
        languageCode,
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

  const helpText = `✨ *How Ally Helps*

Your private AI secretary for calendar mastery.

📅 *View Your Schedule*
• today - Today's schedule
• tomorrow - Tomorrow's agenda
• week - Week at a glance
• month - Monthly overview
• free - Find open slots
• busy - View commitments

⚡ *Manage Events*
• create - Schedule something
• update - Reschedule or edit
• delete - Cancel an event
• search - Search calendar

📊 *Time Insights*
• analytics - Understand your time
• calendars - Your calendars
• aboutme - What I know about you

🧠 *Personalization*
• brain - Teach Ally your preferences
• settings - Ally settings
• language - Change language

🛠️ *Settings & More*
• status - Check connection
• subscription - View subscription
• feedback - Give feedback
• website - Open web dashboard
• exit - End conversation

💬 Or just message me naturally!
_"Schedule a call with Sarah tomorrow at 2pm"_`

  await sendTextMessage(from, helpText)
  return { handled: true, response: helpText }
}

const handleStartCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  const startText = `👋 *Welcome to Ally*

I'm your private AI secretary for Google Calendar. Tell me what you need in plain language - I'll handle the rest.

🚀 *Get Started*
• Just message me naturally
• Or type *help* to see what I can do

📅 *Try saying*
• "What's on my schedule today?"
• "Block 2 hours for deep work tomorrow"

Let's reclaim your time ✨`

  await sendTextMessage(from, startText)
  return { handled: true, response: startText }
}

const handleCreateCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  const text = `✨ *Schedule Something*

Just describe what you need - I understand natural language:

📅 *Events & Meetings*
• "Call with Sarah tomorrow at 2pm"
• "Team sync every Monday at 9am"
• "Lunch with investor on Friday at noon"

🧠 *Focus & Deep Work*
• "Block 3 hours for deep work tomorrow morning"
• "Reserve Friday afternoon for strategy"

⏱️ *With Duration*
• "2-hour workshop on Wednesday at 10am"
• "Quick 15-min check-in at 4pm"

🎯 *Specific Calendar*
• "Add to Work: Client call Friday 2pm"

_Describe your event and I'll handle the rest._`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleUpdateCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  const text = `✏️ *Reschedule or Edit*

Modify any event on your calendar:

🕐 *Reschedule*
• "Move my 2pm meeting to 4pm"
• "Push the dentist to next week"
• "Shift Friday lunch to 1pm"

📝 *Edit Details*
• "Rename team meeting to Sprint Review"
• "Add Zoom link to tomorrow's call"
• "Update the project meeting description"

⏱️ *Adjust Duration*
• "Make standup 30 minutes instead of 15"
• "Extend tomorrow's workshop by 1 hour"

_Just tell me what to change._`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleDeleteCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  const text = `🗑️ *Cancel an Event*

Remove events from your calendar:

❌ *Cancel by Name*
• "Cancel my 3pm meeting"
• "Remove lunch with John tomorrow"
• "Delete the dentist appointment"

📅 *Clear Multiple*
• "Clear Friday afternoon"
• "Remove all meetings tomorrow"

🔄 *Recurring Events*
• "Skip this week's standup"
• "Cancel all future team meetings"

⚠️ _I'll confirm before removing anything_`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleSearchCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  const text = `🔍 *Search Calendar*

Find any event on your calendar:

📝 *Search by Keyword*
• "Find meetings with John"
• "Search for dentist"
• "Show all standups"
• "Find events about Project Alpha"

🗓️ *Filter by Date*
• "Find meetings next week"
• "Search calls in December"

_Just describe what you're looking for._`

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

  const text = `⚙️ *Ally Settings*

*Connected as:* ${email || "Not connected"}

Select an option:
• *brain* - Manage AI preferences
• *language* - Change language
• *status* - Check connection
• *website* - Open web dashboard`

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

  const text = `🌐 *Language Settings*

*Current language:* English

Select your preferred language:`

  await sendInteractiveList(from, text, "Select Language", [
    {
      title: "Languages",
      rows: [
        { id: "lang_en", title: "English", description: "English (Default)" },
        { id: "lang_he", title: "עברית", description: "Hebrew" },
        { id: "lang_ar", title: "العربية", description: "Arabic" },
        { id: "lang_fr", title: "Français", description: "French" },
        { id: "lang_de", title: "Deutsch", description: "German" },
        { id: "lang_ru", title: "Русский", description: "Russian" },
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

  if (!feedback.trim()) {
    const text = `💬 *Share Your Feedback*

Your input shapes how Ally evolves. You can:

• Tell us what's working well
• Report any issues you've hit
• Suggest features you'd love to see

_Just type your feedback after the command:_
feedback Your message here

Thanks for helping us build something great ✨`
    await sendTextMessage(from, text)
    return { handled: true, response: text }
  }

  logger.info(`WhatsApp: Feedback from ${from}: ${feedback}`)

  const text = `💬 *Thanks for your feedback!*

Your input helps us make Ally better. The team will review your message.

We appreciate you taking the time to share your thoughts ✨`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleWebsiteCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  const baseUrl = process.env.FE_BASE_URL || "https://askally.ai"

  const text = `🌐 *Open Web Dashboard*

Access all of Ally's features in your browser:

${baseUrl}

Features available on web:
• Full calendar view and analytics
• Advanced settings and preferences
• Conversation history
• Team features`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleExitCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from } = ctx

  pendingSessions.delete(from)

  const text = `👋 *Until next time*

Your conversation has been cleared. I'm here whenever you need me - just send a message to pick up where we left off.

Go get things done ✨`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const handleAboutMeCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from, email } = ctx

  const allyBrain = await getAllyBrainForWhatsApp(from)

  const text = `👤 *What I Know About You*

*Email:* ${email || "Not connected"}

*Custom Instructions:* ${allyBrain?.enabled ? "Enabled" : "Disabled"}
${allyBrain?.instructions ? `_"${allyBrain.instructions}"_` : "_No custom instructions set_"}

💡 _I learn more about you with each interaction. Use /brain to teach me your preferences._`

  await sendTextMessage(from, text)
  return { handled: true, response: text }
}

const UPGRADE_URL = "https://askally.ai/pricing"
const BILLING_URL = "https://askally.ai/dashboard/billing"
const TRIAL_WARNING_DAYS = 3
const USAGE_WARNING_PERCENT = 80
const PERCENT_MULTIPLIER = 100

type WhatsAppUserAccess = Awaited<ReturnType<typeof checkUserAccess>>

const getWhatsAppStatusText = (
  subscriptionStatus: string | null,
  trialDaysLeft: number | null
): string => {
  if (trialDaysLeft !== null && trialDaysLeft > 0) {
    return "Trial"
  }
  if (subscriptionStatus === "active") {
    return "Active"
  }
  if (subscriptionStatus === "cancelled") {
    return "Cancelled"
  }
  return "Expired"
}

const buildTrialSection = (access: WhatsAppUserAccess): string => {
  if (access.trial_days_left === null || access.trial_days_left <= 0) {
    return ""
  }

  let section = `\n• Trial Days Left: *${access.trial_days_left}*`
  if (access.trial_end_date) {
    const endDate = new Date(access.trial_end_date).toLocaleDateString()
    section += `\n• Trial Ends: ${endDate}`
  }
  return section
}

const buildUsageSection = (access: WhatsAppUserAccess): string => {
  let section = `\n• Interactions Used: *${access.interactions_used}*`

  if (access.interactions_remaining !== null) {
    section += `\n• Interactions Remaining: *${access.interactions_remaining}*`
  } else {
    section += "\n• Interactions Remaining: Unlimited"
  }

  section += `\n• Credits Remaining: *${access.credits_remaining}*`
  return section
}

const buildWarningsSection = (access: WhatsAppUserAccess): string => {
  const warnings: string[] = []

  const hasTrialWarning =
    access.trial_days_left !== null &&
    access.trial_days_left <= TRIAL_WARNING_DAYS &&
    access.trial_days_left > 0

  if (hasTrialWarning) {
    warnings.push(
      `⚠️ Your trial ends in ${access.trial_days_left} days. Upgrade to continue using Ally.`
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
        `⚠️ You've used ${usagePercent}% of your monthly interactions.`
      )
    }
  }

  return warnings.length > 0 ? `\n\n${warnings.join("\n\n")}` : ""
}

const buildLinksSection = (access: WhatsAppUserAccess): string => {
  let section = "\n\n🔗 *Links*"

  if (!access.has_access || access.subscription_status !== "active") {
    section += `\n• Upgrade: ${UPGRADE_URL}`
  }
  section += `\n• Manage Billing: ${BILLING_URL}`
  return section
}

const handleSubscriptionCommand = async (
  ctx: CommandContext
): Promise<CommandResult> => {
  const { from, email } = ctx

  if (!email) {
    const text = `💳 *Your Subscription*

Please connect your account first to view subscription details.

Visit ${BILLING_URL} to manage your account.`
    await sendTextMessage(from, text)
    return { handled: true, response: text }
  }

  try {
    const userId = await getUserIdFromWhatsApp(from)
    const access = await checkUserAccess(userId || `whatsapp-${from}`, email)

    const planName = access.plan_name || "Free"
    const statusText = getWhatsAppStatusText(
      access.subscription_status,
      access.trial_days_left
    )

    let text = `💳 *Your Subscription*

📊 *Plan Status*
• Plan: *${planName}*
• Status: ${statusText}`

    text += buildTrialSection(access)
    text += "\n\n📈 *Usage This Period*"
    text += buildUsageSection(access)
    text += buildWarningsSection(access)
    text += buildLinksSection(access)

    await sendTextMessage(from, text)
    return { handled: true, response: text }
  } catch (error) {
    logger.error(`WhatsApp: Subscription command error for ${from}: ${error}`)
    const text = `💳 *Your Subscription*

Sorry, I couldn't fetch your subscription details. Please try again or visit ${BILLING_URL}`
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
