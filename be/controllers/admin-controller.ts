import type { Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config";
import { emitToUser } from "@/config/clients/socket-server";
import type { AdminRequest } from "@/middlewares/admin-auth";
import * as adminService from "@/services/admin-service";
import type { AdminUserListParams, UserRole, UserStatus } from "@/types";
import { requireUserId } from "@/utils/auth/require-user";
import { reqResAsyncHandler, sendR } from "@/utils/http";
import {
  parsePaginationParams,
  parseSortParams,
} from "@/utils/http/pagination";

/**
 * GET /api/admin/dashboard/stats
 * Get KPI stats for admin dashboard
 */
export const getDashboardStats = reqResAsyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Dashboard stats retrieved",
      stats
    );
  }
);

/**
 * GET /api/admin/dashboard/distribution
 * Get subscription distribution by plan
 */
export const getSubscriptionDistribution = reqResAsyncHandler(
  async (_req: Request, res: Response) => {
    const distribution = await adminService.getSubscriptionDistribution();
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Subscription distribution retrieved",
      distribution
    );
  }
);

/**
 * GET /api/admin/users
 * Get paginated user list with filters
 */
export const getUsers = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(
      req.query,
      ["created_at", "email", "last_login_at"] as const,
      "created_at"
    );

    const params: AdminUserListParams = {
      page,
      limit,
      search: req.query.search as string | undefined,
      status: req.query.status as UserStatus | undefined,
      role: req.query.role as UserRole | undefined,
      sortBy,
      sortOrder,
    };

    const result = await adminService.getUserList(params);
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Users retrieved", result);
  }
);

/**
 * GET /api/admin/users/:id
 * Get single user details
 */
export const getUserById = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const user = await adminService.getUserById(req.params.id as string);
    if (!user) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User not found");
    }
    return sendR(res, STATUS_RESPONSE.SUCCESS, "User retrieved", user);
  }
);

/**
 * PATCH /api/admin/users/:id/status
 * Update user status
 */
export const updateUserStatus = reqResAsyncHandler(
  async (req: AdminRequest, res: Response) => {
    const userResult = requireUserId(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId: adminUserId } = userResult;

    const { id } = req.params;
    const { status, reason } = req.body;

    // Prevent admin from changing their own status
    if (id === adminUserId) {
      return sendR(
        res,
        STATUS_RESPONSE.FORBIDDEN,
        "Cannot modify your own status"
      );
    }

    await adminService.updateUserStatus(id as string, status, adminUserId, reason);
    return sendR(res, STATUS_RESPONSE.SUCCESS, "User status updated");
  }
);

/**
 * PATCH /api/admin/users/:id/role
 * Update user role
 */
export const updateUserRole = reqResAsyncHandler(
  async (req: AdminRequest, res: Response) => {
    const userResult = requireUserId(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId: adminUserId } = userResult;

    const { id } = req.params;
    const { role, reason } = req.body;

    // Prevent admin from changing their own role
    if (id === adminUserId) {
      return sendR(
        res,
        STATUS_RESPONSE.FORBIDDEN,
        "Cannot modify your own role"
      );
    }

    await adminService.updateUserRole(id as string, role, adminUserId, reason);
    return sendR(res, STATUS_RESPONSE.SUCCESS, "User role updated");
  }
);

/**
 * POST /api/admin/users/:id/credits
 * Grant credits to user
 */
export const grantCredits = reqResAsyncHandler(
  async (req: AdminRequest, res: Response) => {
    const userResult = requireUserId(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId: adminUserId } = userResult;

    const { id } = req.params;
    const { credits, reason } = req.body;

    if (!credits || credits <= 0) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Credits must be a positive number"
      );
    }

    await adminService.grantCredits(id as string, credits, adminUserId, reason);
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Credits granted successfully");
  }
);

/**
 * POST /api/admin/users/:id/password-reset
 * Send password reset email
 */
