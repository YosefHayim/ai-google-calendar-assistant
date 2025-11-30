#!/bin/bash

# Comprehensive file renaming script from kebab-case to camelCase
# This script renames files and updates all imports

echo "Starting file renaming process..."

# Utils directory
echo "Renaming utils files..."
[ -f "utils/error-template.ts" ] && git mv "utils/error-template.ts" "utils/errorTemplate.ts"
[ -f "utils/format-date.ts" ] && git mv "utils/format-date.ts" "utils/formatDate.ts"
[ -f "utils/async-handlers.ts" ] && git mv "utils/async-handlers.ts" "utils/asyncHandlers.ts"
[ -f "utils/activate-agent.ts" ] && git mv "utils/activate-agent.ts" "utils/activateAgent.ts"
[ -f "utils/get-user-calendar-tokens.ts" ] && git mv "utils/get-user-calendar-tokens.ts" "utils/getUserCalendarTokens.ts"
[ -f "utils/get-event-duration-string.ts" ] && git mv "utils/get-event-duration-string.ts" "utils/getEventDurationString.ts"
[ -f "utils/get-tokens-user-ai.ts" ] && git mv "utils/get-tokens-user-ai.ts" "utils/getTokensUserAI.ts"
[ -f "utils/init-calendar-with-user-tokens-and-update-tokens.ts" ] && git mv "utils/init-calendar-with-user-tokens-and-update-tokens.ts" "utils/initCalendarWithUserTokens.ts"
[ -f "utils/update-calendar-categories.ts" ] && git mv "utils/update-calendar-categories.ts" "utils/updateCalendarCategories.ts"
[ -f "utils/update-tokens-of-user.ts" ] && git mv "utils/update-tokens-of-user.ts" "utils/updateUserTokens.ts"
[ -f "utils/handle-events.ts" ] && git mv "utils/handle-events.ts" "utils/handleEvents.ts"
[ -f "utils/third-party-signup-signin-supabase.ts" ] && git mv "utils/third-party-signup-signin-supabase.ts" "utils/thirdPartyAuth.ts"

# Utils/events directory
echo "Renaming utils/events files..."
[ -f "utils/events/extract-email.ts" ] && git mv "utils/events/extract-email.ts" "utils/events/extractEmail.ts"
[ -f "utils/events/normalize-list-params.ts" ] && git mv "utils/events/normalize-list-params.ts" "utils/events/normalizeListParams.ts"
[ -f "utils/events/transform-event.ts" ] && git mv "utils/events/transform-event.ts" "utils/events/transformEvent.ts"
[ -f "utils/events/validate-event-id.ts" ] && git mv "utils/events/validate-event-id.ts" "utils/events/validateEventId.ts"
[ -f "utils/events/extract-calendar-id.ts" ] && git mv "utils/events/extract-calendar-id.ts" "utils/events/extractCalendarId.ts"

# Utils/events/handlers directory
echo "Renaming utils/events/handlers files..."
[ -f "utils/events/handlers/get-events.ts" ] && git mv "utils/events/handlers/get-events.ts" "utils/events/handlers/getEvents.ts"
[ -f "utils/events/handlers/insert-event.ts" ] && git mv "utils/events/handlers/insert-event.ts" "utils/events/handlers/insertEvent.ts"
[ -f "utils/events/handlers/update-event.ts" ] && git mv "utils/events/handlers/update-event.ts" "utils/events/handlers/updateEvent.ts"
[ -f "utils/events/handlers/delete-event.ts" ] && git mv "utils/events/handlers/delete-event.ts" "utils/events/handlers/deleteEvent.ts"

# Utils/auth directory
echo "Renaming utils/auth files..."
[ -f "utils/auth/validate-auth-input.ts" ] && git mv "utils/auth/validate-auth-input.ts" "utils/auth/validateAuthInput.ts"
[ -f "utils/auth/generate-auth-url.ts" ] && git mv "utils/auth/generate-auth-url.ts" "utils/auth/generateAuthUrl.ts"
[ -f "utils/auth/exchange-oauth-token.ts" ] && git mv "utils/auth/exchange-oauth-token.ts" "utils/auth/exchangeOAuthToken.ts"
[ -f "utils/auth/store-user-tokens.ts" ] && git mv "utils/auth/store-user-tokens.ts" "utils/auth/storeUserTokens.ts"
[ -f "utils/auth/user-operations.ts" ] && git mv "utils/auth/user-operations.ts" "utils/auth/userOperations.ts"

# Middlewares directory
echo "Renaming middleware files..."
[ -f "middlewares/error-handler.ts" ] && git mv "middlewares/error-handler.ts" "middlewares/errorHandler.ts"
[ -f "middlewares/auth-handler.ts" ] && git mv "middlewares/auth-handler.ts" "middlewares/authHandler.ts"

# Controllers directory
echo "Renaming controller files..."
[ -f "controllers/whatsapp-controller.ts" ] && git mv "controllers/whatsapp-controller.ts" "controllers/whatsappController.ts"
[ -f "controllers/calendar-controller.ts" ] && git mv "controllers/calendar-controller.ts" "controllers/calendarController.ts"
[ -f "controllers/users-controller.ts" ] && git mv "controllers/users-controller.ts" "controllers/usersController.ts"

# Routes directory
echo "Renaming route files..."
[ -f "routes/whatsapp-route.ts" ] && git mv "routes/whatsapp-route.ts" "routes/whatsappRoutes.ts"
[ -f "routes/calendar-route.ts" ] && git mv "routes/calendar-route.ts" "routes/calendarRoutes.ts"

# AI-agents directory
echo "Renaming ai-agents files..."
[ -f "ai-agents/agents-hands-off-description.ts" ] && git mv "ai-agents/agents-hands-off-description.ts" "ai-agents/agentHandoffsDescription.ts"
[ -f "ai-agents/agents-instructions.ts" ] && git mv "ai-agents/agents-instructions.ts" "ai-agents/agentInstructions.ts"
[ -f "ai-agents/agents-tools.ts" ] && git mv "ai-agents/agents-tools.ts" "ai-agents/agentTools.ts"
[ -f "ai-agents/description-tools.ts" ] && git mv "ai-agents/description-tools.ts" "ai-agents/toolsDescription.ts"
[ -f "ai-agents/parameters-tools.ts" ] && git mv "ai-agents/parameters-tools.ts" "ai-agents/toolsParameters.ts"
[ -f "ai-agents/execution-tools.ts" ] && git mv "ai-agents/execution-tools.ts" "ai-agents/toolsExecution.ts"
[ -f "ai-agents/agent-utils.ts" ] && git mv "ai-agents/agent-utils.ts" "ai-agents/agentUtils.ts"

echo "File renaming complete!"
echo "Next: Update all imports with the update-imports script"
