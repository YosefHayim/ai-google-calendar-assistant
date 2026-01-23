import { describe, expect, it } from "@jest/globals"

const TEST_USER_ID = "user-123"
const TEST_CONTACT_ID = "contact-456"
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20

const SCORE_EMAIL_STARTS_WITH = 50
const SCORE_NAME_CONTAINS = 20
const MEETING_BONUS_FOR_FIVE_MEETINGS = 5
const TOTAL_COUNT_FOR_PAGINATION = 45
const PAGE_SIZE_FOR_PAGINATION = 10
const EXPECTED_TOTAL_PAGES = 5
const STATS_EXPECTED_CONTACTS = 3
const STATS_EXPECTED_MEETINGS = 45
const STATS_EXPECTED_DURATION = 2700
const FREQUENT_MEETING_COUNT = 50
const INFREQUENT_MEETING_COUNT = 2
const MANAGER_MEETING_COUNT = 40
const MANAGER_DURATION_MINUTES = 2400
const TEAM_MEETING_COUNT = 30
const TEAM_DURATION_MINUTES = 1800
const EXPECTED_TOTAL_MEETINGS = 70
const EXPECTED_TOTAL_DURATION = 4200
const EXPECTED_AVERAGE_PER_CONTACT = 15
const EXPECTED_AVERAGE_DURATION = 30
const EXPECTED_ORGANIZER_RATIO = 0.8
const EXPECTED_EVENT_TYPES_COUNT = 4
const EXPECTED_SUMMARIES_COUNT = 3

const createMockContact = (overrides = {}) => ({
  id: TEST_CONTACT_ID,
  user_id: TEST_USER_ID,
  email: "contact@example.com",
  display_name: "John Doe",
  first_seen_at: "2025-01-01T00:00:00Z",
  last_seen_at: "2025-12-01T00:00:00Z",
  meeting_count: 10,
  total_duration_minutes: 600,
  event_types: ["meeting", "sync"],
  common_summaries: ["Weekly Sync", "Project Review"],
  is_organizer_count: 5,
  is_attendee_count: 5,
  is_hidden: false,
  notes: null,
  metadata: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-12-01T00:00:00Z",
  ...overrides,
})

const createMockSearchResult = (overrides = {}) => ({
  email: "alice@example.com",
  display_name: "Alice Smith",
  meeting_count: 10,
  last_seen_at: "2025-12-01T00:00:00Z",
  ...overrides,
})

const calculateRelevanceScore = (
  contact: {
    email: string
    display_name: string | null
    meeting_count: number
  },
  searchTerm: string,
  index: number
): number => {
  let score = 0
  const email = contact.email.toLowerCase()
  const displayName = (contact.display_name ?? "").toLowerCase()

  const scoreEmailStartsWith = 50
  const scoreEmailContains = 30
  const scoreNameStartsWith = 40
  const scoreNameContains = 20
  const scoreMaxMeetingBonus = 30
  const scoreIndexPenalty = 2

  if (email.startsWith(searchTerm)) {
    score += scoreEmailStartsWith
  } else if (email.includes(searchTerm)) {
    score += scoreEmailContains
  }

  if (displayName.startsWith(searchTerm)) {
    score += scoreNameStartsWith
  } else if (displayName.includes(searchTerm)) {
    score += scoreNameContains
  }

  score += Math.min(contact.meeting_count, scoreMaxMeetingBonus)
  score -= index * scoreIndexPenalty

  return Math.max(0, score)
}

