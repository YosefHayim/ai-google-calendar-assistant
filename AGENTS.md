# AI Google Calendar Assistant

**Generated:** 2026-01-14 | **Commit:** 8b0ce4a | **Branch:** dev

## Overview

AI-powered Google Calendar Assistant with **multi-modal architecture**. Four interaction modalities:

- **Chat** (web) - OpenAI Agents SDK via streaming SSE
- **Voice** (real-time) - Browser APIs + OpenAI Whisper
- **Telegram** - OpenAI Agents SDK via Grammy bot
- **WhatsApp** - OpenAI Agents SDK (undocumented, WIP)

Monorepo: Express+Bun backend (`be/`), Next.js 15+React 19 frontend (`fe/`). All modalities share tool handlers and cross-modal context via Redis.

## Structure

```
.
├── be/                     # Express + Bun backend (port 3000)
│   ├── shared/             # Cross-modal shared layer (see be/shared/AGENTS.md)
│   ├── ai-agents/          # OpenAI Agents SDK (see be/ai-agents/AGENTS.md)
│   ├── telegram-bot/       # Grammy bot (see be/telegram-bot/AGENTS.md)
│   ├── whatsapp-bot/       # WhatsApp integration (WIP)
│   ├── slack-bot/          # Slack integration (undocumented)
│   ├── controllers/        # Route handlers (25+ controllers)
│   ├── middlewares/        # Auth, validation, rate limiting
│   ├── routes/             # API endpoint definitions
│   ├── utils/              # Calendar, auth, AI, HTTP utilities
│   ├── config/             # Env, constants, external clients
│   └── services/           # Business logic (admin, lemonsqueezy, prefs)
├── fe/                     # Next.js 15 frontend (port 4000)
│   ├── app/                # App Router pages
│   ├── components/         # React components (shadcn/ui, 40+ primitives)
│   ├── hooks/              # Custom hooks + TanStack Query (see fe/hooks/queries/AGENTS.md)
│   ├── contexts/           # Auth, Chat, Analytics, Dashboard, GapRecovery
│   ├── services/           # API services (13 services)
│   └── lib/                # Utilities (api, formatUtils, dateUtils)
└── infra/                  # CloudFront CDN, App Runner configs
```

---

## Where to Look

| Task                | Location                                                             | Notes                       |
| ------------------- | -------------------------------------------------------------------- | --------------------------- |
| Add API endpoint    | `be/routes/` + `be/controllers/`                                     | One controller per resource |
| Add AI tool         | `be/shared/tools/handlers/` + `be/shared/adapters/openai-adapter.ts` | Handler first, then wrap    |
| Add agent           | `be/ai-agents/agents.ts`                                             | Choose model tier           |
| Add middleware      | `be/middlewares/`                                                    | Apply in route file         |
| Frontend component  | `fe/components/`                                                     | Use shadcn/ui primitives    |
| Data fetching       | `fe/hooks/queries/`                                                  | TanStack Query wrapper      |
| Telegram command    | `be/telegram-bot/utils/commands.ts`                                  | Grammy middleware chain     |
| Cross-modal context | `be/shared/context/`                                                 | Redis-backed store          |

---

## Conventions

### Backend (Express + Bun)

- **No semicolons**, double quotes, 80 char line width (Biome + ultracite)
- **Path alias**: `@/*` → `be/*` (use for all imports)
- **Module system**: CommonJS (`"type": "commonjs"`)
- **Error handling**: Wrap routes with `reqResAsyncHandler`, respond via `sendR(res, status, message, data)`
- **Response format**: `{ status: "success"|"error", message, data }`

### Frontend (Next.js 15)

- **No semicolons**, single quotes, 120 char line width (Prettier)
- **Path alias**: `@/*` → `fe/*`
- **Components**: Functional + TypeScript, named exports, `'use client'` for client components
- **State**: React Context (global) + TanStack Query (server) + useState (local)

### Shared

- **Files**: kebab-case (`events-controller.ts`, `date-range-picker.tsx`)
- **Types**: `import type { X }` for type-only imports
- **Tests**: `be/tests/` (Jest), `fe/tests/` (Bun test)

---

## Component Reusability (Frontend)

**ALWAYS use shadcn/ui primitives**:

