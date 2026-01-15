/**
 * Admin Dashboard Types
 */

export type UserRole = "user" | "admin" | "moderator" | "support";
export type UserStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending_verification";

export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  status: UserStatus;
  role: UserRole;
  timezone: string | null;
  locale: string | null;
  email_verified: boolean | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  subscription?: AdminUserSubscription | null;
  oauth_connected?: boolean;
}

export interface AdminUserSubscription {
  id: string;
  plan_name: string;
  plan_slug: string;
  status: string;
  interval: string;
  current_period_end: string | null;
  ai_interactions_used: number;
  credits_remaining: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  activeSubscriptions: number;
  totalRevenueCents: number;
  mrrCents: number;
}

export interface SubscriptionDistribution {
  planSlug: string;
  planName: string;
  subscriberCount: number;
  percentage: number;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  sortBy?: "created_at" | "email" | "last_login_at";
  sortOrder?: "asc" | "desc";
}

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "cancelled"
  | "expired"
  | "paused";

export interface AdminSubscription {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  planSlug: string;
  status: SubscriptionStatus;
  interval: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelledAt: string | null;
  aiInteractionsUsed: number;
  creditsRemaining: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubscriptionListResponse {
  subscriptions: AdminSubscription[];
  total: number;
  page: number;
  totalPages: number;
}

export type PaymentStatus = "succeeded" | "pending" | "failed" | "refunded";

export interface AdminPayment {
  id: string;
  userId: string;
  userEmail: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  description: string | null;
  lsOrderId: string | null;
  receiptUrl: string | null;
  createdAt: string;
}

export interface AdminPaymentListResponse {
  payments: AdminPayment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  adminUserId: string;
  adminEmail: string | null;
  targetUserId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AdminAuditLogListResponse {
  logs: AdminAuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
  reason?: string;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
  reason?: string;
}

export interface GrantCreditsRequest {
  credits: number;
  reason: string;
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  subscriptions: number;
}

export interface SubscriptionTrendPoint {
  date: string;
  newSubscriptions: number;
  cancelledSubscriptions: number;
  totalActive: number;
}

export type AffiliateStatus = "active" | "pending" | "disabled";

export interface AdminAffiliate {
  id: string;
  userName: string;
  userEmail: string;
  status: AffiliateStatus;
  applicationNote: string | null;
  totalEarnings: number;
  unpaidEarnings: number;
  shareDomain: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAffiliateListParams {
  page?: number;
  limit?: number;
  status?: AffiliateStatus;
  search?: string;
}

export interface AdminAffiliateListResponse {
  affiliates: AdminAffiliate[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AffiliateProgramSettings {
  affiliateHubUrl: string;
  commissionRate: number;
  trackingLength: number;
  minimumPayout: number;
  autoApproval: boolean;
  subscriptionCommission: boolean;
}

export interface AffiliateDashboardUrls {
  affiliatesOverview: string;
  affiliateSettings: string;
  payouts: string;
}

export interface AffiliateSettingsResponse {
  settings: AffiliateProgramSettings;
  dashboardUrls: AffiliateDashboardUrls;
}
