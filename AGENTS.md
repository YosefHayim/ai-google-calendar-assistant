# AI Google Calendar Assistant

**Generated:** 2026-01-08 | **Branch:** main

## Overview

AI-powered Google Calendar Assistant with **multi-modal architecture**. Supports three interaction modalities:

- **Chat** (web) - OpenAI Agents SDK via streaming
- **Voice** (real-time) - LiveKit Agents SDK + OpenAI Realtime API
- **Telegram** - OpenAI Agents SDK via Grammy bot

Monorepo: Express+Bun backend (`be/`), Next.js 15+React 19 frontend (`fe/`). All modalities share the same tool handlers and cross-modal context via Redis.

## Structure

```
.
├── be/                     # Express + Bun backend (port 3000)
│   ├── ai-agents/          # OpenAI Agent framework
│   ├── telegram-bot/       # Grammy bot
│   ├── voice-sidecar/      # LiveKit Voice Agent (separate process)
│   ├── shared/             # Cross-modal shared layer
│   │   ├── types/          # Core interfaces (HandlerContext, AgentContext)
│   │   ├── tools/          # Framework-agnostic tool definitions
│   │   │   ├── handlers/   # Pure business logic (email → calendar ops)
│   │   │   ├── schemas/    # Zod schemas for tool parameters
│   │   │   └── tool-executor.ts  # Provider-agnostic tool execution
│   │   ├── adapters/       # SDK-specific wrappers
│   │   │   ├── openai-adapter.ts   # Wraps for @openai/agents
│   │   │   └── livekit-adapter.ts  # Wraps for @livekit/agents
│   │   ├── context/        # Cross-modal context store (Redis)
│   │   ├── orchestrator/   # Agent profile management
│   │   ├── prompts/        # Shared prompt templates
│   │   └── llm/            # Multi-provider LLM abstraction
│   ├── controllers/        # Route handlers (one per resource)
│   ├── middlewares/        # Auth, validation, rate limiting
│   ├── routes/             # API endpoint definitions
│   ├── utils/              # Calendar, auth, AI, HTTP utilities
│   ├── config/             # Env, constants, external clients
│   └── services/           # Business logic services
├── fe/                     # Next.js 15 frontend (port 4000)
│   ├── app/                # App Router pages
│   ├── components/         # React components (shadcn/ui)
│   ├── hooks/              # React hooks + TanStack Query
│   └── contexts/           # Auth, Chat, Dashboard state
└── AGENTS.md               # This file
```

---

## Backend Architecture (be/)

### Shared Layer (`be/shared/`)

The shared layer provides cross-modal functionality used by chat, voice, and telegram modalities.

#### Types (`shared/types/index.ts`)

| Type | Purpose |
|------|---------|
| `HandlerContext` | Context for tool handlers: `{ email: string }` |
| `AgentContext` | Context for OpenAI Agents SDK tools |
| `ProjectionMode` | Event data projection: `VOICE_LITE`, `CHAT_STANDARD`, `FULL` |
| `Modality` | Interaction channel: `chat`, `voice`, `telegram`, `api` |
| `ConflictingEvent` | Calendar event that conflicts with proposed time |
| `ConflictCheckResult` | Result of conflict checking operations |

| Function | Purpose |
|----------|---------|
| `stringifyError(error)` | Converts any error to user-friendly string |
| `categorizeError(error)` | Categorizes errors as `auth`, `database`, or `other` |

#### Tool Handlers (`shared/tools/handlers/`)

Pure business logic functions. Framework-agnostic, testable, reusable across modalities.

**Event Handlers** (`event-handlers.ts`):
| Function | Purpose |
|----------|---------|
| `getEventHandler(params, ctx)` | Retrieve events by time range, keywords, calendar |
| `insertEventHandler(params, ctx)` | Create new calendar event |
| `updateEventHandler(params, ctx)` | Update existing event fields |
| `deleteEventHandler(params, ctx)` | Delete event by ID |

**Direct Handlers** (`direct-handlers.ts`):
| Function | Purpose |
|----------|---------|
| `validateUserHandler(ctx)` | Check if user exists in database |
| `getTimezoneHandler(ctx)` | Get user's timezone (DB or Google Calendar) |
| `selectCalendarHandler(params, ctx)` | AI-powered calendar selection for event |
| `checkConflictsHandler(params, ctx)` | Check for conflicting events in time range |
| `preCreateValidationHandler(params, ctx)` | Combined validation: user + timezone + calendar + conflicts |
| `getCalendarCategoriesByEmail(email)` | Get user's synced calendars |

