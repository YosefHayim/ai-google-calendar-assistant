/**
 * Tests for RealtimeVoiceAgentService
 */

import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals";
import { RealtimeVoiceAgentService } from "@/utils/voice/realtimeVoiceAgentService";
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import type { AgentContext } from "@/utils/activateAgent";

// Mock dependencies
jest.mock("@openai/agents-realtime");
jest.mock("@/config/root-config", () => ({
  CONFIG: {
    openAiApiKey: "test-api-key",
  },
}));
jest.mock("@/utils/voice/audioConverter", () => ({
  convertOggToPcm16: jest.fn((buffer: Buffer) => Promise.resolve(buffer)),
  convertPcm16ToOgg: jest.fn((buffer: Buffer) => Promise.resolve(buffer)),
  isFfmpegAvailable: jest.fn(() => true),
}));

describe("RealtimeVoiceAgentService", () => {
  let service: RealtimeVoiceAgentService;
  let mockSession: {
    on: jest.Mock;
    connect: jest.Mock;
    close: jest.Mock;
    sendAudio: jest.Mock;
    history: Array<unknown>;
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock session
    mockSession = {
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn(),
      sendAudio: jest.fn(),
      history: [],
    };

    // Mock RealtimeSession constructor
    (RealtimeSession as jest.Mock).mockImplementation(() => mockSession);

    service = new RealtimeVoiceAgentService();
  });

  afterEach(() => {
    service.cleanup();
  });

  describe("Constructor", () => {
    it("should create instance with RealtimeAgent", () => {
      expect(service).toBeInstanceOf(RealtimeVoiceAgentService);
      expect(RealtimeAgent).toHaveBeenCalled();
    });
  });

  describe("processVoiceMessage", () => {
    it("should process voice message and return result", async () => {
      const mockAudioBuffer = Buffer.from("mock audio data");
      const mockContext: AgentContext = {
        email: "test@example.com",
        chatId: 123,
      };

      // Set up event handlers
      let audioHandler: ((event: { data: ArrayBuffer }) => void) | undefined;
      let historyHandler: ((history: Array<unknown>) => void) | undefined;
      let agentEndHandler: (() => void) | undefined;

      mockSession.on.mockImplementation((event: string, handler: () => void) => {
        if (event === "audio") {
          audioHandler = handler;
        } else if (event === "history_updated") {
          historyHandler = handler;
        } else if (event === "agent_end") {
          agentEndHandler = handler;
        }
      });

      // Start processing (don't await yet)
      const processPromise = service.processVoiceMessage(mockAudioBuffer, mockContext);

      // Simulate connection
      await mockSession.connect();

      // Simulate history update with transcript
      if (historyHandler) {
        historyHandler([
          {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_audio",
                transcript: "Hello, test message",
              },
            ],
          },
          {
            type: "message",
            role: "assistant",
            status: "completed",
            content: [
              {
                type: "output_text",
                text: "This is a test response",
              },
            ],
          },
        ]);
      }

      // Simulate audio chunks
      if (audioHandler) {
        const mockAudioData = new ArrayBuffer(100);
        audioHandler({ data: mockAudioData });
      }

      // Simulate agent end
      if (agentEndHandler) {
        agentEndHandler();
      }

      // Wait for result
      const result = await processPromise;

      expect(result).toHaveProperty("transcribedText");
      expect(result).toHaveProperty("textResponse");
      expect(result).toHaveProperty("voiceResponseBuffer");
      expect(mockSession.connect).toHaveBeenCalled();
      expect(mockSession.sendAudio).toHaveBeenCalled();
      expect(mockSession.close).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const mockAudioBuffer = Buffer.from("mock audio data");

      mockSession.connect.mockRejectedValue(new Error("Connection failed"));

      await expect(service.processVoiceMessage(mockAudioBuffer)).rejects.toThrow("Connection failed");
      expect(mockSession.close).toHaveBeenCalled();
    });

    it("should convert OGG to PCM16 before sending", async () => {
      const { convertOggToPcm16 } = require("@/utils/voice/audioConverter");
      const mockAudioBuffer = Buffer.from("mock ogg audio");

      mockSession.on.mockImplementation(() => {});

      // Start processing
      const processPromise = service.processVoiceMessage(mockAudioBuffer);

      // Simulate connection
      await mockSession.connect();

      // Wait a bit for async conversion
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check that conversion was called
      expect(convertOggToPcm16).toHaveBeenCalledWith(mockAudioBuffer, expect.any(Object));
    });
  });

  describe("setVoice", () => {
    it("should update the agent voice", () => {
      service.setVoice("nova");
      // Voice is set in constructor, so we verify by checking the agent was recreated
      expect(RealtimeAgent).toHaveBeenCalledTimes(2); // Once in constructor, once in setVoice
    });
  });

  describe("cleanup", () => {
    it("should close active session", () => {
      // Create a session by starting processing
      const mockAudioBuffer = Buffer.from("mock audio");
      mockSession.on.mockImplementation(() => {});
      service.processVoiceMessage(mockAudioBuffer).catch(() => {
        // Ignore errors
      });

      service.cleanup();

      expect(mockSession.close).toHaveBeenCalled();
    });

    it("should handle cleanup when no session exists", () => {
      expect(() => service.cleanup()).not.toThrow();
    });
  });
});

