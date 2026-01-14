import { mock } from 'bun:test'

// Mock useQuery hook result
export const createMockQueryResult = <T>(data: T | undefined = undefined) => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
  isSuccess: !!data,
  isFetching: false,
  refetch: mock(() => Promise.resolve({ data })),
  status: data ? 'success' : 'idle',
})

// Mock useMutation hook result
export const createMockMutationResult = <T, TVariables = unknown>() => ({
  mutate: mock(() => {}),
  mutateAsync: mock(() => Promise.resolve({} as T)),
  isLoading: false,
  isPending: false,
  isError: false,
  error: null,
  isSuccess: false,
  reset: mock(() => {}),
  status: 'idle' as const,
})

// Mock loading state
export const mockLoadingQuery = {
  data: undefined,
  isLoading: true,
  isError: false,
  error: null,
  isSuccess: false,
  isFetching: true,
  refetch: mock(() => Promise.resolve({ data: undefined })),
  status: 'pending' as const,
}

// Mock error state
export const mockErrorQuery = (error: Error) => ({
  data: undefined,
  isLoading: false,
  isError: true,
  error,
  isSuccess: false,
  isFetching: false,
  refetch: mock(() => Promise.resolve({ data: undefined })),
  status: 'error' as const,
})
