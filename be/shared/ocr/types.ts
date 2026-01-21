import { z } from "zod"

export type Modality = "web" | "telegram" | "slack" | "whatsapp"

export type FileType = "image" | "pdf" | "ics" | "spreadsheet"

export type SupportedMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "application/pdf"
  | "text/calendar"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.ms-excel"
  | "text/csv"

export type FileContent = {
  type: FileType
  data: string
  mimeType: SupportedMimeType
  filename?: string
  pageCount?: number
}

export const ExtractedEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  location: z.string().optional(),
  isAllDay: z.boolean(),
  recurrence: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  confidence: z.enum(["high", "medium", "low"]),
  source: z.literal("ocr"),
})

export type ExtractedEvent = z.infer<typeof ExtractedEventSchema>

export const ExtractedEventsResultSchema = z.object({
  events: z.array(ExtractedEventSchema),
  overallConfidence: z.enum(["high", "medium", "low"]),
  warnings: z.array(z.string()),
  rawText: z.string().optional(),
  fileCount: z.number(),
})

export type ExtractedEventsResult = z.infer<typeof ExtractedEventsResultSchema>

export type PendingOCREvents = {
  userId: string
  modality: Modality
  events: ExtractedEvent[]
  expiresAt: number
  originalFileNames: string[]
  userTimezone: string
  createdAt: number
}

export type ConfirmationAction =
  | "confirm_all"
  | "confirm_selected"
  | "cancel"

export type ConfirmationResult = {
  action: ConfirmationAction
  selectedEventIds?: string[]
}

export type OCRProcessingResult = {
  success: boolean
  result?: ExtractedEventsResult
  error?: string
  processingTimeMs: number
}

export type FileProcessorResult = {
  success: boolean
  content?: FileContent
  extractedEvents?: ExtractedEvent[]
  error?: string
}

export const SUPPORTED_FILE_TYPES: Record<SupportedMimeType, FileType> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "application/pdf": "pdf",
  "text/calendar": "ics",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "spreadsheet",
  "application/vnd.ms-excel": "spreadsheet",
  "text/csv": "spreadsheet",
}

export const MIME_TYPE_EXTENSIONS: Record<string, SupportedMimeType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  ics: "text/calendar",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  csv: "text/csv",
}

export const MAX_FILE_SIZE_MB = 20
export const MAX_FILES_PER_REQUEST = 10
export const PENDING_EVENTS_TTL_SECONDS = 600
