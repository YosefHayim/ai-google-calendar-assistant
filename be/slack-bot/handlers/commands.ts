import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from "@slack/bolt"
import { logger } from "@/lib/logger"
import { handleSlackAuth } from "../middleware/auth-handler"
import {
  clearAllyBrainInstructions,
  getAllyBrainForSlack,
  toggleAllyBrainEnabled,
  updateAllyBrainInstructions,
} from "../utils/ally-brain"
import { SlackResponseBuilder } from "../utils/response-builder"
import { getSession } from "../utils/session"
import { handleAgentRequest } from "./agent-handler"

const COMMAND_PREFIX_LENGTHS = {
  CREATE: 7,
  UPDATE: 7,
  DELETE: 7,
  SEARCH: 7,
  FEEDBACK: 9,
  BRAIN: 6,
  BRAIN_SET: 4,
} as const

type CommandArgs = SlackCommandMiddlewareArgs & AllMiddlewareArgs

const requireAuth = async (
  args: CommandArgs
): Promise<{ authorized: boolean; email?: string }> => {
  const { command, client, respond } = args
  const authResult = await handleSlackAuth(
    client,
    command.user_id,
    command.team_id
  )

  if (authResult.needsAuth) {
    await respond({
      text: authResult.authMessage || "Please authenticate first.",
      response_type: "ephemeral",
    })
    return { authorized: false }
  }

  return { authorized: true, email: authResult.session.email }
}

export const handleHelpCommand = async (args: CommandArgs): Promise<void> => {
  const { respond } = args

  const response = SlackResponseBuilder.create()
    .header("✨", "How Ally Helps")
    .section("Your private AI secretary for calendar mastery.")
    .divider()
    .section("*📅 View Your Schedule*")
    .bulletList([
      "`/ally today` - Today's schedule",
      "`/ally tomorrow` - Tomorrow's agenda",
      "`/ally week` - Week at a glance",
      "`/ally month` - Monthly overview",
      "`/ally free` - Find open slots",
      "`/ally busy` - View commitments",
    ])
    .section("*⚡ Manage Events*")
    .bulletList([
      "`/ally create <description>` - Schedule something",
      "`/ally update <description>` - Reschedule or edit",
      "`/ally delete <description>` - Cancel an event",
      "`/ally search <query>` - Search calendar",
    ])
    .section("*📊 Time Insights*")
    .bulletList([
      "`/ally analytics` - Understand your time",
      "`/ally calendars` - Your calendars",
    ])
    .section("*🛠️ Settings*")
    .bulletList([
      "`/ally status` - Check connection",
      "`/ally settings` - Ally settings",
      "`/ally feedback <message>` - Give feedback",
      "`/ally help` - Show this help",
    ])
    .divider()
    .context([
      "💬 Or just message me naturally!",
      '_"How much deep work did I get this week vs last week?"_',
    ])
    .build()

  await respond({
    blocks: response.blocks,
    text: response.text,
    response_type: "ephemeral",
  })
}

export const handleTodayCommand = async (args: CommandArgs): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)
  if (!(auth.authorized && auth.email)) {
    return
  }

  await respond({
    text: "Fetching today's schedule...",
    response_type: "ephemeral",
  })

  try {
    const response = await handleAgentRequest({
      message: "What's on my calendar today? Give me a summary.",
      email: auth.email,
      slackUserId: command.user_id,
      teamId: command.team_id,
    })

    await respond({
      text: response,
      response_type: "in_channel",
    })
  } catch (error) {
    logger.error(`Slack Bot: Today command error: ${error}`)
    await respond({
      text: "Sorry, I couldn't fetch your schedule. Please try again.",
      response_type: "ephemeral",
    })
  }
}

export const handleTomorrowCommand = async (
  args: CommandArgs
): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)
  if (!(auth.authorized && auth.email)) {
    return
  }

  await respond({
    text: "Fetching tomorrow's schedule...",
    response_type: "ephemeral",
  })

  try {
    const response = await handleAgentRequest({
      message: "What's on my calendar tomorrow? Give me a summary.",
      email: auth.email,
      slackUserId: command.user_id,
      teamId: command.team_id,
    })

    await respond({
      text: response,
      response_type: "in_channel",
    })
  } catch (error) {
    logger.error(`Slack Bot: Tomorrow command error: ${error}`)
    await respond({
      text: "Sorry, I couldn't fetch your schedule. Please try again.",
      response_type: "ephemeral",
    })
  }
}

