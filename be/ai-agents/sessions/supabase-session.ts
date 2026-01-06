import type { AgentInputItem, Session } from "@openai/agents";
import type { Tables, TablesInsert } from "@/database.types";

import { SUPABASE } from "@/config/clients/supabase";
import { logger } from "@/utils/logger";

type ItemWithType = { type?: string; role?: string; id?: string };

/**
 * Check if an item is a reasoning item (internal model reasoning from GPT-5/o1/o3 models)
 */
const isReasoningItem = (item: AgentInputItem): boolean => {
  const typedItem = item as ItemWithType;
  // Check both type field and ID prefix (reasoning items have IDs like "rs_xxx")
  return typedItem.type === "reasoning" || (typedItem.id?.startsWith("rs_") ?? false);
};

const isMessageItem = (item: AgentInputItem): boolean => {
  const typedItem = item as ItemWithType;
  return typedItem.type === "message" || (typedItem.id?.startsWith("msg_") ?? false);
};

const isToolCallItem = (item: AgentInputItem): boolean => {
  const typedItem = item as ItemWithType;
  return (
    typedItem.type === "function_call" ||
    typedItem.type === "computer_call" ||
    typedItem.type === "tool_call" ||
    (typedItem.id?.startsWith("fc_") ?? false) ||
    (typedItem.id?.startsWith("cc_") ?? false)
  );
};

/**
 * OpenAI API has a bidirectional constraint for reasoning items (GPT-5/o1/o3 models):
 * 1. Reasoning items (rs_xxx) must be immediately followed by their output item
 * 2. Message items (msg_xxx) produced WITH reasoning require their preceding reasoning item
 *
 * Errors this prevents:
 * - "Item 'rs_xxx' of type 'reasoning' was provided without its required following item."
 * - "Item 'msg_xxx' of type 'message' was provided without its required 'reasoning' item: 'rs_xxx'."
 *
 * Strategy: Remove ALL reasoning items and ALL assistant messages with msg_ IDs.
 * Only keep: user messages (no msg_ prefix), tool calls, and function outputs.
 * This is aggressive but safe - it clears any reasoning-dependent state.
 */
function filterReasoningItems(items: AgentInputItem[]): AgentInputItem[] {
  if (!items?.length) return [];

  let removedCount = 0;
  const filtered = items.filter((item) => {
    const typedItem = item as ItemWithType;

    if (isReasoningItem(item)) {
      logger.warn(`SupabaseSession: Filtering reasoning item (id: ${typedItem.id || "unknown"})`);
      removedCount++;
      return false;
    }

    if (isMessageItem(item) && typedItem.role === "assistant") {
      logger.warn(`SupabaseSession: Filtering assistant message that may require reasoning (id: ${typedItem.id || "unknown"})`);
      removedCount++;
      return false;
    }

    return true;
  });

  if (removedCount > 0) {
    logger.info(`SupabaseSession: Filtered ${removedCount} reasoning-related item(s) from session history`);
  }

  return filtered;
}

const AGENT_SESSIONS_TABLE = "agent_sessions";

type AgentSessionRow = Tables<"agent_sessions">;
type AgentSessionInsert = TablesInsert<"agent_sessions">;

export interface SupabaseSessionOptions {
  sessionId: string;
  userId: string;
  agentName: string;
}

/**
 * Custom Supabase-backed Session for OpenAI Agents SDK
 *
 * Implements the 5 required async methods from the Session interface:
 * - getSessionId(): Get the unique session identifier
 * - getItems(): Retrieve all session items
 * - addItems(): Add new items to the session
 * - popItem(): Remove and return the last item
 * - clearSession(): Clear all session data
 *
 * @example
 * ```typescript
 * const session = new SupabaseAgentSession({
 *   sessionId: 'user123:parse_event_text:task456',
 *   userId: 'user123',
 *   agentName: 'parse_event_text_agent'
 * });
 *
 * const result = await run(agent, prompt, { session });
 * ```
 */
export class SupabaseAgentSession implements Session {
  private sessionId: string;
  private userId: string;
  private agentName: string;
  private itemsCache: AgentInputItem[] | null = null;

  constructor(options: SupabaseSessionOptions) {
    this.sessionId = options.sessionId;
    this.userId = options.userId;
    this.agentName = options.agentName;
  }

