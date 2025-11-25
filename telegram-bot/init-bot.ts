import { run } from "@grammyjs/runner";
import { Bot, type Context, type SessionFlavor, session, InputFile } from "grammy";
import { ORCHESTRATOR_AGENT } from "@/ai-agents/agents";
import { CONFIG, SUPABASE } from "@/config/root-config";
import type { SessionData } from "@/types";
import { activateAgent } from "@/utils/activateAgent";
import { authTgHandler } from "./middleware/auth-tg-handler";
import { ConversationMemoryService } from "@/services/ConversationMemoryService";
import { VectorSearchService } from "@/services/VectorSearchService";
import { RoutineLearningService } from "@/services/RoutineLearningService";
import { VoiceAgentService } from "@/utils/voice/voiceAgentService";

export type GlobalContext = SessionFlavor<SessionData> & Context;

const bot = new Bot<GlobalContext>(CONFIG.telegramAccessToken);

// Initialize services
const conversationMemoryService = new ConversationMemoryService(SUPABASE);
const vectorSearchService = new VectorSearchService(SUPABASE);
const voiceAgentService = new VoiceAgentService();

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

// Handle voice messages
bot.on("message:voice", async (ctx) => {
  const msgId = ctx.message.message_id;
  const voice = ctx.message.voice;

  if (!voice) {
    return;
  }

  // de-dupe: process each message once
  if (ctx.session.lastProcessedMsgId === msgId) {
    return;
  }
  ctx.session.lastProcessedMsgId = msgId;

  // start/stop "loop" via session flag
  if (!ctx.session.agentActive) {
    ctx.session.agentActive = true;
  }

  if (!ctx.session.agentActive) {
    return;
  }

  // Declare typing interval outside to ensure it's accessible in catch block
  let typingInterval: NodeJS.Timeout | null = null;

  try {
    // Send "uploading voice" action
    await ctx.api.sendChatAction(ctx.chat.id, "upload_voice");

    // Get user_id for conversation memory
    const userId = await getUserId(ctx.session.email, ctx.session.chatId);
    const chatId = ctx.session.chatId;

    // Get language code directly from Telegram message context (ctx.from.language_code)
    // Fallback to session.codeLang (set in auth middleware) or default to "en"
    const languageCode = ctx.from?.language_code || ctx.session.codeLang || "en";
    // Download the voice file
    const file = await ctx.api.getFile(voice.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${CONFIG.telegramAccessToken}/${file.file_path}`;
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to download voice file: ${response.statusText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    // Get conversation context for voice agent
    let conversationContext = "";
    let vectorSearchResults = "";

    if (userId && chatId) {
      try {
        const context = await conversationMemoryService.getConversationContext(userId, chatId);
        conversationContext = conversationMemoryService.formatContextForPrompt(context);
      } catch (memoryError) {
        console.error("Conversation memory error (non-critical):", memoryError);
      }
    }

    // Get agent name if available
    let agentName = null;
    if (userId && chatId) {
      try {
        agentName = await conversationMemoryService.getAgentName(userId, chatId);
      } catch (error) {
        console.error("Failed to get agent name (non-critical):", error);
      }
    }

    // Start recording voice action
    const startRecordingAction = async () => {
      await ctx.api.sendChatAction(ctx.chat.id, "record_voice");
      typingInterval = setInterval(async () => {
        try {
          await ctx.api.sendChatAction(ctx.chat.id, "record_voice");
        } catch (error) {
          // Ignore errors
        }
      }, 4000);
    };

    await startRecordingAction();

    // Process voice message with voice agent (using language code)
    let voiceResult;
    try {
      voiceResult = await voiceAgentService.processVoiceMessage(
        audioBuffer,
        {
          conversationContext: conversationContext || undefined,
          vectorSearchResults: vectorSearchResults || undefined,
          agentName: agentName || undefined,
          chatId: chatId || undefined,
          email: ctx.session.email || undefined,
        },
        languageCode
      );
    } finally {
      if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
      }
    }

    const transcribedText = voiceResult.transcribedText;
    const voiceResponseBuffer = voiceResult.voiceResponseBuffer;
    const textResponse = voiceResult.textResponse;

    // Store user message (transcribed text) in conversation memory
    if (userId && chatId && transcribedText) {
      await conversationMemoryService.storeMessage(userId, chatId, msgId, "user", transcribedText, {
        timestamp: new Date().toISOString(),
        username: ctx.session.username,
        messageType: "voice",
      });
    }

    // Voice message → Voice response: User sent voice, so we reply with voice
    // Priority: Voice response > Text response (only fallback if voice generation fails)
    if (voiceResponseBuffer && voiceResponseBuffer.length > 0) {
      // Send voice response (user sent voice, so we reply with voice)
      await ctx.api.sendVoice(ctx.chat.id, new InputFile(voiceResponseBuffer, "response.ogg"), {
        caption: textResponse || transcribedText ? `Transcribed: ${transcribedText}` : undefined,
      });
    } else if (textResponse) {
      // Fallback: If voice generation failed, send text response
      // This should be rare - voice generation should normally succeed
      await ctx.reply(textResponse);
    } else if (transcribedText) {
      // If we have transcription but no response, acknowledge
      await ctx.reply(`I heard: "${transcribedText}". Processing your request...`);
    } else {
      await ctx.reply("I received your voice message, but couldn't process it. Please try again.");
    }

    // Store assistant response in conversation memory
    if (userId && chatId && (textResponse || voiceResponseBuffer)) {
      await conversationMemoryService.storeMessage(userId, chatId, msgId + 1, "assistant", textResponse || "[Voice response]", {
        timestamp: new Date().toISOString(),
        agent: "voice_orchestrator",
        messageType: voiceResponseBuffer ? "voice" : "text",
      });
    }
  } catch (e) {
    // Stop typing indicator on error
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
    console.error("Voice agent error:", e);
    await ctx.reply("Error processing your voice message. Please try again or send a text message.");
  }
});

bot.on("message", async (ctx) => {
  const msgId = ctx.message.message_id;
  const userMsgText = ctx.message.text?.trim();

  // Skip if this is a voice message (handled separately)
  if (ctx.message.voice) {
    return;
  }

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

  // guard: check message length limit (10,000 characters)
  const MAX_MESSAGE_LENGTH = 10_000;
  if (userMsgText.length > MAX_MESSAGE_LENGTH) {
    await ctx.reply("Message is too long, please shorten it.");
    return;
  }

  // start/stop "loop" via session flag; no while(true)
  if (!ctx.session.agentActive) {
    ctx.session.agentActive = true;
  }

  if (userMsgText.toLowerCase() === "/exit") {
    ctx.session.agentActive = false;
    await ctx.reply("Conversation ended.");
    return;
  }

  if (!ctx.session.agentActive) {
    return;
  }

  // Declare typing interval outside to ensure it's accessible in catch block
  let typingInterval: NodeJS.Timeout | null = null;

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

    // Build prompt with agent name context
    let agentNameContext = "";
    if (agentName) {
      agentNameContext = `\n\nYour name is "${agentName}" - use this name when introducing yourself or signing off.`;
    }

    // Start typing indicator and keep it active while LLM processes
    const startTypingIndicator = async () => {
      await ctx.api.sendChatAction(ctx.chat.id, "typing");
      // Keep typing indicator active every 4 seconds (Telegram typing indicators last ~5 seconds)
      typingInterval = setInterval(async () => {
        try {
          await ctx.api.sendChatAction(ctx.chat.id, "typing");
        } catch (error) {
          // Ignore errors (chat might be closed, etc.)
        }
      }, 4000);
    };

    await startTypingIndicator();

    // Activate main orchestrator agent with context and auto-routing enabled
    let finalOutput: string;
    try {
      const result = await activateAgent(
        ORCHESTRATOR_AGENT,
        `Current date and time is ${new Date().toISOString()}. User ${
          ctx.session.email || "unknown"
        } requesting for help with: ${userMsgText}${agentNameContext}${predictedEventsContext}`,
        {
          conversationContext: conversationContext || undefined,
          vectorSearchResults: vectorSearchResults || undefined,
          agentName: agentName || undefined,
          chatId: chatId || undefined,
          email: ctx.session.email || undefined,
        },
        {
          autoRoute: true, // Enable automatic model routing based on task analysis
        }
      );
      finalOutput = result.finalOutput || "No output received from AI Agent.";
    } finally {
      // Stop typing indicator once response is ready
      if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
      }
    }

    const agentResponse = finalOutput;

    // Text message → Text response: User sent text, so we reply with text
    // We never generate voice responses for text messages - only text replies
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
          messageType: "text", // Explicitly mark as text response
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
    // Stop typing indicator on error
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
    console.error("Agent error:", e);
    await ctx.reply("Error processing your request. Please try again.");
  }
});

export const startTelegramBot = () => {
  run(bot);
};
