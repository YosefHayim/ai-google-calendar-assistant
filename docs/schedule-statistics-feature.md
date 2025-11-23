# Schedule Statistics & Insights Feature

## Overview
Provide users with comprehensive statistics and insights about their calendar schedule, including daily, weekly, monthly, and hourly breakdowns, work time tracking, and routine analysis.

## Goals
- Fast and accurate schedule statistics
- Actionable insights about user routines
- Support for multiple time ranges (daily, weekly, monthly, custom)
- Work time tracking and categorization
- Pattern recognition and routine insights

## Available Data Sources

### From Google Calendar Events:
- **Event Details**: summary, description, location
- **Time Data**: start/end (dateTime, date, timeZone)
- **Duration**: Calculated from start/end times
- **Metadata**: attendees, recurrence (RRULE), reminders, status, visibility
- **Timestamps**: createdAt, updatedAt

### From Database:
- **User ID**: From `user_calendar_tokens`
- **Calendar Categories**: From `calendar_categories` (if available)
- **Routines**: From `user_routines` (once routine learning is implemented)

## Feature Requirements

### 1. Statistics Calculation

#### Daily Statistics
- Total events per day
- Total hours scheduled per day
- Busiest day of the week
- Average events per day
- Free time analysis
- Event distribution by hour

#### Weekly Statistics
- Events per day of week (Monday-Sunday)
- Total hours per day of week
- Busiest weekday
- Average weekly hours
- Weekly trends (increasing/decreasing)
- Work vs personal time breakdown

#### Monthly Statistics
- Total events per month
- Total hours per month
- Monthly trends (growth/decline)
- Average events per month
- Busiest month
- Year-over-year comparison

#### Hourly Statistics
- Events per hour of day (0-23)
- Busiest hours
- Work hours analysis (9-5, custom)
- Peak activity times
- Quiet hours identification

### 2. Work Time Tracking

#### Job Time Analysis
- Total work hours per period
- Meeting hours vs focus time
- Work hours by day of week
- Average work hours per week/month
- Overtime detection
- Work-life balance metrics

#### Event Categorization
- **Work Events**: Meetings, calls, work tasks
  - Detection: keywords in summary/description, calendar name, attendees
- **Personal Events**: Personal appointments, family time
- **Recurring Events**: Regular meetings, routines
- **One-time Events**: Ad-hoc meetings, appointments

### 3. Routine Insights

#### Pattern Recognition
- Most common event types
- Recurring event patterns
- Time slot preferences
- Day of week preferences
- Duration patterns

#### Insights Generation
- "You have 3 meetings every Monday at 10 AM"
- "Your busiest day is Wednesday with 8 hours"
- "You work an average of 45 hours per week"
- "Your most productive hours are 9-11 AM"
- "You have 2 hours of free time on Fridays"

### 4. Performance Optimization

#### Caching Strategy
- Cache statistics for common time ranges
- Invalidate cache when new events are added
- Store aggregated data in database for fast retrieval
- Support real-time calculation for custom ranges

#### Database Schema (Optional - for caching)
```sql
CREATE TABLE user_schedule_statistics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_calendar_tokens(user_id),
  period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  statistics JSONB NOT NULL, -- Aggregated statistics
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_type, period_start, period_end)
);
```

## Implementation Approach

### Phase 1: Core Statistics Service
1. Create `ScheduleStatisticsService`
2. Implement event fetching and filtering
3. Calculate basic statistics (daily, weekly, monthly, hourly)
4. Add work time tracking

### Phase 2: Insights & Analysis
1. Implement routine pattern detection
2. Generate actionable insights
3. Add event categorization
4. Create comparison features (week-over-week, month-over-month)

### Phase 3: Performance & Caching
1. Implement caching layer
2. Add database storage for aggregated statistics
3. Optimize queries for large date ranges
4. Add real-time calculation fallback

### Phase 4: Agent Integration
1. Create agent tool for retrieving statistics
2. Add natural language query support
3. Integrate with routine learning system
4. Add proactive insights in conversations

## API Design

