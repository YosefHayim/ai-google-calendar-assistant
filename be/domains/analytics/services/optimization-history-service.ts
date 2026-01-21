import { SUPABASE } from "@/config/clients"
import type { Json } from "@/database.types"
import { logger } from "@/lib/logger"

const SERVICE_LOG_PREFIX = "[OptimizationHistoryService]"

export type OptimizationOutcome = "PASS" | "OPTIMIZED" | "REJECTED"

export type UserIntentCategory =
  | "scheduling"
  | "deletion"
  | "update"
  | "search"
  | "bulk_operation"
  | "constraint_based"
  | "other"

export type AgentRegistryRecord = {
  id: string
  agent_id: string
  agent_name: string
  description: string | null
  base_prompt: string
  model_tier: string
  requires_optimization: boolean
  is_active: boolean
  version: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type OptimizationHistoryRecord = {
  id: string
  user_id: string
  agent_id: string
  user_query: string
  original_prompt: string
  optimized_prompt: string | null
  optimization_reason: string | null
  judge_reasoning: string | null
  outcome: OptimizationOutcome
  user_intent_category: UserIntentCategory
  is_shadow_run: boolean
  optimizer_time_ms: number | null
  judge_time_ms: number | null
  total_time_ms: number | null
  metadata: Record<string, unknown>
  created_at: string
}

export type CreateOptimizationHistoryInput = {
  userId: string
  agentId: string
  userQuery: string
  originalPrompt: string
  optimizedPrompt?: string | null
  optimizationReason?: string | null
  judgeReasoning?: string | null
  outcome: OptimizationOutcome
  userIntentCategory: UserIntentCategory
  isShadowRun: boolean
  optimizerTimeMs?: number | null
  judgeTimeMs?: number | null
  totalTimeMs?: number | null
  metadata?: Record<string, unknown>
}

export async function getAgentConfig(
  agentId: string
): Promise<AgentRegistryRecord | null> {
  const { data, error } = await SUPABASE.from("agents_registry")
    .select("*")
    .eq("agent_id", agentId)
    .eq("is_active", true)
    .single()

  if (error) {
    logger.error(`${SERVICE_LOG_PREFIX} Failed to fetch agent config`, {
      agentId,
      error: error.message,
    })
    return null
  }

  return data as AgentRegistryRecord
}

export async function getAllActiveAgents(): Promise<AgentRegistryRecord[]> {
  const { data, error } = await SUPABASE.from("agents_registry")
    .select("*")
    .eq("is_active", true)
    .order("agent_id")

  if (error) {
    logger.error(`${SERVICE_LOG_PREFIX} Failed to fetch active agents`, {
      error: error.message,
    })
    return []
  }

  return (data as AgentRegistryRecord[]) || []
}

export async function getAgentsRequiringOptimization(): Promise<
  AgentRegistryRecord[]
> {
  const { data, error } = await SUPABASE.from("agents_registry")
    .select("*")
    .eq("is_active", true)
    .eq("requires_optimization", true)
    .order("agent_id")

  if (error) {
    logger.error(`${SERVICE_LOG_PREFIX} Failed to fetch agents requiring optimization`, {
      error: error.message,
    })
    return []
  }

  return (data as AgentRegistryRecord[]) || []
}

export async function createOptimizationHistory(
  input: CreateOptimizationHistoryInput
): Promise<OptimizationHistoryRecord | null> {
  const { data, error } = await SUPABASE.from("optimization_history")
    .insert({
      user_id: input.userId,
      agent_id: input.agentId,
      user_query: input.userQuery,
      original_prompt: input.originalPrompt,
      optimized_prompt: input.optimizedPrompt || null,
      optimization_reason: input.optimizationReason || null,
      judge_reasoning: input.judgeReasoning || null,
      outcome: input.outcome,
      user_intent_category: input.userIntentCategory,
      is_shadow_run: input.isShadowRun,
      optimizer_time_ms: input.optimizerTimeMs || null,
      judge_time_ms: input.judgeTimeMs || null,
      total_time_ms: input.totalTimeMs || null,
      metadata: (input.metadata || {}) as Json,
    })
    .select()
    .single()

  if (error) {
    logger.error(`${SERVICE_LOG_PREFIX} Failed to create optimization history`, {
      userId: input.userId,
      agentId: input.agentId,
      outcome: input.outcome,
      error: error.message,
    })
    return null
  }

  return data as OptimizationHistoryRecord
}

export async function getUserOptimizationHistory(
  userId: string,
  limit = 50
): Promise<OptimizationHistoryRecord[]> {
  const { data, error } = await SUPABASE.from("optimization_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    logger.error(`${SERVICE_LOG_PREFIX} Failed to fetch user optimization history`, {
      userId,
      error: error.message,
    })
    return []
  }

  return (data as OptimizationHistoryRecord[]) || []
}

export async function getOptimizationStats(userId?: string): Promise<{
  total: number
  passed: number
  optimized: number
  rejected: number
  avgTotalTimeMs: number
}> {
  let query = SUPABASE.from("optimization_history").select("outcome, total_time_ms")

  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { data, error } = await query

  if (error || !data) {
    logger.error(`${SERVICE_LOG_PREFIX} Failed to fetch optimization stats`, {
      userId,
      error: error?.message,
    })
    return { total: 0, passed: 0, optimized: 0, rejected: 0, avgTotalTimeMs: 0 }
  }

  const records = data as Pick<
    OptimizationHistoryRecord,
    "outcome" | "total_time_ms"
  >[]

  const total = records.length
  const passed = records.filter((r) => r.outcome === "PASS").length
  const optimized = records.filter((r) => r.outcome === "OPTIMIZED").length
  const rejected = records.filter((r) => r.outcome === "REJECTED").length

  const timesWithValues = records
    .map((r) => r.total_time_ms)
    .filter((t): t is number => t !== null)

  const avgTotalTimeMs =
    timesWithValues.length > 0
      ? timesWithValues.reduce((a, b) => a + b, 0) / timesWithValues.length
      : 0

  return { total, passed, optimized, rejected, avgTotalTimeMs }
}

export const optimizationHistoryService = {
  getAgentConfig,
  getAllActiveAgents,
  getAgentsRequiringOptimization,
  createOptimizationHistory,
  getUserOptimizationHistory,
  getOptimizationStats,
}
