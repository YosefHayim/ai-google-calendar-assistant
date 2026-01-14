# Shared Layer

Cross-modal abstraction enabling chat, voice, and telegram to share business logic.

## Architecture

```
MODALITIES (Chat, Voice, Telegram, WhatsApp)
        │
        ▼
┌─────────────────────────────────────────┐
│         SDK ADAPTERS                    │
│  openai-adapter.ts | livekit-adapter.ts │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│         TOOL EXECUTOR                   │
│  Provider-agnostic tool dispatch        │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│         HANDLERS (Pure Functions)       │
│  event | direct | gap handlers          │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│         CONTEXT STORE (Redis)           │
│  Cross-modal state persistence          │
└─────────────────────────────────────────┘
```

## Where to Look

| Task               | File                                     |
| ------------------ | ---------------------------------------- |
| Add tool handler   | `tools/handlers/` + export in `index.ts` |
| Add tool schema    | `tools/schemas/` (Zod)                   |
| Wrap for OpenAI    | `adapters/openai-adapter.ts`             |
| Register tool      | `tools/tool-executor.ts`                 |
| Cross-modal state  | `context/unified-context-store.ts`       |
| Pronoun resolution | `context/entity-tracker.ts`              |
| Agent profiles     | `orchestrator/agent-profiles.ts`         |
| LLM provider       | `llm/providers/`                         |
| System prompts     | `prompts/base-prompts.ts`                |

## Handler Pattern

All handlers are **pure functions** with signature:

```typescript
// Params + Context handler
async function handler(params: Schema, ctx: HandlerContext): Promise<Result>;

// Context-only handler
async function handler(ctx: HandlerContext): Promise<Result>;

// Sync handler (no async)
function handler(params: Schema): Result;
```

**HandlerContext**: `{ email: string }` - user identifier for all operations

## Tool Categories

| Category       | Tools                                                                                | Purpose             |
| -------------- | ------------------------------------------------------------------------------------ | ------------------- |
| **Event**      | get_event, insert_event, update_event, delete_event                                  | Calendar CRUD       |
| **Validation** | validate_user, get_timezone, select_calendar, check_conflicts, pre_create_validation | Pre-creation checks |
| **Gap**        | analyze_gaps, fill_gap, format_gaps_display                                          | Gap recovery        |

## Adding a New Tool

1. **Create handler** in `tools/handlers/`:

```typescript
export async function myToolHandler(
  params: MyToolParams,
  ctx: HandlerContext,
): Promise<MyToolResult> {
  const { email } = ctx;
  // Business logic
}
```

2. **Add schema** in `tools/schemas/`:

```typescript
export const myToolSchema = z.object({
  param1: z.string(),
});
```

3. **Wrap in adapter** (`adapters/openai-adapter.ts`):

```typescript
my_tool: tool({
  name: "my_tool",
  parameters: myToolSchema,
  execute: async (params, runContext) => {
    const email = getEmailFromContext(runContext, "my_tool");
    return myToolHandler(params, { email });
  },
});
```

4. **Register** in `tools/tool-executor.ts`:

```typescript
PARAMS_AND_CTX_HANDLERS["my_tool"] = handlers.myToolHandler;
```

## Context Store

Redis-backed cross-modal state with TTL:

| Method                                        | Purpose                        |
| --------------------------------------------- | ------------------------------ |
| `setLastEvent(userId, event, modality)`       | Track for "it" resolution      |
| `getLastEvent(userId)`                        | Retrieve last referenced event |
| `setLastCalendar(userId, calendar, modality)` | Track for "there" resolution   |
| `trackEvent()` / `resolveEventReference()`    | Pronoun resolution             |

**Key pattern**: `ctx:{userId}:{key}` with 24h TTL

## Agent Profiles

Branded agents instead of raw model IDs:

| Profile     | Tier | Provider  | Capabilities                  |
| ----------- | ---- | --------- | ----------------------------- |
| ally-lite   | free | OpenAI    | calendar_read, calendar_write |
| ally-pro    | pro  | OpenAI    | + voice                       |
| ally-gemini | pro  | Google    | calendar_read, calendar_write |
| ally-claude | pro  | Anthropic | calendar_read, calendar_write |

## LLM Abstraction

Multi-provider support via factory:

```typescript
const provider = createProviderFromProfile(profile);
// Returns OpenAI, Google, or Anthropic provider
```

## Anti-Patterns

| Forbidden                     | Why                                       |
| ----------------------------- | ----------------------------------------- |
| Hardcoded email in handlers   | Use `ctx.email`                           |
| SDK-specific code in handlers | Keep handlers pure                        |
| Direct Redis access           | Use `unifiedContextStore`                 |
| Skip tool registration        | Tool won't work with non-OpenAI providers |