### Service Interface
```typescript
interface ScheduleStatisticsService {
  // Get statistics for a time range
  getStatistics(
    userId: string,
    startDate: Date,
    endDate: Date,
    options?: StatisticsOptions
  ): Promise<ScheduleStatistics>;

  // Get daily breakdown
  getDailyStatistics(
    userId: string,
    date: Date
  ): Promise<DailyStatistics>;

  // Get weekly breakdown
  getWeeklyStatistics(
    userId: string,
    weekStart: Date
  ): Promise<WeeklyStatistics>;

  // Get monthly breakdown
  getMonthlyStatistics(
    userId: string,
    month: Date
  ): Promise<MonthlyStatistics>;

  // Get hourly breakdown
  getHourlyStatistics(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<HourlyStatistics>;

  // Get work time analysis
  getWorkTimeAnalysis(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WorkTimeAnalysis>;

  // Get routine insights
  getRoutineInsights(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RoutineInsights>;
}
```

### Statistics Types
```typescript
interface ScheduleStatistics {
  totalEvents: number;
  totalHours: number;
  averageEventsPerDay: number;
  averageHoursPerDay: number;
  busiestDay: { date: Date; events: number; hours: number };
  freeTime: { totalHours: number; averagePerDay: number };
  eventDistribution: {
    work: number;
    personal: number;
    recurring: number;
    oneTime: number;
  };
}

interface DailyStatistics extends ScheduleStatistics {
  date: Date;
  events: EventSummary[];
  hourlyBreakdown: HourlyBreakdown[];
}

interface WeeklyStatistics extends ScheduleStatistics {
  weekStart: Date;
  weekEnd: Date;
  dailyBreakdown: DailyBreakdown[];
  trends: TrendAnalysis;
}

interface MonthlyStatistics extends ScheduleStatistics {
  month: Date;
  weeklyBreakdown: WeeklyBreakdown[];
  trends: TrendAnalysis;
}

interface HourlyStatistics {
  hourlyDistribution: Array<{
    hour: number; // 0-23
    eventCount: number;
    totalHours: number;
    averageDuration: number;
  }>;
  busiestHours: number[];
  quietHours: number[];
  workHours: {
    start: number;
    end: number;
    totalHours: number;
    events: number;
  };
}

interface WorkTimeAnalysis {
  totalWorkHours: number;
  meetingHours: number;
  focusTimeHours: number;
  averageWorkHoursPerWeek: number;
  workHoursByDay: Array<{
    day: string;
    hours: number;
    events: number;
  }>;
  overtime: {
    detected: boolean;
    hours: number;
    threshold: number; // e.g., 40 hours/week
  };
  workLifeBalance: {
    workHours: number;
    personalHours: number;
    ratio: number;
  };
}

interface RoutineInsights {
  patterns: Array<{
    type: string;
    description: string;
    frequency: number;
    confidence: number;
  }>;
  recurringEvents: Array<{
    summary: string;
    frequency: string;
    nextOccurrence: Date;
  }>;
  timePreferences: {
    preferredHours: number[];
    preferredDays: string[];
    averageDuration: number;
  };
  suggestions: string[];
}
```

## Data Requirements

### Required Data
1. **User ID**: From `user_calendar_tokens`
2. **Calendar Events**: Fetched from Google Calendar API
   - Date range: Configurable (default: last 30 days for insights, custom for statistics)
   - Fields: All event fields (summary, start, end, description, location, attendees, etc.)

### Optional Data (for enhanced insights)
1. **Calendar Categories**: From `calendar_categories` table
2. **Routines**: From `user_routines` table (once implemented)
3. **User Preferences**: Work hours, timezone, etc.

## Performance Considerations

### For Fast Response Times:
1. **Caching**: Cache statistics for common periods (current week, current month)
2. **Aggregation**: Pre-calculate daily/weekly/monthly aggregates
3. **Lazy Loading**: Calculate insights on-demand, cache results
4. **Batch Processing**: Process events in batches for large date ranges
5. **Database Storage**: Store aggregated statistics in database for instant retrieval

### Query Optimization:
1. Use date range filters in Google Calendar API
2. Limit event fetching to necessary fields
3. Process events in memory for calculations
4. Use indexes on date fields if storing in database

## Success Metrics
- Response time < 2 seconds for common queries
- Accurate statistics within 1% margin
- Support for date ranges up to 1 year
- Handle 1000+ events efficiently
- Generate actionable insights 90% of the time

