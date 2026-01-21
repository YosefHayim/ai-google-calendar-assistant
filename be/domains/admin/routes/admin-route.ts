import express from "express";
import {
  broadcastNotification,
  getAdminMe,
  getAuditLogs,
  getDashboardStats,
  getPaymentHistory,
  getRevenueTrends,
  getSubscriptionDistribution,
  getSubscriptions,
  getSubscriptionTrends,
  getUserById,
  getUsers,
  grantCredits,
  impersonateUser,
  revokeUserSessions,
  sendPasswordReset,
  updateUserRole,
  updateUserStatus,
} from "@/domains/admin/controllers/admin-controller";
import { adminAuth } from "@/domains/admin/middleware/admin-auth";
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(supabaseAuth());
router.use(adminAuth(["admin"]));

/**
 * GET /dashboard/stats - Retrieve Administrative Dashboard Statistics
 *
 * Fetches comprehensive statistics and metrics for the admin dashboard,
 * including user counts, subscription metrics, system health, and key performance indicators.
 *
 * @param {Object} req.query - Optional filtering parameters
 * @param {string} req.query.period - Time period for metrics ('7d', '30d', '90d', '1y')
 * @param {boolean} req.query.include_trends - Whether to include trend data
 * @param {string} req.user.id - Authenticated admin user ID
 * @param {Array} req.user.roles - User roles (must include 'admin')
 *
 * @returns {Object} Comprehensive dashboard statistics
 * @property {Object} users - User-related metrics
 * @property {number} users.total - Total registered users
 * @property {number} users.active - Active users in the period
 * @property {number} users.new - New user registrations in the period
 * @property {Object} subscriptions - Subscription metrics
 * @property {number} subscriptions.total - Total active subscriptions
 * @property {Object} subscriptions.by_plan - Subscriptions grouped by plan type
 * @property {Object} revenue - Revenue metrics
 * @property {number} revenue.total - Total revenue for the period
 * @property {number} revenue.recurring - Recurring revenue
 * @property {Object} system - System health metrics
 * @property {number} system.api_requests - Total API requests
 * @property {number} system.error_rate - System error rate percentage
 *
 * @related Admin dashboard functionality. Provides administrators with comprehensive
 * business intelligence and system monitoring data to track platform health and growth.
 */
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/distribution", getSubscriptionDistribution);
router.get("/dashboard/revenue-trends", getRevenueTrends);
router.get("/dashboard/subscription-trends", getSubscriptionTrends);

// Current admin user
router.get("/me", getAdminMe);

/**
 * GET /users - Retrieve Paginated User List for Administration
 *
 * Fetches a paginated list of all users in the system with filtering and search capabilities.
 * Used by administrators to manage user accounts, monitor activity, and perform user operations.
 *
 * @param {Object} req.query - Query parameters for filtering and pagination
 * @param {number} req.query.page - Page number for pagination (default: 1)
 * @param {number} req.query.limit - Number of users per page (default: 50, max: 100)
 * @param {string} req.query.search - Search term for email or name filtering
 * @param {string} req.query.status - User status filter ('active', 'inactive', 'suspended')
 * @param {string} req.query.subscription - Subscription tier filter
 * @param {string} req.query.sort_by - Sort field ('created_at', 'last_login', 'email')
 * @param {string} req.query.sort_order - Sort order ('asc', 'desc')
 * @param {Date} req.query.created_after - Filter users created after this date
 * @param {Date} req.query.created_before - Filter users created before this date
 * @param {string} req.user.id - Authenticated admin user ID
 * @param {Array} req.user.roles - User roles (must include 'admin')
 *
 * @returns {Object} Paginated user list with metadata
 * @property {Array} users - List of user objects
 * @property {Object} users[].profile - Basic user profile information
 * @property {string} users[].profile.id - User identifier
 * @property {string} users[].profile.email - User email address
 * @property {string} users[].profile.full_name - User display name
 * @property {Date} users[].profile.created_at - Account creation date
 * @property {Date} users[].profile.last_login - Last login timestamp
 * @property {Object} users[].subscription - Current subscription details
 * @property {string} users[].subscription.status - Subscription status
 * @property {string} users[].subscription.plan - Plan name
 * @property {Object} pagination - Pagination metadata
 * @property {number} pagination.total - Total number of users matching filters
 * @property {number} pagination.pages - Total number of pages
 * @property {number} pagination.current_page - Current page number
 *
 * @related User administration workflow. Enables administrators to view, search,
 * and manage user accounts across the platform for support and maintenance purposes.
 */
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.post("/users/:id/credits", grantCredits);
router.post("/users/:id/password-reset", sendPasswordReset);
router.post("/users/:id/impersonate", impersonateUser);
router.post("/users/:id/revoke-sessions", revokeUserSessions);
router.post("/broadcast", broadcastNotification);

// Subscription endpoints
router.get("/subscriptions", getSubscriptions);

// Payment endpoints
router.get("/payments", getPaymentHistory);

// Audit log endpoints
router.get("/audit-logs", getAuditLogs);

export default router;
