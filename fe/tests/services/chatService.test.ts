import { describe, expect, it, beforeEach, mock, spyOn } from "bun:test";

// Mock apiClient
const mockGet = mock(() => Promise.resolve({ data: {} }));
const mockPost = mock(() => Promise.resolve({ data: {} }));
const mockDelete = mock(() => Promise.resolve({ data: {} }));

mock.module("@/lib/api/client", () => ({
  apiClient: {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  },
}));

// Import after mocks
import {
  sendChatMessage,
  getConversations,
  getConversation,
  deleteConversation,
  deleteAllConversations,
  continueConversation,
  startNewConversation,
} from "@/services/chatService";

describe("chatService", () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockPost.mockClear();
    mockDelete.mockClear();
  });

  describe("sendChatMessage", () => {
    it("should send chat message and return response", async () => {
      const mockResponse = {
        data: {
          data: {
            content: "AI response",
            conversationId: "conv-123",
            title: "Test Conversation",
          },
        },
      };
      mockPost.mockResolvedValue(mockResponse);

      const result = await sendChatMessage("Hello", []);

      expect(mockPost).toHaveBeenCalledWith("/api/chat", {
        message: "Hello",
        history: [],
        source: "web",
      });
      expect(result).toEqual({
        content: "AI response",
        conversationId: "conv-123",
        title: "Test Conversation",
      });
    });

    it("should return default content when no response data", async () => {
      mockPost.mockResolvedValue({ data: {} });

      const result = await sendChatMessage("Hello", []);

      expect(result.content).toBe("No response received");
    });

    it("should send message with history", async () => {
      const history = [
        { role: "user" as const, content: "Previous message" },
        { role: "assistant" as const, content: "Previous response" },
      ];
      mockPost.mockResolvedValue({ data: { data: { content: "Response" } } });

      await sendChatMessage("New message", history);

      expect(mockPost).toHaveBeenCalledWith("/api/chat", {
        message: "New message",
        history,
        source: "web",
      });
    });
  });

  describe("getConversations", () => {
    it("should fetch conversations with default pagination", async () => {
      const mockConversations = [
        { id: "conv-1", title: "Conversation 1" },
        { id: "conv-2", title: "Conversation 2" },
      ];
      mockGet.mockResolvedValue({
        data: {
          data: {
            conversations: mockConversations,
            pagination: { limit: 20, offset: 0, count: 2 },
          },
        },
      });

      const result = await getConversations();

      expect(mockGet).toHaveBeenCalledWith("/api/chat/conversations?limit=20&offset=0");
      expect(result.conversations).toEqual(mockConversations);
    });

    it("should fetch conversations with custom pagination", async () => {
      mockGet.mockResolvedValue({ data: { data: { conversations: [], pagination: {} } } });

      await getConversations(10, 5);

      expect(mockGet).toHaveBeenCalledWith("/api/chat/conversations?limit=10&offset=5");
    });

    it("should include search parameter when provided", async () => {
      mockGet.mockResolvedValue({ data: { data: { conversations: [], pagination: {} } } });

      await getConversations(20, 0, "test");

      expect(mockGet).toHaveBeenCalledWith("/api/chat/conversations?limit=20&offset=0&search=test");
    });

    it("should not include search parameter when less than 2 characters", async () => {
      mockGet.mockResolvedValue({ data: { data: { conversations: [], pagination: {} } } });

      await getConversations(20, 0, "t");

      expect(mockGet).toHaveBeenCalledWith("/api/chat/conversations?limit=20&offset=0");
    });

    it("should return empty array when no data", async () => {
      mockGet.mockResolvedValue({ data: {} });

      const result = await getConversations();

      expect(result.conversations).toEqual([]);
    });
  });

  describe("getConversation", () => {
    it("should fetch conversation by ID", async () => {
      const mockConversation = {
        id: "conv-123",
        title: "Test",
        messages: [],
      };
      mockGet.mockResolvedValue({
        data: { data: { conversation: mockConversation } },
      });

      const result = await getConversation("conv-123");

      expect(mockGet).toHaveBeenCalledWith("/api/chat/conversations/conv-123");
      expect(result).toEqual(mockConversation);
    });

    it("should return null when conversation not found", async () => {
      mockGet.mockResolvedValue({ data: { data: { conversation: null } } });

      const result = await getConversation("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null on error", async () => {
      mockGet.mockRejectedValue(new Error("Network error"));

      const result = await getConversation("conv-123");

      expect(result).toBeNull();
    });
  });

  describe("deleteConversation", () => {
    it("should delete conversation and return true", async () => {
      mockDelete.mockResolvedValue({ data: {} });

      const result = await deleteConversation("conv-123");

      expect(mockDelete).toHaveBeenCalledWith("/api/chat/conversations/conv-123");
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      mockDelete.mockRejectedValue(new Error("Network error"));

      const result = await deleteConversation("conv-123");

      expect(result).toBe(false);
    });
  });

  describe("deleteAllConversations", () => {
    it("should delete all conversations and return true", async () => {
      mockDelete.mockResolvedValue({ data: {} });

      const result = await deleteAllConversations();

      expect(mockDelete).toHaveBeenCalledWith("/api/conversations/all", {
        data: { is_active: false },
      });
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      mockDelete.mockRejectedValue(new Error("Network error"));

      const result = await deleteAllConversations();

      expect(result).toBe(false);
    });
  });

  describe("continueConversation", () => {
    it("should continue conversation and return response", async () => {
      mockPost.mockResolvedValue({
        data: { data: { content: "Continued response", title: "Updated Title" } },
      });

      const result = await continueConversation("conv-123", "Continue message");

      expect(mockPost).toHaveBeenCalledWith("/api/chat/conversations/conv-123/messages", {
        message: "Continue message",
        source: "web",
      });
      expect(result).toEqual({
        content: "Continued response",
        conversationId: "conv-123",
        title: "Updated Title",
      });
    });

    it("should return default content when no response data", async () => {
      mockPost.mockResolvedValue({ data: {} });

      const result = await continueConversation("conv-123", "Message");

      expect(result.content).toBe("No response received");
    });
  });

  describe("startNewConversation", () => {
    it("should start new conversation and return true", async () => {
      mockPost.mockResolvedValue({ data: {} });

      const result = await startNewConversation();

      expect(mockPost).toHaveBeenCalledWith("/api/chat/conversations/new");
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      mockPost.mockRejectedValue(new Error("Network error"));

      const result = await startNewConversation();

      expect(result).toBe(false);
    });
  });
});
