import { describe, expect, it, beforeEach, mock } from "bun:test";

// Mock apiClient
const mockGet = mock(() => Promise.resolve({ data: {} }));
const mockPost = mock(() => Promise.resolve({ data: {} }));
const mockDelete = mock(() => Promise.resolve({ data: {} }));

mock.module("@/lib/api/client", () => ({
  apiClient: {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
    defaults: { baseURL: "https://api.example.com" },
  },
}));

mock.module("@/lib/api/endpoints", () => ({
  ENDPOINTS: {
    USERS_SIGNIN: "/api/users/signin",
    USERS_SIGNUP: "/api/users/signup",
    USERS_VERIFY_OTP: "/api/users/verify-otp",
    USERS_GET_USER: "/api/users/me",
    USERS: "/api/users",
    USERS_SIGNUP_GOOGLE: "/api/users/signup/google",
    USERS_SIGNUP_GITHUB: "/api/users/signup/github",
  },
}));

// Import after mocks
import { authService } from "@/services/auth.service";

describe("authService", () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockPost.mockClear();
    mockDelete.mockClear();
  });

  describe("signIn", () => {
    it("should call signin endpoint with credentials", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: {
            user: { id: "user-123", email: "test@example.com" },
            session: { access_token: "token-123" },
          },
        },
      };
      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.signIn("test@example.com", "password123");

      expect(mockPost).toHaveBeenCalledWith("/api/users/signin", {
        email: "test@example.com",
        password: "password123",
      });
      expect(result.data).toBeDefined();
    });

    it("should return error response on failure", async () => {
      const mockResponse = {
        data: {
          status: "error",
          message: "Invalid credentials",
          data: null,
        },
      };
      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.signIn("test@example.com", "wrong");

      expect(result.status).toBe("error");
      expect(result.message).toBe("Invalid credentials");
    });
  });

  describe("signUp", () => {
    it("should call signup endpoint with credentials", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: {
            user: { id: "new-user", email: "new@example.com" },
          },
        },
      };
      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.signUp("new@example.com", "newpassword");

      expect(mockPost).toHaveBeenCalledWith("/api/users/signup", {
        email: "new@example.com",
        password: "newpassword",
      });
      expect(result.data).toBeDefined();
    });

    it("should return error for existing user", async () => {
      const mockResponse = {
        data: {
          status: "error",
          message: "User already exists",
          data: null,
        },
      };
      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.signUp("existing@example.com", "password");

      expect(result.status).toBe("error");
    });
  });

  describe("verifyOTP", () => {
    it("should verify OTP token", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: {
            user: { id: "user-123", email: "test@example.com" },
            session: { access_token: "verified-token" },
          },
        },
      };
      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.verifyOTP("test@example.com", "123456");

      expect(mockPost).toHaveBeenCalledWith("/api/users/verify-otp", {
        email: "test@example.com",
        token: "123456",
      });
      expect(result.data).toBeDefined();
    });

    it("should return error for invalid OTP", async () => {
      const mockResponse = {
        data: {
          status: "error",
          message: "Invalid OTP",
          data: null,
        },
      };
      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.verifyOTP("test@example.com", "000000");

      expect(result.status).toBe("error");
    });
  });

  describe("getUser", () => {
    it("should fetch current user without custom user flag", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: { id: "user-123", email: "test@example.com" },
        },
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await authService.getUser();

      expect(mockGet).toHaveBeenCalledWith("/api/users/me", {
        params: undefined,
      });
      expect(result.data).toBeDefined();
    });

    it("should fetch custom user when flag is true", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: {
            id: "user-123",
            email: "test@example.com",
            profile: { name: "Test User" },
          },
        },
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await authService.getUser(true);

      expect(mockGet).toHaveBeenCalledWith("/api/users/me", {
        params: { customUser: "true" },
      });
      expect(result.data).toBeDefined();
    });
  });

  describe("deactivateUser", () => {
    it("should call delete endpoint", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: null,
        },
      };
      mockDelete.mockResolvedValue(mockResponse);

      const result = await authService.deactivateUser();

      expect(mockDelete).toHaveBeenCalledWith("/api/users");
      expect(result.status).toBe("success");
    });
  });

  describe("getGoogleAuthUrl", () => {
    it("should return correct Google auth URL", () => {
      const url = authService.getGoogleAuthUrl();

      expect(url).toBe("https://api.example.com/api/users/signup/google");
    });
  });

  describe("getGitHubAuthUrl", () => {
    it("should return correct GitHub auth URL", () => {
      const url = authService.getGitHubAuthUrl();

      expect(url).toBe("https://api.example.com/api/users/signup/github");
    });
  });
});
