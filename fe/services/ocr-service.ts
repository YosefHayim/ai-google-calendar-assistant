import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse } from '@/types/api'

export type SupportedMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'application/pdf'
  | 'text/calendar'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'application/vnd.ms-excel'
  | 'text/csv'

export type ExtractedEvent = {
  id: string
  title: string
  description?: string
  startTime: string
  endTime?: string
  duration?: number
  location?: string
  isAllDay: boolean
  confidence: 'high' | 'medium' | 'low'
}

export type FileContent = {
  data: string
  mimeType: SupportedMimeType
  fileName?: string
}

export type OCRUploadResponse = {
  success: boolean
  events: ExtractedEvent[]
  eventCount: number
  warnings?: string[]
}

export type OCRConfirmResponse = {
  success?: boolean
  cancelled?: boolean
  createdCount?: number
  failedCount?: number
  eventCount?: number
  createdEvents?: Array<{ id: string; title: string }>
  failedEvents?: Array<{ title: string; error: string }>
}

export type OCRPendingResponse = {
  hasPending: boolean
  events: ExtractedEvent[]
  eventCount?: number
  modality?: string
  storedAt?: string
}

export const ocrService = {
  async uploadFiles(files: FileContent[]): Promise<OCRUploadResponse> {
    const response = await apiClient.post<ApiResponse<OCRUploadResponse>>(ENDPOINTS.OCR_UPLOAD, {
      files,
    })
    return (
      response.data?.data ?? {
        success: false,
        events: [],
        eventCount: 0,
      }
    )
  },

  async confirmEvents(action: 'confirm' | 'cancel'): Promise<OCRConfirmResponse> {
    const response = await apiClient.post<ApiResponse<OCRConfirmResponse>>(ENDPOINTS.OCR_CONFIRM, {
      action,
    })
    return response.data?.data ?? {}
  },

  async getPendingEvents(): Promise<OCRPendingResponse> {
    const response = await apiClient.get<ApiResponse<OCRPendingResponse>>(ENDPOINTS.OCR_PENDING)
    return (
      response.data?.data ?? {
        hasPending: false,
        events: [],
      }
    )
  },
}
