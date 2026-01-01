import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { QUERY_CONFIG, ENV } from "@/lib/constants";
import { extractApiError } from "./types";

/**
 * Global error handler for queries
 */
function handleQueryError(error: unknown) {
  const apiError = extractApiError(error);

  if (ENV.IS_DEVELOPMENT) {
    console.error("[Query Error]", apiError);
  }
}

/**
 * Global error handler for mutations
 */
function handleMutationError(error: unknown) {
  const apiError = extractApiError(error);

  if (ENV.IS_DEVELOPMENT) {
    console.error("[Mutation Error]", apiError);
  }
}

/**
 * Creates a configured QueryClient instance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleQueryError,
    }),
    mutationCache: new MutationCache({
      onError: handleMutationError,
    }),
    defaultOptions: {
      queries: {
        staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
        gcTime: QUERY_CONFIG.GC_TIME,
        retry: (failureCount, error) => {
          const apiError = extractApiError(error);
          // Don't retry on auth errors or client errors
          if (
            apiError.status === 401 ||
            apiError.status === 403 ||
            apiError.status === 400 ||
            apiError.status === 404
          ) {
            return false;
          }
          return failureCount < QUERY_CONFIG.DEFAULT_RETRY;
        },
        retryDelay: (attemptIndex) =>
          Math.min(QUERY_CONFIG.RETRY_DELAY * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
