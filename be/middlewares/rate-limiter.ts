import rateLimit from "express-rate-limit";
import { STATUS_RESPONSE } from "@/config";
import { sendR } from "@/utils/http";

/**
 * Rate limiter for authentication endpoints
 * Prevents brute force attacks on login, signup, and password reset
 *
 * Limits: 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: "Too many authentication attempts. Please try again in 15 minutes.",
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: (_req, res) => {
    sendR(res, STATUS_RESPONSE.TOO_MANY_REQUESTS, "Too many authentication attempts. Please try again in 15 minutes.", {
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: 15 * 60, // seconds
    });
  },
  skip: (req) => {
    // Skip rate limiting for successful requests (optional)
    // This allows users to continue after successful auth
    return false;
  },
});

/**
 * Rate limiter for OTP verification
 * Stricter limits to prevent OTP brute forcing
 *
 * Limits: 3 attempts per 5 minutes per IP
 */
export const otpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 attempts per window
  message: "Too many verification attempts. Please try again in 5 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendR(res, STATUS_RESPONSE.TOO_MANY_REQUESTS, "Too many verification attempts. Please try again in 5 minutes.", {
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: 5 * 60,
    });
  },
});

/**
 * Rate limiter for token refresh
 * More lenient as this is needed for normal operation
 *
 * Limits: 30 requests per 15 minutes per IP
 */
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per window
  message: "Too many refresh attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendR(res, STATUS_RESPONSE.TOO_MANY_REQUESTS, "Too many refresh attempts. Please try again later.", {
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: 15 * 60,
    });
  },
});

/**
 * General API rate limiter
 * Prevents API abuse
 *
 * Limits: 100 requests per minute per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Too many requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendR(res, STATUS_RESPONSE.TOO_MANY_REQUESTS, "Too many requests. Please slow down.", {
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: 60,
    });
  },
});

/**
 * AI/Chat rate limiter - STRICT
 * Protects expensive AI endpoints from abuse
 *
 * Limits: 10 requests per minute per user (identified by user ID from auth)
 * Falls back to IP if user not authenticated
 */
export const aiChatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: "Too many AI requests. Please wait before sending more messages.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip || "anonymous";
  },
  handler: (_req, res) => {
    sendR(res, STATUS_RESPONSE.TOO_MANY_REQUESTS, "Too many AI requests. Please wait before sending more messages.", {
      code: "AI_RATE_LIMIT_EXCEEDED",
      retryAfter: 60,
    });
  },
});

/**
 * AI/Chat rate limiter - BURST protection
 * Prevents rapid-fire requests (possible automation/abuse)
 *
 * Limits: 3 requests per 10 seconds per user
 */
export const aiChatBurstLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 3, // 3 requests per 10 seconds
  message: "Too many requests in a short time. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip || "anonymous";
  },
  handler: (_req, res) => {
    sendR(res, STATUS_RESPONSE.TOO_MANY_REQUESTS, "Too many requests in a short time. Please slow down.", {
      code: "AI_BURST_LIMIT_EXCEEDED",
      retryAfter: 10,
    });
  },
});