export const handleWeekCommand = async (args: CommandArgs): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)
  if (!(auth.authorized && auth.email)) {
    return
  }

  await respond({
    text: "Fetching this week's schedule...",
    response_type: "ephemeral",
  })

  try {
    const response = await handleAgentRequest({
      message: "Give me an overview of my calendar for this week.",
      email: auth.email,
      slackUserId: command.user_id,
      teamId: command.team_id,
    })

    await respond({
      text: response,
      response_type: "in_channel",
    })
  } catch (error) {
    logger.error(`Slack Bot: Week command error: ${error}`)
    await respond({
      text: "Sorry, I couldn't fetch your schedule. Please try again.",
      response_type: "ephemeral",
    })
  }
}

export const handleMonthCommand = async (args: CommandArgs): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)
  if (!(auth.authorized && auth.email)) {
    return
  }

  await respond({
    text: "Fetching this month's overview...",
    response_type: "ephemeral",
  })

  try {
    const response = await handleAgentRequest({
      message: "Give me an overview of my calendar for this month.",
      email: auth.email,
      slackUserId: command.user_id,
      teamId: command.team_id,
    })

    await respond({
      text: response,
      response_type: "in_channel",
    })
  } catch (error) {
    logger.error(`Slack Bot: Month command error: ${error}`)
    await respond({
      text: "Sorry, I couldn't fetch your schedule. Please try again.",
      response_type: "ephemeral",
    })
  }
}

export const handleFreeCommand = async (args: CommandArgs): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)
  if (!(auth.authorized && auth.email)) {
    return
  }

  await respond({
    text: "Finding free time slots...",
    response_type: "ephemeral",
  })

  try {
    const response = await handleAgentRequest({
      message: "When am I free today? Show me available time slots.",
      email: auth.email,
      slackUserId: command.user_id,
      teamId: command.team_id,
    })

    await respond({
      text: response,
      response_type: "in_channel",
    })
  } catch (error) {
    logger.error(`Slack Bot: Free command error: ${error}`)
    await respond({
      text: "Sorry, I couldn't find free slots. Please try again.",
      response_type: "ephemeral",
    })
  }
}

export const handleBusyCommand = async (args: CommandArgs): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)
  if (!(auth.authorized && auth.email)) {
    return
  }

  await respond({
    text: "Checking your commitments...",
    response_type: "ephemeral",
  })

  try {
    const response = await handleAgentRequest({
      message: "What commitments do I have? Show me when I'm busy.",
      email: auth.email,
      slackUserId: command.user_id,
      teamId: command.team_id,
    })

    await respond({
      text: response,
      response_type: "in_channel",
    })
  } catch (error) {
    logger.error(`Slack Bot: Busy command error: ${error}`)
    await respond({
      text: "Sorry, I couldn't fetch your schedule. Please try again.",
      response_type: "ephemeral",
    })
  }
}

export const handleStatusCommand = async (args: CommandArgs): Promise<void> => {
  const { command, client, respond } = args

  const authResult = await handleSlackAuth(
    client,
    command.user_id,
    command.team_id
  )

  const session = getSession(command.user_id, command.team_id)

  const response = SlackResponseBuilder.create()
    .header("📊", "Ally Status")
    .field(
      "Connection",
      authResult.session.email ? "✅ Connected" : "❌ Not connected"
    )
    .field("Email", authResult.session.email || "Not linked")
    .field("Messages", session.messageCount.toString())
    .build()

  await respond({
    blocks: response.blocks,
    text: response.text,
    response_type: "ephemeral",
  })
}

export const handleCreateCommand = async (
  args: CommandArgs,
  eventDescription: string
): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)
  if (!(auth.authorized && auth.email)) {
    return
  }

  if (!eventDescription.trim()) {
    await respond({
      text: "Please describe the event you want to create. Example: `/ally create Meeting with John tomorrow at 2pm`",
      response_type: "ephemeral",
    })
    return
  }

  await respond({
    text: `Creating event: "${eventDescription}"...`,
    response_type: "ephemeral",
  })

  try {
    const response = await handleAgentRequest({
      message: `Create this event: ${eventDescription}`,
      email: auth.email,
      slackUserId: command.user_id,
      teamId: command.team_id,
    })

    await respond({
      text: response,
      response_type: "in_channel",
    })
  } catch (error) {
    logger.error(`Slack Bot: Create command error: ${error}`)
    await respond({
      text: "Sorry, I couldn't create the event. Please try again.",
      response_type: "ephemeral",
    })
  }
}

