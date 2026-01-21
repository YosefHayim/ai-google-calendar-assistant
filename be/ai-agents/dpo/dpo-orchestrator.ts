import {
  type CreateOptimizationHistoryInput,
  type OptimizationOutcome,
  type UserIntentCategory,
  createOptimizationHistory,
  getAgentConfig,
} from "@/domains/analytics/services/optimization-history-service"
import { logger } from "@/lib/logger"
import { type OptimizerOutput, runOptimizer } from "./optimizer-agent"
import { type JudgeOutput, runJudge } from "./judge-agent"

const DPO_LOG_PREFIX = "[DPO]"

export type DPOResult = {
  effectivePrompt: string
  outcome: OptimizationOutcome
  wasOptimized: boolean
  wasRejected: boolean
  optimizerOutput?: OptimizerOutput
  judgeOutput?: JudgeOutput
  totalTimeMs: number
  historyRecordId?: string
}

export type DPOConfig = {
  userId: string
  agentId: string
  userQuery: string
  basePrompt: string
  userContext?: string
  isShadowRun?: boolean
  skipOptimization?: boolean
}

/**
 * Logs the DPO (Direct Preference Optimization) decision to the optimization history database.
 * Records the optimization process, outcomes, and performance metrics for analysis and improvement.
 *
 * @param config - The DPO configuration containing user and agent context
 * @param result - The complete DPO result with optimization outcomes
 * @param optimizerTimeMs - Time taken by the optimizer agent in milliseconds
 * @param judgeTimeMs - Time taken by the judge agent in milliseconds
 * @returns Promise resolving to the created history record ID, or undefined if logging failed
 */
async function logOptimizationDecision(
  config: DPOConfig,
  result: DPOResult,
  optimizerTimeMs: number,
  judgeTimeMs: number
): Promise<string | undefined> {
  const intentCategory: UserIntentCategory =
    result.optimizerOutput?.detected_intent_category || "other"

  const input: CreateOptimizationHistoryInput = {
    userId: config.userId,
    agentId: config.agentId,
    userQuery: config.userQuery,
    originalPrompt: config.basePrompt,
    optimizedPrompt: result.wasOptimized
      ? result.optimizerOutput?.refined_prompt
      : null,
    optimizationReason: result.optimizerOutput?.reasoning || null,
    judgeReasoning: result.judgeOutput?.reasoning || null,
    outcome: result.outcome,
    userIntentCategory: intentCategory,
    isShadowRun: Boolean(config.isShadowRun),
    optimizerTimeMs,
    judgeTimeMs,
    totalTimeMs: result.totalTimeMs,
    metadata: {
      optimizerConfidence: result.optimizerOutput?.confidence,
      optimizationType: result.optimizerOutput?.optimization_type,
      judgeRiskLevel: result.judgeOutput?.risk_level,
    },
  }

  const record = await createOptimizationHistory(input)

  logger.info(`${DPO_LOG_PREFIX} Decision logged`, {
    recordId: record?.id,
    userId: config.userId,
    agentId: config.agentId,
    outcome: result.outcome,
    intentCategory,
    isShadowRun: config.isShadowRun,
    totalTimeMs: result.totalTimeMs,
  })

  return record?.id
}

/**
 * Runs the Direct Preference Optimization (DPO) pipeline for prompt optimization.
 * Orchestrates optimizer and judge agents to determine if a user query should be optimized,
 * rejected, or passed through unchanged. Logs all decisions and performance metrics.
 *
 * @param config - DPO configuration including user query, base prompt, and execution options
 * @returns Promise resolving to DPO result with effective prompt and optimization outcomes
 */