export const sendPasswordReset = reqResAsyncHandler(
  async (req: AdminRequest, res: Response) => {
    const userResult = requireUserId(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId: adminUserId } = userResult;

    const user = await adminService.getUserById(req.params.id as string);
    if (!user) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User not found");
    }

    await adminService.sendPasswordResetEmail(user.email, adminUserId);
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Password reset email sent");
  }
);

/**
 * GET /api/admin/payments
 * Get payment history
 */
export const getPaymentHistory = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);

    const params = {
      page,
      limit,
      userId: req.query.userId as string | undefined,
      status: req.query.status as string | undefined,
    };

    const result = await adminService.getPaymentHistory(params);
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Payment history retrieved",
      result
    );
  }
);

/**
 * GET /api/admin/subscriptions
 * Get subscriptions list (users with subscriptions)
 */
export const getSubscriptions = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);

    const params: AdminUserListParams = {
      page,
      limit,
      sortBy: "created_at",
      sortOrder: "desc",
    };

    const result = await adminService.getUserList(params);

    // Filter to only users with subscriptions
    const usersWithSubs = result.users.filter((u) => u.subscription);

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Subscriptions retrieved", {
      subscriptions: usersWithSubs,
      total: usersWithSubs.length,
      page: result.page,
      totalPages: result.totalPages,
    });
  }
);

/**
 * GET /api/admin/audit-logs
 * Get admin audit logs
 */
export const getAuditLogs = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query, { limit: 50 });

    const params = {
      page,
      limit,
      adminUserId: req.query.adminUserId as string | undefined,
      actionType: req.query.actionType as string | undefined,
    };

    const result = await adminService.getAuditLogs(params);
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Audit logs retrieved", result);
  }
);

/**
 * GET /api/admin/dashboard/revenue-trends
 * Get monthly revenue trends for charts
 */
export const getRevenueTrends = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const months = req.query.months
      ? Number.parseInt(req.query.months as string, 10)
      : 6;
    const trends = await adminService.getRevenueTrends(months);
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Revenue trends retrieved",
      trends
    );
  }
);

/**
 * GET /api/admin/dashboard/subscription-trends
 * Get daily subscription trends for charts
 */
export const getSubscriptionTrends = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const days = req.query.days
      ? Number.parseInt(req.query.days as string, 10)
      : 7;
    const trends = await adminService.getSubscriptionTrends(days);
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Subscription trends retrieved",
      trends
    );
  }
);

export const getAdminMe = reqResAsyncHandler(
  async (req: AdminRequest, res: Response) => {
    const userResult = requireUserId(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId } = userResult;

    const user = await adminService.getAdminUserInfo(userId);
    if (!user) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Admin user not found");
    }

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Admin user info retrieved",
      user
    );
  }
);

export const impersonateUser = reqResAsyncHandler(
  async (req: AdminRequest, res: Response) => {
    const userResult = requireUserId(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId: adminUserId } = userResult;

    const { id: targetUserId } = req.params;

    const result = await adminService.createImpersonationSession(
      targetUserId as string,
      adminUserId
    );

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Impersonation session created",
      {
        targetUser: result.targetUser,
        impersonationToken: result.impersonationToken,
      }
    );
  }
);

export const revokeUserSessions = reqResAsyncHandler(
  async (req: AdminRequest, res: Response) => {
    const userResult = requireUserId(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId: adminUserId } = userResult;

    const { id: targetUserId } = req.params;

    await adminService.revokeUserSessions(targetUserId as string, adminUserId);

    return sendR(res, STATUS_RESPONSE.SUCCESS, "User sessions revoked");
  }
);

export const broadcastNotification = reqResAsyncHandler(
  async (req: AdminRequest, res: Response) => {
    const userResult = requireUserId(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId: adminUserId } = userResult;

    const { type, title, message, targetUserIds, filters } = req.body;

    if (!(type && title && message)) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "type, title, and message are required"
      );
    }

    const result = await adminService.broadcastToUsers(adminUserId, {
      type,
      title,
      message,
      targetUserIds,
      filters,
    });

    if (targetUserIds?.length) {
      for (const userId of targetUserIds) {
        emitToUser(userId, "notification", {
          type: "system",
          title,
          message,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Broadcast sent", result);
  }
);
