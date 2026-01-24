export interface Contact {
  id: string
  user_id: string
  email: string
  display_name: string | null
  first_seen_at: string
  last_seen_at: string
  meeting_count: number
  total_duration_minutes: number | null
  event_types: string[]
  common_summaries: string[]
  is_organizer_count: number
  is_attendee_count: number
  is_hidden: boolean
  is_favorite: boolean
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface ContactSearchResult {
  email: string
  displayName: string | null
  meetingCount: number
  lastSeenAt: string
  relevanceScore: number
}

export interface ContactStats {
  totalContacts: number
  totalMeetings: number
  totalDurationMinutes: number
  averageMeetingsPerContact: number
  topContacts: TopContact[]
  meetingsByMonth: MeetingsByMonth[]
  durationByContact: DurationByContact[]
}

export interface TopContact {
  email: string
  displayName: string | null
  meetingCount: number
  totalDurationMinutes: number
  lastSeenAt: string
}

export interface MeetingsByMonth {
  month: string
  meetingCount: number
  uniqueContacts: number
}

export interface DurationByContact {
  email: string
  displayName: string | null
  totalMinutes: number
  averageMinutes: number
}

export interface PaginatedContacts {
  contacts: Contact[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetContactsParams {
  page?: number
  limit?: number
  sortBy?: 'meeting_count' | 'last_seen_at' | 'display_name' | 'email'
  sortOrder?: 'asc' | 'desc'
  includeHidden?: boolean
}

export interface SearchContactsParams {
  query: string
  limit?: number
}

export interface UpdateContactBody {
  is_hidden?: boolean
  is_favorite?: boolean
  display_name?: string
}

export interface CreateContactBody {
  email: string
  display_name?: string
}
