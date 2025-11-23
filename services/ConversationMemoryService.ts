import { Logger } from "./logging/Logger";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationSummary {
  summary_text: string;
  message_count: number;
  first_message_id: number;
  last_message_id: number;
  metadata?: Record<string, unknown>;
}

export interface ConversationContext {
  recentMessages: ConversationMessage[];
  summaries: ConversationSummary[];
  totalMessageCount: number;
}

/**
 * Service for managing conversation memory with summarization
 * Implements sliding window approach: keeps last 2 messages in full, summarizes older messages
 */
export class ConversationMemoryService {
  private client: SupabaseClient;
  private logger: Logger;
  private readonly SUMMARY_INTERVAL = 3; // Summarize every 3 messages
  private readonly RECENT_MESSAGE_COUNT = 2; // Keep last 2 messages in full detail

  constructor(client: SupabaseClient) {
    this.client = client;
    this.logger = new Logger("ConversationMemoryService");
  }

  /**
   * Store a new message in the conversation
   */
  async storeMessage(
    user_id: string,
    chat_id: number,
    message_id: number,
    role: "user" | "assistant" | "system",
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      // Store the message
      const { error: messageError } = await this.client.from("conversation_messages").insert({
        user_id,
        chat_id,
        message_id,
        role,
        content,
        metadata: metadata ?? {},
      });

      if (messageError) {
        throw messageError;
      }

      // Update conversation state
      await this.updateConversationState(user_id, chat_id, message_id);

      // Check if we need to create a summary (every 3 messages)
      const state = await this.getConversationState(user_id, chat_id);
      if (state && state.message_count > 0 && state.message_count % this.SUMMARY_INTERVAL === 0) {
        await this.createSummary(user_id, chat_id);
      }

      this.logger.debug(`Stored message ${message_id} for chat ${chat_id}`);
    } catch (error) {
      this.logger.error("Failed to store message", error);
      throw error;
    }
  }

  /**
   * Get conversation context for agent prompts
   * Returns recent messages + summaries in a format suitable for LLM context
   */
  async getConversationContext(user_id: string, chat_id: number): Promise<ConversationContext> {
    try {
      // Get recent messages (last 2)
      const { data: recentMessages, error: messagesError } = await this.client
        .from("conversation_messages")
        .select("role, content, metadata")
        .eq("user_id", user_id)
        .eq("chat_id", chat_id)
        .order("created_at", { ascending: false })
        .limit(this.RECENT_MESSAGE_COUNT);

      if (messagesError) {
        throw messagesError;
      }

      // Get all summaries
      const { data: summaries, error: summariesError } = await this.client
        .from("conversation_summaries")
        .select("summary_text, message_count, first_message_id, last_message_id, metadata")
        .eq("user_id", user_id)
        .eq("chat_id", chat_id)
        .order("created_at", { ascending: true });

      if (summariesError) {
        throw summariesError;
      }

      // Get total message count from state
      const state = await this.getConversationState(user_id, chat_id);

      return {
        recentMessages: (recentMessages ?? []).reverse().map((msg) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
          metadata: msg.metadata as Record<string, unknown> | undefined,
        })),
        summaries: (summaries ?? []).map((sum) => ({
          summary_text: sum.summary_text,
          message_count: sum.message_count,
          first_message_id: sum.first_message_id,
          last_message_id: sum.last_message_id,
          metadata: sum.metadata as Record<string, unknown> | undefined,
        })),
        totalMessageCount: state?.message_count ?? 0,
      };
    } catch (error) {
      this.logger.error("Failed to get conversation context", error);
      throw error;
    }
  }

  /**
   * Format conversation context as a string for LLM prompts
   */
  formatContextForPrompt(context: ConversationContext): string {
    const parts: string[] = [];

    if (context.summaries.length > 0) {
      parts.push("## Previous Conversation Summary");
      context.summaries.forEach((summary, index) => {
        parts.push(`\n### Summary ${index + 1} (${summary.message_count} messages)`);
        parts.push(summary.summary_text);
      });
    }

    if (context.recentMessages.length > 0) {
      parts.push("\n## Recent Messages");
      context.recentMessages.forEach((msg) => {
        parts.push(`\n${msg.role.toUpperCase()}: ${msg.content}`);
      });
    }

    return parts.join("\n");
  }

  /**
   * Create a summary of the last N messages
   * This should be called with an LLM to generate the actual summary
   */
  async createSummary(user_id: string, chat_id: number): Promise<void> {
    try {
      // Get messages that haven't been summarized yet
      const state = await this.getConversationState(user_id, chat_id);
      if (!state) {
        this.logger.warn(`No conversation state found for chat ${chat_id}`);
        return;
      }

      const lastSummarizedId = state.last_summarized_at ? await this.getLastSummarizedMessageId(user_id, chat_id) : null;

      // Get messages since last summary (or all messages if no summary exists)
      let query = this.client
        .from("conversation_messages")
        .select("id, role, content")
        .eq("user_id", user_id)
        .eq("chat_id", chat_id)
        .order("created_at", { ascending: true });

      if (lastSummarizedId) {
        query = query.gt("id", lastSummarizedId);
      }

      const { data: messages, error } = await query.limit(this.SUMMARY_INTERVAL);

      if (error) {
        throw error;
      }

      if (!messages || messages.length === 0) {
        this.logger.debug("No messages to summarize");
        return;
      }

      // Generate summary using LLM (this is a placeholder - should call actual LLM)
      const summaryText = await this.generateSummary(messages);

      // Store the summary
      const firstMessageId = messages[0]?.id ?? 0;
      const lastMessageId = messages[messages.length - 1]?.id ?? 0;

      const { error: summaryError } = await this.client.from("conversation_summaries").insert({
        user_id,
        chat_id,
        summary_text: summaryText,
        message_count: messages.length,
        first_message_id: firstMessageId,
        last_message_id: lastMessageId,
        metadata: {
          summarized_at: new Date().toISOString(),
        },
      });

      if (summaryError) {
        throw summaryError;
      }

      // Update conversation state
      await this.updateConversationState(user_id, chat_id, lastMessageId, true);

      this.logger.debug(`Created summary for chat ${chat_id} covering ${messages.length} messages`);
    } catch (error) {
      this.logger.error("Failed to create summary", error);
      throw error;
    }
  }

  /**
   * Generate summary text from messages using LLM
   * TODO: Implement actual LLM call
   */
  private async generateSummary(messages: Array<{ role: string; content: string }>): Promise<string> {
    // This is a placeholder - in production, you would call an LLM API
    // For now, return a simple concatenation
    const conversationText = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n");

    // TODO: Call LLM API to generate actual summary
    // Example:
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4',
    //     messages: [
    //       { role: 'system', content: 'Summarize this conversation, preserving key information, user intent, and preferences.' },
    //       { role: 'user', content: conversationText },
    //     ],
    //   }),
    // });
    // const data = await response.json();
    // return data.choices[0].message.content;

    // Placeholder summary
    return `Previous conversation: ${conversationText.substring(0, 200)}...`;
  }

  /**
   * Get or create conversation state
   */
  private async getConversationState(
    user_id: string,
    chat_id: number
  ): Promise<{
    message_count: number;
    last_summarized_at: string | null;
    last_message_id: number | null;
  } | null> {
    try {
      const { data, error } = await this.client
        .from("conversation_state")
        .select("message_count, last_summarized_at, last_message_id")
        .eq("user_id", user_id)
        .eq("chat_id", chat_id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Not found - create new state
          return await this.createConversationState(user_id, chat_id);
        }
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error("Failed to get conversation state", error);
      throw error;
    }
  }

  /**
   * Create new conversation state
   */
  private async createConversationState(
    user_id: string,
    chat_id: number
  ): Promise<{
    message_count: number;
    last_summarized_at: string | null;
    last_message_id: number | null;
  }> {
    try {
      const { data, error } = await this.client
        .from("conversation_state")
        .insert({
          user_id,
          chat_id,
          message_count: 0,
          last_summarized_at: null,
          last_message_id: null,
        })
        .select("message_count, last_summarized_at, last_message_id")
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error("Failed to create conversation state", error);
      throw error;
    }
  }

  /**
   * Update conversation state
   */
  private async updateConversationState(user_id: string, chat_id: number, last_message_id: number, wasSummarized = false): Promise<void> {
    try {
      const state = await this.getConversationState(user_id, chat_id);
      const newCount = (state?.message_count ?? 0) + 1;

      const { error } = await this.client.from("conversation_state").upsert({
        user_id,
        chat_id,
        message_count: newCount,
        last_message_id,
        last_summarized_at: wasSummarized ? new Date().toISOString() : state?.last_summarized_at ?? null,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      this.logger.error("Failed to update conversation state", error);
      throw error;
    }
  }

  /**
   * Get the last summarized message ID
   */
  private async getLastSummarizedMessageId(user_id: string, chat_id: number): Promise<number | null> {
    try {
      const { data, error } = await this.client
        .from("conversation_summaries")
        .select("last_message_id")
        .eq("user_id", user_id)
        .eq("chat_id", chat_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data?.last_message_id ?? null;
    } catch (error) {
      this.logger.error("Failed to get last summarized message ID", error);
      return null;
    }
  }

  /**
   * Clear conversation history for a chat
   */
  async clearConversation(user_id: string, chat_id: number): Promise<void> {
    try {
      // Delete messages
      await this.client.from("conversation_messages").delete().eq("user_id", user_id).eq("chat_id", chat_id);

      // Delete summaries
      await this.client.from("conversation_summaries").delete().eq("user_id", user_id).eq("chat_id", chat_id);

      // Delete state
      await this.client.from("conversation_state").delete().eq("user_id", user_id).eq("chat_id", chat_id);

      this.logger.debug(`Cleared conversation for chat ${chat_id}`);
    } catch (error) {
      this.logger.error("Failed to clear conversation", error);
      throw error;
    }
  }
}
