import type { Request, Response } from "express"
import { STATUS_RESPONSE } from "@/config/constants"
import { isFeatureEnabledForUser } from "@/domains/settings/utils/feature-flags"
import { reqResAsyncHandler, sendR } from "@/lib/http"
import { logger } from "@/lib/logger"
import {
  clearPendingEvents,
  type ExtractedEventsResult,
  executeConfirmation,
  extractEventsFromFiles,
  type FileContent,
  getPendingEvents,
  isSupportedMimeType,
  MAX_FILE_SIZE_MB,
  MAX_FILES_PER_REQUEST,
  type SupportedMimeType,
  storePendingEvents,
} from "@/shared/ocr"

const KB_IN_BYTES = 1024
const BYTES_PER_MB = KB_IN_BYTES * KB_IN_BYTES

type FilesPayload = { files: FileContent[] }
type ActionPayload = { action: "confirm" | "cancel" }

function validateFile(file: FileContent): { valid: boolean; error?: string } {
  if (!file.data) {
    return { valid: false, error: "File missing data" }
  }

  if (!file.mimeType) {
    return { valid: false, error: "File missing mimeType" }
  }

  if (!isSupportedMimeType(file.mimeType)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.mimeType}. Supported: images, PDF, ICS, Excel, CSV`,
    }
  }

  const fileSizeBytes = Buffer.from(file.data, "base64").length
  const fileSizeMB = fileSizeBytes / BYTES_PER_MB
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    return {
      valid: false,
      error: `File too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
    }
  }

  return { valid: true }
}

function validateFilesArray(files: FileContent[] | undefined): {
  valid: boolean
  error?: string
} {
  if (!files) {
    return {
      valid: false,
      error: "No files provided. Please upload at least one file.",
    }
  }

  if (!Array.isArray(files)) {
    return {
      valid: false,
      error: "No files provided. Please upload at least one file.",
    }
  }

  if (files.length === 0) {
    return {
      valid: false,
      error: "No files provided. Please upload at least one file.",
    }
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    return {
      valid: false,
      error: `Too many files. Maximum ${MAX_FILES_PER_REQUEST} files allowed per request.`,
    }
  }

  return { valid: true }
}

function processFiles(files: FileContent[]): {
  validFiles: FileContent[]
  validationErrors: string[]
} {
  const validationErrors: string[] = []
  const validFiles: FileContent[] = []

  for (const file of files) {
    const validation = validateFile(file)
    if (!validation.valid) {
      validationErrors.push(validation.error ?? "Invalid file")
      continue
    }

    validFiles.push({
      data: file.data,
      mimeType: file.mimeType as SupportedMimeType,
      fileName: file.fileName,
    })
  }

  return { validFiles, validationErrors }
}

const uploadForExtraction = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id
    const email = req.user?.email

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    }
    if (!email) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    }

    const isEnabled = await isFeatureEnabledForUser(userId, "ocr_file_upload")
    if (!isEnabled) {
      return sendR(
        res,
        STATUS_RESPONSE.FORBIDDEN,
        "OCR file upload is not enabled for your account"
      )
    }

    const { files } = req.body as FilesPayload
    const filesValidation = validateFilesArray(files)

    if (!filesValidation.valid) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        filesValidation.error ?? "Invalid files"
      )
    }

    const { validFiles, validationErrors } = processFiles(files)

    if (validFiles.length === 0) {
      const errorMessage =
        validationErrors.length > 0
          ? validationErrors.join("; ")
          : "No valid files to process"
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, errorMessage)
    }

    logger.info("OCR extraction requested", {
      userId,
      fileCount: validFiles.length,
      fileTypes: validFiles.map((f) => f.mimeType),
    })

    const result: ExtractedEventsResult = await extractEventsFromFiles(
      validFiles,
      email
    )

    const noEventsExtracted = !result.success || result.events.length === 0
    if (noEventsExtracted) {
      const message =
        result.error ?? "No events could be extracted from the uploaded files"
      return sendR(res, STATUS_RESPONSE.SUCCESS, message, {
        success: false,
        events: [],
        warnings: validationErrors,
      })
    }

    await storePendingEvents(userId, result.events, "web")

    logger.info("OCR events extracted and stored pending confirmation", {
      userId,
      eventCount: result.events.length,
    })

    const hasWarnings = validationErrors.length > 0
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Events extracted successfully",
      {
        success: true,
        events: result.events,
        eventCount: result.events.length,
        warnings: hasWarnings ? validationErrors : undefined,
      }
    )
  }
)

const confirmEvents = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id
    const email = req.user?.email

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    }
    if (!email) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    }

    const { action } = req.body as ActionPayload
    const isValidAction = action === "confirm" || action === "cancel"

    if (!action) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Action is required. Use 'confirm' or 'cancel'."
      )
    }

    if (!isValidAction) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Invalid action. Use 'confirm' or 'cancel'."
      )
    }

    const pending = await getPendingEvents(userId)
    const hasPendingEvents = pending !== null && pending.events.length > 0

    if (!hasPendingEvents) {
      return sendR(
        res,
        STATUS_RESPONSE.NOT_FOUND,
        "No pending events found. They may have expired (10 minute TTL)."
      )
    }

    if (action === "cancel") {
      await clearPendingEvents(userId)

      logger.info("OCR events cancelled by user", {
        userId,
        eventCount: pending.events.length,
      })

      return sendR(res, STATUS_RESPONSE.SUCCESS, "Events cancelled", {
        cancelled: true,
        eventCount: pending.events.length,
      })
    }

    const confirmationResult = await executeConfirmation(userId, email)

    if (!confirmationResult.success) {
      logger.error("OCR confirmation failed", {
        userId,
        error: confirmationResult.error,
      })

      const errorMessage = confirmationResult.error ?? "Failed to create events"
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, errorMessage)
    }

    logger.info("OCR events confirmed and created", {
      userId,
      createdCount: confirmationResult.createdCount,
      failedCount: confirmationResult.failedCount,
    })

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Events created successfully", {
      success: true,
      createdCount: confirmationResult.createdCount,
      failedCount: confirmationResult.failedCount,
      createdEvents: confirmationResult.createdEvents,
      failedEvents: confirmationResult.failedEvents,
    })
  }
)

const getPendingOCREvents = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    }

    const pending = await getPendingEvents(userId)
    const hasPendingEvents = pending !== null && pending.events.length > 0

    if (!hasPendingEvents) {
      return sendR(res, STATUS_RESPONSE.SUCCESS, "No pending events", {
        hasPending: false,
        events: [],
      })
    }

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Pending events retrieved", {
      hasPending: true,
      events: pending.events,
      eventCount: pending.events.length,
      modality: pending.modality,
      storedAt: pending.storedAt,
    })
  }
)

export const ocrController = {
  uploadForExtraction,
  confirmEvents,
  getPendingOCREvents,
}
