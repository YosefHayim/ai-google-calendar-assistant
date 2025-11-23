# Model Router Design - Implementation Approaches

## Current Architecture

**Flow:**

```
Telegram Bot → activateAgent(ORCHESTRATOR_AGENT) → Agent runs with CURRENT_MODEL (GPT_5_MINI)
```

**Current State:**

- All agents use `CURRENT_MODEL` (GPT_5_MINI)
- Single model for all tasks regardless of complexity
- No dynamic model selection based on task characteristics

---

## Requirements

1. Analyze task to determine appropriate model
2. Select model from available options (GPT_5, GPT_5_MINI, O3, O1, etc.)
3. Route to appropriate agent with selected model
4. Maintain backward compatibility
5. Allow model selection based on:
   - Task complexity
   - Task type (reasoning, simple, conversational)
   - Cost considerations
   - Latency requirements

---

## Approach Comparison

### Approach 1: Model Router Agent (Wrapper Pattern)

**Architecture:**

```
Telegram Bot → ModelRouterAgent → Analyzes Task → Selects Model → Creates/Activates Agent
```

**Implementation:**

- Create `ModelRouterAgent` that wraps all other agents
- Router analyzes task (complexity, type, requirements)
- Router selects appropriate model
- Router dynamically creates agent instance with selected model
- Router activates the agent

**Pros:**

- ✅ Clean separation of concerns
- ✅ Router can learn/improve over time
- ✅ Easy to add routing logic
- ✅ Can cache agent instances
- ✅ Testable in isolation

**Cons:**

- ❌ Extra layer adds latency
- ❌ More complex architecture
- ❌ Router needs to understand all agent types

**Code Structure:**

```typescript
// services/ModelRouterService.ts
class ModelRouterService {
  analyzeTask(prompt: string, context?: AgentContext): ModelSelection {
    // Analyze complexity, type, requirements
    // Return: { model: MODELS.GPT_5, agentType: 'orchestrator' }
  }

  selectModel(taskAnalysis: TaskAnalysis): MODELS {
    // Decision logic based on:
    // - Task complexity (simple → MINI, complex → GPT_5)
    // - Task type (reasoning → O3, conversational → GPT_5_CHAT)
    // - Cost constraints
    // - Latency requirements
  }

  getOrCreateAgent(agentType: string, model: MODELS): Agent {
    // Cache agents by (agentType, model) key
    // Create new agent if not cached
  }
}

// New ModelRouterAgent
const MODEL_ROUTER_AGENT = new Agent({
  name: "model_router_agent",
  model: MODELS.GPT_5_MINI, // Lightweight router
  instructions: "Analyze task and route to appropriate agent with right model",
  tools: [
    /* routing tools */
  ],
});
```

---

### Approach 2: Dynamic Model Selection in activateAgent

**Architecture:**

```
Telegram Bot → activateAgent → Analyzes Task → Selects Model → Creates Agent Dynamically
```

**Implementation:**

- Modify `activateAgent` to analyze task before execution
- Add model selection logic directly in activation
- Dynamically create agent with selected model
- Cache agents for performance

**Pros:**

- ✅ No extra layer
- ✅ Transparent to callers
- ✅ Simple integration
- ✅ Minimal changes to existing code

**Cons:**

- ❌ Logic mixed with activation
- ❌ Harder to test routing separately
- ❌ Less flexible for future enhancements

**Code Structure:**

```typescript
// utils/activateAgent.ts (modified)
export const activateAgent = asyncHandler(async (agentKey: AGENTS_LIST | Agent, prompt: string, context?: AgentContext) => {
  // NEW: Analyze task and select model
  const taskAnalysis = analyzeTask(prompt, context);
  const selectedModel = selectModel(taskAnalysis);

  let agent: Agent;

  if (typeof agentKey === "string") {
    // Get base agent config
    const baseAgent = AGENTS[agentKey];
    // Create new agent with selected model
    agent = new Agent({
      ...baseAgent,
      model: selectedModel, // Override model
    });
  } else {
    // Clone agent with new model
    agent = new Agent({
      ...agentKey,
      model: selectedModel,
    });
  }

  // Continue with existing logic...
});
```

---

### Approach 3: Model Configuration per Agent Type

**Architecture:**

```
Telegram Bot → activateAgent → Looks up Model Config → Uses Configured Model
```

