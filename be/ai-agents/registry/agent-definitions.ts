import { AGENT_INSTRUCTIONS } from "../agents-instructions"

export type ModelTier = "fast" | "medium" | "current"

export type AgentDefinition = {
  agentId: string
  agentName: string
  description: string
  basePrompt: string
  modelTier: ModelTier
  requiresOptimization: boolean
  metadata?: Record<string, unknown>
}

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    agentId: "calendar_orchestrator_agent",
    agentName: "Calendar Orchestrator",
    description:
      "Main orchestrator that routes user requests to specialized agents",
    basePrompt: AGENT_INSTRUCTIONS.orchestrator,
    modelTier: "current",
    requiresOptimization: true,
  },
  {
    agentId: "create_event_handoff_agent",
    agentName: "Create Event Handoff",
    description: "Handles event creation with conflict detection and validation",
    basePrompt: AGENT_INSTRUCTIONS.createEventHandoff,
    modelTier: "medium",
    requiresOptimization: true,
  },
  {
    agentId: "update_event_handoff_agent",
    agentName: "Update Event Handoff",
    description: "Handles event modifications and rescheduling with alias resolution",
    basePrompt: AGENT_INSTRUCTIONS.updateEventHandoff,
    modelTier: "medium",
    requiresOptimization: true,
  },
  {
    agentId: "delete_event_handoff_agent",
    agentName: "Delete Event Handoff",
    description: "Handles event deletion with smart search and confirmation",
    basePrompt: AGENT_INSTRUCTIONS.deleteEventHandoff,
    modelTier: "medium",
    requiresOptimization: false,
  },
  {
    agentId: "register_user_handoff_agent",
    agentName: "Register User Handoff",
    description: "Handles user registration via Google OAuth flow",
    basePrompt: AGENT_INSTRUCTIONS.registerUserHandoff,
    modelTier: "medium",
    requiresOptimization: false,
  },
  {
    agentId: "parse_event_text_agent",
    agentName: "Parse Event Text",
    description: "Parses natural language into structured calendar event JSON",
    basePrompt: AGENT_INSTRUCTIONS.parseEventText,
    modelTier: "current",
    requiresOptimization: false,
  },
  {
    agentId: "update_event_agent",
    agentName: "Update Event",
    description: "Atomic event updater - modifies single event fields",
    basePrompt: AGENT_INSTRUCTIONS.updateEvent,
    modelTier: "fast",
    requiresOptimization: false,
  },
  {
    agentId: "delete_event_agent",
    agentName: "Delete Event",
    description: "Atomic event deleter - removes single events",
    basePrompt: AGENT_INSTRUCTIONS.deleteEvent,
    modelTier: "fast",
    requiresOptimization: false,
  },
  {
    agentId: "generate_google_auth_url_agent",
    agentName: "Generate Google Auth URL",
    description: "Generates OAuth consent URL for Google Calendar authorization",
    basePrompt: AGENT_INSTRUCTIONS.generateGoogleAuthUrl,
    modelTier: "fast",
    requiresOptimization: false,
  },
  {
    agentId: "register_user_agent",
    agentName: "Register User",
    description: "Atomic user registration handler",
    basePrompt: AGENT_INSTRUCTIONS.registerUser,
    modelTier: "fast",
    requiresOptimization: false,
  },
]

export const getAgentDefinitionById = (
  agentId: string
): AgentDefinition | undefined =>
  AGENT_DEFINITIONS.find((def) => def.agentId === agentId)

export const getAgentDefinitionsByTier = (tier: ModelTier): AgentDefinition[] =>
  AGENT_DEFINITIONS.filter((def) => def.modelTier === tier)

export const getOptimizableAgents = (): AgentDefinition[] =>
  AGENT_DEFINITIONS.filter((def) => def.requiresOptimization)
