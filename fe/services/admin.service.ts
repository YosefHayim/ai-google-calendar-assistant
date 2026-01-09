import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type {
  AdminDashboardStats,
  SubscriptionDistribution,
  AdminUserListResponse,
  AdminUserListParams,
  AdminUser,
  AdminSubscriptionListResponse,
  AdminPaymentListResponse,
  AdminAuditLogListResponse,
  UserStatus,
  UserRole,
} from '@/types/admin'

interface ApiResponse<T> {
  status: 'success' | 'error'
  message: string
  data?: T
}

// ============================================
// Dashboard
// ============================================

export const getDashboardStats = async (): Promise<AdminDashboardStats> => {
  const response = await apiClient.get<ApiResponse<AdminDashboardStats>>(ENDPOINTS.ADMIN_DASHBOARD_STATS)
  return response.data.data!
}

export const getSubscriptionDistribution = async (): Promise<SubscriptionDistribution[]> => {
  const response = await apiClient.get<ApiResponse<SubscriptionDistribution[]>>(ENDPOINTS.ADMIN_DASHBOARD_DISTRIBUTION)
  return response.data.data || []
}

// ============================================
// Users
// ============================================

export const getUsers = async (params: AdminUserListParams): Promise<AdminUserListResponse> => {
  const response = await apiClient.get<ApiResponse<AdminUserListResponse>>(ENDPOINTS.ADMIN_USERS, { params })
  return response.data.data!
}

export const getUserById = async (id: string): Promise<AdminUser> => {
  const response = await apiClient.get<ApiResponse<AdminUser>>(ENDPOINTS.ADMIN_USER_BY_ID(id))
  return response.data.data!
}

export const updateUserStatus = async (id: string, status: UserStatus, reason?: string): Promise<void> => {
  await apiClient.patch(ENDPOINTS.ADMIN_USER_STATUS(id), { status, reason })
}

export const updateUserRole = async (id: string, role: UserRole, reason?: string): Promise<void> => {
  await apiClient.patch(ENDPOINTS.ADMIN_USER_ROLE(id), { role, reason })
}

export const grantCredits = async (id: string, credits: number, reason: string): Promise<void> => {
  await apiClient.post(ENDPOINTS.ADMIN_USER_CREDITS(id), { credits, reason })
}

export const sendPasswordReset = async (id: string): Promise<void> => {
  await apiClient.post(ENDPOINTS.ADMIN_USER_PASSWORD_RESET(id))
}

// ============================================
// Subscriptions
// ============================================

export const getSubscriptions = async (params: {
  page?: number
  limit?: number
  userId?: string
  status?: string
  search?: string
}): Promise<AdminSubscriptionListResponse> => {
  const response = await apiClient.get<ApiResponse<AdminSubscriptionListResponse>>(ENDPOINTS.ADMIN_SUBSCRIPTIONS, {
    params,
  })
  return response.data.data!
}

// ============================================
// Payments
// ============================================

export const getPayments = async (params: {
  page?: number
  limit?: number
  userId?: string
  status?: string
  search?: string
}): Promise<AdminPaymentListResponse> => {
  const response = await apiClient.get<ApiResponse<AdminPaymentListResponse>>(ENDPOINTS.ADMIN_PAYMENTS, { params })
  return response.data.data!
}

// ============================================
// Audit Logs
// ============================================

export const getAuditLogs = async (params: {
  page?: number
  limit?: number
  adminUserId?: string
  action?: string
  search?: string
}): Promise<AdminAuditLogListResponse> => {
  const response = await apiClient.get<ApiResponse<AdminAuditLogListResponse>>(ENDPOINTS.ADMIN_AUDIT_LOGS, { params })
  return response.data.data!
}

// ============================================
// Helpers
// ============================================

export const formatCurrency = (cents: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}
