import { beforeEach, describe, expect, it, jest } from "@jest/globals"

type AnyFn = (...args: unknown[]) => unknown

jest.mock("@/infrastructure/supabase/supabase", () => ({
  SUPABASE: {
    from: jest.fn(),
  },
}))

jest.mock("@/domains/storage/services/storage-service", () => ({
  StorageService: {
    uploadFile: jest.fn(),
  },
}))

jest.mock("@/config/env", () => ({
  env: {
    resend: {
      isEnabled: false,
      apiKey: "test-key",
      fromEmail: "support@test.com",
      supportEmail: "team@test.com",
    },
  },
}))

jest.mock("@/lib/logger", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}))

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ error: null }),
    },
  })),
}))

jest.mock("@react-email/components", () => ({
  render: jest.fn().mockResolvedValue("<html></html>"),
}))

jest.mock("@/emails/SupportTicketEmail", () => ({
  SupportTicketEmail: jest.fn().mockReturnValue({}),
}))

import { SUPABASE } from "@/infrastructure/supabase/supabase"
import { StorageService } from "@/domains/storage/services/storage-service"
import type {
  SupportTicket,
  CreateTicketInput,
} from "@/domains/support/services/support-ticket-service"

const mockSupabase = SUPABASE as jest.Mocked<typeof SUPABASE>
const mockStorageService = StorageService as jest.Mocked<typeof StorageService>

const createTestTicket = (overrides: Partial<SupportTicket> = {}): SupportTicket => ({
  id: "ticket-123",
  ticketNumber: "SUP-001",
  userId: "user-456",
  userEmail: "user@example.com",
  userName: "Test User",
  subject: "Test Issue",
  description: "This is a test issue description",
  category: "bug",
  priority: "medium",
  status: "open",
  attachments: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
})

const createDbTicket = (ticket: SupportTicket) => ({
  id: ticket.id,
  ticket_number: ticket.ticketNumber,
  user_id: ticket.userId,
  user_email: ticket.userEmail,
  user_name: ticket.userName,
  subject: ticket.subject,
  description: ticket.description,
  category: ticket.category,
  priority: ticket.priority,
  status: ticket.status,
  attachments: ticket.attachments,
  created_at: ticket.createdAt,
  updated_at: ticket.updatedAt,
})

