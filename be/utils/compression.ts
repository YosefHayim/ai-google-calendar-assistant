/**
 * Compression utilities for Redis storage optimization.
 *
 * Uses Node.js built-in zlib for gzip compression.
 * Compression is beneficial for payloads > 1KB.
 */

import { promisify } from "node:util"
import { gzip, gunzip } from "node:zlib"

const gzipAsync = promisify(gzip)
const gunzipAsync = promisify(gunzip)

// Only compress if payload exceeds this threshold (bytes)
const COMPRESSION_THRESHOLD = 1024

/**
 * Compress a string using gzip and return base64 encoded result.
 * Returns original string if below threshold or compression fails.
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
 * Decompress a string that was compressed with compressString.
 * Automatically detects if data is compressed (has 'gz:' prefix).
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
 * Compress JSON object and return compressed string.
 */
export async function compressJSON<T>(obj: T): Promise<string> {
  const json = JSON.stringify(obj)
  return compressString(json)
}

/**
 * Decompress string and parse as JSON.
 */
export async function decompressJSON<T>(data: string): Promise<T> {
  const json = await decompressString(data)
  return JSON.parse(json) as T
}
