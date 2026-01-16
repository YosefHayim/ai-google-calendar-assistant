/**
 * SSRF (Server-Side Request Forgery) Protection
 *
 * Prevents attackers from making the server fetch internal resources or
 * unintended external endpoints. Critical for any feature that fetches URLs.
 */

import { isIP } from "node:net";
import { URL } from "node:url";
import { logger } from "@/utils/logger";

const ALLOWED_PROTOCOLS = new Set(["https:", "http:"]);

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
]);

const BLOCKED_HOSTNAME_PATTERNS = [
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // 10.x.x.x (private)
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/, // 172.16-31.x.x (private)
  /^192\.168\.\d{1,3}\.\d{1,3}$/, // 192.168.x.x (private)
  /^169\.254\.\d{1,3}\.\d{1,3}$/, // link-local
  /\.local$/, // mDNS
  /\.internal$/, // internal domains
  /\.localhost$/, // localhost variations
];

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
]);

export type SSRFValidationResult = {
  safe: boolean;
  reason?: string;
  normalizedUrl?: string;
};

/**
 * @description Checks if an IPv4 address belongs to a private, reserved, or internal
 * network range. Used internally by SSRF protection to block access to internal resources.
 * Private ranges include: 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 127.x.x.x (loopback),
 * 169.254.x.x (link-local), and 0.x.x.x.
 *
 * @param {string} ip - The IPv4 address string to check (e.g., '192.168.1.1')
 * @returns {boolean} True if the IP is in a private/reserved range, false otherwise
 *
 * @example
 * isPrivateIPv4('192.168.1.1')   // true (private)
 * isPrivateIPv4('10.0.0.1')      // true (private)
 * isPrivateIPv4('127.0.0.1')     // true (loopback)
 * isPrivateIPv4('8.8.8.8')       // false (public Google DNS)
 * isPrivateIPv4('172.16.0.1')    // true (private)
 * isPrivateIPv4('172.32.0.1')    // false (not in private range)
 *
 * @private
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) {
    return false;
  }

  // 10.x.x.x
  if (parts[0] === 10) {
    return true;
  }
  // 172.16.x.x - 172.31.x.x
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return true;
  }
  // 192.168.x.x
  if (parts[0] === 192 && parts[1] === 168) {
    return true;
  }
  // 127.x.x.x (loopback)
  if (parts[0] === 127) {
    return true;
  }
  // 169.254.x.x (link-local)
  if (parts[0] === 169 && parts[1] === 254) {
    return true;
  }
  // 0.x.x.x
  if (parts[0] === 0) {
    return true;
  }

  return false;
}

/**
 * @description Checks if an IPv6 address belongs to a private, reserved, or internal
 * network range. Used internally by SSRF protection to block access to internal resources.
 * Private ranges include: ::1 (loopback), fe80: (link-local), fc/fd (unique local),
 * and :: (unspecified).
 *
 * @param {string} ip - The IPv6 address string to check, with or without brackets
 * @returns {boolean} True if the IP is in a private/reserved range, false otherwise
 *
 * @example
 * isPrivateIPv6('::1')           // true (loopback)
 * isPrivateIPv6('[::1]')         // true (bracketed loopback)
 * isPrivateIPv6('fe80::1')       // true (link-local)
 * isPrivateIPv6('fd00::1')       // true (unique local)
 * isPrivateIPv6('2001:4860::1')  // false (public Google)
 *
 * @private
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().replace(/^\[|\]$/g, "");

  if (normalized === "::1") {
    return true;
  }
  if (normalized.startsWith("fe80:")) {
    return true; // link-local
  }
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
    return true; // unique local
  }
  if (normalized === "::") {
    return true;
  }

  return false;
}

/**
 * @description Validates a URL for Server-Side Request Forgery (SSRF) vulnerabilities.
 * Checks against blocked protocols, hostnames, IP ranges, and optionally enforces
 * a domain allowlist. Logs security warnings when suspicious URLs are blocked.
 *
 * @param {string} urlString - The URL string to validate
 * @param {Object} [options] - Optional validation configuration
 * @param {boolean} [options.allowPrivateIPs=false] - Whether to allow private IP addresses
 * @param {Set<string>} [options.allowedDomains] - Custom set of allowed domains (overrides default)
 * @param {boolean} [options.strictMode=false] - If true, only allows domains in the allowlist
 * @returns {SSRFValidationResult} An object containing:
 *   - safe: boolean indicating if the URL is safe to fetch
 *   - reason: explanation if unsafe (only if safe is false)
 *   - normalizedUrl: the validated URL string (only if safe is true)
 *
 * @example
 * // Basic validation
 * const result = validateUrlForSSRF('https://api.example.com/data');
 * if (result.safe) {
 *   // Safe to fetch result.normalizedUrl
 * }
 *
 * @example
 * // Strict mode with custom allowlist
 * const allowed = new Set(['api.trusted.com']);
 * const result = validateUrlForSSRF(url, {
 *   strictMode: true,
 *   allowedDomains: allowed
 * });
 *
 * @example
 * // Blocked URLs
 * validateUrlForSSRF('http://localhost:8080')        // { safe: false, reason: '...' }
 * validateUrlForSSRF('http://169.254.169.254/meta')  // { safe: false, reason: '...' }
 * validateUrlForSSRF('file:///etc/passwd')           // { safe: false, reason: 'Blocked protocol' }
 */
