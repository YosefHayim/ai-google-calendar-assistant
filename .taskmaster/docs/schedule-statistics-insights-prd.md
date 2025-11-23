# Schedule Statistics & Insights Feature - PRD

## Overview
Implement a comprehensive statistics and insights system that analyzes user calendar events to provide fast, accurate insights about routines, schedules, and time patterns. When users ask "give me insights about my routines", the system should return detailed statistics and actionable insights.

## Goals
- Provide fast, accurate statistics on user schedules (weekly, monthly, daily, hourly, job time)
- Enable users to gain insights from their calendar patterns
- Support proactive recommendations based on historical data
- Cache aggregated statistics for performance

## Data Requirements

### Available Data Sources
1. **Calendar Events** (from Google Calendar API via EventRepository):
   - Event ID, summary, description, location
   - Start/end times (dateTime or date for all-day)
   - Duration (calculated from start/end)
   - Attendees (count, emails, response status)
   - Recurrence patterns
   - Status (confirmed, tentative, cancelled)
   - Calendar ID

2. **User Routines** (from user_routines table - being created):
   - Learned patterns and routines
   - Confidence scores
   - Frequency data

3. **Time Metadata** (derived from events):
   - Day of week (0-6, Sunday-Saturday)
   - Hour of day (0-23)
   - Month, year
   - Week number
   - Timezone

### Data Processing Requirements
- Fetch events by date range (can use existing `findByDateRange`)
- Filter out cancelled events
- Handle all-day vs timed events
- Calculate durations
- Extract time patterns
- Aggregate statistics
- Cache results for performance

## Feature Requirements

### 1. Weekly Statistics
- **Events per day**: Count of events for each day of the week
- **Busiest day**: Day with most events
- **Average events per week**: Mean number of events
- **Time distribution**: When events occur during the week
- **Meeting frequency**: How many meetings per week
- **Work hours**: Typical start/end times for work days

### 2. Monthly Statistics
- **Total events**: Count of all events in the month
- **Events by category**: Group by type (meetings, personal, etc.)
- **Peak days**: Days with most events
- **Trends**: Compare to previous months
- **Recurring events**: Count of recurring vs one-time events
- **Cancellation rate**: Percentage of cancelled events

### 3. Daily Statistics
- **Hourly distribution**: Events per hour (0-23)
- **Most active hours**: Peak activity times
- **Average event duration**: Mean duration across all events
- **Event types**: Breakdown by meeting, personal, etc.
- **Free time slots**: Available time periods
- **Busiest time**: Hour with most overlapping events

### 4. Hourly Statistics
- **Activity patterns**: When user is most/least active
- **Peak hours**: Hours with highest event frequency
- **Quiet hours**: Hours with fewest events
- **Meeting density**: Meetings per hour
- **Focus time**: Hours with single events (no overlaps)

### 5. Job Time Statistics
- **Work hours analysis**: Typical work day start/end
- **Meeting frequency**: Meetings per day/week
- **Focus time**: Hours available for deep work
- **Overtime patterns**: Hours worked beyond typical schedule
- **Break patterns**: Time between meetings
- **Work-life balance**: Work vs personal event ratio

### 6. Routine Insights
- **Learned patterns**: Routines detected from calendar
- **Pattern confidence**: How reliable patterns are
- **Schedule optimization**: Suggestions for better time use
- **Goal tracking**: Progress toward user-defined goals
- **Predictions**: Likely upcoming events based on patterns

## Technical Implementation

### Database Schema
Create `user_statistics_cache` table for performance:
```sql
CREATE TABLE user_statistics_cache (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_calendar_tokens(user_id) ON DELETE CASCADE,
  statistic_type TEXT NOT NULL, -- 'weekly', 'monthly', 'daily', 'hourly', 'job_time', 'insights'
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  statistics_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, statistic_type, period_start, period_end)
);

CREATE INDEX idx_statistics_cache_user_type ON user_statistics_cache(user_id, statistic_type);
CREATE INDEX idx_statistics_cache_expires ON user_statistics_cache(expires_at) WHERE expires_at IS NOT NULL;
```

### Service Layer
Create `services/ScheduleStatisticsService.ts`:

**Key Methods:**
- `getWeeklyStatistics(user_id, startDate, endDate)` - Weekly stats
- `getMonthlyStatistics(user_id, year, month)` - Monthly stats
- `getDailyStatistics(user_id, date)` - Daily stats
- `getHourlyStatistics(user_id, startDate, endDate)` - Hourly patterns
- `getJobTimeStatistics(user_id, startDate, endDate)` - Work time analysis
- `getRoutineInsights(user_id)` - Combined insights
- `getCachedStatistics(user_id, type, period)` - Get from cache
- `updateStatisticsCache(user_id, type, period, data)` - Update cache
- `calculateEventCategory(event)` - Categorize events (work/personal/meeting)

### Agent Tools
Add to `ai-agents/agentTools.ts`:
- `get_schedule_statistics` - Get statistics by type and period
- `get_routine_insights` - Get comprehensive routine insights
- `get_time_optimization_suggestions` - Get optimization recommendations

### Performance Optimization
- Cache statistics for 24 hours (daily), 7 days (weekly), 30 days (monthly)
- Use background jobs to pre-calculate common statistics
- Incremental updates when new events are added
- Lazy loading for less common statistics

## User Experience
When user asks "give me insights about my routines":
1. Check cache for recent statistics
2. If cache miss or expired, fetch events and calculate
3. Combine statistics with routine learning data
4. Format as natural language insights
5. Return fast, accurate response

## Success Metrics
- Response time < 2 seconds for cached statistics
- Response time < 5 seconds for calculated statistics
- Accuracy of insights matches user expectations
- Cache hit rate > 80%

