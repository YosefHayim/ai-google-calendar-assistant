import type { Request, Response } from "express"
import {
  getAllAgentsWithPrompts,
  refreshCache,
} from "@/ai-agents/registry/agent-registry-service"
import { reqResAsyncHandler, sendR } from "@/lib/http"

import { STATUS_RESPONSE } from "@/config"
import { SUPABASE } from "@/config/clients"
import { logger } from "@/lib/logger"

const CONTROLLER_LOG_PREFIX = "[AgentRegistryController]"
const DEFAULT_HISTORY_LIMIT = 50
const PERCENTAGE_MULTIPLIER = 100

export const getAgents = reqResAsyncHandler(async (_req: Request, res: Response) => {
  const agents = getAllAgentsWithPrompts()
  return sendR(res, STATUS_RESPONSE.SUCCESS, "Agents retrieved", agents)
})

export const getAgentById = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const { agentId } = req.params

    const { data, error } = await SUPABASE.from("agents_registry")
      .select("*")
      .eq("agent_id", agentId)
      .eq("is_active", true)
      .maybeSingle()

    if (error) {
      logger.error(`${CONTROLLER_LOG_PREFIX} Failed to fetch agent`, {
        agentId,
        error: error.message,
      })
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to fetch agent"
      )
    }

    if (!data) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Agent not found")
    }

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Agent retrieved", data)
  }
)

export const updateAgentPrompt = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const { agentId } = req.params
    const { basePrompt, description } = req.body

    if (!basePrompt || typeof basePrompt !== "string") {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "basePrompt is required and must be a string"
      )
    }

    const { data: existing, error: fetchError } = await SUPABASE.from(
      "agents_registry"
    )
      .select("id, version")
      .eq("agent_id", agentId)
      .eq("is_active", true)
      .maybeSingle()

    if (fetchError) {
      logger.error(`${CONTROLLER_LOG_PREFIX} Failed to fetch agent for update`, {
        agentId,
        error: fetchError.message,
      })
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to fetch agent"
      )
    }

    if (!existing) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Agent not found")
    }

    const updateData: Record<string, unknown> = {
      base_prompt: basePrompt,
      version: existing.version + 1,
    }

    if (description !== undefined) {
      updateData.description = description
    }

    const { error: updateError } = await SUPABASE.from("agents_registry")
      .update(updateData)
      .eq("id", existing.id)

    if (updateError) {
      logger.error(`${CONTROLLER_LOG_PREFIX} Failed to update agent prompt`, {
        agentId,
        error: updateError.message,
      })
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to update agent prompt"
      )
    }

    await refreshCache()

    logger.info(`${CONTROLLER_LOG_PREFIX} Agent prompt updated`, {
      agentId,
      newVersion: existing.version + 1,
    })

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Agent prompt updated", {
      agentId,
      newVersion: existing.version + 1,
    })
  }
)

export const getOptimizationHistory = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const { agentId } = req.params
    const limit = Number(req.query.limit) || DEFAULT_HISTORY_LIMIT

    const { data, error } = await SUPABASE.from("optimization_history")
      .select("*")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      logger.error(
        `${CONTROLLER_LOG_PREFIX} Failed to fetch optimization history`,
        {
          agentId,
          error: error.message,
        }
      )
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to fetch optimization history"
      )
    }

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Optimization history retrieved",
      data
    )
  }
)

export const promoteOptimization = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const { optimizationId } = req.params

    const { data: optimization, error: fetchError } = await SUPABASE.from(
      "optimization_history"
    )
      .select("*")
      .eq("id", optimizationId)
      .single()

    if (fetchError || !optimization) {
      return sendR(
        res,
        STATUS_RESPONSE.NOT_FOUND,
        "Optimization record not found"
      )
    }

    if (optimization.outcome !== "OPTIMIZED" || !optimization.optimized_prompt) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Only OPTIMIZED records with optimized prompts can be promoted"
      )
    }

    const { data: agent, error: agentFetchError } = await SUPABASE.from(
      "agents_registry"
    )
      .select("id, version")
      .eq("agent_id", optimization.agent_id)
      .eq("is_active", true)
      .single()

    if (agentFetchError || !agent) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Agent not found")
    }

    const { error: updateError } = await SUPABASE.from("agents_registry")
      .update({
        base_prompt: optimization.optimized_prompt,
        version: agent.version + 1,
        metadata: {
          promoted_from_optimization_id: optimizationId,
          promoted_at: new Date().toISOString(),
        },
      })
      .eq("id", agent.id)

    if (updateError) {
      logger.error(
        `${CONTROLLER_LOG_PREFIX} Failed to promote optimization to agent`,
        {
          optimizationId,
          agentId: optimization.agent_id,
          error: updateError.message,
        }
      )
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to promote optimization"
      )
    }

    await refreshCache()

    logger.info(`${CONTROLLER_LOG_PREFIX} Optimization promoted to production`, {
      optimizationId,
      agentId: optimization.agent_id,
      newVersion: agent.version + 1,
    })

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Optimization promoted", {
      agentId: optimization.agent_id,
      newVersion: agent.version + 1,
      promotedFromOptimizationId: optimizationId,
    })
  }
)

export const refreshAgentCache = reqResAsyncHandler(
  async (_req: Request, res: Response) => {
    const count = await refreshCache()
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Agent cache refreshed", {
      promptsLoaded: count,
    })
  }
)

export const getOptimizationStats = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const { agentId } = req.params

    const { data, error } = await SUPABASE.from("optimization_history")
      .select("outcome, total_time_ms")
      .eq("agent_id", agentId)

    if (error) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to fetch stats"
      )
    }

    const records = data || []
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

    const calculateRate = (count: number): number =>
      total > 0 ? (count / total) * PERCENTAGE_MULTIPLIER : 0

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Optimization stats retrieved", {
      total,
      passed,
      optimized,
      rejected,
      passRate: calculateRate(passed),
      optimizationRate: calculateRate(optimized),
      rejectionRate: calculateRate(rejected),
      avgTotalTimeMs,
    })
  }
)
