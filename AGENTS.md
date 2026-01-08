# AI Google Calendar Assistant

**Generated:** 2026-01-08 | **Commit:** 221e26e | **Branch:** main

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
│   ├── ai-agents/          # OpenAI Agent framework - SEE be/ai-agents/AGENTS.md
│   ├── telegram-bot/       # Grammy bot - SEE be/telegram-bot/AGENTS.md
│   ├── voice-sidecar/      # LiveKit Voice Agent (separate process)
│   ├── shared/             # Cross-modal shared layer
│   │   ├── tools/          # Framework-agnostic tool definitions
│   │   │   └── handlers/   # Pure business logic (email → calendar ops)
│   │   ├── adapters/       # SDK-specific wrappers
│   │   │   ├── openai-adapter.ts   # Wraps for @openai/agents
│   │   │   └── livekit-adapter.ts  # Wraps for @livekit/agents
│   │   └── context/        # Cross-modal context store (Redis)
│   ├── controllers/        # Route handlers (one per resource)
│   ├── utils/              # Calendar, auth, AI, HTTP utilities
│   └── config/             # Env, constants, external clients
├── fe/                     # Next.js 15 frontend (port 4000)
│   ├── app/                # App Router pages
│   ├── components/         # React components (shadcn/ui)
│   │   └── ui/livekit-voice-button.tsx  # Voice call UI
│   ├── hooks/              # React hooks
│   │   ├── queries/        # TanStack Query - SEE fe/hooks/queries/AGENTS.md
│   │   └── useLiveKitVoice.ts  # Voice session hook
│   └── contexts/           # Auth, Chat, Dashboard state
└── AGENTS.md               # This file
```

## Where to Look

| Task               | Location                            | Notes                                   |
| ------------------ | ----------------------------------- | --------------------------------------- |
| Add API endpoint   | `be/routes/` + `be/controllers/`    | One controller per resource             |
| Add AI tool        | `be/ai-agents/tool-registry.ts`     | Register in AGENT_TOOLS or DIRECT_TOOLS |
| Add agent          | `be/ai-agents/agents.ts`            | Choose FAST/MEDIUM/CURRENT model tier   |
| Frontend component | `fe/components/`                    | Use shadcn/ui primitives from `ui/`     |
| Data fetching      | `fe/hooks/queries/`                 | TanStack Query with wrapper pattern     |
| Telegram command   | `be/telegram-bot/utils/commands.ts` | Grammy middleware chain                 |
| Gap recovery       | `be/utils/calendar/gap-recovery.ts` | AI-powered gap analysis                 |

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

## Anti-Patterns

| Forbidden                                  | Why                        |
| ------------------------------------------ | -------------------------- |
| `as any`, `@ts-ignore`, `@ts-expect-error` | Never suppress type errors |
| Relative imports in backend                | Use `@/` alias always      |
| `export default` for components            | Use named exports          |
| Empty catch blocks                         | Handle or rethrow errors   |
| Hardcoded config values                    | Use `@/config` constants   |

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

## AI Agent Model Tiers

| Tier            | Model        | Use Case                          |
| --------------- | ------------ | --------------------------------- |
| `FAST_MODEL`    | GPT-4-1-NANO | Simple tool-calling (cheap, fast) |
| `MEDIUM_MODEL`  | GPT-4-1-MINI | Multi-tool orchestration          |
| `CURRENT_MODEL` | GPT-5-MINI   | Complex reasoning, NLP parsing    |

## External Services

| Service             | Purpose                  | Config Location                       |
| ------------------- | ------------------------ | ------------------------------------- |
| Supabase            | PostgreSQL + Auth + RLS  | `be/config/clients/`                  |
| Google Calendar API | Events, calendars, OAuth | `be/utils/calendar/`                  |
| OpenAI              | Agent orchestration      | `be/ai-agents/`                       |
| LiveKit             | Real-time voice rooms    | `be/voice-sidecar/`                   |
| Stripe              | Payments (subscription)  | `be/services/subscription-service.ts` |

## Multi-Modal Architecture

### Shared Tools Layer

All modalities (chat, voice, telegram) share the same business logic through a framework-agnostic tools layer:

```
be/shared/
├── tools/
│   └── handlers/           # Pure functions: (params, context) → result
│       ├── event-handlers.ts   # getEventHandler, insertEventHandler, etc.
│       └── index.ts            # Barrel export
├── adapters/
│   ├── openai-adapter.ts   # Wraps handlers for @openai/agents SDK
│   └── livekit-adapter.ts  # Wraps handlers for @livekit/agents SDK
└── context/
    ├── unified-context-store.ts  # Redis-backed cross-modal state
    └── entity-tracker.ts         # Pronoun resolution ("move it", "that meeting")