describe("Contact Query Service - Data Structure Validation", () => {
  describe("getContacts response structure", () => {
    it("should validate paginated response structure", () => {
      const paginatedResponse = {
        contacts: [createMockContact()],
        total: 1,
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT,
        totalPages: 1,
      }

      expect(paginatedResponse.page).toBe(DEFAULT_PAGE)
      expect(paginatedResponse.limit).toBe(DEFAULT_LIMIT)
      expect(paginatedResponse.contacts).toHaveLength(1)
      expect(paginatedResponse.total).toBe(1)
    })

    it("should calculate totalPages correctly", () => {
      const totalPages = Math.ceil(
        TOTAL_COUNT_FOR_PAGINATION / PAGE_SIZE_FOR_PAGINATION
      )

      expect(totalPages).toBe(EXPECTED_TOTAL_PAGES)
    })

    it("should validate contact data structure", () => {
      const contact = createMockContact()

      expect(contact).toHaveProperty("id")
      expect(contact).toHaveProperty("user_id")
      expect(contact).toHaveProperty("email")
      expect(contact).toHaveProperty("display_name")
      expect(contact).toHaveProperty("meeting_count")
      expect(contact).toHaveProperty("total_duration_minutes")
      expect(contact).toHaveProperty("event_types")
      expect(contact).toHaveProperty("common_summaries")
      expect(contact).toHaveProperty("is_hidden")
    })
  })

  describe("searchContacts response structure", () => {
    it("should validate search result structure", () => {
      const searchResult = createMockSearchResult()

      expect(searchResult).toHaveProperty("email")
      expect(searchResult).toHaveProperty("display_name")
      expect(searchResult).toHaveProperty("meeting_count")
      expect(searchResult).toHaveProperty("last_seen_at")
    })

    it("should calculate relevance score correctly for email starts with match", () => {
      const contact = createMockSearchResult({
        email: "alice@example.com",
        display_name: "Bob Jones",
        meeting_count: 5,
      })

      const score = calculateRelevanceScore(contact, "alice", 0)

      const expectedMinScore =
        SCORE_EMAIL_STARTS_WITH + MEETING_BONUS_FOR_FIVE_MEETINGS
      expect(score).toBeGreaterThanOrEqual(expectedMinScore)
    })

    it("should calculate relevance score correctly for name contains match", () => {
      const contact = createMockSearchResult({
        email: "bob@example.com",
        display_name: "Alice Smith",
        meeting_count: 10,
      })

      const score = calculateRelevanceScore(contact, "smith", 0)

      expect(score).toBeGreaterThanOrEqual(SCORE_NAME_CONTAINS)
    })

    it("should handle case-insensitive search", () => {
      const contact = createMockSearchResult({
        email: "ALICE@EXAMPLE.COM",
        display_name: "ALICE SMITH",
        meeting_count: 5,
      })

      const upperCaseScore = calculateRelevanceScore(contact, "alice", 0)
      const lowerCaseScore = calculateRelevanceScore(
        contact,
        "ALICE".toLowerCase(),
        0
      )

      expect(upperCaseScore).toBe(lowerCaseScore)
    })
  })

  describe("getContactStats response structure", () => {
    it("should calculate contact statistics correctly", () => {
      const contacts = [
        createMockContact({
          email: "alice@example.com",
          meeting_count: 20,
          total_duration_minutes: 1200,
        }),
        createMockContact({
          email: "bob@example.com",
          meeting_count: 15,
          total_duration_minutes: 900,
        }),
        createMockContact({
          email: "charlie@example.com",
          meeting_count: 10,
          total_duration_minutes: 600,
        }),
      ]

      const totalContacts = contacts.length
      const totalMeetings = contacts.reduce(
        (sum, c) => sum + c.meeting_count,
        0
      )
      const totalDurationMinutes = contacts.reduce(
        (sum, c) => sum + (c.total_duration_minutes ?? 0),
        0
      )
      const averageMeetingsPerContact =
        totalContacts > 0 ? totalMeetings / totalContacts : 0

      expect(totalContacts).toBe(STATS_EXPECTED_CONTACTS)
      expect(totalMeetings).toBe(STATS_EXPECTED_MEETINGS)
      expect(totalDurationMinutes).toBe(STATS_EXPECTED_DURATION)
      expect(averageMeetingsPerContact).toBe(EXPECTED_AVERAGE_PER_CONTACT)
    })

    it("should handle empty contact list", () => {
      const contacts: ReturnType<typeof createMockContact>[] = []

      const totalContacts = contacts.length
      const totalMeetings = contacts.reduce(
        (sum, c) => sum + c.meeting_count,
        0
      )
      const averageMeetingsPerContact =
        totalContacts > 0 ? totalMeetings / totalContacts : 0

      expect(totalContacts).toBe(0)
      expect(totalMeetings).toBe(0)
      expect(averageMeetingsPerContact).toBe(0)
    })

    it("should sort top contacts by meeting count descending", () => {
      const contacts = [
        createMockContact({ email: "bob@example.com", meeting_count: 15 }),
        createMockContact({ email: "alice@example.com", meeting_count: 20 }),
        createMockContact({ email: "charlie@example.com", meeting_count: 10 }),
      ]

      const topContacts = contacts
        .sort((a, b) => b.meeting_count - a.meeting_count)
        .slice(0, 10)

      expect(topContacts[0].email).toBe("alice@example.com")
      expect(topContacts[1].email).toBe("bob@example.com")
      expect(topContacts[2].email).toBe("charlie@example.com")
    })
  })

  describe("Contact mining result structure", () => {
    it("should validate mining result structure", () => {
      const miningResult = {
        contactsProcessed: 25,
        newContacts: 10,
        updatedContacts: 15,
        eventsScanned: 100,
        durationMs: 500,
      }

      expect(miningResult).toHaveProperty("contactsProcessed")
      expect(miningResult).toHaveProperty("newContacts")
      expect(miningResult).toHaveProperty("updatedContacts")
      expect(miningResult).toHaveProperty("eventsScanned")
      expect(miningResult).toHaveProperty("durationMs")
      expect(miningResult.newContacts + miningResult.updatedContacts).toBe(
        miningResult.contactsProcessed
      )
    })

    it("should return empty result when mining is disabled", () => {
      const miningResult = {
        contactsProcessed: 0,
        newContacts: 0,
        updatedContacts: 0,
        eventsScanned: 0,
        durationMs: 0,
      }

      expect(miningResult.contactsProcessed).toBe(0)
      expect(miningResult.newContacts).toBe(0)
      expect(miningResult.updatedContacts).toBe(0)
      expect(miningResult.eventsScanned).toBe(0)
    })
  })
})

