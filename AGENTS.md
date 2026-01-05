# Agent Coding Guidelines

This document provides essential information for AI coding agents working in this repository.

## Project Overview

This is a **monorepo** with two main workspaces:
- `be/` - Backend (Express + TypeScript + Bun runtime)
- `fe/` - Frontend (Next.js 15 + React 19 + TypeScript)

The project is an AI-powered Google Calendar Assistant with multi-agent architecture using OpenAI Agents framework.

---

## System Architecture

### High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                              CLIENT INTERFACES                                      |
|  +----------------+    +------------------+    +----------------+    +-----------+ |
|  | Web Dashboard  |    | Telegram Bot     |    | WhatsApp       |    | REST API  | |
|  | (Next.js 15)   |    | (Grammy v1.38)   |    | (Webhook)      |    | (Mobile)  | |
|  +-------+--------+    +--------+---------+    +-------+--------+    +-----+-----+ |
+----------|----------------------|----------------------|-------------------|-------+
           |                      |                      |                   |
           +----------------------+----------------------+-------------------+
                                  |
+-----------------------------------------------------------------------------------+
|                            EXPRESS MIDDLEWARE CHAIN                                 |
|  +----------+  +------+  +------------+  +----------------+  +--------------+      |
|  | Helmet   |->| CORS |->| Rate Limit |->| Security Audit |->| JSON Parser  |      |
|  +----------+  +------+  +------------+  +----------------+  +--------------+      |
+-----------------------------------------------------------------------------------+
                                  |
+-----------------------------------------------------------------------------------+
|                         AUTHENTICATION MIDDLEWARE                                   |
|  +----------------+    +------------------------+    +----------------------+      |
|  | Supabase Auth  |--->| Google Token Validation|--->| Google Token Refresh |      |
|  | (JWT Verify)   |    | (Token Existence)      |    | (Auto-refresh)       |      |
|  +----------------+    +------------------------+    +----------------------+      |
+-----------------------------------------------------------------------------------+
                                  |
+-----------------------------------------------------------------------------------+
|                              API ROUTES                                            |
|  +-------+  +--------+  +----------+  +------+  +------+  +-----+  +----------+   |
|  | Users |  | Events |  | Calendar |  | Chat |  | Gaps |  | ACL |  | Channels |   |
|  +-------+  +--------+  +----------+  +------+  +------+  +-----+  +----------+   |
+-----------------------------------------------------------------------------------+
                                  |
+-----------------------------------------------------------------------------------+
|                              CONTROLLERS                                           |
|    Business logic, input validation, response formatting, error handling           |
+-----------------------------------------------------------------------------------+
                                  |
           +----------------------+----------------------+
           |                      |                      |
+----------v---------+  +---------v----------+  +--------v---------+
|    AI AGENTS       |  |  CALENDAR UTILS    |  |   AUTH UTILS     |
|   (OpenAI SDK)     |  |                    |  |                  |
|                    |  | - Events CRUD      |  | - Token Refresh  |
| - Orchestrator     |  | - Gap Recovery     |  | - OAuth Flow     |
| - Handoff Agents   |  | - Conflict Check   |  | - Session Mgmt   |
| - Direct Tools     |  | - Category Update  |  | - Cookie Utils   |
| - Guardrails       |  |                    |  |                  |
+--------------------+  +--------------------+  +------------------+
           |                      |                      |
           +----------------------+----------------------+
                                  |
