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
  logger.info(`Telegram Bot: Summarize: Formatting messages for summary: ${messages.length}`);
  return messages
    .map((msg) => {
      const role = msg.role === "user" ? "User" : "Assistant";
      return `${role}: ${msg.content || ""}`;
    })
    .join("\n");
};

// Summarize conversation messages using AI
export const summarizeMessages = async (messages: userAndAiMessageProps[]): Promise<string> => {
  logger.info(`Telegram Bot: Summarize: Summarizing messages: ${messages.length}`);
  if (messages.length === 0) {
    logger.info(`Telegram Bot: Summarize: No messages to summarize`);
    return "";
  }

  const formattedMessages = formatMessagesForSummary(messages);
  logger.info(`Telegram Bot: Summarize: Formatted messages: ${formattedMessages}`);
  const fullPrompt = `${SUMMARIZATION_PROMPT}\n\n${formattedMessages}`;
  logger.info(`Telegram Bot: Summarize: Full prompt: ${fullPrompt}`);

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
    logger.info(`Telegram Bot: Summarize: Summary: ${summary}`);

    if (!summary) {
      logger.error(`Telegram Bot: Summarize: No summary generated`);
      throw new Error("No summary generated");
    }

    logger.info(`Telegram Bot: Summarize: Summary generated: ${summary}`);
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
  logger.info(`Telegram Bot: Summarize: User messages: ${userMessages.length}`);
  const topics = userMessages
    .slice(0, 3)
    .map((m) => m.content?.slice(0, 50))
    .filter(Boolean);
  logger.info(`Telegram Bot: Summarize: Topics: ${topics.length}`);
  if (topics.length === 0) {
    logger.info(`Telegram Bot: Summarize: No topics found`);
    return "Previous conversation context available.";
  }

  logger.info(`Telegram Bot: Summarize: Fallback summary: ${topics.join("; ")}...`);
  const fallbackSummary = `Previous topics discussed: ${topics.join("; ")}...`;
  logger.info(`Telegram Bot: Summarize: Fallback summary: ${fallbackSummary}`);
  return fallbackSummary;
};

const TITLE_GENERATION_PROMPT = `Generate a very short title (max 5 words) for this conversation based on the user's first message.
The title should capture the main topic or intent. Do not use quotes or punctuation. Just return the title text.

User's message:`;

// Generate a short title for a conversation using AI (cheapest model)
export const generateConversationTitle = async (firstUserMessage: string): Promise<string> => {
  logger.info(`Telegram Bot: Summarize: Generating conversation title: ${firstUserMessage}`);
  if (!firstUserMessage?.trim()) {
    logger.info(`Telegram Bot: Summarize: No user message found`);
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
    logger.info(`Telegram Bot: Summarize: Clean title: ${cleanTitle}`);
    return cleanTitle || "New Conversation";
  } catch (error) {
    logger.error(`Telegram Bot: Summarize: Error generating conversation title: ${error}`);
    console.error("Error generating conversation title:", error);
    // Fallback: use truncated first message
    const truncated = firstUserMessage.slice(0, 47);
    logger.info(`Telegram Bot: Summarize: Truncated: ${truncated}`);
    const result = truncated.length < firstUserMessage.length ? `${truncated}...` : truncated;
    logger.info(`Telegram Bot: Summarize: Result: ${result}`);
    return result;
  }
};