export const handleUpdateCommand = async (
  args: CommandArgs,
  updateDescription: string
): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)
  if (!(auth.authorized && auth.email)) {
    return
  }

  if (!updateDescription.trim()) {
    await respond({
      text: "Please describe what you want to update. Example: `/ally update Move my 2pm meeting to 4pm`",
      response_type: "ephemeral",
    })
    return
  }

  await respond({
    text: `Updating event: "${updateDescription}"...`,
    response_type: "ephemeral",
  })

  try {
    const response = await handleAgentRequest({
      message: `Update this event: ${updateDescription}`,
      email: auth.email,
      slackUserId: command.user_id,
      teamId: command.team_id,
    })

    await respond({
      text: response,
      response_type: "in_channel",
    })
  } catch (error) {
    logger.error(`Slack Bot: Update command error: ${error}`)
    await respond({
      text: "Sorry, I couldn't update the event. Please try again.",
      response_type: "ephemeral",
    })
  }
}

export const handleDeleteCommand = async (
  args: CommandArgs,
  deleteDescription: string
): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)
  if (!(auth.authorized && auth.email)) {
    return
  }

  if (!deleteDescription.trim()) {
    await respond({
      text: "Please describe which event to delete. Example: `/ally delete Cancel my 3pm meeting`",
      response_type: "ephemeral",
    })
    return
  }

  await respond({
    text: `Deleting event: "${deleteDescription}"...`,
    response_type: "ephemeral",
  })

  try {
    const response = await handleAgentRequest({
      message: `Delete this event: ${deleteDescription}`,
      email: auth.email,
      slackUserId: command.user_id,
      teamId: command.team_id,
    })

    await respond({
      text: response,
      response_type: "in_channel",
    })
  } catch (error) {
    logger.error(`Slack Bot: Delete command error: ${error}`)
    await respond({
      text: "Sorry, I couldn't delete the event. Please try again.",
      response_type: "ephemeral",
    })
  }
}

export const handleSearchCommand = async (
  args: CommandArgs,
  searchQuery: string
): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)
  if (!(auth.authorized && auth.email)) {
    return
  }

  if (!searchQuery.trim()) {
    await respond({
      text: "Please provide a search query. Example: `/ally search meetings with John`",
      response_type: "ephemeral",
    })
    return
  }

  await respond({
    text: `Searching for: "${searchQuery}"...`,
    response_type: "ephemeral",
  })

  try {
    const response = await handleAgentRequest({
      message: `Search my calendar for: ${searchQuery}`,
      email: auth.email,
      slackUserId: command.user_id,
      teamId: command.team_id,
    })

    await respond({
      text: response,
      response_type: "in_channel",
    })
  } catch (error) {
    logger.error(`Slack Bot: Search command error: ${error}`)
    await respond({
      text: "Sorry, I couldn't search your calendar. Please try again.",
      response_type: "ephemeral",
    })
  }
}

export const handleAnalyticsCommand = async (
  args: CommandArgs
): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)
  if (!(auth.authorized && auth.email)) {
    return
  }

  await respond({
    text: "Analyzing your calendar...",
    response_type: "ephemeral",
  })

  try {
    const response = await handleAgentRequest({
      message:
        "Give me insights about how I spend my time. Show me analytics for this week.",
      email: auth.email,
      slackUserId: command.user_id,
      teamId: command.team_id,
    })

    await respond({
      text: response,
      response_type: "in_channel",
    })
  } catch (error) {
    logger.error(`Slack Bot: Analytics command error: ${error}`)
    await respond({
      text: "Sorry, I couldn't generate analytics. Please try again.",
      response_type: "ephemeral",
    })
  }
}

export const handleCalendarsCommand = async (
  args: CommandArgs
): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)
  if (!(auth.authorized && auth.email)) {
    return
  }

  await respond({
    text: "Fetching your calendars...",
    response_type: "ephemeral",
  })

  try {
    const response = await handleAgentRequest({
      message: "Show me all my connected calendars.",
      email: auth.email,
      slackUserId: command.user_id,
      teamId: command.team_id,
    })

    await respond({
      text: response,
      response_type: "in_channel",
    })
  } catch (error) {
    logger.error(`Slack Bot: Calendars command error: ${error}`)
    await respond({
      text: "Sorry, I couldn't fetch your calendars. Please try again.",
      response_type: "ephemeral",
    })
  }
}

