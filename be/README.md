# AI Google Calendar Assistant - Backend

> Express + TypeScript backend service powering AI-driven calendar automation with multi-agent orchestration, multi-platform bot integrations, and SaaS-ready infrastructure.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-green.svg)](https://expressjs.com/)
[![Bun](https://img.shields.io/badge/Bun-Runtime-orange.svg)](https://bun.sh/)
[![OpenAI Agents](https://img.shields.io/badge/OpenAI-Agents_v0.3.7-412991.svg)](https://openai.com/)
[![Jest](https://img.shields.io/badge/Jest-30.2.0-C21325.svg)](https://jestjs.io/)

---

## Quick Reference for AI Agents

> **CRITICAL**: Read this section before making any changes.

### Path Alias

```typescript
// ALWAYS use @/ path alias for imports
import { something } from "@/utils/calendar"  // ✅ CORRECT
import { something } from "../utils/calendar" // ❌ WRONG - Never use relative imports
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
- **Multi-Modal Architecture**: Chat, Voice, and Telegram share the same tool handlers
- **Google Calendar Integration**: Full CRUD operations, conflict detection, gap recovery
- **Multi-Platform Bots**: Telegram bot (production) and WhatsApp bot (in development)
- **SaaS Infrastructure**: Multi-tenant architecture with Lemon Squeezy payment integration
- **Real-time Features**: Voice transcription, streaming chat responses, webhooks

---

## Architecture

### Multi-Modal Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │              SHARED LAYER                   │
                    │   (be/shared/)                              │
                    │                                             │
                    │   ┌─────────────────────────────────────┐   │
                    │   │         Tool Handlers               │   │
                    │   │   (Pure business logic)             │   │
                    │   │   - event-handlers.ts               │   │
                    │   │   - direct-handlers.ts              │   │
                    │   │   - gap-handlers.ts                 │   │
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
                    │   │   - Cross-modal state persistence   │   │
                    │   │   - Entity tracking                 │   │
                    │   └─────────────────────────────────────┘   │
                    └─────────────────────────────────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────┐
              │                           │                       │
              ▼                           ▼                       ▼
        ┌───────────┐             ┌───────────┐           ┌───────────┐
        │   Chat    │             │   Voice   │           │  Telegram │
        │  (Web)    │             │ (LiveKit) │           │   (Bot)   │
        │           │             │           │           │           │
        │ OpenAI    │             │ LiveKit   │           │ OpenAI    │
        │ Agents    │             │ Agents +  │           │ Agents    │
        │ SDK       │             │ Realtime  │           │ SDK       │
        └───────────┘             └───────────┘           └───────────┘
```

### Project Structure

```
be/
├── ai-agents/                   # OpenAI Agent System
│   ├── sessions/                # Session persistence (Supabase)
│   ├── agents.ts                # Agent definitions
│   ├── agents-instructions.ts   # Agent prompts and instructions
│   ├── tool-registry.ts         # Tool definitions (AGENT_TOOLS, DIRECT_TOOLS)
│   ├── tool-schemas.ts          # Zod schemas for tool parameters
│   ├── tool-execution.ts        # Tool execution logic
│   ├── tool-descriptions.ts     # Tool descriptions for LLM
│   ├── direct-utilities.ts      # Fast non-AI tools
│   ├── guardrails.ts            # Safety checks
│   ├── insights-generator.ts    # Analytics insights
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
│   │   └── entity-tracker.ts
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
│   │   ├── supabase.ts
│   │   ├── redis.ts
│   │   ├── google-oauth.ts
│   │   ├── openai.ts
│   │   └── lemonsqueezy.ts
│   ├── constants/               # Application constants
│   │   ├── ai.ts
│   │   ├── google.ts
│   │   ├── http.ts
│   │   └── timezone.ts
│   └── env.ts                   # Environment validation
│
├── controllers/                 # Request handlers
│   ├── google-calendar/         # Calendar-specific controllers
│   ├── users/                   # User management
│   ├── chat-controller.ts
│   ├── chat-stream-controller.ts
│   ├── admin-controller.ts
│   └── ...
│
├── middlewares/                 # Express middleware
│   ├── auth-handler.ts          # JWT authentication
│   ├── supabase-auth.ts         # Supabase session
│   ├── google-token-validation.ts
│   ├── google-token-refresh.ts
│   ├── calendar-client.ts       # Attach calendar to request
│   ├── rate-limiter.ts
│   └── error-handler.ts
│
├── routes/                      # API routes
├── services/                    # Business logic services
├── telegram-bot/                # Telegram Bot (Grammy)
├── whatsapp-bot/                # WhatsApp Bot
├── voice-sidecar/               # LiveKit Voice Agent
├── utils/                       # Shared utilities
│   ├── calendar/                # Calendar operations
│   ├── auth/                    # Auth utilities
│   └── send-response.ts         # Response helpers
│
├── tests/                       # Test files
└── app.ts                       # Application entry point
```

---

## Coding Conventions (MANDATORY)

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

### Error Handling Pattern

```typescript
// ✅ CORRECT: Proper error handling
try {
  const result = await someOperation()
  return result
} catch (error) {
  console.error("Operation failed:", error)
  throw error // Re-throw or handle appropriately
}

// ❌ WRONG: Empty catch block
try {
  const result = await someOperation()
} catch (error) {
  // Empty - NEVER do this
}

// ❌ WRONG: Swallowing errors silently
try {
  const result = await someOperation()
} catch (error) {
  console.log(error) // Log but don't handle
}
```

### Type Annotations

```typescript
// ✅ CORRECT: Explicit return types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ✅ CORRECT: Explicit parameter types
async function getUserById(id: string): Promise<User | null> {
  return await db.users.findUnique({ where: { id } })
}

// ❌ WRONG: Implicit any
function processData(data) { // Missing type annotation
  return data.value
}
```

---

## Anti-Patterns (FORBIDDEN)

### Type Safety Violations

```typescript
// ❌ FORBIDDEN: Type assertions to bypass safety
const data = response as any
const user = {} as User

// ❌ FORBIDDEN: Non-null assertions
const value = possiblyNull!.property

// ❌ FORBIDDEN: TypeScript directives
// @ts-ignore
// @ts-expect-error
// @ts-nocheck

// ✅ CORRECT: Proper type narrowing
if (response && typeof response === "object" && "data" in response) {
  const data = response.data
}
```

### Import Violations

```typescript
// ❌ FORBIDDEN: Relative imports
import { something } from "../utils/helper"
import { another } from "../../config/constants"

// ✅ CORRECT: Path alias
import { something } from "@/utils/helper"
import { another } from "@/config/constants"
```

### Response Violations

```typescript
// ❌ FORBIDDEN: Direct res.json()
res.json({ success: true, data })

// ❌ FORBIDDEN: Inconsistent response format
res.status(200).send({ result: data })

// ✅ CORRECT: Always use sendR
import { sendR } from "@/utils/send-response"
sendR(res, 200, "Success", data)
```

### Configuration Violations

```typescript
// ❌ FORBIDDEN: Hardcoded values
const apiUrl = "https://api.example.com"
const maxRetries = 3

// ✅ CORRECT: Use config
import { env } from "@/config/env"
import { MAX_RETRIES } from "@/config/constants"
```

---

## Shared Layer Documentation

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

| Function | Purpose |
|----------|---------|
| `getEventHandler(params, ctx)` | Retrieve events by time range |
| `insertEventHandler(params, ctx)` | Create new calendar event |
| `updateEventHandler(params, ctx)` | Update existing event |
| `deleteEventHandler(params, ctx)` | Delete event by ID |

#### Direct Handlers (`direct-handlers.ts`)

| Function | Purpose |
|----------|---------|
| `validateUserHandler(ctx)` | Check if user exists |
| `getTimezoneHandler(ctx)` | Get user's timezone |
| `selectCalendarHandler(params, ctx)` | AI-powered calendar selection |
| `checkConflictsHandler(params, ctx)` | Check for conflicts |
| `preCreateValidationHandler(params, ctx)` | Combined pre-creation checks |

#### Gap Handlers (`gap-handlers.ts`)

| Function | Purpose |
|----------|---------|
| `analyzeGapsHandler(params, ctx)` | Find untracked time gaps |
| `fillGapHandler(params, ctx)` | Create event to fill gap |
| `formatGapsHandler(params)` | Format gaps for display |

### Adapters (`shared/adapters/`)

SDK-specific wrappers that adapt handlers for specific frameworks.

#### OpenAI Adapter

```typescript
import { SHARED_TOOLS, getEmailFromContext } from "@/shared/adapters/openai-adapter"

// Use SHARED_TOOLS when creating OpenAI agents
const agent = new Agent({
  tools: SHARED_TOOLS,
  // ...
})
```

#### LiveKit Adapter

```typescript
import { LIVEKIT_TOOL_DEFINITIONS, getLiveKitToolByName } from "@/shared/adapters/livekit-adapter"

// Use for LiveKit Agents SDK
const tools = getAllLiveKitTools()
```

### Context Store (`shared/context/`)

Redis-backed cross-modal state persistence.

```typescript
import { unifiedContextStore } from "@/shared/context/unified-context-store"

// Store last referenced event
await unifiedContextStore.setLastEvent(userId, event, "chat")

// Retrieve for pronoun resolution ("it", "that meeting")
const lastEvent = await unifiedContextStore.getLastEvent(userId)

// Track entities across modalities
await unifiedContextStore.setConversation(userId, conversationContext)
```

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

### Agent Tiers

| Tier | Model | Use Case |
|------|-------|----------|
| `FAST_MODEL` | GPT-4-1-NANO | Simple tool-calling (cheap, fast) |
| `MEDIUM_MODEL` | GPT-4-1-MINI | Multi-tool orchestration |
| `CURRENT_MODEL` | GPT-5-MINI | Complex reasoning, NLP parsing |

### Tool Registry

Tools are organized into two categories in `tool-registry.ts`:

**DIRECT_TOOLS** (Fast, no AI overhead):
- `validate_user_direct`
- `get_timezone_direct`
- `select_calendar_direct`
- `check_conflicts_direct`
- `pre_create_validation`
- `insert_event_direct`
- `get_event_direct`

**AGENT_TOOLS** (AI-powered):
- `generate_google_auth_url`
- `register_user_via_db`
- `get_event`
- `update_event`
- `delete_event`

### Adding New Tools

1. **Define schema** in `tool-schemas.ts`:

```typescript
export const myToolSchema = z.object({
  param1: z.string().describe("Description for AI"),
  param2: z.number().optional(),
})
```

2. **Create handler** in `shared/tools/handlers/`:

```typescript
export async function myToolHandler(
  params: z.infer<typeof myToolSchema>,
  ctx: HandlerContext
): Promise<MyToolResult> {
  // Pure business logic here
}
```

3. **Register in adapters**:

```typescript
// In openai-adapter.ts
export const MY_TOOL = tool({
  name: "my_tool",
  description: "What this tool does",
  parameters: myToolSchema,
  execute: async (params, context) => {
    const email = getEmailFromContext(context, "my_tool")
    return await myToolHandler(params, { email })
  },
})
```

4. **Add to registry** in `tool-registry.ts`:

```typescript
export const DIRECT_TOOLS = [
  // ... existing tools
  MY_TOOL,
]
```

---

## API Reference

### Authentication (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register with email/password |
| `POST` | `/signin` | Sign in with email/password |
| `GET` | `/signup/google` | OAuth with Google |
| `GET` | `/callback` | OAuth callback handler |
| `POST` | `/logout` | Clear session |
| `GET` | `/get-user` | Get current user |
| `GET` | `/session` | Check session validity |
| `POST` | `/refresh` | Refresh access token |
| `DELETE` | `/` | Deactivate account |

### Calendar (`/api/calendar`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all calendars |
| `POST` | `/` | Create secondary calendar |
| `GET` | `/:id` | Get calendar by ID |
| `PATCH` | `/:id` | Partial update |
| `PUT` | `/:id` | Full update |
| `DELETE` | `/:id` | Clear all events |
| `GET` | `/freebusy` | Get free/busy info |

### Events (`/api/events`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List events |
| `POST` | `/` | Create event |
| `GET` | `/:id` | Get event by ID |
| `PATCH` | `/:id` | Update event |
| `DELETE` | `/:id` | Delete event |
| `POST` | `/quick-add` | Natural language create |
| `GET` | `/analytics` | Get analytics data |

### Chat (`/api/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/stream` | Stream chat response (SSE) |
| `POST` | `/` | Non-streaming chat |
| `GET` | `/conversations` | List conversations |
| `DELETE` | `/conversations/:id` | Delete conversation |

### Gap Recovery (`/api/gaps`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Analyze gaps |
| `POST` | `/:gapId/fill` | Fill a gap |
| `GET` | `/settings` | Get settings |
| `PATCH` | `/settings` | Update settings |

---

## Middleware Usage

### Authentication Chain

```typescript
import { authHandler } from "@/middlewares/auth-handler"
import { supabaseAuth } from "@/middlewares/supabase-auth"
import { googleTokenValidation } from "@/middlewares/google-token-validation"
import { googleTokenRefresh } from "@/middlewares/google-token-refresh"

// Order matters!
router.use(authHandler)           // 1. Extract JWT
router.use(supabaseAuth)          // 2. Validate with Supabase
router.use(googleTokenValidation) // 3. Check Google tokens
router.use(googleTokenRefresh)    // 4. Auto-refresh if needed
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
}
```

---

## Testing Guidelines

### Test File Location

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
bun test:ci           # CI mode
```

---

## Environment Variables

```env
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/users/callback

# Optional
ANTHROPIC_API_KEY=your_anthropic_api_key
TELEGRAM_BOT_ACCESS_TOKEN=your_telegram_bot_token
LEMON_SQUEEZY_API_KEY=your_api_key
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
bun dev              # Dev server with hot reload
bun start            # Production server
bun test             # Run tests
bun test:coverage    # Tests with coverage
bun run check        # Lint check (Ultracite)
bun run fix          # Auto-fix lint issues
bun run format       # Format code (Biome)
bun run sort         # Sort package.json
bun run update:db:types  # Generate Supabase types
```

---

## External Services

| Service | Purpose | Config Location |
|---------|---------|-----------------|
| Supabase | PostgreSQL + Auth + RLS | `@/config/clients/supabase.ts` |
| Google Calendar API | Events, calendars, OAuth | `@/utils/calendar/` |
| OpenAI | Agent orchestration | `@/ai-agents/` |
| LiveKit | Real-time voice rooms | `@/voice-sidecar/` |
| Lemon Squeezy | Payments (subscription) | `@/services/lemonsqueezy-service.ts` |
| Redis | Cross-modal context store | `@/shared/context/` |

---

## Security

- **JWT Validation**: Supabase Auth tokens
- **OAuth 2.0**: Secure Google integration
- **Rate Limiting**: Per-endpoint configurable limits
- **Input Validation**: Zod schemas for all inputs
- **CORS**: Origin whitelisting
- **Helmet**: Security headers
- **Guardrails**: AI safety checks
- **Audit Logging**: Security event tracking

---

## License

MIT License - see [LICENSE](../LICENSE) for details.
