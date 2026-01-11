/**
 * SSRF (Server-Side Request Forgery) Protection
 *
 * Prevents attackers from making the server fetch internal resources or
 * unintended external endpoints. Critical for any feature that fetches URLs.
 */

import { logger } from "@/utils/logger"
import { URL } from "node:url"
import { isIP } from "node:net"

const ALLOWED_PROTOCOLS = new Set(["https:", "http:"])

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "metadata.google.internal",
  "metadata.google.com",
  "169.254.169.254",
  "metadata.aws.amazon.com",
  "instance-data",
])

const BLOCKED_HOSTNAME_PATTERNS = [
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // 10.x.x.x (private)
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/, // 172.16-31.x.x (private)
  /^192\.168\.\d{1,3}\.\d{1,3}$/, // 192.168.x.x (private)
  /^169\.254\.\d{1,3}\.\d{1,3}$/, // link-local
  /\.local$/, // mDNS
  /\.internal$/, // internal domains
  /\.localhost$/, // localhost variations
]

const ALLOWED_EXTERNAL_DOMAINS = new Set([
  "api.telegram.org",
  "graph.facebook.com",
  "api.whatsapp.com",
  "api.openai.com",
  "api.anthropic.com",
  "generativelanguage.googleapis.com",
  "accounts.google.com",
  "oauth2.googleapis.com",
  "www.googleapis.com",
  "api.lemonsqueezy.com",
])

export interface SSRFValidationResult {
  safe: boolean
  reason?: string
  normalizedUrl?: string
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number)
  if (parts.length !== 4) return false

  // 10.x.x.x
  if (parts[0] === 10) return true
  // 172.16.x.x - 172.31.x.x
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
  // 192.168.x.x
  if (parts[0] === 192 && parts[1] === 168) return true
  // 127.x.x.x (loopback)
  if (parts[0] === 127) return true
  // 169.254.x.x (link-local)
  if (parts[0] === 169 && parts[1] === 254) return true
  // 0.x.x.x
  if (parts[0] === 0) return true

  return false
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().replace(/^\[|\]$/g, "")

  if (normalized === "::1") return true
  if (normalized.startsWith("fe80:")) return true // link-local
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true // unique local
  if (normalized === "::") return true

  return false
}

export function validateUrlForSSRF(urlString: string, options?: {
  allowPrivateIPs?: boolean
  allowedDomains?: Set<string>
  strictMode?: boolean
}): SSRFValidationResult {
  const { allowPrivateIPs = false, allowedDomains, strictMode = false } = options || {}

  try {
    const url = new URL(urlString)

    if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
      return { safe: false, reason: `Blocked protocol: ${url.protocol}` }
    }

    const hostname = url.hostname.toLowerCase()

    if (BLOCKED_HOSTNAMES.has(hostname)) {
      logger.warn(`SECURITY: SSRF blocked - attempted access to ${hostname}`)
      return { safe: false, reason: "Access to internal resources is not allowed" }
    }

    for (const pattern of BLOCKED_HOSTNAME_PATTERNS) {
      if (pattern.test(hostname)) {
        logger.warn(`SECURITY: SSRF blocked - hostname matches blocked pattern: ${hostname}`)
        return { safe: false, reason: "Access to internal resources is not allowed" }
      }
    }

    const ipVersion = isIP(hostname)
    if (ipVersion === 4 && !allowPrivateIPs && isPrivateIPv4(hostname)) {
      logger.warn(`SECURITY: SSRF blocked - private IPv4: ${hostname}`)
      return { safe: false, reason: "Access to private IP addresses is not allowed" }
    }

    if (ipVersion === 6 && !allowPrivateIPs && isPrivateIPv6(hostname)) {
      logger.warn(`SECURITY: SSRF blocked - private IPv6: ${hostname}`)
      return { safe: false, reason: "Access to private IP addresses is not allowed" }
    }

    if (strictMode) {
      const domainsToCheck = allowedDomains || ALLOWED_EXTERNAL_DOMAINS
      if (!domainsToCheck.has(hostname)) {
        logger.warn(`SECURITY: SSRF blocked in strict mode - domain not in allowlist: ${hostname}`)
        return { safe: false, reason: "Domain not in allowed list" }
      }
    }

    return { safe: true, normalizedUrl: url.toString() }
  } catch (error) {
    logger.warn(`SECURITY: SSRF validation failed - invalid URL: ${urlString}`)
    return { safe: false, reason: "Invalid URL format" }
  }
}

export async function safeFetch(
  urlString: string,
  options?: RequestInit & { ssrfOptions?: Parameters<typeof validateUrlForSSRF>[1] }
): Promise<Response> {
  const { ssrfOptions, ...fetchOptions } = options || {}

  const validation = validateUrlForSSRF(urlString, ssrfOptions)
  if (!validation.safe) {
    throw new Error(`SSRF Protection: ${validation.reason}`)
  }

  return fetch(validation.normalizedUrl!, fetchOptions)
}

export function isAllowedDomain(hostname: string): boolean {
  return ALLOWED_EXTERNAL_DOMAINS.has(hostname.toLowerCase())
}

export function addAllowedDomain(hostname: string): void {
  ALLOWED_EXTERNAL_DOMAINS.add(hostname.toLowerCase())
}
