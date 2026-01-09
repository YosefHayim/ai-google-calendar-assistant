import type { Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config";
import { reqResAsyncHandler, sendR } from "@/utils/http";
import * as adminService from "@/services/admin-service";
import type { AdminRequest } from "@/middlewares/admin-auth";
import type { AdminUserListParams, UserRole, UserStatus } from "@/types";

/**
 * GET /api/admin/dashboard/stats
 * Get KPI stats for admin dashboard
 */
export const getDashboardStats = reqResAsyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Dashboard stats retrieved", stats);
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
    const params: AdminUserListParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      search: req.query.search as string | undefined,
      status: req.query.status as UserStatus | undefined,
      role: req.query.role as UserRole | undefined,
      sortBy: req.query.sortBy as AdminUserListParams["sortBy"],
      sortOrder: req.query.sortOrder as AdminUserListParams["sortOrder"],
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
    const user = await adminService.getUserById(req.params.id);
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
    const { id } = req.params;
    const { status, reason } = req.body;
    const adminUserId = req.user?.id;

    if (!adminUserId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Admin ID required");
    }

    // Prevent admin from changing their own status
    if (id === adminUserId) {
      return sendR(
        res,
        STATUS_RESPONSE.FORBIDDEN,
        "Cannot modify your own status"
      );
    }

    await adminService.updateUserStatus(id, status, adminUserId, reason);
    return sendR(res, STATUS_RESPONSE.SUCCESS, "User status updated");
  }
);

/**
 * PATCH /api/admin/users/:id/role
 * Update user role
 */
export const updateUserRole = reqResAsyncHandler(
  async (req: AdminRequest, res: Response) => {
    const { id } = req.params;
    const { role, reason } = req.body;
    const adminUserId = req.user?.id;

    if (!adminUserId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Admin ID required");
    }

    // Prevent admin from changing their own role
    if (id === adminUserId) {
      return sendR(res, STATUS_RESPONSE.FORBIDDEN, "Cannot modify your own role");
    }

    await adminService.updateUserRole(id, role, adminUserId, reason);
    return sendR(res, STATUS_RESPONSE.SUCCESS, "User role updated");
  }
);

/**
 * POST /api/admin/users/:id/credits
 * Grant credits to user
 */
export const grantCredits = reqResAsyncHandler(
  async (req: AdminRequest, res: Response) => {
    const { id } = req.params;
    const { credits, reason } = req.body;
    const adminUserId = req.user?.id;

    if (!adminUserId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Admin ID required");
    }

    if (!credits || credits <= 0) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Credits must be a positive number"
      );
    }

    await adminService.grantCredits(id, credits, adminUserId, reason);
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Credits granted successfully");
  }
);

/**
 * POST /api/admin/users/:id/password-reset
 * Send password reset email
 */
export const sendPasswordReset = reqResAsyncHandler(
  async (req: AdminRequest, res: Response) => {
    const user = await adminService.getUserById(req.params.id);
    if (!user) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User not found");
    }

    const adminUserId = req.user?.id;
    if (!adminUserId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Admin ID required");
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
    const params = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      userId: req.query.userId as string | undefined,
      status: req.query.status as string | undefined,
    };

    const result = await adminService.getPaymentHistory(params);
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Payment history retrieved", result);
  }
);

/**
 * GET /api/admin/subscriptions
 * Get subscriptions list (users with subscriptions)
 */
export const getSubscriptions = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const params: AdminUserListParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
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
    const params = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      adminUserId: req.query.adminUserId as string | undefined,
      actionType: req.query.actionType as string | undefined,
    };

    const result = await adminService.getAuditLogs(params);
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Audit logs retrieved", result);
  }
);
