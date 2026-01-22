import { z } from "zod"

const SEARCH_QUERY_MAX_LENGTH = 100
const SEARCH_DEFAULT_LIMIT = 10
const SEARCH_MAX_LIMIT = 50
const PAGINATION_DEFAULT_LIMIT = 20
const PAGINATION_MAX_LIMIT = 100
const DISPLAY_NAME_MAX_LENGTH = 200

export const contactSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  first_seen_at: z.string(),
  last_seen_at: z.string(),
  meeting_count: z.number().int().min(0),
  total_duration_minutes: z.number().int().min(0).nullable(),
  event_types: z.array(z.string()),
  common_summaries: z.array(z.string()),
  is_organizer_count: z.number().int().min(0),
  is_attendee_count: z.number().int().min(0),
  is_hidden: z.boolean(),
  is_favorite: z.boolean(),
  metadata: z.record(z.unknown()).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Contact = z.infer<typeof contactSchema>

export type ContactInsert = {
  user_id: string
  email: string
  display_name?: string | null
  first_seen_at?: string
  last_seen_at?: string
  meeting_count?: number
  total_duration_minutes?: number | null
  event_types?: string[]
  common_summaries?: string[]
  is_organizer_count?: number
  is_attendee_count?: number
  is_hidden?: boolean
  is_favorite?: boolean
  metadata?: Record<string, unknown> | null
}

export type ContactUpdate = Partial<Omit<ContactInsert, "user_id" | "email">>

export type ContactStats = {
  totalContacts: number
  totalMeetings: number
  totalDurationMinutes: number
  averageMeetingsPerContact: number
  topContacts: Array<{
    email: string
    displayName: string | null
    meetingCount: number
    totalDurationMinutes: number
    lastSeenAt: string
  }>
  meetingsByMonth: Array<{
    month: string
    meetingCount: number
    uniqueContacts: number
  }>
  durationByContact: Array<{
    email: string
    displayName: string | null
    totalMinutes: number
    averageMinutes: number
  }>
}

export type ContactSearchResult = {
  email: string
  displayName: string | null
  meetingCount: number
  lastSeenAt: string
  relevanceScore: number
}

export type ContactMiningResult = {
  contactsProcessed: number
  newContacts: number
  updatedContacts: number
  eventsScanned: number
  durationMs: number
}

export const searchContactsSchema = z.object({
  query: z.string().min(1).max(SEARCH_QUERY_MAX_LENGTH),
  limit: z.number().int().min(1).max(SEARCH_MAX_LIMIT).default(SEARCH_DEFAULT_LIMIT),
  includeHidden: z.boolean().default(false),
})

export type SearchContactsParams = z.infer<typeof searchContactsSchema>

export const getContactsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z
    .number()
    .int()
    .min(1)
    .max(PAGINATION_MAX_LIMIT)
    .default(PAGINATION_DEFAULT_LIMIT),
  sortBy: z
    .enum(["meeting_count", "last_seen_at", "display_name", "email"])
    .default("meeting_count"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  includeHidden: z.boolean().default(false),
})

export type GetContactsParams = z.infer<typeof getContactsSchema>

export const updateContactSchema = z.object({
  is_hidden: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  display_name: z.string().max(DISPLAY_NAME_MAX_LENGTH).optional(),
})

export type UpdateContactBody = z.infer<typeof updateContactSchema>
