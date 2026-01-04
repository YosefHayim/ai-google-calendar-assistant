import { MODELS } from "@/config/constants/ai";
import OpenAI from "openai";
import { env } from "@/config";
import { logger } from "@/utils/logger";
import type { userAndAiMessageProps } from "@/types";

const openai = new OpenAI({ apiKey: env.openAiApiKey });

const SUMMARIZATION_MODEL = MODELS.GPT_4_1_NANO;

const SUMMARIZATION_PROMPT = `You are a conversation summarizer. Your task is to create a concise summary of the conversation below.

Focus on:
- Key requests and actions taken
- Important decisions or outcomes
- Any pending items or follow-ups
- Calendar events mentioned (with dates/times if available)

Keep the summary brief but informative. Use bullet points for clarity.
Do not include greetings or pleasantries. Focus on actionable information.

Conversation to summarize:`;

// Format messages for summarization
const formatMessagesForSummary = (messages: userAndAiMessageProps[]): string => {
  return messages
    .map((msg) => {
      const role = msg.role === "user" ? "User" : "Assistant";
      return `${role}: ${msg.content || ""}`;
    })
    .join("\n");
};

// Summarize conversation messages using AI
export const summarizeMessages = async (messages: userAndAiMessageProps[]): Promise<string> => {
  if (messages.length === 0) {
    return "";
  }

  const formattedMessages = formatMessagesForSummary(messages);
  const fullPrompt = `${SUMMARIZATION_PROMPT}\n\n${formattedMessages}`;

  try {
    const response = await openai.chat.completions.create({
      model: SUMMARIZATION_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes conversations concisely.",
        },
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      // max_tokens: 300,
      temperature: 0.3,
    });

    const summary = response.choices[0]?.message?.content?.trim();

    if (!summary) {
      logger.error(`Telegram Bot: Summarize: No summary generated`);
      throw new Error("No summary generated");
    }
    return summary;
  } catch (error) {
    logger.error(`Telegram Bot: Summarize: Error summarizing messages: ${error}`);
    console.error("Error summarizing messages:", error);
    // Fallback: create a simple summary
    return createFallbackSummary(messages);
  }
};

// Fallback summary when AI fails
const createFallbackSummary = (messages: userAndAiMessageProps[]): string => {
  const userMessages = messages.filter((m) => m.role === "user");
  const topics = userMessages
    .slice(0, 3)
    .map((m) => m.content?.slice(0, 50))
    .filter(Boolean);
  if (topics.length === 0) {
    return "Previous conversation context available.";
  }
  const fallbackSummary = `Previous topics discussed: ${topics.join("; ")}...`;
  return fallbackSummary;
};

const TITLE_GENERATION_PROMPT = `Generate a very short title (max 5 words) for this conversation based on the user's first message.
The title should capture the main topic or intent. Do not use quotes or punctuation. Just return the title text.

User's message:`;

// Generate a short title for a conversation using AI (cheapest model)
export const generateConversationTitle = async (firstUserMessage: string): Promise<string> => {
  if (!firstUserMessage?.trim()) {
    return "New Conversation";
  }

  try {
    const response = await openai.chat.completions.create({
      model: SUMMARIZATION_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates very short, descriptive titles for conversations.",
        },
        {
          role: "user",
          content: `${TITLE_GENERATION_PROMPT}\n\n${firstUserMessage.slice(0, 200)}`,
        },
      ],
      max_tokens: 20,
      temperature: 0.3,
    });

    const title = response.choices[0]?.message?.content?.trim();

    if (!title) {
      logger.error(`Telegram Bot: Summarize: No title generated`);
      throw new Error("No title generated");
    }

    // Clean up the title - remove quotes and limit length
    const cleanTitle = title.replace(/^["']|["']$/g, "").slice(0, 50);
    return cleanTitle || "New Conversation";
  } catch (error) {
    logger.error(`Telegram Bot: Summarize: Error generating conversation title: ${error}`);
    console.error("Error generating conversation title:", error);
    // Fallback: use truncated first message
    const truncated = firstUserMessage.slice(0, 47);
    const result = truncated.length < firstUserMessage.length ? `${truncated}...` : truncated;
    return result;
  }
};