export function validateUrlForSSRF(
  urlString: string,
  options?: {
    allowPrivateIPs?: boolean;
    allowedDomains?: Set<string>;
    strictMode?: boolean;
  }
): SSRFValidationResult {
  const {
    allowPrivateIPs = false,
    allowedDomains,
    strictMode = false,
  } = options || {};

  try {
    const url = new URL(urlString);

    if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
      return { safe: false, reason: `Blocked protocol: ${url.protocol}` };
    }

    const hostname = url.hostname.toLowerCase();

    if (BLOCKED_HOSTNAMES.has(hostname)) {
      logger.warn(`SECURITY: SSRF blocked - attempted access to ${hostname}`);
      return {
        safe: false,
        reason: "Access to internal resources is not allowed",
      };
    }

    for (const pattern of BLOCKED_HOSTNAME_PATTERNS) {
      if (pattern.test(hostname)) {
        logger.warn(
          `SECURITY: SSRF blocked - hostname matches blocked pattern: ${hostname}`
        );
        return {
          safe: false,
          reason: "Access to internal resources is not allowed",
        };
      }
    }

    const ipVersion = isIP(hostname);
    if (ipVersion === 4 && !allowPrivateIPs && isPrivateIPv4(hostname)) {
      logger.warn(`SECURITY: SSRF blocked - private IPv4: ${hostname}`);
      return {
        safe: false,
        reason: "Access to private IP addresses is not allowed",
      };
    }

    if (ipVersion === 6 && !allowPrivateIPs && isPrivateIPv6(hostname)) {
      logger.warn(`SECURITY: SSRF blocked - private IPv6: ${hostname}`);
      return {
        safe: false,
        reason: "Access to private IP addresses is not allowed",
      };
    }

    if (strictMode) {
      const domainsToCheck = allowedDomains || ALLOWED_EXTERNAL_DOMAINS;
      if (!domainsToCheck.has(hostname)) {
        logger.warn(
          `SECURITY: SSRF blocked in strict mode - domain not in allowlist: ${hostname}`
        );
        return { safe: false, reason: "Domain not in allowed list" };
      }
    }

    return { safe: true, normalizedUrl: url.toString() };
  } catch (_error) {
    logger.warn(`SECURITY: SSRF validation failed - invalid URL: ${urlString}`);
    return { safe: false, reason: "Invalid URL format" };
  }
}