**Implementation:**

- Create model configuration mapping
- Map agent types to model profiles
- Simple lookup, no analysis needed

**Pros:**

- ✅ Very simple
- ✅ Predictable
- ✅ Easy to configure
- ✅ No runtime analysis overhead

**Cons:**

- ❌ Less dynamic
- ❌ Requires manual mapping
- ❌ Can't adapt to task complexity
- ❌ One-size-fits-all per agent type

**Code Structure:**

```typescript
// config/modelConfig.ts
export const MODEL_CONFIG = {
  orchestrator: {
    simple: MODELS.GPT_5_MINI,
    complex: MODELS.GPT_5,
    reasoning: MODELS.O3,
  },
  insertEvent: {
    default: MODELS.GPT_5_MINI,
  },
  // ... per agent type
};

// utils/activateAgent.ts
const getModelForAgent = (agentType: string, complexity?: "simple" | "complex"): MODELS => {
  const config = MODEL_CONFIG[agentType];
  return complexity ? config[complexity] : config.default;
};
```

---

### Approach 4: Hybrid - Router Service + Dynamic Agent Creation ⭐ **RECOMMENDED**

**Architecture:**

```
Telegram Bot → ModelRouterService → Analyzes Task → Selects Model →
  → Creates/Caches Agent → activateAgent → Agent Execution
```

**Implementation:**

- Create `ModelRouterService` for analysis and routing
- Modify `activateAgent` to accept optional model override
- Cache agents by (agentType, model) key
- Support both automatic routing and manual override

**Pros:**

- ✅ Best of all approaches
- ✅ Flexible and extensible
- ✅ Can learn/improve over time
- ✅ Backward compatible
- ✅ Testable and maintainable
- ✅ Performance optimized with caching

**Cons:**

- ❌ More complex initial implementation
- ❌ Requires careful caching strategy

**Code Structure:**

```typescript
// services/ModelRouterService.ts
export class ModelRouterService {
  private agentCache = new Map<string, Agent>();

  analyzeTask(prompt: string, context?: AgentContext): TaskAnalysis {
    // Analyze:
    // - Complexity (word count, reasoning requirements)
    // - Task type (calendar, conversation, reasoning)
    // - Context complexity
    // - User preferences
    return {
      complexity: "simple" | "medium" | "complex",
      type: "calendar" | "conversation" | "reasoning",
      requiresReasoning: boolean,
      estimatedTokens: number,
    };
  }

  selectModel(analysis: TaskAnalysis, agentType: string): MODELS {
    // Decision matrix:
    // - Simple calendar tasks → GPT_5_MINI
    // - Complex reasoning → O3 or GPT_5
    // - General conversation → GPT_5_CHAT
    // - Cost-sensitive → MINI variants
  }

  getAgentWithModel(agentType: string, model: MODELS): Agent {
    const cacheKey = `${agentType}:${model}`;

    if (this.agentCache.has(cacheKey)) {
      return this.agentCache.get(cacheKey)!;
    }

    const baseAgent = AGENTS[agentType];
    const agent = new Agent({
      ...baseAgent,
      model,
    });

    this.agentCache.set(cacheKey, agent);
    return agent;
  }
}

// utils/activateAgent.ts (enhanced)
export const activateAgent = asyncHandler(
  async (agentKey: AGENTS_LIST | Agent, prompt: string, context?: AgentContext, options?: { model?: MODELS; autoRoute?: boolean }) => {
    let agent: Agent;
    let selectedModel: MODELS | undefined;

    // Auto-route if enabled
    if (options?.autoRoute) {
      const router = new ModelRouterService();
      const analysis = router.analyzeTask(prompt, context);
      const agentType = typeof agentKey === "string" ? agentKey : agentKey.name;
      selectedModel = router.selectModel(analysis, agentType);
      agent = router.getAgentWithModel(agentType, selectedModel);
    } else if (options?.model) {
      // Manual model override
      selectedModel = options.model;
      // Create agent with specified model...
    } else {
      // Default behavior (backward compatible)
      agent = typeof agentKey === "string" ? AGENTS[agentKey] : agentKey;
    }

    // Continue with existing logic...
  }
);
```

---

## Recommended Approach: **Approach 4 (Hybrid)**

### Why Approach 4?

