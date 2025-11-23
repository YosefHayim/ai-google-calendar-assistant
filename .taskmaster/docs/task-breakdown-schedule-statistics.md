# Schedule Statistics Feature - Task Breakdown

## Overview

This document breaks down the Schedule Statistics & Insights feature into implementable tasks with dependencies, priorities, and details.

## Task List

### Phase 1: Foundation & Core Statistics (Tasks 46-52)

#### Task 46: Create database migration for user_schedule_statistics table (Optional - for caching)

- **Status**: pending
- **Priority**: medium
- **Dependencies**: []
- **Details**: Create Supabase migration for optional caching table:
  - id (BIGSERIAL PRIMARY KEY)
  - user_id (UUID, references user_calendar_tokens)
  - period_type (TEXT: 'daily', 'weekly', 'monthly')
  - period_start (DATE)
  - period_end (DATE)
  - statistics (JSONB) - stores aggregated statistics
  - calculated_at (TIMESTAMPTZ)
  - Unique constraint on (user_id, period_type, period_start, period_end)
  - Indexes on user_id, period_type, period_start
- **Test Strategy**: Verify migration runs, indexes created, constraints enforced

#### Task 47: Create ScheduleStatisticsService with basic structure

- **Status**: pending
- **Priority**: high
- **Dependencies**: []
- **Details**: Create services/ScheduleStatisticsService.ts with:
  - Constructor taking Supabase client, EventService, and logger
  - Basic method signatures for all statistics methods
  - Type definitions for statistics interfaces
  - Error handling structure
- **Test Strategy**: Verify file creation, class definition, method signatures compile

#### Task 48: Implement event fetching and date range filtering

- **Status**: pending
- **Priority**: high
- **Dependencies**: [47]
- **Details**: Implement methods to:
  - Fetch events from Google Calendar API via EventService
  - Filter events by date range (startDate, endDate)
  - Handle timezone conversions
  - Filter out cancelled events
  - Support multiple calendars per user
  - Cache event data in memory for calculations
- **Test Strategy**: Test event fetching for various date ranges, timezone handling, cancelled event filtering

#### Task 49: Implement basic statistics calculation (daily, weekly, monthly)

- **Status**: pending
- **Priority**: high
- **Dependencies**: [48]
- **Details**: Implement calculation methods for:
  - Total events count
  - Total hours scheduled
  - Average events/hours per day
  - Busiest day identification
  - Free time calculation
  - Daily breakdown (events per day)
  - Weekly breakdown (events per day of week)
  - Monthly breakdown (events per month)
- **Test Strategy**: Test calculations with sample events, verify accuracy, edge cases (no events, single event, overlapping events)

#### Task 50: Implement hourly statistics calculation

- **Status**: pending
- **Priority**: high
- **Dependencies**: [49]
- **Details**: Implement hourly analysis:
  - Events per hour of day (0-23)
  - Busiest hours identification
  - Quiet hours identification
  - Average duration per hour
  - Peak activity time windows
- **Test Strategy**: Test hourly distribution, verify hour calculations, edge cases (midnight crossover, all-day events)

#### Task 51: Implement work time tracking and categorization

- **Status**: pending
- **Priority**: high
- **Dependencies**: [49]
- **Details**: Implement work time analysis:
  - Event categorization (work/personal/recurring/one-time)
  - Work hours calculation (configurable work hours, default 9-5)
  - Meeting hours vs focus time
  - Work hours by day of week
  - Average work hours per week/month
  - Overtime detection (configurable threshold, default 40h/week)
  - Work-life balance metrics
- **Test Strategy**: Test categorization logic, work hours calculation, overtime detection, balance metrics

#### Task 52: Implement routine insights and pattern detection

- **Status**: pending
- **Priority**: medium
- **Dependencies**: [49, 51]
- **Details**: Implement insights generation:
  - Recurring event pattern detection
  - Most common event types
  - Time slot preferences
  - Day of week preferences
  - Duration patterns
  - Generate actionable insights (e.g., "You have 3 meetings every Monday at 10 AM")
  - Suggest optimizations (e.g., "You have 2 hours of free time on Fridays")
- **Test Strategy**: Test pattern detection accuracy, insight generation quality, edge cases (no patterns, single pattern)

### Phase 2: Performance & Caching (Tasks 53-55)

#### Task 53: Implement statistics caching layer

- **Status**: pending
- **Priority**: medium
- **Dependencies**: [46, 49]
- **Details**: Implement caching:
  - Cache statistics in database (user_schedule_statistics table)
  - Cache common periods (current week, current month)
  - Cache invalidation on new events
  - TTL-based cache expiration
  - Fallback to real-time calculation if cache miss
