import express, { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/config";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import { sendR } from "@/utils/http";
import { userController } from "@/controllers/users-controller";

const router = express.Router();

router.param("id", (_req: Request, res: Response, next: NextFunction, id: string) => {
  if (!id) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "User ID parameter is required in order to get user information.");
  }

  next();
});

router.get("/me", supabaseAuth(), userController.getCurrentUserInformation);

router.post("/refresh", supabaseAuth(), userController.refreshToken);

router.delete("/", supabaseAuth(), userController.deActivateUser);

router.get("/callback", userController.generateAuthGoogleUrl);

router.post("/verify-user-by-email-otp", userController.verifyEmailByOtp);

router.post("/signup", userController.signUpUserReg);

router.post("/signin", userController.signInUserReg);

router.get("/signup/google", userController.signUpOrSignInWithGoogle);

router.get("/signup/github", userController.signUpUserViaGitHub);

router.get("/:id", userController.getUserInformationById);

export default router;
