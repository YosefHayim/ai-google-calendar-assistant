# AI Google Calendar Assistant - Backend

> Express + TypeScript backend service powering AI-driven calendar automation with multi-agent orchestration, multi-platform bot integrations, and SaaS-ready infrastructure.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-green.svg)](https://expressjs.com/)
[![Bun](https://img.shields.io/badge/Bun-Runtime-orange.svg)](https://bun.sh/)
[![OpenAI Agents](https://img.shields.io/badge/OpenAI-Agents_v0.3.7-412991.svg)](https://openai.com/)
[![Jest](https://img.shields.io/badge/Jest-30.2.0-C21325.svg)](https://jestjs.io/)

## Overview

This backend service provides:

- **AI Agent Orchestration**: Multi-agent system using OpenAI Agents SDK for intelligent calendar management
- **Google Calendar Integration**: Full CRUD operations, conflict detection, gap recovery
- **Multi-Platform Bots**: Telegram bot (production) and WhatsApp bot (in development)
- **SaaS Infrastructure**: Multi-tenant architecture with Lemon Squeezy payment integration
- **Real-time Features**: Voice transcription, streaming chat responses, webhooks

---

## Features

### AI Agent System

| Component | Description |
|-----------|-------------|
| **Orchestrator Agent** | Routes user requests to specialized tools and handoff agents |
| **Direct Tools** | Fast, non-AI utilities that bypass LLM overhead for database operations |
| **Handoff Agents** | Multi-step workflow handlers for complex operations (create, update, delete) |
| **Guardrails** | Safety checks for prompt injection and mass deletion attempts |
| **Session Persistence** | Supabase-backed agent state with automatic session management |
| **Insights Generator** | AI-powered calendar analytics and productivity insights |

### AI Tools Registry

| Tool | Type | Description |
|------|------|-------------|
| `validate_user_direct` | Direct | Fast user validation in database |
| `get_timezone_direct` | Direct | Retrieve user's default timezone |
| `select_calendar_direct` | Direct | Rules-based calendar selection |
| `check_conflicts_direct` | Direct | Check for event scheduling conflicts |
| `pre_create_validation` | Direct | Combined parallel validation (user, timezone, calendar, conflicts) |
| `insert_event_direct` | Direct | Direct event insertion to Google Calendar |
| `get_event_direct` | Direct | Direct event retrieval |
| `summarize_events` | Direct | AI-powered event list summarization |
| `analyze_gaps_direct` | Direct | Analyze untracked calendar gaps |
| `fill_gap_direct` | Direct | Fill detected gaps with activities |
| `format_gaps_direct` | Direct | Format gaps for display |
| `get_event` | Agent | Event retrieval with context awareness |
| `update_event` | Agent | Event modification with validation |
| `delete_event` | Agent | Event deletion with confirmation |
| `generate_google_auth_url` | Agent | OAuth URL generation |
| `register_user_via_db` | Agent | User registration flow |

### Authentication & User Management

- Email/password signup and signin with Supabase Auth
- Google OAuth 2.0 with secure token storage and auto-refresh
- JWT-based authentication middleware
- User account deactivation and data cleanup
- Third-party authentication integration
- Session management with cookies

### Calendar Operations

| Feature | Description |
|---------|-------------|
| **Full CRUD** | Create, read, update, delete events and calendars |
| **Multi-Calendar** | Support for multiple calendars with auto-selection |
| **Quick Add** | Natural language event creation |
| **Conflict Detection** | Scheduling conflict identification |
| **Recurring Events** | RRULE format support for recurring patterns |
| **Timezone Handling** | Automatic timezone detection and conversion |
| **Free/Busy Query** | Availability checking |
| **Watch/Webhooks** | Real-time event change notifications |
| **ACL Management** | Calendar access control |
| **Colors & Settings** | Calendar customization |

### Gap Recovery System

| Feature | Description |
|---------|-------------|
| **Gap Detection** | Identify untracked time between events |
| **Context Inference** | AI-powered suggestions (travel, work, meals, breaks) |
| **One-Click Fill** | Fill gaps with suggested activities |
| **Settings Management** | Customizable thresholds and ignored days |
| **Date Range Filtering** | Analyze specific time periods |
| **Batch Operations** | Dismiss all gaps at once |

### Telegram Bot

| Feature | Description |
|---------|-------------|
| **Natural Language** | Create events via conversational messages |
| **Quick Commands** | `/today`, `/tomorrow`, `/week`, `/month` for schedule views |
| **Availability** | `/free`, `/busy` commands for time checks |
| **Event Operations** | `/create`, `/update`, `/delete` commands |
| **Session Management** | 24h TTL with auto-expiry |
| **Email Linking** | Link Telegram to Google account |
| **Context Memory** | Conversation summarization and embeddings |
| **Multi-Language** | English, Hebrew, Arabic, German, French, Russian with RTL |
| **Ally Brain** | Persistent user knowledge and preferences |
| **Rate Limiting** | Per-user rate limiting |
| **Inline Keyboards** | Interactive buttons for settings |

### WhatsApp Integration (In Development)

- Webhook-based message handling
- Natural language event processing
- Session management
- User verification flow

### Payment & Subscriptions

| Feature | Description |
|---------|-------------|
| **Lemon Squeezy** | Payment processing integration |
| **Subscription Management** | Plan upgrades, downgrades, cancellations |
| **Webhook Handling** | Real-time payment event processing |
| **Invoice Management** | Invoice generation and history |
| **Refund Processing** | Refund request handling |

### Admin Features

| Feature | Description |
|---------|-------------|
| **User Management** | View, search, and manage users |
| **Subscription Overview** | Monitor subscription statuses |
| **Audit Logs** | Security event tracking |
| **Credit Management** | Grant and manage user credits |
| **Payment Monitoring** | Transaction history and analytics |

### Voice Features

| Feature | Description |
|---------|-------------|
| **Speech-to-Text** | Voice transcription via OpenAI Whisper |
| **LiveKit Integration** | Real-time voice agent support |
| **TTS Caching** | Text-to-speech response caching |

---

## Architecture

### Project Structure

```
be/
├── ai-agents/                   # OpenAI Agent System
│   ├── sessions/                # Session persistence (Supabase)
│   ├── agents.ts                # Agent definitions
│   ├── agents-instructions.ts   # Agent prompts and instructions
│   ├── tool-registry.ts         # Tool definitions (AGENT_TOOLS, DIRECT_TOOLS)
│   ├── tool-schemas.ts          # Zod schemas for tool parameters
│   ├── tool-execution.ts        # Tool execution logic
│   ├── tool-descriptions.ts     # Tool descriptions for LLM
│   ├── direct-utilities.ts      # Fast non-AI tools
│   ├── guardrails.ts            # Safety checks
│   ├── insights-generator.ts    # Analytics insights
│   └── utils.ts                 # Agent utilities
│
├── config/                      # Configuration
│   ├── clients/                 # External clients (Supabase, etc.)
│   └── constants/               # Application constants
│
├── controllers/                 # Request handlers
│   ├── google-calendar/         # Calendar-specific controllers
│   │   ├── acl-controller.ts    # Access control
│   │   ├── calendar-controller.ts
│   │   ├── calendar-list-controller.ts
│   │   ├── channels-controller.ts
│   │   └── events-controller.ts
│   ├── users/                   # User management
│   ├── admin-controller.ts      # Admin operations
│   ├── chat-controller.ts       # Chat handling
│   ├── chat-stream-controller.ts # Streaming responses
│   ├── cron-controller.ts       # Scheduled tasks
│   ├── payment-controller.ts    # Payment processing
│   ├── voice-controller.ts      # Voice features
│   └── whatsapp-controller.ts   # WhatsApp integration
│
├── middlewares/                 # Express middleware
│   ├── auth.ts                  # Authentication
│   ├── rate-limit.ts            # Rate limiting
│   └── error-handler.ts         # Error handling
│
├── routes/                      # API routes
│   ├── google-calendar/         # Calendar routes
│   │   ├── acl-route.ts
│   │   ├── calendar-route.ts
│   │   ├── calendar-list-route.ts
│   │   ├── channels-route.ts
│   │   ├── chat-route.ts
│   │   └── events-route.ts
│   ├── admin-route.ts
│   ├── cron-route.ts
│   ├── payment-route.ts
│   ├── users-route.ts
│   ├── voice-route.ts
│   └── whatsapp-route.ts
│
├── services/                    # Business logic services
│
├── telegram-bot/                # Telegram Bot
│   ├── handlers/                # Bot handlers
│   ├── i18n/                    # Internationalization (6 languages)
│   ├── middleware/              # Bot middleware
│   ├── response-system/         # Templated responses
│   └── utils/                   # Bot utilities
│
├── whatsapp-bot/                # WhatsApp Bot
│   ├── handlers/                # Message handlers
│   ├── services/                # WhatsApp services
│   └── utils/                   # WhatsApp utilities
│
├── utils/                       # Shared utilities
│   ├── calendar/                # Calendar operations
│   ├── auth/                    # Auth utilities
│   └── conversation/            # Conversation adapters
│
├── tests/                       # Test files
├── migrations/                  # Database migrations
└── app.ts                       # Application entry point
```

### Middleware Chain

```
Request → Helmet → CORS → Rate Limit → JSON Parser → Auth → Route Handler
```

---

## API Reference

### Authentication (`/api/users`)

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
| `GET` | `/integrations/google-calendar` | Get integration status |
| `POST` | `/integrations/google-calendar/disconnect` | Disconnect calendar |
| `DELETE` | `/` | Deactivate account |

### Calendar (`/api/calendar`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all calendars |
| `POST` | `/` | Create secondary calendar |
| `GET` | `/:id` | Get calendar by ID |
| `PATCH` | `/:id` | Partial update |
| `PUT` | `/:id` | Full update |
| `DELETE` | `/:id` | Clear all events |
| `DELETE` | `/:id/delete` | Delete secondary calendar |
| `GET` | `/freebusy` | Get free/busy info |
| `GET` | `/colors` | Get available colors |
| `GET` | `/timezones` | Get timezones |
| `GET` | `/settings` | Get calendar settings |

### Events (`/api/events`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List events |
| `POST` | `/` | Create event |
| `GET` | `/:id` | Get event by ID |
| `PATCH` | `/:id` | Update event |
| `DELETE` | `/:id` | Delete event |
| `POST` | `/quick-add` | Natural language create |
| `GET` | `/analytics` | Get analytics data |
| `POST` | `/watch` | Watch for changes |
| `POST` | `/move` | Move to another calendar |
| `POST` | `/import` | Import event |
| `GET` | `/:id/instances` | Get recurring instances |

### Chat (`/api/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/stream` | Stream chat response |
| `POST` | `/` | Non-streaming chat |
| `GET` | `/conversations` | List conversations |
| `GET` | `/conversations/:id` | Get conversation |
| `DELETE` | `/conversations/:id` | Delete conversation |

### Gap Recovery (`/api/gaps`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Analyze gaps |
| `GET` | `/formatted` | Get formatted gaps |
| `POST` | `/:gapId/fill` | Fill a gap |
| `POST` | `/:gapId/skip` | Skip a gap |
| `POST` | `/dismiss-all` | Dismiss all |
| `GET` | `/settings` | Get settings |
| `PATCH` | `/settings` | Update settings |

### Admin (`/api/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List users |
| `GET` | `/users/:id` | Get user details |
| `POST` | `/users/:id/credits` | Grant credits |
| `GET` | `/subscriptions` | List subscriptions |
| `GET` | `/payments` | List payments |
| `GET` | `/audit-logs` | Get audit logs |

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Runtime** | Bun 1.0+ |
| **Framework** | Express 5.1.0 |
| **Language** | TypeScript 5.9+ |
| **AI/Agents** | OpenAI Agents SDK v0.3.7, Anthropic Claude, Google Gemini |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth, Google OAuth 2.0 |
| **Calendar** | Google Calendar API v105 |
| **Telegram Bot** | Grammy v1.38.3 |
| **Payments** | Lemon Squeezy |
| **Voice** | LiveKit, OpenAI Whisper |
| **Validation** | Zod v3.25 |
| **Email** | Resend |
| **Caching** | Redis (ioredis) |
| **Testing** | Jest v30.2, Supertest |
| **Linting** | Biome, Ultracite |

---

## Getting Started

### Prerequisites

- Bun 1.0+ or Node.js 18+
- Supabase project
- Google Cloud project with Calendar API enabled
- OpenAI API key
- Telegram Bot Token (optional)
- Lemon Squeezy account (optional)

### Environment Variables

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Anthropic (optional)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/users/callback

# Telegram (optional)
TELEGRAM_BOT_ACCESS_TOKEN=your_telegram_bot_token

# Lemon Squeezy (optional)
LEMON_SQUEEZY_API_KEY=your_api_key
LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
FE_BASE_URL=http://localhost:4000
```

### Installation

```bash
# Install dependencies
bun install

# Start development server (with hot reload)
bun dev

# Or start production server
bun start
```

### Running Tests

```bash
# Run all tests
bun test

# Run with coverage
bun test:coverage

# Run in watch mode
bun test:watch

# Run CI tests
bun test:ci
```

---

## Development

### Commands

```bash
bun dev              # Dev server with hot reload
bun start            # Production server
bun test             # Run tests
bun test:coverage    # Tests with coverage
bun run check        # Lint check (Ultracite)
bun run fix          # Auto-fix lint issues
bun run format       # Format code (Biome)
bun run sort         # Sort package.json
bun run update:db:types  # Generate Supabase types
```

### Code Style

- **Formatter**: Biome
- **Linter**: Ultracite + TypeScript ESLint
- **No semicolons**, double quotes
- **Path aliases**: Use `@/` for internal imports
- **Explicit types**: All function parameters and returns

---

## Security

- **JWT Validation**: Supabase Auth tokens
- **OAuth 2.0**: Secure Google integration
- **Rate Limiting**: Per-endpoint configurable limits
- **Input Validation**: Zod schemas for all inputs
- **CORS**: Origin whitelisting
- **Helmet**: Security headers
- **Guardrails**: AI safety checks
- **ID Token Verification**: Google OAuth signature verification
- **Audit Logging**: Security event tracking

---

## License

MIT License - see [LICENSE](../LICENSE) for details.
