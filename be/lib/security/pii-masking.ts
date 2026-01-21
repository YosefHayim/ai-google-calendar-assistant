/**
 * PII (Personally Identifiable Information) Masking
 *
 * Masks sensitive data before sending to LLM to prevent accidental exposure
 * in logs, training data, or responses. Critical for GDPR/CCPA compliance.
 */

import { logger } from "@/lib/logger"

const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
const PHONE_PATTERN =
  /(\+?\d{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g
const CREDIT_CARD_PATTERN = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g
const IP_ADDRESS_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g

const PII_PATTERNS: Array<{ pattern: RegExp; type: string; mask: string }> = [
  { pattern: SSN_PATTERN, type: "SSN", mask: "[SSN_REDACTED]" },
  {
    pattern: CREDIT_CARD_PATTERN,
    type: "credit_card",
    mask: "[CARD_REDACTED]",
  },
  { pattern: EMAIL_PATTERN, type: "email", mask: "[EMAIL_REDACTED]" },
  { pattern: PHONE_PATTERN, type: "phone", mask: "[PHONE_REDACTED]" },
  { pattern: IP_ADDRESS_PATTERN, type: "ip_address", mask: "[IP_REDACTED]" },
]

export type PIIMaskingResult = {
  masked: string
  foundTypes: string[]
  originalLength: number
  maskedLength: number
}

/**
 * @description Masks personally identifiable information (PII) in a string to prevent
 * accidental exposure in logs, LLM training data, or API responses. Detects and masks
 * SSNs, credit card numbers, email addresses, phone numbers, and IP addresses.
 * Critical for GDPR/CCPA compliance.
 *
 * @param {string} input - The text string to scan and mask for PII
 * @param {Object} [options] - Optional configuration
 * @param {string} [options.preserveUserEmail] - An email address to exclude from masking
 *   (useful for preserving the current user's email while masking others)
 * @returns {PIIMaskingResult} An object containing:
 *   - masked: The input string with PII replaced by redaction markers
 *   - foundTypes: Array of PII types that were detected (e.g., ['email', 'phone'])
 *   - originalLength: Character count of the original input
 *   - maskedLength: Character count of the masked output
 *
 * @example
 * // Basic PII masking
 * const result = maskPII('Contact john@example.com or call 555-123-4567');
 * // Result: {
 * //   masked: 'Contact [EMAIL_REDACTED] or call [PHONE_REDACTED]',
 * //   foundTypes: ['email', 'phone'],
 * //   originalLength: 46,
 * //   maskedLength: 50
 * // }
 *
 * @example
 * // Preserve the current user's email
 * const result = maskPII(
 *   'From: user@app.com, To: external@other.com',
 *   { preserveUserEmail: 'user@app.com' }
 * );
 * // Result: masked = 'From: user@app.com, To: [EMAIL_REDACTED]'
 */
export function maskPII(
  input: string,
  options?: { preserveUserEmail?: string }
): PIIMaskingResult {
  const { preserveUserEmail } = options || {}
  let masked = input
  const foundTypes: string[] = []

  for (const { pattern, type, mask } of PII_PATTERNS) {
    const matches = masked.match(pattern)
    if (matches) {
      for (const match of matches) {
        if (
          type === "email" &&
          preserveUserEmail &&
          match.toLowerCase() === preserveUserEmail.toLowerCase()
        ) {
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

/**
 * @description Quickly checks if a string contains any detectable PII without performing
 * masking. Useful for conditional logic where you need to know if PII exists before
 * deciding whether to process or log data.
 *
 * @param {string} input - The text string to scan for PII
 * @returns {boolean} True if any PII pattern (SSN, credit card, email, phone, IP) is found
 *
 * @example
 * // Check before logging
 * if (containsPII(userMessage)) {
 *   logger.info('Message contains PII - not logging content');
 * } else {
 *   logger.info(`User message: ${userMessage}`);
 * }
 *
 * @example
 * // Detection examples
 * containsPII('Hello world')           // false
 * containsPII('Email: test@test.com')  // true
 * containsPII('SSN: 123-45-6789')      // true
 * containsPII('Call 555-123-4567')     // true
 */
export function containsPII(input: string): boolean {
  for (const { pattern } of PII_PATTERNS) {
    if (pattern.test(input)) {
      pattern.lastIndex = 0
      return true
    }
  }
  return false
}

/**
 * @description Partially masks an email address for display purposes while keeping it
 * recognizable to the owner. Shows the first 1-2 characters of the local part,
 * masks the rest with asterisks, and preserves the full domain.
 *
 * @param {string} email - The email address to partially mask
 * @returns {string} The partially masked email (e.g., 'jo***@example.com')
 *   Returns the original string if it's not a valid email format
 *
 * @example
 * // Standard masking
 * maskEmailPartially('john.doe@example.com')  // 'jo***@example.com'
 * maskEmailPartially('a@test.com')            // 'a***@test.com'
 *
 * @example
 * // Use in user notifications
 * const message = `Verification sent to ${maskEmailPartially(user.email)}`;
 * // Result: 'Verification sent to jo***@example.com'
 */
export function maskEmailPartially(email: string): string {
  const [local, domain] = email.split("@")
  if (!(local && domain)) {
    return email
  }

  const visibleChars = Math.min(2, local.length)
  const maskedLocal = `${local.slice(0, visibleChars)}***`

  return `${maskedLocal}@${domain}`
}

/**
 * @description Partially masks a phone number for display purposes while keeping the
 * last 4 digits visible. Normalizes the output to a consistent format regardless
 * of input formatting.
 *
 * @param {string} phone - The phone number to partially mask (any format accepted)
 * @returns {string} The partially masked phone in format '***-***-XXXX' where XXXX
 *   are the last 4 digits. Returns '[PHONE_REDACTED]' if the number has fewer
 *   than 4 digits.
 *
 * @example
 * // Various input formats produce consistent output
 * maskPhonePartially('555-123-4567')     // '***-***-4567'
 * maskPhonePartially('+1 (555) 123-4567') // '***-***-4567'
 * maskPhonePartially('5551234567')       // '***-***-4567'
 *
 * @example
 * // Use in user notifications
 * const message = `SMS sent to ${maskPhonePartially(user.phone)}`;
 * // Result: 'SMS sent to ***-***-4567'
 *
 * @example
 * // Too short numbers are fully redacted
 * maskPhonePartially('123')  // '[PHONE_REDACTED]'
 */
export function maskPhonePartially(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 4) {
    return "[PHONE_REDACTED]"
  }

  const lastFour = digits.slice(-4)
  return `***-***-${lastFour}`
}