**Gap Handlers** (`gap-handlers.ts`):
| Function | Purpose |
|----------|---------|
| `analyzeGapsHandler(params, ctx)` | Find untracked time gaps in calendar |
| `fillGapHandler(params, ctx)` | Create event to fill a gap |
| `formatGapsHandler(params)` | Format gaps for display |

#### Tool Executor (`shared/tools/tool-executor.ts`)

Provider-agnostic tool execution for non-OpenAI providers (Gemini, Claude).

| Function | Purpose |
|----------|---------|
| `executeTool(toolCall, ctx)` | Execute single tool, return result |
| `executeTools(toolCalls, ctx)` | Execute multiple tools in parallel |
| `getAvailableToolNames()` | List all registered tool names |
| `isToolAvailable(name)` | Check if tool is registered |

#### Adapters (`shared/adapters/`)

SDK-specific wrappers that adapt handlers for specific frameworks.

**OpenAI Adapter** (`openai-adapter.ts`):
| Export | Purpose |
|--------|---------|
| `EVENT_TOOLS` | get_event, insert_event, update_event, delete_event |
| `VALIDATION_TOOLS` | validate_user, get_timezone, select_calendar, check_conflicts, pre_create_validation |
| `GAP_TOOLS` | analyze_gaps, fill_gap, format_gaps_display |
| `SHARED_TOOLS` | All tools combined |
| `getEmailFromContext(runContext, toolName)` | Extract email from RunContext |

**LiveKit Adapter** (`livekit-adapter.ts`):
| Export | Purpose |
|--------|---------|
| `LIVEKIT_TOOL_DEFINITIONS` | Tool definitions for LiveKit Agents SDK |
| `getLiveKitToolByName(name)` | Get specific tool definition |
| `getAllLiveKitTools()` | Get all LiveKit tool definitions |

#### Context Store (`shared/context/`)

Redis-backed cross-modal state persistence.

**Unified Context Store** (`unified-context-store.ts`):
| Method | Purpose |
|--------|---------|
| `setLastEvent(userId, event, modality)` | Store last referenced event |
| `getLastEvent(userId)` | Retrieve last event for pronoun resolution |
| `setLastCalendar(userId, calendar, modality)` | Store last referenced calendar |
| `getLastCalendar(userId)` | Retrieve last calendar |
| `setConversation(userId, context)` | Store conversation state |
| `getConversation(userId)` | Retrieve conversation context |
| `setModality(userId, modality)` | Track current interaction channel |
| `getSnapshot(userId)` | Get full context snapshot |
| `touch(userId)` | Refresh all TTLs |

**Entity Tracker** (`entity-tracker.ts`):
| Method | Purpose |
|--------|---------|
| `trackEvent(userId, event)` | Track event for "it", "that meeting" resolution |
| `trackCalendar(userId, calendar)` | Track calendar for "there" resolution |
| `resolveEventReference(userId, ref)` | Resolve pronoun to actual event |

#### Orchestrator (`shared/orchestrator/`)

Agent profile management and factory functions.

**Agent Profiles** (`agent-profiles.ts`):
| Export | Purpose |
|--------|---------|
| `AGENT_PROFILES` | Map of profile ID to configuration |
| `getAgentProfile(id)` | Get profile by ID |
| `getProfilesForTier(tier)` | Get profiles for subscription tier |
| `getRealtimeProfiles()` | Get voice-capable profiles |

**Model Registry** (`model-registry.ts`):
| Export | Purpose |
|--------|---------|
| `getModelSpec(provider, tier)` | Get model specification |
| `getRealtimeModelId(provider)` | Get realtime model ID |
| `isRealtimeSupported(provider)` | Check if provider supports realtime |

**Orchestrator Factory** (`orchestrator-factory.ts`):
| Function | Purpose |
|----------|---------|
| `createVoiceAgent(options)` | Create voice agent with profile |
| `formatProfileForClient(profile)` | Format profile for API response |

**Text Agent Factory** (`text-agent-factory.ts`):
| Function | Purpose |
|----------|---------|
| `createTextAgent(options)` | Create text agent with profile |
| `runTextAgent(options)` | Run text agent and stream response |
| `supportsTools(provider)` | Check if provider supports tools |

#### LLM Abstraction (`shared/llm/`)

Multi-provider LLM interface.

