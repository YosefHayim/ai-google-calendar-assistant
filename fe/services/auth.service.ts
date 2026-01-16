import { ApiResponse, AuthData, CustomUser, User } from '@/types/api'

import { ENDPOINTS } from '@/lib/api/endpoints'
import { apiClient } from '@/lib/api/client'

export const authService = {
  async signIn(email: string, password: string): Promise<ApiResponse<AuthData>> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>(ENDPOINTS.USERS_SIGNIN, { email, password })
    return data
  },

  async signUp(email: string, password: string): Promise<ApiResponse<AuthData>> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>(ENDPOINTS.USERS_SIGNUP, { email, password })
    return data
  },

  async verifyOTP(email: string, token: string): Promise<ApiResponse<AuthData>> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>(ENDPOINTS.USERS_VERIFY_OTP, { email, token })
    return data
  },

  async getUser(customUser = false, refresh = false): Promise<ApiResponse<User | CustomUser>> {
    const params: Record<string, string> = {}
    if (customUser) params.customUser = 'true'
    if (refresh) params.refresh = 'true'

    const { data } = await apiClient.get<ApiResponse<User | CustomUser>>(ENDPOINTS.USERS_GET_USER, {
      params: Object.keys(params).length > 0 ? params : undefined,
    })
    return data
  },

  async deactivateUser(): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete<ApiResponse<null>>(ENDPOINTS.USERS)
    return data
  },

  getGoogleAuthUrl(): string {
    const baseUrl = apiClient.defaults.baseURL
    return `${baseUrl}${ENDPOINTS.USERS_SIGNUP_GOOGLE}`
  },

  getGitHubAuthUrl(): string {
    const baseUrl = apiClient.defaults.baseURL
    return `${baseUrl}${ENDPOINTS.USERS_SIGNUP_GITHUB}`
  },
}
