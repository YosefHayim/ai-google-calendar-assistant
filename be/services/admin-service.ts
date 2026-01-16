import { SUPABASE } from "@/config";
import type {
  AdminAuditLogEntry,
  AdminDashboardStats,
  AdminPayment,
  AdminUser,
  AdminUserListParams,
  AdminUserListResponse,
  SubscriptionDistribution,
  UserRole,
  UserStatus,
} from "@/types";
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  MODIFIABLE_SUBSCRIPTION_STATUSES,
} from "@/utils/db/subscription-status";
import { invalidateUserProfileCache } from "@/utils/cache/user-cache";

/**
 * Get dashboard KPI stats via direct queries
 */
export const getDashboardStats = async (): Promise<AdminDashboardStats> => {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();
  const weekAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  const monthAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  try {
    // Run all queries in parallel
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: newUsersToday },
      { count: newUsersWeek },
      { count: newUsersMonth },
      { count: activeSubscriptions },
    ] = await Promise.all([
      SUPABASE.from("users").select("id", { count: "exact", head: true }),
      SUPABASE.from("users")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      SUPABASE.from("users")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart),
      SUPABASE.from("users")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekAgo),
      SUPABASE.from("users")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthAgo),
      SUPABASE.from("subscriptions")
        .select("id", { count: "exact", head: true })
        .in("status", [...ACTIVE_SUBSCRIPTION_STATUSES]),
    ]);

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsersToday: newUsersToday || 0,
      newUsersWeek: newUsersWeek || 0,
      newUsersMonth: newUsersMonth || 0,
      activeSubscriptions: activeSubscriptions || 0,
      totalRevenueCents: 0, // Revenue tracking via LemonSqueezy dashboard
      mrrCents: 0, // MRR tracking via LemonSqueezy dashboard
    };
  } catch (error) {
    console.error("[Admin Service] Failed to fetch dashboard stats:", error);
    throw new Error(`Failed to fetch dashboard stats: ${error}`);
  }
};

/**
 * Get subscription distribution via direct queries
 */
export const getSubscriptionDistribution = async (): Promise<
  SubscriptionDistribution[]
> => {
  try {
    // Get active subscriptions grouped by plan
    const { data: subscriptions, error: subError } = await SUPABASE.from(
      "subscriptions"
    )
      .select("plan_id")
      .in("status", [...ACTIVE_SUBSCRIPTION_STATUSES]);

    if (subError) {
      throw subError;
    }

    // Get all plans
    const { data: plans, error: planError } =
      await SUPABASE.from("plans").select("id, slug, name");

    if (planError) {
      throw planError;
    }

    // Count subscriptions per plan
    const planCounts = new Map<string, number>();
    const totalSubs = subscriptions?.length || 0;

    for (const sub of subscriptions || []) {
      const count = planCounts.get(sub.plan_id) || 0;
      planCounts.set(sub.plan_id, count + 1);
    }

    // Build distribution
    const distribution: SubscriptionDistribution[] = (plans || [])
      .map((plan) => {
        const count = planCounts.get(plan.id) || 0;
        return {
          planSlug: plan.slug || "unknown",
          planName: plan.name || "Unknown",
          subscriberCount: count,
          percentage: totalSubs > 0 ? Math.round((count / totalSubs) * 100) : 0,
        };
      })
      .filter((d) => d.subscriberCount > 0);

    return distribution;
  } catch (error) {
    console.error(
      "[Admin Service] Failed to fetch subscription distribution:",
      error
    );
    throw new Error(`Failed to fetch subscription distribution: ${error}`);
  }
};

/**
 * Get paginated user list with filters via direct queries
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

  try {
    // Query users directly
    let query = SUPABASE.from("users").select("*", { count: "exact" });

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
      throw error;
    }

    // Get subscriptions for these users
    const userIds = (data || []).map((u: any) => u.id);
    const { data: subscriptions } =
      userIds.length > 0
        ? await SUPABASE.from("subscriptions")
            .select("*, plans(name, slug)")
            .in("user_id", userIds)
            .in("status", [
              ...ACTIVE_SUBSCRIPTION_STATUSES,
              ...MODIFIABLE_SUBSCRIPTION_STATUSES,
            ])
        : { data: [] };

    // Get oauth tokens to check connection status
    const { data: oauthTokens } =
      userIds.length > 0
        ? await SUPABASE.from("oauth_tokens")
            .select("user_id")
            .in("user_id", userIds)
        : { data: [] };

    const subsByUser = new Map<string, any>();
    for (const sub of subscriptions || []) {
      subsByUser.set(sub.user_id, sub);
    }

    const oauthByUser = new Set<string>();
    for (const token of oauthTokens || []) {
      oauthByUser.add(token.user_id);
    }

    const users: AdminUser[] = (data || []).map((user: any) => {
      const sub = subsByUser.get(user.id);
      return {
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
        last_login_at: user.last_login_at,
        subscription: sub
          ? {
              id: sub.id,
              plan_name: sub.plans?.name || "Unknown",
              plan_slug: sub.plans?.slug || "unknown",
              status: sub.status || "unknown",
              interval: sub.interval || "monthly",
              current_period_end: sub.current_period_end,
              ai_interactions_used: sub.ai_interactions_used || 0,
              credits_remaining: sub.credits_remaining || 0,
            }
          : null,
        oauth_connected: oauthByUser.has(user.id),
      };
    });

    return {
      users,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error("[Admin Service] Failed to fetch users:", error);
    throw new Error(`Failed to fetch users: ${error}`);
  }
};

/**
 * Get single user details by ID via direct queries
 */
