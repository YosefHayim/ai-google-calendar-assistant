# Routine Learning System - Implementation Plan

## Overview

Implement a system that learns user daily routines from calendar events to provide proactive reminders, time optimization suggestions, and goal tracking.

## Features to Implement

1. **Pattern Recognition**: Learn recurring events, typical times, and event relationships
2. **Proactive Reminders**: Remind users about upcoming events based on past patterns
3. **Routine Understanding**: Build a profile of user's typical day/week
4. **Time Optimization**: Suggest optimal scheduling and identify conflicts
5. **Goal Tracking**: Help users reach their goals through calendar insights

---

## Architecture Design

### 1. Database Schema

Create a new `user_routines` table in Supabase:

```sql
CREATE TABLE user_routines (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_calendar_tokens(user_id),
  routine_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'event_pattern', 'time_slot'
  pattern_data JSONB NOT NULL, -- Stores pattern details
  confidence_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 to 1.0
  frequency INTEGER, -- How often this pattern occurs
  last_observed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  UNIQUE(user_id, routine_type, pattern_data->>'key')
);

CREATE INDEX idx_user_routines_user_id ON user_routines(user_id);
CREATE INDEX idx_user_routines_type ON user_routines(routine_type);
CREATE INDEX idx_user_routines_updated ON user_routines(updated_at DESC);
```

**Pattern Data Structure Examples:**

```json
// Daily Routine Pattern
{
  "key": "morning_meeting",
  "event_summary": "Daily Standup",
  "typical_start_time": "09:00",
  "typical_duration_minutes": 30,
  "day_of_week": [1,2,3,4,5], // Monday-Friday
  "frequency_per_week": 5
}

// Time Slot Pattern
{
  "key": "free_time_morning",
  "start_hour": 8,
  "end_hour": 9,
  "day_of_week": [1,2,3,4,5],
  "availability_percentage": 0.85
}

// Event Relationship Pattern
{
  "key": "gym_after_work",
  "trigger_event": "Work ends",
  "related_event": "Gym session",
  "typical_delay_minutes": 30,
  "frequency_per_week": 3
}
```

### 2. Service Layer

Create `services/RoutineLearningService.ts`:

**Key Methods:**

- `analyzeEventPatterns(user_id, events)` - Analyze past events to find patterns
- `learnRoutine(user_id, timeRange)` - Learn routines from calendar data
- `getUserRoutine(user_id, routineType?)` - Retrieve learned routines
- `predictUpcomingEvents(user_id, daysAhead)` - Predict likely upcoming events
- `suggestOptimalTime(user_id, eventDuration, preferredTime?)` - Suggest best time slots
- `getTimeOptimizationSuggestions(user_id)` - Get optimization recommendations
- `updateRoutineConfidence(user_id, routineKey, success)` - Update pattern confidence

### 3. Agent Tools

Add new tools to `ai-agents/agentTools.ts`:

- `get_user_routines` - Get learned routines and patterns
- `get_upcoming_predictions` - Get predicted upcoming events based on patterns
- `suggest_optimal_time` - Get time optimization suggestions
- `get_routine_insights` - Get insights about user's calendar patterns
- `set_user_goal` - Store user goals for tracking
- `get_goal_progress` - Get progress toward user goals

### 4. Agent Instructions Updates

Update orchestrator to:

- Proactively remind users about predicted events
- Suggest time optimizations when creating events
- Reference learned routines in conversations
- Help users achieve their goals

---

## Implementation Steps

### Phase 1: Foundation ✅ COMPLETED

1. ✅ Create database migration for `user_routines` table
2. ✅ Create `RoutineLearningService` with basic structure
3. ✅ Add method to fetch and analyze past events (`fetchEventsForAnalysis`)
4. ✅ Implement basic pattern detection (recurring events, time patterns, event relationships)

### Phase 2: Pattern Learning ✅ COMPLETED

