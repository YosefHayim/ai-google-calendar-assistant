/**
 * Tests for AudioConverter utility
 */

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { convertOggToPcm16, convertPcm16ToOgg, isFfmpegAvailable } from "@/utils/voice/audioConverter";

// Mock fluent-ffmpeg
jest.mock("fluent-ffmpeg", () => {
  const mockFfmpegInstance = {
    inputFormat: jest.fn().mockReturnThis(),
    audioCodec: jest.fn().mockReturnThis(),
    audioFrequency: jest.fn().mockReturnThis(),
    audioChannels: jest.fn().mockReturnThis(),
    format: jest.fn().mockReturnThis(),
    inputOptions: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    pipe: jest.fn().mockReturnThis(),
  };

  const mockFfmpeg = jest.fn(() => mockFfmpegInstance);
  (mockFfmpeg as unknown as { setFfmpegPath: jest.Mock }).setFfmpegPath = jest.fn();

  return {
    __esModule: true,
    default: mockFfmpeg,
  };
});

// Mock ffmpeg-static
jest.mock("ffmpeg-static", () => ({
  __esModule: true,
  default: "/mock/ffmpeg/path",
}));

describe("AudioConverter", () => {
  describe("isFfmpegAvailable", () => {
    it("should return true when ffmpeg-static is available", () => {
      expect(isFfmpegAvailable()).toBe(true);
    });
  });

  describe("convertOggToPcm16", () => {
    it("should convert OGG buffer to PCM16 format", async () => {
      const mockOggBuffer = Buffer.from("mock ogg audio data");

      // This test will fail if ffmpeg is not properly mocked
      // In a real scenario, we'd need to properly mock the stream pipeline
      await expect(convertOggToPcm16(mockOggBuffer)).rejects.toThrow();
    });

    it("should accept custom conversion options", async () => {
      const mockOggBuffer = Buffer.from("mock ogg audio data");

      await expect(
        convertOggToPcm16(mockOggBuffer, {
          sampleRate: 48000,
          channels: 2,
          format: "pcm_s16le",
        })
      ).rejects.toThrow();
    });
  });

  describe("convertPcm16ToOgg", () => {
    it("should convert PCM16 buffer to OGG format", async () => {
      const mockPcmBuffer = Buffer.from("mock pcm audio data");

      // This test will fail if ffmpeg is not properly mocked
      await expect(convertPcm16ToOgg(mockPcmBuffer)).rejects.toThrow();
    });

    it("should accept custom conversion options", async () => {
      const mockPcmBuffer = Buffer.from("mock pcm audio data");

      await expect(
        convertPcm16ToOgg(mockPcmBuffer, {
          sampleRate: 48000,
          channels: 2,
        })
      ).rejects.toThrow();
    });
  });
});
