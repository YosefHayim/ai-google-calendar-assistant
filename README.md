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
| AI Chat Interface | Done | Natural language calendar management with streaming responses and typewriter effect |
| Voice Input | Done | Speech-to-text for hands-free interaction with voice-powered orb UI |
| Multiple View Modes | Done | Chat view, Avatar view, and 3D view modes |
| Analytics Dashboard | Done | Calendar insights with heatmaps, time allocation charts, daily hours analysis |
| Conversation History | Done | Persistent conversations with AI-generated titles |
| Onboarding Tour | Done | Interactive guided tour for new users with language selection |
| Dark/Light Theme | Done | System-aware theme switching with cinematic glow toggle |
| Google OAuth | Done | Secure calendar integration with token auto-refresh |
| Integration Management | Done | Connect/disconnect Google Calendar, view status |
| Gap Recovery Panel | Done | Dedicated page for analyzing and filling calendar gaps |
| Quick Event Dialog | Done | Fast event creation with preview and validation |
| Event Details Dialog | Done | View and manage individual events |
| Calendar Settings | Done | Manage calendar preferences and timezone |
| Billing Dashboard | Done | Payment methods, transaction history, subscription management |
| Pricing Page | Done | Tiered pricing with animated testimonials and FAQs |

### Frontend UI Components

| Component | Description |
|-----------|-------------|
| Streaming Typewriter | Real-time text streaming with cursor animation |
| 3D Wall Calendar | Interactive 3D calendar visualization |
| Wireframe Globe | Animated dotted globe for global integrations |
| Bento Grid | Feature showcase with animated backgrounds |
| Voice-Powered Orb | Visual feedback for voice input |
| Animated Testimonials | Auto-rotating customer testimonials |
| Date Range Picker | Calendar date selection with ranges |
| Radial Orbital Timeline | Circular timeline visualization |
| Interactive Charts | Bar, line, area, pie, donut, radar charts via Recharts |

### Telegram Bot

| Feature | Status | Description |
|---------|--------|-------------|
| Natural Language Events | Done | Create events via chat messages |
| Quick Commands | Done | `/today`, `/tomorrow`, `/week`, `/month` for schedule views |
| Availability Check | Done | `/free`, `/busy` commands for time availability |
| Event Management | Done | `/create`, `/update`, `/delete` event operations |
| Session Management | Done | Persistent sessions with 24h TTL and auto-expiry |
| Email Linking | Done | Link Telegram to Google account |
| Context Memory | Done | Conversation summarization and embeddings |
| Multi-Language Support | Done | English, Hebrew, Arabic, German, French, Russian with RTL handling |
| Ally Brain | Done | Persistent user knowledge and preferences |
| Rate Limiting | Done | Per-user rate limiting to prevent abuse |
| Inline Keyboards | Done | Interactive buttons for settings, language, brain management |

### AI Agent System

| Feature | Status | Description |
|---------|--------|-------------|
| Orchestrator Agent | Done | Routes requests to specialized tools |
| Direct Tools | Done | Fast, non-AI utilities for DB operations (bypass LLM overhead) |
| Handoff Agents | Done | Multi-step workflows (create, update, delete) |
| Guardrails | Done | Safety checks for injection and mass deletion |
| Session Persistence | Done | Supabase-backed agent state with session factory |
| Parallel Tool Execution | Done | Efficient multi-tool calls |
| Pre-Create Validation | Done | Combined validation: user, timezone, calendar selection, conflicts in parallel |
| Event Summarization | Done | AI-powered event list summarization with cost-efficient models |
| Insights Generator | Done | Calendar analytics and productivity insights |

### AI Tools Available

