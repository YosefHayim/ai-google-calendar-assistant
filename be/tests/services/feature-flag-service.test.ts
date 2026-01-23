import { beforeEach, describe, expect, it, jest } from "@jest/globals"

const ROLLOUT_HALF = 50
const ROLLOUT_TEN_PERCENT = 10
const TEST_USER_COUNT = 100
const USER_ID_PAD_LENGTH = 3
const ROLLOUT_VARIANCE_UPPER = 30
const TEST_SAMPLE_COUNT = 5

jest.mock("@/config", () => ({
  SUPABASE: {
    from: jest.fn(),
  },
}))

jest.mock("@/infrastructure/redis/redis", () => ({
  isRedisConnected: jest.fn(),
  redisClient: {
    get: jest.fn(),
    setex: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
  },
}))

jest.mock("@/lib/logger", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}))

import { SUPABASE } from "@/config"
import {
  isRedisConnected,
  redisClient,
} from "@/infrastructure/redis/redis"
import type { FeatureFlag } from "@/domains/settings/services/feature-flag-service"

// Import after mocks
const mockSupabase = SUPABASE as jest.Mocked<typeof SUPABASE>
const mockRedisConnected = isRedisConnected as jest.MockedFunction<
  typeof isRedisConnected
>
const mockRedisClient = redisClient as jest.Mocked<typeof redisClient>

// Test data factory
const createTestFlag = (overrides: Partial<FeatureFlag> = {}): FeatureFlag => ({
  id: "flag-123",
  key: "test_feature",
  name: "Test Feature",
  description: "A test feature flag",
  enabled: true,
  rolloutPercentage: 100,
  allowedTiers: [],
  allowedUserIds: [],
  metadata: {},
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
})

const createDbFlag = (flag: FeatureFlag) => ({
  id: flag.id,
  key: flag.key,
  name: flag.name,
  description: flag.description,
  enabled: flag.enabled,
  rollout_percentage: flag.rolloutPercentage,
  allowed_tiers: flag.allowedTiers,
  allowed_user_ids: flag.allowedUserIds,
  metadata: flag.metadata,
  created_at: flag.createdAt,
  updated_at: flag.updatedAt,
})

