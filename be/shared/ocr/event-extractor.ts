import type { Part } from "@google/genai"
import { format } from "date-fns"
import {
  GEMINI_MODELS,
  getGeminiClient,
} from "@/infrastructure/google/gemini-client"
import { logger } from "@/lib/logger"
import {
  EVENT_EXTRACTION_SYSTEM_PROMPT,
  buildExtractionPrompt,
} from "./prompts"
import type {
  ExtractedEvent,
  ExtractedEventsResult,
  FileContent,
  OCRProcessingResult,
} from "./types"
import { ExtractedEventsResultSchema } from "./types"

const LOG_PREFIX = "[OCRExtractor]"
const GEMINI_MODEL = GEMINI_MODELS.FLASH
const RADIX_36 = 36
const RANDOM_SUBSTRING_START = 2
const RANDOM_SUBSTRING_END = 8
const JSON_PATTERN = /\{[\s\S]*\}/

type ExtractEventsParams = {
  files: FileContent[]
  userTimezone: string
  additionalContext?: string
}

const generateEventId = (): string => {
  const timestamp = Date.now().toString(RADIX_36)
  const random = Math.random()
    .toString(RADIX_36)
    .substring(RANDOM_SUBSTRING_START, RANDOM_SUBSTRING_END)
  return `ocr-${timestamp}-${random}`
}

const buildImagePart = (file: FileContent): Part => ({
  inlineData: {
    mimeType: file.mimeType,
    data: file.data,
  },
})

const parseGeminiResponse = (
  responseText: string
): ExtractedEventsResult | null => {
  try {
    const jsonMatch = responseText.match(JSON_PATTERN)
    if (!jsonMatch) {
      logger.error(`${LOG_PREFIX} No JSON found in response`)
      return null
    }

    const parsed = JSON.parse(jsonMatch[0])

    if (!parsed.events) {
      parsed.events = []
    }

    parsed.events = parsed.events.map((event: ExtractedEvent) => ({
      ...event,
      id: event.id || generateEventId(),
      source: "ocr" as const,
      confidence: event.confidence || "medium",
      isAllDay: event.isAllDay ?? false,
    }))

    if (!parsed.overallConfidence) {
      parsed.overallConfidence = parsed.events.length > 0 ? "medium" : "high"
    }

    if (!parsed.warnings) {
      parsed.warnings = []
    }

    if (!parsed.fileCount) {
      parsed.fileCount = 1
    }

    const validated = ExtractedEventsResultSchema.safeParse(parsed)
    if (!validated.success) {
      logger.error(`${LOG_PREFIX} Validation failed:`, validated.error)
      return null
    }

    return validated.data
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to parse response:`, error)
    return null
  }
}

export const extractEventsFromFiles = async (
  params: ExtractEventsParams
): Promise<OCRProcessingResult> => {
  const startTime = Date.now()
  const { files, userTimezone, additionalContext } = params

  if (files.length === 0) {
    return {
      success: false,
      error: "No files provided",
      processingTimeMs: Date.now() - startTime,
    }
  }

  logger.info(`${LOG_PREFIX} Processing ${files.length} file(s)`)

  try {
    const client = getGeminiClient()
    const currentDate = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX")

    const imageParts: Part[] = files
      .filter((f) => f.type === "image" || f.type === "pdf")
      .map(buildImagePart)

    const textContent = files
      .filter((f) => f.type === "spreadsheet" || f.type === "ics")
      .map((f) => f.data)
      .join("\n\n---\n\n")

    const userPrompt = buildExtractionPrompt(
      userTimezone,
      currentDate,
      files.length,
      additionalContext
    )

    const parts: Part[] = [
      { text: EVENT_EXTRACTION_SYSTEM_PROMPT },
      ...imageParts,
    ]

    if (textContent) {
      parts.push({ text: `\n\nExtracted text content:\n${textContent}` })
    }

    parts.push({ text: userPrompt })

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts }],
      config: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    })

    const responseText = response.text ?? ""

    if (!responseText) {
      logger.error(`${LOG_PREFIX} Empty response from Gemini`)
      return {
        success: false,
        error: "Empty response from AI model",
        processingTimeMs: Date.now() - startTime,
      }
    }

    const result = parseGeminiResponse(responseText)

    if (!result) {
      return {
        success: false,
        error: "Failed to parse extraction results",
        processingTimeMs: Date.now() - startTime,
      }
    }

    result.fileCount = files.length

    logger.info(
      `${LOG_PREFIX} Extracted ${result.events.length} events from ${files.length} file(s)`
    )

    return {
      success: true,
      result,
      processingTimeMs: Date.now() - startTime,
    }
  } catch (error) {
    logger.error(`${LOG_PREFIX} Extraction failed:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      processingTimeMs: Date.now() - startTime,
    }
  }
}

export const extractEventsFromImages = (
  images: Array<{ data: string; mimeType: string }>,
  userTimezone: string,
  additionalContext?: string
): Promise<OCRProcessingResult> => {
  const files: FileContent[] = images.map((img) => ({
    type: "image" as const,
    data: img.data,
    mimeType: img.mimeType as FileContent["mimeType"],
  }))

  return extractEventsFromFiles({ files, userTimezone, additionalContext })
}