export const getUserById = async (
  userId: string
): Promise<AdminUser | null> => {
  try {
    const { data: user, error } = await SUPABASE.from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw error;
    }

    if (!user) {
      return null;
    }

    // Get subscription
    const { data: subscription } = await SUPABASE.from("subscriptions")
      .select("*, plans(name, slug)")
      .eq("user_id", userId)
      .in("status", [
        ...ACTIVE_SUBSCRIPTION_STATUSES,
        ...MODIFIABLE_SUBSCRIPTION_STATUSES,
      ])
      .maybeSingle();

    // Check oauth connection
    const { data: oauthToken } = await SUPABASE.from("oauth_tokens")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    return {
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
      last_login_at: user.last_login_at,
      subscription: subscription
        ? {
            id: subscription.id,
            plan_name: (subscription.plans as any)?.name || "Unknown",
            plan_slug: (subscription.plans as any)?.slug || "unknown",
            status: subscription.status || "unknown",
            interval: subscription.interval || "monthly",
            current_period_end: subscription.current_period_end,
            ai_interactions_used: subscription.ai_interactions_used || 0,
            credits_remaining: subscription.credits_remaining || 0,
          }
        : null,
      oauth_connected: !!oauthToken,
    };
  } catch (error) {
    console.error("[Admin Service] Failed to fetch user:", error);
    throw new Error(`Failed to fetch user: ${error}`);
  }
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

  // Invalidate user profile cache so new role takes effect immediately
  await invalidateUserProfileCache(userId);

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
    .in("status", [...MODIFIABLE_SUBSCRIPTION_STATUSES])
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
 * Note: Payment history table was removed - use LemonSqueezy dashboard
 */
export const getPaymentHistory = async (_params: {
  page?: number;
  limit?: number;
  userId?: string;
  status?: string;
}): Promise<{ payments: AdminPayment[]; total: number }> => {
  // Payment history is now managed via LemonSqueezy dashboard
  return { payments: [], total: 0 };
};

/**
 * Get admin audit logs
 * Note: Audit logs table was removed for simplicity
 */
export const getAuditLogs = async (_params: {
  page?: number;
  limit?: number;
  adminUserId?: string;
  actionType?: string;
}): Promise<{ logs: AdminAuditLogEntry[]; total: number }> => {
  // Audit logs feature removed for simpler architecture
  return { logs: [], total: 0 };
};

/**
 * Log admin action (no-op after audit_logs table removal)
 */
