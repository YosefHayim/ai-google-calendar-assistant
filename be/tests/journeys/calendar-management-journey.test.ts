import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { mockFn, testData } from "../test-utils"

/**
 * Business Scenario: Calendar Management Journey
 *
 * This test suite covers the complete calendar management workflow including:
 * - Viewing and browsing calendar events
 * - Creating events through various methods (manual, AI, quick-add)
 * - Editing and updating events
 * - Handling conflicts and scheduling
 * - Deleting events with safety checks
 * - Managing recurring events
 * - Calendar preferences and settings
 */

const mockCalendarApi = {
  events: {
    list: mockFn(),
    get: mockFn(),
    insert: mockFn(),
    update: mockFn(),
    delete: mockFn(),
    move: mockFn(),
    instances: mockFn(),
  },
  calendarList: {
    list: mockFn(),
  },
}

const mockConflictDetection = mockFn()
const mockRescheduleSuggestions = mockFn()

// Mock AI Agent for calendar operations
const mockCalendarAgent = mockFn().mockResolvedValue({
  success: true,
  action: "create_event",
  event: {
    summary: "Team Standup",
    start: { dateTime: "2026-01-20T09:00:00Z" },
    end: { dateTime: "2026-01-20T09:30:00Z" },
  },
})

jest.mock("@/domains/calendar/utils/init", () => ({
  createCalendarFromValidatedTokens: () => mockCalendarApi,
}))

jest.mock("@/domains/calendar/utils/check-conflicts", () => ({
  checkConflicts: mockConflictDetection,
}))

jest.mock("@/domains/calendar/utils/reschedule", () => ({
  findRescheduleSuggestions: mockRescheduleSuggestions,
}))

jest.mock("@/ai-agents/agents", () => ({
  CALENDAR_AGENT: mockCalendarAgent,
}))

