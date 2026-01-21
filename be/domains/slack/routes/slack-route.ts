import {
  handleCommands,
  handleEvents,
  handleHealth,
  handleInteractions,
  handleOAuthCallback,
  handleOAuthInstall,
  handleOAuthUninstall,
  handleStatus,
} from "../controllers/slack-controller"

import express from "express"

const router = express.Router()

/**
 * POST /events - Slack Events API Endpoint
 *
 * Receives and processes various events from Slack including messages, app mentions,
 * channel joins, and other interactive events. This is the primary webhook endpoint
 * that Slack uses to push real-time events to the application.
 *
 * @param {Object} req.body - Slack event payload containing event type, user info, channel info, and event data
 * @param {string} req.body.type - Event type (e.g., "event_callback", "url_verification")
 * @param {Object} req.body.event - The actual event data (message text, user ID, channel ID, etc.)
 * @param {string} req.body.event.type - Specific event type (e.g., "message", "app_mention")
 * @param {string} req.body.event.user - Slack user ID who triggered the event
 * @param {string} req.body.event.channel - Slack channel ID where event occurred
 * @param {string} req.body.event.text - Message text content (for message events)
 *
 * @returns {Object} Response acknowledging event receipt or challenge response for URL verification
 *
 * @related This endpoint is part of the Slack integration flow, enabling the AI assistant
 * to respond to user messages and mentions in Slack workspaces. Events are processed
 * to extract user intent and route to appropriate AI conversation handlers.
 */
router.post("/events", handleEvents)

/**
 * POST /commands - Slack Slash Commands Endpoint
 *
 * Handles Slack slash commands that users trigger with "/" prefix (e.g., /ally, /today).
 * These are direct commands that invoke specific AI assistant functionality within Slack.
 *
 * @param {Object} req.body - Slack command payload
 * @param {string} req.body.command - The slash command used (e.g., "/ally")
 * @param {string} req.body.text - Additional text provided with the command
 * @param {string} req.body.user_id - Slack user ID who issued the command
 * @param {string} req.body.channel_id - Slack channel ID where command was issued
 * @param {string} req.body.team_id - Slack workspace/team ID
 * @param {string} req.body.response_url - URL to send delayed responses
 *
 * @returns {Object} Immediate response or acknowledgment (delayed responses sent via response_url)
 *
 * @related Part of the Slack integration command flow. Commands are processed to extract
 * user intent and parameters, then routed to appropriate AI conversation handlers or
 * calendar management functions based on the command type.
 */
router.post("/commands", handleCommands)

/**
 * POST /interactions - Slack Interactive Components Endpoint
 *
 * Processes user interactions with Slack's interactive components including buttons,
 * dropdowns, modals, and other UI elements that the AI assistant presents in Slack.
 *
 * @param {Object} req.body - Slack interaction payload
 * @param {string} req.body.type - Interaction type (e.g., "block_actions", "view_submission")
 * @param {Object} req.body.user - User who triggered the interaction
 * @param {string} req.body.user.id - Slack user ID
 * @param {Object} req.body.actions - Array of actions taken (for block_actions)
 * @param {string} req.body.actions[].action_id - Unique identifier for the action
 * @param {string} req.body.actions[].value - Value associated with the action
 * @param {Object} req.body.view - Modal view data (for view_submission)
 * @param {Object} req.body.view.state.values - Form values from modal inputs
 *
 * @returns {Object} Response acknowledging interaction and optionally updating UI
 *
 * @related Part of the Slack interactive conversation flow. When users click buttons
 * or submit forms in Slack messages/modals, this endpoint processes their selections
 * and continues the AI conversation or executes requested actions.
 */
router.post("/interactions", handleInteractions)

/**
 * GET /oauth/install - Slack OAuth Installation Initiation
 *
 * Initiates the Slack OAuth flow by redirecting users to Slack's authorization page.
 * This is the first step when users want to add the AI assistant to their Slack workspace.
 *
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.user_id - User ID to associate with the installation
 * @param {string} req.query.redirect_url - Optional custom redirect URL after installation
 *
 * @returns {Redirect} Redirects to Slack's OAuth authorization URL
 *
 * @related Part of the Slack OAuth installation flow. This endpoint starts the process
 * of granting permissions for the AI assistant to access the Slack workspace, enabling
 * it to read messages, post responses, and interact with users.
 */
router.get("/oauth/install", handleOAuthInstall)

/**
 * GET /oauth/callback - Slack OAuth Callback Handler
 *
 * Handles the callback from Slack after user authorization. Exchanges the authorization
 * code for access tokens and completes the OAuth installation process.
 *
 * @param {Object} req.query - OAuth callback parameters
 * @param {string} req.query.code - Authorization code from Slack
 * @param {string} req.query.state - State parameter for CSRF protection
 * @param {string} req.query.error - Error code if authorization failed
 *
 * @returns {Redirect} Redirects to success/failure page or frontend application
 *
 * @related Completes the Slack OAuth installation flow. Upon successful authorization,
 * the AI assistant gains access to the workspace and can begin processing messages,
 * mentions, and other Slack events for that workspace.
 */
router.get("/oauth/callback", handleOAuthCallback)

/**
 * POST /oauth/uninstall - Slack OAuth Uninstallation Handler
 *
 * Processes Slack app uninstallation events when users remove the AI assistant
 * from their workspace. Cleans up associated data and access tokens.
 *
 * @param {Object} req.body - Slack uninstallation payload
 * @param {string} req.body.team_id - Slack workspace ID being uninstalled
 * @param {Object} req.body.user - User who initiated the uninstallation
 * @param {string} req.body.user.id - Slack user ID
 *
 * @returns {Object} Acknowledgment response
 *
 * @related Part of the Slack OAuth lifecycle management. When users uninstall the app,
 * this endpoint ensures proper cleanup of workspace data, revokes access tokens, and
 * stops processing events for that workspace.
 */
router.post("/oauth/uninstall", handleOAuthUninstall)

/**
 * GET /status - Slack Integration Status Check
 *
 * Provides status information about the Slack integration, including connection health,
 * workspace connections, and any configuration issues.
 *
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.workspace_id - Optional specific workspace ID to check
 *
 * @returns {Object} Status information including connection state and workspace details
 * @property {boolean} connected - Whether Slack integration is active
 * @property {Array} workspaces - List of connected workspaces with their status
 * @property {Object} health - Health check results for various Slack services
 *
 * @related Used for monitoring and diagnostics of the Slack integration. Helps identify
 * connectivity issues, expired tokens, or configuration problems that might affect
 * the AI assistant's ability to interact with Slack workspaces.
 */
router.get("/status", ...handleStatus)

/**
 * GET /health - Slack Integration Health Check
 *
 * Performs a basic health check to verify that the Slack integration endpoints
 * are responding correctly. Used by load balancers and monitoring systems.
 *
 * @returns {Object} Simple health status response
 * @property {string} status - Health status ("ok" or "error")
 * @property {string} service - Service name ("slack-integration")
 * @property {number} timestamp - Current timestamp
 *
 * @related Part of the overall system health monitoring. This endpoint provides a
 * lightweight way to verify that the Slack integration service is running and
 * can accept requests, separate from the more detailed /status endpoint.
 */
router.get("/health", handleHealth)

export default router
