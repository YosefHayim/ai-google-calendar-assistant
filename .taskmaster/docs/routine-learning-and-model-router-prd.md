# Routine Learning System & Model Router - Product Requirements Document

## Overview

This PRD covers two major features:
1. **Routine Learning System**: Learn user daily routines from calendar events to provide proactive reminders, time optimization suggestions, and goal tracking.
2. **Model Router System**: Intelligent model selection wrapper that routes tasks to appropriate AI models based on complexity, type, and requirements.

---

## Feature 1: Routine Learning System

### Goals
- Learn user patterns from calendar events
- Provide proactive reminders based on past events
- Understand user's life routine and calendar
- Suggest time optimizations
- Help users reach their goals

### Requirements

#### Database Schema
- Create `user_routines` table in Supabase with:
  - id (BIGSERIAL PRIMARY KEY)
  - user_id (UUID, references user_calendar_tokens)
  - routine_type (TEXT: 'daily', 'weekly', 'monthly', 'event_pattern', 'time_slot')
  - pattern_data (JSONB for pattern details)
  - confidence_score (DECIMAL 0.0-1.0)
  - frequency (INTEGER)
  - last_observed_at (TIMESTAMPTZ)
  - created_at, updated_at (TIMESTAMPTZ)
  - metadata (JSONB)
  - Unique constraint on (user_id, routine_type, pattern_data->>'key')
  - Indexes on user_id, routine_type, updated_at

#### Service Layer
- Create `services/RoutineLearningService.ts` with methods:
  - `analyzeEventPatterns(user_id, events)` - Analyze past events to find patterns
  - `learnRoutine(user_id, timeRange)` - Learn routines from calendar data
  - `getUserRoutine(user_id, routineType?)` - Retrieve learned routines
  - `predictUpcomingEvents(user_id, daysAhead)` - Predict likely upcoming events
  - `suggestOptimalTime(user_id, eventDuration, preferredTime?)` - Suggest best time slots
  - `getTimeOptimizationSuggestions(user_id)` - Get optimization recommendations
  - `updateRoutineConfidence(user_id, routineKey, success)` - Update pattern confidence

#### Agent Tools
- Add tools to `ai-agents/agentTools.ts`:
  - `get_user_routines` - Get learned routines and patterns
  - `get_upcoming_predictions` - Get predicted upcoming events based on patterns
  - `suggest_optimal_time` - Get time optimization suggestions
  - `get_routine_insights` - Get insights about user's calendar patterns
  - `set_user_goal` - Store user goals for tracking
  - `get_goal_progress` - Get progress toward user goals

#### Agent Instructions
- Update orchestrator agent to:
  - Proactively remind users about predicted events
  - Suggest time optimizations when creating events
  - Reference learned routines in conversations
  - Help users achieve their goals

#### Pattern Detection
- Implement pattern detection algorithm:
  - Group events by summary/title
  - Analyze time patterns (hour, day of week)
  - Calculate frequency and consistency
  - Identify relationships (event A often followed by event B)
  - Calculate confidence based on frequency and consistency
  - Store patterns with confidence scores

#### Background Processing
- Create background job to periodically analyze events
- Update routines as new events are added
- Maintain confidence scores based on pattern accuracy

---

## Feature 2: Model Router System

### Goals
- Analyze tasks to determine appropriate AI model
- Select model from available options (GPT_5, GPT_5_MINI, O3, O1, etc.)
- Route to appropriate agent with selected model
- Maintain backward compatibility
- Optimize for cost and latency

### Requirements

#### Service Layer
- Create `services/ModelRouterService.ts` with:
  - `analyzeTask(prompt, context)` - Analyze task complexity, type, requirements
  - `selectModel(analysis, agentType)` - Select appropriate model based on analysis
  - `getAgentWithModel(agentType, model)` - Get or create agent with selected model
  - Agent caching mechanism (Map<string, Agent>)
  - Task analysis returns: complexity, type, requiresReasoning, estimatedTokens

