import { run } from "@grammyjs/runner";
import { Bot, type Context, type SessionFlavor, session } from "grammy";
import { ORCHESTRATOR_AGENT } from "@/ai-agents/agents";
import { CONFIG, SUPABASE } from "@/config/root-config";
import type { SessionData } from "@/types";
import { activateAgent } from "@/utils/activateAgent";
import { authTgHandler } from "./middleware/auth-tg-handler";
import { ConversationMemoryService } from "@/services/ConversationMemoryService";
import { VectorSearchService } from "@/services/VectorSearchService";
import { RoutineLearningService } from "@/services/RoutineLearningService";

export type GlobalContext = SessionFlavor<SessionData> & Context;

const bot = new Bot<GlobalContext>(CONFIG.telegramAccessToken);

// Initialize services
const conversationMemoryService = new ConversationMemoryService(SUPABASE);
const vectorSearchService = new VectorSearchService(SUPABASE);

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`, err.error);
});

bot.use(
  session({
    initial: (): SessionData => {
      return {
        chatId: 0,
        codeLang: undefined,
        email: undefined,
        messageCount: 0,
        userId: 0,
        username: undefined,
        lastProcessedMsgId: 0,
        agentActive: false,
      };
    },
  })
);

bot.use(authTgHandler);

/**
 * Get user_id from email or chat_id
 */
async function getUserId(email?: string, chatId?: number): Promise<string | null> {
  try {
    // Try to get user_id from email first using user_calendar_tokens
    if (email) {
      const { data: tokenData } = await SUPABASE.from("user_calendar_tokens").select("user_id").eq("email", email).maybeSingle();

      if (tokenData?.user_id) {
        return tokenData.user_id;
      }
    }

    // Try to get user_id from telegram link
    if (chatId) {
      const { data: linkData } = await SUPABASE.from("user_telegram_links").select("email").eq("chat_id", chatId).maybeSingle();

      // If we have email from link, try to get user_id from user_calendar_tokens
      if (linkData?.email) {
        const { data: tokenData } = await SUPABASE.from("user_calendar_tokens").select("user_id").eq("email", linkData.email).maybeSingle();

        if (tokenData?.user_id) {
          return tokenData.user_id;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting user_id:", error);
    return null;
  }
}

bot.on("message", async (ctx) => {
  const msgId = ctx.message.message_id;
  const userMsgText = ctx.message.text?.trim();

  if (userMsgText?.includes("/start")) {
    return;
  }

  // de-dupe: process each message once
  if (ctx.session.lastProcessedMsgId === msgId) {
    return;
  }
  ctx.session.lastProcessedMsgId = msgId;

  // guard: ignore non-text updates
  if (!userMsgText) {
    return;
  }

  // start/stop "loop" via session flag; no while(true)
  if (!ctx.session.agentActive) {
    ctx.session.agentActive = true;
    await ctx.reply("Agent is running in background...");
    await ctx.reply("Type /exit to stop.");
  }

  if (userMsgText.toLowerCase() === "/exit") {
    ctx.session.agentActive = false;
    await ctx.reply("Conversation ended.");
    return;
  }

  if (!ctx.session.agentActive) {
    return;
  }

  try {
    // Get user_id for conversation memory
    const userId = await getUserId(ctx.session.email, ctx.session.chatId);
    const chatId = ctx.session.chatId;

    // Store user message in conversation memory
    if (userId && chatId) {
      await conversationMemoryService.storeMessage(userId, chatId, msgId, "user", userMsgText, {
        timestamp: new Date().toISOString(),
        username: ctx.session.username,
      });
    }

    // Get conversation context
    let conversationContext = "";
    let vectorSearchResults = "";

    if (userId && chatId) {
      try {
        // Get conversation context
        const context = await conversationMemoryService.getConversationContext(userId, chatId);
        conversationContext = conversationMemoryService.formatContextForPrompt(context);

        // Perform vector search for similar conversations
        try {
          const queryEmbedding = await vectorSearchService.generateEmbedding(userMsgText);
          const similarConversations = await vectorSearchService.searchSimilarConversations(userId, queryEmbedding, 3, 0.6);

          if (similarConversations.length > 0) {
            vectorSearchResults = similarConversations
              .map((result, index) => `${index + 1}. ${result.content} (similarity: ${result.similarity.toFixed(2)})`)
              .join("\n");
          }
        } catch (vectorError) {
          console.error("Vector search error (non-critical):", vectorError);
          // Continue without vector search results
        }
      } catch (memoryError) {
        console.error("Conversation memory error (non-critical):", memoryError);
        // Continue without conversation context
      }
    }

    // Get agent name if available
    let agentName = null;
    if (userId && chatId) {
      try {
        agentName = await conversationMemoryService.getAgentName(userId, chatId);
      } catch (error) {
        console.error("Failed to get agent name (non-critical):", error);
        // Continue without agent name
      }
    }

    // Check for predicted events to proactively mention
    let predictedEventsContext = "";
    if (userId) {
      try {
        const routineService = new RoutineLearningService(SUPABASE);

        // Get predictions for next 7 days
        const predictions = await routineService.predictUpcomingEvents(userId, 7);

        // Filter high-confidence predictions for next 2 days
        const relevantPredictions = predictions
          .filter((p) => {
            const predictedTime = new Date(p.predicted_start);
            const daysUntil = (predictedTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
            return p.confidence >= 0.7 && daysUntil >= 0 && daysUntil <= 2;
          })
          .slice(0, 3); // Limit to 3 most relevant

        if (relevantPredictions.length > 0) {
          const predictionsText = relevantPredictions
            .map((p) => {
              const date = new Date(p.predicted_start);
              const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
              const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
              return `- ${p.summary} (predicted for ${dateStr} at ${timeStr}, ${Math.round(p.confidence * 100)}% confidence)`;
            })
            .join("\n");

          predictedEventsContext = `\n\n**Proactive Reminders - Predicted Upcoming Events:**\nBased on your routine patterns, I've detected these likely upcoming events:\n${predictionsText}\n\nYou can proactively mention these to the user if relevant to the conversation. Ask them to confirm if these predictions are accurate.`;
        }
      } catch (error) {
        console.error("Failed to get predicted events (non-critical):", error);
        // Continue without predictions
      }
    }

    // Show typing indicator
    await ctx.api.sendChatAction(ctx.chat.id, "typing");

    // Build prompt with agent name context
    let agentNameContext = "";
    if (agentName) {
      agentNameContext = `\n\nYour name is "${agentName}" - use this name when introducing yourself or signing off.`;
    }

    // Activate agent with context and auto-routing enabled
    const { finalOutput } = await activateAgent(
      ORCHESTRATOR_AGENT,
      `Current date and time is ${new Date().toISOString()}. User ${
        ctx.session.email || "unknown"
      } requesting for help with: ${userMsgText}${agentNameContext}${predictedEventsContext}`,
      {
        conversationContext: conversationContext || undefined,
        vectorSearchResults: vectorSearchResults || undefined,
        agentName: agentName || undefined,
      },
      {
        autoRoute: true, // Enable automatic model routing based on task analysis
      }
    );

    const agentResponse = finalOutput || "No output received from AI Agent.";

    // Store assistant response in conversation memory
    if (userId && chatId) {
      await conversationMemoryService.storeMessage(
        userId,
        chatId,
        msgId + 1, // Use next message ID for assistant response
        "assistant",
        agentResponse,
        {
          timestamp: new Date().toISOString(),
          agent: "orchestrator",
        }
      );

      // Store conversation embedding for future searches
      try {
        const conversationText = `User: ${userMsgText}\nAssistant: ${agentResponse}`;
        const embedding = await vectorSearchService.generateEmbedding(conversationText);
        await vectorSearchService.storeConversationEmbedding({
          user_id: userId,
          chat_id: chatId,
          message_id: msgId,
          content: conversationText,
          embedding,
          metadata: {
            user_message: userMsgText,
            assistant_response: agentResponse,
          },
        });
      } catch (embeddingError) {
        console.error("Failed to store conversation embedding (non-critical):", embeddingError);
        // Continue without storing embedding
      }
    }

    await ctx.reply(agentResponse);
  } catch (e) {
    console.error("Agent error:", e);
    await ctx.reply("Error processing your request. Please try again.");
  }
});

export const startTelegramBot = () => {
  run(bot);
};
