import { describe, expect, it, beforeEach, afterEach } from 'bun:test'
import {
  getUserTimezone,
  getCountryFromTimezone,
  getLanguageForCountry,
  getLanguageFromBrowserLang,
  detectUserLanguage,
} from '../../lib/geolocation'

describe('geolocation', () => {
  describe('getUserTimezone', () => {
    it('should return a timezone string', () => {
      const timezone = getUserTimezone()
      expect(typeof timezone).toBe('string')
    })
  })

  describe('getCountryFromTimezone', () => {
    it('should return IL for Israel timezones', () => {
      expect(getCountryFromTimezone('Asia/Jerusalem')).toBe('IL')
      expect(getCountryFromTimezone('Asia/Tel_Aviv')).toBe('IL')
    })

    it('should return DE for Berlin timezone', () => {
      expect(getCountryFromTimezone('Europe/Berlin')).toBe('DE')
    })

    it('should return FR for Paris timezone', () => {
      expect(getCountryFromTimezone('Europe/Paris')).toBe('FR')
    })

    it('should return RU for Russian timezones', () => {
      expect(getCountryFromTimezone('Europe/Moscow')).toBe('RU')
      expect(getCountryFromTimezone('Europe/Kaliningrad')).toBe('RU')
      expect(getCountryFromTimezone('Asia/Vladivostok')).toBe('RU')
      expect(getCountryFromTimezone('Asia/Kamchatka')).toBe('RU')
    })

    it('should return correct countries for Arabic timezones', () => {
      expect(getCountryFromTimezone('Asia/Riyadh')).toBe('SA')
      expect(getCountryFromTimezone('Asia/Dubai')).toBe('AE')
      expect(getCountryFromTimezone('Africa/Cairo')).toBe('EG')
      expect(getCountryFromTimezone('Africa/Casablanca')).toBe('MA')
    })

    it('should return null for unknown timezones', () => {
      expect(getCountryFromTimezone('America/New_York')).toBeNull()
      expect(getCountryFromTimezone('Asia/Tokyo')).toBeNull()
      expect(getCountryFromTimezone('invalid')).toBeNull()
    })
  })

  describe('getLanguageForCountry', () => {
    it('should return he for Israel', () => {
      expect(getLanguageForCountry('IL')).toBe('he')
    })

    it('should return de for German-speaking countries', () => {
      expect(getLanguageForCountry('DE')).toBe('de')
      expect(getLanguageForCountry('AT')).toBe('de')
      expect(getLanguageForCountry('CH')).toBe('de')
    })

    it('should return fr for French-speaking countries', () => {
      expect(getLanguageForCountry('FR')).toBe('fr')
      expect(getLanguageForCountry('BE')).toBe('fr')
      expect(getLanguageForCountry('CA')).toBe('fr')
    })

    it('should return ru for Russian-speaking countries', () => {
      expect(getLanguageForCountry('RU')).toBe('ru')
      expect(getLanguageForCountry('BY')).toBe('ru')
      expect(getLanguageForCountry('KZ')).toBe('ru')
    })

    it('should return ar for Arabic-speaking countries', () => {
      expect(getLanguageForCountry('SA')).toBe('ar')
      expect(getLanguageForCountry('AE')).toBe('ar')
      expect(getLanguageForCountry('EG')).toBe('ar')
      expect(getLanguageForCountry('JO')).toBe('ar')
    })

    it('should return null for unknown countries', () => {
      expect(getLanguageForCountry('US')).toBeNull()
      expect(getLanguageForCountry('JP')).toBeNull()
      expect(getLanguageForCountry('XX')).toBeNull()
    })
  })

  describe('getLanguageFromBrowserLang', () => {
    it('should map Hebrew language codes', () => {
      expect(getLanguageFromBrowserLang('he')).toBe('he')
      expect(getLanguageFromBrowserLang('he-IL')).toBe('he')
    })

    it('should map German language codes', () => {
      expect(getLanguageFromBrowserLang('de')).toBe('de')
      expect(getLanguageFromBrowserLang('de-DE')).toBe('de')
      expect(getLanguageFromBrowserLang('de-AT')).toBe('de')
      expect(getLanguageFromBrowserLang('de-CH')).toBe('de')
    })

    it('should map French language codes', () => {
      expect(getLanguageFromBrowserLang('fr')).toBe('fr')
      expect(getLanguageFromBrowserLang('fr-FR')).toBe('fr')
      expect(getLanguageFromBrowserLang('fr-CA')).toBe('fr')
      expect(getLanguageFromBrowserLang('fr-BE')).toBe('fr')
    })

    it('should map Russian language codes', () => {
      expect(getLanguageFromBrowserLang('ru')).toBe('ru')
      expect(getLanguageFromBrowserLang('ru-RU')).toBe('ru')
    })

    it('should map Arabic language codes', () => {
      expect(getLanguageFromBrowserLang('ar')).toBe('ar')
      expect(getLanguageFromBrowserLang('ar-SA')).toBe('ar')
      expect(getLanguageFromBrowserLang('ar-AE')).toBe('ar')
      expect(getLanguageFromBrowserLang('ar-EG')).toBe('ar')
    })

    it('should map English language codes', () => {
      expect(getLanguageFromBrowserLang('en')).toBe('en')
      expect(getLanguageFromBrowserLang('en-US')).toBe('en')
      expect(getLanguageFromBrowserLang('en-GB')).toBe('en')
      expect(getLanguageFromBrowserLang('en-AU')).toBe('en')
    })

    it('should fallback to base language', () => {
      expect(getLanguageFromBrowserLang('en-ZA')).toBe('en')
      expect(getLanguageFromBrowserLang('fr-XX')).toBe('fr')
    })

    it('should return null for unsupported languages', () => {
      expect(getLanguageFromBrowserLang('ja')).toBeNull()
      expect(getLanguageFromBrowserLang('zh-CN')).toBeNull()
      expect(getLanguageFromBrowserLang('ko')).toBeNull()
    })
  })

  describe('detectUserLanguage', () => {
    it('should return a valid language code or null', () => {
      const result = detectUserLanguage()
      if (result !== null) {
        expect(['en', 'he', 'ar', 'de', 'fr', 'ru']).toContain(result)
      }
    })
  })
})
