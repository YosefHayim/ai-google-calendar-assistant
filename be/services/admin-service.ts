import { SUPABASE } from "@/config";
import type {
  AdminUser,
  AdminDashboardStats,
  SubscriptionDistribution,
  AdminUserListParams,
  AdminUserListResponse,
  AdminAuditLogEntry,
  AdminPayment,
  UserRole,
  UserStatus,
} from "@/types";

/**
 * Get dashboard KPI stats from the view
 */
export const getDashboardStats = async (): Promise<AdminDashboardStats> => {
  const { data, error } = await SUPABASE.from("v_admin_dashboard_stats")
    .select("*")
    .single();

  if (error) {
    console.error("[Admin Service] Failed to fetch dashboard stats:", error);
    throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
  }

  return {
    totalUsers: data.total_users || 0,
    activeUsers: data.active_users || 0,
    newUsersToday: data.new_users_today || 0,
    newUsersWeek: data.new_users_week || 0,
    newUsersMonth: data.new_users_month || 0,
    activeSubscriptions: data.active_subscriptions || 0,
    totalRevenueCents: data.total_revenue_cents || 0,
    mrrCents: data.mrr_cents || 0,
  };
};

/**
 * Get subscription distribution from the view
 */
export const getSubscriptionDistribution = async (): Promise<
  SubscriptionDistribution[]
> => {
  const { data, error } = await SUPABASE.from("v_subscription_distribution")
    .select("*");

  if (error) {
    console.error(
      "[Admin Service] Failed to fetch subscription distribution:",
      error
    );
    throw new Error(
      `Failed to fetch subscription distribution: ${error.message}`
    );
  }

  return (data || []).map((item) => ({
    planSlug: item.plan_slug || "unknown",
    planName: item.plan_name || "Unknown",
    subscriberCount: item.subscriber_count || 0,
    percentage: item.percentage || 0,
  }));
};

/**
 * Get paginated user list with filters using the view
 */