export const handleSettingsCommand = async (
  args: CommandArgs
): Promise<void> => {
  const { command, client, respond } = args

  const authResult = await handleSlackAuth(
    client,
    command.user_id,
    command.team_id
  )

  const session = getSession(command.user_id, command.team_id)

  const response = SlackResponseBuilder.create()
    .header("⚙️", "Ally Settings")
    .field("Email", authResult.session.email || "Not linked")
    .field(
      "Connection",
      authResult.session.email ? "✅ Connected" : "❌ Not connected"
    )
    .field("Messages this session", session.messageCount.toString())
    .divider()
    .section("*Available Settings*")
    .bulletList([
      "`/ally brain` - Manage AI preferences",
      "`/ally status` - Check connection status",
      "`/ally feedback <message>` - Send feedback to the team",
    ])
    .build()

  await respond({
    blocks: response.blocks,
    text: response.text,
    response_type: "ephemeral",
  })
}

type RespondFn = CommandArgs["respond"]

const handleBrainToggle = async (
  slackUserId: string,
  enabled: boolean,
  respond: RespondFn
): Promise<boolean> => {
  const success = await toggleAllyBrainEnabled(slackUserId, enabled)

  let message: string
  if (enabled) {
    message = success
      ? "✅ Custom instructions enabled!"
      : "❌ Failed to enable. Please try again."
  } else {
    message = success
      ? "❌ Custom instructions disabled."
      : "❌ Failed to disable. Please try again."
  }

  await respond({ text: message, response_type: "ephemeral" })
  return true
}

const handleBrainClear = async (
  slackUserId: string,
  respond: RespondFn
): Promise<boolean> => {
  const success = await clearAllyBrainInstructions(slackUserId)
  await respond({
    text: success
      ? "🗑️ Instructions cleared."
      : "❌ Failed to clear. Please try again.",
    response_type: "ephemeral",
  })
  return true
}

const handleBrainSet = async (
  slackUserId: string,
  subcommand: string,
  respond: RespondFn
): Promise<boolean> => {
  const instructions = subcommand.slice(COMMAND_PREFIX_LENGTHS.BRAIN_SET).trim()
  if (!instructions) {
    await respond({
      text: "Please provide instructions. Example: `/ally brain set I prefer morning meetings`",
      response_type: "ephemeral",
    })
    return true
  }

  const success = await updateAllyBrainInstructions(slackUserId, instructions)
  await respond({
    text: success
      ? `✅ Instructions updated:\n_"${instructions}"_`
      : "❌ Failed to update. Please try again.",
    response_type: "ephemeral",
  })
  return true
}

const showBrainStatus = async (
  slackUserId: string,
  respond: RespondFn
): Promise<void> => {
  const allyBrain = await getAllyBrainForSlack(slackUserId)
  const statusText = allyBrain?.enabled ? "✅ Enabled" : "❌ Disabled"
  const instructions =
    allyBrain?.instructions || "_No custom instructions set yet._"

  const response = SlackResponseBuilder.create()
    .header("🧠", "Ally's Brain")
    .section(
      "Teach Ally about your preferences. These instructions will be remembered in every conversation."
    )
    .divider()
    .field("Status", statusText)
    .field("Current Instructions", instructions)
    .divider()
    .section("*Commands*")
    .bulletList([
      "`/ally brain` - Show current settings",
      "`/ally brain enable` - Enable custom instructions",
      "`/ally brain disable` - Disable custom instructions",
      "`/ally brain set <instructions>` - Set new instructions",
      "`/ally brain clear` - Clear all instructions",
    ])
    .context([
      "Example: `/ally brain set I prefer morning meetings. My timezone is PST.`",
    ])
    .build()

  await respond({
    blocks: response.blocks,
    text: response.text,
    response_type: "ephemeral",
  })
}

export const handleBrainCommand = async (
  args: CommandArgs,
  subcommand?: string
): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)

  if (!auth.authorized) {
    return
  }

  const slackUserId = command.user_id

  if (subcommand === "enable") {
    await handleBrainToggle(slackUserId, true, respond)
    return
  }

  if (subcommand === "disable") {
    await handleBrainToggle(slackUserId, false, respond)
    return
  }

  if (subcommand === "clear") {
    await handleBrainClear(slackUserId, respond)
    return
  }

  if (subcommand?.startsWith("set ")) {
    await handleBrainSet(slackUserId, subcommand, respond)
    return
  }

  await showBrainStatus(slackUserId, respond)
}

