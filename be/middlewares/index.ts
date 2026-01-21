import type { IncomingMessage } from "node:http";
import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import type { Express } from "express";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { ROUTES } from "@/config";
import { getAllowedOrigins } from "@/lib/security/cors-config";
import { apiRateLimiter } from "./rate-limiter";
import { securityAuditMiddleware } from "./security-audit";

const ACCESS_TOKEN_HEADER = "access_token";
const REFRESH_TOKEN_HEADER = "refresh_token";
const USER_KEY = "user";

export const initializeMiddlewares = (app: Express) => {
  app.use(
    helmet({
      // Allow cross-origin requests for API
      crossOriginResourcePolicy: { policy: "cross-origin" },
      // Disable CSP for API (no HTML served)
      contentSecurityPolicy: false,
    })
  );

  app.use(
    cors({
      origin: getAllowedOrigins(),
      credentials: true,
      exposedHeaders: [ACCESS_TOKEN_HEADER, REFRESH_TOKEN_HEADER, USER_KEY],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        REFRESH_TOKEN_HEADER,
        USER_KEY,
        ACCESS_TOKEN_HEADER,
      ],
    })
  );

  app.set("trust proxy", 1);
  app.use(apiRateLimiter);

  app.use(securityAuditMiddleware);

  const jsonParser = express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      (req as IncomingMessage & { rawBody?: string }).rawBody = buf.toString();
    },
  });

  app.use((req, res, next) => {
    if (
      req.path === ROUTES.WHATSAPP ||
      req.path.startsWith(`${ROUTES.WHATSAPP}/`)
    ) {
      return next();
    }
    jsonParser(req, res, next);
  });
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(morgan("dev", { immediate: true }));
  app.use("/static", express.static(path.join(__dirname, "public")));
};
