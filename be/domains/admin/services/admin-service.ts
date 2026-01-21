import { SUPABASE } from "@/config"
import {
  getSubscriptionByEmail,
  type LSSubscriptionInfo,
  type PlanSlug,
} from "@/domains/payments/services/lemonsqueezy-service"
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
} from "@/types"
import { invalidateUserProfileCache } from "@/lib/cache/user-cache"
import { logger } from "@/lib/logger"

const MILLISECONDS_PER_DAY = 86_400_000
const DAYS_IN_WEEK = 7
const DAYS_IN_MONTH = 30

/**
 * Retrieves comprehensive dashboard KPI statistics for admin overview.
 * Gathers user metrics, revenue data, and activity trends from the last 24 hours,
 * 7 days, and 30 days. Uses parallel database queries for optimal performance.
 *
 * @returns Promise resolving to dashboard statistics including user counts, revenue, and activity metrics
 */
export const getDashboardStats = async (): Promise<AdminDashboardStats> => {
  const now = new Date()
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString()
  const weekAgo = new Date(
    now.getTime() - DAYS_IN_WEEK * MILLISECONDS_PER_DAY
  ).toISOString()
  const monthAgo = new Date(
    now.getTime() - DAYS_IN_MONTH * MILLISECONDS_PER_DAY
  ).toISOString()

  try {
    // Run all queries in parallel
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: newUsersToday },
      { count: newUsersWeek },
      { count: newUsersMonth },
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
    ])

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsersToday: newUsersToday || 0,
      newUsersWeek: newUsersWeek || 0,
      newUsersMonth: newUsersMonth || 0,
      activeSubscriptions: 0, // Now tracked via LemonSqueezy dashboard
      totalRevenueCents: 0, // Revenue tracking via LemonSqueezy dashboard
      mrrCents: 0, // MRR tracking via LemonSqueezy dashboard
    }
  } catch (error) {
    console.error("[Admin Service] Failed to fetch dashboard stats:", error)
    throw new Error(`Failed to fetch dashboard stats: ${error}`)
  }
}

/**
 * Get subscription distribution - returns static plan metadata
 * Actual subscriber counts now tracked via LemonSqueezy dashboard
 */
/**
 * Returns subscription distribution data by plan type.
 * Note: Currently returns empty counts since subscription data is managed externally by LemonSqueezy.
 * This provides the structure for future integration with subscription analytics.
 *
 * @returns Array of subscription distribution objects with plan details and zeroed counts
 */
export const getSubscriptionDistribution = (): SubscriptionDistribution[] => {
  const planSlugs: PlanSlug[] = ["starter", "pro", "executive"]

  return planSlugs.map((slug) => ({
    planSlug: slug,
    planName: slug.charAt(0).toUpperCase() + slug.slice(1),
    subscriberCount: 0,
    percentage: 0,
  }))
}

type UserRow = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  display_name?: string | null
  avatar_url?: string | null
  status?: string | null
  role?: string | null
  timezone?: string | null
  locale?: string | null
  email_verified?: boolean | null
  created_at?: string | null
  updated_at?: string | null
  last_login_at?: string | null
  ai_interactions_used?: number | null
  credits_remaining?: number | null
}

const mapUserToAdminUser = (
  user: UserRow,
  subscription: LSSubscriptionInfo | null,
  oauthConnected: boolean
): AdminUser => ({
  id: user.id,
  email: user.email,
  first_name: user.first_name ?? null,
  last_name: user.last_name ?? null,
  display_name: user.display_name ?? null,
  avatar_url: user.avatar_url ?? null,
  status: (user.status as UserStatus) || "active",
  role: (user.role as UserRole) || "user",
  timezone: user.timezone ?? null,
  locale: user.locale ?? null,
  email_verified: user.email_verified ?? null,
  created_at: user.created_at || new Date().toISOString(),
  updated_at: user.updated_at || new Date().toISOString(),
  last_login_at: user.last_login_at ?? null,
  subscription: subscription
    ? {
        id: subscription.id,
        plan_name: subscription.productName,
        plan_slug: subscription.variantName?.toLowerCase() || "unknown",
        status: subscription.status,
        interval: subscription.variantName?.includes("yearly")
          ? "yearly"
          : "monthly",
        current_period_end: subscription.renewsAt,
        ai_interactions_used: user.ai_interactions_used || 0,
        credits_remaining: user.credits_remaining || 0,
      }
    : null,
  oauth_connected: oauthConnected,
})

