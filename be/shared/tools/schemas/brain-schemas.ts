import { z } from "zod"

const MAX_PREFERENCE_LENGTH = 500

export const updateUserBrainSchema = z.object({
  preference: z
    .string({
      description:
        "The preference or rule to save. Must be a clear, concise statement. Example: 'Always keep Fridays free from meetings'",
    })
    .min(1, "Preference cannot be empty")
    .max(MAX_PREFERENCE_LENGTH, `Preference must be under ${MAX_PREFERENCE_LENGTH} characters`),
  category: z
    .string({
      description:
        "Optional category for organization. Examples: 'scheduling', 'communication', 'naming', 'general'",
    })
    .optional(),
  replacesExisting: z
    .string({
      description:
        "If this preference contradicts an existing one, provide the old rule text here to replace it",
    })
    .optional(),
})

export type UpdateUserBrainParams = z.infer<typeof updateUserBrainSchema>