| Tool | Type | Description |
|------|------|-------------|
| `validate_user_direct` | Direct | Fast user validation in DB |
| `get_timezone_direct` | Direct | Get user's default timezone |
| `select_calendar_direct` | Direct | Rules-based calendar selection |
| `check_conflicts_direct` | Direct | Check for event conflicts |
| `pre_create_validation` | Direct | Combined parallel validation |
| `insert_event_direct` | Direct | Direct event insertion |
| `get_event_direct` | Direct | Direct event retrieval |
| `summarize_events` | Direct | AI event summarization |
| `analyze_gaps_direct` | Direct | Analyze calendar gaps |
| `fill_gap_direct` | Direct | Fill detected gaps |
| `format_gaps_direct` | Direct | Format gaps for display |
| `get_event` | Agent | Event retrieval with context |
| `update_event` | Agent | Event modification |
| `delete_event` | Agent | Event deletion |
| `generate_google_auth_url` | Agent | OAuth URL generation |
| `register_user_via_db` | Agent | User registration |

### Gap Recovery

| Feature | Status | Description |
|---------|--------|-------------|
| Gap Detection | Done | Identify untracked time between events |
| Context Inference | Done | AI-powered suggestions (travel, work, meals) |
| One-Click Fill | Done | Fill gaps with suggested activities |
| Settings Management | Done | Customizable thresholds and ignored days |
| Date Range Filtering | Done | Analyze specific time periods |
| Dismiss All | Done | Bulk dismiss detected gaps |

### Calendar Operations

| Feature | Status | Description |
|---------|--------|-------------|
| Event CRUD | Done | Create, read, update, delete events |
| Multi-Calendar | Done | Support for multiple calendars with auto-selection |
| Quick Add | Done | Natural language event creation |
| Conflict Detection | Done | Check for scheduling conflicts |
| Recurring Events | Done | Support for recurring event patterns (RRULE) |
| Time Zone Handling | Done | Automatic timezone detection and conversion |
| Free/Busy Query | Done | Check availability |
| Event Analytics | Done | Duration, distribution, patterns |
| Calendar Colors | Done | Color-coded calendar support |
| ACL Management | Done | Calendar access control |
| Watch/Webhooks | Done | Real-time event change notifications |

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
│   │   ├── sessions/                # Session persistence (Supabase)
│   │   ├── agents.ts                # Agent definitions
│   │   ├── tool-registry.ts         # Tool definitions (AGENT_TOOLS, DIRECT_TOOLS)
│   │   ├── guardrails.ts            # Safety checks
│   │   ├── direct-utilities.ts      # Fast non-AI tools
│   │   └── insights-generator.ts    # Analytics insights
│   ├── config/                      # Configuration
│   │   ├── clients/                 # External clients (Supabase, etc.)
│   │   └── constants/               # Application constants
│   ├── controllers/                 # Request handlers
│   │   └── google-calendar/         # Calendar-specific controllers
│   ├── database/                    # Database migrations
│   │   └── migrations/              # SQL migration scripts
│   ├── domain/                      # Domain-Driven Design
│   │   ├── entities/                # Business entities
│   │   └── repositories/            # Repository interfaces
│   ├── infrastructure/              # External integrations
│   │   ├── di/                      # Dependency injection (Inversify)
│   │   └── repositories/            # Repository implementations
│   ├── middlewares/                 # Express middleware
│   ├── routes/                      # API routes
│   │   └── google-calendar/         # Calendar API routes
│   ├── telegram-bot/                # Telegram integration
│   │   ├── handlers/                # Bot config, callbacks, messages, agents
│   │   ├── i18n/                    # Internationalization (6 languages)
│   │   ├── middleware/              # Auth, rate limiting, session expiry
│   │   ├── response-system/         # Templated responses with RTL support
│   │   └── utils/                   # Commands, session, embeddings
│   ├── tests/                       # Test files
│   └── utils/                       # Utilities
│       ├── calendar/                # Calendar operations, gap recovery
│       ├── auth/                    # Authentication utilities
│       └── conversation/            # Conversation adapters
│
├── fe/                              # Frontend (Next.js 15 + React 19)
│   ├── app/                         # Next.js App Router
│   │   ├── dashboard/               # Dashboard pages (main, analytics, gaps, billing, integrations)
│   │   ├── auth/                    # Auth pages
│   │   ├── pricing/                 # Pricing page
│   │   ├── about/                   # About page
│   │   ├── contact/                 # Contact page
│   │   └── waitinglist/             # Waiting list page
│   ├── components/                  # React components
│   │   ├── dashboard/               # Dashboard components
│   │   │   ├── chat/                # Chat interface (ChatView, AvatarView, MessageBubble)
│   │   │   ├── analytics/           # Analytics charts and dashboards
│   │   │   ├── gaps/                # Gap recovery panel
│   │   │   └── billing/             # Billing components
│   │   ├── marketing/               # Marketing pages (Navbar, Footer, Features)
│   │   ├── dialogs/                 # Modal dialogs (QuickEvent, EventDetails, Calendar)
│   │   ├── ui/                      # UI primitives (43 components)
│   │   ├── auth/                    # Auth components (Login, Register, OTP)
│   │   └── shared/                  # Shared components (Logo, Theme, Icons)
│   ├── contexts/                    # React contexts
│   │   ├── AuthContext.tsx          # Authentication state
│   │   ├── ChatContext.tsx          # Chat state management
│   │   ├── DashboardUIContext.tsx   # Dashboard UI state
│   │   ├── GapRecoveryContext.tsx   # Gap recovery state
│   │   ├── AnalyticsContext.tsx     # Analytics state
│   │   └── LanguageContext.tsx      # i18n state
│   ├── hooks/                       # Custom hooks
│   │   └── queries/                 # TanStack Query hooks
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