export async function runDPO(config: DPOConfig): Promise<DPOResult> {
  const startTime = Date.now()

  logger.info(`${DPO_LOG_PREFIX} Starting optimization check`, {
    userId: config.userId,
    agentId: config.agentId,
    isShadowRun: config.isShadowRun,
    queryLength: config.userQuery.length,
  })

  if (config.skipOptimization) {
    logger.info(`${DPO_LOG_PREFIX} Optimization skipped by config`, {
      userId: config.userId,
      agentId: config.agentId,
    })
    const totalTimeMs = Date.now() - startTime
    const result: DPOResult = {
      effectivePrompt: config.userQuery,
      outcome: "PASS",
      wasOptimized: false,
      wasRejected: false,
      totalTimeMs,
    }

    await logOptimizationDecision(config, result, 0, 0)
    return result
  }

  const agentConfig = await getAgentConfig(config.agentId)

  if (!agentConfig?.requires_optimization) {
    const totalTimeMs = Date.now() - startTime
    const result: DPOResult = {
      effectivePrompt: config.userQuery,
      outcome: "PASS",
      wasOptimized: false,
      wasRejected: false,
      totalTimeMs,
    }

    if (agentConfig) {
      await logOptimizationDecision(config, result, 0, 0)
    }

    return result
  }

  let optimizerOutput: OptimizerOutput
  let optimizerTimeMs: number

  try {
    const optimizerResult = await runOptimizer({
      userQuery: config.userQuery,
      basePrompt: config.basePrompt,
      userContext: config.userContext,
    })
    optimizerOutput = optimizerResult.output
    optimizerTimeMs = optimizerResult.timeMs
  } catch (error) {
    logger.error(`${DPO_LOG_PREFIX} Optimizer error, falling back to base prompt`, {
      userId: config.userId,
      agentId: config.agentId,
      error: error instanceof Error ? error.message : String(error),
    })
    const totalTimeMs = Date.now() - startTime
    const result: DPOResult = {
      effectivePrompt: config.userQuery,
      outcome: "PASS",
      wasOptimized: false,
      wasRejected: false,
      totalTimeMs,
    }
    await logOptimizationDecision(config, result, 0, 0)
    return result
  }

  if (optimizerOutput.optimization_type === "none") {
    const totalTimeMs = Date.now() - startTime
    const result: DPOResult = {
      effectivePrompt: config.userQuery,
      outcome: "PASS",
      wasOptimized: false,
      wasRejected: false,
      optimizerOutput,
      totalTimeMs,
    }
    await logOptimizationDecision(config, result, optimizerTimeMs, 0)
    return result
  }

  let judgeOutput: JudgeOutput
  let judgeTimeMs: number

  try {
    const judgeResult = await runJudge({
      userQuery: config.userQuery,
      originalPrompt: config.basePrompt,
      optimizerOutput,
    })
    judgeOutput = judgeResult.output
    judgeTimeMs = judgeResult.timeMs
  } catch (error) {
    logger.error(`${DPO_LOG_PREFIX} Judge error, falling back to base prompt`, {
      userId: config.userId,
      agentId: config.agentId,
      error: error instanceof Error ? error.message : String(error),
    })
    const totalTimeMs = Date.now() - startTime
    const result: DPOResult = {
      effectivePrompt: config.userQuery,
      outcome: "PASS",
      wasOptimized: false,
      wasRejected: false,
      optimizerOutput,
      totalTimeMs,
    }
    await logOptimizationDecision(config, result, optimizerTimeMs, 0)
    return result
  }

  const totalTimeMs = Date.now() - startTime

  if (judgeOutput.recommendation === "reject_request") {
    const result: DPOResult = {
      effectivePrompt: config.userQuery,
      outcome: "REJECTED",
      wasOptimized: false,
      wasRejected: true,
      optimizerOutput,
      judgeOutput,
      totalTimeMs,
    }
    const historyRecordId = await logOptimizationDecision(
      config,
      result,
      optimizerTimeMs,
      judgeTimeMs
    )
    return { ...result, historyRecordId }
  }

  if (judgeOutput.recommendation === "use_optimized" && judgeOutput.approved) {
    const result: DPOResult = {
      effectivePrompt: optimizerOutput.refined_prompt,
      outcome: "OPTIMIZED",
      wasOptimized: true,
      wasRejected: false,
      optimizerOutput,
      judgeOutput,
      totalTimeMs,
    }
    const historyRecordId = await logOptimizationDecision(
      config,
      result,
      optimizerTimeMs,
      judgeTimeMs
    )
    return { ...result, historyRecordId }
  }

  const result: DPOResult = {
    effectivePrompt: config.userQuery,
    outcome: "PASS",
    wasOptimized: false,
    wasRejected: false,
    optimizerOutput,
    judgeOutput,
    totalTimeMs,
  }
  const historyRecordId = await logOptimizationDecision(
    config,
    result,
    optimizerTimeMs,
    judgeTimeMs
  )
  return { ...result, historyRecordId }
}

/**
 * Runs DPO in shadow mode for testing and evaluation purposes.
 * Shadow runs don't affect production decisions but allow monitoring of optimization performance.
 * Useful for A/B testing and gradual rollout of optimization changes.
 *
 * @param config - DPO configuration without the isShadowRun flag (automatically set to true)
 * @returns Promise resolving to DPO result (marked as shadow run)
 */
export function runShadowDPO(
  config: Omit<DPOConfig, "isShadowRun">
): Promise<DPOResult> {
  return runDPO({ ...config, isShadowRun: true })
}
