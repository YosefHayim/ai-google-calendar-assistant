import express, { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/config";
import { authHandler } from "@/middlewares/auth-handler";
import { sendR } from "@/utils/http";
import { userController } from "@/controllers/users-controller";

const router = express.Router();

router.param("id", (_req: Request, res: Response, next: NextFunction, id: string) => {
  if (!id) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "User ID parameter is required in order to get user information.");
  }

  next();
});

router.get("/me", authHandler, userController.getCurrentUserInformation);

router.get("/refresh", authHandler, userController.refreshToken);

router.delete("/", authHandler, userController.deActivateUser);

router.get("/callback", userController.generateAuthGoogleUrl);

router.post("/verify-user-by-email-otp", userController.verifyEmailByOtp);

router.post("/signup", userController.signUpUserReg);

router.post("/signin", userController.signInUserReg);

router.get("/signup/google", userController.signUpOrSignInWithGoogle);

router.get("/signup/github", userController.signUpUserViaGitHub);

router.get("/:id", userController.getUserInformationById);

export default router;