+-----------------------------------------------------------------------------------+
|                           EXTERNAL SERVICES                                        |
|  +------------------+   +---------------------+   +------------------+             |
|  | Supabase         |   | Google Calendar API |   | OpenAI API       |             |
|  | (PostgreSQL)     |   | (Events, Calendars) |   | (GPT-4, GPT-5)   |             |
|  +------------------+   +---------------------+   +------------------+             |
+-----------------------------------------------------------------------------------+
```

---

## API Endpoints Reference

### Users API (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/get-user` | Supabase | Get current user info |
| `GET` | `/session` | Supabase | Check session validity |
| `GET` | `/integrations/google-calendar` | Supabase | Get Google integration status |
| `POST` | `/integrations/google-calendar/disconnect` | Supabase | Disconnect Google Calendar |
| `POST` | `/refresh` | Supabase | Refresh access token |
| `DELETE` | `/` | Supabase | Deactivate user account |
| `GET` | `/callback` | None | OAuth callback / Generate auth URL |
| `POST` | `/verify-user-by-email-otp` | None | Verify email OTP |
| `POST` | `/signup` | None | Sign up with email/password |
| `POST` | `/signin` | None | Sign in with email/password |
| `POST` | `/logout` | None | Logout (clear cookies) |
| `GET` | `/signup/google` | None | Sign up/in with Google OAuth |
| `GET` | `/signup/github` | None | Sign up with GitHub OAuth |
| `GET` | `/:id` | Supabase | Get user by ID |

### Events API (`/api/events`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Google | Get all events |
| `GET` | `/analytics` | Google | Get event analytics |
| `POST` | `/quick-add` | Google | Quick add event (natural language) |
| `POST` | `/watch` | Google | Watch for event changes (webhook) |
| `POST` | `/move` | Google | Move event to another calendar |
| `POST` | `/import` | Google | Import event (private copy) |
| `GET` | `/:id/instances` | Google | Get recurring event instances |
| `GET` | `/:id` | Google | Get event by ID |
| `POST` | `/` | Google | Create new event |
| `PATCH` | `/:id` | Google | Update event |
| `DELETE` | `/:id` | Google | Delete event |

### Calendar API (`/api/calendar`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Google | Get all calendars |
| `GET` | `/dry-calendar-info` | Google | Get token expiry info |
| `POST` | `/` | Google | Create secondary calendar |
| `GET` | `/settings/all` | Google | List all settings |
| `GET` | `/settings` | Google | Get calendar settings |
| `GET` | `/freebusy` | Google | Get free/busy info |
| `GET` | `/colors` | Google | Get calendar colors |
| `GET` | `/timezones` | Google | Get calendar timezones |
| `GET` | `/:id` | Google | Get calendar by ID |
| `PATCH` | `/:id` | Google | Partial update calendar |
| `PUT` | `/:id` | Google | Full update calendar |
| `DELETE` | `/:id/delete` | Google | Delete secondary calendar |
| `DELETE` | `/:id` | Google | Clear all events |

### Chat API (`/api/chat`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/stream` | Supabase | Stream chat response |
| `POST` | `/` | Supabase | Non-streaming chat |
| `GET` | `/conversations` | Supabase | List conversations |
| `GET` | `/conversations/:id` | Supabase | Get conversation |
| `DELETE` | `/conversations/:id` | Supabase | Delete conversation |
| `POST` | `/conversations/:id/messages` | Supabase | Continue conversation |

### Gap Recovery API (`/api/gaps`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Google | Analyze calendar gaps |
| `GET` | `/formatted` | Google | Get gaps formatted for display |
| `POST` | `/:gapId/fill` | Google | Fill a gap with event |
| `POST` | `/:gapId/skip` | Google | Skip a gap |
| `POST` | `/dismiss-all` | Google | Dismiss all pending gaps |
| `GET` | `/settings` | Supabase | Get gap recovery settings |
| `PATCH` | `/settings` | Supabase | Update settings |
| `POST` | `/disable` | Supabase | Disable gap analysis |

---

## Database Schema

### Current Tables (Legacy)

| Table | Description |
|-------|-------------|
| `user_calendar_tokens` | Google OAuth tokens, user profile, timezone |
| `user_telegram_links` | Links Telegram users to email accounts |
| `calendar_categories` | User calendar metadata and settings |
| `agent_sessions` | Persistent AI agent session state |
| `conversation_state` | Chat conversation state for web/Telegram |
| `conversation_embeddings` | Vector embeddings for semantic search |
| `conversation_summaries` | Summarized conversation history |
| `gap_candidates` | Detected calendar gaps for recovery |
| `gap_recovery_settings` | User preferences for gap recovery |

### Professional Schema (New - in `be/database/migrations/`)

