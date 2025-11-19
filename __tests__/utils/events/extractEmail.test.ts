import { describe, it, expect } from "@jest/globals";
import { extractEmail } from "@/utils/events/extractEmail";
import type { Request } from "express";
import type { AuthedRequest } from "@/types";

describe("extractEmail", () => {
  it("should extract email from authed request", () => {
    const req = {
      user: { email: "user@example.com" }
    } as unknown as AuthedRequest;

    const result = extractEmail(req);
    expect(result).toBe("user@example.com");
  });

  it("should extract email from extra parameter", () => {
    const extra = { email: "extra@example.com" };
    const result = extractEmail(null, extra);
    expect(result).toBe("extra@example.com");
  });

  it("should prioritize request user email over extra", () => {
    const req = {
      user: { email: "user@example.com" }
    } as unknown as AuthedRequest;
    const extra = { email: "extra@example.com" };

    const result = extractEmail(req, extra);
    expect(result).toBe("user@example.com");
  });

  it("should throw error when email is not found", () => {
    expect(() => extractEmail(null, {})).toThrow(
      "Email is required to resolve calendar credentials"
    );
  });

  it("should throw error when req is null and extra is undefined", () => {
    expect(() => extractEmail(null)).toThrow(
      "Email is required to resolve calendar credentials"
    );
  });

  it("should throw error when req has no user", () => {
    const req = {} as Request;
    expect(() => extractEmail(req, {})).toThrow(
      "Email is required to resolve calendar credentials"
    );
  });

  it("should throw error when extra.email is not a string", () => {
    const extra = { email: 123 };
    expect(() => extractEmail(null, extra)).toThrow(
      "Email is required to resolve calendar credentials"
    );
  });

  it("should handle extra.email when it is an empty string", () => {
    const extra = { email: "" };
    expect(() => extractEmail(null, extra)).toThrow(
      "Email is required to resolve calendar credentials"
    );
  });
});
