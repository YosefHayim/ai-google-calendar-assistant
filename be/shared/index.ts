export {
  type CalendarReference,
  type ContextSnapshot,
  type ConversationContext,
  type EventReference,
  entityTracker,
  type Modality as ContextModality,
  type TrackedCalendar,
  type TrackedEvent,
  type UserPreferencesContext,
  unifiedContextStore,
} from "./context";

export {
  type ChatParams,
  type ChatResponse,
  createAnthropicProvider,
  createGoogleProvider,
  createOpenAIProvider,
  type LLMProvider,
  type Message,
  type MessageRole,
  type ProviderConfig,
  type StreamChunk,
  type ToolCall,
  type ToolDefinition,
} from "./llm";

export {
  type CreateTextAgentOptions,
  createTextAgent,
  type Modality as TextModality,
  type RunTextAgentOptions,
  runTextAgent,
  type StreamEvent,
  type TextAgentConfig,
} from "./orchestrator";

export {
  AUTH_CONTEXT,
  buildBasePrompt,
  buildOrchestratorPrompt,
  CORE_BEHAVIOR,
  CORE_CAPABILITIES,
  CORE_IDENTITY,
  ERROR_HANDLING,
  INTENT_RECOGNITION,
  RESPONSE_STYLE,
  TIME_INFERENCE,
} from "./prompts";

export {
  type AnalyzeGapsResult,
  analyzeGapsHandler,
  type ConflictCheckResult,
  checkConflictsHandler,
  deleteEventHandler,
  type FillGapResult,
  type FormatGapsResult,
  fillGapHandler,
  formatGapsHandler,
  type GapCandidateDTO,
  getCalendarCategoriesByEmail,
  getEventHandler,
  getTimezoneHandler,
  type HandlerContext,
  insertEventHandler,
  type PreCreateValidationResult,
  preCreateValidationHandler,
  type SelectCalendarResult,
  selectCalendarHandler,
  type TimezoneResult,
  type UserCalendar,
  updateEventHandler,
  type ValidateUserResult,
  validateUserHandler,
} from "./tools/handlers";

export {
  executeTool,
  executeTools,
  getAvailableToolNames,
  isToolAvailable,
  type ToolExecutionResult,
  type ToolExecutorContext,
} from "./tools/tool-executor";

export {
  type AgentContext as SharedAgentContext,
  type ConflictCheckResult as SharedConflictCheckResult,
  type ConflictingEvent,
  categorizeError,
  type HandlerContext as SharedHandlerContext,
  type Modality,
  type ProjectionMode,
  stringifyError,
} from "./types";
