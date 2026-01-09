import type { NextFunction, Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/utils/http";
import { SUPABASE, STATUS_RESPONSE } from "@/config";
import type { UserRole } from "@/types";

/**
 * Admin Authorization Middleware Factory
 *
 * Validates that the authenticated user has one of the allowed roles.
 * Must be used AFTER supabaseAuth() middleware.
 *
 * @param {UserRole[]} allowedRoles - Array of roles allowed to access the route
 *
 * @example
 * // Admin only
 * router.use(supabaseAuth(), adminAuth(['admin']));
 *
 * // Admin or moderator
 * router.use(supabaseAuth(), adminAuth(['admin', 'moderator']));
 */
export const adminAuth = (allowedRoles: UserRole[] = ["admin"]) => {
  return reqResAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id;

      if (!userId) {
        return sendR(
          res,
          STATUS_RESPONSE.UNAUTHORIZED,
          "Authentication required"
        );
      }

      // Fetch user role from database
      const { data: userData, error } = await SUPABASE.from("users")
        .select("role, status")
        .eq("id", userId)
        .single();

      if (error || !userData) {
        console.error("[Admin Auth] Failed to fetch user role:", error);
        return sendR(
          res,
          STATUS_RESPONSE.FORBIDDEN,
          "Unable to verify user permissions"
        );
      }

      // Check if user is suspended
      if (userData.status === "suspended") {
        return sendR(res, STATUS_RESPONSE.FORBIDDEN, "Account suspended");
      }

      // Check role
      const userRole = (userData.role as UserRole) || "user";
      if (!allowedRoles.includes(userRole)) {
        return sendR(
          res,
          STATUS_RESPONSE.FORBIDDEN,
          "Insufficient permissions to access this resource"
        );
      }

      // Attach role to request for downstream use
      (req as AdminRequest).userRole = userRole;

      next();
    }
  );
};

/**
 * Extended request type with admin role
 */
export interface AdminRequest extends Request {
  userRole?: UserRole;
}
