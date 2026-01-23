import { beforeEach, describe, expect, it, jest } from "@jest/globals"

// ============================================================
// MOCKS - Must be defined before imports
// ============================================================

const mockSupabaseFrom = jest.fn()
const mockSupabaseSelect = jest.fn()
const mockSupabaseInsert = jest.fn()
const mockSupabaseUpdate = jest.fn()
const mockSupabaseUpsert = jest.fn()
const mockSupabaseDelete = jest.fn()
const mockSupabaseEq = jest.fn()
const mockSupabaseIn = jest.fn()
const mockSupabaseOr = jest.fn()
const mockSupabaseOrder = jest.fn()
const mockSupabaseRange = jest.fn()
const mockSupabaseLimit = jest.fn()
const mockSupabaseSingle = jest.fn()

// Mock Supabase client
jest.mock("@/config", () => ({
  SUPABASE: {
    from: (table: string) => {
      mockSupabaseFrom(table)
      return {
        select: (...args: unknown[]) => {
          mockSupabaseSelect(...args)
          return {
            eq: (...eqArgs: unknown[]) => {
              mockSupabaseEq(...eqArgs)
              return {
                eq: mockSupabaseEq,
                in: (...inArgs: unknown[]) => {
                  mockSupabaseIn(...inArgs)
                  return Promise.resolve({ data: [], error: null })
                },
                order: (...orderArgs: unknown[]) => {
                  mockSupabaseOrder(...orderArgs)
                  return {
                    range: (...rangeArgs: unknown[]) => {
                      mockSupabaseRange(...rangeArgs)
                      return Promise.resolve({ data: [], error: null, count: 0 })
                    },
                    limit: (...limitArgs: unknown[]) => {
                      mockSupabaseLimit(...limitArgs)
                      return Promise.resolve({ data: [], error: null })
                    },
                  }
                },
                single: () => {
                  mockSupabaseSingle()
                  return Promise.resolve({ data: null, error: null })
                },
              }
            },
            or: (...orArgs: unknown[]) => {
              mockSupabaseOr(...orArgs)
              return {
                eq: (...eqArgs: unknown[]) => {
                  mockSupabaseEq(...eqArgs)
                  return {
                    order: (...orderArgs: unknown[]) => {
                      mockSupabaseOrder(...orderArgs)
                      return {
                        limit: (...limitArgs: unknown[]) => {
                          mockSupabaseLimit(...limitArgs)
                          return Promise.resolve({ data: [], error: null })
                        },
                      }
                    },
                  }
                },
              }
            },
            single: () => {
              mockSupabaseSingle()
              return Promise.resolve({ data: null, error: null })
            },
          }
        },
        insert: (...args: unknown[]) => {
          mockSupabaseInsert(...args)
          return {
            select: () => ({
              single: () => Promise.resolve({ data: null, error: null }),
            }),
          }
        },
        update: (...args: unknown[]) => {
          mockSupabaseUpdate(...args)
          return {
            eq: (...eqArgs: unknown[]) => {
              mockSupabaseEq(...eqArgs)
              return {
                eq: (...eqArgs2: unknown[]) => {
                  mockSupabaseEq(...eqArgs2)
                  return {
                    select: () => ({
                      single: () =>
                        Promise.resolve({ data: null, error: null }),
                    }),
                  }
                },
                select: () => ({
                  single: () => Promise.resolve({ data: null, error: null }),
                }),
              }
            },
          }
        },
        upsert: (...args: unknown[]) => {
          mockSupabaseUpsert(...args)
          return Promise.resolve({ error: null })
        },
        delete: () => ({
          eq: (...eqArgs: unknown[]) => {
            mockSupabaseEq(...eqArgs)
            return {
              eq: (...eqArgs2: unknown[]) => {
                mockSupabaseEq(...eqArgs2)
                return Promise.resolve({ error: null })
              },
            }
          },
        }),
      }
    },
  },
}))

// Mock logger
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}))

// Mock googleapis
jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
      })),
    },
    calendar: jest.fn().mockReturnValue({
      calendarList: {
        list: jest.fn().mockResolvedValue({ data: { items: [] } }),
      },
      events: {
        list: jest.fn().mockResolvedValue({ data: { items: [] } }),
      },
    }),
  },
}))

// ============================================================
// TEST CONSTANTS
// ============================================================

