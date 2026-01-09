import { describe, expect, it, beforeEach, mock } from "bun:test";

// Mock apiClient
const mockGet = mock(() => Promise.resolve({ data: {} }));
const mockPost = mock(() => Promise.resolve({ data: {} }));
const mockPatch = mock(() => Promise.resolve({ data: {} }));

mock.module("@/lib/api/client", () => ({
  apiClient: {
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
  },
}));

mock.module("@/lib/api/endpoints", () => ({
  ENDPOINTS: {
    ADMIN_DASHBOARD_STATS: "/api/admin/dashboard/stats",
    ADMIN_DASHBOARD_DISTRIBUTION: "/api/admin/dashboard/distribution",
    ADMIN_USERS: "/api/admin/users",
    ADMIN_USER_BY_ID: (id: string) => `/api/admin/users/${id}`,
    ADMIN_USER_STATUS: (id: string) => `/api/admin/users/${id}/status`,
    ADMIN_USER_ROLE: (id: string) => `/api/admin/users/${id}/role`,
    ADMIN_USER_CREDITS: (id: string) => `/api/admin/users/${id}/credits`,
    ADMIN_USER_PASSWORD_RESET: (id: string) => `/api/admin/users/${id}/password-reset`,
    ADMIN_SUBSCRIPTIONS: "/api/admin/subscriptions",
    ADMIN_PAYMENTS: "/api/admin/payments",
    ADMIN_AUDIT_LOGS: "/api/admin/audit-logs",
  },
}));

// Import after mocks
import {
  getDashboardStats,
  getSubscriptionDistribution,
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  grantCredits,
  sendPasswordReset,
  getSubscriptions,
  getPayments,
  getAuditLogs,
  formatCurrency,
  formatNumber,
} from "@/services/admin.service";

