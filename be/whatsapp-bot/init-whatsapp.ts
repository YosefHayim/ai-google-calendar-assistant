/**
 * WhatsApp Bot Initialization
 * Sets up WhatsApp Cloud API webhook handlers and message processing
 */

import { env } from "@/config";
import { logger } from "@/utils/logger";

/**
 * Checks if WhatsApp integration is properly configured
 */
export const isWhatsAppConfigured = (): boolean => {
  const { phoneNumberId, accessToken, verifyToken } = env.integrations.whatsapp;

  if (!(phoneNumberId && accessToken && verifyToken)) {
    return false;
  }

  return true;
};

/**
 * Logs WhatsApp configuration status on startup
 */
export const initWhatsApp = (): void => {
  const { phoneNumberId, accessToken, verifyToken, appSecret, apiVersion } =
    env.integrations.whatsapp;

  if (!isWhatsAppConfigured()) {
    logger.info(
      "WhatsApp: Integration not configured (missing required env vars)"
    );

    const missing: string[] = [];
    if (!phoneNumberId) {
      missing.push("WHATSAPP_PHONE_NUMBER_ID");
    }
    if (!accessToken) {
      missing.push("WHATSAPP_ACCESS_TOKEN");
    }
    if (!verifyToken) {
      missing.push("WHATSAPP_VERIFY_TOKEN");
    }

    if (missing.length > 0) {
      logger.info(`WhatsApp: Missing: ${missing.join(", ")}`);
    }
    return;
  }

  logger.info("WhatsApp: Integration configured successfully");
  logger.info(`WhatsApp: Phone Number ID: ${phoneNumberId?.slice(0, 8)}...`);
  logger.info(`WhatsApp: API Version: ${apiVersion}`);
  logger.info(
    `WhatsApp: Signature verification: ${appSecret ? "Enabled" : "Disabled (configure WHATSAPP_APP_SECRET for production)"}`
  );
};

/**
 * Gets WhatsApp configuration for diagnostics
 */
export const getWhatsAppStatus = (): {
  configured: boolean;
  phoneNumberId: string | null;
  apiVersion: string;
  signatureVerificationEnabled: boolean;
} => {
  const { phoneNumberId, appSecret, apiVersion } = env.integrations.whatsapp;

  return {
    configured: isWhatsAppConfigured(),
    phoneNumberId: phoneNumberId ? `${phoneNumberId.slice(0, 8)}...` : null,
    apiVersion,
    signatureVerificationEnabled: !!appSecret,
  };
};