/**
 * @description A secure wrapper around the native fetch API that validates URLs for
 * SSRF vulnerabilities before making the request. Throws an error if the URL fails
 * validation, preventing requests to internal or unauthorized resources.
 *
 * @param {string} urlString - The URL to fetch
 * @param {Object} [options] - Fetch options extended with SSRF configuration
 * @param {RequestInit} [options] - Standard fetch options (method, headers, body, etc.)
 * @param {Object} [options.ssrfOptions] - SSRF validation options passed to validateUrlForSSRF
 * @param {boolean} [options.ssrfOptions.allowPrivateIPs] - Allow private IP addresses
 * @param {Set<string>} [options.ssrfOptions.allowedDomains] - Custom domain allowlist
 * @param {boolean} [options.ssrfOptions.strictMode] - Only allow explicitly listed domains
 * @returns {Promise<Response>} The fetch Response if URL passes validation
 * @throws {Error} If SSRF validation fails with message 'SSRF Protection: {reason}'
 *
 * @example
 * // Basic secure fetch
 * try {
 *   const response = await safeFetch('https://api.example.com/data');
 *   const data = await response.json();
 * } catch (error) {
 *   console.error('Fetch blocked:', error.message);
 * }
 *
 * @example
 * // With fetch and SSRF options
 * const response = await safeFetch('https://api.trusted.com/webhook', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(payload),
 *   ssrfOptions: { strictMode: true }
 * });
 *
 * @example
 * // This will throw an error
 * await safeFetch('http://localhost:3000/internal');
 * // Error: SSRF Protection: Access to internal resources is not allowed
 */
export async function safeFetch(
  urlString: string,
  options?: RequestInit & {
    ssrfOptions?: Parameters<typeof validateUrlForSSRF>[1];
  }
): Promise<Response> {
  const { ssrfOptions, ...fetchOptions } = options || {};

  const validation = validateUrlForSSRF(urlString, ssrfOptions);
  if (!validation.safe) {
    throw new Error(`SSRF Protection: ${validation.reason}`);
  }

  return fetch(validation.normalizedUrl!, fetchOptions);
}

/**
 * @description Checks if a hostname is in the default allowlist of trusted external domains.
 * The allowlist includes common API providers like Telegram, OpenAI, Anthropic, Google APIs,
 * and LemonSqueezy. Case-insensitive comparison.
 *
 * @param {string} hostname - The hostname to check (e.g., 'api.telegram.org')
 * @returns {boolean} True if the hostname is in the allowlist, false otherwise
 *
 * @example
 * // Check if domain is trusted
 * isAllowedDomain('api.telegram.org')   // true
 * isAllowedDomain('api.anthropic.com')  // true
 * isAllowedDomain('evil.com')           // false
 *
 * @example
 * // Case insensitive
 * isAllowedDomain('API.TELEGRAM.ORG')   // true
 */
export function isAllowedDomain(hostname: string): boolean {
  return ALLOWED_EXTERNAL_DOMAINS.has(hostname.toLowerCase());
}

/**
 * @description Adds a hostname to the runtime allowlist of trusted external domains.
 * This modification persists for the lifetime of the process. Useful for dynamically
 * trusting new API endpoints or partner domains. The hostname is normalized to lowercase.
 *
 * @param {string} hostname - The hostname to add to the allowlist (e.g., 'api.partner.com')
 * @returns {void}
 *
 * @example
 * // Add a new trusted domain at runtime
 * addAllowedDomain('api.newpartner.com');
 *
 * // Now this domain will pass strict mode validation
 * const result = validateUrlForSSRF('https://api.newpartner.com/data', {
 *   strictMode: true
 * });
 * // result.safe === true
 *
 * @example
 * // Case is normalized
 * addAllowedDomain('API.EXAMPLE.COM');
 * isAllowedDomain('api.example.com'); // true
 */
export function addAllowedDomain(hostname: string): void {
  ALLOWED_EXTERNAL_DOMAINS.add(hostname.toLowerCase());
}
