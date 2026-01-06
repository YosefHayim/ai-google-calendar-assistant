import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse } from '@/types/api'

export type TranscriptionResponse = {
  text: string
}

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
}
