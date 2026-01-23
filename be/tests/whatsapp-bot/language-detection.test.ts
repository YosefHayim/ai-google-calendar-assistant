import { describe, expect, it } from "@jest/globals"
import {
  detectLanguageFromPhone,
  hasDetectableLanguage,
} from "@/whatsapp-bot/utils/language-detection"

describe("WhatsApp Language Detection", () => {
  describe("detectLanguageFromPhone", () => {
    describe("Hebrew detection (Israel)", () => {
      it("should detect Hebrew for Israeli phone numbers", () => {
        expect(detectLanguageFromPhone("972501234567")).toBe("he")
        expect(detectLanguageFromPhone("+972501234567")).toBe("he")
        expect(detectLanguageFromPhone("972-50-123-4567")).toBe("he")
      })

      it("should detect Hebrew for various Israeli number formats", () => {
        expect(detectLanguageFromPhone("9725")).toBe("he")
        expect(detectLanguageFromPhone("972")).toBe("he")
      })
    })

    describe("Arabic detection", () => {
      it("should detect Arabic for Egyptian phone numbers", () => {
        expect(detectLanguageFromPhone("201234567890")).toBe("ar")
        expect(detectLanguageFromPhone("+201234567890")).toBe("ar")
      })

      it("should detect Arabic for Saudi Arabian phone numbers", () => {
        expect(detectLanguageFromPhone("966501234567")).toBe("ar")
        expect(detectLanguageFromPhone("+966501234567")).toBe("ar")
      })

      it("should detect Arabic for UAE phone numbers", () => {
        expect(detectLanguageFromPhone("971501234567")).toBe("ar")
        expect(detectLanguageFromPhone("+971501234567")).toBe("ar")
      })

      it("should detect Arabic for Jordanian phone numbers", () => {
        expect(detectLanguageFromPhone("962791234567")).toBe("ar")
      })

      it("should detect Arabic for Palestinian phone numbers", () => {
        expect(detectLanguageFromPhone("970591234567")).toBe("ar")
      })

      it("should detect Arabic for other Arabic countries", () => {
        expect(detectLanguageFromPhone("212601234567")).toBe("ar")
        expect(detectLanguageFromPhone("213551234567")).toBe("ar")
        expect(detectLanguageFromPhone("216201234567")).toBe("ar")
        expect(detectLanguageFromPhone("218911234567")).toBe("ar")
        expect(detectLanguageFromPhone("249901234567")).toBe("ar")
        expect(detectLanguageFromPhone("963931234567")).toBe("ar")
        expect(detectLanguageFromPhone("964771234567")).toBe("ar")
        expect(detectLanguageFromPhone("965661234567")).toBe("ar")
        expect(detectLanguageFromPhone("967771234567")).toBe("ar")
        expect(detectLanguageFromPhone("968991234567")).toBe("ar")
        expect(detectLanguageFromPhone("973661234567")).toBe("ar")
        expect(detectLanguageFromPhone("974551234567")).toBe("ar")
        expect(detectLanguageFromPhone("961701234567")).toBe("ar")
      })
    })

    describe("French detection", () => {
      it("should detect French for French phone numbers", () => {
        expect(detectLanguageFromPhone("33612345678")).toBe("fr")
        expect(detectLanguageFromPhone("+33612345678")).toBe("fr")
      })

      it("should detect French for Belgian phone numbers", () => {
        expect(detectLanguageFromPhone("32471234567")).toBe("fr")
      })

      it("should detect French for Swiss phone numbers", () => {
        expect(detectLanguageFromPhone("41791234567")).toBe("fr")
      })

      it("should detect French for Luxembourg phone numbers", () => {
        expect(detectLanguageFromPhone("352621234567")).toBe("fr")
      })

      it("should detect French for Monaco phone numbers", () => {
        expect(detectLanguageFromPhone("377931234567")).toBe("fr")
      })
    })

    describe("German detection", () => {
      it("should detect German for German phone numbers", () => {
        expect(detectLanguageFromPhone("491511234567")).toBe("de")
        expect(detectLanguageFromPhone("+491511234567")).toBe("de")
      })

      it("should detect German for Austrian phone numbers", () => {
        expect(detectLanguageFromPhone("436641234567")).toBe("de")
      })

      it("should detect German for Liechtenstein phone numbers", () => {
        expect(detectLanguageFromPhone("4237801234")).toBe("de")
      })
    })

    describe("Russian detection", () => {
      it("should detect Russian for Russian phone numbers", () => {
        expect(detectLanguageFromPhone("79161234567")).toBe("ru")
        expect(detectLanguageFromPhone("+79161234567")).toBe("ru")
      })

      it("should detect Russian for Belarusian phone numbers", () => {
        expect(detectLanguageFromPhone("375291234567")).toBe("ru")
      })

      it("should detect Russian for Ukrainian phone numbers", () => {
        expect(detectLanguageFromPhone("380501234567")).toBe("ru")
      })

      it("should detect Russian for Kazakh phone numbers", () => {
        expect(detectLanguageFromPhone("77011234567")).toBe("ru")
      })
    })

    describe("Default language (English)", () => {
      it("should return English for US phone numbers", () => {
        expect(detectLanguageFromPhone("12025551234")).toBe("en")
        expect(detectLanguageFromPhone("+12025551234")).toBe("en")
      })

      it("should return English for UK phone numbers", () => {
        expect(detectLanguageFromPhone("447911123456")).toBe("en")
      })

      it("should return English for Canadian phone numbers", () => {
        expect(detectLanguageFromPhone("16135551234")).toBe("en")
      })

      it("should return English for Australian phone numbers", () => {
        expect(detectLanguageFromPhone("61412345678")).toBe("en")
      })

      it("should return English for unknown country codes", () => {
        expect(detectLanguageFromPhone("9999999999")).toBe("en")
      })

      it("should return English for empty input", () => {
        expect(detectLanguageFromPhone("")).toBe("en")
      })

      it("should return English for invalid input", () => {
        expect(detectLanguageFromPhone("abc")).toBe("en")
        expect(detectLanguageFromPhone("+++")).toBe("en")
      })
    })

    describe("Phone number format handling", () => {
      it("should handle phone numbers with + prefix", () => {
        expect(detectLanguageFromPhone("+972501234567")).toBe("he")
      })

      it("should handle phone numbers with dashes", () => {
        expect(detectLanguageFromPhone("972-50-123-4567")).toBe("he")
      })

      it("should handle phone numbers with spaces", () => {
        expect(detectLanguageFromPhone("972 50 123 4567")).toBe("he")
      })

      it("should handle phone numbers with parentheses", () => {
        expect(detectLanguageFromPhone("(972) 50 123 4567")).toBe("he")
      })

      it("should handle mixed format phone numbers", () => {
        expect(detectLanguageFromPhone("+972 (50) 123-4567")).toBe("he")
      })
    })
  })

  describe("hasDetectableLanguage", () => {
    it("should return true for detectable phone prefixes", () => {
      expect(hasDetectableLanguage("972501234567")).toBe(true)
      expect(hasDetectableLanguage("33612345678")).toBe(true)
      expect(hasDetectableLanguage("491511234567")).toBe(true)
      expect(hasDetectableLanguage("79161234567")).toBe(true)
      expect(hasDetectableLanguage("966501234567")).toBe(true)
    })

    it("should return false for undetectable phone prefixes", () => {
      expect(hasDetectableLanguage("12025551234")).toBe(false)
      expect(hasDetectableLanguage("447911123456")).toBe(false)
      expect(hasDetectableLanguage("9999999999")).toBe(false)
    })

    it("should return false for empty or invalid input", () => {
      expect(hasDetectableLanguage("")).toBe(false)
      expect(hasDetectableLanguage("abc")).toBe(false)
      expect(hasDetectableLanguage("+++")).toBe(false)
    })

    it("should handle formatted phone numbers", () => {
      expect(hasDetectableLanguage("+972-50-123-4567")).toBe(true)
      expect(hasDetectableLanguage("+1-202-555-1234")).toBe(false)
    })
  })
})