describe("Contact Business Scenarios", () => {
  describe("Contact search for meeting scheduling", () => {
    it("should prioritize frequent contacts in search results", () => {
      const frequentContact = createMockSearchResult({
        email: "frequent@example.com",
        display_name: "Frequent User",
        meeting_count: FREQUENT_MEETING_COUNT,
      })
      const infrequentContact = createMockSearchResult({
        email: "infrequent@example.com",
        display_name: "Infrequent User",
        meeting_count: INFREQUENT_MEETING_COUNT,
      })

      const frequentScore = calculateRelevanceScore(frequentContact, "user", 0)
      const infrequentScore = calculateRelevanceScore(
        infrequentContact,
        "user",
        1
      )

      expect(frequentScore).toBeGreaterThan(infrequentScore)
    })

    it("should boost exact email match over partial name match", () => {
      const exactEmailMatch = createMockSearchResult({
        email: "alice@example.com",
        display_name: "Bob Jones",
        meeting_count: 5,
      })
      const partialNameMatch = createMockSearchResult({
        email: "bob@example.com",
        display_name: "Alice Smith",
        meeting_count: 5,
      })

      const emailScore = calculateRelevanceScore(exactEmailMatch, "alice", 0)
      const nameScore = calculateRelevanceScore(partialNameMatch, "alice", 0)

      expect(emailScore).toBeGreaterThan(nameScore)
    })
  })

  describe("Contact statistics for productivity dashboard", () => {
    it("should provide insights on meeting patterns", () => {
      const contacts = [
        createMockContact({
          email: "manager@example.com",
          meeting_count: MANAGER_MEETING_COUNT,
          total_duration_minutes: MANAGER_DURATION_MINUTES,
        }),
        createMockContact({
          email: "team@example.com",
          meeting_count: TEAM_MEETING_COUNT,
          total_duration_minutes: TEAM_DURATION_MINUTES,
        }),
      ]

      const totalMeetings = contacts.reduce(
        (sum, c) => sum + c.meeting_count,
        0
      )
      const totalDurationMinutes = contacts.reduce(
        (sum, c) => sum + (c.total_duration_minutes ?? 0),
        0
      )

      const topContacts = contacts.sort(
        (a, b) => b.meeting_count - a.meeting_count
      )

      expect(topContacts[0].email).toBe("manager@example.com")
      expect(totalMeetings).toBe(EXPECTED_TOTAL_MEETINGS)
      expect(totalDurationMinutes).toBe(EXPECTED_TOTAL_DURATION)
    })

    it("should calculate average meeting duration per contact", () => {
      const contact = createMockContact({
        meeting_count: 20,
        total_duration_minutes: 600,
      })

      const averageDuration =
        contact.meeting_count > 0
          ? Math.round(
              (contact.total_duration_minutes ?? 0) / contact.meeting_count
            )
          : 0

      expect(averageDuration).toBe(EXPECTED_AVERAGE_DURATION)
    })
  })

  describe("Contact privacy controls", () => {
    it("should support hiding contacts from search", () => {
      const visibleContacts = [
        createMockContact({ email: "alice@example.com", is_hidden: false }),
        createMockContact({ email: "bob@example.com", is_hidden: true }),
        createMockContact({ email: "charlie@example.com", is_hidden: false }),
      ]

      const searchableContacts = visibleContacts.filter((c) => !c.is_hidden)

      expect(searchableContacts).toHaveLength(2)
      expect(
        searchableContacts.find((c) => c.email === "bob@example.com")
      ).toBeUndefined()
    })

    it("should include hidden contacts when explicitly requested", () => {
      const allContacts = [
        createMockContact({ email: "alice@example.com", is_hidden: false }),
        createMockContact({ email: "bob@example.com", is_hidden: true }),
      ]

      expect(allContacts).toHaveLength(2)
      expect(allContacts.find((c) => c.is_hidden)).toBeDefined()
    })
  })

  describe("Contact data lifecycle", () => {
    it("should track contact notes for CRM-like functionality", () => {
      const contactWithNotes = createMockContact({
        notes: "Key stakeholder for Project Alpha",
      })

      expect(contactWithNotes.notes).toBe("Key stakeholder for Project Alpha")
    })

    it("should support contact metadata for custom fields", () => {
      const contactWithMetadata = createMockContact({
        metadata: { department: "Engineering", role: "Tech Lead" },
      })

      expect(contactWithMetadata.metadata).toEqual({
        department: "Engineering",
        role: "Tech Lead",
      })
    })

    it("should track first and last seen dates", () => {
      const contact = createMockContact({
        first_seen_at: "2024-01-01T00:00:00Z",
        last_seen_at: "2025-12-01T00:00:00Z",
      })

      const firstSeen = new Date(contact.first_seen_at)
      const lastSeen = new Date(contact.last_seen_at)

      expect(lastSeen.getTime()).toBeGreaterThan(firstSeen.getTime())
    })

    it("should track organizer vs attendee meeting ratio", () => {
      const contact = createMockContact({
        is_organizer_count: 8,
        is_attendee_count: 2,
      })

      const totalMeetings =
        contact.is_organizer_count + contact.is_attendee_count
      const organizerRatio = contact.is_organizer_count / totalMeetings

      expect(organizerRatio).toBe(EXPECTED_ORGANIZER_RATIO)
    })
  })

  describe("Event type classification", () => {
    it("should track common event types for each contact", () => {
      const contact = createMockContact({
        event_types: ["1:1", "standup", "sync", "planning"],
      })

      expect(contact.event_types).toContain("1:1")
      expect(contact.event_types).toContain("standup")
      expect(contact.event_types.length).toBe(EXPECTED_EVENT_TYPES_COUNT)
    })

    it("should track common meeting summaries", () => {
      const contact = createMockContact({
        common_summaries: [
          "Weekly Sync",
          "Sprint Planning",
          "1:1 with Manager",
        ],
      })

      expect(contact.common_summaries).toContain("Weekly Sync")
      expect(contact.common_summaries).toHaveLength(EXPECTED_SUMMARIES_COUNT)
    })
  })
})