```

**Handler Pattern:**

```typescript
// Pure business logic - no framework dependencies
export async function getEventHandler(
  params: GetEventParams,
  ctx: HandlerContext
): Promise<CalendarEvent[]> { ... }

// Adapters wrap for specific SDKs
// OpenAI adapter: tool({ name, description, parameters, execute })
// LiveKit adapter: llm.tool({ description, parameters, execute })
```

### Cross-Modal Context Store

Redis-backed state that persists across modalities:

| Key Pattern                  | Purpose                                | TTL |
| ---------------------------- | -------------------------------------- | --- |
| `ctx:{userId}:last_event`    | Last referenced event                  | 24h |
| `ctx:{userId}:last_calendar` | Last referenced calendar               | 24h |
| `ctx:{userId}:conversation`  | Pending actions, topic                 | 2h  |
| `ctx:{userId}:modality`      | Current modality (chat/voice/telegram) | 2h  |

**Usage:**

```typescript
import { unifiedContextStore } from "@/shared/context";

// Track modality at session start
await unifiedContextStore.setModality(userId, "voice");
await unifiedContextStore.touch(userId); // Refresh TTLs

// Entity resolution for pronouns
const lastEvent = await unifiedContextStore.getLastEvent(userId);
```

### LiveKit Voice Agent

The voice agent runs as a separate process using LiveKit Agents SDK:

**Start voice agent:**

```bash
cd be && npx ts-node voice-sidecar/agent.ts
```

**Environment variables required:**

```env
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_WS_URL=wss://your-project.livekit.cloud
```

**Token endpoint:** `POST /api/voice/livekit/token`

**Frontend integration:**

```tsx
import { useLiveKitVoice } from "@/hooks/useLiveKitVoice";
import { LiveKitVoiceButton } from "@/components/ui/livekit-voice-button";
```

## Branded Agent Orchestrator (v1)

Users select agents by semantic name ("Ally Pro", "Ally Flash") rather than raw model IDs.

### Agent Profiles

```
be/shared/orchestrator/
├── agent-profiles.ts       # Branded agent configurations
├── model-registry.ts       # Maps profiles to provider models
├── orchestrator-factory.ts # Creates agents from profiles
└── index.ts                # Barrel export
```

| Profile ID       | Display Name   | Tier       | Realtime | Description                             |
| ---------------- | -------------- | ---------- | -------- | --------------------------------------- |
| `ally-lite`      | Ally Lite      | free       | No       | Quick & simple for basic tasks          |
| `ally-pro`       | Ally Pro       | pro        | Yes      | Balanced intelligence, multi-calendar   |
| `ally-flash`     | Ally Flash     | pro        | Yes      | Lightning fast responses                |
| `ally-executive` | Ally Executive | enterprise | Yes      | Premium reasoning, executive assistance |
| `ally-gemini`    | Ally Gemini    | pro        | No       | Google Gemini powered                   |
| `ally-claude`    | Ally Claude    | pro        | No       | Anthropic Claude powered                |

### Usage

**Backend - Voice Agent:**

```typescript
import { createVoiceAgent } from "@/shared/orchestrator";

const { agent, realtimeModel, profile } = createVoiceAgent({
  profileId: "ally-pro", // User's selected profile
  tools,
});
```

**Frontend - Profile Selection:**

```tsx
import { useAgentProfiles } from "@/hooks/useAgentProfiles";

const { data } = useAgentProfiles({ tier: "pro", voiceOnly: true });
// data.profiles = [{ id, displayName, tagline, ... }]
```

**API Endpoints:**

- `GET /api/users/agent-profiles` - List available profiles
- `GET /api/users/agent-profiles/selected` - Get user's selected profile
- `PUT /api/users/agent-profiles/selected` - Set user's selected profile
- `POST /api/voice/livekit/token` - Pass `{ profileId }` to select agent

**Telegram Bot:**

```
/profile - Open profile selector with inline keyboard
```

Users can switch between profiles directly in Telegram. The selected profile affects response style and personality.

### Model Registry

Profiles map to actual models via `model-registry.ts`:

| Provider  | Tier     | Model            |
| --------- | -------- | ---------------- |
| OpenAI    | fast     | gpt-4.1-nano     |
| OpenAI    | balanced | gpt-4.1-mini     |
| OpenAI    | powerful | gpt-5-mini       |
| Google    | balanced | gemini-2.0-flash |
| Anthropic | balanced | claude-sonnet-4  |

## Notes

- **Database types**: Run `npm run update:db:types` in both `be/` and `fe/` after schema changes
- **Auth flow**: Supabase JWT → Google token validation → Auto-refresh middleware
- **Telegram**: Uses Grammy v1.38, i18n for Hebrew/English, RTL text handling
- **Large files (>500 lines)**: `database.types.ts` (generated), `commands.ts`, `direct-utilities.ts`, `gap-recovery.ts`
