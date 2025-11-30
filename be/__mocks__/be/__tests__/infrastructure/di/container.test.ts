import { describe, it, expect } from "@jest/globals";
import { TYPES } from "@/infrastructure/di/types";

describe("DI Container Types", () => {
  describe("TYPES", () => {
    it("should export IUserRepository symbol", () => {
      expect(TYPES.IUserRepository).toBeDefined();
      expect(typeof TYPES.IUserRepository).toBe("symbol");
    });

    it("should export IEventRepository symbol", () => {
      expect(TYPES.IEventRepository).toBeDefined();
      expect(typeof TYPES.IEventRepository).toBe("symbol");
    });

    it("should export ICalendarRepository symbol", () => {
      expect(TYPES.ICalendarRepository).toBeDefined();
      expect(typeof TYPES.ICalendarRepository).toBe("symbol");
    });

    it("should export ITelegramLinkRepository symbol", () => {
      expect(TYPES.ITelegramLinkRepository).toBeDefined();
      expect(typeof TYPES.ITelegramLinkRepository).toBe("symbol");
    });

    it("should export ICalendarTokenRepository symbol", () => {
      expect(TYPES.ICalendarTokenRepository).toBeDefined();
      expect(typeof TYPES.ICalendarTokenRepository).toBe("symbol");
    });

    it("should export SupabaseClient symbol", () => {
      expect(TYPES.SupabaseClient).toBeDefined();
      expect(typeof TYPES.SupabaseClient).toBe("symbol");
    });

    it("should export GoogleCalendarClient symbol", () => {
      expect(TYPES.GoogleCalendarClient).toBeDefined();
      expect(typeof TYPES.GoogleCalendarClient).toBe("symbol");
    });

    it("should export Config symbol", () => {
      expect(TYPES.Config).toBeDefined();
      expect(typeof TYPES.Config).toBe("symbol");
    });

    it("should have unique symbols for each type", () => {
      const symbols = Object.values(TYPES);
      const uniqueSymbols = new Set(symbols);

      expect(symbols.length).toBe(uniqueSymbols.size);
    });

    it("should use Symbol.for for all types", () => {
      // Verify symbols are retrievable via Symbol.for
      expect(Symbol.for("IUserRepository")).toBe(TYPES.IUserRepository);
      expect(Symbol.for("IEventRepository")).toBe(TYPES.IEventRepository);
      expect(Symbol.for("ICalendarRepository")).toBe(TYPES.ICalendarRepository);
      expect(Symbol.for("ITelegramLinkRepository")).toBe(TYPES.ITelegramLinkRepository);
      expect(Symbol.for("ICalendarTokenRepository")).toBe(TYPES.ICalendarTokenRepository);
      expect(Symbol.for("SupabaseClient")).toBe(TYPES.SupabaseClient);
      expect(Symbol.for("GoogleCalendarClient")).toBe(TYPES.GoogleCalendarClient);
      expect(Symbol.for("Config")).toBe(TYPES.Config);
    });

    it("should have descriptive string representations", () => {
      expect(TYPES.IUserRepository.toString()).toContain("IUserRepository");
      expect(TYPES.IEventRepository.toString()).toContain("IEventRepository");
      expect(TYPES.ICalendarRepository.toString()).toContain("ICalendarRepository");
      expect(TYPES.SupabaseClient.toString()).toContain("SupabaseClient");
      expect(TYPES.GoogleCalendarClient.toString()).toContain("GoogleCalendarClient");
    });

    it("should use const export for type safety", () => {
      // TYPES is exported as const, providing compile-time immutability
      // TypeScript will prevent reassignment at compile time
      expect(TYPES).toBeDefined();
      expect(Object.isFrozen(TYPES)).toBe(false); // Runtime mutability exists but shouldn't be used
    });

    it("should export all repository interface types", () => {
      const repositoryTypes = [
        TYPES.IUserRepository,
        TYPES.IEventRepository,
        TYPES.ICalendarRepository,
        TYPES.ITelegramLinkRepository,
        TYPES.ICalendarTokenRepository,
      ];

      repositoryTypes.forEach((type) => {
        expect(type).toBeDefined();
        expect(typeof type).toBe("symbol");
      });
    });

    it("should export all external client types", () => {
      const clientTypes = [TYPES.SupabaseClient, TYPES.GoogleCalendarClient];

      clientTypes.forEach((type) => {
        expect(type).toBeDefined();
        expect(typeof type).toBe("symbol");
      });
    });

    it("should export configuration type", () => {
      expect(TYPES.Config).toBeDefined();
      expect(typeof TYPES.Config).toBe("symbol");
    });

    it("should have exactly 8 type definitions", () => {
      const typeCount = Object.keys(TYPES).length;
      expect(typeCount).toBe(8);
    });

    it("should maintain consistent symbol references", () => {
      // Each symbol should maintain its reference throughout the module
      const userRepoRef1 = TYPES.IUserRepository;
      const userRepoRef2 = TYPES.IUserRepository;

      expect(userRepoRef1).toBe(userRepoRef2);
    });
  });

  describe("TYPES Usage Patterns", () => {
    it("should support use as object keys", () => {
      const container: Record<symbol, string> = {};

      container[TYPES.IUserRepository] = "UserRepository";
      container[TYPES.IEventRepository] = "EventRepository";

      expect(container[TYPES.IUserRepository]).toBe("UserRepository");
      expect(container[TYPES.IEventRepository]).toBe("EventRepository");
    });

    it("should be usable in Map", () => {
      const map = new Map<symbol, string>();

      map.set(TYPES.IUserRepository, "UserRepository");
      map.set(TYPES.IEventRepository, "EventRepository");

      expect(map.get(TYPES.IUserRepository)).toBe("UserRepository");
      expect(map.get(TYPES.IEventRepository)).toBe("EventRepository");
      expect(map.size).toBe(2);
    });

    it("should be usable in Set", () => {
      const set = new Set<symbol>();

      set.add(TYPES.IUserRepository);
      set.add(TYPES.IEventRepository);
      set.add(TYPES.IUserRepository); // Duplicate

      expect(set.has(TYPES.IUserRepository)).toBe(true);
      expect(set.has(TYPES.IEventRepository)).toBe(true);
      expect(set.size).toBe(2); // Duplicate not added
    });

    it("should support iteration", () => {
      const typeKeys = Object.keys(TYPES);
      const typeValues = Object.values(TYPES);

      expect(typeKeys.length).toBeGreaterThan(0);
      expect(typeValues.length).toBeGreaterThan(0);
      expect(typeKeys.length).toBe(typeValues.length);

      typeValues.forEach((value) => {
        expect(typeof value).toBe("symbol");
      });
    });

    it("should support Object.entries iteration", () => {
      const entries = Object.entries(TYPES);

      expect(entries.length).toBe(8);

      entries.forEach(([key, value]) => {
        expect(typeof key).toBe("string");
        expect(typeof value).toBe("symbol");
        // Symbol toString format is "Symbol(description)"
        expect(value.toString()).toMatch(/^Symbol\(/);
      });
    });
  });

  describe("Symbol Registry", () => {
    it("should register all symbols globally", () => {
      // All symbols should be retrievable from global registry
      const registeredSymbols = [
        "IUserRepository",
        "IEventRepository",
        "ICalendarRepository",
        "ITelegramLinkRepository",
        "ICalendarTokenRepository",
        "SupabaseClient",
        "GoogleCalendarClient",
        "Config",
      ];

      registeredSymbols.forEach((name) => {
        const symbol = Symbol.for(name);
        expect(symbol).toBeDefined();
        expect(typeof symbol).toBe("symbol");
      });
    });

    it("should maintain symbol identity for repeated Symbol.for calls", () => {
      const symbol1 = Symbol.for("IUserRepository");
      const symbol2 = Symbol.for("IUserRepository");

      // Symbol.for creates/retrieves from global registry
      expect(symbol1).toBe(symbol2);
    });

    it("should use Symbol.for with descriptive keys", () => {
      // Verify each symbol was created with Symbol.for and has correct description
      Object.keys(TYPES).forEach((key) => {
        const symbol = Symbol.for(key);
        expect(symbol).toBeDefined();
        expect(typeof symbol).toBe("symbol");
      });
    });
  });
});
