# AI Google Calendar Assistant - Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        TG[Telegram Bot]
        WA[WhatsApp]
        WEB[Web Clients]
    end

    subgraph "API Gateway - Express.js"
        ROUTES[Routes Layer]
        MIDDLEWARE[Middleware<br/>authHandler<br/>errorHandler]
    end

    subgraph "Controller Layer"
        CAL_CTRL[calendarController]
        USER_CTRL[usersController]
        WA_CTRL[whatsappController]
    end

    subgraph "Service Layer"
        CAL_SVC[CalendarService]
        EVT_SVC[EventService]
        MEM_SVC[ConversationMemoryService]
        VEC_SVC[VectorSearchService]
        ROUT_SVC[RoutineLearningService]
        STAT_SVC[ScheduleStatisticsService]
        REM_SVC[ReminderService]
    end

    subgraph "AI Agents Layer"
        ORCH[ORCHESTRATOR_AGENT]
        QUICK[QUICK_RESPONSE_AGENT]
        VALIDATE[validateEventFields]
        INSERT[insertEvent]
        GET_EVT[getEventByIdOrName]
        UPDATE[updateEvent]
        DELETE[deleteEvent]
        AUTH_AGENTS[Auth Agents]
    end

    subgraph "Domain Layer"
        ENTITIES[Entities<br/>Event<br/>Calendar<br/>User]
        DTOS[DTOs<br/>EventDTO<br/>CalendarDTO<br/>UserDTO]
        REPO_IFACE[Repository Interfaces<br/>IEventRepository<br/>ICalendarRepository<br/>IUserRepository]
        VO[Value Objects<br/>EventDateTime]
    end

    subgraph "Infrastructure Layer"
        REPOS[Repositories<br/>SupabaseUserRepository<br/>GoogleCalendarEventRepository<br/>GoogleCalendarCalendarRepository]
        CLIENTS[Clients<br/>GoogleCalendarClient<br/>EnhancedSupabaseClient]
        DI[Dependency Injection<br/>Inversify Container]
    end

    subgraph "External Services"
        GOOGLE[Google Calendar API]
        SUPABASE[(Supabase Database)]
        OPENAI[OpenAI API]
    end

    TG --> ROUTES
    WA --> ROUTES
    WEB --> ROUTES

    ROUTES --> MIDDLEWARE
    MIDDLEWARE --> CAL_CTRL
    MIDDLEWARE --> USER_CTRL
    MIDDLEWARE --> WA_CTRL

    CAL_CTRL --> CAL_SVC
    USER_CTRL --> CAL_SVC
    WA_CTRL --> EVT_SVC

    CAL_SVC --> ENTITIES
    EVT_SVC --> ENTITIES
    MEM_SVC --> SUPABASE
    VEC_SVC --> SUPABASE
    ROUT_SVC --> SUPABASE

    CAL_SVC --> REPO_IFACE
    EVT_SVC --> REPO_IFACE

    REPO_IFACE --> REPOS
    REPOS --> CLIENTS
    REPOS --> SUPABASE

    CLIENTS --> GOOGLE

    ORCH --> QUICK
    ORCH --> VALIDATE
    ORCH --> INSERT
    ORCH --> GET_EVT
    ORCH --> UPDATE
    ORCH --> DELETE
    ORCH --> AUTH_AGENTS

    QUICK --> EVT_SVC
    VALIDATE --> ENTITIES
    INSERT --> EVT_SVC
    GET_EVT --> EVT_SVC
    UPDATE --> EVT_SVC
    DELETE --> EVT_SVC

    AUTH_AGENTS --> USER_CTRL

    ORCH --> OPENAI
    QUICK --> OPENAI

    DI --> REPOS
    DI --> CLIENTS
    DI --> CAL_SVC
    DI --> EVT_SVC

    style TG fill:#e3f2fd
    style WA fill:#e3f2fd
    style WEB fill:#e3f2fd
    style ROUTES fill:#fff3e0
    style MIDDLEWARE fill:#fff3e0
    style CAL_CTRL fill:#f3e5f5
    style USER_CTRL fill:#f3e5f5
    style WA_CTRL fill:#f3e5f5
    style CAL_SVC fill:#e8f5e9
    style EVT_SVC fill:#e8f5e9
    style MEM_SVC fill:#e8f5e9
    style VEC_SVC fill:#e8f5e9
    style ROUT_SVC fill:#e8f5e9
    style ORCH fill:#fff9c4
    style QUICK fill:#fff9c4
    style ENTITIES fill:#fce4ec
    style DTOS fill:#fce4ec
    style REPO_IFACE fill:#fce4ec
    style REPOS fill:#e0f2f1
    style CLIENTS fill:#e0f2f1
    style GOOGLE fill:#ffebee
    style SUPABASE fill:#ffebee
    style OPENAI fill:#ffebee
```

## Layer Descriptions

### Client Layer
- **Telegram Bot**: Grammy-based bot for Telegram interactions
- **WhatsApp**: WhatsApp integration (in development)
- **Web Clients**: REST API clients

### API Gateway (Express.js)
- **Routes**: Express route definitions (calendarRoutes, users, whatsappRoutes)
- **Middleware**: Authentication and error handling middleware

### Controller Layer
- **calendarController**: Handles calendar-related HTTP requests
- **usersController**: Handles user authentication and management
- **whatsappController**: Handles WhatsApp webhook requests

### Service Layer
- **CalendarService**: Business logic for calendar operations
- **EventService**: Business logic for event CRUD operations
- **ConversationMemoryService**: Manages conversation context and memory
- **VectorSearchService**: Semantic search for calendar events
- **RoutineLearningService**: Analyzes user routines and patterns
- **ScheduleStatisticsService**: Provides calendar statistics
- **ReminderService**: Handles event reminders

### AI Agents Layer
- **ORCHESTRATOR_AGENT**: Main orchestrator for agent workflows
- **QUICK_RESPONSE_AGENT**: Fast response agent for simple queries
- **Specialized Agents**: validateEventFields, insertEvent, getEventByIdOrName, updateEvent, deleteEvent
- **Auth Agents**: User authentication and OAuth flow agents

### Domain Layer
- **Entities**: Core business entities (Event, Calendar, User)
- **DTOs**: Data Transfer Objects for API communication
- **Repository Interfaces**: Abstraction for data access
- **Value Objects**: Immutable domain concepts (EventDateTime)

### Infrastructure Layer
- **Repositories**: Concrete implementations (Supabase, Google Calendar)
- **Clients**: External API clients (Google Calendar, Supabase)
- **Dependency Injection**: Inversify container for IoC

### External Services
- **Google Calendar API**: Calendar and event management
- **Supabase**: Database and authentication
- **OpenAI API**: AI agent processing

## Data Flow

1. **Request Flow**: Client → Routes → Middleware → Controller → Service → Repository → External API
2. **Response Flow**: External API → Repository → Service → Controller → Client
3. **AI Agent Flow**: User Message → Orchestrator → Specialized Agent → Service → Response

## Key Design Patterns

- **Repository Pattern**: Abstracts data access layer
- **Service Layer Pattern**: Encapsulates business logic
- **Dependency Injection**: Loose coupling via Inversify
- **DTO Pattern**: Data transfer between layers
- **Agent Pattern**: AI-powered decision making

