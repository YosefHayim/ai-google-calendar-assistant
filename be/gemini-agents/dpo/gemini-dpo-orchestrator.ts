import {
  type CreateOptimizationHistoryInput,
  createOptimizationHistory,
  getAgentConfig,
  type OptimizationOutcome,
  type UserIntentCategory,
} from "@/domains/analytics/services/optimization-history-service"
import { logger } from "@/lib/logger"
import { type GeminiJudgeOutput, runGeminiJudge } from "./gemini-judge-agent"
import {
  type GeminiOptimizerOutput,
  runGeminiOptimizer,
} from "./gemini-optimizer-agent"

const LOG_PREFIX = "[GeminiDPO]"

export type GeminiDPOResult = {
  effectivePrompt: string
  outcome: OptimizationOutcome
  wasOptimized: boolean
  wasRejected: boolean
  optimizerOutput?: GeminiOptimizerOutput
  judgeOutput?: GeminiJudgeOutput
  totalTimeMs: number
  historyRecordId?: string
}

export type GeminiDPOConfig = {
  userId: string
  agentId: string
  userQuery: string
  basePrompt: string
  userContext?: string
  isShadowRun?: boolean
  skipOptimization?: boolean
}

async function logOptimizationDecision(
  config: GeminiDPOConfig,
  result: GeminiDPOResult,
  optimizerTimeMs: number,
  judgeTimeMs: number
): Promise<string | undefined> {
  const intentCategory: UserIntentCategory =
    result.optimizerOutput?.detectedIntentCategory || "other"

  const input: CreateOptimizationHistoryInput = {
    userId: config.userId,
    agentId: config.agentId,
    userQuery: config.userQuery,
    originalPrompt: config.basePrompt,
    optimizedPrompt: result.wasOptimized
      ? result.optimizerOutput?.refinedPrompt
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
      optimizationType: result.optimizerOutput?.optimizationType,
      judgeRiskLevel: result.judgeOutput?.risk_level,
      provider: "gemini",
    },
  }

  const record = await createOptimizationHistory(input)

  logger.info(`${LOG_PREFIX} Decision logged`, {
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

function createPassResult(
  config: GeminiDPOConfig,
  totalTimeMs: number,
  optimizerOutput?: GeminiOptimizerOutput,
  judgeOutput?: GeminiJudgeOutput
): GeminiDPOResult {
  return {
    effectivePrompt: config.userQuery,
    outcome: "PASS",
    wasOptimized: false,
    wasRejected: false,
    optimizerOutput,
    judgeOutput,
    totalTimeMs,
  }
}

export async function runGeminiDPO(
  config: GeminiDPOConfig
): Promise<GeminiDPOResult> {
  const startTime = Date.now()

  logger.info(`${LOG_PREFIX} Starting optimization check`, {
    userId: config.userId,
    agentId: config.agentId,
    isShadowRun: config.isShadowRun,
    queryLength: config.userQuery.length,
  })

  if (config.skipOptimization) {
    logger.info(`${LOG_PREFIX} Optimization skipped by config`, {
      userId: config.userId,
      agentId: config.agentId,
    })
    const totalTimeMs = Date.now() - startTime
    const result = createPassResult(config, totalTimeMs)
    await logOptimizationDecision(config, result, 0, 0)
    return result
  }

  const agentConfig = await getAgentConfig(config.agentId)

  if (!agentConfig?.requires_optimization) {
    const totalTimeMs = Date.now() - startTime
    const result = createPassResult(config, totalTimeMs)

    if (agentConfig) {
      await logOptimizationDecision(config, result, 0, 0)
    }

    return result
  }

  let optimizerOutput: GeminiOptimizerOutput
  let optimizerTimeMs: number

  try {
    const optimizerResult = await runGeminiOptimizer({
      userQuery: config.userQuery,
      basePrompt: config.basePrompt,
      userContext: config.userContext,
    })
    optimizerOutput = optimizerResult.output
    optimizerTimeMs = optimizerResult.timeMs
  } catch (error) {
    logger.error(`${LOG_PREFIX} Optimizer error, falling back to base prompt`, {
      userId: config.userId,
      agentId: config.agentId,
      error: error instanceof Error ? error.message : String(error),
    })
    const totalTimeMs = Date.now() - startTime
    const result = createPassResult(config, totalTimeMs)
    await logOptimizationDecision(config, result, 0, 0)
    return result
  }

  if (optimizerOutput.optimizationType === "none") {
    const totalTimeMs = Date.now() - startTime
    const result = createPassResult(config, totalTimeMs, optimizerOutput)
    await logOptimizationDecision(config, result, optimizerTimeMs, 0)
    return result
  }

  let judgeOutput: GeminiJudgeOutput
  let judgeTimeMs: number

  try {
    const judgeResult = await runGeminiJudge({
      userQuery: config.userQuery,
      originalPrompt: config.basePrompt,
      optimizerOutput,
    })
    judgeOutput = judgeResult.output
    judgeTimeMs = judgeResult.timeMs
  } catch (error) {
    logger.error(`${LOG_PREFIX} Judge error, falling back to base prompt`, {
      userId: config.userId,
      agentId: config.agentId,
      error: error instanceof Error ? error.message : String(error),
    })
    const totalTimeMs = Date.now() - startTime
    const result = createPassResult(config, totalTimeMs, optimizerOutput)
    await logOptimizationDecision(config, result, optimizerTimeMs, 0)
    return result
  }

  const totalTimeMs = Date.now() - startTime

  if (judgeOutput.recommendation === "reject_request") {
    const result: GeminiDPOResult = {
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
    const result: GeminiDPOResult = {
      effectivePrompt: optimizerOutput.refinedPrompt,
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

  const result = createPassResult(
    config,
    totalTimeMs,
    optimizerOutput,
    judgeOutput
  )
  const historyRecordId = await logOptimizationDecision(
    config,
    result,
    optimizerTimeMs,
    judgeTimeMs
  )
  return { ...result, historyRecordId }
}

export function runGeminiShadowDPO(
  config: Omit<GeminiDPOConfig, "isShadowRun">
): Promise<GeminiDPOResult> {
  return runGeminiDPO({ ...config, isShadowRun: true })
}
