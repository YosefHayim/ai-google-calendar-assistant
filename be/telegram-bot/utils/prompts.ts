import { logger } from "@/utils/logger";

export const buildAgentPrompt = (email: string | undefined, message: string): string => {
  const timestamp = new Date().toISOString();
  return `Current date and time is ${timestamp}. User ${email} requesting for help with: ${message}`;
};

export const buildAgentPromptWithContext = (email: string | undefined, message: string, conversationContext?: string): string => {
  logger.info(`Telegram Bot: Prompts: Building agent prompt with context: ${email}, ${message}, ${conversationContext}`);
  const timestamp = new Date().toISOString();
  const parts: string[] = [];

  parts.push(`Current date and time is ${timestamp}.`);
  parts.push(`User: ${email}`);
  logger.info(`Telegram Bot: Prompts: User: ${email}`);

  if (conversationContext) {
    parts.push(`\n--- Conversation History ---\n${conversationContext}\n--- End History ---`);
    logger.info(`Telegram Bot: Prompts: Conversation history: ${conversationContext}`);
  }

  parts.push(`\nCurrent request: ${message}`);
  logger.info(`Telegram Bot: Prompts: Current request: ${message}`);
  logger.info(`Telegram Bot: Prompts: Parts: ${parts.join("\n")}`);
  return parts.join("\n");
};

export const buildConfirmationPrompt = (email: string | undefined, eventData: unknown): string => {
  logger.info(`Telegram Bot: Prompts: Building confirmation prompt: ${email}, ${eventData}`);
  const timestamp = new Date().toISOString();
  logger.info(`Telegram Bot: Prompts: Timestamp: ${timestamp}`);
  return `Current date and time is ${timestamp}. User ${email} CONFIRMED creation of event despite conflicts. Create the event now with these details: ${JSON.stringify(
    eventData
  )}`;
};
