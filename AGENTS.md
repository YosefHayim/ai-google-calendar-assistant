# AI Google Calendar Assistant

**Generated:** 2026-01-07 | **Commit:** 221e26e | **Branch:** main

## Overview

AI-powered Google Calendar Assistant with multi-agent architecture. Monorepo: Express+Bun backend (`be/`), Next.js 15+React 19 frontend (`fe/`). Telegram bot integration. OpenAI Agents SDK for orchestration.

## Structure

```
.
├── be/                     # Express + Bun backend (port 3000)
│   ├── ai-agents/          # OpenAI Agent framework - SEE be/ai-agents/AGENTS.md
│   ├── telegram-bot/       # Grammy bot - SEE be/telegram-bot/AGENTS.md
│   ├── controllers/        # Route handlers (one per resource)
│   ├── utils/              # Calendar, auth, AI, HTTP utilities
│   └── config/             # Env, constants, external clients
├── fe/                     # Next.js 15 frontend (port 4000)
│   ├── app/                # App Router pages
│   ├── components/         # React components (shadcn/ui)
│   ├── hooks/queries/      # TanStack Query - SEE fe/hooks/queries/AGENTS.md
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
| Stripe              | Payments (subscription)  | `be/services/subscription-service.ts` |

## Notes

- **Database types**: Run `npm run update:db:types` in both `be/` and `fe/` after schema changes
- **Auth flow**: Supabase JWT → Google token validation → Auto-refresh middleware
- **Telegram**: Uses Grammy v1.38, i18n for Hebrew/English, RTL text handling
- **Large files (>500 lines)**: `database.types.ts` (generated), `commands.ts`, `direct-utilities.ts`, `gap-recovery.ts`
