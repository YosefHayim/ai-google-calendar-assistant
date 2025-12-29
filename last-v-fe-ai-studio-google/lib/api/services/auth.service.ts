import { apiClient } from '../client';
import { ApiResponse, AuthData } from '../../../types/api';

export const authService = {
  async signIn(email: string, password: string): Promise<ApiResponse<AuthData>> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>('/api/users/signin', { email, password });
    return data;
  },

  async signUp(email: string, password: string): Promise<ApiResponse<AuthData>> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>('/api/users/signup', { email, password });
    return data;
  },

  async verifyOTP(email: string, token: string): Promise<ApiResponse<AuthData>> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>('/api/users/verify-user-by-email-otp', { email, token });
    return data;
  },

  async getUser(): Promise<ApiResponse<any>> {
    const { data } = await apiClient.get<ApiResponse<any>>('/api/users/get-user');
    return data;
  },

  getGoogleAuthUrl(): string {
    const baseUrl = apiClient.defaults.baseURL;
    return `${baseUrl}/api/users/signup/google`;
  }
};