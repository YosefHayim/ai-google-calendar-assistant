import { describe, expect, it, beforeEach, mock } from "bun:test";

// Mock authService
const mockSignIn = mock(() =>
  Promise.resolve({
    status: "success",
    data: {
      user: { id: "user-123", email: "test@example.com" },
      session: { access_token: "token-123" },
    },
  })
);

mock.module("@/services/auth.service", () => ({
  authService: {
    signIn: mockSignIn,
  },
}));

// Mock queryKeys
mock.module("@/lib/query/keys", () => ({
  queryKeys: {
    auth: {
      user: () => ["auth", "user"],
    },
  },
}));

// Mock query types
mock.module("@/lib/query/types", () => ({
  extractApiError: (error: Error) => ({
    message: error.message,
    status: 500,
  }),
}));

// Track mock state
let mockMutationState = {
  isPending: false,
  isError: false,
  isSuccess: false,
  isIdle: true,
  error: null as Error | null,
  data: null as unknown,
};
let mockMutationFn: ((vars: { email: string; password: string }) => Promise<unknown>) | null = null;
let mockOnSuccess: ((data: unknown, vars: unknown) => void) | null = null;
let mockInvalidateQueries = mock(() => {});

// Mock React Query
mock.module("@tanstack/react-query", () => ({
  useMutation: (options: {
    mutationFn: (vars: { email: string; password: string }) => Promise<unknown>;
    onSuccess?: (data: unknown, vars: unknown) => void;
    onError?: (error: Error) => void;
    onSettled?: (data: unknown, error: Error | null, vars: unknown) => void;
  }) => {
    mockMutationFn = options.mutationFn;
    mockOnSuccess = options.onSuccess || null;
    return {
      mutate: mock((vars: { email: string; password: string }) => {
        mockMutationFn?.(vars);
      }),
      mutateAsync: mock(async (vars: { email: string; password: string }) => {
        const result = await mockMutationFn?.(vars);
        if (mockOnSuccess && result) {
          mockOnSuccess(result, vars);
        }
        return result;
      }),
      ...mockMutationState,
    };
  },
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

// Import after mocks
import { useSignIn } from "@/hooks/queries/auth/useSignIn";

describe("useSignIn", () => {
  beforeEach(() => {
    mockSignIn.mockClear();
    mockInvalidateQueries.mockClear();
    mockMutationState = {
      isPending: false,
      isError: false,
      isSuccess: false,
      isIdle: true,
      error: null,
      data: null,
    };
  });

  describe("initialization", () => {
    it("should return mutation functions", () => {
      const result = useSignIn();

      expect(typeof result.mutate).toBe("function");
      expect(typeof result.mutateAsync).toBe("function");
    });

    it("should return loading state", () => {
      const result = useSignIn();

      expect(result.isLoading).toBe(false);
      expect(result.isPending).toBe(false);
    });

    it("should return error state", () => {
      const result = useSignIn();

      expect(result.isError).toBe(false);
      expect(result.error).toBeNull();
    });

    it("should return success state", () => {
      const result = useSignIn();

      expect(result.isSuccess).toBe(false);
    });

    it("should return idle state", () => {
      const result = useSignIn();

      expect(result.isIdle).toBe(true);
    });
  });

  describe("mutation", () => {
    it("should call authService.signIn with credentials", async () => {
      const { mutateAsync } = useSignIn();

      await mutateAsync({ email: "test@example.com", password: "password123" });

      expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password123");
    });

    it("should return auth data on success", async () => {
      mockSignIn.mockResolvedValue({
        status: "success",
        data: {
          user: { id: "user-456", email: "new@example.com" },
          session: { access_token: "new-token" },
        },
      });

      const { mutateAsync } = useSignIn();
      const result = await mutateAsync({ email: "new@example.com", password: "pass" });

      expect(result).toBeDefined();
      expect(result.data.user.id).toBe("user-456");
    });

    it("should invalidate user query on success", async () => {
      const { mutateAsync } = useSignIn();

      await mutateAsync({ email: "test@example.com", password: "password" });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["auth", "user"],
      });
    });
  });

  describe("callbacks", () => {
    it("should call onSuccess callback with data", async () => {
      const onSuccess = mock(() => {});
      const mockData = {
        user: { id: "user-123", email: "test@example.com" },
        session: { access_token: "token" },
      };
      mockSignIn.mockResolvedValue({
        status: "success",
        data: mockData,
      });

      const { mutateAsync } = useSignIn({ onSuccess });
      await mutateAsync({ email: "test@example.com", password: "pass" });

      expect(onSuccess).toHaveBeenCalledWith(
        mockData,
        { email: "test@example.com", password: "pass" }
      );
    });

    it("should accept onError callback", () => {
      const onError = mock(() => {});
      const result = useSignIn({ onError });

      expect(typeof result.mutate).toBe("function");
    });

    it("should accept onSettled callback", () => {
      const onSettled = mock(() => {});
      const result = useSignIn({ onSettled });

      expect(typeof result.mutate).toBe("function");
    });
  });

  describe("error handling", () => {
    it("should handle sign in failure", async () => {
      mockSignIn.mockRejectedValue(new Error("Invalid credentials"));

      const { mutateAsync } = useSignIn();

      await expect(mutateAsync({ email: "test@example.com", password: "wrong" })).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("should handle network errors", async () => {
      mockSignIn.mockRejectedValue(new Error("Network error"));

      const { mutateAsync } = useSignIn();

      await expect(mutateAsync({ email: "test@example.com", password: "pass" })).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("reset", () => {
    it("should provide reset function", () => {
      const result = useSignIn();

      expect(typeof result.reset).toBe("function");
    });
  });
});
