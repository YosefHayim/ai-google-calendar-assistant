/**
 * Pagination Utilities
 *
 * Centralized pagination helpers to ensure consistent handling
 * across all controllers and services.
 */

import type { Request } from "express"

export type PaginationParams = {
  page: number
  limit: number
  offset: number
}

export type PaginationResult<T> = {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type PaginationDefaults = {
  page: number
  limit: number
  maxLimit: number
}

const DEFAULT_PAGINATION: PaginationDefaults = {
  page: 1,
  limit: 20,
  maxLimit: 100,
}

/**
 * Parse pagination parameters from request query
 *
 * @param query - Request query object
 * @param defaults - Optional custom defaults
 * @returns Parsed pagination parameters with offset calculated
 *
 * @example
 * const { page, limit, offset } = parsePaginationParams(req.query);
 * query.range(offset, offset + limit - 1);
 */
export function parsePaginationParams(
  query: Request["query"],
  defaults: Partial<PaginationDefaults> = {}
): PaginationParams {
  const config = { ...DEFAULT_PAGINATION, ...defaults }

  const page = query.page
    ? Math.max(1, Number.parseInt(query.page as string, 10))
    : config.page

  let limit = query.limit
    ? Number.parseInt(query.limit as string, 10)
    : config.limit

  // Ensure limit is within bounds
  limit = Math.max(1, Math.min(limit, config.maxLimit))

  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Calculate pagination metadata from query results
 *
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Pagination metadata
 */
export function calculatePaginationMeta(
  total: number,
  page: number,
  limit: number
): Omit<PaginationResult<never>, "data"> {
  const totalPages = Math.ceil(total / limit)

  return {
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * Create a paginated response object
 *
 * @param data - Array of items for current page
 * @param total - Total number of items
 * @param params - Pagination parameters used
 * @returns Complete pagination result
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginationResult<T> {
  return {
    data,
    ...calculatePaginationMeta(total, params.page, params.limit),
  }
}

/**
 * Parse sort parameters from request query
 *
 * @param query - Request query object
 * @param allowedFields - List of allowed sort fields
 * @param defaultField - Default sort field
 * @param defaultOrder - Default sort order
 * @returns Sort parameters
 */
export function parseSortParams<T extends string>(
  query: Request["query"],
  allowedFields: readonly T[],
  defaultField: T,
  defaultOrder: "asc" | "desc" = "desc"
): { sortBy: T; sortOrder: "asc" | "desc" } {
  const sortBy = (allowedFields as readonly string[]).includes(
    query.sortBy as string
  )
    ? (query.sortBy as T)
    : defaultField

  const sortOrder =
    query.sortOrder === "asc" || query.sortOrder === "desc"
      ? query.sortOrder
      : defaultOrder

  return { sortBy, sortOrder }
}