The new schema introduces proper normalization, foreign keys, indexes, and audit fields:

| Table | Description |
|-------|-------------|
| `users` | Core user table (single source of truth) |
| `oauth_tokens` | Centralized OAuth token storage |
| `user_calendars` | User's connected calendars with preferences |
| `telegram_users` | Telegram-specific user data |
| `conversations` | Unified conversation storage |
| `conversation_messages` | Individual messages with metadata |
| `conversation_embeddings` | Vector embeddings with proper FKs |
| `conversation_summaries` | Summaries linked to conversations |
| `agent_sessions` | Agent sessions with expiry |
| `gap_candidates` | Gaps with confidence scores |
| `gap_recovery_settings` | Settings with quick-access fields |
| `user_preferences` | Extensible key-value preferences |
| `audit_logs` | Security and change tracking |

### Database Functions

| Function | Description |
|----------|-------------|
| `match_conversation_embeddings` | Vector similarity search for Telegram |
| `match_conversation_embeddings_web` | Vector similarity search for Web |
| `match_event_embeddings` | Event-based similarity search |
| `match_user_preference_embeddings` | User preference matching |
| `cleanup_old_pending_gaps` | Cleanup job for old gaps |
| `cleanup_expired_sessions` | Remove expired agent sessions |
| `get_or_create_conversation` | Get or create active conversation |

---

## AI Agent Architecture

### Agent Hierarchy

```
ORCHESTRATOR_AGENT (Main Router - GPT-4-1-MINI)
│
├── DIRECT TOOLS (No AI, Pure Functions)
│   ├── validate_user_direct       - DB validation
│   ├── get_timezone_direct        - Timezone lookup
│   ├── select_calendar_direct     - Calendar selection
│   ├── check_conflicts_direct     - Conflict checking
│   ├── pre_create_validation      - Combined validation (parallel)
│   ├── insert_event_direct        - Direct event insertion
│   ├── get_event_direct           - Direct event retrieval
│   ├── summarize_events           - Event summarization
│   ├── analyze_gaps_direct        - Gap analysis
│   ├── fill_gap_direct            - Fill gaps
│   └── format_gaps_display        - Format gaps for display
│
├── HANDOFF AGENTS (Multi-step Workflows)
│   ├── createEventHandoff         - Event creation with validation
│   ├── updateEventHandoff         - Event updates
│   ├── deleteEventHandoff         - Event deletion
│   └── registerUserHandoff        - User registration
│
└── ATOMIC AGENTS (Single-purpose)
    ├── generateGoogleAuthUrl      - OAuth URL generation
    ├── registerUser               - User registration
    ├── updateEvent                - Event updates
    ├── deleteEvent                - Event deletion
    └── parseEventText             - NLP event parsing
```

### Model Tiers

| Tier | Model | Use Case |
|------|-------|----------|
| `FAST_MODEL` | GPT-4-1-NANO | Simple tool-calling agents |
| `MEDIUM_MODEL` | GPT-4-1-MINI | Multi-tool orchestration |
| `CURRENT_MODEL` | GPT-5-MINI | Complex reasoning/NLP |

### Agent Files

| File | Purpose |
|------|---------|
| `agents.ts` | Agent definitions |
| `agents-instructions.ts` | Detailed agent prompts |
| `agent-handoff-descriptions.ts` | Handoff descriptions |
| `tool-registry.ts` | Tool definitions with context |
| `tool-execution.ts` | Tool implementation logic |
| `tool-descriptions.ts` | Tool descriptions |
| `tool-schemas.ts` | Zod schemas for tools |
| `guardrails.ts` | Safety guardrails |
| `direct-utilities.ts` | Direct utilities (bypass AI) |

---

## Build, Lint, Test Commands

### Backend (`be/`)

