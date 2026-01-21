'use client'

import { useState, useCallback } from 'react'
import { ocrService, type ExtractedEvent, type FileContent, type SupportedMimeType } from '@/services/ocr-service'
import { toast } from 'sonner'
import { usePostHog } from 'posthog-js/react'

const OCR_ONLY_MIME_TYPES: SupportedMimeType[] = [
  'application/pdf',
  'text/calendar',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
]

const IMAGE_MIME_TYPES: SupportedMimeType[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export type OCRUploadState = {
  isUploading: boolean
  isConfirming: boolean
  pendingEvents: ExtractedEvent[]
  warnings: string[]
  error: string | null
}

type FileWithBase64 = {
  file: File
  base64: string
  mimeType: SupportedMimeType
}

export function useOCRUpload() {
  const posthog = usePostHog()

  const [state, setState] = useState<OCRUploadState>({
    isUploading: false,
    isConfirming: false,
    pendingEvents: [],
    warnings: [],
    error: null,
  })

  /**
   * Determines if a set of files should use OCR processing
   * Returns true if ANY file is a non-image type (PDF, ICS, spreadsheet)
   */
  const shouldUseOCR = useCallback((files: File[]): boolean => {
    return files.some((file) => OCR_ONLY_MIME_TYPES.includes(file.type as SupportedMimeType))
  }, [])

  /**
   * Checks if a single file is an image
   */
  const isImageFile = useCallback((file: File): boolean => {
    return IMAGE_MIME_TYPES.includes(file.type as SupportedMimeType)
  }, [])

  /**
   * Classifies files into images (for vision AI) and OCR files (for extraction)
   */
  const classifyFiles = useCallback(
    (files: File[]): { imageFiles: File[]; ocrFiles: File[] } => {
      const imageFiles: File[] = []
      const ocrFiles: File[] = []

      for (const file of files) {
        if (isImageFile(file)) {
          imageFiles.push(file)
        } else if (OCR_ONLY_MIME_TYPES.includes(file.type as SupportedMimeType)) {
          ocrFiles.push(file)
        }
      }

      return { imageFiles, ocrFiles }
    },
    [isImageFile],
  )

  /**
   * Upload files for OCR event extraction
   */
  const uploadForExtraction = useCallback(
    async (filesWithBase64: FileWithBase64[]): Promise<boolean> => {
      if (filesWithBase64.length === 0) return false

      setState((prev) => ({
        ...prev,
        isUploading: true,
        error: null,
        pendingEvents: [],
        warnings: [],
      }))

      try {
        posthog?.capture('ocr_upload_started', {
          file_count: filesWithBase64.length,
          file_types: filesWithBase64.map((f) => f.mimeType),
        })

        const fileContents: FileContent[] = filesWithBase64.map((f) => ({
          data: f.base64,
          mimeType: f.mimeType,
          fileName: f.file.name,
        }))

        const response = await ocrService.uploadFiles(fileContents)

        if (response.success && response.events.length > 0) {
          setState((prev) => ({
            ...prev,
            isUploading: false,
            pendingEvents: response.events,
            warnings: response.warnings || [],
          }))

          posthog?.capture('ocr_upload_success', {
            event_count: response.events.length,
            has_warnings: (response.warnings?.length || 0) > 0,
          })

          const eventText = response.events.length === 1 ? 'event' : 'events'
          toast.success(`Found ${response.events.length} ${eventText}`, {
            description: 'Review and confirm to add them to your calendar.',
          })

          return true
        } else {
          setState((prev) => ({
            ...prev,
            isUploading: false,
            error: 'No events found in the uploaded files.',
          }))

          posthog?.capture('ocr_upload_no_events', {
            file_count: filesWithBase64.length,
          })

          toast.error('No events found', {
            description: 'Could not extract any calendar events from the files.',
          })

          return false
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process files'

        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }))

        posthog?.capture('ocr_upload_error', {
          error: errorMessage,
        })

        toast.error('Upload failed', {
          description: errorMessage,
        })

        return false
      }
    },
    [posthog],
  )

  /**
   * Confirm pending events (create them in Google Calendar)
   */
  const confirmEvents = useCallback(async (): Promise<boolean> => {
    if (state.pendingEvents.length === 0) return false

    setState((prev) => ({ ...prev, isConfirming: true, error: null }))

    try {
      posthog?.capture('ocr_confirm_started', {
        event_count: state.pendingEvents.length,
      })

      const response = await ocrService.confirmEvents('confirm')

      if (response.success) {
        setState({
          isUploading: false,
          isConfirming: false,
          pendingEvents: [],
          warnings: [],
          error: null,
        })

        posthog?.capture('ocr_confirm_success', {
          created_count: response.createdCount,
          failed_count: response.failedCount,
        })

        const createdText = response.createdCount === 1 ? 'event' : 'events'
        toast.success(`Added ${response.createdCount} ${createdText}`, {
          description: 'Events have been added to your calendar.',
        })

        return true
      } else {
        setState((prev) => ({
          ...prev,
          isConfirming: false,
          error: 'Failed to confirm events.',
        }))

        toast.error('Confirmation failed', {
          description: 'Could not add events to your calendar. Please try again.',
        })

        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm events'

      setState((prev) => ({
        ...prev,
        isConfirming: false,
        error: errorMessage,
      }))

      posthog?.capture('ocr_confirm_error', {
        error: errorMessage,
      })

      toast.error('Confirmation failed', {
        description: errorMessage,
      })

      return false
    }
  }, [state.pendingEvents.length, posthog])

  /**
   * Cancel pending events (discard without creating)
   */
  const cancelPendingEvents = useCallback(async (): Promise<void> => {
    try {
      posthog?.capture('ocr_cancel', {
        event_count: state.pendingEvents.length,
      })

      await ocrService.confirmEvents('cancel')

      setState({
        isUploading: false,
        isConfirming: false,
        pendingEvents: [],
        warnings: [],
        error: null,
      })

      toast.info('Events discarded', {
        description: 'The extracted events have been discarded.',
      })
    } catch {
      // Even if API call fails, clear local state
      setState({
        isUploading: false,
        isConfirming: false,
        pendingEvents: [],
        warnings: [],
        error: null,
      })
    }
  }, [state.pendingEvents.length, posthog])

  /**
   * Clear any errors
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  /**
   * Check if there are pending events
   */
  const hasPendingEvents = state.pendingEvents.length > 0

  return {
    // State
    ...state,
    hasPendingEvents,

    // Classification utilities
    shouldUseOCR,
    isImageFile,
    classifyFiles,

    // Actions
    uploadForExtraction,
    confirmEvents,
    cancelPendingEvents,
    clearError,
  }
}