| Function | Purpose |
|----------|---------|
| `createProviderFromProfile(profile)` | Create LLM provider from agent profile |
| `createOpenAIProvider(config)` | Create OpenAI provider |
| `createGoogleProvider(config)` | Create Google Gemini provider |
| `createAnthropicProvider(config)` | Create Anthropic Claude provider |

#### Prompts (`shared/prompts/`)

Shared prompt templates and builders.

| Export | Purpose |
|--------|---------|
| `CORE_IDENTITY` | Agent identity prompt segment |
| `CORE_CAPABILITIES` | Capability description segment |
| `CORE_BEHAVIOR` | Behavioral guidelines segment |
| `AUTH_CONTEXT` | Authentication context segment |
| `INTENT_RECOGNITION` | Intent parsing guidelines |
| `TIME_INFERENCE` | Time/date parsing guidelines |
| `ERROR_HANDLING` | Error response guidelines |
| `RESPONSE_STYLE` | Response formatting guidelines |
| `buildBasePrompt()` | Build complete base prompt |
| `buildOrchestratorPrompt()` | Build orchestrator-specific prompt |

---

### AI Agents (`be/ai-agents/`)

OpenAI Agents SDK implementation.

#### Tool Registry (`tool-registry.ts`)

| Export | Purpose |
|--------|---------|
| `AGENT_TOOLS` | Tools that use AI agents for complex operations |
| `DIRECT_TOOLS` | Tools that bypass agents for faster execution |

**AGENT_TOOLS**: `generate_google_auth_url`, `register_user_via_db`, `get_event`, `update_event`, `delete_event`

**DIRECT_TOOLS**: `validate_user_direct`, `get_timezone_direct`, `select_calendar_direct`, `check_conflicts_direct`, `pre_create_validation`, `insert_event_direct`, `get_event_direct`, `summarize_events`, `analyze_gaps_direct`, `fill_gap_direct`, `format_gaps_display`, `check_conflicts_all_calendars`, `set_event_reminders`, `get_calendar_default_reminders`, `update_calendar_default_reminders`, `get_user_reminder_preferences`, `update_user_reminder_preferences`

#### Direct Utilities (`direct-utilities.ts`)

Wrapper functions that call shared handlers with email-based context.

| Function | Purpose |
|----------|---------|
| `validateUserDirect(email)` | Validate user exists |
| `getUserDefaultTimezoneDirect(email)` | Get user timezone |
| `selectCalendarByRules(email, eventInfo)` | AI calendar selection |
| `checkConflictsDirect(params)` | Check event conflicts |
| `preCreateValidation(email, eventData)` | Combined pre-creation checks |
| `validateEventDataDirect(eventData)` | Validate event data format |
| `summarizeEvents(events)` | AI-powered event summarization |

#### Agents (`agents.ts`)

Agent definitions using OpenAI Agents SDK.

| Export | Purpose |
|--------|---------|
| `AGENTS` | Map of specialized agents |
| `HANDOFF_AGENTS` | Agents for handoff operations |
| `ORCHESTRATOR_AGENT` | Main orchestrating agent |

#### Sessions (`sessions/`)

Session management for agent conversations.

| Export | Purpose |
|--------|---------|
| `SupabaseAgentSession` | Session backed by Supabase |
| `createAgentSession(options)` | Create new session |
| `getSessionInfo(sessionId)` | Get session metadata |

---

### Utilities (`be/utils/`)

#### Calendar (`utils/calendar/`)

| Function | Purpose |
|----------|---------|
| `initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenProps)` | Initialize calendar client with auto-refresh |
| `refreshAccessToken(credentials)` | Refresh Google access token |
| `createCalendarClient(auth)` | Create Google Calendar client |
| `checkEventConflicts(params)` | Check conflicts in single calendar |
| `checkEventConflictsAllCalendars(params)` | Check conflicts across all calendars |
| `getEventDurationString(event)` | Format event duration |
| `eventsHandler(req, action, eventData, extra)` | CRUD operations dispatcher |
| `analyzeGaps(email, options)` | Find calendar gaps |
| `analyzeGapsForUser(params)` | User-specific gap analysis |
| `fillGap(params)` | Create event in gap |
| `formatGapsForDisplay(gaps)` | Format gaps for UI |
| `getUserReminderPreferences(userId)` | Get reminder settings |
| `saveUserReminderPreferences(userId, prefs)` | Save reminder settings |
| `getCalendarDefaultReminders(email, calendarId)` | Get calendar default reminders |
| `updateCalendarDefaultReminders(email, calendarId, reminders)` | Update calendar reminders |
| `updateEventReminders(email, calendarId, eventId, reminders)` | Update event reminders |
| `resolveRemindersForEvent(prefs, calendarDefaults)` | Resolve which reminders to apply |
| `getUserIdByEmail(email)` | Get user ID from email |