const DEFAULT_PAGE_SIZE = 20

export const getUserList = async (
  params: AdminUserListParams
): Promise<AdminUserListResponse> => {
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    search,
    status,
    role,
    sortBy = "created_at",
    sortOrder = "desc",
  } = params

  const offset = (page - 1) * limit

  try {
    let query = SUPABASE.from("users").select("*", { count: "exact" })

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
      )
    }
    if (status) {
      query = query.eq("status", status)
    }
    if (role) {
      query = query.eq("role", role)
    }

    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    const userRows = (data || []) as UserRow[]
    const userIds = userRows.map((u) => u.id)

    const { data: oauthTokens } =
      userIds.length > 0
        ? await SUPABASE.from("oauth_tokens")
            .select("user_id")
            .in("user_id", userIds)
        : { data: [] }

    const oauthByUser = new Set<string>()
    for (const token of oauthTokens || []) {
      oauthByUser.add(token.user_id)
    }

    const users: AdminUser[] = userRows.map((user) =>
      mapUserToAdminUser(user, null, oauthByUser.has(user.id))
    )

    return {
      users,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    }
  } catch (error) {
    console.error("[Admin Service] Failed to fetch users:", error)
    throw new Error(`Failed to fetch users: ${error}`)
  }
}

export const getUserById = async (
  userId: string
): Promise<AdminUser | null> => {
  try {
    const { data: user, error } = await SUPABASE.from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw error
    }

    if (!user) {
      return null
    }

    const userRow = user as UserRow

    const [subscription, oauthResult] = await Promise.all([
      getSubscriptionByEmail(userRow.email),
      SUPABASE.from("oauth_tokens")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle(),
    ])

    return mapUserToAdminUser(userRow, subscription, !!oauthResult.data)
  } catch (error) {
    console.error("[Admin Service] Failed to fetch user:", error)
    throw new Error(`Failed to fetch user: ${error}`)
  }
}

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
    .single()

  const { error } = await SUPABASE.from("users")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) {
    console.error("[Admin Service] Failed to update user status:", error)
    throw new Error(`Failed to update user status: ${error.message}`)
  }

  // Log admin action
  await logAdminAction({
    adminUserId,
    action: "user_status_change",
    resourceType: "user",
    resourceId: userId,
    oldValues: { status: currentUser?.status },
    newValues: { status: newStatus, reason },
  })
}

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
    throw new Error("Cannot modify your own role")
  }

  // Get current role for audit log
  const { data: currentUser } = await SUPABASE.from("users")
    .select("role, email")
    .eq("id", userId)
    .single()

  const { error } = await SUPABASE.from("users")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) {
    console.error("[Admin Service] Failed to update user role:", error)
    throw new Error(`Failed to update user role: ${error.message}`)
  }

  // Invalidate user profile cache so new role takes effect immediately
  await invalidateUserProfileCache(userId)

  // Log admin action
  await logAdminAction({
    adminUserId,
    action: "user_role_change",
    resourceType: "user",
    resourceId: userId,
    oldValues: { role: currentUser?.role },
    newValues: { role: newRole, reason },
  })
}

