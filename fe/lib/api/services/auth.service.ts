import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { ApiResponse, AuthData } from '../../../types/api';

export const authService = {
  async signIn(email: string, password: string): Promise<ApiResponse<AuthData>> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>(ENDPOINTS.USERS_SIGNIN, { email, password });
    return data;
  },

  async signUp(email: string, password: string): Promise<ApiResponse<AuthData>> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>(ENDPOINTS.USERS_SIGNUP, { email, password });
    return data;
  },

  async verifyOTP(email: string, token: string): Promise<ApiResponse<AuthData>> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>(ENDPOINTS.USERS_VERIFY_OTP, { email, token });
    return data;
  },

  async getUser(): Promise<ApiResponse<any>> {
    const { data } = await apiClient.get<ApiResponse<any>>(ENDPOINTS.USERS_GET_USER);
    return data;
  },

  getGoogleAuthUrl(): string {
    const baseUrl = apiClient.defaults.baseURL;
    return `${baseUrl}${ENDPOINTS.USERS_SIGNUP_GOOGLE}`;
  }
};