| Element      | Use This         | NOT This                             |
| ------------ | ---------------- | ------------------------------------ |
| Buttons      | `<Button>`       | `<button className="...">`           |
| Inputs       | `<Input>`        | `<input className="...">`            |
| Loading      | `<InlineLoader>` | `<Loader2 className="animate-spin">` |
| Stats        | `<StatCard>`     | Custom card divs                     |
| Empty states | `<EmptyState>`   | Custom `flex flex-col items-center`  |
| Error states | `<ErrorState>`   | Custom error containers              |

### Formatting Utilities

**ALWAYS use `@/lib/formatUtils`**:

| Function                   | Example        |
| -------------------------- | -------------- |
| `formatDate(date, 'FULL')` | "Jan 15, 2026" |
| `formatDuration(90)`       | "1h 30m"       |
| `formatCurrency(1999)`     | "$19.99"       |
| `formatNumber(1234)`       | "1,234"        |

---

## Anti-Patterns

| Forbidden                                  | Why                              |
| ------------------------------------------ | -------------------------------- |
| `as any`, `@ts-ignore`, `@ts-expect-error` | Never suppress type errors       |
| Relative imports in backend                | Use `@/` alias always            |
| `export default` for components            | Use named exports                |
| Empty catch blocks                         | Handle or rethrow errors         |
| `useState` for data fetching loading       | Use TanStack Query's `isLoading` |
| `useEffect` + `useState` for API calls     | Use `useQuery`/`useQueries`      |

---

## AI Agent Model Tiers

| Tier            | Model        | Use Case                          |
| --------------- | ------------ | --------------------------------- |
| `FAST_MODEL`    | GPT-4-1-NANO | Simple tool-calling (cheap, fast) |
| `MEDIUM_MODEL`  | GPT-4-1-MINI | Multi-tool orchestration          |
| `CURRENT_MODEL` | GPT-5-MINI   | Complex reasoning, NLP parsing    |

## Agent Profiles

| Profile ID       | Tier       | Realtime | Provider  |
| ---------------- | ---------- | -------- | --------- |
| `ally-lite`      | free       | No       | OpenAI    |
| `ally-pro`       | pro        | Yes      | OpenAI    |
| `ally-flash`     | pro        | Yes      | OpenAI    |
| `ally-executive` | enterprise | Yes      | OpenAI    |
| `ally-gemini`    | pro        | No       | Google    |
| `ally-claude`    | pro        | No       | Anthropic |

---

## Commands

```bash
# Backend (be/)
bun --watch app.ts          # Dev server
bun run jest                # Tests
npx biome fix --write .     # Format

# Frontend (fe/)
npm run dev                 # Dev server (port 4000)
npm run build               # Production build
npm run format              # Prettier
```

---

## External Services

| Service             | Purpose             | Config                                |
| ------------------- | ------------------- | ------------------------------------- |
| Supabase            | PostgreSQL + Auth   | `be/config/clients/`                  |
| Google Calendar API | Events, OAuth       | `be/utils/calendar/`                  |
| OpenAI              | Agent orchestration | `be/ai-agents/`                       |
| Lemon Squeezy       | Payments            | `be/services/lemonsqueezy-service.ts` |
| Redis               | Cross-modal context | `be/shared/context/`                  |

---

## Large Files (>500 lines)

| File                                           | Lines | Purpose                                |
| ---------------------------------------------- | ----- | -------------------------------------- |
| `be/telegram-bot/utils/commands.ts`            | 1,146 | Telegram command handlers              |
| `be/utils/conversation/ConversationService.ts` | 1,120 | Unified conversation service           |
| `be/utils/calendar/gap-recovery.ts`            | 826   | Gap analysis with i18n travel patterns |
| `be/services/lemonsqueezy-service.ts`          | 816   | Payment/subscription service           |
| `fe/components/marketing/FeatureShowcase.tsx`  | 1,405 | Marketing feature showcase             |
| `fe/database.types.ts`                         | 1,617 | Generated Supabase types               |

---

## Notes

- **Database types**: Run `npm run update:db:types` after schema changes
- **Auth flow**: Supabase JWT → Google token validation → Auto-refresh middleware
- **Nested fe/fe/**: Duplicate directory, should be cleaned up
- **Mixed lockfiles**: Remove pnpm-lock.yaml, keep package-lock.json (using npm)
