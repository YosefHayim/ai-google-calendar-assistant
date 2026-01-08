import type { ToolCall } from "@/shared/llm/types"
import type { HandlerContext } from "./handlers"
import {
  getEventHandler,
  insertEventHandler,
  updateEventHandler,
  deleteEventHandler,
  validateUserHandler,
  getTimezoneHandler,
  selectCalendarHandler,
  checkConflictsHandler,
  preCreateValidationHandler,
  analyzeGapsHandler,
  fillGapHandler,
  formatGapsHandler,
} from "./handlers"

export interface ToolExecutorContext extends HandlerContext {}

export interface ToolExecutionResult {
  toolCallId: string
  name: string
  result: unknown
  error?: string
}

type ParamsAndCtxHandler = (params: unknown, ctx: ToolExecutorContext) => Promise<unknown>
type CtxOnlyHandler = (ctx: ToolExecutorContext) => Promise<unknown>
type SyncHandler = (params: unknown) => unknown

const PARAMS_AND_CTX_HANDLERS: Record<string, ParamsAndCtxHandler> = {
  get_event: getEventHandler as ParamsAndCtxHandler,
  get_event_direct: getEventHandler as ParamsAndCtxHandler,
  insert_event: insertEventHandler as ParamsAndCtxHandler,
  insert_event_direct: insertEventHandler as ParamsAndCtxHandler,
  update_event: updateEventHandler as ParamsAndCtxHandler,
  delete_event: deleteEventHandler as ParamsAndCtxHandler,
  select_calendar_direct: selectCalendarHandler as ParamsAndCtxHandler,
  check_conflicts_direct: checkConflictsHandler as ParamsAndCtxHandler,
  pre_create_validation: preCreateValidationHandler as ParamsAndCtxHandler,
  analyze_gaps_direct: analyzeGapsHandler as ParamsAndCtxHandler,
  fill_gap_direct: fillGapHandler as ParamsAndCtxHandler,
}

const CTX_ONLY_HANDLERS: Record<string, CtxOnlyHandler> = {
  validate_user_direct: validateUserHandler as CtxOnlyHandler,
  get_timezone_direct: getTimezoneHandler as CtxOnlyHandler,
}

const SYNC_HANDLERS: Record<string, SyncHandler> = {
  format_gaps_display: formatGapsHandler as SyncHandler,
}

export async function executeTool(
  toolCall: ToolCall,
  ctx: ToolExecutorContext
): Promise<ToolExecutionResult> {
  const paramsAndCtxHandler = PARAMS_AND_CTX_HANDLERS[toolCall.name]
  const ctxOnlyHandler = CTX_ONLY_HANDLERS[toolCall.name]
  const syncHandler = SYNC_HANDLERS[toolCall.name]

  if (!paramsAndCtxHandler && !ctxOnlyHandler && !syncHandler) {
    const availableTools = [
      ...Object.keys(PARAMS_AND_CTX_HANDLERS),
      ...Object.keys(CTX_ONLY_HANDLERS),
      ...Object.keys(SYNC_HANDLERS),
    ]
    return {
      toolCallId: toolCall.id,
      name: toolCall.name,
      result: null,
      error: `Unknown tool: ${toolCall.name}. Available: ${availableTools.join(", ")}`,
    }
  }

  try {
    const params = JSON.parse(toolCall.arguments)
    let result: unknown
    if (paramsAndCtxHandler) {
      result = await paramsAndCtxHandler(params, ctx)
    } else if (ctxOnlyHandler) {
      result = await ctxOnlyHandler(ctx)
    } else {
      result = syncHandler(params)
    }
    return {
      toolCallId: toolCall.id,
      name: toolCall.name,
      result,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      toolCallId: toolCall.id,
      name: toolCall.name,
      result: null,
      error: `Tool ${toolCall.name} failed: ${errorMessage}`,
    }
  }
}

export async function executeTools(
  toolCalls: ToolCall[],
  ctx: ToolExecutorContext
): Promise<ToolExecutionResult[]> {
  return Promise.all(toolCalls.map((tc) => executeTool(tc, ctx)))
}

export function getAvailableToolNames(): string[] {
  return [
    ...Object.keys(PARAMS_AND_CTX_HANDLERS),
    ...Object.keys(CTX_ONLY_HANDLERS),
    ...Object.keys(SYNC_HANDLERS),
  ]
}

export function isToolAvailable(name: string): boolean {
  return (
    name in PARAMS_AND_CTX_HANDLERS ||
    name in CTX_ONLY_HANDLERS ||
    name in SYNC_HANDLERS
  )
}