#### Auth (`utils/auth/`)

| Function | Purpose |
|----------|---------|
| `generateGoogleAuthUrl(email)` | Generate OAuth URL |
| `checkTokenExpiry(tokens)` | Check if tokens need refresh |
| `fetchGoogleTokensByEmail(email)` | Get stored Google tokens |
| `refreshGoogleAccessToken(refreshToken)` | Refresh access token |
| `persistGoogleTokens(email, tokens)` | Store tokens in database |
| `deactivateGoogleTokens(email)` | Revoke tokens |
| `validateSupabaseToken(token)` | Validate Supabase JWT |
| `refreshSupabaseSession(refreshToken)` | Refresh Supabase session |
| `setSupabaseSession(accessToken, refreshToken)` | Set Supabase session |
| `fetchCredentialsByEmail(email)` | Get full credentials object |
| `supabaseThirdPartySignInOrSignUp(provider, token)` | Third-party auth |
| `updateUserSupabaseTokens(email, tokens)` | Update stored tokens |

#### HTTP (`utils/http/`)

| Function | Purpose |
|----------|---------|
| `asyncHandler(fn)` | Wrap async route handler |
| `reqResAsyncHandler(fn)` | Wrap async with req/res |
| `createHttpError(status, message)` | Create HTTP error |
| `sendErrorResponse(res, error)` | Send error response |
| `throwHttpError(status, message)` | Throw HTTP error |
| `sendR(res, status, message, data)` | Standard response helper |

---

### Controllers (`be/controllers/`)

| Controller | Purpose |
|------------|---------|
| `chat-controller.ts` | Non-streaming chat endpoint |
| `chat-stream-controller.ts` | Streaming chat with SSE |
| `agent-profiles-controller.ts` | Agent profile CRUD |
| `voice-controller.ts` | LiveKit token generation |
| `payment-controller.ts` | Lemon Squeezy subscription handling |
| `user-preferences-controller.ts` | User settings CRUD |
| `contact-controller.ts` | Contact form submission |
| `whatsapp-controller.ts` | WhatsApp integration |
| `google-calendar/` | Calendar-specific endpoints |
| `users/` | User management endpoints |

---

### Middlewares (`be/middlewares/`)

| Middleware | Purpose |
|------------|---------|
| `auth-handler.ts` | JWT authentication |
| `supabase-auth.ts` | Supabase session validation |
| `google-token-validation.ts` | Validate Google tokens |
| `google-token-refresh.ts` | Auto-refresh expired tokens |
| `calendar-client.ts` | Attach calendar client to request |
| `validation.ts` | Request body/params validation |
| `rate-limiter.ts` | Rate limiting |
| `error-handler.ts` | Global error handling |
| `security-audit.ts` | Security logging |

---

### Configuration (`be/config/`)

#### Environment (`env.ts`)

| Export | Purpose |
|--------|---------|
| `env` | Validated environment variables |
| `REDIRECT_URI` | OAuth callback URL |

#### Clients (`clients/`)

| Export | Purpose |
|--------|---------|
| `SUPABASE` | Supabase client instance |
| `OAUTH2CLIENT` | Google OAuth2 client |
| `CALENDAR` | Google Calendar API instance |
| `initializeOpenAI()` | Initialize OpenAI client |
| `redisClient` | Redis client instance |
| `isRedisConnected()` | Check Redis connection |
| `disconnectRedis()` | Close Redis connection |
| `initializeLemonSqueezy()` | Initialize Lemon Squeezy client |
| `isLemonSqueezyEnabled()` | Check if Lemon Squeezy is configured |
| `LEMONSQUEEZY_CONFIG` | Lemon Squeezy configuration |

#### Constants (`constants/`)

| Export | Purpose |
|--------|---------|
| `GOOGLE_CALENDAR_SCOPES` | Required OAuth scopes |
| `MODELS` | AI model identifiers |
| `CURRENT_MODEL` | Default model |
| `TIMEZONE` | Default timezone |
| `STATUS_RESPONSE` | HTTP status codes |
| `ROUTES` | API route paths |
| `ACTION` | Calendar action types |