export const handleFeedbackCommand = async (
  args: CommandArgs,
  feedbackMessage: string
): Promise<void> => {
  const { respond } = args

  if (!feedbackMessage.trim()) {
    await respond({
      text: "Please provide your feedback. Example: `/ally feedback I love the natural language scheduling!`",
      response_type: "ephemeral",
    })
    return
  }

  logger.info(`Slack Bot: Feedback received: ${feedbackMessage}`)

  const response = SlackResponseBuilder.create()
    .header("💬", "Thanks for your feedback!")
    .section(
      "Your input helps us make Ally better. The team will review your message."
    )
    .context(["We appreciate you taking the time to share your thoughts ✨"])
    .build()

  await respond({
    blocks: response.blocks,
    text: response.text,
    response_type: "ephemeral",
  })
}

type SimpleCommandHandler = (args: CommandArgs) => Promise<void>
type PrefixCommandHandler = (
  args: CommandArgs,
  content: string
) => Promise<void>

const SIMPLE_COMMANDS: Record<string, SimpleCommandHandler> = {
  help: handleHelpCommand,
  today: handleTodayCommand,
  tomorrow: handleTomorrowCommand,
  week: handleWeekCommand,
  month: handleMonthCommand,
  free: handleFreeCommand,
  busy: handleBusyCommand,
  status: handleStatusCommand,
  settings: handleSettingsCommand,
  analytics: handleAnalyticsCommand,
  calendars: handleCalendarsCommand,
}

const PREFIX_COMMANDS: Array<{
  prefix: string
  handler: PrefixCommandHandler
  length: number
}> = [
  {
    prefix: "create ",
    handler: handleCreateCommand,
    length: COMMAND_PREFIX_LENGTHS.CREATE,
  },
  {
    prefix: "update ",
    handler: handleUpdateCommand,
    length: COMMAND_PREFIX_LENGTHS.UPDATE,
  },
  {
    prefix: "delete ",
    handler: handleDeleteCommand,
    length: COMMAND_PREFIX_LENGTHS.DELETE,
  },
  {
    prefix: "search ",
    handler: handleSearchCommand,
    length: COMMAND_PREFIX_LENGTHS.SEARCH,
  },
  {
    prefix: "feedback ",
    handler: handleFeedbackCommand,
    length: COMMAND_PREFIX_LENGTHS.FEEDBACK,
  },
]

const routeSimpleCommand = (
  text: string,
  args: CommandArgs
): Promise<void> | null => {
  const handler = SIMPLE_COMMANDS[text]
  return handler ? handler(args) : null
}

const routePrefixCommand = (
  text: string,
  fullText: string,
  args: CommandArgs
): Promise<void> | null => {
  for (const { prefix, handler, length } of PREFIX_COMMANDS) {
    if (text.startsWith(prefix)) {
      return handler(args, fullText.slice(length))
    }
  }
  return null
}

const routeBrainCommand = (
  text: string,
  fullText: string,
  args: CommandArgs
): Promise<void> | null => {
  if (text === "brain") {
    return handleBrainCommand(args, undefined)
  }
  if (text.startsWith("brain ")) {
    return handleBrainCommand(
      args,
      fullText.slice(COMMAND_PREFIX_LENGTHS.BRAIN).trim()
    )
  }
  return null
}

const handleFallbackAgentRequest = async (
  args: CommandArgs,
  fullText: string
): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)

  if (!(auth.authorized && auth.email)) {
    return
  }

  await respond({
    text: "Processing your request...",
    response_type: "ephemeral",
  })

  try {
    const response = await handleAgentRequest({
      message: fullText,
      email: auth.email,
      slackUserId: command.user_id,
      teamId: command.team_id,
    })

    await respond({
      text: response,
      response_type: "in_channel",
    })
  } catch (error) {
    logger.error(`Slack Bot: Command error: ${error}`)
    await respond({
      text: "Sorry, I couldn't process your request. Please try again.",
      response_type: "ephemeral",
    })
  }
}

export const parseAndRouteCommand = async (
  args: CommandArgs
): Promise<void> => {
  const { command } = args
  const text = command.text.trim().toLowerCase()
  const fullText = command.text.trim()

  if (!text || text === "help") {
    await handleHelpCommand(args)
    return
  }

  const simpleResult = routeSimpleCommand(text, args)
  if (simpleResult) {
    await simpleResult
    return
  }

  const prefixResult = routePrefixCommand(text, fullText, args)
  if (prefixResult) {
    await prefixResult
    return
  }

  const brainResult = routeBrainCommand(text, fullText, args)
  if (brainResult) {
    await brainResult
    return
  }

  await handleFallbackAgentRequest(args, fullText)
}