describe("admin.service", () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockPost.mockClear();
    mockPatch.mockClear();
  });

  describe("getDashboardStats", () => {
    it("should fetch dashboard stats", async () => {
      const mockStats = {
        totalUsers: 1000,
        activeUsers: 500,
        totalRevenue: 50000,
        newUsersToday: 25,
      };
      mockGet.mockResolvedValue({
        data: { status: "success", data: mockStats },
      });

      const result = await getDashboardStats();

      expect(mockGet).toHaveBeenCalledWith("/api/admin/dashboard/stats");
      expect(result).toEqual(mockStats);
    });
  });

  describe("getSubscriptionDistribution", () => {
    it("should fetch subscription distribution", async () => {
      const mockDistribution = [
        { plan: "free", count: 500 },
        { plan: "pro", count: 300 },
        { plan: "enterprise", count: 100 },
      ];
      mockGet.mockResolvedValue({
        data: { status: "success", data: mockDistribution },
      });

      const result = await getSubscriptionDistribution();

      expect(mockGet).toHaveBeenCalledWith("/api/admin/dashboard/distribution");
      expect(result).toEqual(mockDistribution);
    });

    it("should return empty array when no data", async () => {
      mockGet.mockResolvedValue({
        data: { status: "success", data: undefined },
      });

      const result = await getSubscriptionDistribution();

      expect(result).toEqual([]);
    });
  });

  describe("getUsers", () => {
    it("should fetch users list with params", async () => {
      const mockResponse = {
        users: [
          { id: "user-1", email: "user1@example.com" },
          { id: "user-2", email: "user2@example.com" },
        ],
        total: 100,
        page: 1,
        limit: 20,
      };
      mockGet.mockResolvedValue({
        data: { status: "success", data: mockResponse },
      });

      const params = { page: 1, limit: 20, search: "test" };
      const result = await getUsers(params);

      expect(mockGet).toHaveBeenCalledWith("/api/admin/users", { params });
      expect(result.users).toHaveLength(2);
    });
  });

  describe("getUserById", () => {
    it("should fetch single user by ID", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        status: "active",
        role: "user",
      };
      mockGet.mockResolvedValue({
        data: { status: "success", data: mockUser },
      });

      const result = await getUserById("user-123");

      expect(mockGet).toHaveBeenCalledWith("/api/admin/users/user-123");
      expect(result).toEqual(mockUser);
    });
  });

  describe("updateUserStatus", () => {
    it("should update user status", async () => {
      mockPatch.mockResolvedValue({ data: { status: "success" } });

      await updateUserStatus("user-123", "suspended", "Violation of terms");

      expect(mockPatch).toHaveBeenCalledWith("/api/admin/users/user-123/status", {
        status: "suspended",
        reason: "Violation of terms",
      });
    });

    it("should update status without reason", async () => {
      mockPatch.mockResolvedValue({ data: { status: "success" } });

      await updateUserStatus("user-123", "active");

      expect(mockPatch).toHaveBeenCalledWith("/api/admin/users/user-123/status", {
        status: "active",
        reason: undefined,
      });
    });
  });

  describe("updateUserRole", () => {
    it("should update user role", async () => {
      mockPatch.mockResolvedValue({ data: { status: "success" } });

      await updateUserRole("user-123", "admin", "Promoted to admin");

      expect(mockPatch).toHaveBeenCalledWith("/api/admin/users/user-123/role", {
        role: "admin",
        reason: "Promoted to admin",
      });
    });
  });

  describe("grantCredits", () => {
    it("should grant credits to user", async () => {
      mockPost.mockResolvedValue({ data: { status: "success" } });

      await grantCredits("user-123", 100, "Bonus credits");

      expect(mockPost).toHaveBeenCalledWith("/api/admin/users/user-123/credits", {
        credits: 100,
        reason: "Bonus credits",
      });
    });
  });

  describe("sendPasswordReset", () => {
    it("should send password reset email", async () => {
      mockPost.mockResolvedValue({ data: { status: "success" } });

      await sendPasswordReset("user-123");

      expect(mockPost).toHaveBeenCalledWith("/api/admin/users/user-123/password-reset");
    });
  });

  describe("getSubscriptions", () => {
    it("should fetch subscriptions with params", async () => {
      const mockResponse = {
        subscriptions: [{ id: "sub-1", status: "active" }],
        total: 50,
      };
      mockGet.mockResolvedValue({
        data: { status: "success", data: mockResponse },
      });

      const params = { page: 1, limit: 20, status: "active" };
      const result = await getSubscriptions(params);

      expect(mockGet).toHaveBeenCalledWith("/api/admin/subscriptions", { params });
      expect(result.subscriptions).toHaveLength(1);
    });
  });

  describe("getPayments", () => {
    it("should fetch payments with params", async () => {
      const mockResponse = {
        payments: [{ id: "pay-1", amount: 1000 }],
        total: 100,
      };
      mockGet.mockResolvedValue({
        data: { status: "success", data: mockResponse },
      });

      const params = { page: 1, limit: 20 };
      const result = await getPayments(params);

      expect(mockGet).toHaveBeenCalledWith("/api/admin/payments", { params });
      expect(result.payments).toHaveLength(1);
    });
  });

  describe("getAuditLogs", () => {
    it("should fetch audit logs with params", async () => {
      const mockResponse = {
        logs: [{ id: "log-1", action: "user.update" }],
        total: 500,
      };
      mockGet.mockResolvedValue({
        data: { status: "success", data: mockResponse },
      });

      const params = { page: 1, limit: 50, action: "user.update" };
      const result = await getAuditLogs(params);

      expect(mockGet).toHaveBeenCalledWith("/api/admin/audit-logs", { params });
      expect(result.logs).toHaveLength(1);
    });
  });

  describe("formatCurrency", () => {
    it("should format cents to USD dollars", () => {
      expect(formatCurrency(1000)).toBe("$10.00");
      expect(formatCurrency(999)).toBe("$9.99");
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("should format with different currencies", () => {
      const result = formatCurrency(1000, "EUR");
      expect(result).toContain("10.00");
    });

    it("should handle large amounts", () => {
      expect(formatCurrency(100000)).toBe("$1,000.00");
    });
  });

  describe("formatNumber", () => {
    it("should format numbers with locale", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1000000)).toBe("1,000,000");
      expect(formatNumber(0)).toBe("0");
    });
  });
});