---

## Where to Look

| Task | Location | Notes |
|------|----------|-------|
| Add API endpoint | `be/routes/` + `be/controllers/` | One controller per resource |
| Add AI tool | `be/ai-agents/tool-registry.ts` | Register in AGENT_TOOLS or DIRECT_TOOLS |
| Add tool handler | `be/shared/tools/handlers/` | Pure function, add to index.ts |
| Add agent | `be/ai-agents/agents.ts` | Choose FAST/MEDIUM/CURRENT model tier |
| Add middleware | `be/middlewares/` | Apply in route file |
| Frontend component | `fe/components/` | Use shadcn/ui primitives |
| Data fetching | `fe/hooks/queries/` | TanStack Query wrapper |
| Telegram command | `be/telegram-bot/utils/commands.ts` | Grammy middleware chain |

---

## Conventions

### Backend (Express + Bun)

- **No semicolons**, double quotes, 80 char line width (Biome + ultracite)
- **Path alias**: `@/*` → `be/*` (use for all imports)
- **Module system**: CommonJS (`"type": "commonjs"`)
- **Error handling**: Wrap routes with `reqResAsyncHandler`, respond via `sendR(res, status, message, data)`
- **Response format**: `{ status: "success"|"error", message, data }`

### Frontend (Next.js 15)

- **No semicolons**, single quotes, 120 char print width (Prettier)
- **Path alias**: `@/*` → `fe/*`
- **Components**: Functional + TypeScript, named exports, `'use client'` for client components
- **State**: React Context (global) + TanStack Query (server) + useState (local)

### Shared

- **Files**: kebab-case (`events-controller.ts`, `date-range-picker.tsx`)
- **Types**: `import type { X }` for type-only imports
- **Tests**: `be/tests/` mirroring source structure, Jest with `@jest/globals`

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| `as any`, `@ts-ignore`, `@ts-expect-error` | Never suppress type errors |
| Relative imports in backend | Use `@/` alias always |
| `export default` for components | Use named exports |
| Empty catch blocks | Handle or rethrow errors |
| Hardcoded config values | Use `@/config` constants |

---

## Commands

```bash
# Backend (be/)
bun --watch app.ts          # Dev server
bun run jest                # Tests
npx ultracite check         # Lint check
npx biome fix --write .     # Format

# Frontend (fe/)
npm run dev                 # Dev server (port 4000)
npm run build               # Production build
npm run lint                # ESLint
npm run format              # Prettier
```

---

## AI Agent Model Tiers

| Tier | Model | Use Case |
|------|-------|----------|
| `FAST_MODEL` | GPT-4-1-NANO | Simple tool-calling (cheap, fast) |
| `MEDIUM_MODEL` | GPT-4-1-MINI | Multi-tool orchestration |
| `CURRENT_MODEL` | GPT-5-MINI | Complex reasoning, NLP parsing |

---

## External Services

| Service | Purpose | Config Location |
|---------|---------|-----------------|
| Supabase | PostgreSQL + Auth + RLS | `be/config/clients/` |
| Google Calendar API | Events, calendars, OAuth | `be/utils/calendar/` |
| OpenAI | Agent orchestration | `be/ai-agents/` |
| LiveKit | Real-time voice rooms | `be/voice-sidecar/` |
| Lemon Squeezy | Payments (subscription) | `be/services/lemonsqueezy-service.ts` |
| Redis | Cross-modal context store | `be/shared/context/` |

---

## Agent Profiles

| Profile ID | Display Name | Tier | Realtime | Provider |
|------------|--------------|------|----------|----------|
| `ally-lite` | Ally Lite | free | No | OpenAI |
| `ally-pro` | Ally Pro | pro | Yes | OpenAI |
| `ally-flash` | Ally Flash | pro | Yes | OpenAI |
| `ally-executive` | Ally Executive | enterprise | Yes | OpenAI |
| `ally-gemini` | Ally Gemini | pro | No | Google |
| `ally-claude` | Ally Claude | pro | No | Anthropic |

---

## Notes

- **Database types**: Run `npm run update:db:types` in both `be/` and `fe/` after schema changes
- **Auth flow**: Supabase JWT → Google token validation → Auto-refresh middleware
- **Telegram**: Uses Grammy v1.38, i18n for Hebrew/English, RTL text handling
- **Large files (>500 lines)**: `database.types.ts` (generated), `commands.ts`, `gap-recovery.ts`
