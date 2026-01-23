import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse } from '@/types/api'
import type { TTSVoice } from '@/lib/validations/preferences'

// ============================================
// Types
// ============================================

export interface TranscriptionResult {
  success: boolean
  text?: string
  error?: string
}

export type TranscriptionResponse = {
  text: string
}

// ============================================
// Simple transcription function (used by useSpeechRecognition hook)
// ============================================

/**
 * Transcribe audio using OpenAI Whisper via backend API
 * Whisper automatically detects the language being spoken
 *
 * @param audioBlob - The recorded audio blob
 * @returns Transcription result with detected text
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<TranscriptionResult> => {
  try {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    const response = await apiClient.post(ENDPOINTS.VOICE_TRANSCRIBE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data?.status === 'success' && response.data?.data?.text) {
      return {
        success: true,
        text: response.data.data.text,
      }
    }

    return {
      success: false,
      error: response.data?.message || 'Transcription failed',
    }
  } catch (error) {
    console.error('Transcription error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to transcribe audio',
    }
  }
}

// ============================================
// Voice Service Object (comprehensive API)
// ============================================

export const voiceService = {
  async transcribe(audioBlob: Blob): Promise<ApiResponse<TranscriptionResponse>> {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    const { data } = await apiClient.post<ApiResponse<TranscriptionResponse>>(ENDPOINTS.VOICE_TRANSCRIBE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  async synthesize(text: string, voice?: TTSVoice): Promise<ArrayBuffer> {
    const response = await apiClient.post<ArrayBuffer>(
      ENDPOINTS.VOICE_SYNTHESIZE,
      { text, voice },
      { responseType: 'arraybuffer' },
    )
    return response.data
  },
}