### Additional Endpoints

| Route | Description |
|-------|-------------|
| `/api/voice` | Voice transcription |
| `/api/contact` | Contact form submission |
| `/api/payment` | Stripe payment integration |
| `/api/webhooks` | External webhooks |
| `/api/whatsapp` | WhatsApp integration |
| `/api/calendar/acl` | Calendar access control |
| `/api/calendar/channels` | Push notification channels |

---

## Database Schema

### Current Tables

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
| **Linting** | Biome, Ultracite |

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
| **Charts** | Recharts |
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
npx ultracite check         # Lint check
npx biome fix --write .     # Format code
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
- [ ] Stripe subscription billing (payment flow complete, webhook handling in progress)
- [ ] Enhanced conflict resolution with suggested alternatives
- [ ] Meeting optimization suggestions

### Planned Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Slack Integration** | Calendar management from Slack | High |
| **Mobile App** | React Native mobile application | High |
| **Zoom/Meet Auto-Link** | Automatic video call links in events | Medium |
| **Email Integration** | Gmail event extraction and scheduling | Medium |
| **Redis Caching** | Faster response times for frequent queries | Medium |
| **Team Collaboration** | Shared calendars and team scheduling | Medium |
| **Calendar Sharing** | Share availability with external users | Medium |
| **Smart Reminders** | AI-powered reminder suggestions | Low |
| **Event Templates** | Reusable event templates | Low |
| **Weekly Digest** | AI-generated weekly schedule summaries | Low |

### Potential UI Improvements

| Area | Improvement |
|------|-------------|
| **Dashboard** | Drag-and-drop calendar interface |
| **Analytics** | Exportable reports (PDF/CSV) |
| **Chat** | Message search and filtering |
| **Mobile** | PWA support for mobile web |
| **Accessibility** | ARIA improvements and keyboard navigation |
| **Onboarding** | Video tutorials and tooltips |
| **Notifications** | In-app notification center |
| **Customization** | Custom themes and accent colors |

### Technical Improvements

| Area | Improvement |
|------|-------------|
| **Performance** | Edge caching for static assets |
| **Monitoring** | OpenTelemetry integration |
| **Testing** | E2E tests with Playwright |
| **Documentation** | API documentation with OpenAPI/Swagger |
| **CI/CD** | Automated deployment pipelines |
| **Logging** | Structured logging with log aggregation |

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
- [Grammy](https://grammy.dev/) - Telegram Bot framework
