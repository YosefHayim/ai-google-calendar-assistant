import express from "express";
import { env, STATUS_RESPONSE, SUPABASE } from "@/config";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import { getSlackReceiver } from "@/slack-bot/init-bot";
import {
  deactivateWorkspace,
  exchangeCodeForToken,
  generateInstallUrl,
} from "@/slack-bot/services/oauth-service";
import { sendR } from "@/utils/http";
import { logger } from "@/utils/logger";

const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const slackUsersTable = () => (SUPABASE as any).from("slack_users");

interface SlackUserRow {
  id: string;
  slack_user_id: string;
  slack_team_id: string | null;
  slack_username: string | null;
  first_name: string | null;
  user_id: string | null;
  is_linked: boolean | null;
  created_at: string | null;
}

/**
 * Slack Events API Endpoint
 *
 * Receives events from Slack (messages, app_mentions, etc.)
 * Request URL: https://your-domain/api/slack/events
 */
router.post("/events", async (req, res) => {
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
});

/**
 * Slack Slash Commands Endpoint
 *
 * Receives slash commands from Slack (/ally, /today, etc.)
 * Request URL: https://your-domain/api/slack/commands
 */
router.post("/commands", async (req, res) => {
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
});

/**
 * Slack Interactive Components Endpoint
 *
 * Receives interactive component payloads (buttons, modals, etc.)
 * Request URL: https://your-domain/api/slack/interactions
 */
router.post("/interactions", async (req, res) => {
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
});

router.get("/oauth/install", (_req, res) => {
  const installUrl = generateInstallUrl();
  res.redirect(installUrl);
});

router.get("/oauth/callback", async (req, res) => {
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
});

router.post("/oauth/uninstall", async (req, res) => {
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
});

router.get("/status", supabaseAuth(), async (req, res) => {
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

    const { data: slackUser } = await SUPABASE.from("slack_users")
      .select(
        "slack_user_id, slack_team_id, slack_username, created_at, is_linked"
      )
      .eq("user_id", dbUser.id)
      .eq("is_linked", true)
      .maybeSingle();

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Slack integration status", {
      isConnected: !!slackUser?.is_linked,
      slackUserId: slackUser?.slack_user_id || null,
      slackTeamId: slackUser?.slack_team_id || null,
      slackUsername: slackUser?.slack_username || null,
      connectedAt: slackUser?.created_at || null,
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
});

router.get("/health", (_req, res) => {
  const receiver = getSlackReceiver();
  const isEnabled = env.integrations.slack.isEnabled;

  res.status(STATUS_RESPONSE.SUCCESS).json({
    status: receiver && isEnabled ? "healthy" : "disabled",
    mode: "http",
  });
});

export default router;
