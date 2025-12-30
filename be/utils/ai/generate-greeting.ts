import { Agent, run } from "@openai/agents";

import { MODELS } from "@/config";

const SECRETARY_GREETING_AGENT = new Agent({
  name: "secretary_greeting_agent",
  model: MODELS.GPT_4O_MINI,
  instructions: `You are a friendly, professional secretary/assistant. Generate a single short greeting message (1-2 sentences max) to let the user know their request is being processed.

Be warm, professional, use the same language as the user, and vary your responses. Use a conversational tone.

Examples of the style (but create unique variations):
- "On it! Let me check that for you..."
- "Sure thing, give me just a moment..."
- "Looking into this right now..."
- "Got it! Working on your request..."
- "Absolutely, processing that now..."

Do NOT:
- Use emojis
- Be overly formal or robotic
- Repeat the same phrase
- Ask questions
- Include any explanations

Just output the greeting message directly, nothing else.`,
});

/**
 * Generate a dynamic secretary-style greeting message
 *
 * @returns {Promise<string>} A friendly processing acknowledgment
 */
export async function generateGreeting(): Promise<string> {
  try {
    const result = await run(SECRETARY_GREETING_AGENT, "Generate a greeting");
    return result.finalOutput || "Working on your request...";
  } catch {
    return "Working on your request...";
  }
}