1. **Flexibility**: Supports both automatic routing and manual override
2. **Performance**: Agent caching prevents recreation overhead
3. **Extensibility**: Easy to add new routing logic
4. **Backward Compatible**: Existing code continues to work
5. **Testable**: Router service can be tested independently
6. **Future-Proof**: Can add ML-based routing later

### Implementation Plan

#### Phase 1: Core Router Service ✅ COMPLETED

1. ✅ Create `ModelRouterService` with task analysis (`analyzeTask` method)
2. ✅ Implement model selection logic (`selectModel` using `getRecommendedModel` from `config/models.ts`)
3. ✅ Add agent caching mechanism (`getAgentWithModel` with Map-based cache)

#### Phase 2: Integration ✅ COMPLETED

1. ✅ Enhance `activateAgent` to support model routing (added `ActivateAgentOptions` interface)
2. ✅ Add `autoRoute` option (default: false for backward compatibility)
3. ❌ Update Telegram bot to enable auto-routing (not enabled in `telegram-bot/init-bot.ts`)

#### Phase 3: Routing Logic ✅ BASIC IMPLEMENTATION

1. ✅ Implement complexity analysis (basic heuristics: word count, prompt length)
2. ✅ Add task type detection (basic keyword-based: calendar, reasoning, conversation)
3. ✅ Create decision matrix for model selection (uses `config/models.ts` capabilities)
4. ⚠️ Add cost/latency considerations (basic flags in TaskAnalysis, could be enhanced)

#### Phase 4: Optimization ⚠️ PARTIAL

1. ⚠️ Add routing metrics/logging (basic logging exists, metrics collection not implemented)
2. ✅ Optimize caching strategy (Map-based cache with `getCacheStats` method)
3. ❌ Fine-tune routing decisions based on usage (not implemented)

---

## Model Selection Criteria

### Task Complexity Indicators

- **Simple**: < 50 words, single action, clear intent
- **Medium**: 50-200 words, multiple steps, some context needed
- **Complex**: > 200 words, multi-step reasoning, ambiguous intent

### Model Selection Matrix

| Task Type          | Complexity | Recommended Model | Fallback   |
| ------------------ | ---------- | ----------------- | ---------- |
| Calendar (simple)  | Simple     | GPT_5_MINI        | GPT_5_NANO |
| Calendar (complex) | Medium     | GPT_5             | GPT_5_MINI |
| Reasoning          | Complex    | O3 / O1_PRO       | GPT_5      |
| Conversation       | Any        | GPT_5_CHAT        | GPT_5      |
| Cost-sensitive     | Any        | GPT_5_MINI        | GPT_5_NANO |

### Decision Factors

1. **Token Count**: Estimate input/output tokens
2. **Reasoning Required**: Does task need step-by-step thinking?
3. **Context Complexity**: How much context is needed?
4. **Cost Constraints**: User/org cost limits
5. **Latency Requirements**: Real-time vs. async
6. **User Preferences**: Stored preferences for model selection

---

## Example Usage

### Automatic Routing (Recommended)

```typescript
// In telegram-bot/init-bot.ts
const { finalOutput } = await activateAgent(
  ORCHESTRATOR_AGENT,
  prompt,
  context,
  { autoRoute: true } // Enable automatic model routing
);
```

### Manual Model Override

```typescript
// Force specific model
const { finalOutput } = await activateAgent(
  ORCHESTRATOR_AGENT,
  prompt,
  context,
  { model: MODELS.O3 } // Use O3 for complex reasoning
);
```

### Backward Compatible (Default)

```typescript
// Existing code continues to work
const { finalOutput } = await activateAgent(ORCHESTRATOR_AGENT, prompt, context); // Uses CURRENT_MODEL as before
```

---

## Next Steps

1. **Review & Approve**: Confirm approach 4 is acceptable
2. **Create Router Service**: Implement `ModelRouterService`
3. **Enhance activateAgent**: Add routing support
4. **Add Routing Logic**: Implement decision matrix
5. **Test & Iterate**: Validate routing decisions
6. **Deploy**: Enable auto-routing in production

---

## Questions to Consider

1. **Default Behavior**: Should auto-routing be enabled by default?
2. **Cost Limits**: Should we set per-user cost limits?
3. **Fallback Strategy**: What if selected model fails?
4. **Metrics**: What metrics should we track for routing decisions?
5. **User Preferences**: Allow users to set model preferences?
