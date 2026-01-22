import type { Api } from "grammy"
import type { Document } from "grammy/types"
import { logger } from "@/lib/logger"
import {
  type ExtractedEventsResult,
  extractEventsFromFiles,
  type FileContent,
  formatEventsForConfirmation,
  isSupportedMimeType,
  type Modality,
  processFileBuffer,
  type SupportedMimeType,
  storePendingEvents,
} from "@/shared/ocr"

const LOG_PREFIX = "[TGDocHandler]"
const MAX_FILE_SIZE_MB = 20
const BYTES_PER_KB = 1024
const KB_PER_MB = 1024
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * KB_PER_MB * BYTES_PER_KB
const MODALITY: Modality = "telegram"

type DocumentProcessingResult = {
  success: boolean
  message: string
  pendingKey?: string
  eventsCount?: number
  result?: ExtractedEventsResult
}

type DocumentContext = {
  userId: string
  userTimezone: string
}

const downloadDocument = async (
  api: Api,
  fileId: string
): Promise<{ buffer: Buffer; filePath: string } | null> => {
  try {
    const file = await api.getFile(fileId)
    if (!file.file_path) {
      logger.error(`${LOG_PREFIX} No file path returned for file ${fileId}`)
      return null
    }

    if (file.file_size && file.file_size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = Math.round(file.file_size / BYTES_PER_KB / KB_PER_MB)
      logger.warn(`${LOG_PREFIX} File too large: ${fileSizeMB}MB`)
      return null
    }

    const fileUrl = `https://api.telegram.org/file/bot${api.token}/${file.file_path}`
    const response = await fetch(fileUrl)

    if (!response.ok) {
      logger.error(`${LOG_PREFIX} Failed to download file: ${response.status}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    return {
      buffer: Buffer.from(arrayBuffer),
      filePath: file.file_path,
    }
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error downloading document: ${error}`)
    return null
  }
}

const getMimeTypeFromDocument = (doc: Document): string => {
  if (doc.mime_type) {
    return doc.mime_type
  }

  const filename = doc.file_name || ""
  const ext = filename.split(".").pop()?.toLowerCase()

  switch (ext) {
    case "pdf":
      return "application/pdf"
    case "ics":
      return "text/calendar"
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    case "xls":
      return "application/vnd.ms-excel"
    case "csv":
      return "text/csv"
    case "jpg":
    case "jpeg":
      return "image/jpeg"
    case "png":
      return "image/png"
    case "webp":
      return "image/webp"
    case "gif":
      return "image/gif"
    default:
      return "application/octet-stream"
  }
}

export const isOCRSupportedDocument = (doc: Document): boolean => {
  const mimeType = getMimeTypeFromDocument(doc)
  return isSupportedMimeType(mimeType)
}

export const processDocument = async (
  api: Api,
  document: Document,
  ctx: DocumentContext
): Promise<DocumentProcessingResult> => {
  const { userId, userTimezone } = ctx
  const mimeType = getMimeTypeFromDocument(document)
  const filename = document.file_name || "unknown"

  logger.info(
    `${LOG_PREFIX} Processing document for user ${userId}: ${filename} (${mimeType})`
  )

  if (!isSupportedMimeType(mimeType)) {
    return {
      success: false,
      message: `Sorry, I can't extract events from ${filename}. Supported formats: PDF, ICS, Excel (xlsx/xls), CSV, and images (jpg, png, webp, gif).`,
    }
  }

  const downloaded = await downloadDocument(api, document.file_id)
  if (!downloaded) {
    return {
      success: false,
      message:
        "Sorry, I couldn't download your file. Please try again or send a smaller file.",
    }
  }

  const processResult = processFileBuffer(
    downloaded.buffer,
    mimeType as SupportedMimeType,
    filename
  )

  if (!processResult.success) {
    return {
      success: false,
      message: `Sorry, I couldn't process ${filename}. ${processResult.error || "Please check the file format."}`,
    }
  }

  if (
    processResult.extractedEvents &&
    processResult.extractedEvents.length > 0
  ) {
    const result: ExtractedEventsResult = {
      events: processResult.extractedEvents,
      overallConfidence: "high",
      warnings: [],
      fileCount: 1,
    }

    const pendingKey = await storePendingEvents({
      userId,
      modality: MODALITY,
      result,
      userTimezone,
      fileNames: [filename],
    })

    const formattedEvents = formatEventsForConfirmation(result.events, MODALITY)

    return {
      success: true,
      message: `${formattedEvents}\n\nWould you like me to add these to your calendar?`,
      pendingKey,
      eventsCount: result.events.length,
      result,
    }
  }

  if (!processResult.content) {
    return {
      success: false,
      message: `Sorry, I couldn't extract any content from ${filename}.`,
    }
  }

  const files: FileContent[] = [processResult.content]
  const extractionResult = await extractEventsFromFiles({
    files,
    userTimezone,
    additionalContext: `File: ${filename}`,
  })

  const extractionFailed = !extractionResult.success
  const extractedResult = extractionResult.result
  if (extractionFailed || !extractedResult) {
    const errorDetail =
      extractionResult.error || "The file might not contain calendar data."
    return {
      success: false,
      message: `Sorry, I couldn't find any events in ${filename}. ${errorDetail}`,
    }
  }

  if (extractedResult.events.length === 0) {
    return {
      success: false,
      message: `I analyzed ${filename} but couldn't find any events. Make sure the file contains schedule information with dates and times.`,
    }
  }

  const pendingKey = await storePendingEvents({
    userId,
    modality: MODALITY,
    result: extractedResult,
    userTimezone,
    fileNames: [filename],
  })

  const formattedEvents = formatEventsForConfirmation(
    extractedResult.events,
    MODALITY
  )

  return {
    success: true,
    message: `${formattedEvents}\n\nWould you like me to add these to your calendar? Reply "yes" to confirm or "no" to cancel.`,
    pendingKey,
    eventsCount: extractedResult.events.length,
    result: extractedResult,
  }
}

type DocumentCollectionResult = {
  files: FileContent[]
  fileNames: string[]
  errors: string[]
}

const processSingleDocumentForCollection = async (
  api: Api,
  doc: Document
): Promise<{
  file?: FileContent
  filename: string
  error?: string
}> => {
  const mimeType = getMimeTypeFromDocument(doc)
  const filename = doc.file_name || "unknown"

  if (!isSupportedMimeType(mimeType)) {
    return { filename, error: "unsupported format" }
  }

  const downloaded = await downloadDocument(api, doc.file_id)
  if (!downloaded) {
    return { filename, error: "download failed" }
  }

  const processResult = processFileBuffer(
    downloaded.buffer,
    mimeType as SupportedMimeType,
    filename
  )

  if (!processResult.success) {
    return { filename, error: processResult.error || "processing failed" }
  }

  if (processResult.extractedEvents) {
    return {
      filename,
      file: {
        type: "ics",
        data: JSON.stringify(processResult.extractedEvents),
        mimeType: "text/calendar",
        filename,
      },
    }
  }

  if (processResult.content) {
    return { filename, file: processResult.content }
  }

  return { filename }
}

const collectDocumentFiles = async (
  api: Api,
  documents: Document[]
): Promise<DocumentCollectionResult> => {
  const files: FileContent[] = []
  const fileNames: string[] = []
  const errors: string[] = []

  for (const doc of documents) {
    const result = await processSingleDocumentForCollection(api, doc)

    if (result.error) {
      errors.push(`${result.filename}: ${result.error}`)
      continue
    }

    if (result.file) {
      files.push(result.file)
      fileNames.push(result.filename)
    }
  }

  return { files, fileNames, errors }
}

export const processMultipleDocuments = async (
  api: Api,
  documents: Document[],
  ctx: DocumentContext
): Promise<DocumentProcessingResult> => {
  const { userId, userTimezone } = ctx
  const { files, fileNames, errors } = await collectDocumentFiles(
    api,
    documents
  )

  if (files.length === 0) {
    const issuesText = errors.length > 0 ? `Issues: ${errors.join(", ")}` : ""
    return {
      success: false,
      message: `Sorry, I couldn't process any of the files. ${issuesText}`,
    }
  }

  const extractionResult = await extractEventsFromFiles({
    files,
    userTimezone,
    additionalContext: `Files: ${fileNames.join(", ")}`,
  })

  const multiExtractionFailed = !extractionResult.success
  const extractedResult = extractionResult.result
  if (multiExtractionFailed || !extractedResult) {
    const errorDetail = extractionResult.error || ""
    return {
      success: false,
      message: `Sorry, I couldn't extract events from the files. ${errorDetail}`,
    }
  }

  if (extractedResult.events.length === 0) {
    return {
      success: false,
      message:
        "I analyzed the files but couldn't find any events with dates and times.",
    }
  }

  const pendingKey = await storePendingEvents({
    userId,
    modality: MODALITY,
    result: extractedResult,
    userTimezone,
    fileNames,
  })

  const formattedEvents = formatEventsForConfirmation(
    extractedResult.events,
    MODALITY
  )

  let message = `${formattedEvents}\n\nWould you like me to add these to your calendar? Reply "yes" to confirm or "no" to cancel.`

  if (errors.length > 0) {
    message += `\n\n⚠️ Some files had issues: ${errors.join(", ")}`
  }

  return {
    success: true,
    message,
    pendingKey,
    eventsCount: extractedResult.events.length,
    result: extractedResult,
  }
}
