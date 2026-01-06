import { logger } from "@/utils/logger";

const MAX_PROMPT_LENGTH = 3500;
const MAX_CONTEXT_LENGTH = 2500;

const truncateContext = (context: string, maxLength: number): string => {
  if (context.length <= maxLength) {
    return context;
  }

  const truncated = context.slice(-maxLength);
  const firstNewline = truncated.indexOf("\n");

  if (firstNewline > 0 && firstNewline < 200) {
    return `[Earlier context truncated...]\n${truncated.slice(firstNewline + 1)}`;
  }

  return `[Earlier context truncated...]\n${truncated}`;
};

export const buildAgentPrompt = (email: string | undefined, message: string): string => {
  const timestamp = new Date().toISOString();
  return `Current date and time is ${timestamp}. User ${email} requesting for help with: ${message}`;
};

export const buildAgentPromptWithContext = (email: string | undefined, message: string, conversationContext?: string): string => {
  const timestamp = new Date().toISOString();
  const parts: string[] = [];

  parts.push(`Current date and time is ${timestamp}.`);
  parts.push(`User: ${email}`);

  if (conversationContext) {
    const truncatedContext = truncateContext(conversationContext, MAX_CONTEXT_LENGTH);
    parts.push(`\n--- Conversation History ---\n${truncatedContext}\n--- End History ---`);
  }

  parts.push(`\nCurrent request: ${message}`);

  let result = parts.join("\n");

  if (result.length > MAX_PROMPT_LENGTH) {
    logger.warn(`Prompt exceeded ${MAX_PROMPT_LENGTH} chars (${result.length}), truncating context further`);
    const baseLength = result.length - (conversationContext?.length || 0);
    const availableForContext = MAX_PROMPT_LENGTH - baseLength - 100;

    if (availableForContext > 200 && conversationContext) {
      const truncatedContext = truncateContext(conversationContext, availableForContext);
      parts[2] = `\n--- Conversation History ---\n${truncatedContext}\n--- End History ---`;
      result = parts.join("\n");
    } else {
      parts.splice(2, 1);
      result = parts.join("\n");
    }
  }

  return result;
};

export const buildConfirmationPrompt = (firstName: string, email: string | undefined, eventData: unknown): string => {
  const timestamp = new Date().toISOString();
  return `Current date and time is ${timestamp}. User ${firstName} with the email ${email} confirmed the creation of event despite conflicts. Create the event now with these details: ${JSON.stringify(
    eventData
  )}`;
};
