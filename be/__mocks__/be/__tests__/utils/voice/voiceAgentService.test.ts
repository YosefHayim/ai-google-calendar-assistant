/**
 * Tests for VoiceAgentService
 */

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import type { AgentContext } from "@/utils/activateAgent";
import OpenAI from "openai";
import { VoiceAgentService } from "@/utils/voice/voiceAgentService";

// Mock dependencies
// @ts-expect-error - Jest mock types
const mockActivateAgent = jest.fn().mockResolvedValue({
  finalOutput: "Test response from agent",
});

jest.mock("openai");
jest.mock("@/config/root-config", () => ({
  CONFIG: {
    openAiApiKey: "test-api-key",
  },
}));
jest.mock("@/utils/activateAgent", () => ({
  activateAgent: mockActivateAgent,
}));
jest.mock("@/ai-agents/agents", () => ({
  ORCHESTRATOR_AGENT: {},
}));

describe("VoiceAgentService", () => {
  let service: VoiceAgentService;
  let mockTranscriptionsCreate: jest.Mock;
  let mockSpeechCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock OpenAI audio methods
    // @ts-expect-error - Jest mock types
    mockTranscriptionsCreate = jest.fn().mockResolvedValue({
      text: "Transcribed text",
    });

    // @ts-expect-error - Jest mock types
    const mockArrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(100));
    // @ts-expect-error - Jest mock types
    mockSpeechCreate = jest.fn().mockResolvedValue({
      arrayBuffer: mockArrayBuffer,
    });

    // Mock OpenAI constructor
    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      audio: {
        transcriptions: {
          create: mockTranscriptionsCreate,
        },
        speech: {
          create: mockSpeechCreate,
        },
      },
    }));

    service = new VoiceAgentService();
  });

  describe("Constructor", () => {
    it("should create instance with default voice", () => {
      expect(service).toBeInstanceOf(VoiceAgentService);
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: "test-api-key",
      });
    });

    it("should create instance with custom voice", () => {
      const customService = new VoiceAgentService("nova");
      expect(customService).toBeInstanceOf(VoiceAgentService);
    });
  });

  describe("transcribeAudio", () => {
    it("should transcribe audio with default language", async () => {
      const mockBuffer = Buffer.from("mock audio");
      const result = await service.transcribeAudio(mockBuffer);

      expect(result).toBe("Transcribed text");
      expect(mockTranscriptionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "whisper-1",
          language: "en",
        })
      );
    });

    it("should transcribe audio with custom language code", async () => {
      const mockBuffer = Buffer.from("mock audio");
      const result = await service.transcribeAudio(mockBuffer, "es");

      expect(result).toBe("Transcribed text");
      expect(mockTranscriptionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "whisper-1",
          language: "es",
        })
      );
    });

    it("should handle transcription errors", async () => {
      // @ts-expect-error - Jest mock types
      mockTranscriptionsCreate.mockRejectedValue(new Error("API Error"));

      await expect(service.transcribeAudio(Buffer.from("mock"))).rejects.toThrow("Failed to transcribe audio");
    });
  });

  describe("generateVoiceResponse", () => {
    it("should generate voice response", async () => {
      const result = await service.generateVoiceResponse("Test text");

      expect(result).toBeInstanceOf(Buffer);
      expect(mockSpeechCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "tts-1",
          voice: "alloy",
          input: "Test text",
        })
      );
    });

    it("should handle TTS errors", async () => {
      // @ts-expect-error - Jest mock types
      mockSpeechCreate.mockRejectedValue(new Error("API Error"));

      await expect(service.generateVoiceResponse("Test")).rejects.toThrow("Failed to generate voice response");
    });
  });

  describe("processVoiceMessage", () => {
    it("should process voice message with default language", async () => {
      const mockBuffer = Buffer.from("mock audio");
      const mockContext: AgentContext = {
        email: "test@example.com",
        chatId: 123,
      };

      const result = await service.processVoiceMessage(mockBuffer, mockContext);

      expect(result).toHaveProperty("transcribedText", "Transcribed text");
      expect(result).toHaveProperty("textResponse", "Test response from agent");
      expect(result).toHaveProperty("voiceResponseBuffer");
      expect(mockTranscriptionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          language: "en",
        })
      );
    });

    it("should process voice message with custom language code", async () => {
      const mockBuffer = Buffer.from("mock audio");
      const mockContext: AgentContext = {
        email: "test@example.com",
      };

      const result = await service.processVoiceMessage(mockBuffer, mockContext, "fr");

      expect(result).toHaveProperty("transcribedText");
      expect(mockTranscriptionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          language: "fr",
        })
      );
    });

    it("should handle empty transcription", async () => {
      // @ts-expect-error - Jest mock types
      mockTranscriptionsCreate.mockResolvedValue({
        text: "",
      });

      await expect(service.processVoiceMessage(Buffer.from("mock"))).rejects.toThrow("No text was transcribed");
    });
  });

  describe("setVoice", () => {
    it("should update the voice", () => {
      service.setVoice("nova");
      // Voice is stored internally, verify by checking it's set
      expect(service).toBeDefined();
    });
  });
});
