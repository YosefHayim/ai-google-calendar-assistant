import type { SlackCommandMiddlewareArgs, AllMiddlewareArgs } from "@slack/bolt"
import { SlackResponseBuilder } from "../utils/response-builder"
import { handleAgentRequest } from "./agent-handler"
import { getSession } from "../utils/session"
import { handleSlackAuth } from "../middleware/auth-handler"
import { logger } from "@/utils/logger"

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
    .header("✨", "Ally - Your AI Calendar Assistant")
    .section(
      "I can help you manage your Google Calendar using natural language. Here's what I can do:"
    )
    .divider()
    .section("*📅 View Schedule*")
    .bulletList([
      "`/ally today` - Today's schedule",
      "`/ally tomorrow` - Tomorrow's agenda",
      "`/ally week` - This week at a glance",
      "`/ally month` - Monthly overview",
    ])
    .section("*⚡ Manage Events*")
    .bulletList([
      "`/ally create <description>` - Schedule something",
      "`/ally free` - Find open time slots",
      "`/ally busy` - View your commitments",
    ])
    .section("*🛠️ Settings*")
    .bulletList([
      "`/ally status` - Check connection",
      "`/ally help` - Show this help",
    ])
    .divider()
    .context(["💬 Or just talk to me naturally! Try: \"What do I have tomorrow?\""])
    .build()

  await respond({
    blocks: response.blocks,
    text: response.text,
    response_type: "ephemeral",
  })
}

export const handleTodayCommand = async (args: CommandArgs): Promise<void> => {
  const { command, client, respond } = args
  const auth = await requireAuth(args)
  if (!auth.authorized || !auth.email) return

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

export const handleTomorrowCommand = async (args: CommandArgs): Promise<void> => {
  const { command, respond } = args
  const auth = await requireAuth(args)
  if (!auth.authorized || !auth.email) return

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
  if (!auth.authorized || !auth.email) return

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
  if (!auth.authorized || !auth.email) return

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
  if (!auth.authorized || !auth.email) return

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
  if (!auth.authorized || !auth.email) return

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
    .field("Connection", authResult.session.email ? "✅ Connected" : "❌ Not connected")
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
  if (!auth.authorized || !auth.email) return

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

export const parseAndRouteCommand = async (args: CommandArgs): Promise<void> => {
  const { command } = args
  const text = command.text.trim().toLowerCase()
  const fullText = command.text.trim()

  if (!text || text === "help") {
    return handleHelpCommand(args)
  }

  if (text === "today") {
    return handleTodayCommand(args)
  }

  if (text === "tomorrow") {
    return handleTomorrowCommand(args)
  }

  if (text === "week") {
    return handleWeekCommand(args)
  }

  if (text === "month") {
    return handleMonthCommand(args)
  }

  if (text === "free") {
    return handleFreeCommand(args)
  }

  if (text === "busy") {
    return handleBusyCommand(args)
  }

  if (text === "status") {
    return handleStatusCommand(args)
  }

  if (text.startsWith("create ")) {
    return handleCreateCommand(args, fullText.slice(7))
  }

  const auth = await requireAuth(args)
  if (!auth.authorized || !auth.email) return

  const { respond } = args

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