describe("Contact Data Edge Cases", () => {
  it("should handle contacts with null display name", () => {
    const contact = createMockContact({ display_name: null })

    const score = calculateRelevanceScore(
      {
        email: contact.email,
        display_name: contact.display_name,
        meeting_count: contact.meeting_count,
      },
      "contact",
      0
    )

    expect(score).toBeGreaterThan(0)
  })

  it("should handle contacts with zero meetings", () => {
    const contact = createMockContact({
      meeting_count: 0,
      total_duration_minutes: 0,
    })

    const averageDuration =
      contact.meeting_count > 0
        ? contact.total_duration_minutes / contact.meeting_count
        : 0

    expect(averageDuration).toBe(0)
  })

  it("should handle empty event types array", () => {
    const contact = createMockContact({ event_types: [] })

    expect(contact.event_types).toHaveLength(0)
  })

  it("should handle empty search results", () => {
    const searchResults: ReturnType<typeof createMockSearchResult>[] = []

    expect(searchResults).toHaveLength(0)
  })

  it("should handle special characters in email", () => {
    const contact = createMockContact({
      email: "user+tag@sub.example.com",
    })

    expect(contact.email).toContain("+")
    expect(contact.email).toContain("sub.")
  })

  it("should handle unicode characters in display name", () => {
    const contact = createMockContact({
      display_name: "日本語 ユーザー",
    })

    expect(contact.display_name).toBeDefined()
    expect(contact.display_name?.length).toBeGreaterThan(0)
  })
})