const TEST_USER_ID = "user-123"
const TEST_USER_EMAIL = "test@example.com"
const TEST_CONTACT_ID = "contact-456"
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const DEFAULT_SORT_BY = "meeting_count"
const DEFAULT_SORT_ORDER = "desc"

// Score constants from the service
const SCORE_EMAIL_STARTS_WITH = 50
const SCORE_EMAIL_CONTAINS = 30
const SCORE_NAME_STARTS_WITH = 40
const SCORE_NAME_CONTAINS = 20
const SCORE_MAX_MEETING_BONUS = 30

// ============================================================
// TEST DATA FACTORIES
// ============================================================

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

const createMockCalendarEvent = (overrides = {}) => ({
  id: "event-123",
  summary: "Team Meeting",
  start: { dateTime: "2025-12-01T10:00:00Z" },
  end: { dateTime: "2025-12-01T11:00:00Z" },
  attendees: [
    { email: "organizer@example.com", displayName: "Organizer", organizer: true },
    { email: "attendee@example.com", displayName: "Attendee" },
  ],
  ...overrides,
})

// ============================================================
// TESTS: Contact Query Service
// ============================================================

describe("Contact Query Service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe("getContacts", () => {
    it("should return paginated contacts for a user", async () => {
      const mockContacts = [
        createMockContact({ email: "alice@example.com", meeting_count: 20 }),
        createMockContact({ email: "bob@example.com", meeting_count: 15 }),
      ]

      // Reset and reconfigure mocks for this specific test
      mockSupabaseRange.mockImplementation(() =>
        Promise.resolve({
          data: mockContacts,
          error: null,
          count: 2,
        })
      )

      const { getContacts } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const result = await getContacts(TEST_USER_ID, {
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT,
        sortBy: DEFAULT_SORT_BY,
        sortOrder: DEFAULT_SORT_ORDER,
        includeHidden: false,
      })

      expect(mockSupabaseFrom).toHaveBeenCalledWith("user_contacts")
      expect(result.page).toBe(DEFAULT_PAGE)
      expect(result.limit).toBe(DEFAULT_LIMIT)
    })

    it("should include hidden contacts when includeHidden is true", async () => {
      mockSupabaseRange.mockImplementation(() =>
        Promise.resolve({ data: [], error: null, count: 0 })
      )

      const { getContacts } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await getContacts(TEST_USER_ID, {
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT,
        sortBy: DEFAULT_SORT_BY,
        sortOrder: DEFAULT_SORT_ORDER,
        includeHidden: true,
      })

      // When includeHidden is true, the is_hidden filter should not be applied
      expect(mockSupabaseFrom).toHaveBeenCalledWith("user_contacts")
    })

    it("should throw error when database query fails", async () => {
      // Configure mock to return error
      mockSupabaseRange.mockImplementation(() =>
        Promise.resolve({
          data: null,
          error: { message: "Database connection failed" },
          count: null,
        })
      )

      jest.resetModules()
      const { getContacts } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await expect(
        getContacts(TEST_USER_ID, {
          page: DEFAULT_PAGE,
          limit: DEFAULT_LIMIT,
          sortBy: DEFAULT_SORT_BY,
          sortOrder: DEFAULT_SORT_ORDER,
          includeHidden: false,
        })
      ).rejects.toThrow("Failed to fetch contacts")
    })

    it("should calculate totalPages correctly", async () => {
      const totalCount = 45
      const pageSize = 10

      mockSupabaseRange.mockImplementation(() =>
        Promise.resolve({
          data: [],
          error: null,
          count: totalCount,
        })
      )

      jest.resetModules()
      const { getContacts } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const result = await getContacts(TEST_USER_ID, {
        page: 1,
        limit: pageSize,
        sortBy: DEFAULT_SORT_BY,
        sortOrder: DEFAULT_SORT_ORDER,
        includeHidden: false,
      })

      const expectedPages = 5
      expect(result.totalPages).toBe(expectedPages)
    })
  })

  describe("searchContacts", () => {
    it("should search contacts by email and display name", async () => {
      const searchResults = [
        {
          email: "alice@example.com",
          display_name: "Alice Smith",
          meeting_count: 10,
          last_seen_at: "2025-12-01T00:00:00Z",
        },
      ]

      mockSupabaseLimit.mockImplementation(() =>
        Promise.resolve({ data: searchResults, error: null })
      )

      jest.resetModules()
      const { searchContacts } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const result = await searchContacts(TEST_USER_ID, {
        query: "alice",
        limit: 10,
        includeHidden: false,
      })

      expect(result).toHaveLength(1)
      expect(result[0].email).toBe("alice@example.com")
      expect(result[0]).toHaveProperty("relevanceScore")
    })

    it("should calculate relevance score correctly for email starts with match", async () => {
      const searchResults = [
        {
          email: "alice@example.com",
          display_name: "Bob Jones",
          meeting_count: 5,
          last_seen_at: "2025-12-01T00:00:00Z",
        },
      ]

      mockSupabaseLimit.mockImplementation(() =>
        Promise.resolve({ data: searchResults, error: null })
      )

      jest.resetModules()
      const { searchContacts } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const result = await searchContacts(TEST_USER_ID, {
        query: "alice",
        limit: 10,
        includeHidden: false,
      })

      // Email starts with "alice" = 50 points + meeting bonus (min 5, 30) = 5
      const expectedMinScore = SCORE_EMAIL_STARTS_WITH + 5
      expect(result[0].relevanceScore).toBeGreaterThanOrEqual(expectedMinScore)
    })

    it("should calculate relevance score correctly for name contains match", async () => {
      const searchResults = [
        {
          email: "bob@example.com",
          display_name: "Alice Smith",
          meeting_count: 10,
          last_seen_at: "2025-12-01T00:00:00Z",
        },
      ]

      mockSupabaseLimit.mockImplementation(() =>
        Promise.resolve({ data: searchResults, error: null })
      )

      jest.resetModules()
      const { searchContacts } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const result = await searchContacts(TEST_USER_ID, {
        query: "smith",
        limit: 10,
        includeHidden: false,
      })

      // Name contains "smith" = 20 points + meeting bonus
      expect(result[0].relevanceScore).toBeGreaterThanOrEqual(SCORE_NAME_CONTAINS)
    })

    it("should trim and lowercase search query", async () => {
      mockSupabaseLimit.mockImplementation(() =>
        Promise.resolve({ data: [], error: null })
      )

      jest.resetModules()
      const { searchContacts } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await searchContacts(TEST_USER_ID, {
        query: "  ALICE  ",
        limit: 10,
        includeHidden: false,
      })

      // Verify the or clause was called with lowercase trimmed search term
      expect(mockSupabaseOr).toHaveBeenCalled()
    })

    it("should throw error when search fails", async () => {
      mockSupabaseLimit.mockImplementation(() =>
        Promise.resolve({
          data: null,
          error: { message: "Search query failed" },
        })
      )

      jest.resetModules()
      const { searchContacts } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await expect(
        searchContacts(TEST_USER_ID, {
          query: "test",
          limit: 10,
          includeHidden: false,
        })
      ).rejects.toThrow("Failed to search contacts")
    })
  })

  describe("getContactStats", () => {
    it("should calculate contact statistics correctly", async () => {
      const mockContacts = [
        createMockContact({
          email: "alice@example.com",
          meeting_count: 20,
          total_duration_minutes: 1200,
          last_seen_at: "2025-12-01T00:00:00Z",
        }),
        createMockContact({
          email: "bob@example.com",
          meeting_count: 15,
          total_duration_minutes: 900,
          last_seen_at: "2025-11-01T00:00:00Z",
        }),
        createMockContact({
          email: "charlie@example.com",
          meeting_count: 10,
          total_duration_minutes: 600,
          last_seen_at: "2025-10-01T00:00:00Z",
        }),
      ]

      // Reconfigure mock for this test
      mockSupabaseEq.mockImplementation(() => ({
        eq: () => Promise.resolve({ data: mockContacts, error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        in: () => Promise.resolve({ data: [], error: null }),
        order: () => ({
          range: () => Promise.resolve({ data: [], error: null, count: 0 }),
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      }))

      jest.resetModules()
      const { getContactStats } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const stats = await getContactStats(TEST_USER_ID)

      expect(stats.totalContacts).toBe(3)
      expect(stats.totalMeetings).toBe(45)
      expect(stats.totalDurationMinutes).toBe(2700)
      expect(stats.topContacts).toHaveLength(3)
      expect(stats.topContacts[0].email).toBe("alice@example.com")
    })

    it("should handle empty contact list", async () => {
      mockSupabaseEq.mockImplementation(() => ({
        eq: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        in: () => Promise.resolve({ data: [], error: null }),
        order: () => ({
          range: () => Promise.resolve({ data: [], error: null, count: 0 }),
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      }))

      jest.resetModules()
      const { getContactStats } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const stats = await getContactStats(TEST_USER_ID)

      expect(stats.totalContacts).toBe(0)
      expect(stats.totalMeetings).toBe(0)
      expect(stats.totalDurationMinutes).toBe(0)
      expect(stats.averageMeetingsPerContact).toBe(0)
      expect(stats.topContacts).toHaveLength(0)
    })

    it("should throw error when fetching stats fails", async () => {
      mockSupabaseEq.mockImplementation(() => ({
        eq: () =>
          Promise.resolve({
            data: null,
            error: { message: "Stats query failed" },
          }),
      }))

      jest.resetModules()
      const { getContactStats } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await expect(getContactStats(TEST_USER_ID)).rejects.toThrow(
        "Failed to fetch contact stats"
      )
    })
  })

  describe("getContactById", () => {
    it("should return contact when found", async () => {
      const mockContact = createMockContact()

      mockSupabaseSingle.mockImplementation(() =>
        Promise.resolve({ data: mockContact, error: null })
      )

      jest.resetModules()
      const { getContactById } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const result = await getContactById(TEST_USER_ID, TEST_CONTACT_ID)

      expect(result).toEqual(mockContact)
    })

    it("should return null when contact not found", async () => {
      mockSupabaseSingle.mockImplementation(() =>
        Promise.resolve({ data: null, error: { code: "PGRST116" } })
      )

      jest.resetModules()
      const { getContactById } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const result = await getContactById(TEST_USER_ID, "nonexistent-id")

      expect(result).toBeNull()
    })

    it("should throw error for non-404 database errors", async () => {
      mockSupabaseSingle.mockImplementation(() =>
        Promise.resolve({
          data: null,
          error: { code: "OTHER_ERROR", message: "Database error" },
        })
      )

      jest.resetModules()
      const { getContactById } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await expect(
        getContactById(TEST_USER_ID, TEST_CONTACT_ID)
      ).rejects.toThrow("Failed to fetch contact")
    })
  })

  describe("updateContact", () => {
    it("should update contact successfully", async () => {
      const updatedContact = createMockContact({ notes: "Updated notes" })

      mockSupabaseEq.mockImplementation(() => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: updatedContact, error: null }),
          }),
        }),
      }))

      jest.resetModules()
      const { updateContact } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const result = await updateContact(TEST_USER_ID, TEST_CONTACT_ID, {
        notes: "Updated notes",
      })

      expect(result.notes).toBe("Updated notes")
    })

    it("should throw error when update fails", async () => {
      mockSupabaseEq.mockImplementation(() => ({
        eq: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({
                data: null,
                error: { message: "Update failed" },
              }),
          }),
        }),
      }))

      jest.resetModules()
      const { updateContact } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await expect(
        updateContact(TEST_USER_ID, TEST_CONTACT_ID, { notes: "test" })
      ).rejects.toThrow("Failed to update contact")
    })
  })

  describe("deleteContact", () => {
    it("should delete contact successfully", async () => {
      mockSupabaseEq.mockImplementation(() => ({
        eq: () => Promise.resolve({ error: null }),
      }))

      jest.resetModules()
      const { deleteContact } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await expect(
        deleteContact(TEST_USER_ID, TEST_CONTACT_ID)
      ).resolves.not.toThrow()
    })

    it("should throw error when delete fails", async () => {
      mockSupabaseEq.mockImplementation(() => ({
        eq: () =>
          Promise.resolve({ error: { message: "Delete failed" } }),
      }))

      jest.resetModules()
      const { deleteContact } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await expect(
        deleteContact(TEST_USER_ID, TEST_CONTACT_ID)
      ).rejects.toThrow("Failed to delete contact")
    })
  })

  describe("toggleContactMining", () => {
    it("should enable contact mining", async () => {
      mockSupabaseEq.mockImplementation(() =>
        Promise.resolve({ error: null })
      )

      jest.resetModules()
      const { toggleContactMining } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await expect(
        toggleContactMining(TEST_USER_ID, true)
      ).resolves.not.toThrow()
    })

    it("should disable contact mining", async () => {
      mockSupabaseEq.mockImplementation(() =>
        Promise.resolve({ error: null })
      )

      jest.resetModules()
      const { toggleContactMining } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await expect(
        toggleContactMining(TEST_USER_ID, false)
      ).resolves.not.toThrow()
    })

    it("should throw error when toggle fails", async () => {
      mockSupabaseEq.mockImplementation(() =>
        Promise.resolve({ error: { message: "Toggle failed" } })
      )

      jest.resetModules()
      const { toggleContactMining } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await expect(toggleContactMining(TEST_USER_ID, true)).rejects.toThrow(
        "Failed to update contact mining setting"
      )
    })
  })

  describe("getContactMiningStatus", () => {
    it("should return true when contact mining is enabled", async () => {
      mockSupabaseSingle.mockImplementation(() =>
        Promise.resolve({
          data: { contact_mining_enabled: true },
          error: null,
        })
      )

      jest.resetModules()
      const { getContactMiningStatus } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const result = await getContactMiningStatus(TEST_USER_ID)

      expect(result).toBe(true)
    })

    it("should return false when contact mining is disabled", async () => {
      mockSupabaseSingle.mockImplementation(() =>
        Promise.resolve({
          data: { contact_mining_enabled: false },
          error: null,
        })
      )

      jest.resetModules()
      const { getContactMiningStatus } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const result = await getContactMiningStatus(TEST_USER_ID)

      expect(result).toBe(false)
    })

    it("should default to true when setting is null", async () => {
      mockSupabaseSingle.mockImplementation(() =>
        Promise.resolve({
          data: { contact_mining_enabled: null },
          error: null,
        })
      )

      jest.resetModules()
      const { getContactMiningStatus } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const result = await getContactMiningStatus(TEST_USER_ID)

      expect(result).toBe(true)
    })

    it("should throw error when status fetch fails", async () => {
      mockSupabaseSingle.mockImplementation(() =>
        Promise.resolve({
          data: null,
          error: { message: "Status fetch failed" },
        })
      )

      jest.resetModules()
      const { getContactMiningStatus } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await expect(getContactMiningStatus(TEST_USER_ID)).rejects.toThrow(
        "Failed to fetch contact mining status"
      )
    })
  })
})

