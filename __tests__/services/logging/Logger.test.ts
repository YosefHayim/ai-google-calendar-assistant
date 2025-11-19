import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Logger } from "@/services/logging/Logger";

describe("Logger", () => {
  let logger: Logger;
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;
  let consoleDebugSpy: jest.SpiedFunction<typeof console.debug>;

  beforeEach(() => {
    logger = new Logger("TestContext");
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();
  });

  describe("info", () => {
    it("should log info message", () => {
      logger.info("Test message");

      expect(consoleLogSpy).toHaveBeenCalled();
      const callArg = consoleLogSpy.mock.calls[0][0] as string;
      expect(callArg).toContain("[INFO]");
      expect(callArg).toContain("[TestContext]");
      expect(callArg).toContain("Test message");
    });

    it("should log info message with metadata", () => {
      logger.info("Test message", { userId: "123" });

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[0][1]).toEqual({ userId: "123" });
    });

    it("should include timestamp in ISO format", () => {
      logger.info("Test message");

      const callArg = consoleLogSpy.mock.calls[0][0] as string;
      expect(callArg).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });
  });

  describe("error", () => {
    it("should log error message", () => {
      logger.error("Error occurred");

      expect(consoleErrorSpy).toHaveBeenCalled();
      const callArg = consoleErrorSpy.mock.calls[0][0] as string;
      expect(callArg).toContain("[ERROR]");
      expect(callArg).toContain("[TestContext]");
      expect(callArg).toContain("Error occurred");
    });

    it("should log error with Error instance", () => {
      const error = new Error("Test error");
      logger.error("Error occurred", error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const metadata = consoleErrorSpy.mock.calls[0][1] as Record<string, unknown>;
      expect(metadata.error).toHaveProperty("message", "Test error");
      expect(metadata.error).toHaveProperty("stack");
      expect(metadata.error).toHaveProperty("name", "Error");
    });

    it("should log error with non-Error value", () => {
      logger.error("Error occurred", "string error");

      expect(consoleErrorSpy).toHaveBeenCalled();
      const metadata = consoleErrorSpy.mock.calls[0][1] as Record<string, unknown>;
      expect(metadata.error).toBe("string error");
    });

    it("should log error with metadata", () => {
      logger.error("Error occurred", undefined, { operation: "test" });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const metadata = consoleErrorSpy.mock.calls[0][1] as Record<string, unknown>;
      expect(metadata.operation).toBe("test");
    });

    it("should merge error and metadata", () => {
      const error = new Error("Test error");
      logger.error("Error occurred", error, { userId: "123" });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const metadata = consoleErrorSpy.mock.calls[0][1] as Record<string, unknown>;
      expect(metadata.error).toBeDefined();
      expect(metadata.userId).toBe("123");
    });
  });

  describe("warn", () => {
    it("should log warning message", () => {
      logger.warn("Warning message");

      expect(consoleWarnSpy).toHaveBeenCalled();
      const callArg = consoleWarnSpy.mock.calls[0][0] as string;
      expect(callArg).toContain("[WARN]");
      expect(callArg).toContain("[TestContext]");
      expect(callArg).toContain("Warning message");
    });

    it("should log warning with metadata", () => {
      logger.warn("Warning message", { deprecation: true });

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy.mock.calls[0][1]).toEqual({ deprecation: true });
    });
  });

  describe("debug", () => {
    it("should log debug message in non-production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      logger.debug("Debug message");

      expect(consoleDebugSpy).toHaveBeenCalled();
      const callArg = consoleDebugSpy.mock.calls[0][0] as string;
      expect(callArg).toContain("[DEBUG]");
      expect(callArg).toContain("[TestContext]");
      expect(callArg).toContain("Debug message");

      process.env.NODE_ENV = originalEnv;
    });

    it("should not log debug message in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      logger.debug("Debug message");

      expect(consoleDebugSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should log debug with metadata in non-production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      logger.debug("Debug message", { debugData: "test" });

      expect(consoleDebugSpy).toHaveBeenCalled();
      expect(consoleDebugSpy.mock.calls[0][1]).toEqual({ debugData: "test" });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("context", () => {
    it("should include context in all log messages", () => {
      const customLogger = new Logger("CustomService");

      customLogger.info("Info message");
      customLogger.error("Error message");
      customLogger.warn("Warn message");

      expect((consoleLogSpy.mock.calls[0][0] as string)).toContain("[CustomService]");
      expect((consoleErrorSpy.mock.calls[0][0] as string)).toContain("[CustomService]");
      expect((consoleWarnSpy.mock.calls[0][0] as string)).toContain("[CustomService]");
    });
  });
});
