import { SUPABASE } from "@/config/clients"
import { logger } from "@/lib/logger"
import { AGENT_INSTRUCTIONS } from "../agents-instructions"
import {
  AGENT_DEFINITIONS,
  getAgentDefinitionById,
  type AgentDefinition,
  type ModelTier,
} from "./agent-definitions"

const SERVICE_LOG_PREFIX = "[AgentRegistryService]"
const SECONDS_PER_MINUTE = 60
const MS_PER_SECOND = 1000
const CACHE_TTL_MINUTES = 5
const CACHE_TTL_MS = CACHE_TTL_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND

type AgentRegistryCache = {
  prompts: Map<string, string>
  lastRefresh: number
  isInitialized: boolean
}
const cache: AgentRegistryCache = {
  prompts: new Map(),
  lastRefresh: 0,
  isInitialized: false,
}

type AgentInstructionsKey = keyof typeof AGENT_INSTRUCTIONS
const AGENT_ID_TO_INSTRUCTION_KEY: Record<string, AgentInstructionsKey> = {
  calendar_orchestrator_agent: "orchestrator",
  create_event_handoff_agent: "createEventHandoff",
  update_event_handoff_agent: "updateEventHandoff",
  delete_event_handoff_agent: "deleteEventHandoff",
  register_user_handoff_agent: "registerUserHandoff",
  parse_event_text_agent: "parseEventText",
  update_event_agent: "updateEvent",
  delete_event_agent: "deleteEvent",
  generate_google_auth_url_agent: "generateGoogleAuthUrl",
  register_user_agent: "registerUser",
}

function getFallbackPrompt(agentId: string): string | undefined {
  const instructionKey = AGENT_ID_TO_INSTRUCTION_KEY[agentId]
  if (instructionKey && AGENT_INSTRUCTIONS[instructionKey]) {
    return AGENT_INSTRUCTIONS[instructionKey]
  }
  const definition = getAgentDefinitionById(agentId)
  return definition?.basePrompt
}

async function fetchPromptsFromDB(): Promise<Map<string, string>> {
  const prompts = new Map<string, string>()

  try {
    const { data, error } = await SUPABASE.from("agents_registry")
      .select("agent_id, base_prompt")
      .eq("is_active", true)

    if (error) {
      logger.error(`${SERVICE_LOG_PREFIX} Failed to fetch prompts from DB`, {
        error: error.message,
      })
      return prompts
    }

    for (const row of data || []) {
      if (row.agent_id && row.base_prompt) {
        prompts.set(row.agent_id, row.base_prompt)
      }
    }

    logger.debug(`${SERVICE_LOG_PREFIX} Loaded ${prompts.size} prompts from DB`)
  } catch (error) {
    logger.error(`${SERVICE_LOG_PREFIX} Exception fetching prompts`, {
      error: error instanceof Error ? error.message : String(error),
    })
  }

  return prompts
}

function isCacheValid(): boolean {
  if (!cache.isInitialized) {
    return false
  }
  return Date.now() - cache.lastRefresh < CACHE_TTL_MS
}

export async function initializeAgentRegistry(): Promise<boolean> {
  logger.info(`${SERVICE_LOG_PREFIX} Initializing agent registry`)

  const dbPrompts = await fetchPromptsFromDB()

  if (dbPrompts.size > 0) {
    cache.prompts = dbPrompts
    cache.lastRefresh = Date.now()
    cache.isInitialized = true
    logger.info(`${SERVICE_LOG_PREFIX} Registry initialized with DB prompts`, {
      count: dbPrompts.size,
    })
    return true
  }

  logger.warn(
    `${SERVICE_LOG_PREFIX} No prompts in DB, using hardcoded fallbacks`
  )
  for (const definition of AGENT_DEFINITIONS) {
    cache.prompts.set(definition.agentId, definition.basePrompt)
  }
  cache.lastRefresh = Date.now()
  cache.isInitialized = true

  return true
}

export async function getAgentPrompt(
  agentId: string
): Promise<string | undefined> {
  if (isCacheValid() && cache.prompts.has(agentId)) {
    return cache.prompts.get(agentId)
  }

  if (!isCacheValid()) {
    const dbPrompts = await fetchPromptsFromDB()
    if (dbPrompts.size > 0) {
      cache.prompts = dbPrompts
      cache.lastRefresh = Date.now()
      cache.isInitialized = true
    }
  }

  if (cache.prompts.has(agentId)) {
    return cache.prompts.get(agentId)
  }

  logger.debug(`${SERVICE_LOG_PREFIX} Using fallback prompt for ${agentId}`)
  return getFallbackPrompt(agentId)
}

export function getAgentPromptSync(agentId: string): string | undefined {
  if (cache.prompts.has(agentId)) {
    return cache.prompts.get(agentId)
  }
  return getFallbackPrompt(agentId)
}

export function getAllCachedPrompts(): Map<string, string> {
  return new Map(cache.prompts)
}

export async function refreshCache(): Promise<number> {
  const dbPrompts = await fetchPromptsFromDB()

  if (dbPrompts.size > 0) {
    cache.prompts = dbPrompts
    cache.lastRefresh = Date.now()
    logger.info(`${SERVICE_LOG_PREFIX} Cache refreshed`, {
      count: dbPrompts.size,
    })
    return dbPrompts.size
  }

  logger.warn(`${SERVICE_LOG_PREFIX} Refresh returned no prompts`)
  return 0
}

export function clearCache(): void {
  cache.prompts.clear()
  cache.lastRefresh = 0
  cache.isInitialized = false
  logger.info(`${SERVICE_LOG_PREFIX} Cache cleared`)
}

export function getAllAgentsWithPrompts(): Array<
  AgentDefinition & { resolvedPrompt: string }
> {
  return AGENT_DEFINITIONS.map((def) => ({
    ...def,
    resolvedPrompt: getAgentPromptSync(def.agentId) || def.basePrompt,
  }))
}

export function getAgentModelTier(agentId: string): ModelTier {
  const definition = getAgentDefinitionById(agentId)
  return definition?.modelTier || "medium"
}

export const agentRegistryService = {
  initializeAgentRegistry,
  getAgentPrompt,
  getAgentPromptSync,
  getAllCachedPrompts,
  refreshCache,
  clearCache,
  getAllAgentsWithPrompts,
  getAgentModelTier,
}