describe("Support Ticket Service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe("createSupportTicket", () => {
    it("should create a support ticket with required fields", async () => {
      const testTicket = createTestTicket()
      const dbTicket = createDbTicket(testTicket)

      const mockSingle = jest.fn<AnyFn>().mockResolvedValue({
        data: dbTicket,
        error: null,
      })

      const mockSelect = jest.fn<AnyFn>().mockReturnValue({
        single: mockSingle,
      })

      const mockInsert = jest.fn<AnyFn>().mockReturnValue({
        select: mockSelect,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      const { createSupportTicket } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const input: CreateTicketInput = {
        userEmail: "user@example.com",
        subject: "Test Issue",
        description: "This is a test issue description",
      }

      const result = await createSupportTicket(input)

      expect(result.success).toBe(true)
      expect(result.ticket).toBeDefined()
      expect(result.ticket?.userEmail).toBe("user@example.com")
      expect(result.ticket?.subject).toBe("Test Issue")
    })

    it("should create ticket with optional userId and userName", async () => {
      const testTicket = createTestTicket({
        userId: "user-789",
        userName: "John Doe",
      })
      const dbTicket = createDbTicket(testTicket)

      const mockSingle = jest.fn<AnyFn>().mockResolvedValue({
        data: dbTicket,
        error: null,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn<AnyFn>().mockReturnValue({
          select: jest.fn<AnyFn>().mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      const { createSupportTicket } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const input: CreateTicketInput = {
        userId: "user-789",
        userEmail: "user@example.com",
        userName: "John Doe",
        subject: "Test Issue",
        description: "Description",
      }

      const result = await createSupportTicket(input)

      expect(result.success).toBe(true)
      expect(result.ticket?.userId).toBe("user-789")
      expect(result.ticket?.userName).toBe("John Doe")
    })

    it("should use default values for category and priority", async () => {
      const testTicket = createTestTicket({
        category: "other",
        priority: "medium",
      })
      const dbTicket = createDbTicket(testTicket)

      const mockSingle = jest.fn<AnyFn>().mockResolvedValue({
        data: dbTicket,
        error: null,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn<AnyFn>().mockReturnValue({
          select: jest.fn<AnyFn>().mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      const { createSupportTicket } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const result = await createSupportTicket({
        userEmail: "user@example.com",
        subject: "Test",
        description: "Description",
      })

      expect(result.success).toBe(true)
      expect(result.ticket?.category).toBe("other")
      expect(result.ticket?.priority).toBe("medium")
    })

    it("should handle attachments upload", async () => {
      const testTicket = createTestTicket()
      const dbTicket = createDbTicket(testTicket)

      const mockSingle = jest.fn<AnyFn>().mockResolvedValue({
        data: dbTicket,
        error: null,
      })

      const mockUpdate = jest.fn<AnyFn>().mockReturnValue({
        eq: jest.fn<AnyFn>().mockResolvedValue({ error: null }),
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn<AnyFn>().mockReturnValue({
          select: jest.fn<AnyFn>().mockReturnValue({
            single: mockSingle,
          }),
        }),
        update: mockUpdate,
      })

      ;(mockStorageService.uploadFile as jest.Mock).mockResolvedValue({
        success: true,
        url: "https://storage.example.com/file.pdf",
      })

      const { createSupportTicket } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const result = await createSupportTicket({
        userEmail: "user@example.com",
        subject: "Test",
        description: "Description",
        attachments: [
          {
            buffer: Buffer.from("test"),
            filename: "test.pdf",
            mimeType: "application/pdf",
          },
        ],
      })

      expect(result.success).toBe(true)
      expect(mockStorageService.uploadFile).toHaveBeenCalled()
    })

    it("should return error when database insert fails", async () => {
      const mockSingle = jest.fn<AnyFn>().mockResolvedValue({
        data: null,
        error: { message: "Database connection failed" },
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn<AnyFn>().mockReturnValue({
          select: jest.fn<AnyFn>().mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      const { createSupportTicket } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const result = await createSupportTicket({
        userEmail: "user@example.com",
        subject: "Test",
        description: "Description",
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe("Database connection failed")
    })
  })

  describe("getTicketsByUser", () => {
    it("should return all tickets for a user", async () => {
      const tickets = [
        createTestTicket({ id: "ticket-1", ticketNumber: "SUP-001" }),
        createTestTicket({ id: "ticket-2", ticketNumber: "SUP-002" }),
      ]

      const mockOrder = jest.fn<AnyFn>().mockResolvedValue({
        data: tickets.map(createDbTicket),
        error: null,
      })

      const mockEq = jest.fn<AnyFn>().mockReturnValue({
        order: mockOrder,
      })

      const mockSelect = jest.fn<AnyFn>().mockReturnValue({
        eq: mockEq,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const { getTicketsByUser } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const result = await getTicketsByUser("user-456")

      expect(result).toHaveLength(2)
      expect(result[0].ticketNumber).toBe("SUP-001")
      expect(result[1].ticketNumber).toBe("SUP-002")
    })

    it("should return empty array when user has no tickets", async () => {
      const mockOrder = jest.fn<AnyFn>().mockResolvedValue({
        data: [],
        error: null,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn<AnyFn>().mockReturnValue({
          eq: jest.fn<AnyFn>().mockReturnValue({
            order: mockOrder,
          }),
        }),
      })

      const { getTicketsByUser } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const result = await getTicketsByUser("user-no-tickets")

      expect(result).toEqual([])
    })

    it("should return empty array on database error", async () => {
      const mockOrder = jest.fn<AnyFn>().mockResolvedValue({
        data: null,
        error: { message: "Query failed" },
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn<AnyFn>().mockReturnValue({
          eq: jest.fn<AnyFn>().mockReturnValue({
            order: mockOrder,
          }),
        }),
      })

      const { getTicketsByUser } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const result = await getTicketsByUser("user-456")

      expect(result).toEqual([])
    })
  })

  describe("getTicketById", () => {
    it("should return ticket when found", async () => {
      const testTicket = createTestTicket()
      const dbTicket = createDbTicket(testTicket)

      const mockSingle = jest.fn<AnyFn>().mockResolvedValue({
        data: dbTicket,
        error: null,
      })

      const mockEq = jest.fn<AnyFn>().mockReturnValue({
        single: mockSingle,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn<AnyFn>().mockReturnValue({
          eq: mockEq,
        }),
      })

      const { getTicketById } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const result = await getTicketById("ticket-123")

      expect(result).not.toBeNull()
      expect(result?.id).toBe("ticket-123")
      expect(result?.ticketNumber).toBe("SUP-001")
    })

    it("should filter by userId when provided", async () => {
      const testTicket = createTestTicket()
      const dbTicket = createDbTicket(testTicket)

      const mockSingle = jest.fn<AnyFn>().mockResolvedValue({
        data: dbTicket,
        error: null,
      })

      const mockEqUserId = jest.fn<AnyFn>().mockReturnValue({
        single: mockSingle,
      })

      const mockEqTicketId = jest.fn<AnyFn>().mockReturnValue({
        eq: mockEqUserId,
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn<AnyFn>().mockReturnValue({
          eq: mockEqTicketId,
        }),
      })

      const { getTicketById } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const result = await getTicketById("ticket-123", "user-456")

      expect(result).not.toBeNull()
      expect(mockEqUserId).toHaveBeenCalledWith("user_id", "user-456")
    })

    it("should return null when ticket not found", async () => {
      const mockSingle = jest.fn<AnyFn>().mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      })

      ;(mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn<AnyFn>().mockReturnValue({
          eq: jest.fn<AnyFn>().mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      const { getTicketById } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const result = await getTicketById("nonexistent")

      expect(result).toBeNull()
    })
  })
})

describe("Support Ticket Business Scenarios", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe("Bug Report Scenario", () => {
    it("should create high priority bug report ticket", async () => {
      const bugTicket = createTestTicket({
        category: "bug",
        priority: "high",
        subject: "App crashes on startup",
      })
      const dbTicket = createDbTicket(bugTicket)

      const mockSingle = jest.fn<AnyFn>().mockResolvedValue({
        data: dbTicket,
        error: null,
      })

      ;(SUPABASE.from as jest.Mock).mockReturnValue({
        insert: jest.fn<AnyFn>().mockReturnValue({
          select: jest.fn<AnyFn>().mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      const { createSupportTicket } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const result = await createSupportTicket({
        userEmail: "user@example.com",
        subject: "App crashes on startup",
        description: "The app crashes immediately after login",
        category: "bug",
        priority: "high",
      })

      expect(result.success).toBe(true)
      expect(result.ticket?.category).toBe("bug")
      expect(result.ticket?.priority).toBe("high")
    })
  })

  describe("Feature Request Scenario", () => {
    it("should create feature request ticket with default medium priority", async () => {
      const featureTicket = createTestTicket({
        category: "feature_request",
        priority: "medium",
        subject: "Add dark mode support",
      })
      const dbTicket = createDbTicket(featureTicket)

      const mockSingle = jest.fn<AnyFn>().mockResolvedValue({
        data: dbTicket,
        error: null,
      })

      ;(SUPABASE.from as jest.Mock).mockReturnValue({
        insert: jest.fn<AnyFn>().mockReturnValue({
          select: jest.fn<AnyFn>().mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      const { createSupportTicket } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const result = await createSupportTicket({
        userEmail: "user@example.com",
        subject: "Add dark mode support",
        description: "Would love to have dark mode in the app",
        category: "feature_request",
      })

      expect(result.success).toBe(true)
      expect(result.ticket?.category).toBe("feature_request")
    })
  })

  describe("Anonymous Ticket Scenario", () => {
    it("should create ticket without userId for non-authenticated users", async () => {
      const anonTicket = createTestTicket({
        userId: null,
        userName: null,
      })
      const dbTicket = createDbTicket(anonTicket)

      const mockSingle = jest.fn<AnyFn>().mockResolvedValue({
        data: dbTicket,
        error: null,
      })

      ;(SUPABASE.from as jest.Mock).mockReturnValue({
        insert: jest.fn<AnyFn>().mockReturnValue({
          select: jest.fn<AnyFn>().mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      const { createSupportTicket } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const result = await createSupportTicket({
        userEmail: "anonymous@example.com",
        subject: "Question about pricing",
        description: "How much does the pro plan cost?",
        category: "question",
      })

      expect(result.success).toBe(true)
      expect(result.ticket?.userId).toBeNull()
    })
  })

  describe("Ticket with Attachments Scenario", () => {
    it("should handle multiple attachments", async () => {
      const testTicket = createTestTicket()
      const dbTicket = createDbTicket(testTicket)

      const mockSingle = jest.fn<AnyFn>().mockResolvedValue({
        data: dbTicket,
        error: null,
      })

      ;(SUPABASE.from as jest.Mock).mockReturnValue({
        insert: jest.fn<AnyFn>().mockReturnValue({
          select: jest.fn<AnyFn>().mockReturnValue({
            single: mockSingle,
          }),
        }),
        update: jest.fn<AnyFn>().mockReturnValue({
          eq: jest.fn<AnyFn>().mockResolvedValue({ error: null }),
        }),
      })

      ;(StorageService.uploadFile as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          url: "https://storage.example.com/screenshot.png",
        })
        .mockResolvedValueOnce({
          success: true,
          url: "https://storage.example.com/logs.txt",
        })

      const { createSupportTicket } = await import(
        "@/domains/support/services/support-ticket-service"
      )

      const result = await createSupportTicket({
        userEmail: "user@example.com",
        subject: "Bug with attachments",
        description: "See attached screenshots and logs",
        category: "bug",
        attachments: [
          {
            buffer: Buffer.from("png data"),
            filename: "screenshot.png",
            mimeType: "image/png",
          },
          {
            buffer: Buffer.from("log data"),
            filename: "logs.txt",
            mimeType: "text/plain",
          },
        ],
      })

      expect(result.success).toBe(true)
      expect(StorageService.uploadFile).toHaveBeenCalledTimes(2)
    })
  })
})