export const grantCredits = async (
  userId: string,
  credits: number,
  adminUserId: string,
  reason: string
): Promise<void> => {
  const { data: user, error: fetchError } = await SUPABASE.from("users")
    .select("id, credits_remaining")
    .eq("id", userId)
    .single()

  if (fetchError || !user) {
    throw new Error("User not found")
  }

  const currentCredits = user.credits_remaining || 0
  const newCredits = currentCredits + credits

  const { error } = await SUPABASE.from("users")
    .update({
      credits_remaining: newCredits,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    console.error("[Admin Service] Failed to grant credits:", error)
    throw new Error(`Failed to grant credits: ${error.message}`)
  }

  await logAdminAction({
    adminUserId,
    action: "credits_grant",
    resourceType: "user",
    resourceId: userId,
    oldValues: { credits_remaining: currentCredits },
    newValues: {
      credits_added: credits,
      new_total: newCredits,
      reason,
    },
  })
}

/**
 * Payment history now managed via LemonSqueezy dashboard
 */
export const getPaymentHistory = (_params: {
  page?: number
  limit?: number
  userId?: string
  status?: string
}): { payments: AdminPayment[]; total: number } => ({ payments: [], total: 0 })

/**
 * Audit logs feature removed for simpler architecture
 */
export const getAuditLogs = (_params: {
  page?: number
  limit?: number
  adminUserId?: string
  actionType?: string
}): { logs: AdminAuditLogEntry[]; total: number } => ({ logs: [], total: 0 })

export const logAdminAction = (_params: {
  adminUserId: string
  action: string
  resourceType: string
  resourceId: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}): void => {
  logger.debug(
    `[Admin Action] ${_params.action} on ${_params.resourceType}/${_params.resourceId}`
  )
}

/**
 * Send password reset email (via Supabase Auth)
 */
export const sendPasswordResetEmail = async (
  userEmail: string,
  adminUserId: string
): Promise<void> => {
  const { error } = await SUPABASE.auth.resetPasswordForEmail(userEmail, {
    redirectTo: `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password`,
  })

  if (error) {
    console.error("[Admin Service] Failed to send password reset:", error)
    throw new Error(`Failed to send password reset: ${error.message}`)
  }

  // Log admin action
  await logAdminAction({
    adminUserId,
    action: "password_reset_sent",
    resourceType: "user",
    resourceId: userEmail,
    newValues: { email: userEmail },
  })
}

/**
 * Revenue trends data point
 */
export type RevenueTrendPoint = {
  month: string
  revenue: number
  subscriptions: number
}

/**
 * Subscription trend data point
 */
export type SubscriptionTrendPoint = {
  date: string
  newSubscriptions: number
  cancelledSubscriptions: number
  totalActive: number
}

const DEFAULT_REVENUE_MONTHS = 6
const DEFAULT_TREND_DAYS = 7

/**
 * Revenue and subscription trends are now tracked via LemonSqueezy dashboard.
 * These functions return placeholder data for API compatibility.
 */
export const getRevenueTrends = (
  months = DEFAULT_REVENUE_MONTHS
): RevenueTrendPoint[] => {
  const trends: RevenueTrendPoint[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = startOfMonth.toLocaleDateString("en-US", {
      month: "short",
    })

    trends.push({
      month: monthName,
      revenue: 0,
      subscriptions: 0,
    })
  }

  return trends
}

export const getSubscriptionTrends = (
  days = DEFAULT_TREND_DAYS
): SubscriptionTrendPoint[] => {
  const trends: SubscriptionTrendPoint[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" })

    trends.push({
      date: dayName,
      newSubscriptions: 0,
      cancelledSubscriptions: 0,
      totalActive: 0,
    })
  }

  return trends
}

export const getAdminUserInfo = async (
  userId: string
): Promise<AdminUser | null> => getUserById(userId)

export const createImpersonationSession = async (
  targetUserId: string,
  adminUserId: string
): Promise<{
  targetUser: AdminUser
  impersonationToken: string
}> => {
  if (targetUserId === adminUserId) {
    throw new Error("Cannot impersonate yourself")
  }

  const targetUser = await getUserById(targetUserId)
  if (!targetUser) {
    throw new Error("Target user not found")
  }

  const { data: sessionData, error } = await SUPABASE.auth.admin.generateLink({
    type: "magiclink",
    email: targetUser.email,
    options: {
      redirectTo: `${process.env.FRONTEND_URL || "http://localhost:4000"}/dashboard`,
    },
  })

  if (error || !sessionData) {
    console.error("[Admin Service] Failed to create impersonation link:", error)
    throw new Error("Failed to create impersonation session")
  }

  await logAdminAction({
    adminUserId,
    action: "user_impersonation_start",
    resourceType: "user",
    resourceId: targetUserId,
    newValues: { targetEmail: targetUser.email },
  })

  const token = sessionData.properties?.hashed_token || ""

  return {
    targetUser,
    impersonationToken: token,
  }
}

export const revokeUserSessions = async (
  targetUserId: string,
  adminUserId: string
): Promise<void> => {
  if (targetUserId === adminUserId) {
    throw new Error("Cannot revoke your own sessions")
  }

  const targetUser = await getUserById(targetUserId)
  if (!targetUser) {
    throw new Error("Target user not found")
  }

  const { error } = await SUPABASE.auth.admin.signOut(targetUserId, "global")

  if (error) {
    console.error("[Admin Service] Failed to revoke sessions:", error)
    throw new Error(`Failed to revoke sessions: ${error.message}`)
  }

  await SUPABASE.from("users")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", targetUserId)

  await logAdminAction({
    adminUserId,
    action: "user_sessions_revoked",
    resourceType: "user",
    resourceId: targetUserId,
    newValues: {
      targetEmail: targetUser.email,
      revokedAt: new Date().toISOString(),
    },
  })
}

export type BroadcastPayload = {
  type: "info" | "warning" | "critical"
  title: string
  message: string
  targetUserIds?: string[]
  filters?: {
    planSlug?: string
    status?: UserStatus
    lastActiveWithinDays?: number
  }
}

export const broadcastToUsers = async (
  adminUserId: string,
  payload: BroadcastPayload
): Promise<{ sentTo: number }> => {
  const userIds = await resolveTargetUserIds(payload)

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
  })

  return { sentTo: userIds.length }
}

