import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type {
  ApiResponse,
  GapsResponse,
  GapQueryParams,
  FillGapRequest,
  FillGapResponse,
  SkipGapRequest,
  SkipGapResponse,
  DismissAllGapsResponse,
} from '@/types/api'

export const gapsService = {
  /**
   * Get analyzed gaps from the calendar
   */
  async getGaps(params?: GapQueryParams): Promise<ApiResponse<GapsResponse>> {
    const { data } = await apiClient.get<ApiResponse<GapsResponse>>(ENDPOINTS.GAPS, { params })
    return data
  },

  /**
   * Get gaps formatted for display
   */
  async getFormattedGaps(): Promise<ApiResponse<string>> {
    const { data } = await apiClient.get<ApiResponse<string>>(ENDPOINTS.GAPS_FORMATTED)
    return data
  },

  /**
   * Fill a gap with a new event
   */
  async fillGap(gapId: string, requestData: FillGapRequest): Promise<ApiResponse<FillGapResponse>> {
    const { data } = await apiClient.post<ApiResponse<FillGapResponse>>(ENDPOINTS.GAPS_FILL(gapId), requestData)
    return data
  },

  /**
   * Skip a specific gap
   */
  async skipGap(gapId: string, requestData?: SkipGapRequest): Promise<ApiResponse<SkipGapResponse>> {
    const { data } = await apiClient.post<ApiResponse<SkipGapResponse>>(ENDPOINTS.GAPS_SKIP(gapId), requestData || {})
    return data
  },

  /**
   * Dismiss all pending gaps
   */
  async dismissAllGaps(): Promise<ApiResponse<DismissAllGapsResponse>> {
    const { data } = await apiClient.post<ApiResponse<DismissAllGapsResponse>>(ENDPOINTS.GAPS_DISMISS_ALL)
    return data
  },

  /**
   * Disable gap analysis feature
   */
  async disableGapAnalysis(): Promise<ApiResponse<{ message: string }>> {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(ENDPOINTS.GAPS_DISABLE)
    return data
  },
}
