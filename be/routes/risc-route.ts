/**
 * Google RISC (Cross-Account Protection) Routes
 *
 * Exposes endpoints for receiving Google security events.
 * @see https://developers.google.com/identity/protocols/risc
 */

import express from "express";
import { riscController } from "@/controllers/risc-controller";

const router = express.Router();

// Middleware to parse application/secevent+jwt content type
router.use(
  express.text({
    type: ["application/secevent+jwt", "application/jwt"],
    limit: "64kb",
  })
);

/**
 * POST /api/google/risc
 *
 * Receives RISC Security Event Tokens from Google.
 * This endpoint must:
 * - Be publicly accessible (no auth)
 * - Accept application/secevent+jwt content type
 * - Return 202 Accepted quickly
 * - Verify JWT signature using Google's public keys
 */
router.post("/", riscController.handleRiscEvent);

/**
 * GET /api/google/risc/health
 *
 * Health check endpoint for monitoring.
 */
router.get("/health", riscController.healthCheck);

export default router;
