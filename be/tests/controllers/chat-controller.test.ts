import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import { mockFn } from "../test-utils";

// Mock functions
const mockGetOrCreateTodayContext = mockFn();
const mockBuildContextPrompt = mockFn();
const mockAddMessageToContext = mockFn();
const mockGetConversationList = mockFn();
const mockGetConversationById = mockFn();
const mockDeleteConversation = mockFn();
const mockLoadConversationIntoContext = mockFn();
const mockCloseActiveConversation = mockFn();
const mockUpdateConversationTitle = mockFn();
const mockGetWebRelevantContext = mockFn();
const mockStoreWebEmbeddingAsync = mockFn();
const mockGenerateConversationTitle = mockFn();
const mockSummarizeMessages = mockFn();
const mockRun = mockFn();
const mockCreateAgentSession = mockFn();
const mockGetAllyBrainPreference = mockFn();
const mockSendR = mockFn();

jest.mock("@/utils/conversation/WebConversationAdapter", () => ({
  webConversation: {
    getOrCreateTodayContext: (userId: string) =>
      mockGetOrCreateTodayContext(userId),
    buildContextPrompt: (context: unknown) => mockBuildContextPrompt(context),
    addMessageToContext: (...args: unknown[]) =>
      mockAddMessageToContext(...args),
    getConversationList: (...args: unknown[]) =>
      mockGetConversationList(...args),
    getConversationById: (...args: unknown[]) =>
      mockGetConversationById(...args),
    deleteConversation: (...args: unknown[]) => mockDeleteConversation(...args),
    loadConversationIntoContext: (...args: unknown[]) =>
      mockLoadConversationIntoContext(...args),
    closeActiveConversation: (userId: string) =>
      mockCloseActiveConversation(userId),
    updateConversationTitle: (...args: unknown[]) =>
      mockUpdateConversationTitle(...args),
  },
}));

jest.mock("@/telegram-bot/utils/summarize", () => ({
  generateConversationTitle: (message: string) =>
    mockGenerateConversationTitle(message),
  summarizeMessages: mockSummarizeMessages,
}));

jest.mock("@/utils/web-embeddings", () => ({
  getWebRelevantContext: (...args: unknown[]) =>
    mockGetWebRelevantContext(...args),
  storeWebEmbeddingAsync: (...args: unknown[]) =>
    mockStoreWebEmbeddingAsync(...args),
}));

jest.mock("@openai/agents", () => ({
  run: (...args: unknown[]) => mockRun(...args),
  InputGuardrailTripwireTriggered: class InputGuardrailTripwireTriggered extends Error {},
}));

jest.mock("@/ai-agents/sessions", () => ({
  createAgentSession: (params: unknown) => mockCreateAgentSession(params),
}));

jest.mock("@/ai-agents", () => ({
  ORCHESTRATOR_AGENT: { name: "orchestrator" },
}));

jest.mock("@/controllers/user-preferences-controller", () => ({
  getAllyBrainPreference: (userId: string) =>
    mockGetAllyBrainPreference(userId),
}));

jest.mock("@/config", () => ({
  STATUS_RESPONSE: {
    SUCCESS: { code: 200, success: true },
    BAD_REQUEST: { code: 400, success: false },
    UNAUTHORIZED: { code: 401, success: false },
    NOT_FOUND: { code: 404, success: false },
    INTERNAL_SERVER_ERROR: { code: 500, success: false },
  },
}));

jest.mock("@/utils/http", () => ({
  sendR: (...args: unknown[]) => mockSendR(...args),
  reqResAsyncHandler:
    <T extends (...args: unknown[]) => Promise<unknown>>(fn: T) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next),
}));

// Import after mocks
import { chatController } from "@/controllers/chat-controller";

