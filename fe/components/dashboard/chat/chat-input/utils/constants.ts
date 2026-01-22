import { INPUT_LIMITS } from '@/lib/security/sanitize'

export const MAX_FILES = 10
export const MAX_FILE_SIZE_MB = INPUT_LIMITS.MAX_FILE_SIZE_MB
export const ACCEPTED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  // PDF
  'application/pdf',
  // Calendar files
  'text/calendar',
  // Spreadsheets
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
]
export const MAX_INPUT_LENGTH = INPUT_LIMITS.CHAT_MESSAGE

// Backwards compatibility aliases
export const MAX_IMAGES = MAX_FILES
export const MAX_IMAGE_SIZE_MB = MAX_FILE_SIZE_MB
export const ACCEPTED_IMAGE_TYPES = ACCEPTED_FILE_TYPES
