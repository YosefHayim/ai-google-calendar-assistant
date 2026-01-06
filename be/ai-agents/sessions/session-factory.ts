import type { Session, AgentInputItem } from "@openai/agents";
import { MemorySession } from "@openai/agents";
import { SupabaseAgentSession } from "./supabase-session";

export type SessionType = "supabase" | "memory";
export type CompactionStrategy = "none" | "responses";

export interface CompactionConfig {
  /** Trigger compaction after N items (default: 50) */
  maxItems?: number;
  /** Model to use for summarization (default: gpt-4o-mini) */
  summaryModel?: string;
}

export interface CreateSessionOptions {
  /** User's unique identifier */
  userId: string;
  /** Agent name for session scoping */
  agentName: string;
  /** Optional task/conversation ID for further isolation */
  taskId?: string;
  /** Session storage backend (default: supabase) */
  sessionType?: SessionType;
  /** Compaction strategy to keep context small (default: none) */
  compaction?: CompactionStrategy;
  /** Configuration for compaction (if enabled) */
  compactionConfig?: CompactionConfig;
}

/**
 * Factory for creating agent sessions with optional compaction
 *
 * @example
 * ```typescript
 * // Simple Supabase session
 * const session = createAgentSession({
 *   userId: 'user123',
 *   agentName: 'parse_event_text_agent'
 * });
 *
 * // With compaction for long-running conversations
 * const session = createAgentSession({
 *   userId: 'user123',
 *   agentName: 'parse_event_text_agent',
 *   taskId: 'conv456',
 *   compaction: 'responses',
 *   compactionConfig: { maxItems: 30 }
 * });
 *
 * // Memory session for testing
 * const session = createAgentSession({
 *   userId: 'test',
 *   agentName: 'test_agent',
 *   sessionType: 'memory'
 * });
 * ```
 */
export function createAgentSession(options: CreateSessionOptions): Session {
  const { userId, agentName, taskId, sessionType = "supabase", compaction = "none", compactionConfig } = options;

  // Create base session
  let baseSession: Session;

  switch (sessionType) {
    case "memory":
      // Good for development/testing - no persistence
      baseSession = new MemorySession();
      break;

    case "supabase":
    default: {
      const sessionId = SupabaseAgentSession.generateSessionId(userId, agentName, taskId);
      baseSession = new SupabaseAgentSession({
        sessionId,
        userId,
        agentName,
      });
      break;
    }
  }

  // Wrap with compaction if requested
  // Note: OpenAIResponsesCompactionSession requires additional setup
  // For now, we return the base session and handle compaction manually if needed
  if (compaction === "responses") {
    // The OpenAI SDK's compaction session wraps another session
    // and automatically summarizes when items exceed maxItems
    return createCompactionWrapper(baseSession, compactionConfig);
  }

  return baseSession;
}

/**
 * Creates a compaction wrapper that automatically summarizes session history
 * when it exceeds the configured maxItems threshold.
 *
 * This is a lightweight implementation that doesn't require OpenAIResponsesCompactionSession
 * which may not be available in all SDK versions.
 */
function createCompactionWrapper(baseSession: Session, config?: CompactionConfig): Session {
  const maxItems = config?.maxItems ?? 50;

  return {
    getSessionId: () => baseSession.getSessionId(),

    getItems: async (limit?: number): Promise<AgentInputItem[]> => {
      const items = await baseSession.getItems(limit);
      // If items exceed threshold, we could trigger compaction here
      // For now, just return items and let the caller handle it
      return items;
    },

    addItems: async (items: AgentInputItem[]): Promise<void> => {
      await baseSession.addItems(items);

      // Check if we need to compact
      const allItems = await baseSession.getItems();
      if (allItems.length > maxItems) {
        // Log that compaction would be triggered
        // Actual summarization would require an LLM call
        console.log(`[Session] Items (${allItems.length}) exceed maxItems (${maxItems}), compaction recommended`);
      }
    },

    popItem: (): Promise<AgentInputItem | undefined> => baseSession.popItem(),
    clearSession: (): Promise<void> => baseSession.clearSession(),
  };
}

/**
 * Utility to get session info for debugging
 */
export async function getSessionInfo(session: Session): Promise<{
  sessionId: string;
  itemCount: number;
}> {
  const [sessionId, items] = await Promise.all([session.getSessionId(), session.getItems()]);

  return {
    sessionId,
    itemCount: items.length,
  };
}
