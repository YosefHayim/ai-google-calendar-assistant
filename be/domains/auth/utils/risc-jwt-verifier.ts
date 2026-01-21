/**
 * Google RISC JWT Verification Utility
 *
 * Handles fetching Google's public keys and verifying RISC Security Event Tokens.
 * @see https://developers.google.com/identity/protocols/risc
 */

import * as crypto from "node:crypto"
import { logger } from "@/lib/logger"
import type {
  GoogleJwk,
  GoogleJwks,
  JwtHeader,
  RiscSecurityEventToken,
} from "./risc-types"

const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs"
const EXPECTED_ISSUER = "https://accounts.google.com"
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

/** Cached Google public keys */
let cachedKeys: GoogleJwks | null = null
let cacheExpiresAt = 0

/**
 * Fetches Google's public keys for JWT verification.
 * Keys are cached for 1 hour to reduce network calls.
 */
async function fetchGooglePublicKeys(): Promise<GoogleJwks> {
  const now = Date.now()

  if (cachedKeys && now < cacheExpiresAt) {
    return cachedKeys
  }

  logger.info("RISC: Fetching Google public keys from", GOOGLE_CERTS_URL)

  const response = await fetch(GOOGLE_CERTS_URL)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Google public keys: ${response.status} ${response.statusText}`
    )
  }

  cachedKeys = (await response.json()) as GoogleJwks
  cacheExpiresAt = now + CACHE_TTL_MS

  logger.info(
    `RISC: Cached ${cachedKeys.keys.length} Google public keys for 1 hour`
  )

  return cachedKeys
}

/**
 * Decodes a base64url encoded string
 */
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters and add padding
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  return Buffer.from(base64 + padding, "base64").toString("utf-8")
}

/**
 * Decodes a base64url encoded string to Buffer
 */
function base64UrlDecodeToBuffer(str: string): Buffer {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  return Buffer.from(base64 + padding, "base64")
}

/**
 * Parses a JWT without verification (for extracting the header to find kid)
 */
function parseJwtUnverified(token: string): {
  header: JwtHeader
  payload: RiscSecurityEventToken
  signature: string
} {
  const parts = token.split(".")

  if (parts.length !== 3) {
    throw new Error("Invalid JWT format: expected 3 parts")
  }

  const [headerB64, payloadB64, signature] = parts

  const header = JSON.parse(base64UrlDecode(headerB64)) as JwtHeader
  const payload = JSON.parse(
    base64UrlDecode(payloadB64)
  ) as RiscSecurityEventToken

  return { header, payload, signature }
}

/**
 * Finds the public key matching the JWT's key ID
 */
function findKeyById(keys: GoogleJwks, kid: string): GoogleJwk | undefined {
  return keys.keys.find((key) => key.kid === kid)
}

/**
 * Converts a Google JWK to a PEM public key
 */
function jwkToPem(jwk: GoogleJwk): string {
  if (jwk.kty !== "RSA") {
    throw new Error(`Unsupported key type: ${jwk.kty}`)
  }

  const n = base64UrlDecodeToBuffer(jwk.n)
  const e = base64UrlDecodeToBuffer(jwk.e)

  // Build the RSA public key in DER format
  const _nLen = n.length
  const _eLen = e.length

  // ASN.1 INTEGER encoding helper
  const encodeInteger = (buf: Buffer): Buffer => {
    // Add leading zero if high bit is set (to ensure positive integer)
    const needsPadding = buf[0] & 0x80
    const len = buf.length + (needsPadding ? 1 : 0)

    const result = Buffer.alloc(2 + len)
    result[0] = 0x02 // INTEGER tag
    result[1] = len
    if (needsPadding) {
      result[2] = 0x00
      buf.copy(result, 3)
    } else {
      buf.copy(result, 2)
    }
    return result
  }

  const encodedN = encodeInteger(n)
  const encodedE = encodeInteger(e)

  // SEQUENCE containing n and e
  const rsaPublicKey = Buffer.concat([
    Buffer.from([0x30]), // SEQUENCE tag
    encodeLength(encodedN.length + encodedE.length),
    encodedN,
    encodedE,
  ])

  // Algorithm identifier for RSA
  const algorithmOid = Buffer.from([
    0x30,
    0x0d, // SEQUENCE
    0x06,
    0x09, // OID
    0x2a,
    0x86,
    0x48,
    0x86,
    0xf7,
    0x0d,
    0x01,
    0x01,
    0x01, // 1.2.840.113549.1.1.1 (rsaEncryption)
    0x05,
    0x00, // NULL
  ])

  // BIT STRING wrapper
  const bitString = Buffer.concat([
    Buffer.from([0x03]), // BIT STRING tag
    encodeLength(rsaPublicKey.length + 1),
    Buffer.from([0x00]), // No unused bits
    rsaPublicKey,
  ])

  // SubjectPublicKeyInfo SEQUENCE
  const spki = Buffer.concat([
    Buffer.from([0x30]), // SEQUENCE tag
    encodeLength(algorithmOid.length + bitString.length),
    algorithmOid,
    bitString,
  ])

  // Convert to PEM
  const b64 = spki.toString("base64")
  const lines = b64.match(/.{1,64}/g) || []
  return `-----BEGIN PUBLIC KEY-----\n${lines.join("\n")}\n-----END PUBLIC KEY-----`
}

/**
 * Encodes a length in DER format
 */
function encodeLength(len: number): Buffer {
  if (len < 128) {
    return Buffer.from([len])
  }

  const bytes: number[] = []
  let temp = len
  while (temp > 0) {
    bytes.unshift(temp & 0xff)
    temp >>= 8
  }
  return Buffer.from([0x80 | bytes.length, ...bytes])
}

/**
 * Verifies the JWT signature using the public key
 */
function verifySignature(
  token: string,
  pem: string,
  algorithm: string
): boolean {
  const parts = token.split(".")
  const signedContent = `${parts[0]}.${parts[1]}`
  const signature = base64UrlDecodeToBuffer(parts[2])

  // Map JWT algorithm to Node.js algorithm
  const nodeAlgorithm = algorithm === "RS256" ? "RSA-SHA256" : algorithm

  const verifier = crypto.createVerify(nodeAlgorithm)
  verifier.update(signedContent)

  return verifier.verify(pem, signature)
}

export type VerifyRiscTokenResult = {
  valid: boolean
  payload?: RiscSecurityEventToken
  error?: string
}

/**
 * Verifies a Google RISC Security Event Token
 *
 * @param token - The raw JWT string
 * @param expectedAudience - Your Google OAuth Client ID
 * @returns Verification result with the decoded payload if valid
 */
export async function verifyRiscToken(
  token: string,
  expectedAudience: string
): Promise<VerifyRiscTokenResult> {
  try {
    // 1. Parse the JWT to get the header (for kid) and payload
    const { header, payload, signature } = parseJwtUnverified(token)

    if (!signature) {
      return { valid: false, error: "Missing signature" }
    }

    // 2. Validate algorithm
    if (header.alg !== "RS256") {
      return {
        valid: false,
        error: `Unsupported algorithm: ${header.alg}`,
      }
    }

    // 3. Fetch Google's public keys
    const keys = await fetchGooglePublicKeys()

    // 4. Find the key matching the kid
    const key = findKeyById(keys, header.kid)
    if (!key) {
      // Try refreshing the cache in case keys were rotated
      cachedKeys = null
      cacheExpiresAt = 0
      const refreshedKeys = await fetchGooglePublicKeys()
      const refreshedKey = findKeyById(refreshedKeys, header.kid)

      if (!refreshedKey) {
        return {
          valid: false,
          error: `No matching key found for kid: ${header.kid}`,
        }
      }
    }

    const matchingKey =
      key || findKeyById(await fetchGooglePublicKeys(), header.kid)!

    // 5. Convert JWK to PEM and verify signature
    const pem = jwkToPem(matchingKey)
    const isValidSignature = verifySignature(token, pem, header.alg)

    if (!isValidSignature) {
      return { valid: false, error: "Invalid signature" }
    }

    // 6. Verify issuer
    if (payload.iss !== EXPECTED_ISSUER) {
      return {
        valid: false,
        error: `Invalid issuer: expected ${EXPECTED_ISSUER}, got ${payload.iss}`,
      }
    }

    // 7. Verify audience
    if (payload.aud !== expectedAudience) {
      return {
        valid: false,
        error: `Invalid audience: expected ${expectedAudience}, got ${payload.aud}`,
      }
    }

    // 8. Verify iat is not in the future (with 5 minute clock skew allowance)
    const nowSeconds = Math.floor(Date.now() / 1000)
    const clockSkewSeconds = 300 // 5 minutes

    if (payload.iat > nowSeconds + clockSkewSeconds) {
      return {
        valid: false,
        error: `Token issued in the future: iat=${payload.iat}, now=${nowSeconds}`,
      }
    }

    return { valid: true, payload }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error("RISC: Token verification failed:", message)
    return { valid: false, error: message }
  }
}

/**
 * Extracts the Google subject ID from a RISC event
 */
export function extractGoogleSubjectId(
  payload: RiscSecurityEventToken
): string | null {
  const events = payload.events

  for (const eventData of Object.values(events)) {
    if (
      eventData.subject?.subject_type === "iss-sub" &&
      eventData.subject.sub
    ) {
      return eventData.subject.sub
    }
  }

  return null
}

/**
 * Clears the cached keys (useful for testing)
 */
export function clearKeyCache(): void {
  cachedKeys = null
  cacheExpiresAt = 0
}
