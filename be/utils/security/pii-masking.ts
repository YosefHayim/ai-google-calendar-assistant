/**
 * PII (Personally Identifiable Information) Masking
 *
 * Masks sensitive data before sending to LLM to prevent accidental exposure
 * in logs, training data, or responses. Critical for GDPR/CCPA compliance.
 */

import { logger } from "@/utils/logger"

const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
const PHONE_PATTERN = /(\+?\d{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g
const CREDIT_CARD_PATTERN = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g
const IP_ADDRESS_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g

const PII_PATTERNS: Array<{ pattern: RegExp; type: string; mask: string }> = [
  { pattern: SSN_PATTERN, type: "SSN", mask: "[SSN_REDACTED]" },
  { pattern: CREDIT_CARD_PATTERN, type: "credit_card", mask: "[CARD_REDACTED]" },
  { pattern: EMAIL_PATTERN, type: "email", mask: "[EMAIL_REDACTED]" },
  { pattern: PHONE_PATTERN, type: "phone", mask: "[PHONE_REDACTED]" },
  { pattern: IP_ADDRESS_PATTERN, type: "ip_address", mask: "[IP_REDACTED]" },
]

export interface PIIMaskingResult {
  masked: string
  foundTypes: string[]
  originalLength: number
  maskedLength: number
}

export function maskPII(input: string, options?: { preserveUserEmail?: string }): PIIMaskingResult {
  const { preserveUserEmail } = options || {}
  let masked = input
  const foundTypes: string[] = []

  for (const { pattern, type, mask } of PII_PATTERNS) {
    const matches = masked.match(pattern)
    if (matches) {
      for (const match of matches) {
        if (type === "email" && preserveUserEmail && match.toLowerCase() === preserveUserEmail.toLowerCase()) {
          continue
        }
        masked = masked.replace(match, mask)
        if (!foundTypes.includes(type)) {
          foundTypes.push(type)
        }
      }
    }
  }

  if (foundTypes.length > 0) {
    logger.info(`SECURITY: PII masked - types found: ${foundTypes.join(", ")}`)
  }

  return {
    masked,
    foundTypes,
    originalLength: input.length,
    maskedLength: masked.length,
  }
}

export function containsPII(input: string): boolean {
  for (const { pattern } of PII_PATTERNS) {
    if (pattern.test(input)) {
      pattern.lastIndex = 0
      return true
    }
  }
  return false
}

export function maskEmailPartially(email: string): string {
  const [local, domain] = email.split("@")
  if (!local || !domain) return email

  const visibleChars = Math.min(2, local.length)
  const maskedLocal = local.slice(0, visibleChars) + "***"

  return `${maskedLocal}@${domain}`
}

export function maskPhonePartially(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 4) return "[PHONE_REDACTED]"

  const lastFour = digits.slice(-4)
  return `***-***-${lastFour}`
}
