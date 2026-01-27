import OpenAI from "openai"
import { MODELS } from "@/config/constants/ai"
import { env } from "@/config/env"
import { logger } from "@/lib/logger"

const client = new OpenAI({ apiKey: env.openAiApiKey })

export type ReminderFormat = "whatsapp" | "telegram" | "slack" | "email"

const FORMAT_INSTRUCTIONS: Record<ReminderFormat, string> = {
  whatsapp: "Use *text* for bold emphasis. Keep it casual and friendly.",
  telegram: "Use <b>text</b> for bold emphasis. Keep it casual and friendly.",
  slack: "Use *text* for bold emphasis. Keep it casual and friendly.",
  email:
    "This will be used in an HTML email. Use <strong>text</strong> for emphasis. Slightly more formal but still warm.",
}

const SYSTEM_PROMPT = `You are a friendly AI assistant named Ally. Your job is to deliver reminders in a natural, conversational way - like a helpful friend or personal secretary would.

RULES:
- Be warm and human-like, not robotic
- Vary your phrasing - don't always start the same way
- Keep it brief (1-2 sentences max)
- The reminder content should be clearly communicated
- Match the time of day if provided (morning greeting, evening check-in, etc.)
- Never add extra information or questions - just deliver the reminder
- Don't use emojis excessively (one max, or none)

GOOD EXAMPLES:
- "Hey! Just wanted to remind you about grabbing that coffee ☕"
- "Quick heads up - you wanted to call mom today"
- "Don't forget: team standup in 5 minutes!"
- "Psst... time to take a break and stretch"
- "This is your reminder to check on the deployment"

BAD EXAMPLES (too robotic):
- "Reminder: coffee"
- "This is a reminder about: call mom"
- "🔔 Reminder notification: team standup"`

export async function generateReminderMessage(
  originalMessage: string,
  format: ReminderFormat
): Promise<string> {
  const formatInstruction = FORMAT_INSTRUCTIONS[format]

  try {
    const response = await client.chat.completions.create({
      model: MODELS.GPT_4_1_NANO,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Deliver this reminder naturally: "${originalMessage}"\n\nFormat: ${formatInstruction}`,
        },
      ],
      temperature: 0.9,
      max_tokens: 100,
    })

    const generated = response.choices[0]?.message?.content?.trim()

    if (generated) {
      return generated
    }

    return getFallbackMessage(originalMessage, format)
  } catch (error) {
    logger.error("AI reminder generation failed, using fallback:", error)
    return getFallbackMessage(originalMessage, format)
  }
}

function getFallbackMessage(message: string, format: ReminderFormat): string {
  switch (format) {
    case "whatsapp":
    case "slack":
      return `Hey! Just a friendly reminder: *${message}*`
    case "telegram":
      return `Hey! Just a friendly reminder: <b>${message}</b>`
    case "email":
      return `Hey! Just a friendly reminder: <strong>${message}</strong>`
    default:
      return `Hey! Just a friendly reminder: ${message}`
  }
}
