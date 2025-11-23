import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tasksPath = join(__dirname, '../tasks/tasks.json');

// Read current tasks
const tasksData = JSON.parse(readFileSync(tasksPath, 'utf-8'));
const currentTasks = tasksData.tags.master.tasks;
const lastId = currentTasks.length > 0 ? Math.max(...currentTasks.map(t => t.id)) : 0;

// Define new tasks (starting from ID 8, since we have 7 existing tasks)
const newTasks = [
  // ROUTINE LEARNING - Phase 1: Foundation
  {
    id: 8,
    title: "Create database migration for user_routines table",
    description: "Create Supabase migration for user_routines table with all required fields, indexes, and constraints",
    status: "pending",
    priority: "high",
    dependencies: [],
    details: "Create migration file for user_routines table:\n- id (BIGSERIAL PRIMARY KEY)\n- user_id (UUID, references user_calendar_tokens)\n- routine_type (TEXT: 'daily', 'weekly', 'monthly', 'event_pattern', 'time_slot')\n- pattern_data (JSONB)\n- confidence_score (DECIMAL 0.0-1.0)\n- frequency (INTEGER)\n- last_observed_at (TIMESTAMPTZ)\n- created_at, updated_at (TIMESTAMPTZ)\n- metadata (JSONB)\n- Unique constraint on (user_id, routine_type, pattern_data->>'key')\n- Indexes on user_id, routine_type, updated_at",
    testStrategy: "Verify migration runs successfully, all indexes created, constraints enforced",
    subtasks: []
  },
  {
    id: 9,
    title: "Create RoutineLearningService with basic structure",
    description: "Create services/RoutineLearningService.ts with class structure and basic methods",
    status: "pending",
    priority: "high",
    dependencies: [8],
    details: "Create RoutineLearningService class:\n- Import Supabase client\n- Add Logger\n- Create constructor with client and logger\n- Add placeholder methods: analyzeEventPatterns, learnRoutine, getUserRoutine, predictUpcomingEvents, suggestOptimalTime, getTimeOptimizationSuggestions, updateRoutineConfidence",
    testStrategy: "Service instantiates correctly, all methods exist",
    subtasks: []
  },
  {
    id: 10,
    title: "Implement method to fetch and analyze past events",
    description: "Add method to RoutineLearningService to fetch calendar events and prepare for pattern analysis",
    status: "pending",
    priority: "high",
    dependencies: [9],
    details: "Implement method to:\n- Fetch events from Google Calendar API for a given user and time range\n- Filter and prepare events for pattern analysis\n- Handle pagination for large event sets\n- Return structured event data",
    testStrategy: "Fetches events correctly, handles pagination, returns structured data",
    subtasks: []
  },
  {
    id: 11,
    title: "Implement basic pattern detection (recurring events, time patterns)",
    description: "Implement algorithm to detect recurring events and time-based patterns from calendar data",
    status: "pending",
    priority: "high",
    dependencies: [10],
    details: "Implement pattern detection:\n- Group events by summary/title\n- Analyze time patterns (hour, day of week)\n- Calculate frequency and consistency\n- Identify recurring patterns\n- Calculate confidence scores\n- Store patterns in user_routines table",
    testStrategy: "Detects patterns accurately, stores in database, confidence scores calculated",
    subtasks: []
  },
  
  // ROUTINE LEARNING - Phase 2: Advanced Pattern Learning
  {
    id: 12,
    title: "Implement daily/weekly routine detection",
    description: "Add logic to detect daily and weekly routine patterns from user calendar",
    status: "pending",
    priority: "medium",
    dependencies: [11],
    details: "Implement:\n- Daily routine detection (same time each day)\n- Weekly routine detection (same day/time each week)\n- Pattern confidence calculation\n- Store routines with appropriate routine_type",
    testStrategy: "Correctly identifies daily/weekly routines, stores with correct type",
    subtasks: []
  },
  {
    id: 13,
    title: "Implement time slot availability analysis",
    description: "Analyze user calendar to identify free time slots and availability patterns",
    status: "pending",
    priority: "medium",
    dependencies: [11],
    details: "Implement:\n- Analyze calendar for free time slots\n- Calculate availability percentage by time of day\n- Identify typical free time patterns\n- Store time slot patterns in user_routines",
    testStrategy: "Identifies free time patterns correctly, calculates availability accurately",
    subtasks: []
  },
  {
    id: 14,
    title: "Implement event relationship detection",
    description: "Detect relationships between events (e.g., event A often followed by event B)",
    status: "pending",
    priority: "medium",
    dependencies: [11],
    details: "Implement:\n- Analyze event sequences\n- Detect common event pairs/sequences\n- Calculate relationship strength\n- Store event relationship patterns",
    testStrategy: "Identifies event relationships accurately, calculates relationship strength",
    subtasks: []
  },
  {
    id: 15,
    title: "Add confidence scoring system",
    description: "Implement confidence scoring algorithm for pattern accuracy",
    status: "pending",
    priority: "medium",
    dependencies: [12, 13, 14],
    details: "Implement:\n- Confidence calculation based on frequency and consistency\n- Update confidence scores as patterns are validated\n- Threshold system for pattern reliability\n- Methods to update confidence based on user feedback",
    testStrategy: "Confidence scores reflect pattern accuracy, updates correctly",
    subtasks: []
  },
  {
    id: 16,
    title: "Create background job to periodically analyze events",
    description: "Set up background job/cron to periodically analyze user calendars and update routines",
    status: "pending",
    priority: "low",
    dependencies: [15],
    details: "Implement:\n- Background job scheduler (cron or similar)\n- Periodic analysis of user calendars\n- Update routines based on new events\n- Handle errors and retries",
    testStrategy: "Job runs on schedule, updates routines correctly, handles errors",
    subtasks: []
  },
  
  // MODEL ROUTER - Phase 1: Foundation
  {
    id: 17,
    title: "Create ModelRouterService with task analysis",
    description: "Create services/ModelRouterService.ts with task analysis and model selection logic",
    status: "pending",
    priority: "high",
    dependencies: [],
    details: "Create ModelRouterService class:\n- analyzeTask(prompt, context) method\n- selectModel(analysis, agentType) method\n- getAgentWithModel(agentType, model) method\n- Agent caching mechanism (Map<string, Agent>)\n- Task analysis returns: complexity, type, requiresReasoning, estimatedTokens",
    testStrategy: "Service analyzes tasks correctly, returns proper analysis structure",
    subtasks: []
  },
  {
    id: 18,
    title: "Implement model selection logic",
    description: "Implement decision matrix for selecting appropriate model based on task analysis",
    status: "pending",
    priority: "high",
    dependencies: [17],
    details: "Implement model selection:\n- Simple calendar tasks → GPT_5_MINI\n- Complex calendar tasks → GPT_5\n- Complex reasoning → O3 or O1_PRO\n- General conversation → GPT_5_CHAT\n- Cost-sensitive → MINI variants",
    testStrategy: "Correct model selected for different task types and complexities",
    subtasks: []
  },
  {
    id: 19,
    title: "Add agent caching mechanism",
    description: "Implement caching system to store agent instances by (agentType, model) key",
    status: "pending",
    priority: "medium",
    dependencies: [17],
    details: "Implement:\n- Map-based cache for agents\n- Cache key: `${agentType}:${model}`\n- Cache retrieval and storage\n- Cache invalidation strategy",
    testStrategy: "Caching works correctly, improves performance, handles cache misses",
    subtasks: []
  },
  {
    id: 20,
    title: "Enhance activateAgent to support model routing",
    description: "Modify activateAgent utility to accept optional model routing options",
    status: "pending",
    priority: "high",
    dependencies: [18, 19],
    details: "Enhance activateAgent:\n- Accept optional options: { model?: MODELS, autoRoute?: boolean }\n- Support automatic routing when autoRoute: true\n- Support manual model override\n- Maintain backward compatibility",
    testStrategy: "Routing works correctly, backward compatibility maintained, options respected",
    subtasks: []
  },
  {
    id: 21,
    title: "Add autoRoute option (default: false for backward compatibility)",
    description: "Add autoRoute flag to activateAgent with default false to maintain backward compatibility",
    status: "pending",
    priority: "medium",
    dependencies: [20],
    details: "Ensure:\n- Default behavior unchanged (uses CURRENT_MODEL)\n- autoRoute: false by default\n- Existing code continues to work without changes",
    testStrategy: "Default behavior unchanged, existing code works, autoRoute can be enabled",
    subtasks: []
  },
  
  // MODEL ROUTER - Phase 2: Routing Logic
  {
    id: 22,
    title: "Implement complexity analysis",
    description: "Implement algorithm to analyze task complexity (simple, medium, complex)",
    status: "pending",
    priority: "high",
    dependencies: [17],
    details: "Implement:\n- Simple: < 50 words, single action, clear intent\n- Medium: 50-200 words, multiple steps, some context needed\n- Complex: > 200 words, multi-step reasoning, ambiguous intent\n- Word count analysis\n- Intent clarity detection",
    testStrategy: "Complexity detected accurately for different task types",
    subtasks: []
  },
  {
    id: 23,
    title: "Add task type detection",
    description: "Implement detection for different task types (calendar, conversation, reasoning)",
    status: "pending",
    priority: "high",
    dependencies: [17],
    details: "Implement detection for:\n- Calendar operations\n- General conversation\n- Complex reasoning tasks\n- Cost-sensitive operations\n- Use keyword analysis and context",
    testStrategy: "Task types detected correctly for various inputs",
    subtasks: []
  },
  {
    id: 24,
    title: "Create decision matrix for model selection",
    description: "Create comprehensive decision matrix mapping task characteristics to models",
    status: "pending",
    priority: "high",
    dependencies: [22, 23],
    details: "Create matrix:\n- Map (taskType, complexity) → model\n- Include fallback models\n- Consider cost constraints\n- Consider latency requirements",
    testStrategy: "Matrix selects appropriate models for all combinations",
    subtasks: []
  },
  {
    id: 25,
    title: "Add cost/latency considerations",
    description: "Add logic to consider cost and latency when selecting models",
    status: "pending",
    priority: "medium",
    dependencies: [24],
    details: "Implement:\n- Cost estimation per model\n- Latency estimation\n- User/org cost limits\n- Balance cost vs performance",
    testStrategy: "Cost and latency considered appropriately, balances correctly",
    subtasks: []
  },
  {
    id: 26,
    title: "Update Telegram bot to enable auto-routing",
    description: "Update telegram-bot/init-bot.ts to enable auto-routing option",
    status: "pending",
    priority: "medium",
    dependencies: [20],
    details: "Update:\n- Add autoRoute option to activateAgent call\n- Make it configurable (env var or config)\n- Add logging for routing decisions",
    testStrategy: "Auto-routing enabled, works correctly, logging functional",
    subtasks: []
  },
  
  // ROUTINE LEARNING - Phase 3: Proactive Features
  {
    id: 27,
    title: "Implement event prediction based on patterns",
    description: "Implement prediction of upcoming events based on learned patterns",
    status: "pending",
    priority: "high",
    dependencies: [15],
    details: "Implement:\n- Get routines with confidence > threshold\n- Calculate next occurrence based on pattern\n- Check if event already exists in calendar\n- Return predictions with confidence scores",
    testStrategy: "Predictions are accurate, confidence scores appropriate, checks existing events",
    subtasks: []
  },
  {
    id: 28,
    title: "Create reminder system for predicted events",
    description: "Create system to proactively remind users about predicted events",
    status: "pending",
    priority: "medium",
    dependencies: [27],
    details: "Implement:\n- Check for predicted events\n- Send reminders via Telegram\n- Allow users to confirm/deny predictions\n- Update pattern confidence based on feedback",
    testStrategy: "Reminders sent correctly, user can confirm/deny, confidence updates",
    subtasks: []
  },
  {
    id: 29,
    title: "Implement time optimization suggestions",
    description: "Implement suggestions for optimal time slots when scheduling events",
    status: "pending",
    priority: "medium",
    dependencies: [13],
    details: "Implement:\n- Analyze free time slots from routines\n- Consider user's typical schedule\n- Avoid conflicts with existing events\n- Respect preferred time if provided\n- Return ranked suggestions",
    testStrategy: "Suggestions are helpful and accurate, avoids conflicts, respects preferences",
    subtasks: []
  },
  {
    id: 30,
    title: "Add conflict detection and warnings",
    description: "Add system to detect scheduling conflicts and warn users",
    status: "pending",
    priority: "low",
    dependencies: [29],
    details: "Implement:\n- Check for conflicts when suggesting times\n- Warn about potential conflicts\n- Suggest alternative times",
    testStrategy: "Conflicts detected correctly, warnings appropriate, alternatives suggested",
    subtasks: []
  },
  
  // ROUTINE LEARNING - Phase 4: Goal Tracking
  {
    id: 31,
    title: "Add goal storage in user_routines.metadata",
    description: "Implement storage of user goals in user_routines metadata field",
    status: "pending",
    priority: "medium",
    dependencies: [8],
    details: "Implement:\n- Store goals in metadata JSONB field\n- Goal structure: { type, target, current, deadline }\n- Methods to set/update goals",
    testStrategy: "Goals stored and retrieved correctly, structure validated",
    subtasks: []
  },
  {
    id: 32,
    title: "Implement goal progress tracking",
    description: "Implement tracking of progress toward user goals",
    status: "pending",
    priority: "medium",
    dependencies: [31],
    details: "Implement:\n- Calculate progress based on calendar events\n- Update progress regularly\n- Store progress in metadata",
    testStrategy: "Progress calculated accurately, updates correctly",
    subtasks: []
  },
  {
    id: 33,
    title: "Create suggestions based on goals",
    description: "Create system to suggest actions based on user goals",
    status: "pending",
    priority: "medium",
    dependencies: [32],
    details: "Implement:\n- Analyze goals and current progress\n- Suggest calendar events to reach goals\n- Provide actionable recommendations",
    testStrategy: "Suggestions are relevant and helpful, actionable",
    subtasks: []
  },
  {
    id: 34,
    title: "Add goal achievement notifications",
    description: "Add notifications when users achieve their goals",
    status: "pending",
    priority: "low",
    dependencies: [33],
    details: "Implement:\n- Detect goal achievement\n- Send congratulatory messages\n- Suggest new goals",
    testStrategy: "Achievements detected correctly, notifications sent",
    subtasks: []
  },
  
  // ROUTINE LEARNING - Phase 5: Agent Integration
  {
    id: 35,
    title: "Add routine tools to orchestrator",
    description: "Add routine learning tools to orchestrator agent tools list",
    status: "pending",
    priority: "high",
    dependencies: [15],
    details: "Add tools:\n- get_user_routines\n- get_upcoming_predictions\n- suggest_optimal_time\n- get_routine_insights\n- set_user_goal\n- get_goal_progress",
    testStrategy: "Tools accessible and functional, integrated correctly",
    subtasks: []
  },
  {
    id: 36,
    title: "Update orchestrator instructions for proactive behavior",
    description: "Update orchestrator agent instructions to proactively use routine insights",
    status: "pending",
    priority: "high",
    dependencies: [35],
    details: "Update instructions:\n- Proactively remind users about predicted events\n- Suggest time optimizations when creating events\n- Reference learned routines in conversations\n- Help users achieve their goals",
    testStrategy: "Agent uses routines proactively, instructions followed",
    subtasks: []
  },
  {
    id: 37,
    title: "Implement routine-based reminders in conversations",
    description: "Implement proactive reminders in agent conversations based on routines",
    status: "pending",
    priority: "medium",
    dependencies: [36],
    details: "Implement:\n- Check for predicted events in conversations\n- Proactively mention predicted events\n- Ask users to confirm predictions",
    testStrategy: "Reminders appear appropriately, user can interact",
    subtasks: []
  },
  {
    id: 38,
    title: "Add routine insights to agent responses",
    description: "Enhance agent responses with routine insights and suggestions",
    status: "pending",
    priority: "medium",
    dependencies: [36],
    details: "Enhance responses:\n- Include routine insights in relevant contexts\n- Suggest optimizations\n- Reference patterns when helpful",
    testStrategy: "Insights enhance responses, relevant and helpful",
    subtasks: []
  },
  
  // OPTIMIZATION - Both Features
  {
    id: 39,
    title: "Add routing metrics/logging (Model Router)",
    description: "Add metrics and logging for model routing decisions",
    status: "pending",
    priority: "low",
    dependencies: [20],
    details: "Implement:\n- Log routing decisions\n- Track model performance\n- Monitor routing accuracy\n- Add metrics dashboard",
    testStrategy: "Metrics collected correctly, logging functional",
    subtasks: []
  },
  {
    id: 40,
    title: "Optimize caching strategy (Model Router)",
    description: "Optimize agent caching based on usage patterns",
    status: "pending",
    priority: "low",
    dependencies: [19],
    details: "Optimize:\n- Cache eviction strategy\n- Cache size limits\n- Performance monitoring",
    testStrategy: "Cache performs well, eviction works correctly",
    subtasks: []
  },
  {
    id: 41,
    title: "Fine-tune routing decisions based on usage (Model Router)",
    description: "Improve routing decisions based on collected metrics",
    status: "pending",
    priority: "low",
    dependencies: [39],
    details: "Improve:\n- Analyze routing accuracy\n- Adjust decision matrix\n- A/B test routing strategies",
    testStrategy: "Routing accuracy improves, decisions optimized",
    subtasks: []
  },
  {
    id: 42,
    title: "Test pattern detection accuracy (Routine Learning)",
    description: "Test and validate pattern detection accuracy",
    status: "pending",
    priority: "medium",
    dependencies: [15],
    details: "Test:\n- Pattern detection accuracy\n- Confidence score accuracy\n- False positive/negative rates",
    testStrategy: "Accuracy meets targets, false rates acceptable",
    subtasks: []
  },
  {
    id: 43,
    title: "Refine confidence scoring (Routine Learning)",
    description: "Refine confidence scoring algorithm based on test results",
    status: "pending",
    priority: "medium",
    dependencies: [42],
    details: "Refine:\n- Adjust confidence calculation\n- Improve accuracy\n- Reduce false positives",
    testStrategy: "Scores more accurate, false positives reduced",
    subtasks: []
  },
  {
    id: 44,
    title: "Optimize performance (Routine Learning)",
    description: "Optimize RoutineLearningService performance",
    status: "pending",
    priority: "low",
    dependencies: [15],
    details: "Optimize:\n- Database queries\n- Pattern detection algorithms\n- Caching strategies",
    testStrategy: "Performance improved, queries optimized",
    subtasks: []
  },
  {
    id: 45,
    title: "Add user feedback mechanism (Routine Learning)",
    description: "Add mechanism for users to provide feedback on predictions and suggestions",
    status: "pending",
    priority: "low",
    dependencies: [28],
    details: "Implement:\n- Feedback collection\n- Update patterns based on feedback\n- Improve accuracy over time",
    testStrategy: "Feedback collected, patterns update, accuracy improves",
    subtasks: []
  }
];

// Add new tasks to existing tasks
tasksData.tags.master.tasks = [...currentTasks, ...newTasks];

// Write back to file
writeFileSync(tasksPath, JSON.stringify(tasksData, null, 2), 'utf-8');

console.log(`✅ Successfully added ${newTasks.length} tasks to tasks.json`);
console.log(`📋 Total tasks: ${tasksData.tags.master.tasks.length}`);
console.log(`🆔 Task IDs: ${newTasks[0].id} - ${newTasks[newTasks.length - 1].id}`);

