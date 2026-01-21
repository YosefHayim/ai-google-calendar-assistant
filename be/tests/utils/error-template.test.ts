import { beforeEach, describe, expect, it, jest } from "@jest/globals"

import type { Response } from "express"
import errorTemplate from "@/lib/http/error-template"

describe("errorTemplate", () => {
  let mockResponse: Partial<Response>
  let statusMock: jest.Mock
  let jsonMock: jest.Mock

  beforeEach(() => {
    jsonMock = jest.fn()
    statusMock = jest.fn().mockReturnValue({ json: jsonMock })
    mockResponse = {
      status: statusMock as unknown as Response["status"],
    }
  })

  describe("with Response object", () => {
    it("should send error response and throw error", () => {
      expect(() => {
        errorTemplate("Test error", 400, mockResponse as Response)
      }).toThrow("Test error")

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        status: "error",
        code: 400,
        message: "Test error",
      })
    })

    it("should handle 404 error", () => {
      expect(() => {
        errorTemplate("Not found", 404, mockResponse as Response)
      }).toThrow("Not found")

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith({
        status: "error",
        code: 404,
        message: "Not found",
      })
    })

    it("should handle 500 error", () => {
      expect(() => {
        errorTemplate("Server error", 500, mockResponse as Response)
      }).toThrow("Server error")

      expect(statusMock).toHaveBeenCalledWith(500)
    })

    it("should handle 401 unauthorized", () => {
      expect(() => {
        errorTemplate("Unauthorized", 401, mockResponse as Response)
      }).toThrow("Unauthorized")

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({
        status: "error",
        code: 401,
        message: "Unauthorized",
      })
    })

    it("should handle 403 forbidden", () => {
      expect(() => {
        errorTemplate("Forbidden", 403, mockResponse as Response)
      }).toThrow("Forbidden")

      expect(statusMock).toHaveBeenCalledWith(403)
    })
  })

  describe("without Response object", () => {
    it("should throw error without sending response", () => {
      expect(() => {
        errorTemplate("Test error", 400)
      }).toThrow("Test error")
    })

    it("should throw error with status in cause", () => {
      try {
        errorTemplate("Test error", 400)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        if (error instanceof Error) {
          expect((error.cause as { status: number })?.status).toBe(400)
        }
      }
    })

    it("should preserve error message", () => {
      const message = "Custom error message"
      try {
        errorTemplate(message, 500)
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toBe(message)
        }
      }
    })
  })

  describe("error properties", () => {
    it("should create error with correct cause", () => {
      try {
        errorTemplate("Test", 400, mockResponse as Response)
      } catch (error) {
        if (error instanceof Error) {
          expect((error.cause as { status: number })?.status).toBe(400)
        }
      }
    })

    it("should handle different status codes in cause", () => {
      const testCases = [400, 401, 403, 404, 422, 500, 502, 503]

      testCases.forEach((status) => {
        try {
          errorTemplate("Error", status)
        } catch (error) {
          if (error instanceof Error) {
            expect((error.cause as { status: number })?.status).toBe(status)
          }
        }
      })
    })
  })

  describe("edge cases", () => {
    it("should handle empty error message", () => {
      expect(() => {
        errorTemplate("", 400, mockResponse as Response)
      }).toThrow()

      expect(jsonMock).toHaveBeenCalledWith({
        status: "error",
        code: 400,
        message: "",
      })
    })

    it("should handle very long error message", () => {
      const longMessage = "a".repeat(1000)
      expect(() => {
        errorTemplate(longMessage, 400, mockResponse as Response)
      }).toThrow(longMessage)

      expect(jsonMock).toHaveBeenCalledWith({
        status: "error",
        code: 400,
        message: longMessage,
      })
    })

    it("should handle special characters in message", () => {
      const specialMessage = "Error: User's \"data\" isn't valid!"
      expect(() => {
        errorTemplate(specialMessage, 400, mockResponse as Response)
      }).toThrow(specialMessage)
    })

    it("should handle undefined response gracefully", () => {
      expect(() => {
        errorTemplate("Error", 400, undefined)
      }).toThrow("Error")
    })
  })
})
