import { z } from "zod";

/**
 * Validation schema for updating user status
 */
export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "inactive", "suspended", "pending_verification"]),
  reason: z.string().max(500).optional(),
});

/**
 * Validation schema for granting credits
 */
export const grantCreditsSchema = z.object({
  credits: z.number().int().positive().max(100_000),
  reason: z.string().min(1).max(500),
});

/**
 * Validation schema for updating user role
 */
export const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin", "moderator", "support"]),
  reason: z.string().max(500).optional(),
});

/**
 * Query params for admin user list
 */
export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().max(100).optional(),
  status: z
    .enum(["active", "inactive", "suspended", "pending_verification"])
    .optional(),
  role: z.enum(["user", "admin", "moderator", "support"]).optional(),
  sortBy: z.enum(["created_at", "email", "last_login_at"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

/**
 * Query params for admin payment history
 */
export const adminPaymentHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  userId: z.string().uuid().optional(),
  status: z.enum(["pending", "succeeded", "failed", "refunded"]).optional(),
});

/**
 * Query params for admin audit logs
 */
export const adminAuditLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  adminUserId: z.string().uuid().optional(),
  actionType: z.string().max(50).optional(),
});

/**
 * Type exports for request bodies
 */
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type GrantCreditsInput = z.infer<typeof grantCreditsSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;
export type AdminPaymentHistoryQuery = z.infer<
  typeof adminPaymentHistoryQuerySchema
>;
export type AdminAuditLogQuery = z.infer<typeof adminAuditLogQuerySchema>;
