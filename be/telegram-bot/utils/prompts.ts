import { logger } from "@/lib/logger";
import type { AllyBrainPreference } from "./ally-brain";

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

export const buildAgentPrompt = (
  email: string | undefined,
  message: string
): string => {
  const timestamp = new Date().toISOString();
  return `<context>
<timestamp>${timestamp}</timestamp>
<user>${email}</user>
</context>

<request>${message}</request>`;
};

type BuildPromptOptions = {
  allyBrain?: AllyBrainPreference | null;
  languageCode?: string;
  personalityNotes?: string;
};

export const buildAgentPromptWithContext = (
  email: string | undefined,
  message: string,
  conversationContext?: string,
  options?: BuildPromptOptions
): string => {
  const timestamp = new Date().toISOString();
  const parts: string[] = [];

  parts.push(
    "<platform>Telegram - Keep responses concise and mobile-friendly.</platform>"
  );

  if (options?.allyBrain?.enabled && options.allyBrain.instructions?.trim()) {
    parts.push(`<user_instructions>
${options.allyBrain.instructions}
</user_instructions>`);
  }

  parts.push(`<context>
<timestamp>${timestamp}</timestamp>
<user>${email}</user>
</context>`);

  if (options?.languageCode) {
    parts.push(
      `<language>User's preferred language is "${options.languageCode}". You MUST respond in this language.</language>`
    );
  }

  if (options?.personalityNotes) {
    parts.push(`<response_style>${options.personalityNotes}</response_style>`);
  }

  if (conversationContext) {
    const truncatedContext = truncateContext(
      conversationContext,
      MAX_CONTEXT_LENGTH
    );
    parts.push(`<conversation_history>
${truncatedContext}
</conversation_history>`);
  }

  parts.push(`<current_request>${message}</current_request>`);

  let result = parts.join("\n\n");

  if (result.length > MAX_PROMPT_LENGTH) {
    logger.warn(
      `Prompt exceeded ${MAX_PROMPT_LENGTH} chars (${result.length}), truncating context`
    );
    const baseLength = result.length - (conversationContext?.length || 0);
    const availableForContext = MAX_PROMPT_LENGTH - baseLength - 100;

    const historyIndex = parts.findIndex((p) =>
      p.includes("<conversation_history>")
    );

    if (availableForContext > 200 && conversationContext && historyIndex > -1) {
      const truncatedContext = truncateContext(
        conversationContext,
        availableForContext
      );
      parts[historyIndex] = `<conversation_history>
${truncatedContext}
</conversation_history>`;
      result = parts.join("\n\n");
    } else if (historyIndex > -1) {
      parts.splice(historyIndex, 1);
      result = parts.join("\n\n");
    }
  }

  return result;
};

export const buildConfirmationPrompt = (
  firstName: string,
  email: string | undefined,
  eventData: unknown
): string => {
  const timestamp = new Date().toISOString();
  return `<context>
<timestamp>${timestamp}</timestamp>
<user>${firstName} (${email})</user>
</context>

<task>User confirmed event creation despite conflicts. Create the event now.</task>

<event_data>
${JSON.stringify(eventData, null, 2)}
</event_data>`;
};
