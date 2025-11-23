import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tasksFilePath = path.join(__dirname, '../tasks/tasks.json');

const tasksToAdd = [
  // Phase 1: Foundation & Core Statistics
  {
    id: 46,
    title: "Create database migration for user_schedule_statistics table (Optional - for caching)",
    description: "Create Supabase migration for optional caching table to store aggregated statistics for fast retrieval",
    status: "pending",
    priority: "medium",
    dependencies: [],
    details: "Create migration file for user_schedule_statistics table:\n- id (BIGSERIAL PRIMARY KEY)\n- user_id (UUID, references user_calendar_tokens)\n- period_type (TEXT: 'daily', 'weekly', 'monthly')\n- period_start (DATE)\n- period_end (DATE)\n- statistics (JSONB) - stores aggregated statistics\n- calculated_at (TIMESTAMPTZ)\n- Unique constraint on (user_id, period_type, period_start, period_end)\n- Indexes on user_id, period_type, period_start\n\nNote: This is optional - can start without caching and add later for performance",
    testStrategy: "Verify migration runs successfully, all indexes created, constraints enforced",
  },
  {
    id: 47,
    title: "Create ScheduleStatisticsService with basic structure",
    description: "Create services/ScheduleStatisticsService.ts with class structure and basic method signatures",
    status: "pending",
    priority: "high",
    dependencies: [],
    details: "Create the file services/ScheduleStatisticsService.ts. Define the class structure with a constructor that takes Supabase client, EventService, and logger. Add placeholder methods for:\n- getStatistics(userId, startDate, endDate, options?)\n- getDailyStatistics(userId, date)\n- getWeeklyStatistics(userId, weekStart)\n- getMonthlyStatistics(userId, month)\n- getHourlyStatistics(userId, startDate, endDate)\n- getWorkTimeAnalysis(userId, startDate, endDate)\n- getRoutineInsights(userId, startDate, endDate)\n\nAdd TypeScript interfaces for all statistics types (ScheduleStatistics, DailyStatistics, WeeklyStatistics, etc.)",
    testStrategy: "Verify file creation, class definition, method signatures compile",
  },
  {
    id: 48,
    title: "Implement event fetching and date range filtering",
    description: "Implement methods to fetch events from Google Calendar API and filter by date range",
    status: "pending",
    priority: "high",
    dependencies: [47],
    details: "Implement methods to:\n- Fetch events from Google Calendar API via EventService\n- Filter events by date range (startDate, endDate)\n- Handle timezone conversions\n- Filter out cancelled events\n- Support multiple calendars per user\n- Cache event data in memory for calculations\n- Handle pagination for large event lists",
    testStrategy: "Test event fetching for various date ranges, timezone handling, cancelled event filtering, multiple calendars",
  },
  {
    id: 49,
    title: "Implement basic statistics calculation (daily, weekly, monthly)",
    description: "Implement calculation methods for total events, hours, averages, and breakdowns",
    status: "pending",
    priority: "high",
    dependencies: [48],
    details: "Implement calculation methods for:\n- Total events count\n- Total hours scheduled (calculate from event start/end times)\n- Average events/hours per day\n- Busiest day identification\n- Free time calculation (24 hours - scheduled hours)\n- Daily breakdown (events per day)\n- Weekly breakdown (events per day of week: Monday-Sunday)\n- Monthly breakdown (events per month)\n- Handle edge cases: no events, single event, overlapping events, all-day events",
    testStrategy: "Test calculations with sample events, verify accuracy, edge cases (no events, single event, overlapping events, all-day events)",
  },
  {
    id: 50,
    title: "Implement hourly statistics calculation",
    description: "Implement hourly analysis including events per hour, busiest hours, and peak activity times",
    status: "pending",
    priority: "high",
    dependencies: [49],
    details: "Implement hourly analysis:\n- Events per hour of day (0-23)\n- Busiest hours identification (top 3-5 hours)\n- Quiet hours identification (hours with fewest events)\n- Average duration per hour\n- Peak activity time windows (consecutive busy hours)\n- Handle midnight crossover events\n- Handle all-day events (distribute across all hours or exclude)",
    testStrategy: "Test hourly distribution, verify hour calculations, edge cases (midnight crossover, all-day events, no events in certain hours)",
  },
  {
    id: 51,
    title: "Implement work time tracking and categorization",
    description: "Implement work time analysis including event categorization, work hours calculation, and work-life balance metrics",
    status: "pending",
    priority: "high",
    dependencies: [49],
    details: "Implement work time analysis:\n- Event categorization (work/personal/recurring/one-time)\n  - Work events: keywords in summary/description (meeting, call, work, project), calendar name, attendees\n  - Personal events: personal keywords, family, personal calendar\n  - Recurring events: detect from recurrence field\n  - One-time events: non-recurring, ad-hoc\n- Work hours calculation (configurable work hours, default 9-5)\n- Meeting hours vs focus time (meetings vs other work events)\n- Work hours by day of week\n- Average work hours per week/month\n- Overtime detection (configurable threshold, default 40h/week)\n- Work-life balance metrics (work hours vs personal hours ratio)",
    testStrategy: "Test categorization logic (accuracy > 80%), work hours calculation, overtime detection, balance metrics, edge cases",
  },
  {
    id: 52,
    title: "Implement routine insights and pattern detection",
    description: "Implement insights generation including recurring patterns, preferences, and actionable suggestions",
    status: "pending",
    priority: "medium",
    dependencies: [49, 51],
    details: "Implement insights generation:\n- Recurring event pattern detection (same event at same time/day)\n- Most common event types (by summary keywords)\n- Time slot preferences (favorite hours for events)\n- Day of week preferences (favorite days)\n- Duration patterns (average event duration, common durations)\n- Generate actionable insights (e.g., 'You have 3 meetings every Monday at 10 AM')\n- Suggest optimizations (e.g., 'You have 2 hours of free time on Fridays')\n- Format insights in natural language",
    testStrategy: "Test pattern detection accuracy (> 85%), insight generation quality, edge cases (no patterns, single pattern, conflicting patterns)",
  },
  // Phase 2: Performance & Caching
  {
    id: 53,
    title: "Implement statistics caching layer",
    description: "Implement caching for statistics to improve response times for common queries",
    status: "pending",
    priority: "medium",
    dependencies: [46, 49],
    details: "Implement caching:\n- Cache statistics in database (user_schedule_statistics table)\n- Cache common periods (current week, current month, last 7 days, last 30 days)\n- Cache invalidation on new events (detect via webhook or manual trigger)\n- TTL-based cache expiration (default 1 hour for daily, 6 hours for weekly, 24 hours for monthly)\n- Fallback to real-time calculation if cache miss\n- Cache key format: user_id:period_type:period_start:period_end",
    testStrategy: "Test cache hit/miss scenarios, invalidation logic, TTL expiration, fallback behavior, cache performance",
  },
  {
    id: 54,
    title: "Optimize queries for large date ranges",
    description: "Optimize performance for processing large numbers of events and long date ranges",
    status: "pending",
    priority: "medium",
    dependencies: [48, 53],
    details: "Optimize performance:\n- Batch event fetching for large ranges (fetch in 30-day chunks)\n- Process events in chunks (100-200 events at a time)\n- Use database indexes effectively (if using database caching)\n- Implement pagination for event lists\n- Memory-efficient processing (stream processing, avoid loading all events)\n- Parallel processing for independent calculations\n- Early exit for simple queries",
    testStrategy: "Test with 1000+ events, measure performance (< 5 seconds for 1000 events), verify memory usage (< 100MB), test pagination",
  },
  {
    id: 55,
    title: "Add real-time calculation fallback",
    description: "Implement fallback mechanism for when cache is unavailable or for custom date ranges",
    status: "pending",
    priority: "low",
    dependencies: [53],
    details: "Implement fallback mechanism:\n- Real-time calculation when cache unavailable\n- Progress indicators for long calculations (if async)\n- Background job for cache warming (pre-calculate common periods)\n- Error handling and retry logic\n- Timeout handling (max 30 seconds for calculation)\n- Graceful degradation (return partial results if timeout)",
    testStrategy: "Test fallback scenarios, error handling, background jobs, timeout behavior, graceful degradation",
  },
  // Phase 3: Agent Integration
  {
    id: 56,
    title: "Create agent tool for retrieving statistics",
    description: "Create agent tool that allows the orchestrator to retrieve schedule statistics",
    status: "pending",
    priority: "high",
    dependencies: [49, 50, 51],
    details: "Create agent tool:\n- Add tool description in ai-agents/toolsDescription.ts\n- Add tool parameters in ai-agents/toolsParameters.ts (email, chatId, startDate?, endDate?, periodType?, statisticsType?)\n- Add tool execution in ai-agents/toolsExecution.ts (call ScheduleStatisticsService)\n- Register tool in ai-agents/agentTools.ts\n- Add to orchestrator agent tools in ai-agents/agents.ts\n- Support natural language queries (e.g., 'show me my weekly schedule stats')\n- Format response in natural language for user",
    testStrategy: "Test tool execution, parameter validation, error handling, integration with agent, response formatting",
  },
  {
    id: 57,
    title: "Add natural language query support",
    description: "Enhance tool with natural language query parsing for date ranges and statistics types",
    status: "pending",
    priority: "medium",
    dependencies: [56],
    details: "Enhance tool with:\n- Parse natural language queries for date ranges ('this week', 'last month', 'current week', 'next week', 'yesterday', 'today')\n- Support specific statistics requests (e.g., 'work hours', 'busiest day', 'weekly breakdown')\n- Format responses in natural language (not just raw data)\n- Support follow-up questions (e.g., 'what about last week?')\n- Context-aware date parsing (use conversation context for relative dates)",
    testStrategy: "Test query parsing accuracy (> 90%), date range extraction, response formatting, follow-up questions, context awareness",
  },
  {
    id: 58,
    title: "Integrate with routine learning system",
    description: "Integrate schedule statistics with routine learning for enhanced insights",
    status: "pending",
    priority: "low",
    dependencies: [52, 56], // Also depends on routine learning tasks (8-16)
    details: "Integration:\n- Use routine learning data (from user_routines table) for enhanced insights\n- Cross-reference statistics with learned routines\n- Provide proactive insights based on routines (e.g., 'Your routine shows you work 45h/week, but this week you worked 50h')\n- Suggest routine optimizations based on statistics\n- Combine pattern detection from both systems",
    testStrategy: "Test integration, cross-referencing, proactive insights, optimization suggestions, combined pattern detection",
  },
  // Phase 4: Testing & Documentation
  {
    id: 59,
    title: "Write comprehensive tests for ScheduleStatisticsService",
    description: "Create comprehensive test suite covering all calculation methods and edge cases",
    status: "pending",
    priority: "high",
    dependencies: [49, 50, 51, 52],
    details: "Create test suite:\n- Unit tests for all calculation methods (daily, weekly, monthly, hourly, work time, insights)\n- Integration tests with EventService (mock Google Calendar API)\n- Edge case tests (no events, single event, overlapping events, all-day events, midnight crossover)\n- Performance tests (1000+ events, large date ranges)\n- Mock Google Calendar API responses\n- Test accuracy of calculations (compare with manual calculations)\n- Test error handling and edge cases",
    testStrategy: "Achieve 90%+ code coverage, all tests passing, performance benchmarks met (< 2s for common queries, < 5s for 1000 events)",
  },
  {
    id: 60,
    title: "Create documentation and usage examples",
    description: "Create comprehensive documentation for the schedule statistics feature",
    status: "pending",
    priority: "medium",
    dependencies: [56],
    details: "Create documentation:\n- API documentation for ScheduleStatisticsService (JSDoc comments)\n- Usage examples for agent tool\n- Performance guidelines and best practices\n- Caching strategy documentation\n- Data requirements and assumptions\n- Example queries and responses\n- Troubleshooting guide",
    testStrategy: "Verify documentation accuracy, examples work, clarity, completeness",
  },
];

