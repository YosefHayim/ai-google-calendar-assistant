import { describe, expect, it } from "@jest/globals";

import { TOKEN_FIELDS } from "../../utils/auth/constants";

describe("storage", () => {
  describe("TOKEN_FIELDS", () => {
    it("should contain all required token fields", () => {
      const expectedFields = ["access_token", "scope", "token_type", "expiry_date", "refresh_token_expires_in", "id_token", "refresh_token", "email"];

      expectedFields.forEach((field) => {
        expect(TOKEN_FIELDS).toContain(field);
      });
    });

    it("should be a comma-separated string", () => {
      expect(TOKEN_FIELDS).toContain(",");
      const fields = TOKEN_FIELDS.split(",").map((f) => f.trim());
      expect(fields.length).toBeGreaterThan(0);
    });

    it("should not have trailing or leading commas", () => {
      expect(TOKEN_FIELDS.startsWith(",")).toBe(false);
      expect(TOKEN_FIELDS.endsWith(",")).toBe(false);
    });

    it("should have exactly 8 fields", () => {
      const fields = TOKEN_FIELDS.split(",").map((f) => f.trim());
      expect(fields).toHaveLength(8);
    });

    it("should include access_token field", () => {
      expect(TOKEN_FIELDS).toContain("access_token");
    });

    it("should include refresh_token field", () => {
      expect(TOKEN_FIELDS).toContain("refresh_token");
    });

    it("should include email field", () => {
      expect(TOKEN_FIELDS).toContain("email");
    });

    it("should include expiry_date field", () => {
      expect(TOKEN_FIELDS).toContain("expiry_date");
    });

    it("should not contain duplicate fields", () => {
      const fields = TOKEN_FIELDS.split(",").map((f) => f.trim());
      const uniqueFields = [...new Set(fields)];
      expect(fields.length).toBe(uniqueFields.length);
    });

    it("should not contain empty fields", () => {
      const fields = TOKEN_FIELDS.split(",").map((f) => f.trim());
      fields.forEach((field) => {
        expect(field.length).toBeGreaterThan(0);
      });
    });
  });
});
