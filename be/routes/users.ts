import express from "express";
import { userController } from "@/controllers/users-controller";
import { authHandler } from "@/middlewares/auth-handler";

const router = express.Router();

/**
 * @swagger
 * /api/users/get-user:
 *   get:
 *     summary: Get authenticated user information
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserInfo'
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/get-user", authHandler, userController.getUserInformation);

/**
 * @swagger
 * /api/users:
 *   delete:
 *     summary: Deactivate a user account
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeactivateUserRequest'
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/", authHandler, userController.deActivateUser);

/**
 * @swagger
 * /api/users/callback:
 *   get:
 *     summary: Generate Google OAuth URL or handle OAuth callback
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: OAuth authorization code (if present, processes callback)
 *     responses:
 *       200:
 *         description: OAuth URL generated or tokens updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: string
 *                   description: OAuth URL (when code is not provided)
 *                 - allOf:
 *                   - $ref: '#/components/schemas/ApiResponse'
 *                   - type: object
 *                     properties:
 *                       data:
 *                         type: object
 *                         properties:
 *                           data:
 *                             type: array
 *                             items:
 *                               type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/callback", userController.generateAuthGoogleUrl);

/**
 * @swagger
 * /api/users/verify-user-by-email-otp:
 *   post:
 *     summary: Verify user email using OTP token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmailOtpRequest'
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserInfo'
 *       400:
 *         description: Bad request - Email and token are required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/verify-user-by-email-otp", userController.verifyEmailByOpt);

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpRequest'
 *     responses:
 *       200:
 *         description: User signed up successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserInfo'
 *       400:
 *         description: Bad request - Email and password are required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/signup", userController.signUpUserReg);

/**
 * @swagger
 * /api/users/signin:
 *   post:
 *     summary: Sign in an existing user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignInRequest'
 *     responses:
 *       200:
 *         description: User signed in successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserInfo'
 *       400:
 *         description: Bad request - Email and password are required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/signin", userController.signInUserReg);

/**
 * @swagger
 * /api/users/signup/google:
 *   get:
 *     summary: Sign up or sign in with Google OAuth
 *     tags: [Users]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth consent screen
 *       200:
 *         description: OAuth URL returned (for API clients)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 */
router.get("/signup/google", userController.signUpOrSignInWithGoogle);

/**
 * @swagger
 * /api/users/signup/github:
 *   get:
 *     summary: Sign up user via GitHub OAuth
 *     tags: [Users]
 *     responses:
 *       302:
 *         description: Redirects to GitHub OAuth consent screen
 *       200:
 *         description: OAuth URL returned (for API clients)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 */
router.get("/signup/github", userController.signUpUserViaGitHub);

export default router;