export const logAdminAction = async (_params: {
  adminUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> => {
  // Audit logging disabled - table removed for simpler architecture
  // Console log for debugging if needed
  console.log(
    `[Admin Action] ${_params.action} on ${_params.resourceType}/${_params.resourceId}`
  );
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

/**
 * Revenue trends data point
 */
export type RevenueTrendPoint = {
  month: string;
  revenue: number;
  subscriptions: number;
};

/**
 * Subscription trend data point
 */
export type SubscriptionTrendPoint = {
  date: string;
  newSubscriptions: number;
  cancelledSubscriptions: number;
  totalActive: number;
};

/**
 * Get monthly revenue trends for the last N months
 * Note: Revenue is now tracked via LemonSqueezy dashboard
 */
export const getRevenueTrends = async (
  months = 6
): Promise<RevenueTrendPoint[]> => {
  const trends: RevenueTrendPoint[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      0,
      23,
      59,
      59
    );

    // Get new subscriptions for this month
    const { count: subCount } = await SUPABASE.from("subscriptions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString());

    const monthName = startOfMonth.toLocaleDateString("en-US", {
      month: "short",
    });

    trends.push({
      month: monthName,
      revenue: 0, // Revenue tracking moved to LemonSqueezy dashboard
      subscriptions: subCount || 0,
    });
  }

  return trends;
};

/**
 * Get daily subscription trends for the last N days
 */
export const getSubscriptionTrends = async (
  days = 7
): Promise<SubscriptionTrendPoint[]> => {
  const trends: SubscriptionTrendPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get new subscriptions for this day
    const { count: newSubs } = await SUPABASE.from("subscriptions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", date.toISOString())
      .lte("created_at", endOfDay.toISOString());

    // Get cancelled subscriptions for this day
    const { count: cancelledSubs } = await SUPABASE.from("subscriptions")
      .select("id", { count: "exact", head: true })
      .not("cancelled_at", "is", null)
      .gte("cancelled_at", date.toISOString())
      .lte("cancelled_at", endOfDay.toISOString());

    // Get total active subscriptions at end of this day
    const { count: totalActive } = await SUPABASE.from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", [...ACTIVE_SUBSCRIPTION_STATUSES])
      .lte("created_at", endOfDay.toISOString());

    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    trends.push({
      date: dayName,
      newSubscriptions: newSubs || 0,
      cancelledSubscriptions: cancelledSubs || 0,
      totalActive: totalActive || 0,
    });
  }

  return trends;
};

export const getAdminUserInfo = async (
  userId: string
): Promise<AdminUser | null> => getUserById(userId);

export const createImpersonationSession = async (
  targetUserId: string,
  adminUserId: string
): Promise<{
  targetUser: AdminUser;
  impersonationToken: string;
}> => {
  if (targetUserId === adminUserId) {
    throw new Error("Cannot impersonate yourself");
  }

  const targetUser = await getUserById(targetUserId);
  if (!targetUser) {
    throw new Error("Target user not found");
  }

  const { data: sessionData, error } =
    await SUPABASE.auth.admin.generateLink({
      type: "magiclink",
      email: targetUser.email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL || "http://localhost:4000"}/dashboard`,
      },
    });

  if (error || !sessionData) {
    console.error("[Admin Service] Failed to create impersonation link:", error);
    throw new Error("Failed to create impersonation session");
  }

  await logAdminAction({
    adminUserId,
    action: "user_impersonation_start",
    resourceType: "user",
    resourceId: targetUserId,
    newValues: { targetEmail: targetUser.email },
  });

  const token = sessionData.properties?.hashed_token || "";

  return {
    targetUser,
    impersonationToken: token,
  };
};

export const revokeUserSessions = async (
  targetUserId: string,
  adminUserId: string
): Promise<void> => {
  if (targetUserId === adminUserId) {
    throw new Error("Cannot revoke your own sessions");
  }

  const targetUser = await getUserById(targetUserId);
  if (!targetUser) {
    throw new Error("Target user not found");
  }

  const { error } = await SUPABASE.auth.admin.signOut(targetUserId, "global");

  if (error) {
    console.error("[Admin Service] Failed to revoke sessions:", error);
    throw new Error(`Failed to revoke sessions: ${error.message}`);
  }

  await SUPABASE.from("users")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", targetUserId);

  await logAdminAction({
    adminUserId,
    action: "user_sessions_revoked",
    resourceType: "user",
    resourceId: targetUserId,
    newValues: {
      targetEmail: targetUser.email,
      revokedAt: new Date().toISOString(),
    },
  });
};

export type BroadcastPayload = {
  type: "info" | "warning" | "critical";
  title: string;
  message: string;
  targetUserIds?: string[];
  filters?: {
    planSlug?: string;
    status?: UserStatus;
    lastActiveWithinDays?: number;
  };
};

export const broadcastToUsers = async (
  adminUserId: string,
  payload: BroadcastPayload
): Promise<{ sentTo: number }> => {
  const userIds = await resolveTargetUserIds(payload);

  await logAdminAction({
    adminUserId,
    action: "broadcast_sent",
    resourceType: "notification",
    resourceId: "broadcast",
    newValues: {
      type: payload.type,
      title: payload.title,
      sentToCount: userIds.length,
    },
  });

  return { sentTo: userIds.length };
};

async function resolveTargetUserIds(
  payload: BroadcastPayload
): Promise<string[]> {
  if (payload.targetUserIds && payload.targetUserIds.length > 0) {
    return payload.targetUserIds;
  }

  if (payload.filters) {
    return resolveFilteredUserIds(payload.filters);
  }

  const { data: users } = await SUPABASE.from("users")
    .select("id")
    .eq("status", "active");

  return (users || []).map((u) => u.id);
}

async function resolveFilteredUserIds(filters: NonNullable<BroadcastPayload["filters"]>): Promise<string[]> {
  let query = SUPABASE.from("users").select("id");

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.lastActiveWithinDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - filters.lastActiveWithinDays);
    query = query.gte("last_login_at", cutoff.toISOString());
  }

  const { data: users, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch users for broadcast: ${error.message}`);
  }

  let userIds = (users || []).map((u) => u.id);

  if (filters.planSlug) {
    const { data: subs } = await SUPABASE.from("subscriptions")
      .select("user_id, plans!inner(slug)")
      .eq("plans.slug", filters.planSlug)
      .in("status", [...ACTIVE_SUBSCRIPTION_STATUSES]);

    const planUserIds = new Set((subs || []).map((s) => s.user_id));
    userIds = userIds.filter((id) => planUserIds.has(id));
  }

  return userIds;
}
