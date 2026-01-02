import express, { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/config";
import { sendR } from "@/utils/http";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import { userController } from "@/controllers/users-controller";

const router = express.Router();

router.param("id", (_req: Request, res: Response, next: NextFunction, id: string) => {
  if (!id) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "User ID parameter is required in order to get user information.");
  }

  next();
});

// get current user information
router.get("/get-user", supabaseAuth(), userController.getCurrentUserInformation);

// check session (lightweight - for auto-login check)
router.get("/session", supabaseAuth(), userController.checkSession);

// refresh token
router.post("/refresh", supabaseAuth(), userController.refreshToken);

// deactivate user
router.delete("/", supabaseAuth(), userController.deActivateUser);

// generate auth google url without using supabase 3rd party provider auth
router.get("/callback", userController.generateAuthGoogleUrl);

// verify user by email otp
router.post("/verify-user-by-email-otp", userController.verifyEmailByOtp);

// sign up user
router.post("/signup", userController.signUpUserReg);

// sign in user
router.post("/signin", userController.signInUserReg);

// logout user (clears cookies)
router.post("/logout", userController.logout);

// sign up or sign in with google
router.get("/signup/google", userController.signUpOrSignInWithGoogle);

// sign up user via github
router.get("/signup/github", userController.signUpUserViaGitHub);

// get any user information by id
router.get("/:id", userController.getUserInformationById);

export default router;