```bash
# Development
bun --watch app.ts              # Start dev server with hot reload
bun app.ts                      # Start production server

# Testing
bun run jest                    # Run all tests
bun run jest path/to/file.test.ts  # Run single test file
bun run jest --watch            # Watch mode
bun run jest --coverage         # With coverage
bun run jest --ci --coverage --maxWorkers=2  # CI mode

# Linting & Formatting
npx ultracite check             # Check code quality
npx ultracite fix --unsafe      # Auto-fix issues
npx biome check --write .       # Format with Biome
npx biome fix --write .         # Fix with Biome

# Database
npx supabase gen types typescript --project-id vdwjfekcsnurtjsieojv --schema public > database.types.ts

# Utilities
npx sort-package-json           # Sort package.json
```

### Frontend (`fe/`)

```bash
# Development
npm run dev                     # Start dev server (port 4000)
npm run build                   # Production build
npm start                       # Start production server

# Linting & Formatting
npm run lint                    # Next.js linting
npm run format                  # Format with Prettier

# Utilities
npx sort-package-json           # Sort package.json
```

---

## Code Style Guidelines

### TypeScript Configuration

#### Backend
- **Module System**: `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`
- **Target**: ES2022
- **Strict mode**: Enabled
- **Decorators**: `experimentalDecorators: true`, `emitDecoratorMetadata: true` (for Inversify DI)
- **Path Aliases**: `@/*` maps to root (`be/`)

#### Frontend
- **Module System**: `"module": "esnext"`, `"moduleResolution": "bundler"`
- **JSX**: `"preserve"` (handled by Next.js)
- **Strict mode**: Enabled
- **Path Aliases**: `@/*` maps to root (`fe/`)

### Import Organization

**Backend**: Use `@/` path alias for all internal imports
```typescript
// DO
import { SUPABASE } from "@/config";
import { sendR } from "@/utils/http";
import { User } from "@/domain/entities/User";

// DON'T
import { SUPABASE } from "../../config";
import sendR from "../utils/send-response";
```

**Import Order** (both BE & FE):
1. External packages (Node.js built-ins, npm packages)
2. Internal absolute imports (`@/...`)
3. Relative imports (if necessary)
4. Type imports (use `type` keyword when importing types only)

```typescript
// DO
import type { Response } from "express";
import path from "node:path";
import express from "express";

import { STATUS_RESPONSE } from "@/config";
import { reqResAsyncHandler, sendR } from "@/utils/http";

// DON'T - mixing types and values
import { Response } from "express";
```

### Formatting

#### Backend (Biome)
- **No semicolons** in backend code
- **Double quotes** for strings
- **Tab width**: 2 spaces
- **Line width**: 120 characters

#### Frontend (Prettier)
- **No semicolons** (semi: false)
- **Single quotes** for strings (except JSX)
- **Tab width**: 2 spaces
- **Print width**: 120 characters
- **Arrow parens**: always

### Naming Conventions

#### Files
- **Backend**: kebab-case - `events-controller.ts`, `send-response.ts`, `auth-handler.ts`
- **Frontend**: kebab-case - `hand-writing-text.tsx`, `date-range-picker.tsx`
- **Tests**: Same as source with `.test.ts` suffix - `agent-utils.test.ts`
- **Types**: Same as source with `.types.ts` suffix - `database.types.ts`

#### Variables & Functions
- **camelCase** for variables and functions
- **PascalCase** for classes, components, types, interfaces
- **SCREAMING_SNAKE_CASE** for constants

```typescript
// DO
const userEmail = "test@example.com";
const fetchCredentialsByEmail = async () => {};
const TIMEZONE = { DEFAULT: "UTC" };
class EventRepository {}
interface UserPreferences {}
type EventData = {};
```

#### Components (Frontend)
- **PascalCase** for component files and exports
- Use named exports for components

```typescript
// DO - hand-writing-text.tsx
export const HandWrittenTitle: React.FC<HandWrittenTitleProps> = ({ ... }) => { ... }

// DON'T
export default HandWrittenTitle;
```

### Type Safety

#### Always use explicit types for:
- Function parameters
- Function return types
- Object properties in interfaces/types
- Generic type parameters

```typescript
// DO
const getEventById = async (req: Request, res: Response): Promise<void> => {
  const tokenData: TokenData | null = await fetchCredentialsByEmail(req.user?.email!);
  // ...
};

// DON'T
const getEventById = async (req, res) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email);
  // ...
};
```

