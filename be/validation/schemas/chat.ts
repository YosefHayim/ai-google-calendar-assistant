import { z } from "zod"

export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(10_000, "Message must be less than 10000 characters")
    .transform((msg) => msg.trim()),
  conversationId: z.number().int().positive().optional(),
  sessionId: z.string().uuid().optional(),
})
