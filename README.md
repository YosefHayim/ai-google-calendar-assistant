# AI Google Calendar Assistant

> An intelligent, AI-powered calendar management platform that transforms natural language into structured Google Calendar events across multiple interfaces (Web, Telegram, WhatsApp).

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-green.svg)](https://expressjs.com/)
[![Bun](https://img.shields.io/badge/Bun-Runtime-orange.svg)](https://bun.sh/)
[![OpenAI Agents](https://img.shields.io/badge/OpenAI-Agents_v0.3.7-412991.svg)](https://openai.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Overview

AI Google Calendar Assistant is a sophisticated calendar automation platform that leverages cutting-edge AI agents to provide intelligent calendar management through natural language processing. Built with a modern tech stack and designed for scalability as a multi-tenant SaaS product.

### Key Highlights

- **Multi-Agent AI Architecture**: OpenAI Agents framework with specialized agents for calendar operations
- **Natural Language Processing**: Convert free-text to structured calendar events with smart parsing
- **Multi-Platform Support**: Web dashboard, Telegram bot, and WhatsApp integration
- **Gap Recovery**: AI-powered detection and filling of untracked calendar gaps
- **Voice Input**: Speech-to-text for hands-free calendar management
- **Analytics Dashboard**: Calendar insights with interactive visualizations
- **SaaS-Ready**: Multi-tenant architecture with Lemon Squeezy payment integration

---

## Architecture Overview

```
                                   AI Google Calendar Assistant
    ┌──────────────────────────────────────────────────────────────────────────────────┐
    │                                                                                  │
    │  ┌─────────────────────────────────── CLIENTS ──────────────────────────────┐    │
    │  │                                                                          │    │
    │  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │    │
    │  │   │  Web App     │    │  Telegram    │    │  WhatsApp    │               │    │
    │  │   │  (Next.js)   │    │  Bot         │    │  Bot         │               │    │
    │  │   │  Port: 4000  │    │  (Grammy)    │    │  (Webhook)   │               │    │
    │  │   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘               │    │
    │  │          │                   │                   │                       │    │
    │  └──────────┼───────────────────┼───────────────────┼───────────────────────┘    │
    │             │                   │                   │                            │
    │             └───────────────────┼───────────────────┘                            │
    │                                 │                                                │
    │                                 ▼                                                │
    │  ┌─────────────────────────── BACKEND API ──────────────────────────────────┐    │
    │  │                         Express 5.1 + Bun                                │    │
    │  │                            Port: 3000                                    │    │
    │  │                                                                          │    │
    │  │   ┌────────────────────────────────────────────────────────────────┐     │    │
    │  │   │                    AI AGENT ORCHESTRATOR                       │     │    │
    │  │   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │     │    │
    │  │   │  │ Direct      │  │ Handoff     │  │ Guardrails  │            │     │    │
    │  │   │  │ Tools       │  │ Agents      │  │ & Safety    │            │     │    │
    │  │   │  └─────────────┘  └─────────────┘  └─────────────┘            │     │    │
    │  │   └────────────────────────────────────────────────────────────────┘     │    │
    │  │                                                                          │    │
    │  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │    │
    │  │   │  Auth    │ │ Calendar │ │  Chat    │ │   Gaps   │ │ Payments │      │    │
    │  │   │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │      │    │
    │  │   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │    │
    │  └──────────────────────────────────────────────────────────────────────────┘    │
    │                                 │                                                │
    │                                 ▼                                                │
    │  ┌────────────────────── EXTERNAL SERVICES ─────────────────────────────────┐    │
    │  │                                                                          │    │
    │  │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                 │    │
    │  │   │  Supabase    │   │   Google     │   │   OpenAI     │                 │    │
    │  │   │  (Database   │   │   Calendar   │   │   Agents     │                 │    │
    │  │   │   + Auth)    │   │   API        │   │   SDK        │                 │    │
    │  │   └──────────────┘   └──────────────┘   └──────────────┘                 │    │
    │  │                                                                          │    │
    │  │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                 │    │
    │  │   │ LemonSqueezy │   │   LiveKit    │   │   Resend     │                 │    │
    │  │   │  (Payments)  │   │   (Voice)    │   │   (Email)    │                 │    │
    │  │   └──────────────┘   └──────────────┘   └──────────────┘                 │    │
    │  │                                                                          │    │
    │  └──────────────────────────────────────────────────────────────────────────┘    │
    │                                                                                  │
    └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

### Web Dashboard

| Feature | Description |
|---------|-------------|
| **AI Chat Interface** | Natural language calendar management with streaming responses |
| **Voice Input** | Speech-to-text for hands-free interaction |
| **Multiple View Modes** | Chat view, Avatar view, and 3D view modes |
| **Analytics Dashboard** | Calendar insights with heatmaps, time allocation charts |
| **Conversation History** | Persistent conversations with AI-generated titles |
| **Dark/Light Theme** | System-aware theme switching with cinematic glow toggle |
| **Google OAuth** | Secure calendar integration with token auto-refresh |
| **Gap Recovery Panel** | Analyze and fill untracked calendar gaps |
| **Quick Event Dialog** | Fast event creation with preview |
| **Billing Dashboard** | Subscription management, payment history |
| **Admin Dashboard** | User management, audit logs (admin only) |

### AI Agent System

| Component | Description |
|-----------|-------------|
| **Orchestrator Agent** | Routes requests to specialized tools and handoff agents |
| **Direct Tools** | Fast, non-AI utilities for database operations (bypass LLM overhead) |
| **Handoff Agents** | Multi-step workflow handlers for create, update, delete |
| **Guardrails** | Safety checks for prompt injection and mass deletion |
| **Session Persistence** | Supabase-backed agent state with automatic session management |
| **Insights Generator** | AI-powered calendar analytics and productivity insights |

### Telegram Bot

| Feature | Description |
|---------|-------------|
| **Natural Language** | Create events via conversational messages |
| **Quick Commands** | `/today`, `/tomorrow`, `/week`, `/month` for schedule views |
| **Multi-Language** | English, Hebrew, Arabic, German, French, Russian with RTL |
| **Ally Brain** | Persistent user knowledge and preferences |
| **Session Management** | 24h TTL with auto-expiry |
| **Inline Keyboards** | Interactive buttons for settings |

### Gap Recovery

| Feature | Description |
|---------|-------------|
| **Gap Detection** | Identify untracked time between events |
| **Context Inference** | AI-powered suggestions (travel, work, meals, breaks) |
| **One-Click Fill** | Fill gaps with suggested activities |
| **Settings Management** | Customizable thresholds and ignored days |

### Calendar Operations

| Feature | Description |
|---------|-------------|
| **Full CRUD** | Create, read, update, delete events and calendars |
| **Multi-Calendar** | Support for multiple calendars with auto-selection |
| **Conflict Detection** | Scheduling conflict identification |
| **Recurring Events** | RRULE format support for recurring patterns |
| **Timezone Handling** | Automatic timezone detection and conversion |
| **Watch/Webhooks** | Real-time event change notifications |

---

## Project Structure

```
ai-google-calendar-assistant/
│
├── be/                              # Backend (Express + TypeScript + Bun)
│   ├── ai-agents/                   # OpenAI Agent implementations
│   │   ├── agents.ts                # Agent definitions
│   │   ├── tool-registry.ts         # Tool definitions
│   │   ├── guardrails.ts            # Safety checks
│   │   └── insights-generator.ts    # Analytics insights
│   ├── controllers/                 # Request handlers
│   │   └── google-calendar/         # Calendar controllers
│   ├── routes/                      # API routes
│   ├── telegram-bot/                # Telegram integration
│   ├── whatsapp-bot/                # WhatsApp integration
│   ├── middlewares/                 # Express middleware
│   ├── services/                    # Business logic
│   ├── utils/                       # Shared utilities
│   ├── tests/                       # Test files
│   └── app.ts                       # Entry point
│
├── fe/                              # Frontend (Next.js 16 + React 19)
│   ├── app/                         # Next.js App Router
│   │   ├── dashboard/               # Dashboard pages
│   │   ├── admin/                   # Admin pages
│   │   └── ...                      # Marketing pages
│   ├── components/                  # React components
│   │   ├── dashboard/               # Dashboard components
│   │   ├── dialogs/                 # Modal dialogs
│   │   └── ui/                      # UI primitives
│   ├── contexts/                    # React contexts
│   ├── hooks/                       # Custom hooks
│   ├── services/                    # API services
│   └── lib/                         # Utilities
│
├── AGENTS.md                        # AI Agent guidelines
└── README.md                        # This file
```

---

## Tech Stack

### Backend

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
| **Testing** | Jest v30.2 |

### Frontend

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16.1.1 (App Router) |
| **UI Library** | React 19.1.0 |
| **Language** | TypeScript 5.5+ |
| **Styling** | Tailwind CSS 3.4 |
| **Animation** | Framer Motion 12.24 |
| **Components** | Radix UI, shadcn/ui |
| **State** | TanStack Query 5.90, React Context |
| **Charts** | Recharts 2.15, D3 7.9 |
| **3D Graphics** | Three.js 0.182 |
| **Icons** | Lucide Icons |

---

## Getting Started

### Prerequisites

- Bun 1.0+ or Node.js 18+
- Supabase account
- Google Cloud project with Calendar API enabled
- OpenAI API key

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-google-calendar-assistant.git
cd ai-google-calendar-assistant

# Setup backend
cd be
cp .env.example .env
# Edit .env with your credentials
bun install
bun dev

# In a new terminal, setup frontend
cd fe
cp env.example .env.local
# Edit .env.local with your credentials
npm install
npm run dev
```

The backend runs on `http://localhost:3000` and frontend on `http://localhost:4000`.

### Environment Variables

#### Backend (`/be/.env`)

```env
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPEN_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional
FRONTEND_URL=http://localhost:4000
TELEGRAM_BOT_ACCESS_TOKEN=your_telegram_token
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_key
```

See `/be/.env.example` for all available options.

#### Frontend (`/fe/.env.local`)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See `/fe/env.example` for all available options.

---

## API Reference

### Authentication (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register with email/password |
| `POST` | `/signin` | Sign in |
| `GET` | `/signup/google` | OAuth with Google |
| `GET` | `/callback` | OAuth callback |
| `POST` | `/logout` | Clear session |
| `GET` | `/get-user` | Get current user |

### Calendar (`/api/calendar`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all calendars |
| `POST` | `/` | Create calendar |
| `GET` | `/:id` | Get calendar |
| `PATCH` | `/:id` | Update calendar |
| `DELETE` | `/:id` | Delete calendar |

### Events (`/api/events`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List events |
| `POST` | `/` | Create event |
| `GET` | `/:id` | Get event |
| `PATCH` | `/:id` | Update event |
| `DELETE` | `/:id` | Delete event |
| `POST` | `/quick-add` | Natural language create |
| `GET` | `/analytics` | Get analytics |

### Chat (`/api/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/stream` | Stream chat response |
| `GET` | `/conversations` | List conversations |
| `DELETE` | `/conversations/:id` | Delete conversation |

### Gap Recovery (`/api/gaps`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Analyze gaps |
| `POST` | `/:gapId/fill` | Fill a gap |
| `GET` | `/settings` | Get settings |
| `PATCH` | `/settings` | Update settings |

---

## Development

### Backend Commands

```bash
bun dev              # Dev server with hot reload
bun start            # Production server
bun test             # Run tests
bun test:coverage    # Tests with coverage
bun run check        # Lint check
bun run format       # Format code
```

### Frontend Commands

```bash
npm run dev          # Dev server (port 4000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # Lint code
npm run format       # Format code
npm run test         # Run tests
```

---

## Documentation

- **Backend**: See [`/be/README.md`](./be/README.md) for detailed backend documentation
- **Frontend**: See [`/fe/README.md`](./fe/README.md) for detailed frontend documentation
- **AI Agents**: See [`AGENTS.md`](./AGENTS.md) for AI agent guidelines

---

## Security

- **Authentication**: Supabase Auth with JWT validation
- **OAuth 2.0**: Secure Google account integration
- **Rate Limiting**: Configurable limits per endpoint
- **Input Validation**: Zod schemas for all inputs
- **Row Level Security**: Supabase RLS for data isolation
- **CORS**: Configured origin whitelisting
- **Helmet**: Security headers
- **Guardrails**: AI safety checks for malicious inputs
- **Audit Logging**: Security event tracking

---

## Roadmap

### In Development

- [ ] WhatsApp bot completion
- [ ] Enhanced conflict resolution
- [ ] Meeting optimization suggestions

### Planned Features

| Feature | Priority |
|---------|----------|
| Slack Integration | High |
| Mobile App (React Native) | High |
| Zoom/Meet Auto-Link | Medium |
| Email Integration | Medium |
| Team Collaboration | Medium |
| Smart Reminders | Low |
| Weekly Digest | Low |

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
