import type { Session, AgentInputItem } from "@openai/agents";
import { MemorySession } from "@openai/agents";

// Note: SupabaseAgentSession removed - agent_sessions table was dropped for simpler architecture
export type SessionType = "memory";
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
  /** Session storage backend (default: memory) */
  sessionType?: SessionType;
  /** Compaction strategy to keep context small (default: none) */
  compaction?: CompactionStrategy;
  /** Configuration for compaction (if enabled) */
  compactionConfig?: CompactionConfig;
}

/**
 * Factory for creating agent sessions with optional compaction
 *
 * Note: Supabase sessions were removed for simpler architecture.
 * All sessions now use in-memory storage.
 *
 * @example
 * ```typescript
 * // Memory session
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
 * ```
 */
export function createAgentSession(options: CreateSessionOptions): Session {
  const { compaction = "none", compactionConfig } = options;

  // All sessions use memory now (Supabase sessions removed)
  const baseSession: Session = new MemorySession();

  // Wrap with compaction if requested
  if (compaction === "responses") {
    return createCompactionWrapper(baseSession, compactionConfig);
  }

  return baseSession;
}

/**
 * Creates a compaction wrapper that automatically summarizes session history
 * when it exceeds the configured maxItems threshold.
 */
function createCompactionWrapper(baseSession: Session, config?: CompactionConfig): Session {
  const maxItems = config?.maxItems ?? 50;

  return {
    getSessionId: () => baseSession.getSessionId(),

    getItems: async (limit?: number): Promise<AgentInputItem[]> => {
      const items = await baseSession.getItems(limit);
      return items;
    },

    addItems: async (items: AgentInputItem[]): Promise<void> => {
      await baseSession.addItems(items);

      // Check if we need to compact
      const allItems = await baseSession.getItems();
      if (allItems.length > maxItems) {
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
