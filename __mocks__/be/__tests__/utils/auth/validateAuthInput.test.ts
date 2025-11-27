import { describe, it, expect } from "@jest/globals";
import {
  validateEmailPassword,
  validateEmailToken,
  validateEmail
} from "@/utils/auth/validateAuthInput";
import type { Request } from "express";

describe("validateEmailPassword", () => {
  it("should return email and password when both are present", () => {
    const req = {
      body: { email: "test@example.com", password: "password123" }
    } as Request;

    const result = validateEmailPassword(req);

    expect(result.email).toBe("test@example.com");
    expect(result.password).toBe("password123");
  });

  it("should throw error when email is missing", () => {
    const req = {
      body: { password: "password123" }
    } as Request;

    expect(() => validateEmailPassword(req)).toThrow(
      "Email and password are required"
    );
  });

  it("should throw error when password is missing", () => {
    const req = {
      body: { email: "test@example.com" }
    } as Request;

    expect(() => validateEmailPassword(req)).toThrow(
      "Email and password are required"
    );
  });

  it("should throw error when both are missing", () => {
    const req = {
      body: {}
    } as Request;

    expect(() => validateEmailPassword(req)).toThrow(
      "Email and password are required"
    );
  });

  it("should throw error when email is empty string", () => {
    const req = {
      body: { email: "", password: "password123" }
    } as Request;

    expect(() => validateEmailPassword(req)).toThrow(
      "Email and password are required"
    );
  });

  it("should throw error when password is empty string", () => {
    const req = {
      body: { email: "test@example.com", password: "" }
    } as Request;

    expect(() => validateEmailPassword(req)).toThrow(
      "Email and password are required"
    );
  });
});

describe("validateEmailToken", () => {
  it("should return email and token when both are present", () => {
    const req = {
      body: { email: "test@example.com", token: "token123" }
    } as Request;

    const result = validateEmailToken(req);

    expect(result.email).toBe("test@example.com");
    expect(result.token).toBe("token123");
  });

  it("should throw error when email is missing", () => {
    const req = {
      body: { token: "token123" }
    } as Request;

    expect(() => validateEmailToken(req)).toThrow(
      "Email and token are required"
    );
  });

  it("should throw error when token is missing", () => {
    const req = {
      body: { email: "test@example.com" }
    } as Request;

    expect(() => validateEmailToken(req)).toThrow(
      "Email and token are required"
    );
  });

  it("should throw error when both are missing", () => {
    const req = {
      body: {}
    } as Request;

    expect(() => validateEmailToken(req)).toThrow(
      "Email and token are required"
    );
  });

  it("should throw error when email is empty string", () => {
    const req = {
      body: { email: "", token: "token123" }
    } as Request;

    expect(() => validateEmailToken(req)).toThrow(
      "Email and token are required"
    );
  });

  it("should throw error when token is empty string", () => {
    const req = {
      body: { email: "test@example.com", token: "" }
    } as Request;

    expect(() => validateEmailToken(req)).toThrow(
      "Email and token are required"
    );
  });
});

describe("validateEmail", () => {
  it("should return email when present", () => {
    const req = {
      body: { email: "test@example.com" }
    } as Request;

    const result = validateEmail(req);

    expect(result).toBe("test@example.com");
  });

  it("should throw error when email is missing", () => {
    const req = {
      body: {}
    } as Request;

    expect(() => validateEmail(req)).toThrow("Email is required");
  });

  it("should throw error when email is empty string", () => {
    const req = {
      body: { email: "" }
    } as Request;

    expect(() => validateEmail(req)).toThrow("Email is required");
  });

  it("should throw error when email is null", () => {
    const req = {
      body: { email: null }
    } as Request;

    expect(() => validateEmail(req)).toThrow("Email is required");
  });

  it("should throw error when email is undefined", () => {
    const req = {
      body: { email: undefined }
    } as Request;

    expect(() => validateEmail(req)).toThrow("Email is required");
  });
});
