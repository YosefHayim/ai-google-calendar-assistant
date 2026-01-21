import { logger } from "@/lib/logger"
import type {
  ExtractedEvent,
  FileContent,
  FileProcessorResult,
  SupportedMimeType,
} from "../types"
import { SUPPORTED_FILE_TYPES } from "../types"
import { processICSBuffer } from "./ics-processor"
import { processSpreadsheetBuffer } from "./spreadsheet-processor"

const LOG_PREFIX = "[FileProcessor]"

export const processFileBuffer = (
  buffer: Buffer,
  mimeType: SupportedMimeType,
  filename?: string
): FileProcessorResult => {
  const fileType = SUPPORTED_FILE_TYPES[mimeType]

  logger.info(`${LOG_PREFIX} Processing ${fileType} file: ${filename || "unknown"}`)

  switch (fileType) {
    case "ics":
      return processICSBuffer(buffer)

    case "spreadsheet":
      return processSpreadsheetBuffer(buffer, mimeType)

    case "image":
    case "pdf":
      return {
        success: true,
        content: {
          type: fileType,
          data: buffer.toString("base64"),
          mimeType,
          filename,
        },
      }

    default:
      return {
        success: false,
        error: `Unsupported file type: ${mimeType}`,
      }
  }
}

export const processFileBase64 = (
  base64Data: string,
  mimeType: SupportedMimeType,
  filename?: string
): FileProcessorResult => {
  const buffer = Buffer.from(base64Data, "base64")
  return processFileBuffer(buffer, mimeType, filename)
}

export const isSupportedMimeType = (
  mimeType: string
): mimeType is SupportedMimeType => mimeType in SUPPORTED_FILE_TYPES

export const getFileTypeFromMimeType = (
  mimeType: SupportedMimeType
): FileContent["type"] => SUPPORTED_FILE_TYPES[mimeType]

export const combineExtractedEvents = (
  results: FileProcessorResult[]
): ExtractedEvent[] => {
  const events: ExtractedEvent[] = []

  for (const result of results) {
    if (result.success && result.extractedEvents) {
      events.push(...result.extractedEvents)
    }
  }

  return events
}
