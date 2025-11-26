import { CURRENT_MODEL, MODELS } from "@/types";

import { AGENT_HANDOFFS } from "./agentHandoffsDescription";
import { AGENT_INSTRUCTIONS } from "./agentInstructions";
import { AGENT_TOOLS } from "./agentTools";
import { Agent } from "@openai/agents";

export const AGENTS = {
  generateUserCbGoogleUrl: new Agent({
    name: "generate_user_cb_google_url_agent",
    instructions: AGENT_INSTRUCTIONS.generateUserCbGoogleUrl,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.generateUserCbGoogleUrl,
    tools: [AGENT_TOOLS.generate_user_cb_google_url],
  }),
  registerUserViaDb: new Agent({
    name: "register_user_via_db_agent",
    instructions: AGENT_INSTRUCTIONS.registerUserViaDb,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.registerUserViaDb,
    tools: [AGENT_TOOLS.register_user_via_db],
  }),
  validateUserAuth: new Agent({
    name: "validate_user_db_agent",
    instructions: AGENT_INSTRUCTIONS.validateUserAuth,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.validateUserAuth,
    tools: [AGENT_TOOLS.validate_user_db],
  }),
  insertEvent: new Agent({
    name: "insert_event_agent",
    instructions: AGENT_INSTRUCTIONS.insertEvent,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.insertEvent,
    tools: [AGENT_TOOLS.insert_event],
  }),
  getEventByIdOrName: new Agent({
    instructions: AGENT_INSTRUCTIONS.getEventByIdOrName,
    name: "get_event_by_name_agent",
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.getEventByIdOrName,
    tools: [AGENT_TOOLS.get_event],
  }),
  updateEventByIdOrName: new Agent({
    instructions: AGENT_INSTRUCTIONS.updateEventByIdOrName,
    name: "update_event_by_id_agent",
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.updateEventByIdOrName,
    tools: [AGENT_TOOLS.update_event],
  }),
  deleteEventByIdOrName: new Agent({
    name: "delete_event_by_id_agent",
    instructions: AGENT_INSTRUCTIONS.deleteEventByIdOrName,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.deleteEventByIdOrName,
    tools: [AGENT_TOOLS.delete_event],
  }),
  analysesCalendarTypeByEventInformation: new Agent({
    name: "analyses_calendar_type_by_event_agent",
    instructions: AGENT_INSTRUCTIONS.analysesCalendarTypeByEventInformation,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: AGENT_HANDOFFS.analysesCalendarTypeByEventInformation,
    tools: [AGENT_TOOLS.calendar_type],
  }),
  prepareEventAgent: new Agent({
    name: "prepare_event_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.prepareEventAgent,
    modelSettings: { toolChoice: "required" },
    tools: [AGENT_TOOLS.get_user_default_timezone, AGENT_TOOLS.validate_event_fields],
  }),
};

export const HANDS_OFF_AGENTS = {
  insertEventHandOffAgent: new Agent({
    name: "insert_event_handoff_agent",
    model: CURRENT_MODEL,

    modelSettings: { parallelToolCalls: true },
    instructions: AGENT_INSTRUCTIONS.insertEventHandOffAgent,
    tools: [
      AGENTS.prepareEventAgent.asTool({ toolName: "prepare_event" }),
      AGENTS.analysesCalendarTypeByEventInformation.asTool({ toolName: "calendar_type_by_event_details" }),
      AGENTS.insertEvent.asTool({ toolName: "insert_event" }),
    ],
  }),
  updateEventOrEventsHandOffAgent: new Agent({
    name: "update_event_handoff_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.updateEventByIdOrNameHandOffAgent,
    modelSettings: { toolChoice: "required" },
    tools: [AGENTS.getEventByIdOrName.asTool({ toolName: "get_event" }), AGENTS.updateEventByIdOrName.asTool({ toolName: "update_event" })],
  }),
  deleteEventOrEventsHandOffAgent: new Agent({
    name: "delete_event_handoff_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.deleteEventByIdOrNameHandOffAgent,

    tools: [AGENTS.getEventByIdOrName.asTool({ toolName: "get_event" }), AGENTS.deleteEventByIdOrName.asTool({ toolName: "delete_event" })],
  }),
};

export const QUICK_RESPONSE_AGENT = new Agent({
  name: "quick_response_agent",
  model: MODELS.GPT_4O_MINI, // Use fast model for quick acknowledgments
  instructions: AGENT_INSTRUCTIONS.quickResponseAgent,
  // No tools needed - just provides quick text responses
});

export const ORCHESTRATOR_AGENT = new Agent({
  name: "calendar_orchestrator_agent",
  model: CURRENT_MODEL,
  modelSettings: { parallelToolCalls: true },
  instructions: AGENT_INSTRUCTIONS.orchestratorAgent,
  tools: [
    HANDS_OFF_AGENTS.insertEventHandOffAgent.asTool({ toolName: "insert_event_handoff_agent" }),
    AGENTS.getEventByIdOrName.asTool({ toolName: "get_event" }),
    HANDS_OFF_AGENTS.updateEventOrEventsHandOffAgent.asTool({ toolName: "update_event_handoff_agent" }),
    HANDS_OFF_AGENTS.deleteEventOrEventsHandOffAgent.asTool({ toolName: "delete_event_handoff_agent" }),
    AGENTS.validateUserAuth.asTool({ toolName: "validate_user_auth" }),
    AGENTS.generateUserCbGoogleUrl.asTool({ toolName: "generate_user_cb_google_url" }),
    AGENT_TOOLS.get_agent_name,
    AGENT_TOOLS.set_agent_name,
    AGENT_TOOLS.get_user_routines,
    AGENT_TOOLS.get_upcoming_predictions,
    AGENT_TOOLS.suggest_optimal_time,
    AGENT_TOOLS.get_routine_insights,
    AGENT_TOOLS.set_user_goal,
    AGENT_TOOLS.get_goal_progress,
    AGENT_TOOLS.get_schedule_statistics,
  ],
});
