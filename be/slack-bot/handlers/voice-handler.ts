import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt"
import type { WebClient } from "@slack/web-api"
import { transcribeAudio } from "@/domains/analytics/utils"
import { logger } from "@/lib/logger"
import { handleSlackAuth } from "@/slack-bot/middleware/auth-handler"
import { checkRateLimit } from "@/slack-bot/middleware/rate-limiter"
import { handleAgentRequest } from "@/slack-bot/handlers/agent-handler"

type FileSharedArgs = SlackEventMiddlewareArgs<"file_shared"> &
  AllMiddlewareArgs

const AUDIO_MIMETYPES = [
  "audio/webm",
  "audio/mp3",
  "audio/mpeg",
  "audio/mp4",
  "audio/m4a",
  "audio/wav",
  "audio/ogg",
  "audio/flac",
  "audio/x-m4a",
]

const LOG_PREVIEW_LENGTH = 50

const isAudioFile = (mimetype?: string): boolean => {
  if (!mimetype) {
    return false
  }
  return AUDIO_MIMETYPES.some((type) => mimetype.startsWith(type))
}

const downloadSlackFile = async (
  url: string,
  token: string
): Promise<Buffer | null> => {
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      logger.error(`Slack Bot: File download failed: ${response.statusText}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    logger.error(`Slack Bot: Error downloading file: ${error}`)
    return null
  }
}

const sendErrorMessage = async (
  client: WebClient,
  channel: string,
  text: string
): Promise<void> => {
  await client.chat.postMessage({ channel, text })
}

const getClientToken = (client: WebClient): string | null => {
  if ("botToken" in client && client.botToken) {
    return client.botToken as string
  }
  if ("token" in client && client.token) {
    return client.token as string
  }
  return null
}

type VoiceContext = {
  client: WebClient
  userId: string
  teamId: string
  channelId: string
  fileId: string
}

const processVoiceFile = async (
  ctx: VoiceContext,
  file: {
    mimetype?: string
    url_private_download?: string
    url_private?: string
    name?: string
  },
  email: string
): Promise<void> => {
  const { client, userId, teamId, channelId, fileId } = ctx

  const downloadUrl = file.url_private_download ?? file.url_private
  if (!downloadUrl) {
    logger.error(`Slack Bot: No download URL for file ${fileId}`)
    await sendErrorMessage(
      client,
      channelId,
      "Sorry, I couldn't access your voice message. Please try again."
    )
    return
  }

  const token = getClientToken(client)
  if (!token) {
    logger.error("Slack Bot: No token available for file download")
    return
  }

  const audioBuffer = await downloadSlackFile(downloadUrl, token)
  if (!audioBuffer) {
    await sendErrorMessage(
      client,
      channelId,
      "Sorry, I couldn't download your voice message. Please try again."
    )
    return
  }

  const transcription = await transcribeAudio(
    audioBuffer,
    file.mimetype ?? "audio/webm"
  )

  if (!transcription.success) {
    logger.error(`Slack Bot: Transcription failed: ${transcription.error}`)
    await sendErrorMessage(
      client,
      channelId,
      "Sorry, I couldn't understand your voice message. Please try again or type your message."
    )
    return
  }

  const transcribedText = transcription.text ?? ""
  if (!transcribedText) {
    await sendErrorMessage(
      client,
      channelId,
      "Sorry, I couldn't understand your voice message. Please try again or type your message."
    )
    return
  }

  logger.info(
    `Slack Bot: Transcribed voice from ${userId}: "${transcribedText.slice(0, LOG_PREVIEW_LENGTH)}..."`
  )

  const response = await handleAgentRequest({
    message: transcribedText,
    email,
    slackUserId: userId,
    teamId,
  })

  await client.chat.postMessage({ channel: channelId, text: response })
}

export const handleFileShared = async (args: FileSharedArgs): Promise<void> => {
  const { event, client } = args
  const { file_id, user_id, channel_id } = event
  const teamId = "team_id" in event ? (event.team_id as string) : "unknown"

  const hasRequiredFields = user_id && file_id && channel_id
  if (!hasRequiredFields) {
    return
  }

  logger.info(`Slack Bot: File shared by ${user_id}: ${file_id}`)

  try {
    const fileInfo = await client.files.info({ file: file_id })

    if (!fileInfo.file) {
      logger.warn(`Slack Bot: File not found: ${file_id}`)
      return
    }

    const file = fileInfo.file

    if (!isAudioFile(file.mimetype)) {
      logger.debug(`Slack Bot: Skipping non-audio file: ${file.filetype}`)
      return
    }

    logger.info(
      `Slack Bot: Processing audio file: ${file.name} (${file.mimetype})`
    )

    const rateCheck = checkRateLimit(user_id, "message")
    if (!rateCheck.allowed) {
      await sendErrorMessage(
        client,
        channel_id,
        `You're sending voice messages too quickly. Please wait ${rateCheck.resetIn} seconds.`
      )
      return
    }

    const authResult = await handleSlackAuth(client, user_id, teamId, "[voice]")

    if (authResult.needsAuth) {
      await sendErrorMessage(
        client,
        channel_id,
        authResult.authMessage ?? "Please authenticate to use Ally."
      )
      return
    }

    if (!authResult.session.email) {
      await sendErrorMessage(
        client,
        channel_id,
        "I couldn't find your email. Please enter your email address to get started."
      )
      return
    }

    const ctx: VoiceContext = {
      client,
      userId: user_id,
      teamId,
      channelId: channel_id,
      fileId: file_id,
    }

    await processVoiceFile(ctx, file, authResult.session.email)
  } catch (error) {
    logger.error(`Slack Bot: Error processing voice message: ${error}`)
    await sendErrorMessage(
      client,
      channel_id,
      "Sorry, I encountered an error processing your voice message."
    )
  }
}
