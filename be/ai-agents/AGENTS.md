# AI Agents Module

OpenAI Agents SDK implementation for calendar assistant orchestration.

## Architecture

```
ORCHESTRATOR_AGENT (GPT-4-1-MINI router)
├── DIRECT_TOOLS (pure functions, no AI overhead)
│   ├── validate_user_direct, get_timezone_direct
│   ├── pre_create_validation (combined validation)
│   └── insert_event_direct, analyze_gaps_direct
├── HANDOFF_AGENTS (multi-step workflows)
│   ├── createEventHandoff, updateEventHandoff
│   └── deleteEventHandoff, registerUserHandoff
└── AGENTS (atomic single-purpose)
    ├── parseEventText (GPT-5-MINI for NLP)
    └── updateEvent, deleteEvent (GPT-4-1-NANO)
```

## Model Tiers

| Tier            | Model        | Use Case                 |
| --------------- | ------------ | ------------------------ |
| `FAST_MODEL`    | GPT-4-1-NANO | Simple tool-calling      |
| `MEDIUM_MODEL`  | GPT-4-1-MINI | Multi-tool orchestration |
| `CURRENT_MODEL` | GPT-5-MINI   | Complex NLP/reasoning    |

## Where to Look

| Task            | File                                             |
| --------------- | ------------------------------------------------ |
| Add tool        | `tool-registry.ts` (AGENT_TOOLS or DIRECT_TOOLS) |
| Add agent       | `agents.ts` + `agents-instructions.ts`           |
| Tool parameters | `tool-schemas.ts` (Zod schemas)                  |
| Tool execution  | `tool-execution.ts`                              |
| Safety checks   | `guardrails.ts`                                  |

## Conventions

- Tools get email from `runContext.context.email` (AgentContext type)
- Use DIRECT_TOOLS for DB/validation ops (faster, cheaper)
- Agent tools use `asTool()` to expose agents as callable tools
- Guardrails check for injection, mass deletion attempts

## Key Patterns

```typescript
// Direct tool (no AI, pure function)
DIRECT_TOOLS.validate_user_direct;

// Agent as tool (callable from other agents)
AGENTS.parseEventText.asTool({ toolName: "parse_event_text" });

// Context extraction
const email = runContext?.context?.email;
```

## Anti-Patterns

| Forbidden                       | Why                      |
| ------------------------------- | ------------------------ |
| AI agents for simple DB lookups | Use DIRECT_TOOLS instead |
| Skip guardrail checks           | Security risk            |
| CURRENT_MODEL for simple tools  | Cost/latency overhead    |
| Hardcoded email in tools        | Use AgentContext         |