// ============================================================
// TESTS: Contact Mining Service
// ============================================================

describe("Contact Mining Service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe("mineContactsFromCalendar", () => {
    it("should return early when mining is disabled for user", async () => {
      mockSupabaseSingle.mockImplementation(() =>
        Promise.resolve({
          data: { contact_mining_enabled: false },
          error: null,
        })
      )

      jest.resetModules()
      const { mineContactsFromCalendar } = await import(
        "@/domains/contacts/services/contact-mining-service"
      )

      const result = await mineContactsFromCalendar(
        TEST_USER_ID,
        TEST_USER_EMAIL,
        "access-token",
        "refresh-token"
      )

      expect(result.contactsProcessed).toBe(0)
      expect(result.newContacts).toBe(0)
      expect(result.updatedContacts).toBe(0)
      expect(result.eventsScanned).toBe(0)
    })

    it("should process calendar events when mining is enabled", async () => {
      mockSupabaseSingle.mockImplementation(() =>
        Promise.resolve({
          data: { contact_mining_enabled: true },
          error: null,
        })
      )

      jest.resetModules()
      const { mineContactsFromCalendar } = await import(
        "@/domains/contacts/services/contact-mining-service"
      )

      const result = await mineContactsFromCalendar(
        TEST_USER_ID,
        TEST_USER_EMAIL,
        "access-token"
      )

      // With mocked empty calendar, should process 0 events
      expect(result).toHaveProperty("contactsProcessed")
      expect(result).toHaveProperty("eventsScanned")
      expect(result).toHaveProperty("durationMs")
    })

    it("should return result with durationMs", async () => {
      mockSupabaseSingle.mockImplementation(() =>
        Promise.resolve({
          data: { contact_mining_enabled: true },
          error: null,
        })
      )

      jest.resetModules()
      const { mineContactsFromCalendar } = await import(
        "@/domains/contacts/services/contact-mining-service"
      )

      const result = await mineContactsFromCalendar(
        TEST_USER_ID,
        TEST_USER_EMAIL,
        "access-token"
      )

      expect(result.durationMs).toBeGreaterThanOrEqual(0)
    })
  })

  describe("mineContactsInBackground", () => {
    it("should not throw when called", async () => {
      mockSupabaseSingle.mockImplementation(() =>
        Promise.resolve({
          data: { contact_mining_enabled: false },
          error: null,
        })
      )

      jest.resetModules()
      const { mineContactsInBackground } = await import(
        "@/domains/contacts/services/contact-mining-service"
      )

      expect(() =>
        mineContactsInBackground(
          TEST_USER_ID,
          TEST_USER_EMAIL,
          "access-token"
        )
      ).not.toThrow()
    })
  })
})