export const getUserList = async (
  params: AdminUserListParams
): Promise<AdminUserListResponse> => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    role,
    sortBy = "created_at",
    sortOrder = "desc",
  } = params;

  const offset = (page - 1) * limit;

  let query = SUPABASE.from("v_admin_user_list").select("*", { count: "exact" });

  // Apply filters
  if (search) {
    query = query.or(
      `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
    );
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (role) {
    query = query.eq("role", role);
  }

  // Apply sorting and pagination
  query = query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("[Admin Service] Failed to fetch users:", error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  const users: AdminUser[] = (data || []).map((user: any) => ({
    id: user.id || "",
    email: user.email || "",
    first_name: user.first_name,
    last_name: user.last_name,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    status: user.status || "active",
    role: user.role || "user",
    timezone: user.timezone,
    locale: user.locale,
    email_verified: user.email_verified,
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || new Date().toISOString(),
    last_login_at: null, // Not in view currently
    subscription: user.subscription_id
      ? {
          id: user.subscription_id,
          plan_name: user.plan_name || "Unknown",
          plan_slug: user.plan_slug || "unknown",
          status: user.subscription_status || "unknown",
          interval: user.subscription_interval || "monthly",
          current_period_end: user.current_period_end,
          ai_interactions_used: user.ai_interactions_used || 0,
          credits_remaining: user.credits_remaining || 0,
        }
      : null,
    oauth_connected: user.has_oauth_connected || false,
  }));

  return {
    users,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

/**
 * Get single user details by ID
 */
export const getUserById = async (userId: string): Promise<AdminUser | null> => {
  const { data, error } = await SUPABASE.from("v_admin_user_list")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("[Admin Service] Failed to fetch user:", error);
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  if (!data) return null;

  const userData = data as any;
  return {
    id: userData.id || "",
    email: userData.email || "",
    first_name: userData.first_name,
    last_name: userData.last_name,
    display_name: userData.display_name,
    avatar_url: userData.avatar_url,
    status: userData.status || "active",
    role: userData.role || "user",
    timezone: userData.timezone,
    locale: userData.locale,
    email_verified: userData.email_verified,
    created_at: userData.created_at || new Date().toISOString(),
    updated_at: userData.updated_at || new Date().toISOString(),
    last_login_at: null,
    subscription: userData.subscription_id
      ? {
          id: userData.subscription_id,
          plan_name: userData.plan_name || "Unknown",
          plan_slug: userData.plan_slug || "unknown",
          status: userData.subscription_status || "unknown",
          interval: userData.subscription_interval || "monthly",
          current_period_end: userData.current_period_end,
          ai_interactions_used: userData.ai_interactions_used || 0,
          credits_remaining: userData.credits_remaining || 0,
        }
      : null,
    oauth_connected: userData.has_oauth_connected || false,
  };
};

/**
 * Update user status
 */
export const updateUserStatus = async (
  userId: string,
  newStatus: UserStatus,
  adminUserId: string,
  reason?: string
): Promise<void> => {
  // Get current status for audit log
  const { data: currentUser } = await SUPABASE.from("users")
    .select("status, email")
    .eq("id", userId)
    .single();

  const { error } = await SUPABASE.from("users")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("[Admin Service] Failed to update user status:", error);
    throw new Error(`Failed to update user status: ${error.message}`);
  }

  // Log admin action
  await logAdminAction({
    adminUserId,
    action: "user_status_change",
    resourceType: "user",
    resourceId: userId,
    oldValues: { status: currentUser?.status },
    newValues: { status: newStatus, reason },
  });
};

/**
 * Update user role
 */
export const updateUserRole = async (
  userId: string,
  newRole: UserRole,
  adminUserId: string,
  reason?: string
): Promise<void> => {
  // Prevent self-modification
  if (userId === adminUserId) {
    throw new Error("Cannot modify your own role");
  }

  // Get current role for audit log
  const { data: currentUser } = await SUPABASE.from("users")
    .select("role, email")
    .eq("id", userId)
    .single();

  const { error } = await SUPABASE.from("users")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("[Admin Service] Failed to update user role:", error);
    throw new Error(`Failed to update user role: ${error.message}`);
  }

  // Log admin action
  await logAdminAction({
    adminUserId,
    action: "user_role_change",
    resourceType: "user",
    resourceId: userId,
    oldValues: { role: currentUser?.role },
    newValues: { role: newRole, reason },
  });
};

/**
 * Grant credits to user
 */
export const grantCredits = async (
  userId: string,
  credits: number,
  adminUserId: string,
  reason: string
): Promise<void> => {
  // Find active subscription
  const { data: subscription, error: fetchError } = await SUPABASE.from(
    "subscriptions"
  )
    .select("id, credits_remaining")
    .eq("user_id", userId)
    .in("status", ["active", "trialing", "past_due"])
    .single();

  if (fetchError || !subscription) {
    throw new Error("User has no active subscription");
  }

  const newCredits = (subscription.credits_remaining || 0) + credits;

  const { error } = await SUPABASE.from("subscriptions")
    .update({
      credits_remaining: newCredits,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscription.id);

  if (error) {
    console.error("[Admin Service] Failed to grant credits:", error);
    throw new Error(`Failed to grant credits: ${error.message}`);
  }

  // Log admin action
  await logAdminAction({
    adminUserId,
    action: "credits_grant",
    resourceType: "subscription",
    resourceId: subscription.id,
    oldValues: { credits_remaining: subscription.credits_remaining },
    newValues: {
      credits_added: credits,
      new_total: newCredits,
      reason,
    },
  });
};

/**
 * Get payment history for admin view
 */
export const getPaymentHistory = async (params: {
  page?: number;
  limit?: number;
  userId?: string;
  status?: string;
}): Promise<{ payments: AdminPayment[]; total: number }> => {
  const { page = 1, limit = 20, userId, status } = params;
  const offset = (page - 1) * limit;

  let query = SUPABASE.from("payment_history")
    .select(
      `
      id,
      user_id,
      amount_cents,
      currency,
      status,
      description,
      created_at,
      users!inner(email, first_name, last_name)
    `,
      { count: "exact" }
    );

  if (userId) query = query.eq("user_id", userId);
  if (status) query = query.eq("status", status as any);

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("[Admin Service] Failed to fetch payment history:", error);
    throw new Error(`Failed to fetch payment history: ${error.message}`);
  }

  const payments: AdminPayment[] = (data || []).map((payment: any) => ({
    id: payment.id,
    user_id: payment.user_id,
    amount_cents: payment.amount_cents,
    currency: payment.currency,
    status: payment.status,
    description: payment.description,
    created_at: payment.created_at,
    user_email: payment.users?.email,
    user_name: [payment.users?.first_name, payment.users?.last_name]
      .filter(Boolean)
      .join(" "),
  }));

  return { payments, total: count || 0 };
};

/**
 * Get admin audit logs
 */
export const getAuditLogs = async (params: {
  page?: number;
  limit?: number;
  adminUserId?: string;
  actionType?: string;
}): Promise<{ logs: AdminAuditLogEntry[]; total: number }> => {
  const { page = 1, limit = 50, adminUserId, actionType } = params;
  const offset = (page - 1) * limit;

  let query = SUPABASE.from("audit_logs")
    .select(
      `
      id,
      action,
      admin_user_id,
      admin_action_type,
      resource_type,
      resource_id,
      old_values,
      new_values,
      ip_address,
      user_agent,
      created_at
    `,
      { count: "exact" }
    )
    .not("admin_user_id", "is", null);

  if (adminUserId) query = query.eq("admin_user_id", adminUserId);
  if (actionType) query = query.eq("admin_action_type", actionType);

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("[Admin Service] Failed to fetch audit logs:", error);
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }

  // Fetch admin emails separately for display
  const adminIds = [...new Set((data || []).map((log: any) => log.admin_user_id))];
  const { data: admins } = await SUPABASE.from("users")
    .select("id, email")
    .in("id", adminIds);

  const adminEmailMap = new Map(
    (admins || []).map((a: any) => [a.id, a.email])
  );

  const logs: AdminAuditLogEntry[] = (data || []).map((log: any) => ({
    id: log.id,
    action: log.action,
    admin_user_id: log.admin_user_id,
    admin_email: adminEmailMap.get(log.admin_user_id) || undefined,
    resource_type: log.resource_type || "",
    resource_id: log.resource_id || "",
    old_values: log.old_values,
    new_values: log.new_values,
    ip_address: log.ip_address || "",
    user_agent: log.user_agent || "",
    created_at: log.created_at,
  }));

  return { logs, total: count || 0 };
};

/**
 * Log admin action to audit_logs
 */
export const logAdminAction = async (params: {
  adminUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> => {
  const { error } = await SUPABASE.from("audit_logs").insert({
    admin_user_id: params.adminUserId,
    admin_action_type: params.action,
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId,
    old_values: params.oldValues || null,
    new_values: params.newValues || null,
    ip_address: params.ipAddress || null,
    user_agent: params.userAgent || null,
    status: "success",
  } as any);

  if (error) {
    console.error("[Admin Service] Failed to log admin action:", error);
    // Don't throw - logging should not break the main operation
  }
};

/**
 * Send password reset email (via Supabase Auth)
 */
export const sendPasswordResetEmail = async (
  userEmail: string,
  adminUserId: string
): Promise<void> => {
  const { error } = await SUPABASE.auth.resetPasswordForEmail(userEmail, {
    redirectTo: `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password`,
  });

  if (error) {
    console.error("[Admin Service] Failed to send password reset:", error);
    throw new Error(`Failed to send password reset: ${error.message}`);
  }

  // Log admin action
  await logAdminAction({
    adminUserId,
    action: "password_reset_sent",
    resourceType: "user",
    resourceId: userEmail,
    newValues: { email: userEmail },
  });
};
