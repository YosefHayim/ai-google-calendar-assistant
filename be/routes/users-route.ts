import express, { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/config";
import { logger } from "@/utils/logger";
import { sendR } from "@/utils/http";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import { authRateLimiter, otpRateLimiter, refreshRateLimiter } from "@/middlewares/rate-limiter";
import { validate, signUpSchema, signInSchema, otpVerificationSchema, deactivateUserSchema } from "@/middlewares/validation";
import { userController } from "@/controllers/users-controller";

const router = express.Router();

router.param("id", (_req: Request, res: Response, next: NextFunction, id: string) => {
  if (!id) {
    logger.error(`Users: id not found`);
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "User ID parameter is required in order to get user information.");
  }
  next();
});

// get current user information
router.get("/get-user", supabaseAuth(), userController.getCurrentUserInformation);

// check session (lightweight - for auto-login check)
router.get("/session", supabaseAuth(), userController.checkSession);

// get google calendar integration status
router.get("/integrations/google-calendar", supabaseAuth(), userController.getGoogleCalendarIntegrationStatus);

// disconnect google calendar integration
router.post("/integrations/google-calendar/disconnect", supabaseAuth(), userController.disconnectGoogleCalendarIntegration);

// refresh token (rate limited)
router.post("/refresh", refreshRateLimiter, supabaseAuth(), userController.refreshToken);

// deactivate user (with input validation)
router.delete("/", supabaseAuth(), validate(deactivateUserSchema), userController.deActivateUser);

// generate auth google url without using supabase 3rd party provider auth
router.get("/callback", userController.generateAuthGoogleUrl);

// verify user by email otp (rate limited - stricter, with validation)
router.post("/verify-user-by-email-otp", otpRateLimiter, validate(otpVerificationSchema), userController.verifyEmailByOtp);

// sign up user (rate limited, with validation)
router.post("/signup", authRateLimiter, validate(signUpSchema), userController.signUpUserReg);

// sign in user (rate limited, with validation)
router.post("/signin", authRateLimiter, validate(signInSchema), userController.signInUserReg);

// logout user (clears cookies)
router.post("/logout", userController.logout);

// sign up or sign in with google (rate limited)
router.get("/signup/google", authRateLimiter, userController.signUpOrSignInWithGoogle);

// sign up user via github (rate limited)
router.get("/signup/github", authRateLimiter, userController.signUpUserViaGitHub);

// SECURITY FIX: Protect user info endpoint with authentication
// get any user information by id (requires authentication)
router.get("/:id", supabaseAuth(), userController.getUserInformationById);

export default router;