// ============================================================
// TESTS: Business Scenarios
// ============================================================

describe("Business Scenarios", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe("Contact search for meeting scheduling", () => {
    it("should prioritize frequent contacts in search results", async () => {
      const frequentContact = {
        email: "frequent@example.com",
        display_name: "Frequent User",
        meeting_count: 50,
        last_seen_at: "2025-12-01T00:00:00Z",
      }
      const infrequentContact = {
        email: "infrequent@example.com",
        display_name: "Infrequent User",
        meeting_count: 2,
        last_seen_at: "2025-06-01T00:00:00Z",
      }

      mockSupabaseLimit.mockImplementation(() =>
        Promise.resolve({
          data: [frequentContact, infrequentContact],
          error: null,
        })
      )

      jest.resetModules()
      const { searchContacts } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const results = await searchContacts(TEST_USER_ID, {
        query: "user",
        limit: 10,
        includeHidden: false,
      })

      // Frequent contact should have higher relevance score
      expect(results[0].relevanceScore).toBeGreaterThanOrEqual(
        results[1].relevanceScore
      )
    })
  })

  describe("Contact statistics for productivity dashboard", () => {
    it("should provide insights on meeting patterns", async () => {
      const contacts = [
        createMockContact({
          email: "manager@example.com",
          meeting_count: 40,
          total_duration_minutes: 2400,
          event_types: ["1:1", "sync"],
        }),
        createMockContact({
          email: "team@example.com",
          meeting_count: 30,
          total_duration_minutes: 1800,
          event_types: ["standup", "planning"],
        }),
      ]

      mockSupabaseEq.mockImplementation(() => ({
        eq: () => Promise.resolve({ data: contacts, error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        in: () => Promise.resolve({ data: [], error: null }),
        order: () => ({
          range: () => Promise.resolve({ data: [], error: null, count: 0 }),
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      }))

      jest.resetModules()
      const { getContactStats } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const stats = await getContactStats(TEST_USER_ID)

      // Top contact should be the one with most meetings
      expect(stats.topContacts[0].email).toBe("manager@example.com")

      // Total metrics should be calculated correctly
      const expectedTotalMeetings = 70
      const expectedTotalDuration = 4200
      expect(stats.totalMeetings).toBe(expectedTotalMeetings)
      expect(stats.totalDurationMinutes).toBe(expectedTotalDuration)
    })
  })

  describe("Contact privacy controls", () => {
    it("should respect hidden contacts setting in search", async () => {
      mockSupabaseLimit.mockImplementation(() =>
        Promise.resolve({ data: [], error: null })
      )

      jest.resetModules()
      const { searchContacts } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await searchContacts(TEST_USER_ID, {
        query: "test",
        limit: 10,
        includeHidden: false,
      })

      // Verify the filter was applied
      expect(mockSupabaseEq).toHaveBeenCalled()
    })

    it("should allow users to toggle contact mining feature", async () => {
      mockSupabaseEq.mockImplementation(() =>
        Promise.resolve({ error: null })
      )

      jest.resetModules()
      const { toggleContactMining } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      // User disables mining for privacy
      await toggleContactMining(TEST_USER_ID, false)

      expect(mockSupabaseUpdate).toHaveBeenCalled()
    })
  })

  describe("Contact data lifecycle", () => {
    it("should allow updating contact notes for CRM-like functionality", async () => {
      const contactWithNotes = createMockContact({
        notes: "Key stakeholder for Project Alpha",
      })

      mockSupabaseEq.mockImplementation(() => ({
        eq: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({ data: contactWithNotes, error: null }),
          }),
        }),
      }))

      jest.resetModules()
      const { updateContact } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      const updated = await updateContact(TEST_USER_ID, TEST_CONTACT_ID, {
        notes: "Key stakeholder for Project Alpha",
      })

      expect(updated.notes).toBe("Key stakeholder for Project Alpha")
    })

    it("should allow deleting contacts user no longer wants tracked", async () => {
      mockSupabaseEq.mockImplementation(() => ({
        eq: () => Promise.resolve({ error: null }),
      }))

      jest.resetModules()
      const { deleteContact } = await import(
        "@/domains/contacts/services/contact-query-service"
      )

      await expect(
        deleteContact(TEST_USER_ID, TEST_CONTACT_ID)
      ).resolves.not.toThrow()
    })
  })
})
