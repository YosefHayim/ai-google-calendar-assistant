/**
 * Compression utilities for Redis storage optimization.
 *
 * Uses Node.js built-in zlib for gzip compression.
 * Compression is beneficial for payloads > 1KB.
 */

import { promisify } from "node:util"
import { gunzip, gzip } from "node:zlib"

const gzipAsync = promisify(gzip)
const gunzipAsync = promisify(gunzip)

// Only compress if payload exceeds this threshold (bytes)
const COMPRESSION_THRESHOLD = 1024

/**
 * @description Compresses a string using gzip and returns a base64-encoded result.
 * If the input is smaller than the compression threshold (1KB), the original
 * string is returned unchanged. Compressed output is prefixed with 'gz:' to
 * indicate compression was applied.
 * @param {string} data - The string to compress
 * @returns {Promise<string>} The compressed base64 string prefixed with 'gz:', or the original string if below threshold or compression fails
 * @example
 * const compressed = await compressString(largeJsonString);
 * // Returns: "gz:H4sIAAAAAAAAA..." for large inputs
 * // Returns: original string for small inputs
 */
export async function compressString(data: string): Promise<string> {
  if (data.length < COMPRESSION_THRESHOLD) {
    return data
  }

  try {
    const compressed = await gzipAsync(Buffer.from(data, "utf-8"))
    // Prefix with 'gz:' to indicate compressed data
    return `gz:${compressed.toString("base64")}`
  } catch {
    // Fall back to uncompressed on error
    return data
  }
}

/**
 * @description Decompresses a string that was previously compressed with compressString.
 * Automatically detects whether the data is compressed by checking for the 'gz:' prefix.
 * If the prefix is not present, the original string is returned unchanged.
 * @param {string} data - The potentially compressed string to decompress
 * @returns {Promise<string>} The decompressed original string, or the input unchanged if not compressed
 * @example
 * const original = await decompressString("gz:H4sIAAAAAAAAA...");
 * // Returns: the original uncompressed string
 *
 * const unchanged = await decompressString("regular string");
 * // Returns: "regular string" (no decompression needed)
 */
export async function decompressString(data: string): Promise<string> {
  if (!data.startsWith("gz:")) {
    return data
  }

  try {
    const compressed = Buffer.from(data.slice(3), "base64")
    const decompressed = await gunzipAsync(compressed)
    return decompressed.toString("utf-8")
  } catch {
    // Return as-is if decompression fails (might be corrupted)
    return data
  }
}

/**
 * @description Serializes a JavaScript object to JSON and compresses the result.
 * This is a convenience wrapper that combines JSON.stringify with compressString.
 * Useful for storing large objects in Redis or other storage systems.
 * @template T - The type of the object to compress
 * @param {T} obj - The object to serialize and compress
 * @returns {Promise<string>} The compressed JSON string (may be prefixed with 'gz:' if compression was applied)
 * @example
 * const userData = { name: "John", preferences: { ... } };
 * const compressed = await compressJSON(userData);
 * // Store in Redis: await redis.set("user:123", compressed);
 */
export async function compressJSON<T>(obj: T): Promise<string> {
  const json = JSON.stringify(obj)
  return compressString(json)
}

/**
 * @description Decompresses a string and parses it as JSON to restore the original object.
 * This is the inverse of compressJSON. Handles both compressed (gz:-prefixed) and
 * uncompressed JSON strings.
 * @template T - The expected type of the parsed object
 * @param {string} data - The compressed or uncompressed JSON string to parse
 * @returns {Promise<T>} The parsed JavaScript object of type T
 * @throws {SyntaxError} If the decompressed string is not valid JSON
 * @example
 * const compressed = await compressJSON({ name: "John" });
 * const restored = await decompressJSON<{ name: string }>(compressed);
 * // restored.name === "John"
 */
export async function decompressJSON<T>(data: string): Promise<T> {
  const json = await decompressString(data)
  return JSON.parse(json) as T
}
