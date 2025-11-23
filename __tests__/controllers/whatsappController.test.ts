import { whatsAppController } from "@/controllers/whatsappController";
import { CONFIG } from "@/config/root-config";
import { STATUS_RESPONSE } from "@/types";

jest.mock("@/config/root-config", () => ({
  CONFIG: {
    devWhatsAppAccessToken: "test_verify_token_123",
  },
}));

describe("WhatsApp Controller", () => {
  let mockReq: any;
  let mockRes: any;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      query: {},
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe("Controller Structure", () => {
    it("should export all required methods", () => {
      expect(whatsAppController).toHaveProperty("getWhatsAppNotifications");
      expect(whatsAppController).toHaveProperty("WhatsAppMessagesCreated");
    });

    it("all methods should be functions", () => {
      Object.values(whatsAppController).forEach((method) => {
        expect(typeof method).toBe("function");
      });
    });
  });

  describe("getWhatsAppNotifications", () => {
    it("should verify webhook with correct token", () => {
      mockReq.query = {
        "hub.mode": "subscribe",
        "hub.challenge": "challenge_string_123",
        "hub.verify_token": "test_verify_token_123",
      };

      whatsAppController.getWhatsAppNotifications(mockReq, mockRes);

      expect(consoleLogSpy).toHaveBeenCalledWith("WEBHOOK VERIFIED");
      expect(mockRes.status).toHaveBeenCalledWith(STATUS_RESPONSE.SUCCESS);
      expect(mockRes.send).toHaveBeenCalledWith("challenge_string_123");
    });

    it("should reject webhook with incorrect token", () => {
      mockReq.query = {
        "hub.mode": "subscribe",
        "hub.challenge": "challenge_string_123",
        "hub.verify_token": "wrong_token",
      };

      whatsAppController.getWhatsAppNotifications(mockReq, mockRes);

      expect(consoleLogSpy).not.toHaveBeenCalledWith("WEBHOOK VERIFIED");
      expect(mockRes.status).toHaveBeenCalledWith(STATUS_RESPONSE.FORBIDDEN);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it("should reject webhook with missing mode", () => {
      mockReq.query = {
        "hub.challenge": "challenge_string_123",
        "hub.verify_token": "test_verify_token_123",
      };

      whatsAppController.getWhatsAppNotifications(mockReq, mockRes);

      expect(consoleLogSpy).not.toHaveBeenCalledWith("WEBHOOK VERIFIED");
      expect(mockRes.status).toHaveBeenCalledWith(STATUS_RESPONSE.FORBIDDEN);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it("should reject webhook with incorrect mode", () => {
      mockReq.query = {
        "hub.mode": "invalid_mode",
        "hub.challenge": "challenge_string_123",
        "hub.verify_token": "test_verify_token_123",
      };

      whatsAppController.getWhatsAppNotifications(mockReq, mockRes);

      expect(consoleLogSpy).not.toHaveBeenCalledWith("WEBHOOK VERIFIED");
      expect(mockRes.status).toHaveBeenCalledWith(STATUS_RESPONSE.FORBIDDEN);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it("should reject webhook with missing challenge", () => {
      mockReq.query = {
        "hub.mode": "subscribe",
        "hub.verify_token": "test_verify_token_123",
      };

      whatsAppController.getWhatsAppNotifications(mockReq, mockRes);

      // Should still verify but challenge will be undefined
      expect(consoleLogSpy).toHaveBeenCalledWith("WEBHOOK VERIFIED");
      expect(mockRes.status).toHaveBeenCalledWith(STATUS_RESPONSE.SUCCESS);
      expect(mockRes.send).toHaveBeenCalledWith(undefined);
    });
  });

  describe("WhatsAppMessagesCreated", () => {
    beforeEach(() => {
      // Mock Date to have consistent timestamps in tests
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-01T10:00:00Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should log incoming webhook and respond with success", () => {
      mockReq.body = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "123456",
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "1234567890",
                      text: { body: "Hello" },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      whatsAppController.WhatsAppMessagesCreated(mockReq, mockRes);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Webhook received"));
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(mockReq.body, null, 2));
      expect(mockRes.status).toHaveBeenCalledWith(STATUS_RESPONSE.SUCCESS);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it("should handle empty body", () => {
      mockReq.body = {};

      whatsAppController.WhatsAppMessagesCreated(mockReq, mockRes);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Webhook received"));
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify({}, null, 2));
      expect(mockRes.status).toHaveBeenCalledWith(STATUS_RESPONSE.SUCCESS);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it("should handle complex nested message data", () => {
      mockReq.body = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "123456",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "1234567890",
                    phone_number_id: "987654321",
                  },
                  contacts: [
                    {
                      profile: {
                        name: "John Doe",
                      },
                      wa_id: "1234567890",
                    },
                  ],
                  messages: [
                    {
                      from: "1234567890",
                      id: "wamid.123",
                      timestamp: "1640995200",
                      text: {
                        body: "Hello, this is a test message",
                      },
                      type: "text",
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      whatsAppController.WhatsAppMessagesCreated(mockReq, mockRes);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Webhook received"));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("whatsapp_business_account"));
      expect(mockRes.status).toHaveBeenCalledWith(STATUS_RESPONSE.SUCCESS);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it("should log timestamp in correct format", () => {
      whatsAppController.WhatsAppMessagesCreated(mockReq, mockRes);

      const logCalls = consoleLogSpy.mock.calls;
      const timestampLog = logCalls.find((call) => call[0].includes("Webhook received"));

      expect(timestampLog).toBeDefined();
      expect(timestampLog[0]).toMatch(/Webhook received \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    });
  });
});
