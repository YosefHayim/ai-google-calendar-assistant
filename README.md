# AI Google Calendar Assistant

> An intelligent, AI-powered calendar management platform that transforms natural language into structured Google Calendar events across multiple interfaces (Web, Telegram, WhatsApp).

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![Bun](https://img.shields.io/badge/Bun-Runtime-orange.svg)](https://bun.sh/)
[![Express](https://img.shields.io/badge/Express-5.1.0-green.svg)](https://expressjs.com/)
[![OpenAI Agents](https://img.shields.io/badge/OpenAI-Agents_v0.3.0-412991.svg)](https://openai.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Overview

AI Google Calendar Assistant is a sophisticated calendar automation platform that leverages cutting-edge AI agents to provide intelligent calendar management through natural language processing. Built with a modern tech stack and designed for scalability as a multi-tenant SaaS product.

### Key Highlights

- **Multi-Agent AI Architecture**: OpenAI Agents framework with specialized agents for calendar operations
- **Natural Language Processing**: Convert free-text to structured calendar events with smart parsing
- **Multi-Platform Support**: Web dashboard, Telegram bot, and WhatsApp integration
- **Gap Recovery**: AI-powered detection and filling of untracked calendar gaps
- **Domain-Driven Design**: Clean architecture with repository pattern and dependency injection
- **Modern Stack**: Next.js 15, React 19, Express 5, TypeScript, Bun runtime

---

## Features

### Web Dashboard

| Feature | Status | Description |
|---------|--------|-------------|
| AI Chat Interface | Done | Natural language calendar management with streaming responses |
| Voice Input | Done | Speech-to-text for hands-free interaction |
| Multiple View Modes | Done | Chat, Avatar, and 3D view modes |
| Analytics Dashboard | Done | Calendar insights with heatmaps, time allocation charts |
| Conversation History | Done | Persistent conversations with AI-generated titles |
| Onboarding Tour | Done | Interactive guided tour for new users |
| Dark/Light Theme | Done | System-aware theme switching |
| Google OAuth | Done | Secure calendar integration |
| Integration Management | Done | Connect/disconnect Google Calendar, view status |

### Telegram Bot

| Feature | Status | Description |
|---------|--------|-------------|
| Natural Language Events | Done | Create events via chat messages |
| Quick Commands | Done | `/today`, `/tomorrow`, `/week`, `/month` |
| Availability Check | Done | `/free`, `/busy` commands |
| Event Management | Done | `/create`, `/update`, `/delete` |
| Session Management | Done | Persistent sessions with 24h TTL |
| Email Linking | Done | Link Telegram to Google account |
| Context Memory | Done | Conversation summarization and embeddings |

### AI Agent System

| Feature | Status | Description |
|---------|--------|-------------|
| Orchestrator Agent | Done | Routes requests to specialized tools |
| Direct Tools | Done | Fast, non-AI utilities for DB operations |
| Handoff Agents | Done | Multi-step workflows (create, update, delete) |
| Guardrails | Done | Safety checks for injection and mass deletion |
| Session Persistence | Done | Supabase-backed agent state |
| Parallel Tool Execution | Done | Efficient multi-tool calls |

### Gap Recovery

| Feature | Status | Description |
|---------|--------|-------------|
| Gap Detection | Done | Identify untracked time between events |
| Context Inference | Done | AI-powered suggestions (travel, work, meals) |
| One-Click Fill | Done | Fill gaps with suggested activities |
| Settings Management | Done | Customizable thresholds and ignored days |

### Calendar Operations

| Feature | Status | Description |
|---------|--------|-------------|
| Event CRUD | Done | Create, read, update, delete events |
| Multi-Calendar | Done | Support for multiple calendars |
| Quick Add | Done | Natural language event creation |
| Conflict Detection | Done | Check for scheduling conflicts |
| Recurring Events | Done | Support for recurring event patterns |
| Time Zone Handling | Done | Automatic timezone detection |
| Free/Busy Query | Done | Check availability |

---

## Architecture

### System Design

```
+-----------------------------------------------------------------------------------+
|                              CLIENT INTERFACES                                      |
|  +----------------+    +------------------+    +----------------+    +-----------+ |
|  | Web Dashboard  |    | Telegram Bot     |    | WhatsApp       |    | REST API  | |
|  | (Next.js 15)   |    | (Grammy v1.38)   |    | (Webhook)      |    | (Mobile)  | |
|  +-------+--------+    +--------+---------+    +-------+--------+    +-----+-----+ |
+----------|----------------------|----------------------|-------------------|-------+
           |                      |                      |                   |
           +----------------------+----------------------+-------------------+
                                  |
+-----------------------------------------------------------------------------------+
|                            EXPRESS MIDDLEWARE CHAIN                                 |
|  +----------+  +------+  +------------+  +----------------+  +--------------+      |
|  | Helmet   |->| CORS |->| Rate Limit |->| Security Audit |->| JSON Parser  |      |
|  +----------+  +------+  +------------+  +----------------+  +--------------+      |
+-----------------------------------------------------------------------------------+
                                  |
+-----------------------------------------------------------------------------------+
|                         AUTHENTICATION MIDDLEWARE                                   |
|  +----------------+    +------------------------+    +----------------------+      |
|  | Supabase Auth  |--->| Google Token Validation|--->| Google Token Refresh |      |
|  | (JWT Verify)   |    | (Token Existence)      |    | (Auto-refresh)       |      |
|  +----------------+    +------------------------+    +----------------------+      |
+-----------------------------------------------------------------------------------+
                                  |
+-----------------------------------------------------------------------------------+
|                              API ROUTES                                            |
|  +-------+  +--------+  +----------+  +------+  +------+  +-----+  +----------+   |
|  | Users |  | Events |  | Calendar |  | Chat |  | Gaps |  | ACL |  | Channels |   |
|  +-------+  +--------+  +----------+  +------+  +------+  +-----+  +----------+   |
+-----------------------------------------------------------------------------------+
                                  |
+-----------------------------------------------------------------------------------+
|                              CONTROLLERS                                           |
|    Business logic, input validation, response formatting, error handling           |
+-----------------------------------------------------------------------------------+
                                  |
           +----------------------+----------------------+
           |                      |                      |
+----------v---------+  +---------v----------+  +--------v---------+
|    AI AGENTS       |  |  CALENDAR UTILS    |  |   AUTH UTILS     |
|   (OpenAI SDK)     |  |                    |  |                  |
|                    |  | - Events CRUD      |  | - Token Refresh  |
| - Orchestrator     |  | - Gap Recovery     |  | - OAuth Flow     |
| - Handoff Agents   |  | - Conflict Check   |  | - Session Mgmt   |
| - Direct Tools     |  | - Category Update  |  | - Cookie Utils   |
| - Guardrails       |  |                    |  |                  |
+--------------------+  +--------------------+  +------------------+
           |                      |                      |
           +----------------------+----------------------+
                                  |
+-----------------------------------------------------------------------------------+
|                           EXTERNAL SERVICES                                        |
|  +------------------+   +---------------------+   +------------------+             |
|  | Supabase         |   | Google Calendar API |   | OpenAI API       |             |
|  | (PostgreSQL)     |   | (Events, Calendars) |   | (GPT-4, GPT-5)   |             |
|  +------------------+   +---------------------+   +------------------+             |
+-----------------------------------------------------------------------------------+
```

### Project Structure

```
ai-google-calendar-assistant/
├── be/                              # Backend (Express + TypeScript + Bun)
│   ├── ai-agents/                   # OpenAI Agent implementations
│   │   ├── sessions/                # Session persistence
│   │   ├── agents.ts                # Agent definitions
│   │   ├── tool-registry.ts         # Tool definitions
│   │   ├── guardrails.ts            # Safety checks
│   │   └── direct-utilities.ts      # Fast non-AI tools
│   ├── config/                      # Configuration
│   │   ├── clients/                 # External clients
│   │   └── constants/               # Application constants
│   ├── controllers/                 # Request handlers
│   │   └── google-calendar/         # Calendar-specific
│   ├── database/                    # Database migrations
│   │   └── migrations/              # SQL migration scripts
│   ├── domain/                      # Domain-Driven Design
│   │   ├── entities/                # Business entities
│   │   └── repositories/            # Repository interfaces
│   ├── infrastructure/              # External integrations
│   │   ├── di/                      # Dependency injection
│   │   └── repositories/            # Implementations
│   ├── middlewares/                 # Express middleware
│   ├── routes/                      # API routes
│   ├── telegram-bot/                # Telegram integration
│   ├── tests/                       # Test files
│   └── utils/                       # Utilities
│
├── fe/                              # Frontend (Next.js 15 + React 19)
│   ├── app/                         # Next.js App Router
│   │   ├── dashboard/               # Dashboard pages
│   │   └── auth/                    # Auth pages
│   ├── components/                  # React components
│   │   ├── dashboard/               # Dashboard components
│   │   ├── marketing/               # Marketing pages
│   │   └── ui/                      # UI primitives
│   ├── contexts/                    # React contexts
│   ├── hooks/                       # Custom hooks
│   │   └── queries/                 # TanStack Query
│   ├── lib/                         # Utilities
│   └── services/                    # Service layer
│
├── AGENTS.md                        # AI Agent guidelines
└── README.md                        # This file
```

---

## API Reference

### Authentication Endpoints (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register with email/password |
| `POST` | `/signin` | Sign in with email/password |
| `GET` | `/signup/google` | OAuth with Google |
| `GET` | `/callback` | OAuth callback handler |
| `POST` | `/logout` | Clear session |
| `GET` | `/get-user` | Get current user |
| `GET` | `/session` | Check session validity |
| `POST` | `/refresh` | Refresh access token |
| `GET` | `/integrations/google-calendar` | Get Google integration status |
| `POST` | `/integrations/google-calendar/disconnect` | Disconnect Google Calendar |
| `DELETE` | `/` | Deactivate user account |

### Calendar Endpoints (`/api/calendar`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all calendars |
| `POST` | `/` | Create secondary calendar |
| `GET` | `/:id` | Get calendar by ID |
| `PATCH` | `/:id` | Partial update calendar |
| `PUT` | `/:id` | Full update calendar |
| `DELETE` | `/:id` | Clear all events |
| `DELETE` | `/:id/delete` | Delete secondary calendar |
| `GET` | `/freebusy` | Get free/busy info |
| `GET` | `/colors` | Get available colors |
| `GET` | `/timezones` | Get timezones |
| `GET` | `/settings` | Get calendar settings |
| `GET` | `/settings/all` | List all settings |

### Event Endpoints (`/api/events`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all events |
| `POST` | `/` | Create event |
| `GET` | `/:id` | Get event by ID |
| `PATCH` | `/:id` | Update event |
| `DELETE` | `/:id` | Delete event |
| `POST` | `/quick-add` | Natural language create |
| `GET` | `/analytics` | Get analytics data |
| `POST` | `/watch` | Watch for changes (webhook) |
| `POST` | `/move` | Move event to another calendar |
| `POST` | `/import` | Import event (private copy) |
| `GET` | `/:id/instances` | Get recurring instances |

### Chat Endpoints (`/api/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/stream` | Stream chat response |
| `POST` | `/` | Non-streaming chat |
| `GET` | `/conversations` | List conversations |
| `GET` | `/conversations/:id` | Get conversation |
| `DELETE` | `/conversations/:id` | Delete conversation |
| `POST` | `/conversations/:id/messages` | Continue conversation |

### Gap Recovery Endpoints (`/api/gaps`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Analyze calendar gaps |
| `GET` | `/formatted` | Get formatted gaps |
| `POST` | `/:gapId/fill` | Fill a gap |
| `POST` | `/:gapId/skip` | Skip a gap |
| `POST` | `/dismiss-all` | Dismiss all gaps |
| `GET` | `/settings` | Get settings |
| `PATCH` | `/settings` | Update settings |
| `POST` | `/disable` | Disable gap analysis |

---

## Database Schema

### Current Tables (Legacy)

| Table | Description |
|-------|-------------|
| `user_calendar_tokens` | Google OAuth tokens, user profile, timezone |
| `user_telegram_links` | Links Telegram users to email accounts |
| `calendar_categories` | User calendar metadata and settings |
| `agent_sessions` | Persistent AI agent session state |
| `conversation_state` | Chat conversation state for web/Telegram |
| `conversation_embeddings` | Vector embeddings for semantic search |
| `conversation_summaries` | Summarized conversation history |
| `gap_candidates` | Detected calendar gaps for recovery |
| `gap_recovery_settings` | User preferences for gap recovery |

### Professional Schema (New - in `be/database/migrations/`)

The new schema introduces proper normalization, foreign keys, indexes, and audit fields:

| Table | Description |
|-------|-------------|
| `users` | Core user table (single source of truth) |
| `oauth_tokens` | Centralized OAuth token storage |
| `user_calendars` | User's connected calendars with preferences |
| `telegram_users` | Telegram-specific user data |
| `conversations` | Unified conversation storage |
| `conversation_messages` | Individual messages with metadata |
| `conversation_embeddings` | Vector embeddings with proper FKs |
| `conversation_summaries` | Summaries linked to conversations |
| `agent_sessions` | Agent sessions with expiry |
| `gap_candidates` | Gaps with confidence scores |
| `gap_recovery_settings` | Settings with quick-access fields |
| `user_preferences` | Extensible key-value preferences |
| `audit_logs` | Security and change tracking |

### Key Database Features

- **UUID Primary Keys**: All tables use UUID for distributed systems
- **Foreign Key Constraints**: Proper referential integrity
- **Indexes**: Optimized for common query patterns
- **Triggers**: Automatic `updated_at` timestamps
- **RLS Policies**: Row-level security for data isolation
- **Vector Search**: pgvector for semantic similarity
- **Enums**: Type-safe status and role fields

---

## Technology Stack

### Backend

| Category | Technologies |
|----------|-------------|
| **Runtime** | Bun, Node.js |
| **Framework** | Express 5.1.0 |
| **Language** | TypeScript 5.7+ |
| **AI/Agents** | OpenAI Agents SDK v0.3.0 |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth, Google OAuth 2.0 |
| **Calendar** | Google Calendar API v105 |
| **Bot** | Grammy v1.38.3 (Telegram) |
| **Validation** | Zod v3.25 |
| **DI** | Inversify v7.10 |
| **Testing** | Jest v30.2 |
| **Linting** | Biome |

### Frontend

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15.1.0 (App Router) |
| **UI** | React 19.0.0 |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS 3.4 |
| **Animation** | Framer Motion 11.11 |
| **Components** | Radix UI, shadcn/ui |
| **State** | TanStack Query, React Context |
| **Forms** | TanStack React Form |
| **Icons** | Lucide Icons |

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Supabase account
- Google Cloud project with Calendar API
- OpenAI API key
- Telegram Bot Token (optional)

### Environment Variables

#### Backend (`/be/.env`)

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPEN_API_KEY=your_openai_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/users/callback

# Telegram (optional)
TELEGRAM_BOT_ACCESS_TOKEN=your_telegram_bot_token

# Server
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
FE_BASE_URL=http://localhost:4000
```

#### Frontend (`/fe/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-google-calendar-assistant.git
cd ai-google-calendar-assistant

# Install backend dependencies
cd be
bun install  # or npm install

# Start backend development server
bun --watch app.ts  # or npm run dev

# In a new terminal, install frontend dependencies
cd ../fe
npm install

# Start frontend development server
npm run dev
```

The backend runs on `http://localhost:3000` and frontend on `http://localhost:4000`.

### Database Setup

1. Create a Supabase project
2. Run the migration scripts in order:
   ```bash
   # In Supabase SQL Editor, run:
   # 1. be/database/migrations/001_professional_schema.sql
   # 2. be/database/migrations/002_data_migration.sql
   ```
3. Generate TypeScript types:
   ```bash
   cd be
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > database.types.ts
   ```

---

## Development

### Commands

#### Backend

```bash
bun --watch app.ts          # Dev server with hot reload
bun run jest                # Run tests
bun run jest --coverage     # Tests with coverage
npx biome check --write .   # Format code
```

#### Frontend

```bash
npm run dev                 # Dev server (port 4000)
npm run build              # Production build
npm run lint               # Lint code
npm run format             # Format with Prettier
```

### Code Style

- **Backend**: Biome formatter, no semicolons, double quotes
- **Frontend**: Prettier, no semicolons, single quotes
- **Imports**: Use `@/` path alias for internal imports
- **Types**: Explicit types for all function parameters and returns

See `AGENTS.md` for complete coding guidelines.

---

## Security

- **Authentication**: Supabase Auth with JWT validation
- **OAuth 2.0**: Secure Google account integration
- **Rate Limiting**: Configurable limits per endpoint type
- **Input Validation**: Zod schemas for all inputs
- **Row Level Security**: Supabase RLS for data isolation
- **CORS**: Configured origin whitelisting
- **Helmet**: Security headers
- **Audit Logging**: Security event tracking
- **Guardrails**: AI safety checks for malicious inputs
- **ID Token Verification**: Google OAuth token signature verification
- **IDOR Protection**: Users can only access their own data

---

## Roadmap

### In Development

- [ ] WhatsApp bot completion
- [ ] Stripe subscription billing
- [ ] Enhanced conflict resolution
- [ ] Meeting optimization suggestions

### Planned

- [ ] Slack integration
- [ ] Mobile app (React Native)
- [ ] Zoom/Google Meet auto-linking
- [ ] Email integration (Gmail)
- [ ] Redis caching layer
- [ ] Team collaboration features
- [ ] Calendar sharing

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the code style guidelines in `AGENTS.md`
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [OpenAI](https://openai.com/) - Agents framework and API
- [Google](https://developers.google.com/calendar) - Calendar API
- [Supabase](https://supabase.com/) - Backend platform
- [Vercel](https://vercel.com/) - Next.js and hosting
- [shadcn/ui](https://ui.shadcn.com/) - UI components
