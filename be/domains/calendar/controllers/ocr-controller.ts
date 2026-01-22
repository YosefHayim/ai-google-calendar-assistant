import type { Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config/constants";
import { isFeatureEnabled } from "@/domains/settings/services/feature-flag-service";
import { reqResAsyncHandler, sendR } from "@/lib/http";
import { logger } from "@/lib/logger";
import {
  clearPendingEvents,
  executeConfirmation,
  extractEventsFromFiles,
  type FileContent,
  getPendingEvents,
  isSupportedMimeType,
  MAX_FILE_SIZE_MB,
  MAX_FILES_PER_REQUEST,
  type SupportedMimeType,
  storePendingEvents,
  SUPPORTED_FILE_TYPES,
} from "@/shared/ocr";

const KB_IN_BYTES = 1024;
const BYTES_PER_MB = KB_IN_BYTES * KB_IN_BYTES;
const MODALITY = "web" as const;

type FilePayload = {
  data: string;
  mimeType: string;
  fileName?: string;
};

type FilesPayload = { files: FilePayload[] };
type ActionPayload = { action: "confirm" | "cancel" };

function validateFile(file: FilePayload): { valid: boolean; error?: string } {
  if (!file.data) {
    return { valid: false, error: "File missing data" };
  }

  if (!file.mimeType) {
    return { valid: false, error: "File missing mimeType" };
  }

  if (!isSupportedMimeType(file.mimeType)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.mimeType}. Supported: images, PDF, ICS, Excel, CSV`,
    };
  }

  const fileSizeBytes = Buffer.from(file.data, "base64").length;
  const fileSizeMB = fileSizeBytes / BYTES_PER_MB;
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    return {
      valid: false,
      error: `File too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
    };
  }

  return { valid: true };
}

function validateFilesArray(files: FilePayload[] | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!files) {
    return {
      valid: false,
      error: "No files provided. Please upload at least one file.",
    };
  }

  if (!Array.isArray(files)) {
    return {
      valid: false,
      error: "No files provided. Please upload at least one file.",
    };
  }

  if (files.length === 0) {
    return {
      valid: false,
      error: "No files provided. Please upload at least one file.",
    };
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    return {
      valid: false,
      error: `Too many files. Maximum ${MAX_FILES_PER_REQUEST} files allowed per request.`,
    };
  }

  return { valid: true };
}

function processFiles(files: FilePayload[]): {
  validFiles: FileContent[];
  validationErrors: string[];
} {
  const validationErrors: string[] = [];
  const validFiles: FileContent[] = [];

  for (const file of files) {
    const validation = validateFile(file);
    if (!validation.valid) {
      validationErrors.push(validation.error ?? "Invalid file");
      continue;
    }

    const mimeType = file.mimeType as SupportedMimeType;
    const fileType = SUPPORTED_FILE_TYPES[mimeType];

    validFiles.push({
      type: fileType,
      data: file.data,
      mimeType,
      filename: file.fileName,
    });
  }

  return { validFiles, validationErrors };
}

const uploadForExtraction = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const email = req.user?.email;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }
  if (!email) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  const isEnabled = await isFeatureEnabled("ocr_file_upload", { userId });
  if (!isEnabled) {
    return sendR(res, STATUS_RESPONSE.FORBIDDEN, "OCR file upload is not enabled for your account");
  }

  const { files } = req.body as FilesPayload;
  const filesValidation = validateFilesArray(files);

  if (!filesValidation.valid) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, filesValidation.error ?? "Invalid files");
  }

  const { validFiles, validationErrors } = processFiles(files);

  if (validFiles.length === 0) {
    const errorMessage = validationErrors.length > 0 ? validationErrors.join("; ") : "No valid files to process";
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, errorMessage);
  }

  logger.info("OCR extraction requested", {
    userId,
    fileCount: validFiles.length,
    fileTypes: validFiles.map((f) => f.mimeType),
  });

  const extractionResult = await extractEventsFromFiles({
    files: validFiles,
    userTimezone: "UTC",
    additionalContext: `Web upload by user ${userId}`,
  });

  const noEventsExtracted = !extractionResult.success || !extractionResult.result || extractionResult.result.events.length === 0;

  if (noEventsExtracted) {
    const message = extractionResult.error ?? "No events could be extracted from the uploaded files";
    return sendR(res, STATUS_RESPONSE.SUCCESS, message, {
      success: false,
      events: [],
      warnings: validationErrors,
    });
  }

  await storePendingEvents({
    userId,
    modality: MODALITY,
    result: extractionResult.result ?? { events: [], overallConfidence: "high", warnings: [], fileCount: 0 },
    userTimezone: "UTC",
    fileNames: validFiles.map((f) => f.filename).filter(Boolean) as string[],
  });

  logger.info("OCR events extracted and stored pending confirmation", {
    userId,
    eventCount: extractionResult.result?.events?.length ?? 0,
  });

  const hasWarnings = validationErrors.length > 0;
  return sendR(res, STATUS_RESPONSE.SUCCESS, "Events extracted successfully", {
    success: true,
    events: extractionResult.result?.events ?? [],
    eventCount: extractionResult.result?.events?.length ?? 0,
    warnings: hasWarnings ? validationErrors : undefined,
  });
});

const confirmEvents = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const email = req.user?.email;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }
  if (!email) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  const { action } = req.body as ActionPayload;
  const isValidAction = action === "confirm" || action === "cancel";

  if (!action) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Action is required. Use 'confirm' or 'cancel'.");
  }

  if (!isValidAction) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid action. Use 'confirm' or 'cancel'.");
  }

  const pending = await getPendingEvents(userId, MODALITY);
  const hasPendingEvents = pending !== null && pending.events.length > 0;

  if (!hasPendingEvents) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "No pending events found. They may have expired (10 minute TTL).");
  }

  if (action === "cancel") {
    await clearPendingEvents(userId, MODALITY);

    logger.info("OCR events cancelled by user", {
      userId,
      eventCount: pending.events.length,
    });

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Events cancelled", {
      cancelled: true,
      eventCount: pending.events.length,
    });
  }

  const confirmationResult = await executeConfirmation({
    userId,
    modality: MODALITY,
    action: "confirm_all",
    userEmail: email,
  });

  if (!confirmationResult.success) {
    logger.error("OCR confirmation failed", {
      userId,
      errors: confirmationResult.errors,
    });

    const errorMessage = confirmationResult.errors.length > 0 ? confirmationResult.errors.join("; ") : "Failed to create events";
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, errorMessage);
  }

  logger.info("OCR events confirmed and created", {
    userId,
    createdCount: confirmationResult.createdCount,
    failedCount: confirmationResult.failedCount,
  });

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Events created successfully", {
    success: true,
    createdCount: confirmationResult.createdCount,
    failedCount: confirmationResult.failedCount,
    createdEvents: confirmationResult.createdEvents,
  });
});

const getPendingOCREvents = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  const pending = await getPendingEvents(userId, MODALITY);
  const hasPendingEvents = pending !== null && pending.events.length > 0;

  if (!hasPendingEvents) {
    return sendR(res, STATUS_RESPONSE.SUCCESS, "No pending events", {
      hasPending: false,
      events: [],
    });
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Pending events retrieved", {
    hasPending: true,
    events: pending.events,
    eventCount: pending.events.length,
    modality: pending.modality,
  });
});

export const ocrController = {
  uploadForExtraction,
  confirmEvents,
  getPendingOCREvents,
};