describe("Feature Flag Service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    mockRedisConnected.mockReturnValue(false)
  })

  describe("getAllFeatureFlags", () => {
    it("should fetch all feature flags from database when cache is empty", async () => {
      const testFlags = [
        createTestFlag({ key: "feature_a" }),
        createTestFlag({ key: "feature_b", id: "flag-456" }),
      ]

      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: testFlags.map(createDbFlag),
          error: null,
        }),
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const { getAllFeatureFlags } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await getAllFeatureFlags()

      expect(result).toHaveLength(2)
      expect(result[0].key).toBe("feature_a")
      expect(result[1].key).toBe("feature_b")
    })

    it("should return cached flags when Redis is available", async () => {
      const cachedFlags = [createTestFlag({ key: "cached_feature" })]
      mockRedisConnected.mockReturnValue(true)
      ;(mockRedisClient.get as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedFlags)
      )

      const { getAllFeatureFlags } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await getAllFeatureFlags()

      expect(result).toHaveLength(1)
      expect(result[0].key).toBe("cached_feature")
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it("should return empty array on database error", async () => {
      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: new Error("Database error"),
          }),
        }),
      })

      const { getAllFeatureFlags } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await getAllFeatureFlags()

      expect(result).toEqual([])
    })
  })

  describe("getFeatureFlagByKey", () => {
    it("should return flag when key exists", async () => {
      const testFlag = createTestFlag({ key: "my_feature" })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [createDbFlag(testFlag)],
            error: null,
          }),
        }),
      })

      const { getFeatureFlagByKey } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await getFeatureFlagByKey("my_feature")

      expect(result).not.toBeNull()
      expect(result?.key).toBe("my_feature")
    })

    it("should return null when key does not exist", async () => {
      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      })

      const { getFeatureFlagByKey } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await getFeatureFlagByKey("nonexistent")

      expect(result).toBeNull()
    })
  })

  describe("createFeatureFlag", () => {
    it("should create a new feature flag with default values", async () => {
      const newFlag = createTestFlag({ key: "new_feature", enabled: false })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: createDbFlag(newFlag),
              error: null,
            }),
          }),
        }),
      })

      const { createFeatureFlag } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await createFeatureFlag({
        key: "new_feature",
        name: "New Feature",
      })

      expect(result).not.toBeNull()
      expect(result?.key).toBe("new_feature")
    })

    it("should invalidate cache after creating flag", async () => {
      mockRedisConnected.mockReturnValue(true)
      ;(mockRedisClient.keys as jest.Mock).mockResolvedValue(["ff:all"])

      const newFlag = createTestFlag()
      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: createDbFlag(newFlag),
              error: null,
            }),
          }),
        }),
      })

      const { createFeatureFlag } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      await createFeatureFlag({
        key: "test",
        name: "Test",
      })

      expect(mockRedisClient.keys).toHaveBeenCalled()
    })
  })

  describe("updateFeatureFlag", () => {
    it("should update existing feature flag", async () => {
      const updatedFlag = createTestFlag({ name: "Updated Name" })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: createDbFlag(updatedFlag),
                error: null,
              }),
            }),
          }),
        }),
      })

      const { updateFeatureFlag } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await updateFeatureFlag("flag-123", {
        name: "Updated Name",
      })

      expect(result).not.toBeNull()
      expect(result?.name).toBe("Updated Name")
    })

    it("should return null on update error", async () => {
      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: new Error("Update failed"),
              }),
            }),
          }),
        }),
      })

      const { updateFeatureFlag } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await updateFeatureFlag("flag-123", {
        name: "Updated Name",
      })

      expect(result).toBeNull()
    })
  })

  describe("deleteFeatureFlag", () => {
    it("should delete feature flag and return true", async () => {
      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      })

      const { deleteFeatureFlag } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await deleteFeatureFlag("flag-123")

      expect(result).toBe(true)
    })

    it("should return false on delete error", async () => {
      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: new Error("Delete failed"),
          }),
        }),
      })

      const { deleteFeatureFlag } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await deleteFeatureFlag("flag-123")

      expect(result).toBe(false)
    })
  })

  describe("isFeatureEnabled", () => {
    const setupFlagMock = (flag: FeatureFlag | null) => {
      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: flag ? [createDbFlag(flag)] : [],
            error: null,
          }),
        }),
      })
    }

    it("should return false when flag does not exist", async () => {
      setupFlagMock(null)

      const { isFeatureEnabled } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await isFeatureEnabled("nonexistent")

      expect(result).toBe(false)
    })

    it("should return false when flag is disabled", async () => {
      setupFlagMock(createTestFlag({ enabled: false }))

      const { isFeatureEnabled } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await isFeatureEnabled("test_feature")

      expect(result).toBe(false)
    })

    it("should return true when flag is enabled with 100% rollout", async () => {
      setupFlagMock(createTestFlag({ enabled: true, rolloutPercentage: 100 }))

      const { isFeatureEnabled } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await isFeatureEnabled("test_feature")

      expect(result).toBe(true)
    })

    it("should return true when user is in allowlist", async () => {
      setupFlagMock(
        createTestFlag({
          enabled: true,
          rolloutPercentage: 0,
          allowedUserIds: ["user-123"],
        })
      )

      const { isFeatureEnabled } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await isFeatureEnabled("test_feature", {
        userId: "user-123",
      })

      expect(result).toBe(true)
    })

    it("should return false when user tier is not allowed", async () => {
      setupFlagMock(
        createTestFlag({
          enabled: true,
          allowedTiers: ["pro", "enterprise"],
        })
      )

      const { isFeatureEnabled } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await isFeatureEnabled("test_feature", {
        userTier: "free",
      })

      expect(result).toBe(false)
    })

    it("should return true when user tier is allowed", async () => {
      setupFlagMock(
        createTestFlag({
          enabled: true,
          allowedTiers: ["pro", "enterprise"],
        })
      )

      const { isFeatureEnabled } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await isFeatureEnabled("test_feature", {
        userTier: "pro",
      })

      expect(result).toBe(true)
    })

    it("should respect rollout percentage based on user hash", async () => {
      setupFlagMock(
        createTestFlag({
          enabled: true,
          rolloutPercentage: ROLLOUT_HALF,
        })
      )

      const { isFeatureEnabled } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      // Test multiple users - at least one should be included, one excluded
      const results = await Promise.all([
        isFeatureEnabled("test_feature", { userId: "user-aaa" }),
        isFeatureEnabled("test_feature", { userId: "user-bbb" }),
        isFeatureEnabled("test_feature", { userId: "user-ccc" }),
        isFeatureEnabled("test_feature", { userId: "user-ddd" }),
        isFeatureEnabled("test_feature", { userId: "user-eee" }),
      ])

      const trueCount = results.filter((r) => r === true).length
      expect(trueCount).toBeGreaterThan(0)
      expect(trueCount).toBeLessThan(TEST_SAMPLE_COUNT)
    })
  })

  describe("getEnabledFlagsForUser", () => {
    it("should return all flags with their enabled status for user", async () => {
      const flags = [
        createTestFlag({ key: "feature_a", enabled: true }),
        createTestFlag({
          key: "feature_b",
          id: "flag-2",
          enabled: true,
          allowedTiers: ["pro"],
        }),
        createTestFlag({ key: "feature_c", id: "flag-3", enabled: false }),
      ]

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: flags.map(createDbFlag),
            error: null,
          }),
        }),
      })

      const { getEnabledFlagsForUser } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await getEnabledFlagsForUser({
        userId: "user-123",
        userTier: "free",
      })

      expect(result.feature_a).toBe(true)
      expect(result.feature_b).toBe(false) // User is "free", flag requires "pro"
      expect(result.feature_c).toBe(false) // Disabled
    })
  })

  describe("toggleFeatureFlag", () => {
    it("should toggle flag enabled status", async () => {
      const toggledFlag = createTestFlag({ enabled: false })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: createDbFlag(toggledFlag),
                error: null,
              }),
            }),
          }),
        }),
      })

      const { toggleFeatureFlag } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const result = await toggleFeatureFlag("flag-123", false)

      expect(result).not.toBeNull()
      expect(result?.enabled).toBe(false)
    })
  })
})

