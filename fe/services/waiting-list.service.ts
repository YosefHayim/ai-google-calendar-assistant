import type { ApiResponse } from '@/types/api'
import { apiClient } from '@/lib/api/client'

export interface WaitingListJoinData {
  email: string
  name?: string
  source?: 'landing' | 'blog' | 'other'
}

export interface WaitingListResponse {
  position: number
  status?: string
  email: string
  joinedAt?: string
}

export const waitingListService = {
  async join(data: WaitingListJoinData): Promise<ApiResponse<WaitingListResponse>> {
    const { data: responseData } = await apiClient.post<ApiResponse<WaitingListResponse>>('/api/waitinglist/join', data)
    return responseData
  },

  async getPosition(email: string): Promise<ApiResponse<WaitingListResponse>> {
    const { data: responseData } = await apiClient.get<ApiResponse<WaitingListResponse>>(
      `/api/waitinglist/position/${encodeURIComponent(email)}`,
    )
    return responseData
  },
}