1. ✅ Implement daily/weekly routine detection (via recurring event patterns)
2. ✅ Implement time slot availability analysis (`detectTimeSlotPatterns`)
3. ✅ Implement event relationship detection (`detectEventRelationshipPatterns`)
4. ✅ Add confidence scoring system (adaptive learning algorithm)
5. ✅ Create background job to periodically analyze events (`RoutineAnalysisJob`)

### Phase 3: Proactive Features ⚠️ PARTIALLY IMPLEMENTED

1. ⚠️ Implement event prediction based on patterns (`predictUpcomingEvents` - placeholder/TODO)
2. ❌ Create reminder system for predicted events (not implemented)
3. ⚠️ Implement time optimization suggestions (`suggestOptimalTime`, `getTimeOptimizationSuggestions` - placeholders/TODO)
4. ❌ Add conflict detection and warnings (not implemented)

### Phase 4: Goal Tracking ❌ NOT IMPLEMENTED

1. ❌ Add goal storage in `user_routines.metadata` (not implemented)
2. ❌ Implement goal progress tracking (not implemented)
3. ❌ Create suggestions based on goals (not implemented)
4. ❌ Add goal achievement notifications (not implemented)

### Phase 5: Agent Integration ❌ NOT IMPLEMENTED

1. ❌ Add routine tools to orchestrator (tools not created: `get_user_routines`, `get_upcoming_predictions`, `suggest_optimal_time`, `get_routine_insights`, `set_user_goal`, `get_goal_progress`)
2. ❌ Update orchestrator instructions for proactive behavior (not updated)
3. ❌ Implement routine-based reminders in conversations (not implemented)
4. ❌ Add routine insights to agent responses (not implemented)

### Phase 6: Testing & Refinement ⚠️ PARTIAL

1. ⚠️ Test pattern detection accuracy (basic implementation complete, comprehensive testing pending)
2. ✅ Refine confidence scoring (adaptive algorithm implemented)
3. ✅ Optimize performance (background job with batching implemented)
4. ❌ Add user feedback mechanism (not implemented)

---

## Technical Details

### Pattern Detection Algorithm

```typescript
// Pseudo-code for pattern detection
function detectPatterns(events: Event[]): Pattern[] {
  // 1. Group events by summary/title
  // 2. Analyze time patterns (hour, day of week)
  // 3. Calculate frequency and consistency
  // 4. Identify relationships (event A often followed by event B)
  // 5. Calculate confidence based on frequency and consistency
  // 6. Store patterns with confidence scores
}
```

### Event Prediction

```typescript
// Predict upcoming events based on patterns
function predictEvents(routines: Routine[], daysAhead: number): Prediction[] {
  // 1. Get all routines with confidence > threshold
  // 2. Calculate next occurrence based on pattern
  // 3. Check if event already exists in calendar
  // 4. Return predictions with confidence scores
}
```

### Time Optimization

```typescript
// Suggest optimal time slots
function suggestOptimalTime(routines: Routine[], duration: number, preferredTime?: Date): Suggestion[] {
  // 1. Analyze free time slots from routines
  // 2. Consider user's typical schedule
  // 3. Avoid conflicts with existing events
  // 4. Respect preferred time if provided
  // 5. Return ranked suggestions
}
```

---

## Example User Interactions

### Proactive Reminder

```
User: "What's my schedule like tomorrow?"
Agent: "Based on your routine, you typically have a morning standup at 9 AM on weekdays.
        I don't see it scheduled yet - would you like me to check if it should be added?"
```

### Time Optimization

```
User: "I need to schedule a 1-hour meeting"
Agent: "Looking at your typical schedule, I see you usually have free time between
        2-3 PM on Tuesdays and Thursdays. Would one of those work?"
```

### Goal Tracking

```
User: "I want to go to the gym 3 times a week"
Agent: "I've set that as a goal. I notice you usually go to the gym after work around
        6 PM. This week you've gone twice - would you like me to suggest a time for
        your third session?"
```

---

## Next Steps

1. Review and approve this plan
2. Create database migration
3. Start with Phase 1 implementation
4. Iterate based on feedback