  /**
   * Generate a unique session ID for a user-agent combination
   *
   * @param userId - The user's unique identifier
   * @param agentName - The agent's name
   * @param taskId - Optional task/conversation ID for isolation
   * @returns Formatted session ID string
   *
   * @example
   * // Per-user session (agent remembers across all tasks)
   * SupabaseAgentSession.generateSessionId('user123', 'parse_event_text_agent')
   * // Returns: 'user123:parse_event_text_agent'
   *
   * // Per-task session (isolated per conversation)
   * SupabaseAgentSession.generateSessionId('user123', 'parse_event_text_agent', 'conv456')
   * // Returns: 'user123:parse_event_text_agent:conv456'
   */
  static generateSessionId(userId: string, agentName: string, taskId?: string): string {
    const base = `${userId}:${agentName}`;
    return taskId ? `${base}:${taskId}` : base;
  }

  async getSessionId(): Promise<string> {
    return this.sessionId;
  }

  async getItems(limit?: number): Promise<AgentInputItem[]> {
    if (this.itemsCache !== null) {
      const items = filterReasoningItems(this.itemsCache);
      return limit ? items.slice(-limit) : items;
    }

    try {
      const { data, error } = await SUPABASE.from(AGENT_SESSIONS_TABLE)
        .select("items")
        .eq("session_id", this.sessionId)
        .eq("user_id", this.userId)
        .eq("agent_name", this.agentName)
        .maybeSingle();

      if (error) {
        logger.error(`SupabaseSession: Error fetching items: ${error.message}`);
        return [];
      }

      const rawItems = (data?.items as AgentInputItem[]) || [];
      this.itemsCache = filterReasoningItems(rawItems);
      return limit ? this.itemsCache.slice(-limit) : this.itemsCache;
    } catch (err) {
      logger.error(`SupabaseSession: Exception fetching items: ${err}`);
      return [];
    }
  }

  async addItems(items: AgentInputItem[]): Promise<void> {
    const existingItems = await this.getItems();
    const filteredNewItems = filterReasoningItems(items);
    const newItems = [...existingItems, ...filteredNewItems];

    try {
      const insertData: AgentSessionInsert = {
        session_id: this.sessionId,
        user_id: this.userId,
        agent_name: this.agentName,
        items: newItems as unknown as AgentSessionRow["items"],
        updated_at: new Date().toISOString(),
      };

      const { error } = await SUPABASE.from(AGENT_SESSIONS_TABLE).upsert(insertData, {
        onConflict: "session_id,user_id,agent_name",
      });

      if (error) {
        logger.error(`SupabaseSession: Error adding items: ${error.message}`);
        throw error;
      }

      this.itemsCache = newItems;
    } catch (err) {
      logger.error(`SupabaseSession: Exception adding items: ${JSON.stringify(err)}`);
      throw err;
    }
  }

  async popItem(): Promise<AgentInputItem | undefined> {
    const items = await this.getItems();
    if (items.length === 0) return undefined;

    const poppedItem = items.pop();

    try {
      const { error } = await SUPABASE.from(AGENT_SESSIONS_TABLE)
        .update({
          items: items as unknown as AgentSessionRow["items"],
          updated_at: new Date().toISOString(),
        })
        .eq("session_id", this.sessionId)
        .eq("user_id", this.userId)
        .eq("agent_name", this.agentName);

      if (error) {
        logger.error(`SupabaseSession: Error popping item: ${error.message}`);
        throw error;
      }

      this.itemsCache = items;
      return poppedItem;
    } catch (err) {
      logger.error(`SupabaseSession: Exception popping item: ${err}`);
      throw err;
    }
  }

  async clearSession(): Promise<void> {
    try {
      const { error } = await SUPABASE.from(AGENT_SESSIONS_TABLE)
        .delete()
        .eq("session_id", this.sessionId)
        .eq("user_id", this.userId)
        .eq("agent_name", this.agentName);

      if (error) {
        logger.error(`SupabaseSession: Error clearing session: ${error.message}`);
        throw error;
      }

      this.itemsCache = [];
    } catch (err) {
      logger.error(`SupabaseSession: Exception clearing session: ${err}`);
      throw err;
    }
  }

  /**
   * Get the number of items in the session (utility method)
   */
  async getItemCount(): Promise<number> {
    const items = await this.getItems();
    return items.length;
  }

  /**
   * Invalidate the cache to force a fresh fetch
   */
  invalidateCache(): void {
    this.itemsCache = null;
  }
}
