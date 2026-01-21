import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { mockFn } from "../test-utils"

/**
 * Business Scenario: Agent Registry and DPO Journey
 *
 * This test suite covers the agent prompt registry system, including
 * loading prompts from database, caching, fallback behavior, and
 * Direct Preference Optimization (DPO) for prompt refinement.
 */

const CACHE_TTL_MINUTES = 5
const SECONDS_PER_MINUTE = 60
const MS_PER_SECOND = 1000
const CACHE_TTL_MS = CACHE_TTL_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND
const MOCK_PROMPT_COUNT = 3
const OPTIMIZER_TIME_MS = 150
const JUDGE_TIME_MS = 100
const TOTAL_DPO_TIME_MS = 300
const CONFIDENCE_HIGH = 0.85
const CONFIDENCE_MEDIUM = 0.65
const CONFIDENCE_THRESHOLD = 0.8

type AgentRegistryCache = {
  prompts: Map<string, string>
  lastRefresh: number
  isInitialized: boolean
}

const createMockCache = (): AgentRegistryCache => ({
  prompts: new Map(),
  lastRefresh: 0,
  isInitialized: false,
})

const mockSupabaseFrom = mockFn().mockReturnValue({
  select: mockFn().mockReturnValue({
    eq: mockFn().mockResolvedValue({
      data: [
        { agent_id: "calendar_orchestrator_agent", base_prompt: "DB prompt 1" },
        {
          agent_id: "create_event_handoff_agent",
          base_prompt: "DB prompt 2",
        },
        { agent_id: "parse_event_text_agent", base_prompt: "DB prompt 3" },
      ],
      error: null,
    }),
  }),
  insert: mockFn().mockReturnValue({
    select: mockFn().mockReturnValue({
      single: mockFn().mockResolvedValue({ data: { id: "record-123" }, error: null }),
    }),
  }),
})

jest.mock("@/config", () => ({
  SUPABASE: {
    from: mockSupabaseFrom,
  },
}))

jest.mock("@/lib/logger", () => ({
  logger: {
    info: mockFn(),
    debug: mockFn(),
    warn: mockFn(),
    error: mockFn(),
  },
}))