#### Integration
- Enhance `utils/activateAgent.ts` (or equivalent) to:
  - Accept optional `options` parameter: `{ model?: MODELS, autoRoute?: boolean }`
  - Support automatic routing when `autoRoute: true`
  - Support manual model override when `model` specified
  - Maintain backward compatibility (default behavior unchanged)
  - Cache agents by (agentType, model) key

#### Routing Logic
- Implement complexity analysis:
  - Simple: < 50 words, single action, clear intent
  - Medium: 50-200 words, multiple steps, some context needed
  - Complex: > 200 words, multi-step reasoning, ambiguous intent
- Implement task type detection:
  - Calendar operations
  - General conversation
  - Complex reasoning
  - Cost-sensitive operations
- Create decision matrix:
  - Simple calendar tasks → GPT_5_MINI
  - Complex calendar tasks → GPT_5
  - Complex reasoning → O3 or O1_PRO
  - General conversation → GPT_5_CHAT
  - Cost-sensitive → MINI variants

#### Telegram Bot Integration
- Update `telegram-bot/init-bot.ts` to:
  - Enable auto-routing option (configurable)
  - Pass routing options to activateAgent
  - Log routing decisions for monitoring

#### Metrics & Logging
- Add routing metrics/logging:
  - Track which models are selected for which tasks
  - Monitor routing accuracy
  - Log performance metrics
- Optimize caching strategy based on usage patterns

---

## Implementation Phases

### Phase 1: Foundation (Routine Learning)
1. Create database migration for `user_routines` table
2. Create `RoutineLearningService` with basic structure
3. Add method to fetch and analyze past events
4. Implement basic pattern detection (recurring events, time patterns)

### Phase 2: Pattern Learning (Routine Learning)
1. Implement daily/weekly routine detection
2. Implement time slot availability analysis
3. Implement event relationship detection
4. Add confidence scoring system
5. Create background job to periodically analyze events

### Phase 3: Model Router Foundation
1. Create `ModelRouterService` with task analysis
2. Implement model selection logic
3. Add agent caching mechanism
4. Enhance `activateAgent` to support model routing
5. Add `autoRoute` option (default: false for backward compatibility)

### Phase 4: Proactive Features (Routine Learning)
1. Implement event prediction based on patterns
2. Create reminder system for predicted events
3. Implement time optimization suggestions
4. Add conflict detection and warnings

### Phase 5: Routing Logic (Model Router)
1. Implement complexity analysis
2. Add task type detection
3. Create decision matrix for model selection
4. Add cost/latency considerations
5. Update Telegram bot to enable auto-routing

### Phase 6: Goal Tracking (Routine Learning)
1. Add goal storage in `user_routines.metadata`
2. Implement goal progress tracking
3. Create suggestions based on goals
4. Add goal achievement notifications

### Phase 7: Agent Integration (Routine Learning)
1. Add routine tools to orchestrator
2. Update orchestrator instructions for proactive behavior
3. Implement routine-based reminders in conversations
4. Add routine insights to agent responses

### Phase 8: Optimization (Both Features)
1. Add routing metrics/logging (Model Router)
2. Optimize caching strategy (Model Router)
3. Fine-tune routing decisions based on usage (Model Router)
4. Test pattern detection accuracy (Routine Learning)
5. Refine confidence scoring (Routine Learning)
6. Optimize performance (Routine Learning)
7. Add user feedback mechanism (Routine Learning)

---

## Technical Constraints

- Use TypeScript
- Follow existing code patterns in `services/` directory
- Use Supabase for database operations
- Maintain backward compatibility with existing agent system
- Use existing logging infrastructure
- Follow existing error handling patterns

## Success Criteria

### Routine Learning
- System learns at least 3 patterns per user within 2 weeks
- Prediction accuracy > 70% for high-confidence patterns
- Time optimization suggestions reduce scheduling conflicts by 30%
- Users can set and track at least 2 goals

### Model Router
- Automatic routing selects appropriate model 90%+ of the time
- Routing adds < 50ms overhead
- Backward compatibility maintained (existing code works unchanged)
- Cost savings of 20%+ through intelligent model selection

