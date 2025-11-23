import { userController } from "@/controllers/usersController";
import { SUPABASE } from "@/config/root-config";
import { PROVIDERS, STATUS_RESPONSE } from "@/types";
import { thirdPartySignInOrSignUp } from "@/utils/thirdPartyAuth";
import { generateGoogleAuthUrl, handleInitialAuthRequest } from "@/utils/auth/generateAuthUrl";
import { exchangeOAuthCode } from "@/utils/auth/exchangeOAuthToken";
import { storeUserTokens } from "@/utils/auth/storeUserTokens";
import { findUserByEmail, deactivateUserByEmail } from "@/utils/auth/userOperations";
import sendResponse from "@/utils/sendResponse";

jest.mock("@/config/root-config", () => ({
  SUPABASE: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      verifyOtp: jest.fn(),
    },
  },
}));

jest.mock("@/utils/thirdPartyAuth");
jest.mock("@/utils/auth/generateAuthUrl");
jest.mock("@/utils/auth/exchangeOAuthToken");
jest.mock("@/utils/auth/storeUserTokens");
jest.mock("@/utils/auth/userOperations");
jest.mock("@/utils/sendResponse");

describe("Users Controller", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      query: {},
      body: {},
      user: undefined,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("Controller Structure", () => {
    it("should export all required methods", () => {
      expect(userController).toHaveProperty("verifyEmailByOpt");
      expect(userController).toHaveProperty("signUpUserReg");
      expect(userController).toHaveProperty("signUpOrSignInWithGoogle");
      expect(userController).toHaveProperty("signUpUserViaGitHub");
      expect(userController).toHaveProperty("signInUserReg");
      expect(userController).toHaveProperty("getUserInformation");
      expect(userController).toHaveProperty("deActivateUser");
      expect(userController).toHaveProperty("generateAuthGoogleUrl");
    });

    it("all methods should be functions", () => {
      Object.values(userController).forEach((method) => {
        expect(typeof method).toBe("function");
      });
    });
  });

  describe("generateAuthGoogleUrl", () => {
    it("should return Google auth URL when no code provided", async () => {
      const mockUrl = "https://accounts.google.com/auth?...";
      (generateGoogleAuthUrl as jest.Mock).mockReturnValue(mockUrl);

      await userController.generateAuthGoogleUrl(mockReq, mockRes);

      expect(generateGoogleAuthUrl).toHaveBeenCalled();
      expect(handleInitialAuthRequest).toHaveBeenCalledWith(mockReq, mockRes, mockUrl);
    });

    it("should process OAuth code when provided", async () => {
      mockReq.query.code = "oauth_code_123";

      const mockTokens = {
        access_token: "access_token",
        refresh_token: "refresh_token",
      };

      const mockUser = {
        email: "test@example.com",
      };

      (generateGoogleAuthUrl as jest.Mock).mockReturnValue("https://accounts.google.com/auth?...");
      (exchangeOAuthCode as jest.Mock).mockResolvedValue({ tokens: mockTokens, user: mockUser });
      (storeUserTokens as jest.Mock).mockResolvedValue({ data: {}, error: null });

      await userController.generateAuthGoogleUrl(mockReq, mockRes);

      expect(exchangeOAuthCode).toHaveBeenCalledWith("oauth_code_123");
      expect(storeUserTokens).toHaveBeenCalledWith("test@example.com", mockTokens);
      expect(sendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.SUCCESS,
        "Tokens has been updated successfully.",
        expect.any(Object)
      );
    });

    it("should handle error when storing tokens fails", async () => {
      mockReq.query.code = "oauth_code_123";

      const mockTokens = {
        access_token: "access_token",
        refresh_token: "refresh_token",
      };

      const mockUser = {
        email: "test@example.com",
      };

      const mockError = new Error("Storage error");

      (generateGoogleAuthUrl as jest.Mock).mockReturnValue("https://accounts.google.com/auth?...");
      (exchangeOAuthCode as jest.Mock).mockResolvedValue({ tokens: mockTokens, user: mockUser });
      (storeUserTokens as jest.Mock).mockResolvedValue({ data: null, error: mockError });

      await userController.generateAuthGoogleUrl(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to store new tokens.",
        mockError
      );
    });

    it("should handle OAuth exchange error", async () => {
      mockReq.query.code = "invalid_code";

      const mockError = new Error("OAuth exchange failed");

      (generateGoogleAuthUrl as jest.Mock).mockReturnValue("https://accounts.google.com/auth?...");
      (exchangeOAuthCode as jest.Mock).mockRejectedValue(mockError);

      await userController.generateAuthGoogleUrl(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to process OAuth token exchange.",
        mockError
      );
    });
  });

  describe("signUpUserReg", () => {
    it("should sign up user successfully", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "password123",
      };

      const mockData = {
        user: { id: "user123", email: "test@example.com" },
      };

      (SUPABASE.auth.signUp as jest.Mock).mockResolvedValue({ data: mockData, error: null });

      await userController.signUpUserReg(mockReq, mockRes);

      expect(SUPABASE.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.SUCCESS, "User signed up successfully.", mockData);
    });

    it("should handle sign up error", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "password123",
      };

      const mockError = new Error("Sign up failed");

      (SUPABASE.auth.signUp as jest.Mock).mockResolvedValue({ data: null, error: mockError });

      await userController.signUpUserReg(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to sign up user.", mockError);
    });
  });

  describe("signUpOrSignInWithGoogle", () => {
    it("should call thirdPartySignInOrSignUp with Google provider", async () => {
      await userController.signUpOrSignInWithGoogle(mockReq, mockRes);

      expect(thirdPartySignInOrSignUp).toHaveBeenCalledWith(mockReq, mockRes, PROVIDERS.GOOGLE);
    });
  });

  describe("signUpUserViaGitHub", () => {
    it("should call thirdPartySignInOrSignUp with GitHub provider", async () => {
      await userController.signUpUserViaGitHub(mockReq, mockRes);

      expect(thirdPartySignInOrSignUp).toHaveBeenCalledWith(mockReq, mockRes, PROVIDERS.GITHUB);
    });
  });

  describe("getUserInformation", () => {
    it("should return user information when authenticated", () => {
      mockReq.user = {
        id: "user123",
        email: "test@example.com",
      };

      userController.getUserInformation(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.SUCCESS, "User fetched successfully.", mockReq.user);
    });

    it("should return unauthorized when user not authenticated", () => {
      userController.getUserInformation(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated.");
    });
  });

  describe("deActivateUser", () => {
    it("should deactivate user successfully", async () => {
      mockReq.body = {
        email: "test@example.com",
      };

      const mockUser = {
        id: "user123",
        email: "test@example.com",
      };

      (findUserByEmail as jest.Mock).mockResolvedValue({ data: [mockUser], error: null });
      (deactivateUserByEmail as jest.Mock).mockResolvedValue({ error: null });

      await userController.deActivateUser(mockReq, mockRes);

      expect(findUserByEmail).toHaveBeenCalledWith("test@example.com");
      expect(deactivateUserByEmail).toHaveBeenCalledWith("test@example.com");
      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.SUCCESS, "User deactivated successfully.");
    });

    it("should handle error when finding user fails", async () => {
      mockReq.body = {
        email: "test@example.com",
      };

      const mockError = new Error("Database error");

      (findUserByEmail as jest.Mock).mockResolvedValue({ data: null, error: mockError });

      await userController.deActivateUser(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to find user.", mockError);
    });

    it("should handle error when deactivating user fails", async () => {
      mockReq.body = {
        email: "test@example.com",
      };

      const mockUser = {
        id: "user123",
        email: "test@example.com",
      };

      const mockError = new Error("Deactivation error");

      (findUserByEmail as jest.Mock).mockResolvedValue({ data: [mockUser], error: null });
      (deactivateUserByEmail as jest.Mock).mockResolvedValue({ error: mockError });

      await userController.deActivateUser(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to deactivate user.",
        mockError
      );
    });
  });

  describe("signInUserReg", () => {
    it("should sign in user successfully", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "password123",
      };

      const mockData = {
        user: { id: "user123", email: "test@example.com" },
        session: { access_token: "token" },
      };

      (SUPABASE.auth.signInWithPassword as jest.Mock).mockResolvedValue({ data: mockData, error: null });

      await userController.signInUserReg(mockReq, mockRes);

      expect(SUPABASE.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.SUCCESS, "User signin successfully.", mockData);
    });

    it("should handle sign in error", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "wrong_password",
      };

      const mockError = new Error("Invalid credentials");

      (SUPABASE.auth.signInWithPassword as jest.Mock).mockResolvedValue({ data: null, error: mockError });

      await userController.signInUserReg(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to fetch user by email.",
        mockError
      );
    });
  });

  describe("verifyEmailByOpt", () => {
    it("should verify email successfully", async () => {
      mockReq.body = {
        email: "test@example.com",
        token: "123456",
      };

      const mockData = {
        user: { id: "user123", email: "test@example.com" },
      };

      (SUPABASE.auth.verifyOtp as jest.Mock).mockResolvedValue({ data: mockData, error: null });

      await userController.verifyEmailByOpt(mockReq, mockRes);

      expect(SUPABASE.auth.verifyOtp).toHaveBeenCalledWith({
        type: "email",
        email: "test@example.com",
        token: "123456",
      });
      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.SUCCESS, "Email verified successfully.", mockData);
    });

    it("should handle verification error", async () => {
      mockReq.body = {
        email: "test@example.com",
        token: "invalid_token",
      };

      const mockError = new Error("Invalid token");

      (SUPABASE.auth.verifyOtp as jest.Mock).mockResolvedValue({ data: null, error: mockError });

      await userController.verifyEmailByOpt(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to verify email.", mockError);
    });
  });
});
