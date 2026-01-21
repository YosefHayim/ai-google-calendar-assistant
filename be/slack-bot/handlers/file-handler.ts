import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt"
import type { WebClient } from "@slack/web-api"
import { transcribeAudio } from "@/domains/analytics/utils"
import { logger } from "@/lib/logger"
import {
  executeConfirmation,
  extractEventsFromFiles,
  type FileContent,
  formatEventsForConfirmation,
  getPendingEvents,
  isSupportedMimeType,
  processFileBuffer,
  type SupportedMimeType,
  storePendingEvents,
} from "@/shared/ocr"
import { handleAgentRequest } from "@/slack-bot/handlers/agent-handler"
import { handleSlackAuth } from "@/slack-bot/middleware/auth-handler"
import { checkRateLimit } from "@/slack-bot/middleware/rate-limiter"

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
const MODALITY = "slack" as const

const isAudioFile = (mimetype?: string): boolean => {
  if (!mimetype) {
    return false
  }
  return AUDIO_MIMETYPES.some((type) => mimetype.startsWith(type))
}

const isOCRSupportedFile = (mimetype?: string): boolean => {
  if (!mimetype) {
    return false
  }
  return isSupportedMimeType(mimetype)
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

const sendMessage = async (
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

type FileContext = {
  client: WebClient
  userId: string
  teamId: string
  channelId: string
  fileId: string
}

type SlackFile = {
  mimetype?: string
  url_private_download?: string
  url_private?: string
  name?: string
}

const processVoiceFile = async (
  ctx: FileContext,
  file: SlackFile,
  email: string
): Promise<void> => {
  const { client, userId, teamId, channelId, fileId } = ctx

  const downloadUrl = file.url_private_download ?? file.url_private
  if (!downloadUrl) {
    logger.error(`Slack Bot: No download URL for file ${fileId}`)
    await sendMessage(
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
    await sendMessage(
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
    await sendMessage(
      client,
      channelId,
      "Sorry, I couldn't understand your voice message. Please try again or type your message."
    )
    return
  }

  const transcribedText = transcription.text ?? ""
  if (!transcribedText) {
    await sendMessage(
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

type OCRFileParams = {
  ctx: FileContext
  file: SlackFile
  timezone: string
}

const processOCRFile = async (params: OCRFileParams): Promise<void> => {
  const { ctx, file, timezone } = params
  const { client, userId, channelId, fileId } = ctx
  const mimeType = file.mimetype as SupportedMimeType
  const filename = file.name || "unknown"

  logger.info(`Slack Bot: Processing OCR file: ${filename} (${mimeType})`)

  const downloadUrl = file.url_private_download ?? file.url_private
  if (!downloadUrl) {
    logger.error(`Slack Bot: No download URL for file ${fileId}`)
    await sendMessage(
      client,
      channelId,
      "Sorry, I couldn't access your file. Please try again."
    )
    return
  }

  const token = getClientToken(client)
  if (!token) {
    logger.error("Slack Bot: No token available for file download")
    await sendMessage(
      client,
      channelId,
      "Sorry, authentication error occurred."
    )
    return
  }

  const fileBuffer = await downloadSlackFile(downloadUrl, token)
  if (!fileBuffer) {
    await sendMessage(
      client,
      channelId,
      "Sorry, I couldn't download your file. Please try again."
    )
    return
  }

  const processResult = processFileBuffer(fileBuffer, mimeType, filename)

  if (!processResult.success) {
    await sendMessage(
      client,
      channelId,
      `Sorry, I couldn't process ${filename}. ${processResult.error || "Please check the file format."}`
    )
    return
  }

  if (
    processResult.extractedEvents &&
    processResult.extractedEvents.length > 0
  ) {
    const result = {
      events: processResult.extractedEvents,
      overallConfidence: "high" as const,
      warnings: [] as string[],
      fileCount: 1,
    }

    await storePendingEvents({
      userId,
      modality: MODALITY,
      result,
      userTimezone: timezone,
      fileNames: [filename],
    })

    const formattedEvents = formatEventsForConfirmation(result.events, MODALITY)
    await sendMessage(
      client,
      channelId,
      `${formattedEvents}\n\nWould you like me to add these to your calendar? Reply "yes" to confirm or "no" to cancel.`
    )

    logger.info(
      `Slack Bot: Found ${result.events.length} events from ICS/spreadsheet for user ${userId}`
    )
    return
  }

  if (!processResult.content) {
    await sendMessage(
      client,
      channelId,
      `Sorry, I couldn't extract any content from ${filename}.`
    )
    return
  }

  const files: FileContent[] = [processResult.content]
  const extractionResult = await extractEventsFromFiles({
    files,
    userTimezone: timezone,
    additionalContext: `File: ${filename}`,
  })

  const extractionFailed = !extractionResult.success
  const noExtractionResult = !extractionResult.result
  if (extractionFailed || noExtractionResult) {
    const errorDetail =
      extractionResult.error || "The file might not contain calendar data."
    await sendMessage(
      client,
      channelId,
      `Sorry, I couldn't find any events in ${filename}. ${errorDetail}`
    )
    return
  }

  if (extractionResult.result.events.length === 0) {
    await sendMessage(
      client,
      channelId,
      `I analyzed ${filename} but couldn't find any events. Make sure the file contains schedule information with dates and times.`
    )
    return
  }

  await storePendingEvents({
    userId,
    modality: MODALITY,
    result: extractionResult.result,
    userTimezone: timezone,
    fileNames: [filename],
  })

  const formattedEvents = formatEventsForConfirmation(
    extractionResult.result.events,
    MODALITY
  )

  await sendMessage(
    client,
    channelId,
    `${formattedEvents}\n\nWould you like me to add these to your calendar? Reply "yes" to confirm or "no" to cancel.`
  )

  logger.info(
    `Slack Bot: Found ${extractionResult.result.events.length} events for user ${userId}`
  )
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

    const isAudio = isAudioFile(file.mimetype)
    const isOCR = isOCRSupportedFile(file.mimetype)
    const notAudio = !isAudio
    const notOCR = !isOCR

    if (notAudio && notOCR) {
      logger.debug(
        `Slack Bot: Skipping unsupported file type: ${file.filetype}`
      )
      return
    }

    logger.info(`Slack Bot: Processing file: ${file.name} (${file.mimetype})`)

    const rateCheck = checkRateLimit(user_id, "message")
    if (!rateCheck.allowed) {
      await sendMessage(
        client,
        channel_id,
        `You're sending files too quickly. Please wait ${rateCheck.resetIn} seconds.`
      )
      return
    }

    const fileType = isAudio ? "[voice]" : "[document]"
    const authResult = await handleSlackAuth(client, user_id, teamId, fileType)

    if (authResult.needsAuth) {
      await sendMessage(
        client,
        channel_id,
        authResult.authMessage ?? "Please authenticate to use Ally."
      )
      return
    }

    if (!authResult.session.email) {
      await sendMessage(
        client,
        channel_id,
        "I couldn't find your email. Please enter your email address to get started."
      )
      return
    }

    const ctx: FileContext = {
      client,
      userId: user_id,
      teamId,
      channelId: channel_id,
      fileId: file_id,
    }

    if (isAudio) {
      await processVoiceFile(ctx, file, authResult.session.email)
    } else {
      const timezone = authResult.session.timezone || "UTC"
      await processOCRFile({ ctx, file, timezone })
    }
  } catch (error) {
    logger.error(`Slack Bot: Error processing file: ${error}`)
    await sendMessage(
      client,
      channel_id,
      "Sorry, I encountered an error processing your file."
    )
  }
}

type OCRConfirmationParams = {
  client: WebClient
  userId: string
  channelId: string
  email: string
  action: "confirm" | "cancel"
}

export const handleOCRConfirmation = async (
  params: OCRConfirmationParams
): Promise<boolean> => {
  const { client, userId, channelId, email, action } = params
  const pendingOCR = await getPendingEvents(userId, MODALITY)
  if (!pendingOCR) {
    return false
  }

  if (action === "cancel") {
    await executeConfirmation({
      userId,
      modality: MODALITY,
      action: "cancel",
      userEmail: email,
    })
    await sendMessage(client, channelId, "Operation cancelled.")
    return true
  }

  const result = await executeConfirmation({
    userId,
    modality: MODALITY,
    action: "confirm_all",
    userEmail: email,
  })

  if (!result.success) {
    const errorMsg =
      result.errors.length > 0 ? result.errors.join(", ") : "Unknown error"
    await sendMessage(
      client,
      channelId,
      `Sorry, I couldn't add the events: ${errorMsg}`
    )
    return true
  }

  if (result.createdCount === 0) {
    await sendMessage(client, channelId, "No events were added.")
    return true
  }

  const eventText = result.createdCount === 1 ? "event" : "events"
  await sendMessage(
    client,
    channelId,
    `✅ Successfully added ${result.createdCount} ${eventText} to your calendar!`
  )

  return true
}

export const hasPendingOCREvents = async (userId: string): Promise<boolean> => {
  const pending = await getPendingEvents(userId, MODALITY)
  return pending !== null
}