try {
  const data = readFileSync(tasksFilePath, 'utf8');
  const tasksJson = JSON.parse(data);

  // Check for existing tasks to avoid duplicates
  const existingIds = new Set(tasksJson.tags.master.tasks.map(task => task.id));
  
  const newTasks = tasksToAdd.filter(task => !existingIds.has(task.id));
  
  if (newTasks.length === 0) {
    console.log('✅ All tasks already exist in tasks.json');
    process.exit(0);
  }

  // Add new tasks
  newTasks.forEach(task => {
    tasksJson.tags.master.tasks.push(task);
  });

  // Sort tasks by ID
  tasksJson.tags.master.tasks.sort((a, b) => a.id - b.id);

  writeFileSync(tasksFilePath, JSON.stringify(tasksJson, null, 2), 'utf8');
  console.log(`✅ Successfully added ${newTasks.length} tasks to tasks.json`);
  console.log(`📋 Total tasks: ${tasksJson.tags.master.tasks.length}`);
  console.log(`🆔 New task IDs: ${newTasks.map(t => t.id).join(', ')}`);
  console.log(`\n📝 Tasks added:`);
  newTasks.forEach(task => {
    console.log(`   ${task.id}. ${task.title}`);
  });
} catch (error) {
  console.error("❌ Failed to add tasks:", error);
  process.exit(1);
}