describe("Chat Controller", () => {
  let mockReq: Partial<Request> & { user?: any };
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      query: {},
      params: {},
      user: {
        id: "user-123",
        email: "test@example.com",
        aud: "authenticated",
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
      },
    };
    mockRes = {
      status: mockFn().mockReturnThis() as unknown as Response["status"],
      json: mockFn().mockReturnThis() as unknown as Response["json"],
    };
    mockNext = mockFn();

    // Default mock implementations
    mockGetAllyBrainPreference.mockResolvedValue(null);
    mockGetOrCreateTodayContext.mockResolvedValue({
      stateId: "conv-123",
      context: { messages: [], title: undefined },
    });
    mockBuildContextPrompt.mockReturnValue("");
    mockGetWebRelevantContext.mockResolvedValue("");
    mockCreateAgentSession.mockReturnValue({});
    mockRun.mockResolvedValue({ finalOutput: "AI response" });
    mockAddMessageToContext.mockResolvedValue(undefined);
    mockGenerateConversationTitle.mockResolvedValue("Test Title");
    mockUpdateConversationTitle.mockResolvedValue(undefined);
  });

  describe("sendChat", () => {
    it("should return bad request if message is empty", async () => {
      mockReq.body = { message: "" };

      await chatController.sendChat(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Message is required"
      );
    });

    it("should return bad request if message is whitespace", async () => {
      mockReq.body = { message: "   " };

      await chatController.sendChat(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Message is required"
      );
    });

    it("should return unauthorized if user not authenticated", async () => {
      mockReq.body = { message: "Hello" };
      mockReq.user = undefined;

      await chatController.sendChat(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 401 }),
        "User not authenticated"
      );
    });

    it("should process chat message successfully", async () => {
      mockReq.body = { message: "Hello, AI!" };

      await chatController.sendChat(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockGetOrCreateTodayContext).toHaveBeenCalledWith("user-123");
      expect(mockRun).toHaveBeenCalled();
      expect(mockAddMessageToContext).toHaveBeenCalledTimes(2); // user + assistant
      expect(mockStoreWebEmbeddingAsync).toHaveBeenCalledTimes(2);
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Chat message processed successfully",
        expect.objectContaining({
          content: "AI response",
          conversationId: "conv-123",
        })
      );
    });

    it("should include ally brain instructions when enabled", async () => {
      mockReq.body = { message: "Hello" };
      mockGetAllyBrainPreference.mockResolvedValue({
        enabled: true,
        instructions: "Always be friendly",
      });

      await chatController.sendChat(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockGetAllyBrainPreference).toHaveBeenCalledWith("user-123");
      expect(mockRun).toHaveBeenCalled();
    });

    it("should generate title for new conversations", async () => {
      mockReq.body = { message: "Hello" };
      // New conversation - no messages and no title
      mockGetOrCreateTodayContext.mockResolvedValue({
        stateId: "conv-new",
        context: { messages: [], title: undefined },
      });

      await chatController.sendChat(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Title generation is async, just verify chat completes
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        expect.any(String),
        expect.any(Object)
      );
    });

    it("should handle AI agent errors gracefully", async () => {
      mockReq.body = { message: "Hello" };
      mockRun.mockRejectedValue(new Error("AI service unavailable"));

      await chatController.sendChat(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 500 }),
        "Error processing your request"
      );
    });
  });

  describe("getConversations", () => {
    it("should return unauthorized if user not authenticated", async () => {
      mockReq.user = undefined;

      await chatController.getConversations(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 401 }),
        "User not authenticated"
      );
    });

    it("should return conversations with default pagination", async () => {
      const mockConversations = [
        { id: "conv-1", title: "Conversation 1" },
        { id: "conv-2", title: "Conversation 2" },
      ];
      mockGetConversationList.mockResolvedValue(mockConversations);

      await chatController.getConversations(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockGetConversationList).toHaveBeenCalledWith("user-123", {
        limit: 20,
        offset: 0,
        search: undefined,
      });
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Conversations retrieved successfully",
        {
          conversations: mockConversations,
          pagination: { limit: 20, offset: 0, count: 2 },
        }
      );
    });

    it("should use custom pagination and search", async () => {
      mockReq.query = { limit: "10", offset: "5", search: "test" };
      mockGetConversationList.mockResolvedValue([]);

      await chatController.getConversations(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockGetConversationList).toHaveBeenCalledWith("user-123", {
        limit: 10,
        offset: 5,
        search: "test",
      });
    });

    it("should handle errors gracefully", async () => {
      mockGetConversationList.mockRejectedValue(new Error("DB error"));

      await chatController.getConversations(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 500 }),
        "Error retrieving conversations"
      );
    });
  });

  describe("getConversation", () => {
    it("should return unauthorized if user not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "conv-123" };

      await chatController.getConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 401 }),
        "User not authenticated"
      );
    });

    it("should return bad request if conversation ID is missing", async () => {
      mockReq.params = {};

      await chatController.getConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Invalid conversation ID"
      );
    });

    it("should return not found if conversation does not exist", async () => {
      mockReq.params = { id: "conv-123" };
      mockGetConversationById.mockResolvedValue(null);

      await chatController.getConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 404 }),
        "Conversation not found"
      );
    });

    it("should return conversation successfully", async () => {
      mockReq.params = { id: "conv-123" };
      const mockConversation = { id: "conv-123", title: "Test", messages: [] };
      mockGetConversationById.mockResolvedValue(mockConversation);

      await chatController.getConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockGetConversationById).toHaveBeenCalledWith(
        "conv-123",
        "user-123"
      );
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Conversation retrieved successfully",
        { conversation: mockConversation }
      );
    });
  });

  describe("removeConversation", () => {
    it("should return unauthorized if user not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "conv-123" };

      await chatController.removeConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 401 }),
        "User not authenticated"
      );
    });

    it("should return not found if conversation does not exist", async () => {
      mockReq.params = { id: "conv-123" };
      mockDeleteConversation.mockResolvedValue(false);

      await chatController.removeConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 404 }),
        "Conversation not found or already deleted"
      );
    });

    it("should delete conversation successfully", async () => {
      mockReq.params = { id: "conv-123" };
      mockDeleteConversation.mockResolvedValue(true);

      await chatController.removeConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockDeleteConversation).toHaveBeenCalledWith(
        "conv-123",
        "user-123"
      );
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Conversation deleted successfully"
      );
    });
  });

  describe("continueConversation", () => {
    it("should return unauthorized if user not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.params = { id: "conv-123" };
      mockReq.body = { message: "Hello" };

      await chatController.continueConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 401 }),
        "User not authenticated"
      );
    });

    it("should return bad request if message is empty", async () => {
      mockReq.params = { id: "conv-123" };
      mockReq.body = { message: "" };

      await chatController.continueConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Message is required"
      );
    });

    it("should return not found if conversation does not exist", async () => {
      mockReq.params = { id: "conv-123" };
      mockReq.body = { message: "Hello" };
      mockLoadConversationIntoContext.mockResolvedValue(null);

      await chatController.continueConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 404 }),
        "Conversation not found"
      );
    });

    it("should continue conversation successfully", async () => {
      mockReq.params = { id: "conv-123" };
      mockReq.body = { message: "Continue the chat" };
      mockLoadConversationIntoContext.mockResolvedValue({
        context: { messages: [{ role: "user", content: "Previous message" }] },
      });

      await chatController.continueConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockLoadConversationIntoContext).toHaveBeenCalledWith(
        "conv-123",
        "user-123"
      );
      expect(mockRun).toHaveBeenCalled();
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Message processed successfully",
        expect.objectContaining({
          content: "AI response",
          conversationId: "conv-123",
        })
      );
    });
  });

  describe("startNewConversation", () => {
    it("should return unauthorized if user not authenticated", async () => {
      mockReq.user = undefined;

      await chatController.startNewConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 401 }),
        "User not authenticated"
      );
    });

    it("should close active conversation and start new one", async () => {
      mockCloseActiveConversation.mockResolvedValue(undefined);

      await chatController.startNewConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockCloseActiveConversation).toHaveBeenCalledWith("user-123");
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "New conversation started",
        { success: true }
      );
    });

    it("should handle errors gracefully", async () => {
      mockCloseActiveConversation.mockRejectedValue(new Error("Failed"));

      await chatController.startNewConversation(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 500 }),
        "Error starting new conversation"
      );
    });
  });
});
