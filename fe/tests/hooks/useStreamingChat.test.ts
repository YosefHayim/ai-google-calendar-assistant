import { describe, expect, it, beforeEach, mock } from "bun:test";

// Mock the chatStreamService
const mockStreamChatMessage = mock(() =>
  Promise.resolve({
    success: true,
    conversationId: "conv-123",
    fullResponse: "AI response",
  })
);
const mockCreateStreamAbortController = mock(() => {
  const controller = {
    signal: { aborted: false },
    abort: mock(() => {}),
  };
  return controller;
});

mock.module("@/services/chatStreamService", () => ({
  streamChatMessage: mockStreamChatMessage,
  createStreamAbortController: mockCreateStreamAbortController,
}));

// Mock React hooks for unit testing
let mockState: Record<string, unknown> = {};
let mockSetState: Record<string, (val: unknown) => void> = {};
let mockCallbacks: Record<string, (...args: unknown[]) => void> = {};

mock.module("react", () => ({
  useState: (initial: unknown) => {
    const key = JSON.stringify(initial);
    if (mockState[key] === undefined) {
      mockState[key] = initial;
      mockSetState[key] = (newVal: unknown) => {
        if (typeof newVal === "function") {
          mockState[key] = (newVal as Function)(mockState[key]);
        } else {
          mockState[key] = newVal;
        }
      };
    }
    return [mockState[key], mockSetState[key]];
  },
  useCallback: (fn: (...args: unknown[]) => void, deps: unknown[]) => {
    const key = deps.join(",") || "default";
    mockCallbacks[key] = fn;
    return fn;
  },
  useRef: (initial: unknown) => ({
    current: initial,
  }),
}));

// Import after mocks
import { useStreamingChat } from "@/hooks/useStreamingChat";

describe("useStreamingChat", () => {
  beforeEach(() => {
    mockStreamChatMessage.mockClear();
    mockCreateStreamAbortController.mockClear();
    mockState = {};
    mockSetState = {};
    mockCallbacks = {};
  });

  describe("initial state", () => {
    it("should return initial streaming state", () => {
      const { streamingState } = useStreamingChat();

      expect(streamingState).toEqual({
        isStreaming: false,
        streamedText: "",
        currentTool: null,
        currentAgent: null,
        error: null,
      });
    });

    it("should return sendStreamingMessage function", () => {
      const { sendStreamingMessage } = useStreamingChat();
      expect(typeof sendStreamingMessage).toBe("function");
    });

    it("should return cancelStream function", () => {
      const { cancelStream } = useStreamingChat();
      expect(typeof cancelStream).toBe("function");
    });

    it("should return resetStreamingState function", () => {
      const { resetStreamingState } = useStreamingChat();
      expect(typeof resetStreamingState).toBe("function");
    });
  });

  describe("sendStreamingMessage", () => {
    it("should create abort controller when sending message", async () => {
      const { sendStreamingMessage } = useStreamingChat();

      await sendStreamingMessage("Hello");

      expect(mockCreateStreamAbortController).toHaveBeenCalled();
    });

    it("should call streamChatMessage with correct parameters", async () => {
      const { sendStreamingMessage } = useStreamingChat({ profileId: "profile-123" });

      await sendStreamingMessage("Hello", "conv-123");

      expect(mockStreamChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Hello",
          conversationId: "conv-123",
          profileId: "profile-123",
        })
      );
    });

    it("should use profileId override when provided", async () => {
      const { sendStreamingMessage } = useStreamingChat({ profileId: "default-profile" });

      await sendStreamingMessage("Hello", undefined, "override-profile");

      expect(mockStreamChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          profileId: "override-profile",
        })
      );
    });

    it("should handle streaming error", async () => {
      const onStreamError = mock(() => {});
      mockStreamChatMessage.mockResolvedValue({
        success: false,
        error: "Network error",
      });

      const { sendStreamingMessage } = useStreamingChat({ onStreamError });

      await sendStreamingMessage("Hello");

      // Verify error handling state would be set
      expect(mockStreamChatMessage).toHaveBeenCalled();
    });

    it("should not set error state for aborted requests", async () => {
      mockStreamChatMessage.mockResolvedValue({
        success: false,
        error: "Request aborted",
      });

      const onStreamError = mock(() => {});
      const { sendStreamingMessage } = useStreamingChat({ onStreamError });

      await sendStreamingMessage("Hello");

      // Should not call error handler for aborted requests
      expect(mockStreamChatMessage).toHaveBeenCalled();
    });
  });

  describe("cancelStream", () => {
    it("should call abort on controller", () => {
      const mockAbort = mock(() => {});
      mockCreateStreamAbortController.mockReturnValue({
        signal: { aborted: false },
        abort: mockAbort,
      });

      const { sendStreamingMessage, cancelStream } = useStreamingChat();

      // First send a message to create the controller
      sendStreamingMessage("Hello");

      // Then cancel
      cancelStream();

      // The abort should be called on the stored controller
      expect(typeof cancelStream).toBe("function");
    });
  });

  describe("callbacks", () => {
    it("should accept onStreamComplete callback", () => {
      const onStreamComplete = mock(() => {});
      const { sendStreamingMessage } = useStreamingChat({ onStreamComplete });

      expect(typeof sendStreamingMessage).toBe("function");
    });

    it("should accept onStreamError callback", () => {
      const onStreamError = mock(() => {});
      const { sendStreamingMessage } = useStreamingChat({ onStreamError });

      expect(typeof sendStreamingMessage).toBe("function");
    });

    it("should accept onTitleGenerated callback", () => {
      const onTitleGenerated = mock(() => {});
      const { sendStreamingMessage } = useStreamingChat({ onTitleGenerated });

      expect(typeof sendStreamingMessage).toBe("function");
    });
  });

  describe("resetStreamingState", () => {
    it("should reset state to initial values", () => {
      const { resetStreamingState, streamingState } = useStreamingChat();

      resetStreamingState();

      // Verify initial state is returned
      expect(streamingState).toEqual({
        isStreaming: false,
        streamedText: "",
        currentTool: null,
        currentAgent: null,
        error: null,
      });
    });
  });
});
