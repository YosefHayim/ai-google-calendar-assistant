import { SUPABASE } from "@/infrastructure/supabase/supabase"
import { WebClient } from "@slack/web-api"
import { env } from "@/config/env"
import { logger } from "@/lib/logger"

const SLACK_SCOPES = [
  "app_mentions:read",
  "channels:history",
  "channels:read",
  "chat:write",
  "commands",
  "im:history",
  "im:read",
  "im:write",
  "incoming-webhook",
  "reactions:read",
  "reactions:write",
  "users:read",
  "users:read.email",
].join(",")

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const slackWorkspacesTable = () => (SUPABASE as any).from("slack_workspaces")

type SlackWorkspaceRow = {
  id: string
  team_id: string
  team_name: string | null
  bot_token: string
  bot_user_id: string | null
  app_id: string | null
  scope: string | null
  is_active: boolean | null
}

type SlackWorkspaceInsert = {
  team_id: string
  team_name?: string | null
  bot_token: string
  bot_user_id?: string | null
  app_id?: string | null
  scope?: string | null
  authed_user_id?: string | null
  enterprise_id?: string | null
  enterprise_name?: string | null
  is_enterprise_install?: boolean
  installed_by_user_id?: string | null
  webhook_url?: string | null
  webhook_channel?: string | null
  webhook_channel_id?: string | null
  webhook_configuration_url?: string | null
}

interface SlackWorkspaceUpdate extends Partial<SlackWorkspaceInsert> {
  is_active?: boolean
  installed_at?: string
}

export type SlackWorkspace = {
  id: string
  team_id: string
  team_name: string | null
  bot_token: string
  bot_user_id: string | null
  app_id: string | null
  scope: string | null
  is_active: boolean | null
}

export type OAuthExchangeResult = {
  success: boolean
  workspace?: SlackWorkspace
  error?: string
}

export const generateInstallUrl = (state?: string): string => {
  const params = new URLSearchParams({
    client_id: env.integrations.slack.clientId || "",
    scope: SLACK_SCOPES,
    redirect_uri: `${env.urls.api}/api/slack/oauth/callback`,
  })

  if (state) {
    params.set("state", state)
  }

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`
}

export const exchangeCodeForToken = async (
  code: string
): Promise<OAuthExchangeResult> => {
  try {
    const client = new WebClient()

    const result = await client.oauth.v2.access({
      client_id: env.integrations.slack.clientId || "",
      client_secret: env.integrations.slack.clientSecret || "",
      code,
      redirect_uri: `${env.urls.api}/api/slack/oauth/callback`,
    })

    if (!(result.ok && result.access_token)) {
      return {
        success: false,
        error: result.error || "Failed to exchange code for token",
      }
    }

    const workspace = await saveWorkspaceToken({
      team_id: result.team?.id || "",
      team_name: result.team?.name || null,
      bot_token: result.access_token,
      bot_user_id: result.bot_user_id || null,
      app_id: result.app_id || null,
      scope: result.scope || null,
      authed_user_id: result.authed_user?.id || null,
      enterprise_id: result.enterprise?.id || null,
      enterprise_name: result.enterprise?.name || null,
      is_enterprise_install: result.is_enterprise_install,
      installed_by_user_id: result.authed_user?.id || null,
      webhook_url: result.incoming_webhook?.url || null,
      webhook_channel: result.incoming_webhook?.channel || null,
      webhook_channel_id: result.incoming_webhook?.channel_id || null,
      webhook_configuration_url:
        result.incoming_webhook?.configuration_url || null,
    })

    if (!workspace) {
      return { success: false, error: "Failed to save workspace token" }
    }

    return { success: true, workspace }
  } catch (error) {
    logger.error(`Slack OAuth: Failed to exchange code: ${error}`)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

const saveWorkspaceToken = async (
  data: SlackWorkspaceInsert
): Promise<SlackWorkspace | null> => {
  try {
    const { data: existing } = await slackWorkspacesTable()
      .select("id")
      .eq("team_id", data.team_id)
      .maybeSingle()

    if (existing) {
      const updateData: SlackWorkspaceUpdate = {
        ...data,
        is_active: true,
        installed_at: new Date().toISOString(),
      }

      const { data: updated, error } = await slackWorkspacesTable()
        .update(updateData)
        .eq("team_id", data.team_id)
        .select()
        .single()

      if (error) {
        logger.error(
          `Slack OAuth: Failed to update workspace: ${error.message}`
        )
        return null
      }

      logger.info(
        `Slack OAuth: Updated workspace ${data.team_name} (${data.team_id})`
      )
      return toSlackWorkspace(updated as SlackWorkspaceRow)
    }

    const { data: inserted, error } = await slackWorkspacesTable()
      .insert(data)
      .select()
      .single()

    if (error) {
      logger.error(`Slack OAuth: Failed to insert workspace: ${error.message}`)
      return null
    }

    logger.info(
      `Slack OAuth: Installed to workspace ${data.team_name} (${data.team_id})`
    )
    return toSlackWorkspace(inserted as SlackWorkspaceRow)
  } catch (error) {
    logger.error(`Slack OAuth: Save workspace error: ${error}`)
    return null
  }
}

const toSlackWorkspace = (row: SlackWorkspaceRow): SlackWorkspace => ({
  id: row.id,
  team_id: row.team_id,
  team_name: row.team_name,
  bot_token: row.bot_token,
  bot_user_id: row.bot_user_id,
  app_id: row.app_id,
  scope: row.scope,
  is_active: row.is_active,
})

export const getWorkspaceToken = async (
  teamId: string
): Promise<string | null> => {
  try {
    const { data, error } = await slackWorkspacesTable()
      .select("bot_token")
      .eq("team_id", teamId)
      .eq("is_active", true)
      .single()

    if (error || !data) {
      return null
    }

    return (data as { bot_token: string }).bot_token
  } catch {
    return null
  }
}

export const deactivateWorkspace = async (teamId: string): Promise<boolean> => {
  try {
    const { error } = await slackWorkspacesTable()
      .update({ is_active: false })
      .eq("team_id", teamId)

    if (error) {
      logger.error(
        `Slack OAuth: Failed to deactivate workspace: ${error.message}`
      )
      return false
    }

    logger.info(`Slack OAuth: Deactivated workspace ${teamId}`)
    return true
  } catch (error) {
    logger.error(`Slack OAuth: Deactivate error: ${error}`)
    return false
  }
}

export const getAllActiveWorkspaces = async (): Promise<SlackWorkspace[]> => {
  try {
    const { data, error } = await slackWorkspacesTable()
      .select("*")
      .eq("is_active", true)

    if (error) {
      logger.error(`Slack OAuth: Failed to get workspaces: ${error.message}`)
      return []
    }

    return ((data || []) as SlackWorkspaceRow[]).map(toSlackWorkspace)
  } catch (error) {
    logger.error(`Slack OAuth: Get workspaces error: ${error}`)
    return []
  }
}