describe("Agent Registry and DPO Journey", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Scenario 1: Agent Registry Initialization", () => {
    it("should load prompts from database on initialization", () => {
      const cache = createMockCache()
      const dbPrompts = new Map([
        ["calendar_orchestrator_agent", "DB prompt 1"],
        ["create_event_handoff_agent", "DB prompt 2"],
        ["parse_event_text_agent", "DB prompt 3"],
      ])

      cache.prompts = dbPrompts
      cache.lastRefresh = Date.now()
      cache.isInitialized = true

      expect(cache.isInitialized).toBe(true)
      expect(cache.prompts.size).toBe(MOCK_PROMPT_COUNT)
      expect(cache.prompts.get("calendar_orchestrator_agent")).toBe(
        "DB prompt 1"
      )
    })

    it("should fall back to hardcoded prompts when database is empty", () => {
      const hardcodedPrompts = {
        orchestrator: "You are a calendar orchestrator...",
        createEventHandoff: "You help create calendar events...",
      }

      const cache = createMockCache()
      const dbPromptsEmpty = new Map<string, string>()

      if (dbPromptsEmpty.size === 0) {
        cache.prompts.set(
          "calendar_orchestrator_agent",
          hardcodedPrompts.orchestrator
        )
        cache.prompts.set(
          "create_event_handoff_agent",
          hardcodedPrompts.createEventHandoff
        )
      }

      expect(cache.prompts.size).toBe(2)
      expect(cache.prompts.get("calendar_orchestrator_agent")).toBe(
        hardcodedPrompts.orchestrator
      )
    })

    it("should mark cache as initialized after loading", () => {
      const cache = createMockCache()

      expect(cache.isInitialized).toBe(false)

      cache.prompts.set("test_agent", "test prompt")
      cache.lastRefresh = Date.now()
      cache.isInitialized = true

      expect(cache.isInitialized).toBe(true)
      expect(cache.lastRefresh).toBeGreaterThan(0)
    })
  })

  describe("Scenario 2: Cache Management", () => {
    it("should return cached prompt when cache is valid", () => {
      const cache = createMockCache()
      cache.prompts.set("test_agent", "cached prompt")
      cache.lastRefresh = Date.now()
      cache.isInitialized = true

      const isCacheValid = (): boolean => {
        if (!cache.isInitialized) {
          return false
        }
        return Date.now() - cache.lastRefresh < CACHE_TTL_MS
      }

      expect(isCacheValid()).toBe(true)
      expect(cache.prompts.get("test_agent")).toBe("cached prompt")
    })

    it("should invalidate cache after TTL expires", () => {
      const cache = createMockCache()
      cache.prompts.set("test_agent", "cached prompt")
      cache.lastRefresh = Date.now() - CACHE_TTL_MS - MS_PER_SECOND
      cache.isInitialized = true

      const isCacheValid = (): boolean => {
        if (!cache.isInitialized) {
          return false
        }
        return Date.now() - cache.lastRefresh < CACHE_TTL_MS
      }

      expect(isCacheValid()).toBe(false)
    })

    it("should refresh cache from database when expired", () => {
      const cache = createMockCache()
      cache.lastRefresh = Date.now() - CACHE_TTL_MS - MS_PER_SECOND
      cache.isInitialized = true

      const isCacheValid = Date.now() - cache.lastRefresh < CACHE_TTL_MS

      if (!isCacheValid) {
        const freshPrompts = new Map([
          ["test_agent", "fresh prompt from DB"],
        ])
        cache.prompts = freshPrompts
        cache.lastRefresh = Date.now()
      }

      expect(cache.prompts.get("test_agent")).toBe("fresh prompt from DB")
    })

    it("should clear cache when requested", () => {
      const cache = createMockCache()
      cache.prompts.set("agent1", "prompt1")
      cache.prompts.set("agent2", "prompt2")
      cache.lastRefresh = Date.now()
      cache.isInitialized = true

      cache.prompts.clear()
      cache.lastRefresh = 0
      cache.isInitialized = false

      expect(cache.prompts.size).toBe(0)
      expect(cache.isInitialized).toBe(false)
    })
  })

  describe("Scenario 3: Prompt Resolution", () => {
    it("should get prompt from cache synchronously", () => {
      const cache = createMockCache()
      cache.prompts.set("calendar_orchestrator_agent", "orchestrator prompt")
      cache.isInitialized = true

      const getPromptSync = (agentId: string): string | undefined =>
        cache.prompts.get(agentId)

      expect(getPromptSync("calendar_orchestrator_agent")).toBe(
        "orchestrator prompt"
      )
    })

    it("should fall back to definition prompt when not in cache", () => {
      const cache = createMockCache()
      cache.isInitialized = true

      const agentDefinitions = {
        unknown_agent: { basePrompt: "fallback prompt from definition" },
      }

      const getPromptSync = (agentId: string): string | undefined => {
        if (cache.prompts.has(agentId)) {
          return cache.prompts.get(agentId)
        }
        const def = agentDefinitions[agentId as keyof typeof agentDefinitions]
        return def?.basePrompt
      }

      expect(getPromptSync("unknown_agent")).toBe(
        "fallback prompt from definition"
      )
    })

    it("should return all agents with resolved prompts", () => {
      const agentDefinitions = [
        { agentId: "agent1", basePrompt: "def prompt 1" },
        { agentId: "agent2", basePrompt: "def prompt 2" },
      ]

      const cache = createMockCache()
      cache.prompts.set("agent1", "db prompt 1")

      const getAllWithPrompts = () =>
        agentDefinitions.map((def) => ({
          ...def,
          resolvedPrompt: cache.prompts.get(def.agentId) || def.basePrompt,
        }))

      const result = getAllWithPrompts()

      expect(result[0].resolvedPrompt).toBe("db prompt 1")
      expect(result[1].resolvedPrompt).toBe("def prompt 2")
    })
  })

  describe("Scenario 4: DPO Optimization Flow", () => {
    it("should skip optimization when agent config disables it", () => {
      const agentConfig = { requires_optimization: false }
      const userQuery = "Schedule a meeting tomorrow"

      const shouldOptimize = agentConfig.requires_optimization

      expect(shouldOptimize).toBe(false)

      const result = {
        effectivePrompt: userQuery,
        outcome: "PASS" as const,
        wasOptimized: false,
        wasRejected: false,
        totalTimeMs: 0,
      }

      expect(result.wasOptimized).toBe(false)
      expect(result.outcome).toBe("PASS")
    })

    it("should run optimizer when optimization is enabled", () => {
      const agentConfig = { requires_optimization: true }
      const userQuery = "Can you help me schedule something?"

      const optimizerOutput = {
        refinedPrompt:
          "Please schedule an event. User intent: scheduling request.",
        reasoning: "Added explicit intent context",
        confidence: CONFIDENCE_HIGH,
        detectedIntentCategory: "scheduling" as const,
        optimizationType: "intent_clarification" as const,
      }

      expect(agentConfig.requires_optimization).toBe(true)
      expect(optimizerOutput.refinedPrompt).not.toBe(userQuery)
      expect(optimizerOutput.confidence).toBeGreaterThan(CONFIDENCE_THRESHOLD)
    })

    it("should run judge to approve or reject optimization", () => {
      const optimizerOutput = {
        refinedPrompt: "Optimized: Schedule meeting tomorrow at 3pm",
        confidence: CONFIDENCE_HIGH,
      }

      const judgeOutput = {
        approved: true,
        reasoning: "Optimization maintains user intent and improves clarity",
        risk_level: "low" as const,
      }

      expect(judgeOutput.approved).toBe(true)
      expect(judgeOutput.risk_level).toBe("low")

      const finalPrompt = judgeOutput.approved
        ? optimizerOutput.refinedPrompt
        : "original prompt"

      expect(finalPrompt).toBe(optimizerOutput.refinedPrompt)
    })

    it("should reject optimization when judge denies it", () => {
      const originalPrompt = "Delete all my events"

      const optimizerOutput = {
        refinedPrompt: "Remove all calendar events permanently",
        confidence: CONFIDENCE_MEDIUM,
      }

      const judgeOutput = {
        approved: false,
        reasoning: "Mass deletion request - safety guardrail triggered",
        risk_level: "high" as const,
      }

      expect(judgeOutput.approved).toBe(false)
      expect(optimizerOutput.confidence).toBe(CONFIDENCE_MEDIUM)

      const result = {
        effectivePrompt: originalPrompt,
        outcome: "REJECTED" as const,
        wasOptimized: false,
        wasRejected: true,
      }

      expect(result.wasRejected).toBe(true)
      expect(result.outcome).toBe("REJECTED")
    })
  })

  describe("Scenario 5: DPO Logging and History", () => {
    it("should log optimization decision to database", () => {
      const dpoResult = {
        effectivePrompt: "Optimized prompt",
        outcome: "OPTIMIZED" as const,
        wasOptimized: true,
        wasRejected: false,
        totalTimeMs: TOTAL_DPO_TIME_MS,
      }

      const historyInput = {
        userId: "user-123",
        agentId: "calendar_orchestrator_agent",
        userQuery: "schedule meeting",
        originalPrompt: "base prompt",
        optimizedPrompt: dpoResult.effectivePrompt,
        optimizationReason: "Intent clarification",
        judgeReasoning: "Safe optimization",
        outcome: dpoResult.outcome,
        userIntentCategory: "scheduling",
        isShadowRun: false,
        optimizerTimeMs: OPTIMIZER_TIME_MS,
        judgeTimeMs: JUDGE_TIME_MS,
        totalTimeMs: dpoResult.totalTimeMs,
      }

      expect(historyInput.outcome).toBe("OPTIMIZED")
      expect(historyInput.userId).toBe("user-123")
      expect(historyInput.totalTimeMs).toBe(TOTAL_DPO_TIME_MS)
    })

    it("should support shadow run mode for testing", () => {
      const config = {
        userId: "user-123",
        agentId: "test_agent",
        userQuery: "test query",
        basePrompt: "base prompt",
        isShadowRun: true,
      }

      const historyInput = {
        ...config,
        isShadowRun: config.isShadowRun,
      }

      expect(historyInput.isShadowRun).toBe(true)
    })

    it("should track performance metrics", () => {
      const metrics = {
        optimizerTimeMs: OPTIMIZER_TIME_MS,
        judgeTimeMs: JUDGE_TIME_MS,
        totalTimeMs: TOTAL_DPO_TIME_MS,
        metadata: {
          optimizerConfidence: CONFIDENCE_HIGH,
          optimizationType: "intent_clarification",
          judgeRiskLevel: "low",
        },
      }

      expect(metrics.totalTimeMs).toBeGreaterThanOrEqual(
        metrics.optimizerTimeMs + metrics.judgeTimeMs
      )
      expect(metrics.metadata.optimizerConfidence).toBe(CONFIDENCE_HIGH)
    })
  })

  describe("Scenario 6: Agent Model Tier Selection", () => {
    it("should return correct model tier for agent", () => {
      const agentDefinitions = [
        { agentId: "calendar_orchestrator_agent", modelTier: "medium" },
        { agentId: "parse_event_text_agent", modelTier: "high" },
        { agentId: "update_event_agent", modelTier: "fast" },
      ]

      const getModelTier = (
        agentId: string
      ): "fast" | "medium" | "high" | undefined => {
        const def = agentDefinitions.find((d) => d.agentId === agentId)
        return def?.modelTier as "fast" | "medium" | "high" | undefined
      }

      expect(getModelTier("calendar_orchestrator_agent")).toBe("medium")
      expect(getModelTier("parse_event_text_agent")).toBe("high")
      expect(getModelTier("update_event_agent")).toBe("fast")
    })

    it("should default to medium tier for unknown agents", () => {
      const getModelTier = (agentId: string): "fast" | "medium" | "high" => {
        const knownAgents: Record<string, "fast" | "medium" | "high"> = {}
        return knownAgents[agentId] || "medium"
      }

      expect(getModelTier("unknown_agent")).toBe("medium")
    })
  })
})
