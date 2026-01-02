import { AxiosError } from 'axios'

/**
 * Standardized API error structure
 */
export interface ApiError {
  status: number
  message: string
  code?: string
  details?: Record<string, unknown>
}

/**
 * Normalized query state for consistent UI handling
 */
export interface NormalizedQueryState<TData> {
  /** The fetched data (null if loading or error) */
  data: TData | null

  /** True during initial load */
  isLoading: boolean
  /** True during any fetch (includes refetch) */
  isFetching: boolean
  /** True only during refetch */
  isRefetching: boolean

  /** True if query failed */
  isError: boolean
  /** Structured error object */
  error: ApiError | null
  /** Error message string for display */
  errorMessage: string | null

  /** True if query succeeded */
  isSuccess: boolean

  /** Current query status */
  status: 'idle' | 'loading' | 'error' | 'success'

  /** Refetch the query */
  refetch: () => Promise<void>
}

/**
 * Normalized mutation state for consistent UI handling
 */
export interface NormalizedMutationState<TData, TVariables> {
  /** Execute the mutation */
  mutate: (variables: TVariables) => void
  /** Execute the mutation and return a promise */
  mutateAsync: (variables: TVariables) => Promise<TData>

  /** True while mutation is in progress */
  isLoading: boolean
  /** Alias for isLoading (React Query v5 naming) */
  isPending: boolean
  /** True if mutation failed */
  isError: boolean
  /** True if mutation succeeded */
  isSuccess: boolean
  /** True if mutation hasn't been called yet */
  isIdle: boolean

  /** Structured error object */
  error: ApiError | null
  /** Error message string for display */
  errorMessage: string | null

  /** The mutation result data */
  data: TData | null

  /** Reset the mutation state */
  reset: () => void
}

/**
 * Extract a structured error from various error types
 */
export function extractApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const response = error.response
    return {
      status: response?.status ?? 500,
      message: response?.data?.message ?? error.message ?? 'An error occurred',
      code: response?.data?.code,
      details: response?.data?.details,
    }
  }

  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message,
    }
  }

  return {
    status: 500,
    message: 'An unknown error occurred',
  }
}