#### Use `type` imports for type-only imports
```typescript
// DO
import type { Request, Response } from "express";
import type { NextFunction } from "express";

// DON'T
import { Request, Response } from "express";
```

---

## Architecture Patterns

### Backend

#### Dependency Injection (Inversify)
- Use `@injectable()` decorator for services
- Use `@inject()` for dependencies
- Configure in `infrastructure/di/container.ts`

#### Repository Pattern
- Define interfaces in `domain/repositories/`
- Implement in `infrastructure/repositories/`
- Use dependency injection to inject repositories into services

#### Controllers
- One controller per resource (users, events, calendars)
- Use `reqResAsyncHandler` for async error handling
- Use `sendR()` for consistent response format

```typescript
const sendR = (res: Response, status: number, message: string, data?: unknown) => {
  res.status(status).json({
    status: status >= 400 ? "error" : "success",
    message,
    data,
  });
};
```

#### Error Handling
1. **Controllers**: Use `reqResAsyncHandler` wrapper for async route handlers
2. **Middleware**: Use central `errorHandler` middleware
3. **Utilities**: Throw errors with descriptive messages, let middleware handle them

```typescript
// Controller
const createEvent = reqResAsyncHandler(async (req: Request, res: Response) => {
  const r = await eventsHandler(req, ACTION.INSERT, req.body, { ... });
  sendR(res, STATUS_RESPONSE.CREATED, "Event created successfully", r);
});

// Validation
if (!tokenData) {
  return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User tokens not found.");
}

// Throwing errors
throw new Error("Event summary is required");
```

### Frontend

#### Component Structure
- Use functional components with TypeScript
- Define prop interfaces inline or above component
- Use `'use client'` directive for client components

```typescript
'use client'
import React from 'react'

interface HandWrittenTitleProps {
  title?: string
  subtitle?: string
  hideCircle?: boolean
}

export const HandWrittenTitle: React.FC<HandWrittenTitleProps> = ({
  title = 'Hand Written',
  subtitle = 'Optional subtitle',
  hideCircle = false,
}) => {
  // implementation
}
```

#### State Management
- **React Context** for global state (AuthContext, ChatContext, DashboardUIContext)
- **TanStack Query** for server state with query key factory pattern
- **Local state** with `useState` for component-specific state
- **LocalStorage** for persistence (tokens, user data, onboarding)

---

## Testing

### Test File Structure
- Place tests in `be/tests/` directory
- Mirror source structure: `tests/ai-agents/agent-utils.test.ts` for `ai-agents/utils.ts`
- Use `describe` blocks for grouping related tests
- Use descriptive test names starting with "should"

```typescript
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { parseToolArguments, formatEventData } from "../../ai-agents/utils";

describe("agent-utils", () => {
  describe("parseToolArguments", () => {
    it("should extract email from base level", () => {
      const input = { email: "test@example.com" };
      const result = parseToolArguments(input);
      expect(result.email).toBe("test@example.com");
    });
  });
});
```

### Mocking
- Use `jest.mock()` for module mocks
- Mock at the top of test files
- Use `jest.fn()` for function mocks

---

## Security Features

1. **Input Validation** - Zod schemas for all endpoints
2. **Rate Limiting** - Auth, OTP, refresh, and general API limits
3. **CORS** - Configured origin whitelisting
4. **Helmet** - Security headers
5. **HTTP-only Cookies** - Secure token storage
6. **Guardrails** - AI input safety checks (injection detection, mass deletion prevention)
7. **Audit Logging** - Security event tracking
8. **ID Token Verification** - Google OAuth token signature verification
9. **IDOR Protection** - Users can only access their own data
10. **Row Level Security** - Supabase RLS policies

---

## Environment Variables

