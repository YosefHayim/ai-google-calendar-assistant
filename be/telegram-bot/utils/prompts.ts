import { logger } from "@/utils/logger";

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
    parts.push(`\n--- Conversation History ---\n${conversationContext}\n--- End History ---`);
  }

  parts.push(`\nCurrent request: ${message}`);
  return parts.join("\n");
};

export const buildConfirmationPrompt = (firstName: string, email: string | undefined, eventData: unknown): string => {
  const timestamp = new Date().toISOString();
  return `Current date and time is ${timestamp}. User ${firstName} with the email ${email} confirmed the creation of event despite conflicts. Create the event now with these details: ${JSON.stringify(
    eventData
  )}`;
};
