# AI Google Calendar Assistant - Complete System Architecture

> **Version**: 1.1.1  
> **Last Updated**: 2024  
> **Architecture Pattern**: Domain-Driven Design (DDD) with Layered Architecture

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Data Flow](#data-flow)
4. [AI Agent System](#ai-agent-system)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [Services Architecture](#services-architecture)
8. [External Integrations](#external-integrations)
9. [Deployment & Infrastructure](#deployment--infrastructure)
10. [Development Workflow](#development-workflow)

---

## System Overview

### Purpose

The AI Google Calendar Assistant is an intelligent, multi-platform personal calendar management system that leverages OpenAI's Agent Framework to provide natural language calendar operations, routine learning, and proactive scheduling capabilities.

### Core Capabilities

- **Natural Language Processing**: Understand and execute calendar operations from conversational input
- **Multi-Agent Orchestration**: Sophisticated agent system with specialized agents for different tasks
- **Routine Learning**: Automatic pattern detection and predictive scheduling
- **Context Management**: Conversation memory with summarization and vector search
- **Multi-Platform Support**: Telegram, WhatsApp, Web, and React Native interfaces
- **Intelligent Model Routing**: Dynamic model selection based on task complexity

### Technology Stack

- **Runtime**: Node.js 18+ with TypeScript 5.9
- **Framework**: Express.js 5.x
- **AI Framework**: OpenAI Agents SDK (`@openai/agents`, `@openai/agents-core`, `@openai/agents-realtime`)
- **Database**: Supabase (PostgreSQL) with vector search capabilities
- **Bot Framework**: Grammy (Telegram)
- **Dependency Injection**: Inversify (IoC container)
- **Validation**: Zod schemas
- **Background Jobs**: node-cron

---

## Architecture Layers

The system follows a **layered, domain-driven architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│  (Telegram Bot, WhatsApp, Web UI, React Native)            │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              API Gateway (Express.js)                       │
│  Routes → Middleware (Auth, Error Handling) → Controllers   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Service Layer                               │
│  Business Logic, AI Integration, Memory Management          │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              AI Agents Layer (OpenAI Agents)                 │
│  Orchestrator → Specialized Agents → Handoff Agents         │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Domain Layer (DDD)                          │
│  Entities, Value Objects, Repository Interfaces, DTOs      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Infrastructure Layer                            │
│  Repository Implementations, External Clients, DI Container│
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              External Services                               │
│  Google Calendar API, Supabase, OpenAI API                  │
└─────────────────────────────────────────────────────────────┘
```

### 1. Client Layer

#### Telegram Bot (`telegram-bot/init-bot.ts`)

- **Framework**: Grammy
- **Features**:
  - Text message processing
  - Voice message support (with transcription)
  - Session management
  - Authentication middleware
  - Typing indicators
  - Error handling

**Key Components**:

- `authTgHandler`: Authentication middleware for Telegram users
- Voice message processing with OpenAI Realtime API
- Conversation context injection
- Agent activation with context

#### WhatsApp Integration (`controllers/whatsappController.ts`)

- **Status**: In Development
- **Features**:
  - Webhook-based messaging
  - Natural language commands
  - Event notifications

#### Web UI (Planned)

- React/Next.js interface
- Real-time calendar synchronization
- Conversational UI

#### React Native App (Planned)

- Native iOS/Android experience
- Offline support
- Push notifications

### 2. API Gateway Layer

#### Express.js Application (`app.ts`)

**Configuration**:

- CORS enabled
- JSON body parsing
- Cookie parser
- Morgan logging
- Static file serving
- Error handling middleware

**Routes**:

- `/api/users` - User authentication and management
- `/api/calendar` - Calendar operations
- `/api/whatsapp` - WhatsApp webhooks

#### Middleware

**Authentication Middleware** (`middlewares/authHandler.ts`):

- JWT token validation
- User session management
- Request authentication

**Error Handler** (`middlewares/errorHandler.ts`):

- Centralized error handling
- Error sanitization
- Status code mapping
- Error logging

### 3. Controller Layer

#### Calendar Controller (`controllers/calendarController.ts`)

**Endpoints**:

- `getAllCalendars` - List all user calendars
- `getCalendarColors` - Get calendar color scheme
- `getCalendarTimezone` - Get user timezone
- `getSpecificEvent` - Retrieve event by ID
- `getAllEvents` - List events with filters
- `calendarOverview` - Get calendar summary

**Responsibilities**:

- Request validation
- Response formatting
- Error handling
- Service orchestration

#### Users Controller (`controllers/usersController.ts`)

**Endpoints**:

- OAuth callback handling
- User registration
- Token management
- Authentication status

#### WhatsApp Controller (`controllers/whatsappController.ts`)

**Endpoints**:

- Webhook verification
- Message processing
- Event notifications

### 4. Service Layer

#### Calendar Service (`services/CalendarService.ts`)

**Responsibilities**:

- Calendar CRUD operations
- Calendar list management
- Calendar metadata operations

#### Event Service (`services/EventService.ts`)

**Responsibilities**:

- Event CRUD operations
- Event validation
- Event formatting
- Date/time normalization

#### Conversation Memory Service (`services/ConversationMemoryService.ts`)

**Key Features**:

- **Sliding Window Approach**: Keeps last 2 messages in full, summarizes older messages
- **Automatic Summarization**: Every 3 messages, creates a summary (~200 tokens)
- **Context Retrieval**: Builds context from recent messages + all summaries
- **State Management**: Tracks message count and conversation state

**Methods**:

- `storeMessage()` - Store user/assistant messages
- `getConversationContext()` - Retrieve formatted context
- `formatContextForPrompt()` - Format context for LLM
- `createSummary()` - Generate conversation summary
- `getConversationState()` - Get conversation metadata

**Database Tables**:

- `conversation_messages` - Full message history
- `conversation_summaries` - Condensed summaries
- `conversation_state` - Conversation metadata

#### Vector Search Service (`services/VectorSearchService.ts`)

**Features**:

- Semantic similarity search
- Embedding generation (OpenAI)
- Similar conversation retrieval
- Top-K search with similarity threshold

**Use Cases**:

- Find similar past conversations
- Context retrieval for agent prompts
- Pattern matching in user queries

#### Routine Learning Service (`services/RoutineLearningService.ts`)

**Capabilities**:

- Pattern detection (daily, weekly, monthly)
- Time slot analysis
- Event relationship mapping
- Confidence scoring
- Goal tracking

**Pattern Types**:

- Recurring events
- Time slot patterns
- Event sequences
- Frequency analysis

#### Schedule Statistics Service (`services/ScheduleStatisticsService.ts`)

**Features**:

- Calendar analytics
- Time distribution analysis
- Event frequency statistics
- Routine insights
- Cross-referenced insights

#### Model Router Service (`services/ModelRouterService.ts`)

**Intelligent Model Selection**:

- Task complexity analysis
- Model capability mapping
- Cost optimization
- Performance optimization
- 47+ model support

**Routing Strategy**:

- Simple queries → GPT-4o-mini (fast, cheap)
- Complex tasks → GPT-4o (powerful, accurate)
- Specialized tasks → Domain-specific models

#### Routine Analysis Job (`services/RoutineAnalysisJob.ts`)

**Background Processing**:

- **Schedule**: Daily at 2 AM (configurable)
- **Lookback Period**: 30 days (configurable)
- **Max Users**: 100 per run (configurable)

**Process**:

1. Get active users with calendar tokens
2. For each user, analyze calendar events
3. Detect patterns and routines
4. Store learned routines in database
5. Update confidence scores

### 5. AI Agents Layer

#### Agent Architecture

The system uses OpenAI's Agent Framework with a multi-agent orchestration pattern:

```
ORCHESTRATOR_AGENT (Main Decision Engine)
    ├── insert_event_handoff_agent
    │   ├── prepare_event_agent
    │   ├── analyses_calendar_type_by_event_agent
    │   └── insert_event_agent
    ├── get_event_agent (Direct)
    ├── update_event_handoff_agent
    │   ├── get_event_agent
    │   └── update_event_agent
    ├── delete_event_handoff_agent
    │   ├── get_event_agent
    │   └── delete_event_agent
    ├── validate_user_auth_agent (Direct)
    ├── generate_user_cb_google_url_agent (Direct)
    └── Quick Response Agent (Fast acknowledgments)
```

#### Base Agents (`ai-agents/agents.ts`)

**Core Agents**:

1. **generateUserCbGoogleUrl** - OAuth URL generation
2. **registerUserViaDb** - User registration
3. **validateUserAuth** - Authentication validation
4. **insertEvent** - Event creation
5. **getEventByIdOrName** - Event retrieval
6. **updateEventByIdOrName** - Event updates
7. **deleteEventByIdOrName** - Event deletion
8. **analysesCalendarTypeByEventInformation** - Calendar selection
9. **prepareEventAgent** - Event preparation (normalization, validation, timezone)

#### Handoff Agents

**insertEventHandOffAgent**:

- Orchestrates event creation workflow
- Calls: `prepare_event` → `calendar_type_by_event_details` → `insert_event`
- Parallel tool calls enabled

**updateEventOrEventsHandOffAgent**:

- Orchestrates event update workflow
- Calls: `get_event` → `update_event`

**deleteEventOrEventsHandOffAgent**:

- Orchestrates event deletion workflow
- Calls: `get_event` → `delete_event`

#### Orchestrator Agent

**Main Decision Engine**:

- Routes user requests to appropriate agents
- Handles intent recognition
- Manages agent delegation
- Provides conversational responses

**Tools Available** (15 tools):

- Event operations (insert, get, update, delete)
- Authentication tools
- Calendar listing
- Agent name management
- Routine learning tools
- Goal tracking
- Schedule statistics

#### Quick Response Agent

**Purpose**: Fast acknowledgment for simple queries

- **Model**: GPT-4o-mini (fast, cheap)
- **No Tools**: Text-only responses
- **Use Case**: Greetings, simple questions, acknowledgments

#### Agent Tools (`ai-agents/toolsExecution.ts`)

**Tool Categories**:

1. **Calendar Operations**:

   - `insert_event` - Create calendar events
   - `get_event` - Retrieve events
   - `update_event` - Update events
   - `delete_event` - Delete events
   - `list_calendars` - List user calendars

2. **Authentication**:

   - `validate_user_db` - Validate user authentication
   - `generate_user_cb_google_url` - OAuth URL generation
   - `register_user_via_db` - User registration

3. **Routine Learning**:

   - `get_user_routines` - Get learned patterns
   - `get_upcoming_predictions` - Predict future events
   - `suggest_optimal_time` - Optimal scheduling suggestions
   - `get_routine_insights` - Schedule pattern analysis

4. **Goal Tracking**:

   - `set_user_goal` - Set user goals
   - `get_goal_progress` - Get goal progress

5. **Statistics**:

   - `get_schedule_statistics` - Calendar analytics

6. **Agent Personalization**:
   - `get_agent_name` - Get personalized agent name
   - `set_agent_name` - Set personalized agent name

#### Agent Instructions (`ai-agents/agentInstructions.ts`)

Each agent has detailed instructions defining:

- Purpose and responsibilities
- Tool usage guidelines
- Output format requirements
- Error handling
- Context usage rules
- Few-shot examples

**Key Instruction Patterns**:

- Clear workflow steps
- Explicit tool calling requirements
- Context awareness rules
- Date/time handling rules
- Calendar selection logic

### 6. Domain Layer (DDD)

#### Entities (`domain/entities/`)

**Event Entity** (`domain/entities/Event.ts`):

- Core calendar event representation
- Immutable value objects
- Business logic validation

**Calendar Entity** (`domain/entities/Calendar.ts`):

- Calendar representation
- Metadata management

**User Entity** (`domain/entities/User.ts`):

- User domain model
- Authentication state

#### Value Objects (`domain/value-objects/`)

**EventDateTime** (`domain/value-objects/EventDateTime.ts`):

- Immutable date/time representation
- Timezone handling
- Date/time operations

#### Repository Interfaces (`domain/repositories/`)

**IEventRepository**:

- `create()` - Create event
- `findById()` - Find by ID
- `findByDateRange()` - Find by date range
- `update()` - Update event
- `delete()` - Delete event

**ICalendarRepository**:

- `findAll()` - List calendars
- `findById()` - Find calendar
- `getTimezone()` - Get timezone

**IUserRepository**:

- `findByEmail()` - Find user
- `create()` - Create user
- `update()` - Update user

#### DTOs (`domain/dto/`)

Data Transfer Objects for API communication:

- `EventDTO` - Event data transfer
- `CalendarDTO` - Calendar data transfer
- `UserDTO` - User data transfer
- `TokenDTO` - Token data transfer

### 7. Infrastructure Layer

#### Repository Implementations (`infrastructure/repositories/`)

**GoogleCalendarEventRepository**:

- Implements `IEventRepository`
- Google Calendar API integration
- Event mapping and transformation

**GoogleCalendarCalendarRepository**:

- Implements `ICalendarRepository`
- Calendar list management
- Metadata operations

**SupabaseUserRepository**:

- Implements `IUserRepository`
- Supabase database operations
- User management

#### Mappers (`infrastructure/repositories/mappers/`)

**EventMapper**:

- Domain ↔ API model conversion
- Date/time formatting
- Field mapping

**CalendarMapper**:

- Calendar model conversion
- Metadata mapping

**UserMapper**:

- User model conversion

#### Clients (`infrastructure/clients/`)

**GoogleCalendarClient**:

- Google Calendar API wrapper
- OAuth token management
- Request/response handling

**EnhancedSupabaseClient**:

- Supabase client wrapper
- Extended functionality
- Connection management

#### Dependency Injection (`infrastructure/di/`)

**Inversify Container**:

- Service registration
- Dependency resolution
- Lifecycle management

**Container Configuration**:

- Repository bindings
- Service bindings
- Client bindings

---

## Data Flow

### 1. User Request Flow (Telegram Bot)

```
User Message (Telegram)
    ↓
Grammy Bot Middleware (authTgHandler)
    ↓
Session Management
    ↓
ConversationMemoryService.storeMessage() [Store user message]
    ↓
ConversationMemoryService.getConversationContext() [Retrieve context]
    ↓
VectorSearchService.searchSimilarConversations() [Find similar past conversations]
    ↓
activateAgent() [Build enhanced prompt with context]
    ↓
ORCHESTRATOR_AGENT [Route to appropriate agent]
    ↓
Specialized Agent (e.g., insertEventHandOffAgent)
    ↓
Agent Tools (e.g., insert_event)
    ↓
Service Layer (e.g., EventService)
    ↓
Repository (e.g., GoogleCalendarEventRepository)
    ↓
Google Calendar API
    ↓
Response flows back through layers
    ↓
ConversationMemoryService.storeMessage() [Store assistant response]
    ↓
User receives response
```

### 2. REST API Request Flow

```
HTTP Request
    ↓
Express Routes
    ↓
Middleware (authHandler, errorHandler)
    ↓
Controller (e.g., calendarController)
    ↓
Service Layer (e.g., CalendarService)
    ↓
Repository Interface
    ↓
Repository Implementation
    ↓
External API / Database
    ↓
Response flows back
    ↓
HTTP Response
```

### 3. Background Job Flow (Routine Analysis)

```
Cron Job (Daily 2 AM)
    ↓
RoutineAnalysisJob.runAnalysis()
    ↓
Get Active Users (with calendar tokens)
    ↓
For Each User:
    ├── RoutineLearningService.analyzeUserRoutines()
    ├── Fetch Events from Google Calendar
    ├── Pattern Detection
    ├── Confidence Scoring
    └── Store in user_routines table
    ↓
Job Complete
```

### 4. Context Building Flow

```
User Message Arrives
    ↓
ConversationMemoryService.getConversationContext()
    ├── Fetch last 2 messages (full text)
    ├── Fetch all summaries (condensed)
    └── Get total message count
    ↓
formatContextForPrompt()
    ├── Format summaries section
    └── Format recent messages section
    ↓
VectorSearchService.searchSimilarConversations()
    ├── Generate embedding for user message
    └── Find top 3 similar conversations
    ↓
Build Enhanced Prompt
    ├── Conversation context
    ├── Vector search results
    ├── Agent name
    ├── User email
    └── Chat ID
    ↓
Send to Agent
```

---

## Database Schema

### Core Tables

#### `user_calendar_tokens`

Stores Google OAuth tokens for each user.

**Schema**:

```sql
- id: SERIAL PRIMARY KEY
- user_id: UUID (references auth.users)
- email: TEXT
- access_token: TEXT
- refresh_token: TEXT
- id_token: TEXT
- token_type: TEXT
- expiry_date: BIGINT
- refresh_token_expires_in: BIGINT
- scope: TEXT
- is_active: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**Indexes**:

- `user_id` index
- `email` index

#### `calendar_categories`

Tracks all calendars accessible to a user.

**Schema**:

```sql
- id: SERIAL PRIMARY KEY
- email: TEXT (references user_calendar_tokens.email)
- calendar_id: TEXT
- calendar_name: TEXT
- access_role: TEXT
- time_zone_of_calendar: TEXT
- calendar_color_for_events: TEXT
- default_reminders: JSONB
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**Indexes**:

- `(email, calendar_id)` unique constraint

#### `conversation_messages`

Stores full conversation history.

**Schema**:

```sql
- id: SERIAL PRIMARY KEY
- user_id: UUID
- chat_id: BIGINT
- message_id: BIGINT
- role: TEXT ('user' | 'assistant' | 'system')
- content: TEXT
- metadata: JSONB
- created_at: TIMESTAMPTZ
```

**Indexes**:

- `(chat_id, message_id)` unique constraint
- `(user_id, chat_id, created_at)` index

#### `conversation_summaries`

Stores condensed conversation summaries.

**Schema**:

```sql
- id: SERIAL PRIMARY KEY
- user_id: UUID
- chat_id: BIGINT
- summary_text: TEXT
- message_count: INTEGER
- first_message_id: BIGINT
- last_message_id: BIGINT
- metadata: JSONB
- created_at: TIMESTAMPTZ
```

**Indexes**:

- `(user_id, chat_id, created_at)` index

#### `conversation_state`

Tracks conversation metadata.

**Schema**:

```sql
- id: SERIAL PRIMARY KEY
- user_id: UUID
- chat_id: BIGINT
- message_count: INTEGER
- last_message_id: BIGINT
- updated_at: TIMESTAMPTZ
```

**Indexes**:

- `(user_id, chat_id)` unique constraint

#### `user_routines`

Stores learned user patterns and routines.

**Schema**:

```sql
- id: SERIAL PRIMARY KEY
- user_id: UUID
- routine_type: TEXT ('daily' | 'weekly' | 'monthly' | 'event_pattern' | 'time_slot')
- pattern_data: JSONB
- confidence_score: DECIMAL(3,2)
- frequency: INTEGER
- last_observed_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**Indexes**:

- `(user_id, routine_type)` index
- `(user_id, confidence_score)` index

#### `user_telegram_links`

Links Telegram users to email accounts.

**Schema**:

```sql
- id: SERIAL PRIMARY KEY
- email: TEXT
- chat_id: BIGINT
- username: TEXT
- first_name: TEXT
- created_at: TIMESTAMPTZ
```

**Indexes**:

- `chat_id` unique constraint

#### `user_preference_embeddings`

Stores vector embeddings for semantic search.

**Schema**:

```sql
- id: SERIAL PRIMARY KEY
- user_id: UUID
- content: TEXT
- embedding: VECTOR(1536) -- OpenAI embedding dimension
- metadata: JSONB
- created_at: TIMESTAMPTZ
```

**Indexes**:

- Vector similarity search index (Supabase)

#### `user_goals`

Stores user goals for tracking.

**Schema**:

```sql
- id: SERIAL PRIMARY KEY
- user_id: UUID
- goal_type: TEXT
- goal_data: JSONB
- target_value: INTEGER
- current_value: INTEGER
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**Indexes**:

- `(user_id, goal_type)` index

---

## Authentication & Authorization

### OAuth 2.0 Flow (Google Calendar)

```
1. User requests calendar access
    ↓
2. generateUserCbGoogleUrl agent generates OAuth URL
    ↓
3. User redirected to Google OAuth consent screen
    ↓
4. User grants permissions
    ↓
5. Google redirects to callback URL with authorization code
    ↓
6. Exchange authorization code for tokens
    ↓
7. Store tokens in user_calendar_tokens table
    ↓
8. Initialize Google Calendar client with tokens
    ↓
9. Token refresh handled automatically
```

### Token Management

**Token Storage**:

- Access tokens stored in `user_calendar_tokens` table
- Refresh tokens stored securely
- Token expiry tracked

**Token Refresh**:

- Automatic refresh via `initCalendarWithUserTokensAndUpdateTokens()`
- Updated tokens stored back to database
- Handles `invalid_grant` errors gracefully

### Session Management

**Telegram Sessions**:

- Grammy session middleware
- Session data stored in memory (can be persisted)
- Includes: chatId, email, userId, messageCount, etc.

**JWT Tokens** (for REST API):

- JWT-based authentication
- Token validation middleware
- Secure session management

---

## Services Architecture

### Service Responsibilities

#### CalendarService

- Calendar list operations
- Calendar metadata
- Calendar synchronization

#### EventService

- Event CRUD operations
- Event validation
- Date/time normalization
- Event formatting

#### ConversationMemoryService

- Message storage
- Context retrieval
- Summarization
- State management

#### VectorSearchService

- Embedding generation
- Similarity search
- Context retrieval

#### RoutineLearningService

- Pattern detection
- Routine analysis
- Confidence scoring
- Goal tracking

#### ScheduleStatisticsService

- Calendar analytics
- Time distribution
- Routine insights
- Statistics generation

#### ModelRouterService

- Task analysis
- Model selection
- Cost optimization
- Performance optimization

---

## External Integrations

### Google Calendar API

**Integration Points**:

- OAuth 2.0 authentication
- Calendar list operations
- Event CRUD operations
- Timezone management
- Color schemes

**Client**: `GoogleCalendarClient` (`infrastructure/clients/GoogleCalendarClient.ts`)

**Repository**: `GoogleCalendarEventRepository`, `GoogleCalendarCalendarRepository`

### Supabase

**Services**:

- PostgreSQL database
- Vector search (pgvector)
- Authentication (Supabase Auth)
- Real-time subscriptions (future)

**Client**: `EnhancedSupabaseClient` (`infrastructure/clients/EnhancedSupabaseClient.ts`)

### OpenAI API

**Services**:

- GPT-4o, GPT-4o-mini models
- Embedding generation (text-embedding-3-small)
- Agent framework
- Realtime API (voice)

**Usage**:

- Agent execution
- Embedding generation
- Conversation summarization
- Voice transcription

### Telegram Bot API

**Framework**: Grammy

**Features**:

- Message handling
- Voice message support
- Session management
- Webhook support

---

## Deployment & Infrastructure

### Application Structure

```
app.ts (Entry Point)
    ├── Express server setup
    ├── Route registration
    ├── Middleware configuration
    ├── Telegram bot initialization
    └── Background job startup
```

### Environment Configuration

**Required Environment Variables**:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- `OPEN_API_KEY` - OpenAI API key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `TELEGRAM_BOT_ACCESS_TOKEN` - Telegram bot token
- `NODE_ENV` - Environment (dev/prod)

### Background Jobs

**Routine Analysis Job**:

- **Schedule**: Daily at 2 AM (configurable via cron)
- **Configuration**: `RoutineAnalysisJob` constructor
- **Process**: Analyzes user calendars, detects patterns, stores routines

### Error Handling

**Strategy**:

- Centralized error handler middleware
- Error sanitization (no sensitive data)
- Proper HTTP status codes
- Error logging

### Logging

**Logger Service** (`services/logging/Logger.ts`):

- Structured logging
- Log levels (debug, info, warn, error)
- Contextual information

---

## Development Workflow

### Project Structure

```
/
├── ai-agents/          # AI agent definitions
├── config/             # Configuration files
├── controllers/        # HTTP controllers
├── domain/             # Domain layer (DDD)
├── infrastructure/     # Infrastructure layer
├── middlewares/        # Express middleware
├── routes/             # Route definitions
├── services/           # Business logic services
├── telegram-bot/       # Telegram bot implementation
├── utils/              # Utility functions
├── __tests__/          # Test files
└── docs/               # Documentation
```

### Testing

**Test Structure**:

- Unit tests for domain logic
- Integration tests for API endpoints
- Service tests
- Agent tests

**Running Tests**:

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Code Quality

**Tools**:

- Biome (linting/formatting)
- TypeScript (type checking)
- Jest (testing)
- Husky (git hooks)

**Git Hooks**:

- Pre-commit: Linting and formatting
- Pre-push: Tests (optional)

### Database Migrations

**Supabase Migrations**:

- Located in `supabase/migrations/`
- Applied via Supabase CLI or dashboard

**Type Generation**:

```bash
npm run get-updated-db-types
```

---

## Key Design Patterns

### 1. Domain-Driven Design (DDD)

- **Entities**: Core business objects
- **Value Objects**: Immutable domain concepts
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic encapsulation

### 2. Dependency Injection

- **Inversify Container**: IoC container
- **Loose Coupling**: Interfaces over implementations
- **Testability**: Easy mocking

### 3. Agent Pattern

- **Orchestrator**: Main decision engine
- **Specialized Agents**: Task-specific agents
- **Handoff Agents**: Multi-step workflows
- **Tool-based**: Agents use tools for actions

### 4. Repository Pattern

- **Interface Abstraction**: `IEventRepository`, `ICalendarRepository`
- **Implementation**: `GoogleCalendarEventRepository`, `SupabaseUserRepository`
- **Testability**: Easy to mock for testing

### 5. Service Layer Pattern

- **Business Logic**: Encapsulated in services
- **Reusability**: Services used by controllers and agents
- **Separation of Concerns**: Clear boundaries

---

## Performance Optimizations

### 1. Agent Caching

- Agent instances cached for performance
- Model router caches agent configurations

### 2. Model Routing

- Simple queries → Fast models (GPT-4o-mini)
- Complex tasks → Powerful models (GPT-4o)
- Cost optimization through intelligent selection

### 3. Context Management

- Summarization reduces context size
- Sliding window approach (last 2 messages + summaries)
- Vector search for efficient context retrieval

### 4. Background Processing

- Routine analysis runs asynchronously
- Non-blocking calendar operations
- Efficient database queries

### 5. Connection Pooling

- Supabase client connection pooling
- Google Calendar API connection reuse

---

## Security Considerations

### 1. Authentication

- OAuth 2.0 for Google Calendar
- JWT tokens for REST API
- Session management for Telegram

### 2. Authorization

- Row-Level Security (RLS) in Supabase
- User-scoped data access
- Token validation

### 3. Data Protection

- Sensitive data not logged
- Error sanitization
- Secure token storage

### 4. Input Validation

- Zod schema validation
- Type checking
- Sanitization

---

## Future Enhancements

### Planned Features

1. **Web UI**: React/Next.js interface
2. **React Native App**: Mobile app
3. **Advanced Analytics**: Dashboard and insights
4. **Multi-language Support**: Internationalization
5. **Conflict Detection**: Proactive scheduling warnings
6. **Advanced Reminders**: Smart reminder system

### Technical Improvements

1. **Caching Layer**: Redis for performance
2. **Message Queue**: For background jobs
3. **Real-time Updates**: WebSocket support
4. **Advanced Vector Search**: Improved semantic search
5. **Model Fine-tuning**: Custom model training

---

## Conclusion

This architecture provides a **scalable, maintainable, and extensible** foundation for an AI-powered calendar assistant. The layered architecture with DDD principles ensures clear separation of concerns, while the multi-agent system enables sophisticated natural language processing capabilities.

The system is designed to:

- **Scale**: Handle multiple users and platforms
- **Learn**: Improve through routine learning
- **Adapt**: Intelligent model routing and context management
- **Extend**: Easy to add new features and integrations

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Development Team