- **Test Strategy**: Test cache hit/miss scenarios, invalidation logic, TTL expiration, fallback behavior

#### Task 54: Optimize queries for large date ranges

- **Status**: pending
- **Priority**: medium
- **Dependencies**: [48, 53]
- **Details**: Optimize performance:
  - Batch event fetching for large ranges
  - Process events in chunks
  - Use database indexes effectively
  - Implement pagination for event lists
  - Memory-efficient processing
- **Test Strategy**: Test with 1000+ events, measure performance, verify memory usage, test pagination

#### Task 55: Add real-time calculation fallback

- **Status**: pending
- **Priority**: low
- **Dependencies**: [53]
- **Details**: Implement fallback mechanism:
  - Real-time calculation when cache unavailable
  - Progress indicators for long calculations
  - Background job for cache warming
  - Error handling and retry logic
- **Test Strategy**: Test fallback scenarios, error handling, background jobs

### Phase 3: Agent Integration (Tasks 56-58)

#### Task 56: Create agent tool for retrieving statistics

- **Status**: pending
- **Priority**: high
- **Dependencies**: [49, 50, 51]
- **Details**: Create agent tool:
  - Add tool description in toolsDescription.ts
  - Add tool parameters in toolsParameters.ts
  - Add tool execution in toolsExecution.ts
  - Register tool in agentTools.ts
  - Add to orchestrator agent tools
  - Support natural language queries (e.g., "show me my weekly schedule stats")
- **Test Strategy**: Test tool execution, parameter validation, error handling, integration with agent

#### Task 57: Add natural language query support

- **Status**: pending
- **Priority**: medium
- **Dependencies**: [56]
- **Details**: Enhance tool with:
  - Parse natural language queries for date ranges
  - Support queries like "this week", "last month", "current week"
  - Support specific statistics requests (e.g., "work hours", "busiest day")
  - Format responses in natural language
- **Test Strategy**: Test query parsing, date range extraction, response formatting

#### Task 58: Integrate with routine learning system

- **Status**: pending
- **Priority**: low
- **Dependencies**: [52, 56] (and routine learning tasks)
- **Details**: Integration:
  - Use routine learning data for enhanced insights
  - Cross-reference statistics with learned routines
  - Provide proactive insights based on routines
  - Suggest routine optimizations
- **Test Strategy**: Test integration, cross-referencing, proactive insights

### Phase 4: Testing & Documentation (Tasks 59-60)

#### Task 59: Write comprehensive tests for ScheduleStatisticsService

- **Status**: pending
- **Priority**: high
- **Dependencies**: [49, 50, 51, 52]
- **Details**: Create test suite:
  - Unit tests for all calculation methods
  - Integration tests with EventService
  - Edge case tests (no events, single event, overlapping events)
  - Performance tests (1000+ events)
  - Mock Google Calendar API responses
- **Test Strategy**: Achieve 90%+ code coverage, all tests passing, performance benchmarks met

#### Task 60: Create documentation and usage examples

- **Status**: pending
- **Priority**: medium
- **Dependencies**: [56]
- **Details**: Create documentation:
  - API documentation for ScheduleStatisticsService
  - Usage examples for agent tool
  - Performance guidelines
  - Caching strategy documentation
- **Test Strategy**: Verify documentation accuracy, examples work, clarity

## Data Requirements Summary

### Required Data (Available Now):

1. **User ID**: From `user_calendar_tokens` table ✅
2. **Calendar Events**: From Google Calendar API via EventService ✅
   - All event fields: summary, start, end, description, location, attendees, recurrence, etc.
   - Can fetch by date range ✅

### Optional Data (For Enhanced Features):

1. **Calendar Categories**: From `calendar_categories` table (for categorization) ✅
2. **Routines**: From `user_routines` table (once routine learning is implemented) ⏳
3. **User Preferences**: Work hours, timezone (can be stored in conversation_state.metadata) ✅

## Implementation Notes

### Performance Targets:

- Response time < 2 seconds for common queries (current week/month)
- Support date ranges up to 1 year
- Handle 1000+ events efficiently
- Cache hit rate > 80% for common queries

### Key Design Decisions:

1. **Caching is Optional**: Can start without database caching, add later for performance
2. **Real-time First**: Calculate statistics on-demand, cache for performance
3. **Flexible Date Ranges**: Support any date range, optimize common ones
4. **Event Categorization**: Use keyword matching initially, enhance with ML later

### Dependencies on Other Features:

- **Routine Learning**: Can enhance insights but not required for basic statistics
- **Model Router**: Can use appropriate model for insight generation
- **Event Service**: Already exists and provides event fetching ✅
