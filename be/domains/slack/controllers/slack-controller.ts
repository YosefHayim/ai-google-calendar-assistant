import type { Request, Response } from "express";
import {
  deactivateWorkspace,
  exchangeCodeForToken,
  generateInstallUrl,
} from "@/slack-bot/services/oauth-service";

import { STATUS_RESPONSE } from "@/config/constants/http";
import { SUPABASE } from "@/infrastructure/supabase/supabase";
import { env } from "@/config/env";
import { getSlackReceiver } from "@/slack-bot/init-bot";
import { logger } from "@/lib/logger";
import { sendR } from "@/lib/http";
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth";

type SlackUserRow = {
  id: string;
  slack_user_id: string;
  slack_team_id: string | null;
  slack_username: string | null;
  first_name: string | null;
  user_id: string | null;
  is_linked: boolean | null;
  created_at: string | null;
};

/**
 * Slack Events API Endpoint
 *
 * Receives events from Slack (messages, app_mentions, etc.)
 * Request URL: https://your-domain/api/slack/events
 */
export const handleEvents = async (req: Request, res: Response) => {
  try {
    if (req.body?.type === "url_verification") {
      logger.info("Slack events: URL verification challenge received");
      return res.status(STATUS_RESPONSE.SUCCESS).json({
        challenge: req.body.challenge,
      });
    }

    const receiver = getSlackReceiver();
    if (!receiver) {
      logger.error("Slack events: Bot not initialized");
      return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
        error: "Slack bot not initialized",
      });
    }

    return receiver.app(req, res);
  } catch (error) {
    logger.error("Slack events: Error processing event", { error });
    return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
      error: "Failed to process event",
    });
  }
};

/**
 * Slack Slash Commands Endpoint
 *
 * Receives slash commands from Slack (/ally, /today, etc.)
 * Request URL: https://your-domain/api/slack/commands
 */
export const handleCommands = async (req: Request, res: Response) => {
  try {
    const receiver = getSlackReceiver();
    if (!receiver) {
      logger.error("Slack commands: Bot not initialized");
      return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
        error: "Slack bot not initialized",
      });
    }

    return receiver.app(req, res);
  } catch (error) {
    logger.error("Slack commands: Error processing command", { error });
    return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
      error: "Failed to process command",
    });
  }
};

/**
 * Slack Interactive Components Endpoint
 *
 * Receives interactive component payloads (buttons, modals, etc.)
 * Request URL: https://your-domain/api/slack/interactions
 */
export const handleInteractions = async (req: Request, res: Response) => {
  try {
    const receiver = getSlackReceiver();
    if (!receiver) {
      logger.error("Slack interactions: Bot not initialized");
      return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
        error: "Slack bot not initialized",
      });
    }

    return receiver.app(req, res);
  } catch (error) {
    logger.error("Slack interactions: Error processing interaction", { error });
    return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
      error: "Failed to process interaction",
    });
  }
};

export const handleOAuthInstall = (_req: Request, res: Response) => {
  const installUrl = generateInstallUrl();
  res.redirect(installUrl);
};

export const handleOAuthCallback = async (req: Request, res: Response) => {
  const { code, error: slackError } = req.query;

  if (slackError) {
    logger.error(`Slack OAuth: Error from Slack: ${slackError}`);
    return res.redirect(
      `${env.urls.frontend}/integrations/slack?error=${encodeURIComponent(String(slackError))}`
    );
  }

  if (!code || typeof code !== "string") {
    logger.error("Slack OAuth: No code provided");
    return res.redirect(
      `${env.urls.frontend}/integrations/slack?error=no_code`
    );
  }

  const result = await exchangeCodeForToken(code);

  if (!(result.success && result.workspace)) {
    logger.error(`Slack OAuth: Token exchange failed: ${result.error}`);
    return res.redirect(
      `${env.urls.frontend}/integrations/slack?error=${encodeURIComponent(result.error || "exchange_failed")}`
    );
  }

  logger.info(
    `Slack OAuth: Successfully installed to ${result.workspace.team_name}`
  );
  return res.redirect(
    `${env.urls.frontend}/integrations/slack?success=true&team=${encodeURIComponent(result.workspace.team_name || "")}`
  );
};

export const handleOAuthUninstall = async (req: Request, res: Response) => {
  const { team_id: teamId } = req.body;

  if (!teamId) {
    return res.status(STATUS_RESPONSE.BAD_REQUEST).json({
      error: "Missing team_id",
    });
  }

  const success = await deactivateWorkspace(teamId);

  if (!success) {
    return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
      error: "Failed to deactivate workspace",
    });
  }

  return res.status(STATUS_RESPONSE.SUCCESS).json({ ok: true });
};

export const handleStatus = [
  supabaseAuth(),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user?.email) {
        return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
      }

      const { data: dbUser } = await SUPABASE.from("users")
        .select("id")
        .eq("email", user.email)
        .single();

      if (!dbUser) {
        return sendR(res, STATUS_RESPONSE.SUCCESS, "Slack integration status", {
          isConnected: false,
          slackUserId: null,
          slackTeamId: null,
          slackUsername: null,
          connectedAt: null,
          installUrl: generateInstallUrl(),
        });
      }

      const { data: slackUser } = await (SUPABASE as any).from("slack_users")
        .select(
          "slack_user_id, slack_team_id, slack_username, created_at, is_linked"
        )
        .eq("user_id", dbUser.id)
        .eq("is_linked", true)
        .maybeSingle();

      const typedSlackUser = slackUser as SlackUserRow | null;
      return sendR(res, STATUS_RESPONSE.SUCCESS, "Slack integration status", {
        isConnected: !!typedSlackUser?.is_linked,
        slackUserId: typedSlackUser?.slack_user_id || null,
        slackTeamId: typedSlackUser?.slack_team_id || null,
        slackUsername: typedSlackUser?.slack_username || null,
        connectedAt: typedSlackUser?.created_at || null,
        installUrl: generateInstallUrl(),
      });
    } catch (error) {
      logger.error(`Slack status: Error checking status: ${error}`);
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to check Slack status"
      );
    }
  },
];

export const handleHealth = (_req: Request, res: Response) => {
  const receiver = getSlackReceiver();
  const isEnabled = env.integrations.slack.isEnabled;

  res.status(STATUS_RESPONSE.SUCCESS).json({
    status: receiver && isEnabled ? "healthy" : "disabled",
    mode: "http",
  });
};