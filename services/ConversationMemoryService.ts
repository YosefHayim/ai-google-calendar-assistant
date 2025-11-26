import type { Json } from "@/database.types";
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
   * Uses upsert to handle duplicate message_id gracefully
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
      // Use upsert to handle duplicate message_id gracefully
      // If message already exists, update it (in case content changed)
      const { error: messageError } = await this.client.from("conversation_messages").upsert(
        {
          user_id,
          chat_id,
          message_id,
          role,
          content,
          metadata: metadata ?? {},
        },
        {
          onConflict: "chat_id,message_id",
          ignoreDuplicates: false, // Update if exists
        }
      );

      if (messageError) {
        // Check if it's a duplicate key error (shouldn't happen with upsert, but handle it)
        if (messageError.code === "23505") {
          this.logger.debug(`Message ${message_id} for chat ${chat_id} already exists, skipping`);
          return; // Message already stored, no need to throw
        }
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
      // If it's a duplicate key error, log and return (don't throw)
      if (error && typeof error === "object" && "code" in error && error.code === "23505") {
        this.logger.debug(`Message ${message_id} for chat ${chat_id} already exists, skipping`);
        return;
      }
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

    const formattedContext = parts.join("\n");

    // Log context statistics for debugging
    const charCount = formattedContext.length;
    const approxTokenCount = Math.ceil(charCount / 4); // Rough estimate: ~4 chars per token
    this.logger.info("Context formatted for prompt", {
      recentMessagesCount: context.recentMessages.length,
      summariesCount: context.summaries.length,
      totalMessageCount: context.totalMessageCount,
      contextCharCount: charCount,
      contextApproxTokens: approxTokenCount,
    });

    return formattedContext;
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
   */
  private async generateSummary(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const apiKey = process.env.OPEN_API_KEY || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        this.logger.warn("OpenAI API key not found, using placeholder summary");
        const conversationText = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n");
        return `Previous conversation: ${conversationText.substring(0, 200)}...`;
      }

      const conversationText = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n");

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Using mini for cost efficiency
          messages: [
            {
              role: "system",
              content:
                "Summarize this conversation concisely, preserving key information, user intent, preferences, and important context. Keep it brief but informative.",
            },
            { role: "user", content: conversationText },
          ],
          temperature: 0.3, // Lower temperature for more consistent summaries
          max_tokens: 200, // Limit summary length
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        this.logger.error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
        // Fallback to simple summary
        return `Previous conversation: ${conversationText.substring(0, 200)}...`;
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response from OpenAI API");
      }

      return data.choices[0].message.content as string;
    } catch (error) {
      this.logger.error("Failed to generate summary, using fallback", error);
      // Fallback to simple concatenation
      const conversationText = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n");
      return `Previous conversation: ${conversationText.substring(0, 200)}...`;
    }
  }

  /**
   * Get agent name from conversation metadata
   */
  async getAgentName(user_id: string, chat_id: number): Promise<string | null> {
    try {
      const { data, error } = await this.client.from("conversation_state").select("metadata").eq("user_id", user_id).eq("chat_id", chat_id).maybeSingle();

      if (error) {
        throw error;
      }

      if (data?.metadata && typeof data.metadata === "object" && "agent_name" in data.metadata) {
        return data.metadata.agent_name as string;
      }

      return null;
    } catch (error) {
      this.logger.error("Failed to get agent name", error);
      throw error;
    }
  }

  /**
   * Set agent name in conversation metadata
   */
  async setAgentName(user_id: string, chat_id: number, agent_name: string): Promise<void> {
    try {
      // Get current metadata or create new state
      const state = await this.getConversationState(user_id, chat_id);

      const currentMetadata = (state?.metadata as Record<string, unknown> | null) || {};
      const updatedMetadata = {
        ...currentMetadata,
        agent_name: agent_name.trim(),
        agent_name_updated_at: new Date().toISOString(),
      };

      // Try upsert with onConflict first
      const { error: upsertError } = await this.client.from("conversation_state").upsert(
        {
          user_id,
          chat_id,
          metadata: updatedMetadata,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,chat_id" }
      );

      // If upsert fails due to missing constraint, use update/insert pattern
      if (upsertError && upsertError.code === "42P10") {
        // Check if record exists
        const { data: existing } = await this.client.from("conversation_state").select("id").eq("user_id", user_id).eq("chat_id", chat_id).maybeSingle();

        if (existing) {
          // Update existing record
          const { error: updateError } = await this.client
            .from("conversation_state")
            .update({
              metadata: updatedMetadata,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user_id)
            .eq("chat_id", chat_id);

          if (updateError) {
            throw updateError;
          }
        } else {
          // Insert new record
          const { error: insertError } = await this.client.from("conversation_state").insert({
            user_id,
            chat_id,
            metadata: updatedMetadata,
            updated_at: new Date().toISOString(),
          });

          if (insertError) {
            throw insertError;
          }
        }
      } else if (upsertError) {
        throw upsertError;
      }

      this.logger.debug(`Set agent name to "${agent_name}" for user ${user_id}, chat ${chat_id}`);
    } catch (error) {
      this.logger.error("Failed to set agent name", error);
      throw error;
    }
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
    metadata: Json | null;
  } | null> {
    try {
      const { data, error } = await this.client
        .from("conversation_state")
        .select("message_count, last_summarized_at, last_message_id, metadata")
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
    metadata: Json | null;
  }> {
    try {
      // First try to get existing state
      const existing = await this.getConversationState(user_id, chat_id);
      if (existing) {
        return existing;
      }

      // If not exists, try insert
      const { data: insertData, error: insertError } = await this.client
        .from("conversation_state")
        .insert({
          user_id,
          chat_id,
          message_count: 0,
          last_summarized_at: null,
          last_message_id: null,
          metadata: null,
        })
        .select("message_count, last_summarized_at, last_message_id, metadata")
        .single();

      if (!insertError && insertData) {
        return insertData;
      }

      // If insert failed (e.g., duplicate), try to get the existing record
      if (insertError && insertError.code === "23505") {
        // Unique violation - record exists, fetch it
        const existingAfterInsert = await this.getConversationState(user_id, chat_id);
        if (existingAfterInsert) {
          return existingAfterInsert;
        }
      }

      // If we have a unique constraint, try upsert
      try {
        const { data: upsertData, error: upsertError } = await this.client
          .from("conversation_state")
          .upsert(
            {
              user_id,
              chat_id,
              message_count: 0,
              last_summarized_at: null,
              last_message_id: null,
              metadata: null,
            },
            {
              onConflict: "user_id,chat_id",
            }
          )
          .select("message_count, last_summarized_at, last_message_id, metadata")
          .single();

        if (upsertError) {
          throw upsertError;
        }

        if (upsertData) {
          return upsertData;
        }
      } catch (upsertError: unknown) {
        // If upsert fails due to missing constraint, fall back to insert/select pattern
        this.logger.warn("Upsert failed, using insert/select pattern", { error: upsertError });
      }

      // Final fallback: try to get state one more time
      const finalState = await this.getConversationState(user_id, chat_id);
      if (finalState) {
        return finalState;
      }

      throw new Error("Failed to create or retrieve conversation state");
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

      // Try upsert with onConflict first
      const { error: upsertError } = await this.client.from("conversation_state").upsert(
        {
          user_id,
          chat_id,
          message_count: newCount,
          last_message_id,
          last_summarized_at: wasSummarized ? new Date().toISOString() : state?.last_summarized_at ?? null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,chat_id",
        }
      );

      // If upsert fails due to missing constraint, use update/insert pattern
      if (upsertError && upsertError.code === "42P10") {
        // Check if record exists
        const { data: existing } = await this.client.from("conversation_state").select("id").eq("user_id", user_id).eq("chat_id", chat_id).maybeSingle();

        if (existing) {
          // Update existing record
          const { error: updateError } = await this.client
            .from("conversation_state")
            .update({
              message_count: newCount,
              last_message_id,
              last_summarized_at: wasSummarized ? new Date().toISOString() : state?.last_summarized_at ?? null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user_id)
            .eq("chat_id", chat_id);

          if (updateError) {
            throw updateError;
          }
        } else {
          // Insert new record
          const { error: insertError } = await this.client.from("conversation_state").insert({
            user_id,
            chat_id,
            message_count: newCount,
            last_message_id,
            last_summarized_at: wasSummarized ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          });

          if (insertError) {
            throw insertError;
          }
        }
      } else if (upsertError) {
        throw upsertError;
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
