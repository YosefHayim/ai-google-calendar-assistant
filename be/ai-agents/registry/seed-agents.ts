import { SUPABASE } from "@/config/clients"
import { logger } from "@/lib/logger"
import { AGENT_DEFINITIONS, type AgentDefinition } from "./agent-definitions"
import { Json } from "@/database.types"

const SEED_LOG_PREFIX = "[AgentSeed]"

type UpsertResult = {
  success: boolean
  agentId: string
  action: "created" | "updated" | "unchanged" | "error"
  error?: string
}

async function upsertAgent(definition: AgentDefinition): Promise<UpsertResult> {
  const { data: existing, error: fetchError } = await SUPABASE.from(
    "agents_registry"
  )
    .select("id, base_prompt, version")
    .eq("agent_id", definition.agentId)
    .maybeSingle()

  if (fetchError) {
    return {
      success: false,
      agentId: definition.agentId,
      action: "error",
      error: fetchError.message,
    }
  }

  if (existing) {
    const promptChanged = existing.base_prompt !== definition.basePrompt

    if (!promptChanged) {
      return {
        success: true,
        agentId: definition.agentId,
        action: "unchanged",
      }
    }

    const { error: updateError } = await SUPABASE.from("agents_registry")
      .update({
        agent_name: definition.agentName,
        description: definition.description,
        base_prompt: definition.basePrompt,
        model_tier: definition.modelTier,
        requires_optimization: definition.requiresOptimization,
        metadata: definition.metadata as Json,
        version: existing.version + 1,
        is_active: true,
      })
      .eq("id", existing.id)

    if (updateError) {
      return {
        success: false,
        agentId: definition.agentId,
        action: "error",
        error: updateError.message,
      }
    }

    return {
      success: true,
      agentId: definition.agentId,
      action: "updated",
    }
  }

  const { error: insertError } = await SUPABASE.from("agents_registry").insert({
    agent_id: definition.agentId,
    agent_name: definition.agentName,
    description: definition.description,
    base_prompt: definition.basePrompt,
    model_tier: definition.modelTier,
    requires_optimization: definition.requiresOptimization,
    metadata: definition.metadata as Json,
    is_active: true,
    version: 1,
  })

  if (insertError) {
    return {
      success: false,
      agentId: definition.agentId,
      action: "error",
      error: insertError.message,
    }
  }

  return {
    success: true,
    agentId: definition.agentId,
    action: "created",
  }
}

export async function seedAgentRegistry(): Promise<{
  success: boolean
  results: UpsertResult[]
  summary: { created: number; updated: number; unchanged: number; errors: number }
}> {
  logger.info(`${SEED_LOG_PREFIX} Starting agent registry seed`, {
    agentCount: AGENT_DEFINITIONS.length,
  })

  const results: UpsertResult[] = []

  for (const definition of AGENT_DEFINITIONS) {
    const result = await upsertAgent(definition)
    results.push(result)

    if (result.action === "error") {
      logger.error(`${SEED_LOG_PREFIX} Failed to upsert agent`, {
        agentId: definition.agentId,
        error: result.error,
      })
    } else if (result.action !== "unchanged") {
      logger.info(`${SEED_LOG_PREFIX} Agent ${result.action}`, {
        agentId: definition.agentId,
      })
    }
  }

  const summary = {
    created: results.filter((r) => r.action === "created").length,
    updated: results.filter((r) => r.action === "updated").length,
    unchanged: results.filter((r) => r.action === "unchanged").length,
    errors: results.filter((r) => r.action === "error").length,
  }

  logger.info(`${SEED_LOG_PREFIX} Seed completed`, summary)

  return {
    success: summary.errors === 0,
    results,
    summary,
  }
}

export async function deactivateUnknownAgents(): Promise<number> {
  const knownAgentIds = AGENT_DEFINITIONS.map((def) => def.agentId)

  const { data, error } = await SUPABASE.from("agents_registry")
    .update({ is_active: false })
    .eq("is_active", true)
    .not("agent_id", "in", `(${knownAgentIds.join(",")})`)
    .select("agent_id")

  if (error) {
    logger.error(`${SEED_LOG_PREFIX} Failed to deactivate unknown agents`, {
      error: error.message,
    })
    return 0
  }

  const deactivatedCount = data?.length || 0

  if (deactivatedCount > 0) {
    logger.info(`${SEED_LOG_PREFIX} Deactivated unknown agents`, {
      count: deactivatedCount,
      agentIds: data?.map((d) => d.agent_id),
    })
  }

  return deactivatedCount
}

export async function runFullSync(): Promise<void> {
  const seedResult = await seedAgentRegistry()
  await deactivateUnknownAgents()

  if (!seedResult.success) {
    throw new Error(
      `Agent registry sync failed with ${seedResult.summary.errors} errors`
    )
  }
}
