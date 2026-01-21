import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mockFn } from "../test-utils";

// Mock dependencies before imports
const mockSupabase = {
  from: mockFn(),
  auth: {
    resetPasswordForEmail: mockFn(),
  },
};

jest.mock("@/config", () => ({
  SUPABASE: mockSupabase,
}));

// Import after mocks
import {
  getAuditLogs,
  getDashboardStats,
  getPaymentHistory,
  getSubscriptionDistribution,
  getUserById,
  getUserList,
  grantCredits,
  logAdminAction,
  sendPasswordResetEmail,
  updateUserRole,
  updateUserStatus,
} from "@/domains/admin/services/admin-service";

describe("Admin Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDashboardStats", () => {
    it("should return dashboard statistics", async () => {
      const mockStats = {
        total_users: 1500,
        active_users: 1200,
        new_users_today: 25,
        new_users_week: 150,
        new_users_month: 500,
        active_subscriptions: 800,
        total_revenue_cents: 50_000_000,
        mrr_cents: 4_500_000,
      };

      mockSupabase.from.mockReturnValue({
        select: mockFn().mockReturnValue({
          single: mockFn().mockResolvedValue({ data: mockStats, error: null }),
        }),
      });

      const stats = await getDashboardStats();

      expect(stats).toEqual({
        totalUsers: 1500,
        activeUsers: 1200,
        newUsersToday: 25,
        newUsersWeek: 150,
        newUsersMonth: 500,
        activeSubscriptions: 800,
        totalRevenueCents: 50_000_000,
        mrrCents: 4_500_000,
      });
      expect(mockSupabase.from).toHaveBeenCalledWith("v_admin_dashboard_stats");
    });

    it("should handle null values with defaults", async () => {
      mockSupabase.from.mockReturnValue({
        select: mockFn().mockReturnValue({
          single: mockFn().mockResolvedValue({
            data: {
              total_users: null,
              active_users: null,
              new_users_today: null,
              new_users_week: null,
              new_users_month: null,
              active_subscriptions: null,
              total_revenue_cents: null,
              mrr_cents: null,
            },
            error: null,
          }),
        }),
      });

      const stats = await getDashboardStats();

      expect(stats.totalUsers).toBe(0);
      expect(stats.activeUsers).toBe(0);
      expect(stats.mrrCents).toBe(0);
    });

    it("should throw error when fetch fails", async () => {
      mockSupabase.from.mockReturnValue({
        select: mockFn().mockReturnValue({
          single: mockFn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      });

      await expect(getDashboardStats()).rejects.toThrow(
        "Failed to fetch dashboard stats"
      );
    });
  });

  describe("getSubscriptionDistribution", () => {
    it("should return subscription distribution data", async () => {
      const mockData = [
        {
          plan_slug: "starter",
          plan_name: "Starter",
          subscriber_count: 500,
          percentage: 50,
        },
        {
          plan_slug: "pro",
          plan_name: "Pro",
          subscriber_count: 300,
          percentage: 30,
        },
        {
          plan_slug: "executive",
          plan_name: "Executive",
          subscriber_count: 200,
          percentage: 20,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: mockFn().mockResolvedValue({ data: mockData, error: null }),
      });

      const distribution = await getSubscriptionDistribution();

      expect(distribution).toHaveLength(3);
      expect(distribution[0]).toEqual({
        planSlug: "starter",
        planName: "Starter",
        subscriberCount: 500,
        percentage: 50,
      });
      expect(mockSupabase.from).toHaveBeenCalledWith(
        "v_subscription_distribution"
      );
    });

    it("should handle null values with defaults", async () => {
      mockSupabase.from.mockReturnValue({
        select: mockFn().mockResolvedValue({
          data: [
            {
              plan_slug: null,
              plan_name: null,
              subscriber_count: null,
              percentage: null,
            },
          ],
          error: null,
        }),
      });

      const distribution = await getSubscriptionDistribution();

      expect(distribution[0]).toEqual({
        planSlug: "unknown",
        planName: "Unknown",
        subscriberCount: 0,
        percentage: 0,
      });
    });

    it("should return empty array when no data", async () => {
      mockSupabase.from.mockReturnValue({
        select: mockFn().mockResolvedValue({ data: null, error: null }),
      });

      const distribution = await getSubscriptionDistribution();
      expect(distribution).toEqual([]);
    });

    it("should throw error when fetch fails", async () => {
      mockSupabase.from.mockReturnValue({
        select: mockFn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      });

      await expect(getSubscriptionDistribution()).rejects.toThrow(
        "Failed to fetch subscription distribution"
      );
    });
  });

  describe("getUserList", () => {
    it("should return paginated user list", async () => {
      const mockUsers = [
        {
          id: "user-1",
          email: "user1@example.com",
          first_name: "John",
          last_name: "Doe",
          status: "active",
          role: "user",
          created_at: "2024-01-01",
          subscription_id: "sub-1",
          plan_name: "Pro",
          plan_slug: "pro",
          subscription_status: "active",
          subscription_interval: "monthly",
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: mockFn().mockReturnValue({
          or: mockFn().mockReturnValue({
            eq: mockFn().mockReturnValue({
              eq: mockFn().mockReturnValue({
                order: mockFn().mockReturnValue({
                  range: mockFn().mockResolvedValue({
                    data: mockUsers,
                    error: null,
                    count: 1,
                  }),
                }),
              }),
            }),
          }),
          eq: mockFn().mockReturnValue({
            eq: mockFn().mockReturnValue({
              order: mockFn().mockReturnValue({
                range: mockFn().mockResolvedValue({
                  data: mockUsers,
                  error: null,
                  count: 1,
                }),
              }),
            }),
          }),
          order: mockFn().mockReturnValue({
            range: mockFn().mockResolvedValue({
              data: mockUsers,
              error: null,
              count: 1,
            }),
          }),
        }),
      });

      const result = await getUserList({ page: 1, limit: 20 });

      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.users[0].email).toBe("user1@example.com");
      expect(result.users[0].subscription?.plan_name).toBe("Pro");
    });

    it("should apply search filter", async () => {
      const mockQuery = {
        or: mockFn().mockReturnThis(),
        eq: mockFn().mockReturnThis(),
        order: mockFn().mockReturnThis(),
        range: mockFn().mockResolvedValue({ data: [], error: null, count: 0 }),
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      await getUserList({ search: "test@example.com" });

      expect(mockQuery.or).toHaveBeenCalledWith(
        expect.stringContaining("test@example.com")
      );
    });

    it("should apply status and role filters", async () => {
      const mockQuery = {
        or: mockFn().mockReturnThis(),
        eq: mockFn().mockReturnThis(),
        order: mockFn().mockReturnThis(),
        range: mockFn().mockResolvedValue({ data: [], error: null, count: 0 }),
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      await getUserList({ status: "active", role: "admin" });

      expect(mockQuery.eq).toHaveBeenCalledWith("status", "active");
      expect(mockQuery.eq).toHaveBeenCalledWith("role", "admin");
    });

    it("should calculate totalPages correctly", async () => {
      mockSupabase.from.mockReturnValue({
        select: mockFn().mockReturnValue({
          order: mockFn().mockReturnValue({
            range: mockFn().mockResolvedValue({
              data: [],
              error: null,
              count: 95,
            }),
          }),
        }),
      });

      const result = await getUserList({ page: 1, limit: 20 });

      expect(result.totalPages).toBe(5); // ceil(95/20) = 5
    });

    it("should throw error when fetch fails", async () => {
      mockSupabase.from.mockReturnValue({
        select: mockFn().mockReturnValue({
          order: mockFn().mockReturnValue({
            range: mockFn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      await expect(getUserList({})).rejects.toThrow("Failed to fetch users");
    });
  });

  describe("getUserById", () => {
    it("should return user by ID", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        first_name: "John",
        status: "active",
        role: "user",
        subscription_id: "sub-123",
      };

      mockSupabase.from.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const user = await getUserById("user-123");

      expect(user?.id).toBe("user-123");
      expect(user?.email).toBe("test@example.com");
    });

    it("should return null when user not found (PGRST116)", async () => {
      mockSupabase.from.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116", message: "Not found" },
            }),
          }),
        }),
      });

      const user = await getUserById("nonexistent");
      expect(user).toBeNull();
    });

    it("should return null when data is null", async () => {
      mockSupabase.from.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      const user = await getUserById("user-123");
      expect(user).toBeNull();
    });

    it("should throw error for other database errors", async () => {
      mockSupabase.from.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: null,
              error: { code: "OTHER", message: "Database error" },
            }),
          }),
        }),
      });

      await expect(getUserById("user-123")).rejects.toThrow(
        "Failed to fetch user"
      );
    });
  });

  describe("updateUserStatus", () => {
    it("should update user status and log action", async () => {
      // Mock fetching current user
      mockSupabase.from.mockReturnValueOnce({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { status: "active", email: "test@example.com" },
              error: null,
            }),
          }),
        }),
      });

      // Mock update
      mockSupabase.from.mockReturnValueOnce({
        update: mockFn().mockReturnValue({
          eq: mockFn().mockResolvedValue({ error: null }),
        }),
      });

      // Mock audit log
      mockSupabase.from.mockReturnValueOnce({
        insert: mockFn().mockResolvedValue({ error: null }),
      });

      await updateUserStatus(
        "user-123",
        "suspended",
        "admin-123",
        "Violation of terms"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("users");
      expect(mockSupabase.from).toHaveBeenCalledWith("audit_logs");
    });

    it("should throw error when update fails", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { status: "active" },
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        update: mockFn().mockReturnValue({
          eq: mockFn().mockResolvedValue({
            error: { message: "Update failed" },
          }),
        }),
      });

      await expect(
        updateUserStatus("user-123", "suspended", "admin-123")
      ).rejects.toThrow("Failed to update user status");
    });
  });

  describe("updateUserRole", () => {
    it("should update user role and log action", async () => {
      // Mock fetching current user
      mockSupabase.from.mockReturnValueOnce({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { role: "user", email: "test@example.com" },
              error: null,
            }),
          }),
        }),
      });

      // Mock update
      mockSupabase.from.mockReturnValueOnce({
        update: mockFn().mockReturnValue({
          eq: mockFn().mockResolvedValue({ error: null }),
        }),
      });

      // Mock audit log
      mockSupabase.from.mockReturnValueOnce({
        insert: mockFn().mockResolvedValue({ error: null }),
      });

      await updateUserRole("user-123", "admin", "admin-456");

      expect(mockSupabase.from).toHaveBeenCalledWith("users");
    });

    it("should prevent self-modification", async () => {
      await expect(
        updateUserRole("admin-123", "user", "admin-123")
      ).rejects.toThrow("Cannot modify your own role");
    });

    it("should throw error when update fails", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { role: "user" },
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        update: mockFn().mockReturnValue({
          eq: mockFn().mockResolvedValue({
            error: { message: "Update failed" },
          }),
        }),
      });

      await expect(
        updateUserRole("user-123", "admin", "admin-456")
      ).rejects.toThrow("Failed to update user role");
    });
  });

  describe("grantCredits", () => {
    it("should grant credits to user with active subscription", async () => {
      // Mock fetching subscription
      mockSupabase.from.mockReturnValueOnce({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            in: mockFn().mockReturnValue({
              single: mockFn().mockResolvedValue({
                data: { id: "sub-123", credits_remaining: 100 },
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock update credits
      mockSupabase.from.mockReturnValueOnce({
        update: mockFn().mockReturnValue({
          eq: mockFn().mockResolvedValue({ error: null }),
        }),
      });

      // Mock audit log
      mockSupabase.from.mockReturnValueOnce({
        insert: mockFn().mockResolvedValue({ error: null }),
      });

      await grantCredits(
        "user-123",
        500,
        "admin-123",
        "Customer service gesture"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("subscriptions");
      expect(mockSupabase.from).toHaveBeenCalledWith("audit_logs");
    });

    it("should throw error when user has no active subscription", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            in: mockFn().mockReturnValue({
              single: mockFn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      });

      await expect(
        grantCredits("user-123", 500, "admin-123", "test")
      ).rejects.toThrow("User has no active subscription");
    });

    it("should throw error when credit update fails", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            in: mockFn().mockReturnValue({
              single: mockFn().mockResolvedValue({
                data: { id: "sub-123", credits_remaining: 100 },
                error: null,
              }),
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        update: mockFn().mockReturnValue({
          eq: mockFn().mockResolvedValue({
            error: { message: "Update failed" },
          }),
        }),
      });

      await expect(
        grantCredits("user-123", 500, "admin-123", "test")
      ).rejects.toThrow("Failed to grant credits");
    });
  });

  describe("getPaymentHistory", () => {
    it("should return payment history with user info", async () => {
      const mockPayments = [
        {
          id: "pay-1",
          user_id: "user-1",
          amount_cents: 1999,
          currency: "USD",
          status: "succeeded",
          description: "Pro subscription",
          created_at: "2024-01-15",
          users: {
            email: "test@example.com",
            first_name: "John",
            last_name: "Doe",
          },
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            eq: mockFn().mockReturnValue({
              order: mockFn().mockReturnValue({
                range: mockFn().mockResolvedValue({
                  data: mockPayments,
                  error: null,
                  count: 1,
                }),
              }),
            }),
          }),
          order: mockFn().mockReturnValue({
            range: mockFn().mockResolvedValue({
              data: mockPayments,
              error: null,
              count: 1,
            }),
          }),
        }),
      });

      const result = await getPaymentHistory({});

      expect(result.payments).toHaveLength(1);
      expect(result.payments[0].user_email).toBe("test@example.com");
      expect(result.payments[0].user_name).toBe("John Doe");
    });

    it("should apply userId filter", async () => {
      const mockQuery = {
        eq: mockFn().mockReturnThis(),
        order: mockFn().mockReturnThis(),
        range: mockFn().mockResolvedValue({ data: [], error: null, count: 0 }),
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      await getPaymentHistory({ userId: "user-123" });

      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-123");
    });

    it("should throw error when fetch fails", async () => {
      mockSupabase.from.mockReturnValue({
        select: mockFn().mockReturnValue({
          order: mockFn().mockReturnValue({
            range: mockFn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      await expect(getPaymentHistory({})).rejects.toThrow(
        "Failed to fetch payment history"
      );
    });
  });

  describe("getAuditLogs", () => {
    it("should return audit logs with admin emails", async () => {
      const mockLogs = [
        {
          id: "log-1",
          action: "user_status_change",
          admin_user_id: "admin-1",
          resource_type: "user",
          resource_id: "user-123",
          old_values: { status: "active" },
          new_values: { status: "suspended" },
          ip_address: "127.0.0.1",
          user_agent: "Mozilla/5.0",
          created_at: "2024-01-15",
        },
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockFn().mockReturnValue({
            not: mockFn().mockReturnValue({
              eq: mockFn().mockReturnValue({
                eq: mockFn().mockReturnValue({
                  order: mockFn().mockReturnValue({
                    range: mockFn().mockResolvedValue({
                      data: mockLogs,
                      error: null,
                      count: 1,
                    }),
                  }),
                }),
              }),
              order: mockFn().mockReturnValue({
                range: mockFn().mockResolvedValue({
                  data: mockLogs,
                  error: null,
                  count: 1,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: mockFn().mockReturnValue({
            in: mockFn().mockResolvedValue({
              data: [{ id: "admin-1", email: "admin@example.com" }],
              error: null,
            }),
          }),
        });

      const result = await getAuditLogs({});

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].admin_email).toBe("admin@example.com");
      expect(result.logs[0].action).toBe("user_status_change");
    });

    it("should apply adminUserId filter", async () => {
      const mockQuery = {
        not: mockFn().mockReturnThis(),
        eq: mockFn().mockReturnThis(),
        order: mockFn().mockReturnThis(),
        range: mockFn().mockResolvedValue({ data: [], error: null, count: 0 }),
      };

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      mockSupabase.from.mockReturnValueOnce({
        select: mockFn().mockReturnValue({
          in: mockFn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      await getAuditLogs({ adminUserId: "admin-123" });

      expect(mockQuery.eq).toHaveBeenCalledWith("admin_user_id", "admin-123");
    });

    it("should throw error when fetch fails", async () => {
      mockSupabase.from.mockReturnValue({
        select: mockFn().mockReturnValue({
          not: mockFn().mockReturnValue({
            order: mockFn().mockReturnValue({
              range: mockFn().mockResolvedValue({
                data: null,
                error: { message: "Database error" },
              }),
            }),
          }),
        }),
      });

      await expect(getAuditLogs({})).rejects.toThrow(
        "Failed to fetch audit logs"
      );
    });
  });

  describe("logAdminAction", () => {
    it("should log admin action successfully", async () => {
      mockSupabase.from.mockReturnValue({
        insert: mockFn().mockResolvedValue({ error: null }),
      });

      await logAdminAction({
        adminUserId: "admin-123",
        action: "user_status_change",
        resourceType: "user",
        resourceId: "user-456",
        oldValues: { status: "active" },
        newValues: { status: "suspended" },
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("audit_logs");
    });

    it("should handle logging errors gracefully without throwing", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockSupabase.from.mockReturnValue({
        insert: mockFn().mockResolvedValue({
          error: { message: "Insert failed" },
        }),
      });

      // Should not throw
      await logAdminAction({
        adminUserId: "admin-123",
        action: "test_action",
        resourceType: "user",
        resourceId: "user-456",
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("should send password reset email and log action", async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      // Mock audit log
      mockSupabase.from.mockReturnValue({
        insert: mockFn().mockResolvedValue({ error: null }),
      });

      await sendPasswordResetEmail("user@example.com", "admin-123");

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "user@example.com",
        expect.objectContaining({ redirectTo: expect.any(String) })
      );
      expect(mockSupabase.from).toHaveBeenCalledWith("audit_logs");
    });

    it("should throw error when reset fails", async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: "Email not found" },
      });

      await expect(
        sendPasswordResetEmail("invalid@example.com", "admin-123")
      ).rejects.toThrow("Failed to send password reset");
    });
  });
});
