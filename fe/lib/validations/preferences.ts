import { z } from 'zod'

/**
 * Validation schema for Ally's Brain custom instructions
 * Max 1000 characters - error shown only when limit is reached
 */
export const allyBrainSchema = z.object({
  enabled: z.boolean(),
  instructions: z.string().max(1000, 'Instructions must be 1000 characters or less'),
})

/**
 * Validation schema for contextual scheduling preference
 */
export const contextualSchedulingSchema = z.object({
  enabled: z.boolean(),
})

export type AllyBrainFormData = z.infer<typeof allyBrainSchema>
export type ContextualSchedulingFormData = z.infer<typeof contextualSchedulingSchema>

/**
 * Default values for Ally's Brain form
 */
export const allyBrainDefaults: AllyBrainFormData = {
  enabled: false,
  instructions: '',
}

/**
 * Placeholder text for Ally's Brain textarea
 */
export const ALLY_BRAIN_PLACEHOLDER = `Example: I prefer morning meetings between 9-11am. My work days are Sunday through Thursday. Always add a 15-minute buffer between meetings. I take lunch at 1pm for an hour. When scheduling with clients, prefer video calls over in-person meetings.`
