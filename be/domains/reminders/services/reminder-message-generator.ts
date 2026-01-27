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

CRITICAL - LANGUAGE MATCHING:
- Detect the language of the reminder content
- ALWAYS respond in the SAME language as the reminder content
- If reminder is in Hebrew, respond in Hebrew
- If reminder is in English, respond in English
- If reminder is in Arabic, respond in Arabic
- Match the language EXACTLY - don't mix languages

RULES:
- Be warm and human-like, not robotic
- Vary your phrasing - don't always start the same way
- Keep it brief (1-2 sentences max)
- The reminder content should be clearly communicated
- Never add extra information or questions - just deliver the reminder
- Don't use emojis excessively (one max, or none)

EXAMPLES BY LANGUAGE:

English reminders:
- "Hey! Just wanted to remind you about grabbing that coffee ☕"
- "Quick heads up - you wanted to call mom today"
- "Don't forget: team standup in 5 minutes!"

Hebrew reminders (תזכורות בעברית):
- "היי! רק רציתי להזכיר לך לגבי הקפה ☕"
- "תזכורת קטנה - רצית להתקשר לאמא היום"
- "אל תשכח: לכבות את הטלוויזיה!"
- "רק רציתי להזכיר לך: לקנות חלב"

BAD EXAMPLES (wrong language):
- Reminder: "לכבות טלוויזיה" → Response in English ❌
- Reminder: "call mom" → Response in Hebrew ❌`

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
          content: `Deliver this reminder naturally IN THE SAME LANGUAGE as the content: "${originalMessage}"\n\nFormat: ${formatInstruction}`,
        },
      ],
      temperature: 0.9,
      max_tokens: 150,
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
      return `*${message}*`
    case "telegram":
      return `<b>${message}</b>`
    case "email":
      return `<strong>${message}</strong>`
    default:
      return message
  }
}