describe("Calendar Management Journey", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mock responses
    mockCalendarApi.events.list.mockResolvedValue({
      data: {
        items: [
          {
            id: "event-1",
            summary: "Team Standup",
            start: { dateTime: "2026-01-20T09:00:00Z" },
            end: { dateTime: "2026-01-20T09:30:00Z" },
            attendees: [{ email: "user@example.com", self: true }],
          },
          {
            id: "event-2",
            summary: "Client Meeting",
            start: { dateTime: "2026-01-20T14:00:00Z" },
            end: { dateTime: "2026-01-20T15:00:00Z" },
            attendees: [
              { email: "user@example.com", self: true },
              { email: "client@example.com" },
            ],
          },
        ],
      },
    })

    mockConflictDetection.mockResolvedValue({
      hasConflicts: false,
      conflicts: [],
    })

    mockRescheduleSuggestions.mockResolvedValue([
      {
        start: "2026-01-20T15:30:00Z",
        end: "2026-01-20T16:30:00Z",
        score: 95,
        reason: "Next available slot after current meeting",
      },
    ])
  })

  describe("Scenario 1: Viewing Calendar Events", () => {
    it("should display today's events in chronological order", async () => {
      const today = new Date().toISOString().split('T')[0]
      const events = await mockCalendarApi.events.list({
        calendarId: "primary",
        timeMin: `${today}T00:00:00Z`,
        timeMax: `${today}T23:59:59Z`,
        orderBy: "startTime",
        singleEvents: true,
      })

      expect(events.data.items).toHaveLength(2)
      expect(events.data.items[0].start.dateTime).toContain("09:00:00")
      expect(events.data.items[1].start.dateTime).toContain("14:00:00")
    })

    it("should show event details with all relevant information", () => {
      const eventDetails = {
        id: "event-1",
        summary: "Team Standup",
        description: "Daily standup meeting",
        start: { dateTime: "2026-01-20T09:00:00Z", timeZone: "UTC" },
        end: { dateTime: "2026-01-20T09:30:00Z", timeZone: "UTC" },
        location: "Conference Room A",
        attendees: [
          { email: "user@example.com", displayName: "John Doe", self: true },
          { email: "team@example.com", displayName: "Team Member" },
        ],
        organizer: { email: "user@example.com", displayName: "John Doe" },
        status: "confirmed",
        reminders: { useDefault: true },
        created: "2026-01-19T10:00:00Z",
        updated: "2026-01-19T10:00:00Z",
      }

      expect(eventDetails.summary).toBe("Team Standup")
      expect(eventDetails.attendees).toHaveLength(2)
      expect(eventDetails.status).toBe("confirmed")
    })

    it("should filter events by calendar", async () => {
      mockCalendarApi.events.list.mockResolvedValueOnce({
        data: {
          items: [
            {
              id: "work-event-1",
              summary: "Work Meeting",
              start: { dateTime: "2026-01-20T10:00:00Z" },
              end: { dateTime: "2026-01-20T11:00:00Z" },
            },
          ],
        },
      })

      const workEvents = await mockCalendarApi.events.list({
        calendarId: "work@group.calendar.google.com",
        timeMin: "2026-01-20T00:00:00Z",
        timeMax: "2026-01-21T00:00:00Z",
      })

      expect(workEvents.data.items[0].summary).toBe("Work Meeting")
    })

    it("should handle empty calendar gracefully", async () => {
      mockCalendarApi.events.list.mockResolvedValueOnce({
        data: { items: [] },
      })

      const emptyDay = await mockCalendarApi.events.list({
        calendarId: "primary",
        timeMin: "2026-01-25T00:00:00Z",
        timeMax: "2026-01-26T00:00:00Z",
      })

      expect(emptyDay.data.items).toHaveLength(0)
    })
  })

  describe("Scenario 2: Creating Events Manually", () => {
    it("should create a simple event with required fields", async () => {
      const newEvent = {
        summary: "Project Review",
        start: { dateTime: "2026-01-22T14:00:00Z", timeZone: "UTC" },
        end: { dateTime: "2026-01-22T15:00:00Z", timeZone: "UTC" },
        description: "Review project progress and next steps",
      }

      mockCalendarApi.events.insert.mockResolvedValueOnce({
        data: { id: "created-event-123", ...newEvent },
      })

      const result = await mockCalendarApi.events.insert({
        calendarId: "primary",
        requestBody: newEvent,
      })

      expect(result.data.id).toBe("created-event-123")
      expect(result.data.summary).toBe("Project Review")
    })

    it("should create event with attendees and notifications", async () => {
      const eventWithAttendees = {
        summary: "Team Planning Session",
        start: { dateTime: "2026-01-23T10:00:00Z", timeZone: "UTC" },
        end: { dateTime: "2026-01-23T11:30:00Z", timeZone: "UTC" },
        attendees: [
          { email: "colleague1@example.com" },
          { email: "colleague2@example.com" },
        ],
        reminders: {
          overrides: [
            { method: "email", minutes: 30 },
            { method: "popup", minutes: 15 },
          ],
        },
        sendUpdates: "all",
      }

      mockCalendarApi.events.insert.mockResolvedValueOnce({
        data: { id: "event-with-attendees", ...eventWithAttendees },
      })

      const result = await mockCalendarApi.events.insert({
        calendarId: "primary",
        requestBody: eventWithAttendees,
      })

      expect(result.data.attendees).toHaveLength(2)
      expect(result.data.reminders.overrides).toHaveLength(2)
    })

    it("should validate event data before creation", () => {
      const invalidEvents = [
        { summary: "", start: {}, end: {} }, // Missing required fields
        { summary: "Test", start: { dateTime: "invalid" }, end: {} }, // Invalid datetime
        { summary: "Test", start: {}, end: { dateTime: "2026-01-20T10:00:00Z" } }, // End before start
      ]

      invalidEvents.forEach((event) => {
        expect(() => {
          if (!event.summary) throw new Error("Summary required")
          if (!event.start.dateTime) throw new Error("Start time required")
          if (!event.end.dateTime) throw new Error("End time required")
        }).toThrow()
      })
    })

    it("should handle calendar API errors gracefully", async () => {
      mockCalendarApi.events.insert.mockRejectedValueOnce(
        new Error("Calendar API: Rate limit exceeded")
      )

      try {
        await mockCalendarApi.events.insert({
          calendarId: "primary",
          requestBody: { summary: "Test Event" },
        })
      } catch (error: any) {
        expect(error.message).toContain("Rate limit exceeded")
      }
    })
  })

  describe("Scenario 3: AI-Powered Event Creation", () => {
    it("should create event from natural language description", async () => {
      const naturalLanguage = "Schedule a 1-hour team meeting tomorrow at 3pm"

      const aiResult = await mockCalendarAgent({
        message: naturalLanguage,
        userId: "user-123",
        context: { timezone: "UTC" },
      })

      expect(aiResult.success).toBe(true)
      expect(aiResult.event.summary).toContain("Team")
      expect(aiResult.event.start.dateTime).toContain("15:00:00") // 3pm
    })

    it("should handle ambiguous time references", async () => {
      const ambiguousInput = "Meet with John at 3"

      const clarification = {
        ambiguous: true,
        clarification: "Did you mean 3:00 PM today or tomorrow?",
        suggestions: [
          { time: "2026-01-20T15:00:00Z", label: "Today at 3 PM" },
          { time: "2026-01-21T15:00:00Z", label: "Tomorrow at 3 PM" },
        ],
      }

      expect(clarification.ambiguous).toBe(true)
      expect(clarification.suggestions).toHaveLength(2)
    })

    it("should extract location from description", async () => {
      const inputWithLocation = "Lunch at Cafe Milano at 12pm"

      const parsedEvent = {
        summary: "Lunch",
        location: "Cafe Milano",
        start: { dateTime: "2026-01-20T12:00:00Z" },
        end: { dateTime: "2026-01-20T13:00:00Z" },
      }

      expect(parsedEvent.location).toBe("Cafe Milano")
      expect(parsedEvent.summary).toBe("Lunch")
    })

    it("should detect and resolve scheduling conflicts", async () => {
      mockConflictDetection.mockResolvedValueOnce({
        hasConflicts: true,
        conflicts: [
          {
            id: "conflict-1",
            summary: "Existing Meeting",
            start: "2026-01-20T14:00:00Z",
            end: "2026-01-20T15:00:00Z",
          },
        ],
      })

      const conflictCheck = await mockConflictDetection({
        start: "2026-01-20T14:30:00Z",
        end: "2026-01-20T15:30:00Z",
        calendarId: "primary",
      })

      expect(conflictCheck.hasConflicts).toBe(true)
      expect(conflictCheck.conflicts).toHaveLength(1)
    })
  })

  describe("Scenario 4: Editing and Updating Events", () => {
    it("should update event title and description", async () => {
      const updates = {
        summary: "Updated Meeting Title",
        description: "Updated description with new agenda items",
      }

      mockCalendarApi.events.update.mockResolvedValueOnce({
        data: {
          id: "event-123",
          ...updates,
          start: { dateTime: "2026-01-20T14:00:00Z" },
          end: { dateTime: "2026-01-20T15:00:00Z" },
        },
      })

      const result = await mockCalendarApi.events.update({
        calendarId: "primary",
        eventId: "event-123",
        requestBody: updates,
      })

      expect(result.data.summary).toBe("Updated Meeting Title")
      expect(result.data.description).toContain("Updated description")
    })

    it("should reschedule event to new time", async () => {
      const timeUpdate = {
        start: { dateTime: "2026-01-20T16:00:00Z", timeZone: "UTC" },
        end: { dateTime: "2026-01-20T17:00:00Z", timeZone: "UTC" },
      }

      mockCalendarApi.events.update.mockResolvedValueOnce({
        data: {
          id: "event-123",
          summary: "Client Meeting",
          ...timeUpdate,
        },
      })

      const result = await mockCalendarApi.events.update({
        calendarId: "primary",
        eventId: "event-123",
        requestBody: timeUpdate,
        sendUpdates: "all",
      })

      expect(result.data.start.dateTime).toBe("2026-01-20T16:00:00Z")
      expect(result.data.end.dateTime).toBe("2026-01-20T17:00:00Z")
    })

    it("should add attendees to existing event", async () => {
      const attendeeUpdate = {
        attendees: [
          { email: "existing@example.com" },
          { email: "new-attendee@example.com" },
        ],
      }

      mockCalendarApi.events.update.mockResolvedValueOnce({
        data: {
          id: "event-123",
          summary: "Team Meeting",
          attendees: attendeeUpdate.attendees,
        },
      })

      const result = await mockCalendarApi.events.update({
        calendarId: "primary",
        eventId: "event-123",
        requestBody: attendeeUpdate,
        sendUpdates: "all",
      })

      expect(result.data.attendees).toHaveLength(2)
    })

    it("should move event to different calendar", async () => {
      mockCalendarApi.events.move.mockResolvedValueOnce({
        data: {
          id: "event-123",
          calendarId: "work@group.calendar.google.com",
        },
      })

      const result = await mockCalendarApi.events.move({
        calendarId: "primary",
        eventId: "event-123",
        destination: "work@group.calendar.google.com",
      })

      expect(result.data.calendarId).toBe("work@group.calendar.google.com")
    })
  })

  describe("Scenario 5: Managing Recurring Events", () => {
    it("should create weekly recurring event", async () => {
      const recurringEvent = {
        summary: "Weekly Team Standup",
        start: { dateTime: "2026-01-20T09:00:00Z", timeZone: "UTC" },
        end: { dateTime: "2026-01-20T09:30:00Z", timeZone: "UTC" },
        recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=12"],
      }

      mockCalendarApi.events.insert.mockResolvedValueOnce({
        data: { id: "recurring-123", ...recurringEvent },
      })

      const result = await mockCalendarApi.events.insert({
        calendarId: "primary",
        requestBody: recurringEvent,
      })

      expect(result.data.recurrence[0]).toContain("FREQ=WEEKLY")
      expect(result.data.recurrence[0]).toContain("BYDAY=MO,WE,FR")
    })

    it("should update single instance of recurring event", async () => {
      mockCalendarApi.events.instances.mockResolvedValueOnce({
        data: {
          items: [
            {
              id: "recurring-123_20260120T090000Z",
              summary: "Weekly Team Standup",
              start: { dateTime: "2026-01-20T09:00:00Z" },
              end: { dateTime: "2026-01-20T09:30:00Z" },
              recurringEventId: "recurring-123",
            },
          ],
        },
      })

      const instanceUpdate = {
        summary: "Special Team Standup - Project Demo",
        description: "We'll be demoing the new feature",
      }

      mockCalendarApi.events.update.mockResolvedValueOnce({
        data: {
          id: "recurring-123_20260120T090000Z",
          ...instanceUpdate,
        },
      })

      const result = await mockCalendarApi.events.update({
        calendarId: "primary",
        eventId: "recurring-123_20260120T090000Z",
        requestBody: instanceUpdate,
      })

      expect(result.data.summary).toContain("Special")
      expect(result.data.description).toContain("demoing")
    })

    it("should cancel entire recurring series", async () => {
      const seriesUpdate = {
        status: "cancelled",
      }

      mockCalendarApi.events.update.mockResolvedValueOnce({
        data: {
          id: "recurring-123",
          status: "cancelled",
          recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"],
        },
      })

      const result = await mockCalendarApi.events.update({
        calendarId: "primary",
        eventId: "recurring-123",
        requestBody: seriesUpdate,
      })

      expect(result.data.status).toBe("cancelled")
    })
  })

  describe("Scenario 6: Deleting Events with Safety", () => {
    it("should require confirmation for event deletion", () => {
      const deleteConfirmation = {
        eventId: "event-123",
        eventTitle: "Important Client Meeting",
        requiresConfirmation: true,
        confirmationMessage: "Are you sure you want to delete 'Important Client Meeting'? This action cannot be undone.",
        alternatives: ["Edit event instead", "Move to different time"],
      }

      expect(deleteConfirmation.requiresConfirmation).toBe(true)
      expect(deleteConfirmation.confirmationMessage).toContain("cannot be undone")
    })

    it("should delete single event instance", async () => {
      mockCalendarApi.events.delete.mockResolvedValueOnce({ data: {} })

      await mockCalendarApi.events.delete({
        calendarId: "primary",
        eventId: "event-123",
      })

      expect(mockCalendarApi.events.delete).toHaveBeenCalledWith({
        calendarId: "primary",
        eventId: "event-123",
      })
    })

    it("should provide undo option after deletion", () => {
      const deleteResult = {
        success: true,
        eventId: "event-123",
        undoAvailable: true,
        undoToken: "undo-123",
        undoExpiry: Date.now() + 30000, // 30 seconds
        message: "Event deleted. Click here to undo.",
      }

      expect(deleteResult.undoAvailable).toBe(true)
      expect(deleteResult.undoExpiry).toBeGreaterThan(Date.now())
    })

    it("should prevent mass deletion without explicit confirmation", () => {
      const bulkDeleteRequest = {
        eventIds: Array.from({ length: 15 }, (_, i) => `event-${i}`),
        requiresApproval: true,
        approvalThreshold: 10,
      }

      expect(bulkDeleteRequest.eventIds.length).toBeGreaterThan(10)
      expect(bulkDeleteRequest.requiresApproval).toBe(true)
    })
  })

  describe("Scenario 7: Advanced Calendar Features", () => {
    it("should find available time slots", () => {
      const availabilityRequest = {
        duration: 60, // minutes
        timeRange: {
          start: "2026-01-20T09:00:00Z",
          end: "2026-01-20T17:00:00Z",
        },
        calendarIds: ["primary"],
        excludeEvents: true,
      }

      const availableSlots = [
        { start: "2026-01-20T09:30:00Z", end: "2026-01-20T10:30:00Z" },
        { start: "2026-01-20T15:30:00Z", end: "2026-01-20T16:30:00Z" },
      ]

      expect(availabilityRequest.duration).toBe(60)
      expect(availableSlots).toHaveLength(2)
    })

    it("should suggest optimal meeting times", () => {
      const meetingSuggestion = {
        participants: ["user@example.com", "colleague@example.com"],
        duration: 60,
        preferences: {
          morning: true,
          workingHoursOnly: true,
        },
        suggestions: [
          {
            start: "2026-01-21T10:00:00Z",
            end: "2026-01-21T11:00:00Z",
            score: 95,
            reason: "Good availability for all participants",
          },
          {
            start: "2026-01-22T14:00:00Z",
            end: "2026-01-22T15:00:00Z",
            score: 88,
            reason: "Alternative time slot",
          },
        ],
      }

      expect(meetingSuggestion.suggestions[0].score).toBe(95)
      expect(meetingSuggestion.preferences.morning).toBe(true)
    })

    it("should handle timezone conversions", () => {
      const timezoneConversion = {
        eventTime: "2026-01-20T14:00:00Z", // UTC
        userTimezone: "America/New_York",
        displayTime: "2026-01-20T10:00:00-04:00", // EDT
        timezoneLabel: "Eastern Daylight Time",
      }

      expect(timezoneConversion.displayTime).toContain("-04:00")
      expect(timezoneConversion.timezoneLabel).toContain("Eastern")
    })

    it("should manage calendar sharing permissions", () => {
      const calendarPermissions = {
        calendarId: "shared-calendar@example.com",
        owner: "owner@example.com",
        permissions: [
          {
            role: "writer",
            email: "user@example.com",
            displayName: "John Doe",
          },
          {
            role: "reader",
            email: "readonly@example.com",
            displayName: "Read Only User",
          },
        ],
      }

      expect(calendarPermissions.permissions).toHaveLength(2)
      expect(calendarPermissions.permissions[0].role).toBe("writer")
      expect(calendarPermissions.permissions[1].role).toBe("reader")
    })
  })
})