### Required Variables
**Backend**:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPEN_API_KEY` (OpenAI)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `TELEGRAM_BOT_ACCESS_TOKEN` (optional)

**Frontend**:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

### Validation
- Backend validates required env vars on startup in `config/env.ts`
- Throws error if any required variables are missing

---

## AI Agent Specific Patterns

### Agent Definition
- Use appropriate model tier: `FAST_MODEL`, `MEDIUM_MODEL`, or `CURRENT_MODEL`
- Set `toolChoice: "required"` for agents that must call tools
- Define clear handoff descriptions

```typescript
export const AGENTS = {
  generateGoogleAuthUrl: new Agent({
    name: "generate_google_auth_url_agent",
    instructions: AGENT_INSTRUCTIONS.generateGoogleAuthUrl,
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.generateGoogleAuthUrl,
    tools: [AGENT_TOOLS.generate_google_auth_url],
  }),
};
```

### Tool Arguments Parsing
- Use `parseToolArguments()` for normalizing tool inputs
- Clean null/empty values before processing
- Handle nested parameter structures (`fullEventParameters`, `eventParameters`)

---

## Common Pitfalls to Avoid

1. **Don't mix module systems**: Backend uses CommonJS (`type: "commonjs"`)
2. **Don't skip error handling**: Always wrap async route handlers with `reqResAsyncHandler`
3. **Don't hardcode values**: Use constants from `@/config`
4. **Don't use relative imports**: Always use `@/` path alias
5. **Don't forget TypeScript types**: All parameters and returns should be typed
6. **Don't commit secrets**: Use `.env` files (gitignored)
7. **Don't skip tests**: Add tests for new functionality
8. **Don't ignore linting**: Run linters before committing

---

## Project Structure

```
ai-google-calendar-assistant/
├── be/                              # Backend (Express + TypeScript + Bun)
│   ├── ai-agents/                   # OpenAI Agent implementations
│   │   ├── sessions/                # Session persistence
│   │   ├── agents.ts                # Agent definitions
│   │   ├── tool-registry.ts         # Tool definitions
│   │   └── guardrails.ts            # Safety checks
│   ├── config/                      # Configuration
│   │   ├── clients/                 # External clients (Supabase, Google, OpenAI)
│   │   └── constants/               # Application constants
│   ├── controllers/                 # Request handlers
│   │   └── google-calendar/         # Calendar-specific controllers
│   ├── database/                    # Database migrations
│   │   └── migrations/              # SQL migration scripts
│   ├── domain/                      # Domain-Driven Design layer
│   │   ├── entities/                # Core business entities
│   │   └── repositories/            # Repository interfaces
│   ├── infrastructure/              # External integrations
│   │   ├── di/                      # Dependency injection
│   │   └── repositories/            # Repository implementations
│   ├── middlewares/                 # Express middleware
│   ├── routes/                      # API route definitions
│   │   └── google-calendar/         # Calendar routes
│   ├── telegram-bot/                # Telegram integration
│   │   ├── middleware/              # Bot middleware
│   │   └── utils/                   # Bot utilities
│   ├── tests/                       # Test files
│   └── utils/                       # Utility functions
│       ├── ai/                      # AI utilities
│       ├── auth/                    # Authentication helpers
│       ├── calendar/                # Calendar utilities
│       └── http/                    # HTTP helpers
│
├── fe/                              # Frontend (Next.js 15 + React 19)
│   ├── app/                         # Next.js App Router
│   │   ├── api/                     # API routes (TTS, etc.)
│   │   ├── auth/                    # Auth pages
│   │   └── dashboard/               # Dashboard pages
│   ├── components/                  # React components
│   │   ├── auth/                    # Auth components
│   │   ├── dashboard/               # Dashboard components
│   │   ├── dialogs/                 # Dialog components
│   │   ├── marketing/               # Marketing page components
│   │   ├── shared/                  # Shared components
│   │   └── ui/                      # UI primitives (shadcn/ui)
│   ├── contexts/                    # React contexts
│   ├── hooks/                       # Custom hooks
│   │   └── queries/                 # TanStack Query hooks
│   ├── lib/                         # Utilities
│   │   ├── api/                     # API client
│   │   └── query/                   # Query configuration
│   ├── services/                    # Service layer
│   └── types/                       # TypeScript types
│
└── AGENTS.md                        # This file
```

---

*Generated for AI coding agents. Last updated: 2026-01-05*
