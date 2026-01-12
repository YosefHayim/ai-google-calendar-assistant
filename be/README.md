# AI Google Calendar Assistant - Backend

> Express + TypeScript backend service powering AI-driven calendar automation with multi-agent orchestration, multi-platform bot integrations, and SaaS-ready infrastructure.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-green.svg)](https://expressjs.com/)
[![Bun](https://img.shields.io/badge/Bun-Runtime-orange.svg)](https://bun.sh/)
[![OpenAI Agents](https://img.shields.io/badge/OpenAI-Agents_v0.3.7-412991.svg)](https://openai.com/)
[![Jest](https://img.shields.io/badge/Jest-30.2.0-C21325.svg)](https://jestjs.io/)

---

## Table of Contents

- [Quick Reference for AI Agents](#quick-reference-for-ai-agents)
- [Overview](#overview)
- [Architecture](#architecture)
- [Shared Layer](#shared-layer)
- [AI Agent System](#ai-agent-system)
- [API Reference](#api-reference)
- [Middleware](#middleware)
- [Project Structure](#project-structure)
- [Coding Conventions](#coding-conventions)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Commands](#commands)
- [External Services](#external-services)
- [Security](#security)

---

## Quick Reference for AI Agents

> **CRITICAL**: Read this section before making any changes.

### Path Alias

```typescript
// ALWAYS use @/ path alias for imports
import { something } from "@/utils/calendar"  // CORRECT
import { something } from "../utils/calendar" // WRONG - Never use relative imports
```

### Module System

- **CommonJS**: This project uses `"type": "commonjs"` in package.json
- All imports/exports work with CommonJS resolution

### Code Style (MANDATORY)

| Rule | Standard |
|------|----------|
| Semicolons | **NO** semicolons |
| Quotes | **Double quotes** `"` |
| Line Width | 80 characters max |
| Formatter | Biome |
| Linter | Ultracite + Biome |

### Response Format (MANDATORY)

All API responses MUST use `sendR()` helper:

```typescript
import { sendR } from "@/utils/send-response"

// Success response
sendR(res, 200, "Operation successful", data)

// Error response
sendR(res, 400, "Error message", null)

// Response shape: { status: "success"|"error", message: string, data: T | null }
```

### Route Handler Pattern (MANDATORY)

```typescript
import { reqResAsyncHandler } from "@/utils/http"

// ALWAYS wrap async route handlers
router.get("/endpoint", reqResAsyncHandler(async (req, res) => {
  // Your logic here
  sendR(res, 200, "Success", data)
}))
```

---

## Overview

This backend service provides:

- **AI Agent Orchestration**: Multi-agent system using OpenAI Agents SDK for intelligent calendar management
- **Multi-Modal Architecture**: Chat, Voice, and Telegram share the same tool handlers via the Shared Layer
- **Google Calendar Integration**: Full CRUD operations, conflict detection, gap recovery
- **Multi-Platform Bots**: Telegram bot (production) and WhatsApp bot (in development)
- **SaaS Infrastructure**: Multi-tenant architecture with Lemon Squeezy payment integration
- **Real-time Features**: Voice transcription, streaming chat responses (SSE), webhooks

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                           REQUEST LAYER                                 │   │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │   │
│   │   │  HTTP   │  │  SSE    │  │ Telegram│  │ WhatsApp│  │ LiveKit │       │   │
│   │   │ Routes  │  │ Stream  │  │   Bot   │  │   Bot   │  │  Voice  │       │   │
│   │   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │   │
│   └────────┼────────────┼───────────┼───────────┼───────────┼───────────────┘   │
│            │            │           │           │           │                   │
│            └────────────┼───────────┼───────────┼───────────┘                   │
│                         │           │           │                               │
│                         ▼           ▼           ▼                               │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                         MIDDLEWARE CHAIN                                │   │
│   │   CORS → Helmet → Rate Limit → Auth → Google Token → Calendar Client    │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                     │                                           │
│                                     ▼                                           │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                          SHARED LAYER                                   │   │
│   │   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │   │
│   │   │ Tool Handlers │  │   Adapters    │  │ Context Store │               │   │
│   │   │ (Pure Logic)  │  │ OpenAI/LiveKit│  │    (Redis)    │               │   │
│   │   └───────────────┘  └───────────────┘  └───────────────┘               │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                     │                                           │
│                                     ▼                                           │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                       AI AGENT ORCHESTRATOR                             │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│   │   │ Direct      │  │ Agent       │  │ Handoff     │  │ Guardrails  │    │   │
│   │   │ Tools       │  │ Tools       │  │ Agents      │  │ & Safety    │    │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                     │                                           │
│                                     ▼                                           │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                        EXTERNAL SERVICES                                │   │
│   │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐            │   │
│   │   │ Supabase  │  │  Google   │  │  OpenAI   │  │   Redis   │            │   │
│   │   │  + Auth   │  │ Calendar  │  │  Agents   │  │  Context  │            │   │
│   │   └───────────┘  └───────────┘  └───────────┘  └───────────┘            │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Request
     │
     ▼
┌─────────────────┐
│   Entry Point   │  app.ts (Express server)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Middleware    │  auth, validation, rate-limiting
│   Chain         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │  Handle HTTP request
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Shared Layer   │  Tool handlers (pure business logic)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   AI Agent      │  OpenAI Agents SDK orchestration
│   (if needed)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   External      │  Google Calendar, Supabase, etc.
│   Services      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Response      │  sendR() formatted JSON or SSE stream
└─────────────────┘
```

---

## Shared Layer

The **Shared Layer** (`be/shared/`) is the architectural hub enabling code reuse across all interaction modalities.

### Design Principles

1. **Framework Agnostic**: Tool handlers contain pure business logic with no SDK dependencies
2. **Single Source of Truth**: One implementation shared by Chat, Voice, and Telegram
3. **Adapter Pattern**: SDK-specific wrappers adapt handlers for OpenAI and LiveKit
4. **Testability**: Pure functions are easy to unit test in isolation

### Shared Layer Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │              SHARED LAYER                   │
                    │             (be/shared/)                    │
                    │                                             │
                    │   ┌─────────────────────────────────────┐   │
                    │   │         Tool Handlers               │   │
                    │   │   (Pure business logic)             │   │
                    │   │   • event-handlers.ts               │   │
                    │   │   • direct-handlers.ts              │   │
                    │   │   • gap-handlers.ts                 │   │
                    │   └─────────────────────────────────────┘   │
                    │                     │                       │
                    │   ┌─────────────────┴─────────────────┐     │
                    │   │                                   │     │
                    │   ▼                                   ▼     │
                    │ ┌───────────────┐     ┌───────────────┐     │
                    │ │ OpenAI        │     │ LiveKit       │     │
                    │ │ Adapter       │     │ Adapter       │     │
                    │ └───────────────┘     └───────────────┘     │
                    │                                             │
                    │   ┌─────────────────────────────────────┐   │
                    │   │   Unified Context Store (Redis)     │   │
                    │   │   • Cross-modal state persistence   │   │
                    │   │   • Entity tracking & resolution    │   │
                    │   │   • Conversation context            │   │
                    │   └─────────────────────────────────────┘   │
                    └─────────────────────────────────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────┐
              │                           │                       │
              ▼                           ▼                       ▼
        ┌───────────┐             ┌───────────┐           ┌───────────┐
        │   Chat    │             │   Voice   │           │  Telegram │
        │  (Web)    │             │ (LiveKit) │           │   (Bot)   │
        └───────────┘             └───────────┘           └───────────┘
```

### Tool Handlers (`shared/tools/handlers/`)

Pure business logic functions. Framework-agnostic, testable, reusable across modalities.

#### Event Handlers (`event-handlers.ts`)

```typescript
import { getEventHandler, insertEventHandler } from "@/shared/tools/handlers"

// All handlers take (params, context) and return results
const events = await getEventHandler(
  { timeMin, timeMax, calendarId },
  { email: user.email }
)
```

| Function | Purpose | Complexity |
|----------|---------|------------|
| `getEventHandler(params, ctx)` | Retrieve events by time range | O(n) |
| `insertEventHandler(params, ctx)` | Create new calendar event | O(1) |
| `updateEventHandler(params, ctx)` | Update existing event | O(1) |
| `deleteEventHandler(params, ctx)` | Delete event by ID | O(1) |

#### Direct Handlers (`direct-handlers.ts`)

Fast utilities that bypass the LLM (<100ms response time).

| Function | Purpose | Use Case |
|----------|---------|----------|
| `validateUserHandler(ctx)` | Check if user exists | Pre-flight check |
| `getTimezoneHandler(ctx)` | Get user's timezone | Event creation |
| `selectCalendarHandler(params, ctx)` | AI-powered calendar selection | Multi-calendar users |
| `checkConflictsHandler(params, ctx)` | Check for scheduling conflicts | Before event creation |
| `preCreateValidationHandler(params, ctx)` | Combined pre-creation checks | Event creation flow |

#### Gap Handlers (`gap-handlers.ts`)

Gap recovery feature for detecting untracked time.

| Function | Purpose |
|----------|---------|
| `analyzeGapsHandler(params, ctx)` | Find untracked time gaps between events |
| `fillGapHandler(params, ctx)` | Create event to fill detected gap |
| `formatGapsHandler(params)` | Format gaps for display in UI |

### Adapters (`shared/adapters/`)

SDK-specific wrappers that adapt handlers for specific frameworks.

#### OpenAI Adapter (`openai-adapter.ts`)

```typescript
import { SHARED_TOOLS, getEmailFromContext } from "@/shared/adapters/openai-adapter"

// Use SHARED_TOOLS when creating OpenAI agents
const agent = new Agent({
  tools: SHARED_TOOLS,
  // ...
})
```

#### LiveKit Adapter (`livekit-adapter.ts`)

```typescript
import { LIVEKIT_TOOL_DEFINITIONS, getLiveKitToolByName } from "@/shared/adapters/livekit-adapter"

// Use for LiveKit Agents SDK voice integration
const tools = getAllLiveKitTools()
```

### Context Store (`shared/context/`)

Redis-backed cross-modal state persistence enabling sophisticated features.

```typescript
import { unifiedContextStore } from "@/shared/context/unified-context-store"

// Store last referenced event (for pronoun resolution)
await unifiedContextStore.setLastEvent(userId, event, "chat")

// Retrieve for pronoun resolution ("it", "that meeting", "the event")
const lastEvent = await unifiedContextStore.getLastEvent(userId)

// Track conversation context across modalities
await unifiedContextStore.setConversation(userId, conversationContext)
```

**Features:**
- Cross-modal entity tracking
- Pronoun resolution ("that meeting" → last referenced event)
- Session state persistence across Chat, Voice, Telegram
- TTL-based automatic cleanup

### Orchestrator (`shared/orchestrator/`)

Agent profile management and factory functions.

```typescript
import { getAgentProfile, createTextAgent } from "@/shared/orchestrator"

// Get profile by ID
const profile = getAgentProfile("ally-pro")

// Create agent with profile
const agent = await createTextAgent({
  profileId: "ally-pro",
  email: user.email,
})
```

---

## AI Agent System

### Agent Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       AI AGENT SYSTEM                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   User Message                                                      │
│        │                                                            │
│        ▼                                                            │
│   ┌─────────────────┐                                               │
│   │   Guardrails    │  Safety checks (prompt injection, etc.)       │
│   └────────┬────────┘                                               │
│            │                                                        │
│            ▼                                                        │
│   ┌─────────────────┐                                               │
│   │  Orchestrator   │  Main agent with tool selection               │
│   │     Agent       │                                               │
│   └────────┬────────┘                                               │
│            │                                                        │
│            ├──────────────────┬──────────────────┐                  │
│            ▼                  ▼                  ▼                  │
│   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐       │
│   │  Direct Tools   │ │  Agent Tools    │ │ Handoff Agents  │       │
│   │  (Fast <100ms)  │ │  (AI-powered)   │ │ (Multi-step)    │       │
│   │                 │ │                 │ │                 │       │
│   │ • validate_user │ │ • get_event     │ │ • create_event  │       │
│   │ • get_timezone  │ │ • update_event  │ │ • complex_flow  │       │
│   │ • check_conflict│ │ • delete_event  │ │                 │       │
│   └─────────────────┘ └─────────────────┘ └─────────────────┘       │
│            │                  │                  │                  │
│            └──────────────────┼──────────────────┘                  │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │            Tool Handlers (Shared Layer)                     │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────┐                                               │
│   │    Response     │  Streaming (SSE) or JSON                      │
│   └─────────────────┘                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Agent Tiers

| Tier | Model | Cost | Use Case |
|------|-------|------|----------|
| `FAST_MODEL` | GPT-4-1-NANO | $ | Simple tool-calling, basic operations |
| `MEDIUM_MODEL` | GPT-4-1-MINI | $$ | Multi-tool orchestration, moderate complexity |
| `CURRENT_MODEL` | GPT-5-MINI | $$$ | Complex reasoning, advanced NLP parsing |

### Tool Registry

Tools are organized into two categories in `ai-agents/tool-registry.ts`:

#### DIRECT_TOOLS (Fast, no AI overhead)

Execute immediately without LLM invocation. Ideal for validation and pre-checks.

| Tool | Description | Response Time |
|------|-------------|---------------|
| `validate_user_direct` | Check user exists in database | <50ms |
| `get_timezone_direct` | Get user's timezone setting | <50ms |
| `select_calendar_direct` | AI-selected calendar for operation | <100ms |
| `check_conflicts_direct` | Check for scheduling conflicts | <100ms |
| `pre_create_validation` | Combined validation checks | <100ms |
| `insert_event_direct` | Fast event creation | <200ms |
| `get_event_direct` | Retrieve events by criteria | <200ms |

#### AGENT_TOOLS (AI-powered)

Require LLM reasoning for parameter extraction or complex decisions.

| Tool | Description | Complexity |
|------|-------------|------------|
| `generate_google_auth_url` | Create OAuth URL for calendar connection | Simple |
| `register_user_via_db` | Register new user in database | Simple |
| `get_event` | Smart event retrieval with NLP | Medium |
| `update_event` | Event modification with conflict check | Medium |
| `delete_event` | Event removal with confirmation | Medium |

### Adding New Tools

1. **Define schema** in `ai-agents/tool-schemas.ts`:

```typescript
export const myToolSchema = z.object({
  param1: z.string().describe("Description for AI"),
  param2: z.number().optional().describe("Optional numeric value"),
})
```

2. **Create handler** in `shared/tools/handlers/`:

```typescript
export async function myToolHandler(
  params: z.infer<typeof myToolSchema>,
  ctx: HandlerContext
): Promise<MyToolResult> {
  // Pure business logic here - no SDK dependencies
  const result = await performOperation(params, ctx.email)
  return { success: true, data: result }
}
```

3. **Register in adapters**:

```typescript
// In shared/adapters/openai-adapter.ts
export const MY_TOOL = tool({
  name: "my_tool",
  description: "What this tool does for the AI",
  parameters: myToolSchema,
  execute: async (params, context) => {
    const email = getEmailFromContext(context, "my_tool")
    return await myToolHandler(params, { email })
  },
})
```

4. **Add to registry** in `ai-agents/tool-registry.ts`:

```typescript
export const DIRECT_TOOLS = [
  // ... existing tools
  MY_TOOL,
]
```

### Guardrails System

Safety checks executed before AI processing:

```typescript
import { runGuardrails } from "@/ai-agents/guardrails"

// Check for malicious input
const { safe, reason } = await runGuardrails(userMessage)
if (!safe) {
  return sendR(res, 400, reason, null)
}
```

**Protected Against:**
- Prompt injection attempts
- Mass deletion requests
- SQL injection patterns
- Excessive operation requests

---

## API Reference

### Authentication (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/signup` | Register with email/password | None |
| `POST` | `/signin` | Sign in with email/password | None |
| `GET` | `/signup/google` | OAuth with Google | None |
| `GET` | `/callback` | OAuth callback handler | None |
| `POST` | `/logout` | Clear session | JWT |
| `GET` | `/get-user` | Get current user | JWT |
| `GET` | `/session` | Check session validity | JWT |
| `POST` | `/refresh` | Refresh access token | Refresh Token |
| `DELETE` | `/` | Deactivate account (GDPR) | JWT |

### Calendar (`/api/calendar`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | List all user calendars | JWT + Google |
| `POST` | `/` | Create secondary calendar | JWT + Google |
| `GET` | `/:id` | Get calendar by ID | JWT + Google |
| `PATCH` | `/:id` | Partial update calendar | JWT + Google |
| `PUT` | `/:id` | Full update calendar | JWT + Google |
| `DELETE` | `/:id` | Clear all events in calendar | JWT + Google |
| `GET` | `/freebusy` | Get free/busy information | JWT + Google |
| `GET` | `/colors` | Get available calendar colors | JWT + Google |
| `GET` | `/timezones` | Get supported timezones | JWT |

### Events (`/api/events`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | List events with filters | JWT + Google |
| `POST` | `/` | Create event | JWT + Google |
| `GET` | `/:id` | Get event by ID | JWT + Google |
| `PATCH` | `/:id` | Update event | JWT + Google |
| `DELETE` | `/:id` | Delete event | JWT + Google |
| `POST` | `/quick-add` | Natural language event create | JWT + Google |
| `GET` | `/analytics` | Get calendar analytics | JWT + Google |
| `POST` | `/watch` | Setup event change webhook | JWT + Google |

### Chat (`/api/chat`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/stream` | Stream chat response (SSE) | JWT + Google |
| `POST` | `/` | Non-streaming chat | JWT + Google |
| `GET` | `/conversations` | List conversations | JWT |
| `GET` | `/conversations/:id` | Get conversation | JWT |
| `DELETE` | `/conversations/:id` | Delete conversation | JWT |
| `PATCH` | `/conversations/:id` | Update conversation title | JWT |

### Voice (`/api/voice`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/transcribe` | Transcribe audio file | JWT |
| `POST` | `/stream` | Real-time voice streaming | JWT |
| `GET` | `/token` | Get LiveKit room token | JWT |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/users` | List all users (paginated) | Admin JWT |
| `GET` | `/users/:id` | Get user details | Admin JWT |
| `POST` | `/users/:id/credits` | Grant credits to user | Admin JWT |
| `GET` | `/audit-logs` | Get audit logs (paginated) | Admin JWT |
| `GET` | `/payments` | Get payment history | Admin JWT |
| `GET` | `/subscriptions` | Get subscription stats | Admin JWT |

### Payments (`/api/payments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/webhook` | Lemon Squeezy webhook | Webhook Secret |
| `GET` | `/subscription` | Get user subscription | JWT |
| `POST` | `/checkout` | Create checkout session | JWT |
| `POST` | `/cancel` | Cancel subscription | JWT |

---

## Middleware

### Middleware Chain Order

```typescript
// Order matters! Applied in sequence:
app.use(cors())                    // 1. CORS headers
app.use(helmet())                  // 2. Security headers
app.use(rateLimiter)               // 3. Rate limiting
app.use(express.json())            // 4. Parse JSON body
app.use(authHandler)               // 5. Extract JWT
app.use(supabaseAuth)              // 6. Validate with Supabase
app.use(googleTokenValidation)     // 7. Check Google tokens
app.use(googleTokenRefresh)        // 8. Auto-refresh if needed
app.use(calendarClient)            // 9. Attach calendar to request
```

### Authentication Middleware

```typescript
import { authHandler } from "@/middlewares/auth-handler"
import { supabaseAuth } from "@/middlewares/supabase-auth"
import { googleTokenValidation } from "@/middlewares/google-token-validation"
import { googleTokenRefresh } from "@/middlewares/google-token-refresh"

// Apply to protected routes
router.use(authHandler)           // Extract JWT from header/cookie
router.use(supabaseAuth)          // Validate with Supabase
router.use(googleTokenValidation) // Check Google tokens exist
router.use(googleTokenRefresh)    // Auto-refresh expired tokens
```

### Request Type Extensions

```typescript
// Authenticated request with user
interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email: string
  }
}

// Request with calendar client attached
interface CalendarRequest extends AuthenticatedRequest {
  calendar: calendar_v3.Calendar
  googleTokens: {
    accessToken: string
    refreshToken: string
  }
}
```

---

## Project Structure

```
be/
├── ai-agents/                   # OpenAI Agent System
│   ├── sessions/                # Session persistence (Supabase)
│   ├── agents.ts                # Agent definitions & orchestration
│   ├── agents-instructions.ts   # System prompts and instructions
│   ├── tool-registry.ts         # Tool definitions (AGENT_TOOLS, DIRECT_TOOLS)
│   ├── tool-schemas.ts          # Zod schemas for tool parameters
│   ├── tool-execution.ts        # Tool execution logic
│   ├── tool-descriptions.ts     # Tool descriptions for LLM context
│   ├── direct-utilities.ts      # Fast non-AI tools
│   ├── guardrails.ts            # Safety checks (prompt injection)
│   ├── insights-generator.ts    # Analytics insights generation
│   └── utils.ts                 # Agent utilities
│
├── shared/                      # Cross-Modal Shared Layer
│   ├── types/                   # Core interfaces
│   │   └── index.ts             # HandlerContext, AgentContext, Modality
│   ├── tools/                   # Framework-agnostic tools
│   │   ├── handlers/            # Pure business logic handlers
│   │   │   ├── event-handlers.ts
│   │   │   ├── direct-handlers.ts
│   │   │   └── gap-handlers.ts
│   │   ├── schemas/             # Zod schemas
│   │   └── tool-executor.ts     # Provider-agnostic execution
│   ├── adapters/                # SDK-specific wrappers
│   │   ├── openai-adapter.ts    # @openai/agents wrapper
│   │   └── livekit-adapter.ts   # @livekit/agents wrapper
│   ├── context/                 # Cross-modal context (Redis)
│   │   ├── unified-context-store.ts
│   │   └── entity-tracker.ts    # Pronoun resolution
│   ├── orchestrator/            # Agent profiles & factories
│   │   ├── agent-profiles.ts
│   │   ├── model-registry.ts
│   │   ├── orchestrator-factory.ts
│   │   └── text-agent-factory.ts
│   ├── prompts/                 # Shared prompt templates
│   │   └── base-prompts.ts
│   └── llm/                     # Multi-provider abstraction
│
├── config/                      # Configuration
│   ├── clients/                 # External clients
│   │   ├── supabase.ts          # Supabase client
│   │   ├── redis.ts             # Redis connection
│   │   ├── google-oauth.ts      # Google auth setup
│   │   ├── openai.ts            # OpenAI client
│   │   └── lemonsqueezy.ts      # Payment client
│   ├── constants/               # Application constants
│   │   ├── ai.ts                # Model names, tool configs
│   │   ├── google.ts            # Google API constants
│   │   ├── http.ts              # Status codes, routes
│   │   └── timezone.ts          # Timezone mappings
│   ├── env.ts                   # Environment validation
│   └── index.ts                 # Config exports
│
├── controllers/                 # Request handlers
│   ├── google-calendar/         # Calendar-specific controllers
│   │   ├── calendar-list-controller.ts
│   │   ├── calendar-controller.ts
│   │   ├── events-controller.ts
│   │   ├── acl-controller.ts
│   │   └── channels-controller.ts
│   ├── users/                   # User management
│   ├── chat-controller.ts       # Chat endpoint
│   ├── chat-stream-controller.ts # SSE streaming
│   ├── agent-profiles-controller.ts
│   ├── admin-controller.ts
│   ├── payment-controller.ts
│   ├── voice-controller.ts
│   └── contact-controller.ts
│
├── routes/                      # API routes
│   ├── google-calendar/         # Calendar API routes
│   ├── users-route.ts           # Auth endpoints
│   ├── admin-route.ts           # Admin endpoints
│   ├── payment-route.ts         # Payment endpoints
│   ├── voice-route.ts           # Voice endpoints
│   └── webhooks-route.ts        # Webhook handlers
│
├── services/                    # Business logic services
│   ├── admin-service.ts         # Admin operations
│   ├── lemonsqueezy-service.ts  # Payment integration
│   └── user-preferences-service.ts
│
├── middlewares/                 # Express middleware
│   ├── auth-handler.ts          # JWT extraction
│   ├── supabase-auth.ts         # Supabase validation
│   ├── google-token-validation.ts
│   ├── google-token-refresh.ts
│   ├── calendar-client.ts       # Attach calendar to request
│   ├── rate-limiter.ts          # Request rate limiting
│   ├── security-audit.ts        # Audit logging
│   └── error-handler.ts         # Global error handler
│
├── telegram-bot/                # Telegram Bot (Grammy)
│   ├── init-bot.ts              # Bot initialization
│   ├── handlers/                # Message handlers
│   ├── commands/                # Slash commands
│   └── middleware/              # Telegram middleware
│
├── whatsapp-bot/                # WhatsApp Bot (in dev)
│   ├── init-whatsapp.ts
│   └── handlers/
│
├── voice-sidecar/               # LiveKit Voice Agent
│   ├── main.ts                  # Voice agent entry
│   └── handlers/
│
├── utils/                       # Utilities
│   ├── calendar/                # Calendar operations
│   │   ├── calendar-service.ts
│   │   ├── event-operations.ts
│   │   └── conflict-checker.ts
│   ├── auth/                    # Auth utilities
│   ├── logger.ts                # Winston logging
│   ├── audit-logger.ts          # Security audit
│   ├── send-response.ts         # Response formatter (sendR)
│   ├── http.ts                  # HTTP utilities
│   └── sse.ts                   # Server-Sent Events
│
├── tests/                       # Test suite
│   ├── controllers/             # Controller tests
│   ├── services/                # Service tests
│   ├── utils/                   # Utility tests
│   └── mocks/                   # Mock data
│
├── supabase/                    # Database
│   ├── migrations/              # Schema migrations
│   └── config.toml              # Supabase config
│
├── app.ts                       # Entry point
├── expressd.d.ts                # Express type extensions
├── database.types.ts            # Auto-generated Supabase types
└── package.json                 # Dependencies
```

---

## Coding Conventions

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-preferences-controller.ts` |
| Classes | PascalCase | `class UserService` |
| Functions | camelCase | `function getUserById()` |
| Constants | SCREAMING_SNAKE_CASE | `const MAX_RETRIES = 3` |
| Types/Interfaces | PascalCase | `interface UserProfile` |

### Import Order

```typescript
// 1. External packages
import { Router } from "express"
import { z } from "zod"

// 2. Internal modules (using @/ alias)
import { SUPABASE } from "@/config/clients"
import { sendR } from "@/utils/send-response"

// 3. Types (use 'import type' for type-only imports)
import type { Request, Response } from "express"
import type { UserProfile } from "@/types"
```

### Error Handling

```typescript
// CORRECT: Proper error handling
try {
  const result = await someOperation()
  return result
} catch (error) {
  console.error("Operation failed:", error)
  throw error // Re-throw or handle appropriately
}

// WRONG: Empty catch block
try {
  const result = await someOperation()
} catch (error) {
  // Empty - NEVER do this
}
```

### Type Annotations

```typescript
// CORRECT: Explicit return types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// CORRECT: Explicit parameter types
async function getUserById(id: string): Promise<User | null> {
  return await db.users.findUnique({ where: { id } })
}

// WRONG: Implicit any
function processData(data) { // Missing type annotation
  return data.value
}
```

### Anti-Patterns (FORBIDDEN)

```typescript
// FORBIDDEN: Type assertions
const data = response as any
const user = {} as User

// FORBIDDEN: Non-null assertions
const value = possiblyNull!.property

// FORBIDDEN: TypeScript directives
// @ts-ignore
// @ts-expect-error

// FORBIDDEN: Relative imports
import { something } from "../utils/helper"

// FORBIDDEN: Direct res.json()
res.json({ success: true, data })

// ALWAYS use sendR instead
sendR(res, 200, "Success", data)
```

---

## Testing

### Test Structure

```
be/tests/
├── controllers/       # Controller tests
├── services/          # Service tests
├── utils/             # Utility tests
└── mocks/             # Shared mocks
```

### Test Pattern

```typescript
import { describe, it, expect, beforeEach, jest } from "@jest/globals"

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should create a user", async () => {
    // Arrange
    const userData = { email: "test@example.com" }

    // Act
    const result = await userService.create(userData)

    // Assert
    expect(result.email).toBe(userData.email)
  })
})
```

### Running Tests

```bash
bun test              # Run all tests
bun test:coverage     # Tests with coverage
bun test:watch        # Watch mode
bun test:ci           # CI mode (no watch, coverage)
```

---

## Environment Variables

### Required

```env
# Supabase
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPEN_API_KEY=your_openai_api_key

# Google OAuth
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Optional

```env
# Alternative LLM Providers
ANTHROPIC_API_KEY=your_anthropic_api_key

# Telegram Bot
TELEGRAM_BOT_ACCESS_TOKEN=your_telegram_bot_token

# Payments
LEMON_SQUEEZY_API_KEY=your_api_key
LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret

# Redis (for cross-modal context)
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
FE_BASE_URL=http://localhost:4000
```

---

## Commands

```bash
# Development
bun dev              # Dev server with hot reload
bun start            # Production server

# Testing
bun test             # Run tests
bun test:coverage    # Tests with coverage
bun test:watch       # Watch mode

# Code Quality
bun run check        # Lint check (Ultracite)
bun run fix          # Auto-fix lint issues
bun run format       # Format code (Biome)

# Database
bun run update:db:types  # Generate Supabase types

# Utilities
bun run sort         # Sort package.json
```

---

## External Services

| Service | Purpose | Config Location |
|---------|---------|-----------------|
| **Supabase** | PostgreSQL + Auth + RLS | `@/config/clients/supabase.ts` |
| **Google Calendar** | Events, calendars, OAuth | `@/utils/calendar/` |
| **OpenAI** | Agent orchestration, LLM | `@/ai-agents/` |
| **Anthropic** | Alternative LLM provider | `@/config/clients/openai.ts` |
| **LiveKit** | Real-time voice rooms | `@/voice-sidecar/` |
| **Lemon Squeezy** | Payments (subscription) | `@/services/lemonsqueezy-service.ts` |
| **Redis** | Cross-modal context store | `@/shared/context/` |
| **Resend** | Email delivery | `@/controllers/contact-controller.ts` |

---

## Security

### Authentication Layers

| Layer | Implementation |
|-------|----------------|
| **JWT Validation** | Supabase Auth tokens |
| **OAuth 2.0** | Secure Google integration |
| **Token Refresh** | Auto-refresh middleware |
| **Session Management** | Secure cookie handling |

### API Security

| Feature | Implementation |
|---------|----------------|
| **Rate Limiting** | Per-endpoint configurable limits |
| **Input Validation** | Zod schemas for all inputs |
| **CORS** | Origin whitelisting |
| **Helmet** | Security headers |
| **Request Size** | 10MB max limit |

### AI Safety

| Feature | Implementation |
|---------|----------------|
| **Guardrails** | Prompt injection detection |
| **Mass Deletion Protection** | Confirmation required |
| **Input Sanitization** | Pre-processing of user input |
| **Audit Logging** | Security event tracking |

### Data Protection

| Feature | Implementation |
|---------|----------------|
| **Row Level Security** | Supabase RLS policies |
| **Password Hashing** | Supabase Auth (bcrypt) |
| **HTTPS Only** | Production enforcement |
| **Secrets Management** | Environment variables |
| **GDPR Compliance** | Account deletion support |

---

## License

MIT License - see [LICENSE](../LICENSE) for details.