/**
 * Resolves target user IDs for broadcast notifications based on payload configuration.
 * Either uses explicitly provided user IDs or applies filters to determine recipients.
 * Falls back to all active users if no specific targeting is provided.
 *
 * @param payload - Broadcast payload containing targeting configuration
 * @returns Promise resolving to array of user IDs that should receive the notification
 */
async function resolveTargetUserIds(
  payload: BroadcastPayload
): Promise<string[]> {
  if (payload.targetUserIds && payload.targetUserIds.length > 0) {
    return payload.targetUserIds
  }

  if (payload.filters) {
    return resolveFilteredUserIds(payload.filters)
  }

  const { data: users } = await SUPABASE.from("users")
    .select("id")
    .eq("status", "active")

  return (users || []).map((u) => u.id)
}

/**
 * Resolves user IDs based on filtering criteria for targeted broadcast notifications.
 * Applies database filters for user status, role, subscription status, and activity dates.
 * Builds and executes a Supabase query with the specified filters to find matching users.
 *
 * @param filters - Filter criteria for selecting target users
 * @returns Promise resolving to array of user IDs matching the filter criteria
 */
async function resolveFilteredUserIds(
  filters: NonNullable<BroadcastPayload["filters"]>
): Promise<string[]> {
  let query = SUPABASE.from("users").select("id")

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.lastActiveWithinDays) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - filters.lastActiveWithinDays)
    query = query.gte("last_login_at", cutoff.toISOString())
  }

  const { data: users, error } = await query
  if (error) {
    throw new Error(`Failed to fetch users for broadcast: ${error.message}`)
  }

  const userIds = (users || []).map((u) => u.id)

  if (filters.planSlug) {
    logger.warn(
      "[Admin Service] planSlug filter not supported - subscriptions now managed via LemonSqueezy"
    )
  }

  return userIds
}