describe("Feature Flag Business Scenarios", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    ;(isRedisConnected as jest.Mock).mockReturnValue(false)
  })

  describe("Gradual Rollout Scenario", () => {
    it("should enable feature for subset of users during gradual rollout", async () => {
      const rolloutFlag = createTestFlag({
        key: "new_ui",
        enabled: true,
        rolloutPercentage: ROLLOUT_TEN_PERCENT,
      })

      ;(SUPABASE.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [createDbFlag(rolloutFlag)],
            error: null,
          }),
        }),
      })

      const { isFeatureEnabled } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      const userResults: boolean[] = []
      for (let i = 0; i < TEST_USER_COUNT; i++) {
        const enabled = await isFeatureEnabled("new_ui", {
          userId: `user-${i.toString().padStart(USER_ID_PAD_LENGTH, "0")}`,
        })
        userResults.push(enabled)
      }

      const enabledCount = userResults.filter(Boolean).length
      expect(enabledCount).toBeGreaterThan(0)
      expect(enabledCount).toBeLessThan(ROLLOUT_VARIANCE_UPPER)
    })
  })

  describe("Beta Feature Access Scenario", () => {
    it("should allow beta testers access regardless of rollout", async () => {
      const betaFlag = createTestFlag({
        key: "beta_feature",
        enabled: true,
        rolloutPercentage: 0, // Disabled for general users
        allowedUserIds: ["beta-tester-1", "beta-tester-2"],
      })

      ;(SUPABASE.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [createDbFlag(betaFlag)],
            error: null,
          }),
        }),
      })

      const { isFeatureEnabled } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      // Beta tester should have access
      const betaResult = await isFeatureEnabled("beta_feature", {
        userId: "beta-tester-1",
      })
      expect(betaResult).toBe(true)

      // Regular user should not have access
      const regularResult = await isFeatureEnabled("beta_feature", {
        userId: "regular-user",
      })
      expect(regularResult).toBe(false)
    })
  })

  describe("Premium Feature Gating Scenario", () => {
    it("should restrict features to premium tiers only", async () => {
      const premiumFlag = createTestFlag({
        key: "advanced_analytics",
        enabled: true,
        allowedTiers: ["pro", "enterprise"],
      })

      ;(SUPABASE.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [createDbFlag(premiumFlag)],
            error: null,
          }),
        }),
      })

      const { isFeatureEnabled } = await import(
        "@/domains/settings/services/feature-flag-service"
      )

      // Free user - no access
      expect(
        await isFeatureEnabled("advanced_analytics", { userTier: "free" })
      ).toBe(false)

      // Pro user - has access
      expect(
        await isFeatureEnabled("advanced_analytics", { userTier: "pro" })
      ).toBe(true)

      // Enterprise user - has access
      expect(
        await isFeatureEnabled("advanced_analytics", { userTier: "enterprise" })
      ).toBe(true)
    })
  })

  describe("Feature Flag Lifecycle Scenario", () => {
    it("should support complete feature flag lifecycle", async () => {
      const mockFrom = SUPABASE.from as jest.Mock

      // 1. Create new flag (disabled by default)
      const createdFlag = createTestFlag({
        key: "new_feature",
        enabled: false,
        rolloutPercentage: 0,
      })

      mockFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: createDbFlag(createdFlag),
              error: null,
            }),
          }),
        }),
      })

      const { createFeatureFlag, toggleFeatureFlag, updateFeatureFlag } =
        await import("@/domains/settings/services/feature-flag-service")

      const created = await createFeatureFlag({
        key: "new_feature",
        name: "New Feature",
      })
      expect(created?.enabled).toBe(false)

      // 2. Enable for internal testing
      const enabledFlag = { ...createdFlag, enabled: true }
      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: createDbFlag(enabledFlag),
                error: null,
              }),
            }),
          }),
        }),
      })

      const enabled = await toggleFeatureFlag(createdFlag.id, true)
      expect(enabled?.enabled).toBe(true)

      const partialRollout = { ...enabledFlag, rollout_percentage: ROLLOUT_HALF }
      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: partialRollout,
                error: null,
              }),
            }),
          }),
        }),
      })

      const gradual = await updateFeatureFlag(createdFlag.id, {
        rolloutPercentage: ROLLOUT_HALF,
      })
      expect(gradual?.rolloutPercentage).toBe(ROLLOUT_HALF)
    })
  })
})
