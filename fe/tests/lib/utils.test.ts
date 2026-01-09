import { describe, expect, it } from "bun:test";
import { cn } from "../../lib/utils";

describe("cn utility function", () => {
  describe("basic class merging", () => {
    it("should merge single class", () => {
      expect(cn("p-4")).toBe("p-4");
    });

    it("should merge multiple classes", () => {
      expect(cn("p-4", "m-2")).toBe("p-4 m-2");
    });

    it("should handle empty inputs", () => {
      expect(cn()).toBe("");
    });

    it("should handle undefined values", () => {
      expect(cn("p-4", undefined, "m-2")).toBe("p-4 m-2");
    });

    it("should handle null values", () => {
      expect(cn("p-4", null, "m-2")).toBe("p-4 m-2");
    });

    it("should handle false values", () => {
      expect(cn("p-4", false, "m-2")).toBe("p-4 m-2");
    });
  });

  describe("tailwind conflict resolution", () => {
    it("should resolve padding conflicts by keeping the last one", () => {
      const result = cn("p-4", "p-8");
      expect(result).toBe("p-8");
    });

    it("should resolve margin conflicts", () => {
      const result = cn("m-4", "m-8");
      expect(result).toBe("m-8");
    });

    it("should resolve text color conflicts", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });

    it("should resolve background color conflicts", () => {
      const result = cn("bg-white", "bg-gray-100");
      expect(result).toBe("bg-gray-100");
    });

    it("should keep non-conflicting classes", () => {
      const result = cn("p-4", "text-red-500", "bg-white");
      expect(result).toBe("p-4 text-red-500 bg-white");
    });

    it("should handle complex conflict resolution", () => {
      const result = cn("px-4 py-2", "px-8");
      expect(result).toBe("py-2 px-8");
    });
  });

  describe("conditional classes", () => {
    it("should handle conditional classes with && operator", () => {
      const isActive = true;
      const result = cn("btn", isActive && "btn-active");
      expect(result).toBe("btn btn-active");
    });

    it("should handle false conditional classes", () => {
      const isActive = false;
      const result = cn("btn", isActive && "btn-active");
      expect(result).toBe("btn");
    });

    it("should handle ternary conditionals", () => {
      const isLarge = true;
      const result = cn("btn", isLarge ? "text-lg" : "text-sm");
      expect(result).toBe("btn text-lg");
    });
  });

  describe("array inputs", () => {
    it("should handle array of classes", () => {
      const result = cn(["p-4", "m-2"]);
      expect(result).toBe("p-4 m-2");
    });

    it("should handle mixed arrays and strings", () => {
      const result = cn("base", ["modifier-1", "modifier-2"], "extra");
      expect(result).toBe("base modifier-1 modifier-2 extra");
    });
  });

  describe("object inputs", () => {
    it("should handle object with true values", () => {
      const result = cn({ "p-4": true, "m-2": true });
      expect(result).toBe("p-4 m-2");
    });

    it("should handle object with false values", () => {
      const result = cn({ "p-4": true, "m-2": false });
      expect(result).toBe("p-4");
    });

    it("should handle mixed object and string inputs", () => {
      const result = cn("base", { active: true, disabled: false });
      expect(result).toBe("base active");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      expect(cn("")).toBe("");
    });

    it("should handle whitespace", () => {
      const result = cn("  p-4  ", "  m-2  ");
      // twMerge normalizes whitespace
      expect(result.includes("p-4")).toBe(true);
      expect(result.includes("m-2")).toBe(true);
    });

    it("should handle duplicate classes", () => {
      const result = cn("p-4", "p-4");
      expect(result).toBe("p-4");
    });

    it("should handle many arguments", () => {
      const result = cn("a", "b", "c", "d", "e", "f");
      expect(result).toBe("a b c d e f");
    });
  });
});
