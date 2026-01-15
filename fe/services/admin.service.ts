import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AdminAffiliate,
  AdminAffiliateListParams,
  AdminAffiliateListResponse,
  AdminAuditLogListResponse,
  AdminDashboardStats,
  AdminPaymentListResponse,
  AdminSubscriptionListResponse,
  AdminUser,
  AdminUserListParams,
  AdminUserListResponse,
  AffiliateSettingsResponse,
  RevenueTrendPoint,
  SubscriptionDistribution,
  SubscriptionTrendPoint,
  UserRole,
  UserStatus,
} from "@/types/admin";

interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
}

// ============================================
// Dashboard
// ============================================

export const getDashboardStats = async (): Promise<AdminDashboardStats> => {
  const response = await apiClient.get<ApiResponse<AdminDashboardStats>>(
    ENDPOINTS.ADMIN_DASHBOARD_STATS
  );
  return response.data.data!;
};

export const getSubscriptionDistribution = async (): Promise<
  SubscriptionDistribution[]
> => {
  const response = await apiClient.get<ApiResponse<SubscriptionDistribution[]>>(
    ENDPOINTS.ADMIN_DASHBOARD_DISTRIBUTION
  );
  return response.data.data || [];
};

// ============================================
// Users
// ============================================

export const getUsers = async (
  params: AdminUserListParams
): Promise<AdminUserListResponse> => {
  const response = await apiClient.get<ApiResponse<AdminUserListResponse>>(
    ENDPOINTS.ADMIN_USERS,
    { params }
  );
  return response.data.data!;
};

export const getUserById = async (id: string): Promise<AdminUser> => {
  const response = await apiClient.get<ApiResponse<AdminUser>>(
    ENDPOINTS.ADMIN_USER_BY_ID(id)
  );
  return response.data.data!;
};

export const updateUserStatus = async (
  id: string,
  status: UserStatus,
  reason?: string
): Promise<void> => {
  await apiClient.patch(ENDPOINTS.ADMIN_USER_STATUS(id), { status, reason });
};

export const updateUserRole = async (
  id: string,
  role: UserRole,
  reason?: string
): Promise<void> => {
  await apiClient.patch(ENDPOINTS.ADMIN_USER_ROLE(id), { role, reason });
};

export const grantCredits = async (
  id: string,
  credits: number,
  reason: string
): Promise<void> => {
  await apiClient.post(ENDPOINTS.ADMIN_USER_CREDITS(id), { credits, reason });
};

export const sendPasswordReset = async (id: string): Promise<void> => {
  await apiClient.post(ENDPOINTS.ADMIN_USER_PASSWORD_RESET(id));
};

// ============================================
// Subscriptions
// ============================================

export const getSubscriptions = async (params: {
  page?: number;
  limit?: number;
  userId?: string;
  status?: string;
  search?: string;
}): Promise<AdminSubscriptionListResponse> => {
  const response = await apiClient.get<
    ApiResponse<AdminSubscriptionListResponse>
  >(ENDPOINTS.ADMIN_SUBSCRIPTIONS, {
    params,
  });
  return response.data.data!;
};

// ============================================
// Payments
// ============================================

export const getPayments = async (params: {
  page?: number;
  limit?: number;
  userId?: string;
  status?: string;
  search?: string;
}): Promise<AdminPaymentListResponse> => {
  const response = await apiClient.get<ApiResponse<AdminPaymentListResponse>>(
    ENDPOINTS.ADMIN_PAYMENTS,
    { params }
  );
  return response.data.data!;
};

// ============================================
// Audit Logs
// ============================================

export const getAuditLogs = async (params: {
  page?: number;
  limit?: number;
  adminUserId?: string;
  action?: string;
  search?: string;
}): Promise<AdminAuditLogListResponse> => {
  const response = await apiClient.get<ApiResponse<AdminAuditLogListResponse>>(
    ENDPOINTS.ADMIN_AUDIT_LOGS,
    { params }
  );
  return response.data.data!;
};

// ============================================
// Dashboard Charts
// ============================================

export const getRevenueTrends = async (
  months = 6
): Promise<RevenueTrendPoint[]> => {
  const response = await apiClient.get<ApiResponse<RevenueTrendPoint[]>>(
    ENDPOINTS.ADMIN_DASHBOARD_REVENUE_TRENDS,
    {
      params: { months },
    }
  );
  return response.data.data || [];
};

export const getSubscriptionTrends = async (
  days = 7
): Promise<SubscriptionTrendPoint[]> => {
  const response = await apiClient.get<ApiResponse<SubscriptionTrendPoint[]>>(
    ENDPOINTS.ADMIN_DASHBOARD_SUBSCRIPTION_TRENDS,
    { params: { days } }
  );
  return response.data.data || [];
};

export const getAdminMe = async (): Promise<AdminUser> => {
  const response = await apiClient.get<ApiResponse<AdminUser>>(
    ENDPOINTS.ADMIN_ME
  );
  return response.data.data!;
};

export const getAffiliates = async (
  params: AdminAffiliateListParams
): Promise<AdminAffiliateListResponse> => {
  const response = await apiClient.get<ApiResponse<AdminAffiliateListResponse>>(
    ENDPOINTS.ADMIN_AFFILIATES,
    { params }
  );
  return response.data.data!;
};

export const getAffiliateById = async (id: string): Promise<AdminAffiliate> => {
  const response = await apiClient.get<ApiResponse<AdminAffiliate>>(
    ENDPOINTS.ADMIN_AFFILIATE_BY_ID(id)
  );
  return response.data.data!;
};

export const getAffiliateSettings =
  async (): Promise<AffiliateSettingsResponse> => {
    const response = await apiClient.get<
      ApiResponse<AffiliateSettingsResponse>
    >(ENDPOINTS.ADMIN_AFFILIATES_SETTINGS);
    return response.data.data!;
  };
