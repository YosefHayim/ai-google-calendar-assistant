import { describe, expect, it, beforeEach, mock } from "bun:test";

// Mock authService
const mockSignUp = mock(() =>
  Promise.resolve({
    status: "success",
    data: {
      user: { id: "new-user-123", email: "new@example.com" },
    },
  })
);

mock.module("@/services/auth.service", () => ({
  authService: {
    signUp: mockSignUp,
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
}));

// Import after mocks
import { useSignUp } from "@/hooks/queries/auth/useSignUp";

describe("useSignUp", () => {
  beforeEach(() => {
    mockSignUp.mockClear();
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
      const result = useSignUp();

      expect(typeof result.mutate).toBe("function");
      expect(typeof result.mutateAsync).toBe("function");
    });

    it("should return loading state", () => {
      const result = useSignUp();

      expect(result.isLoading).toBe(false);
      expect(result.isPending).toBe(false);
    });

    it("should return error state", () => {
      const result = useSignUp();

      expect(result.isError).toBe(false);
      expect(result.error).toBeNull();
    });

    it("should return success state", () => {
      const result = useSignUp();

      expect(result.isSuccess).toBe(false);
    });

    it("should return idle state initially", () => {
      const result = useSignUp();

      expect(result.isIdle).toBe(true);
    });
  });

  describe("mutation", () => {
    it("should call authService.signUp with credentials", async () => {
      const { mutateAsync } = useSignUp();

      await mutateAsync({ email: "new@example.com", password: "newpassword123" });

      expect(mockSignUp).toHaveBeenCalledWith("new@example.com", "newpassword123");
    });

    it("should return user data on success", async () => {
      mockSignUp.mockResolvedValue({
        status: "success",
        data: {
          user: { id: "user-456", email: "created@example.com" },
        },
      });

      const { mutateAsync } = useSignUp();
      const result = await mutateAsync({ email: "created@example.com", password: "pass123" });

      expect(result).toBeDefined();
      expect(result.data.user.email).toBe("created@example.com");
    });
  });

  describe("callbacks", () => {
    it("should call onSuccess callback with data", async () => {
      const onSuccess = mock(() => {});
      const mockData = {
        user: { id: "new-user", email: "new@example.com" },
      };
      mockSignUp.mockResolvedValue({
        status: "success",
        data: mockData,
      });

      const { mutateAsync } = useSignUp({ onSuccess });
      await mutateAsync({ email: "new@example.com", password: "pass" });

      expect(onSuccess).toHaveBeenCalledWith(mockData, {
        email: "new@example.com",
        password: "pass",
      });
    });

    it("should accept onError callback", () => {
      const onError = mock(() => {});
      const result = useSignUp({ onError });

      expect(typeof result.mutate).toBe("function");
    });

    it("should accept onSettled callback", () => {
      const onSettled = mock(() => {});
      const result = useSignUp({ onSettled });

      expect(typeof result.mutate).toBe("function");
    });
  });

  describe("error handling", () => {
    it("should handle user already exists error", async () => {
      mockSignUp.mockRejectedValue(new Error("User already exists"));

      const { mutateAsync } = useSignUp();

      await expect(mutateAsync({ email: "existing@example.com", password: "pass" })).rejects.toThrow(
        "User already exists"
      );
    });

    it("should handle weak password error", async () => {
      mockSignUp.mockRejectedValue(new Error("Password is too weak"));

      const { mutateAsync } = useSignUp();

      await expect(mutateAsync({ email: "new@example.com", password: "123" })).rejects.toThrow(
        "Password is too weak"
      );
    });

    it("should handle network errors", async () => {
      mockSignUp.mockRejectedValue(new Error("Network error"));

      const { mutateAsync } = useSignUp();

      await expect(mutateAsync({ email: "new@example.com", password: "pass" })).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle invalid email error", async () => {
      mockSignUp.mockRejectedValue(new Error("Invalid email format"));

      const { mutateAsync } = useSignUp();

      await expect(mutateAsync({ email: "invalid-email", password: "pass" })).rejects.toThrow(
        "Invalid email format"
      );
    });
  });

  describe("reset", () => {
    it("should provide reset function", () => {
      const result = useSignUp();

      expect(typeof result.reset).toBe("function");
    });
  });

  describe("data handling", () => {
    it("should return null data initially", () => {
      const result = useSignUp();

      expect(result.data).toBeNull();
    });

    it("should return null errorMessage when no error", () => {
      const result = useSignUp();

      expect(result.errorMessage).toBeNull();
    });
  });
});