describe("Language Detection Business Scenarios", () => {
  describe("WhatsApp User Onboarding", () => {
    it("should auto-detect Hebrew for Israeli users", () => {
      const israeliNumbers = [
        "972501234567",
        "972521234567",
        "972531234567",
        "972541234567",
        "972551234567",
      ]

      for (const phone of israeliNumbers) {
        expect(detectLanguageFromPhone(phone)).toBe("he")
      }
    })

    it("should auto-detect Arabic for Gulf region users", () => {
      const gulfNumbers = [
        { phone: "966501234567", country: "Saudi Arabia" },
        { phone: "971501234567", country: "UAE" },
        { phone: "973661234567", country: "Bahrain" },
        { phone: "974551234567", country: "Qatar" },
        { phone: "965661234567", country: "Kuwait" },
        { phone: "968991234567", country: "Oman" },
      ]

      for (const { phone } of gulfNumbers) {
        expect(detectLanguageFromPhone(phone)).toBe("ar")
      }
    })

    it("should fall back to English for unsupported regions", () => {
      const unsupportedNumbers = [
        "818012345678",
        "861301234567",
        "5511912345678",
        "919876543210",
      ]

      for (const phone of unsupportedNumbers) {
        expect(detectLanguageFromPhone(phone)).toBe("en")
      }
    })
  })

  describe("Multi-region Support", () => {
    it("should distinguish between French and German Swiss numbers", () => {
      expect(detectLanguageFromPhone("41791234567")).toBe("fr")
    })

    it("should handle Russian federation codes correctly", () => {
      expect(detectLanguageFromPhone("79161234567")).toBe("ru")
      expect(detectLanguageFromPhone("77011234567")).toBe("ru")
    })
  })

  describe("Edge Cases", () => {
    it("should handle very short numbers", () => {
      expect(detectLanguageFromPhone("97")).toBe("en")
      expect(detectLanguageFromPhone("972")).toBe("he")
      expect(detectLanguageFromPhone("7")).toBe("ru")
    })

    it("should handle numbers with leading zeros stripped", () => {
      expect(detectLanguageFromPhone("33612345678")).toBe("fr")
    })
  })
})
