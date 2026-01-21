import { SUPABASE } from "@/config"
import type {
  Contact,
  ContactSearchResult,
  ContactStats,
  GetContactsParams,
  SearchContactsParams,
  UpdateContactBody,
} from "../types"

const TOP_CONTACTS_LIMIT = 10
const DURATION_BY_CONTACT_LIMIT = 15
const MONTHS_FOR_STATS = 12

const SCORE_EMAIL_STARTS_WITH = 50
const SCORE_EMAIL_CONTAINS = 30
const SCORE_NAME_STARTS_WITH = 40
const SCORE_NAME_CONTAINS = 20
const SCORE_MAX_MEETING_BONUS = 30
const SCORE_INDEX_PENALTY = 2

type PaginatedContacts = {
  contacts: Contact[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getContacts(
  userId: string,
  params: GetContactsParams
): Promise<PaginatedContacts> {
  const { page, limit, sortBy, sortOrder, includeHidden } = params
  const offset = (page - 1) * limit

  let query = SUPABASE.from("user_contacts")
    .select("*", { count: "exact" })
    .eq("user_id", userId)

  if (!includeHidden) {
    query = query.eq("is_hidden", false)
  }

  query = query.order(sortBy, { ascending: sortOrder === "asc" })
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch contacts: ${error.message}`)
  }

  return {
    contacts: (data as Contact[]) ?? [],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export async function searchContacts(
  userId: string,
  params: SearchContactsParams
): Promise<ContactSearchResult[]> {
  const { query, limit, includeHidden } = params
  const searchTerm = query.toLowerCase().trim()

  let dbQuery = SUPABASE.from("user_contacts")
    .select("email, display_name, meeting_count, last_seen_at")
    .eq("user_id", userId)

  if (!includeHidden) {
    dbQuery = dbQuery.eq("is_hidden", false)
  }

  dbQuery = dbQuery.or(
    `email.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`
  )
  dbQuery = dbQuery.order("meeting_count", { ascending: false })
  dbQuery = dbQuery.limit(limit)

  const { data, error } = await dbQuery

  if (error) {
    throw new Error(`Failed to search contacts: ${error.message}`)
  }

  return (data ?? []).map((contact, index) => ({
    email: contact.email,
    displayName: contact.display_name,
    meetingCount: contact.meeting_count,
    lastSeenAt: contact.last_seen_at,
    relevanceScore: calculateRelevanceScore(contact, searchTerm, index),
  }))
}

function calculateRelevanceScore(
  contact: { email: string; display_name: string | null; meeting_count: number },
  searchTerm: string,
  index: number
): number {
  let score = 0
  const email = contact.email.toLowerCase()
  const displayName = (contact.display_name ?? "").toLowerCase()

  if (email.startsWith(searchTerm)) {
    score += SCORE_EMAIL_STARTS_WITH
  } else if (email.includes(searchTerm)) {
    score += SCORE_EMAIL_CONTAINS
  }

  if (displayName.startsWith(searchTerm)) {
    score += SCORE_NAME_STARTS_WITH
  } else if (displayName.includes(searchTerm)) {
    score += SCORE_NAME_CONTAINS
  }

  score += Math.min(contact.meeting_count, SCORE_MAX_MEETING_BONUS)
  score -= index * SCORE_INDEX_PENALTY

  return Math.max(0, score)
}

export async function getContactStats(userId: string): Promise<ContactStats> {
  const { data: contacts, error } = await SUPABASE.from("user_contacts")
    .select("*")
    .eq("user_id", userId)
    .eq("is_hidden", false)

  if (error) {
    throw new Error(`Failed to fetch contact stats: ${error.message}`)
  }

  const allContacts = (contacts as Contact[]) ?? []

  const totalContacts = allContacts.length
  const totalMeetings = allContacts.reduce((sum, c) => sum + c.meeting_count, 0)
  const totalDurationMinutes = allContacts.reduce(
    (sum, c) => sum + (c.total_duration_minutes ?? 0),
    0
  )
  const averageMeetingsPerContact =
    totalContacts > 0 ? totalMeetings / totalContacts : 0

  const topContacts = allContacts
    .sort((a, b) => b.meeting_count - a.meeting_count)
    .slice(0, TOP_CONTACTS_LIMIT)
    .map((c) => ({
      email: c.email,
      displayName: c.display_name,
      meetingCount: c.meeting_count,
      totalDurationMinutes: c.total_duration_minutes ?? 0,
      lastSeenAt: c.last_seen_at,
    }))

  const meetingsByMonth = calculateMeetingsByMonth(allContacts)

  const durationByContact = allContacts
    .filter((c) => (c.total_duration_minutes ?? 0) > 0)
    .sort((a, b) => (b.total_duration_minutes ?? 0) - (a.total_duration_minutes ?? 0))
    .slice(0, DURATION_BY_CONTACT_LIMIT)
    .map((c) => ({
      email: c.email,
      displayName: c.display_name,
      totalMinutes: c.total_duration_minutes ?? 0,
      averageMinutes:
        c.meeting_count > 0
          ? Math.round((c.total_duration_minutes ?? 0) / c.meeting_count)
          : 0,
    }))

  return {
    totalContacts,
    totalMeetings,
    totalDurationMinutes,
    averageMeetingsPerContact: Math.round(averageMeetingsPerContact * 10) / 10,
    topContacts,
    meetingsByMonth,
    durationByContact,
  }
}

function calculateMeetingsByMonth(
  contacts: Contact[]
): ContactStats["meetingsByMonth"] {
  const monthMap = new Map<
    string,
    { meetingCount: number; uniqueContacts: Set<string> }
  >()

  const now = new Date()
  for (let i = 0; i < MONTHS_FOR_STATS; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    monthMap.set(monthKey, { meetingCount: 0, uniqueContacts: new Set() })
  }

  for (const contact of contacts) {
    const lastSeen = new Date(contact.last_seen_at)
    const monthKey = `${lastSeen.getFullYear()}-${String(lastSeen.getMonth() + 1).padStart(2, "0")}`

    const monthData = monthMap.get(monthKey)
    if (monthData) {
      monthData.meetingCount += contact.meeting_count
      monthData.uniqueContacts.add(contact.email)
    }
  }

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      meetingCount: data.meetingCount,
      uniqueContacts: data.uniqueContacts.size,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export async function getContactById(
  userId: string,
  contactId: string
): Promise<Contact | null> {
  const { data, error } = await SUPABASE.from("user_contacts")
    .select("*")
    .eq("user_id", userId)
    .eq("id", contactId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch contact: ${error.message}`)
  }

  return data as Contact
}

export async function updateContact(
  userId: string,
  contactId: string,
  updates: UpdateContactBody
): Promise<Contact> {
  const { data, error } = await SUPABASE.from("user_contacts")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("id", contactId)
    .select("*")
    .single()

  if (error) {
    throw new Error(`Failed to update contact: ${error.message}`)
  }

  return data as Contact
}

export async function deleteContact(
  userId: string,
  contactId: string
): Promise<void> {
  const { error } = await SUPABASE.from("user_contacts")
    .delete()
    .eq("user_id", userId)
    .eq("id", contactId)

  if (error) {
    throw new Error(`Failed to delete contact: ${error.message}`)
  }
}

export async function toggleContactMining(
  userId: string,
  enabled: boolean
): Promise<void> {
  const { error } = await SUPABASE.from("users")
    .update({ contact_mining_enabled: enabled })
    .eq("id", userId)

  if (error) {
    throw new Error(`Failed to update contact mining setting: ${error.message}`)
  }
}

export async function getContactMiningStatus(
  userId: string
): Promise<boolean> {
  const { data, error } = await SUPABASE.from("users")
    .select("contact_mining_enabled")
    .eq("id", userId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch contact mining status: ${error.message}`)
  }

  return data?.contact_mining_enabled ?? true
}
