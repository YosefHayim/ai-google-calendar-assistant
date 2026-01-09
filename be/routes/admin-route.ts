import express from "express";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import { adminAuth } from "@/middlewares/admin-auth";
import {
  getDashboardStats,
  getSubscriptionDistribution,
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  grantCredits,
  sendPasswordReset,
  getPaymentHistory,
  getSubscriptions,
  getAuditLogs,
} from "@/controllers/admin-controller";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(supabaseAuth());
router.use(adminAuth(["admin"]));

// Dashboard endpoints
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/distribution", getSubscriptionDistribution);

// User management endpoints
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.post("/users/:id/credits", grantCredits);
router.post("/users/:id/password-reset", sendPasswordReset);

// Subscription endpoints
router.get("/subscriptions", getSubscriptions);

// Payment endpoints
router.get("/payments", getPaymentHistory);

// Audit log endpoints
router.get("/audit-logs", getAuditLogs);

export default router;
