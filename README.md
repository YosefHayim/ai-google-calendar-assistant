# AI Google Calendar Assistant

> **Ask Ally** - An intelligent, AI-powered calendar management platform that transforms natural language into structured Google Calendar events across multiple interfaces (Web, Voice, Telegram, WhatsApp).

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-green.svg)](https://expressjs.com/)
[![Bun](https://img.shields.io/badge/Bun-Runtime-orange.svg)](https://bun.sh/)
[![OpenAI Agents](https://img.shields.io/badge/OpenAI-Agents_v0.3.7-412991.svg)](https://openai.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Multi-Modal Architecture](#multi-modal-architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Security Architecture](#security-architecture)
- [Deployment](#deployment)
- [Development](#development)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

AI Google Calendar Assistant (Ask Ally) is a sophisticated calendar automation platform that leverages cutting-edge AI agents to provide intelligent calendar management through natural language processing. Built with a modern tech stack and designed for scalability as a multi-tenant SaaS product.

### Why Ask Ally?

- **Natural Conversations**: Talk to your calendar like you talk to a friend. Say "Schedule a meeting with John tomorrow at 2pm" and it's done.
- **Multi-Platform**: Access from web chat, voice commands, Telegram bot, or WhatsApp.
- **Smart Insights**: AI-powered analytics reveal patterns in your schedule and suggest improvements.
- **Gap Recovery**: Automatically detects untracked time and helps you remember what you did.

---

## Key Features

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **Multi-Agent AI System** | OpenAI Agents framework with specialized agents for calendar operations |
| **Natural Language Processing** | Convert free-text to structured calendar events with smart parsing |
| **Multi-Platform Support** | Web dashboard, Voice input, Telegram bot, WhatsApp integration |
| **Real-time Streaming** | Server-Sent Events (SSE) for live chat responses with typewriter effect |
| **Gap Recovery** | AI-powered detection and filling of untracked calendar gaps |
| **Voice Input** | Speech-to-text via browser API for hands-free calendar management |
| **Analytics Dashboard** | Calendar insights with 12+ interactive visualizations |
| **Multi-language** | i18n support (English, Hebrew, Arabic, German, French, Russian) with RTL |
| **SaaS-Ready** | Multi-tenant architecture with Lemon Squeezy payment integration |

### Web Dashboard Features

| Feature | Description |
|---------|-------------|
| **AI Chat Interface** | Natural language calendar management with streaming responses |
| **Multiple View Modes** | Chat view, Avatar view, and 3D wall calendar visualization |
| **Conversation History** | Persistent conversations with AI-generated titles |
| **Command Palette** | Quick navigation and actions via Cmd+K / Ctrl+K |
| **Dark/Light Theme** | System-aware theme switching with cinematic glow toggle |
| **Google OAuth** | Secure calendar integration with automatic token refresh |
| **Quick Event Dialog** | Fast event creation with preview |
| **Billing Dashboard** | Subscription management, payment history |
| **Admin Dashboard** | User management, impersonation, broadcast, audit logs (admin only) |

### AI Agent System

| Component | Description |
|-----------|-------------|
| **Orchestrator Agent** | Routes requests to specialized tools and handoff agents |
| **Direct Tools** | Fast, non-AI utilities for database operations (<100ms) |
| **Handoff Agents** | Multi-step workflow handlers for create, update, delete |
| **DPO System** | Dynamic Prompt Optimization with comprehensive logging and history tracking |
| **Guardrails** | Safety checks for prompt injection and mass deletion protection |
| **Session Persistence** | Supabase-backed agent state with automatic session management |
| **Insights Generator** | AI-powered calendar analytics and productivity insights |

### Bot Integrations

| Platform | Features |
|----------|----------|
| **Telegram** | Natural language events, quick commands (/today, /week), multi-language, inline keyboards |
| **WhatsApp** | Conversational calendar management (in development) |
| **Voice** | Real-time voice transcription with OpenAI Whisper |

### Calendar Operations

| Feature | Description |
|---------|-------------|
| **Full CRUD** | Create, read, update, delete events and calendars |
| **Multi-Calendar** | Support for multiple calendars with AI-powered auto-selection |
| **Cross-Platform Integration** | Google Calendar and Outlook support with Graph API |
| **Conflict Detection** | Intelligent scheduling conflict identification |
| **Recurring Events** | RRULE format support for recurring patterns |
| **Timezone Handling** | Automatic timezone detection and conversion |
| **Watch/Webhooks** | Real-time event change notifications from Google |

---

## System Architecture

### High-Level Overview

```
                                   AI Google Calendar Assistant
    ┌──────────────────────────────────────────────────────────────────────────────────────┐
    │                                                                                      │
    │  ┌─────────────────────────────────── CLIENTS ──────────────────────────────────┐    │
    │  │                                                                              │    │
    │  │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │    │
    │  │   │  Web App     │   │  Voice       │   │  Telegram    │   │  WhatsApp    │  │    │
    │  │   │  (Next.js)   │   │  (Browser)   │   │  Bot         │   │  Bot         │  │    │
    │  │   │  Port: 4000  │   │  Real-time   │   │  (Grammy)    │   │  (Webhook)   │  │    │
    │  │   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘  │    │
    │  │          │                  │                  │                  │          │    │
    │  └──────────┼──────────────────┼──────────────────┼──────────────────┼──────────┘    │
    │             │                  │                  │                  │               │
    │             └──────────────────┼──────────────────┼──────────────────┘               │
    │                                │                  │                                  │
    │                                ▼                  ▼                                  │
    │  ┌─────────────────────────── BACKEND API ──────────────────────────────────────┐    │
    │  │                         Express 5.1 + Bun                                    │    │
    │  │                         Port: 3000 (dev) / 8080 (prod)                       │    │
    │  │                                                                              │    │
    │  │   ┌──────────────────────────────────────────────────────────────────────┐   │    │
    │  │   │                    SHARED LAYER (Cross-Modal)                        │   │    │
    │  │   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │    │
    │  │   │  │ Tool        │  │ SDK         │  │ Context     │  │ Agent       │  │   │    │
    │  │   │  │ Handlers    │  │ Adapters    │  │ Store       │  │ Profiles    │  │   │    │
    │  │   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │    │
    │  │   └──────────────────────────────────────────────────────────────────────┘   │    │
    │  │                                                                              │    │
    │  │   ┌──────────────────────────────────────────────────────────────────────┐   │    │
    │  │   │                    AI AGENT ORCHESTRATOR                             │   │    │
    │  │   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │    │
    │  │   │  │ Direct      │  │ Agent       │  │ Handoff     │  │ Guardrails  │  │   │    │
    │  │   │  │ Tools       │  │ Tools       │  │ Agents      │  │ & Safety    │  │   │    │
    │  │   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │    │
    │  │   └──────────────────────────────────────────────────────────────────────┘   │    │
    │  │                                                                              │    │
    │  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │    │
    │  │   │  Auth    │ │ Calendar │ │  Chat    │ │  Voice   │ │ Payments │          │    │
    │  │   │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │          │    │
    │  │   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │    │
    │  └──────────────────────────────────────────────────────────────────────────────┘    │
    │                                 │                                                    │
    │                                 ▼                                                    │
    │  ┌────────────────────── EXTERNAL SERVICES ─────────────────────────────────────┐    │
    │  │                                                                              │    │
    │  │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │    │
    │  │   │  Supabase    │   │   Google     │   │   OpenAI     │   │   Redis      │  │    │
    │  │   │  PostgreSQL  │   │   Calendar   │   │   Agents     │   │   Context    │  │    │
    │  │   │  + Auth      │   │   API        │   │   SDK        │   │   Store      │  │    │
    │  │   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘  │    │
    │  │                                                                              │    │
    │  │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │    │
    │  │   │ LemonSqueezy │   │   Web APIs   │   │   Anthropic  │   │   Resend     │  │    │
    │  │   │  (Payments)  │   │   (Voice)    │   │   Claude     │   │   (Email)    │  │    │
    │  │   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘  │    │
    │  │                                                                              │    │
    │  └──────────────────────────────────────────────────────────────────────────────┘    │
    │                                                                                      │
    └──────────────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              REQUEST FLOW                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   User Input (Natural Language)                                                     │
│        │                                                                            │
│        ▼                                                                            │
│   ┌─────────────────┐                                                               │
│   │  Client Layer   │  Web / Voice / Telegram / WhatsApp                            │
│   └────────┬────────┘                                                               │
│            │                                                                        │
│            ▼                                                                        │
│   ┌─────────────────┐                                                               │
│   │  Middleware     │  Auth → Rate Limit → Validation → Token Refresh               │
│   │  Chain          │                                                               │
│   └────────┬────────┘                                                               │
│            │                                                                        │
│            ▼                                                                        │
│   ┌─────────────────┐                                                               │
│   │  Shared Layer   │  Framework-agnostic tool handlers                             │
│   └────────┬────────┘                                                               │
│            │                                                                        │
│            ▼                                                                        │
│   ┌─────────────────┐                                                               │
│   │  AI Agent       │  OpenAI Agents SDK orchestration                              │
│   │  Orchestrator   │                                                               │
│   └────────┬────────┘                                                               │
│            │                                                                        │
│            ├──────────────────┬──────────────────┐                                  │
│            ▼                  ▼                  ▼                                  │
│   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                       │
│   │  Direct Tools   │ │  Agent Tools    │ │  Handoff Agents │                       │
│   │  (Fast <100ms)  │ │  (AI-powered)   │ │  (Multi-step)   │                       │
│   └────────┬────────┘ └────────┬────────┘ └────────┬────────┘                       │
│            │                   │                   │                                │
│            └───────────────────┼───────────────────┘                                │
│                                │                                                    │
│                                ▼                                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐           │
│   │  External Services: Google Calendar API, Supabase, Redis            │           │
│   └─────────────────────────────────────────────────────────────────────┘           │
│                                │                                                    │
│                                ▼                                                    │
│   ┌─────────────────┐                                                               │
│   │  Response       │  Streaming (SSE) or JSON response                             │
│   └─────────────────┘                                                               │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Multi-Modal Architecture

A key architectural feature is the **Shared Layer** that enables code reuse across all interaction modalities (Web Chat, Voice, Telegram, WhatsApp).

### Design Principles

1. **Single Source of Truth**: Tool handlers contain pure business logic, shared across all modalities
2. **Framework Agnostic**: Core logic is independent of specific SDKs (OpenAI, Grammy)
3. **Adapter Pattern**: SDK-specific wrappers adapt shared handlers for each framework
4. **Unified Context**: Redis-backed cross-modal state enables features like pronoun resolution

### Shared Layer Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │              SHARED LAYER                   │
                    │             (be/shared/)                    │
                    │                                             │
                    │   ┌─────────────────────────────────────┐   │
                    │   │         Tool Handlers               │   │
                    │   │   (Pure business logic)             │   │
                    │   │   • event-handlers.ts               │   │
                    │   │   • direct-handlers.ts              │   │
                    │   │   • gap-handlers.ts                 │   │
                    │   └─────────────────────────────────────┘   │
                    │                     │                       │
                    │   ┌─────────────────┴─────────────────┐     │
                    │   │                                   │     │
                    │   ▼                                   ▼     │
                    │ ┌───────────────┐                       │
                    │ │ OpenAI        │                       │
                    │ │ Adapter       │                       │
                    │ └───────────────┘                       │
                    │                                             │
                    │   ┌─────────────────────────────────────┐   │
                    │   │   Unified Context Store (Redis)     │   │
                    │   │   • Cross-modal state persistence   │   │
                    │   │   • Entity tracking & resolution    │   │
                    │   │   • Conversation context            │   │
                    │   └─────────────────────────────────────┘   │
                    └─────────────────────────────────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────┐
              │                           │                       │
              ▼                           ▼                       ▼
        ┌───────────┐             ┌───────────┐           ┌───────────┐
        │   Chat    │             │   Voice   │           │  Telegram │
        │  (Web)    │             │ (Browser) │           │   (Bot)   │
        │           │             │           │           │           │
        │ OpenAI    │             │ Web APIs  │           │ OpenAI    │
        │ Agents    │             │ Agents +  │           │ Agents    │
        │ SDK       │             │ Realtime  │           │ SDK       │
        └───────────┘             └───────────┘           └───────────┘
```

### Benefits

- **Code Reuse**: Write business logic once, use everywhere
- **Consistency**: Same behavior across all platforms
- **Testability**: Pure functions are easy to unit test
- **Flexibility**: Easy to add new modalities (e.g., Slack, Discord)
- **Maintainability**: Changes propagate to all platforms automatically

---

## Project Structure

```
ai-google-calendar-assistant/
│
├── be/                              # Backend (Express + TypeScript + Bun)
│   ├── ai-agents/                   # OpenAI Agent System
│   │   ├── sessions/                # Session persistence (Supabase)
│   │   ├── agents.ts                # Agent definitions & orchestration
│   │   ├── agents-instructions.ts   # System prompts & guidelines
│   │   ├── tool-registry.ts         # Tool definitions (DIRECT, AGENT)
│   │   ├── tool-schemas.ts          # Zod validation schemas
│   │   ├── tool-execution.ts        # Tool execution logic
│   │   ├── direct-utilities.ts      # Fast non-AI utilities
│   │   ├── guardrails.ts            # Safety checks
│   │   └── insights-generator.ts    # Analytics insights
│   │
│   ├── shared/                      # Cross-Modal Shared Layer
│   │   ├── types/                   # Core interfaces (HandlerContext, Modality)
│   │   ├── tools/                   # Framework-agnostic tools
│   │   │   ├── handlers/            # Pure business logic handlers
│   │   │   └── schemas/             # Zod schemas
│   │   ├── adapters/                # SDK-specific wrappers
│   │   │   ├── openai-adapter.ts    # @openai/agents wrapper
│   │   ├── context/                 # Cross-modal context (Redis)
│   │   ├── orchestrator/            # Agent profiles & factories
│   │   ├── prompts/                 # Shared prompt templates
│   │   └── llm/                     # Multi-provider abstraction
│   │
│   ├── config/                      # Configuration
│   │   ├── clients/                 # External service clients
│   │   ├── constants/               # Application constants
│   │   └── env.ts                   # Environment validation
│   │
│   ├── controllers/                 # Request handlers
│   │   ├── google-calendar/         # Calendar controllers
│   │   └── users/                   # User management
│   │
│   ├── routes/                      # API routes
│   ├── services/                    # Business logic services
│   ├── middlewares/                 # Express middleware
│   ├── telegram-bot/                # Telegram Bot (Grammy)
│   ├── whatsapp-bot/                # WhatsApp Bot
│   ├── utils/                       # Shared utilities
│   ├── tests/                       # Test files (Jest)
│   └── app.ts                       # Application entry point
│
├── fe/                              # Frontend (Next.js 16 + React 19)
│   ├── app/                         # Next.js App Router
│   │   ├── (marketing)/             # Marketing pages group
│   │   ├── dashboard/               # Main dashboard
│   │   │   ├── analytics/           # Analytics page
│   │   │   ├── billing/             # Billing page
│   │   │   └── integrations/        # Integrations page
│   │   └── admin/                   # Admin dashboard
│   │
│   ├── components/                  # React Components
│   │   ├── 3d/                      # Three.js visualizations
│   │   ├── dashboard/               # Dashboard components
│   │   │   ├── analytics/           # 12+ chart components
│   │   │   ├── billing/             # Payment components
│   │   │   └── chat/                # Chat interface
│   │   ├── dialogs/                 # Modal dialogs (14 variants)
│   │   ├── marketing/               # Landing page components
│   │   └── ui/                      # 40+ UI primitives
│   │
│   ├── contexts/                    # React Contexts (Auth, Chat, Analytics)
│   ├── hooks/                       # Custom Hooks
│   │   └── queries/                 # TanStack Query hooks (60+)
│   ├── services/                    # API Services
│   ├── lib/                         # Utilities (Axios, Supabase)
│   └── types/                       # TypeScript types
│
├── AGENTS.md                        # AI Agent guidelines
└── README.md                        # This file
```

---

## Tech Stack

### Backend

| Category | Technologies |
|----------|-------------|
| **Runtime** | Bun 1.0+ (primary), Node.js 18+ (fallback) |
| **Framework** | Express 5.1.0 |
| **Language** | TypeScript 5.9+ |
| **AI/Agents** | OpenAI Agents SDK v0.3.7, Anthropic Claude, Google Gemini |
| **Database** | Supabase (PostgreSQL) with Row-Level Security |
| **Auth** | Supabase Auth, Google OAuth 2.0 |
| **Calendar** | Google Calendar API v105 |
| **Telegram Bot** | Grammy v1.38.3 |
| **Voice** | OpenAI Whisper |
| **Cache** | Redis (cross-modal context) |
| **Payments** | Lemon Squeezy |
| **Validation** | Zod v3.25 |
| **Testing** | Jest v30.2, Supertest |
| **Code Quality** | Biome (formatter), Ultracite (linter) |

### Frontend

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16.1.1 (App Router, Server Components) |
| **UI Library** | React 19.1.0 |
| **Language** | TypeScript 5.5+ |
| **Styling** | Tailwind CSS 3.4 |
| **Animation** | Framer Motion 12.24 |
| **Components** | Radix UI, shadcn/ui (40+ primitives) |
| **State** | TanStack Query 5.90 (server), React Context (UI) |
| **Forms** | React Hook Form 7.70, Zod 4.3 |
| **Charts** | Recharts 2.15, D3 7.9 |
| **3D Graphics** | Three.js 0.182, React Three Fiber 9.5 |
| **Voice** | Web Speech API |
| **Icons** | Lucide Icons 0.562 |

---

## Getting Started

### Prerequisites

- **Bun 1.0+** or Node.js 18+
- **Supabase** account (database + auth)
- **Google Cloud** project with Calendar API enabled
- **OpenAI API** key

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
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPEN_API_KEY=your_openai_api_key
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional (for additional features)
ANTHROPIC_API_KEY=your_anthropic_key
TELEGRAM_BOT_ACCESS_TOKEN=your_telegram_token
LEMON_SQUEEZY_API_KEY=your_lemonsqueezy_key
REDIS_URL=redis://localhost:6379
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
| `POST` | `/signin` | Sign in with credentials |
| `GET` | `/signup/google` | OAuth with Google |
| `GET` | `/callback` | OAuth callback handler |
| `POST` | `/logout` | Clear session |
| `GET` | `/get-user` | Get current user |
| `GET` | `/session` | Check session validity |
| `DELETE` | `/` | Deactivate account (GDPR) |

### Calendar (`/api/calendar`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all calendars |
| `POST` | `/` | Create secondary calendar |
| `GET` | `/:id` | Get calendar by ID |
| `PATCH` | `/:id` | Update calendar |
| `DELETE` | `/:id` | Delete calendar |
| `GET` | `/freebusy` | Get free/busy info |

### Events (`/api/events`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List events (with filters) |
| `POST` | `/` | Create event |
| `GET` | `/:id` | Get event by ID |
| `PATCH` | `/:id` | Update event |
| `DELETE` | `/:id` | Delete event |
| `POST` | `/quick-add` | Natural language create |
| `GET` | `/analytics` | Get analytics data |

### Chat (`/api/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/stream` | Stream chat response (SSE) |
| `POST` | `/` | Non-streaming chat |
| `GET` | `/conversations` | List conversations |
| `DELETE` | `/conversations/:id` | Delete conversation |

### Voice (`/api/voice`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/transcribe` | Transcribe audio |
| `POST` | `/stream` | Real-time voice streaming |

### Admin (`/api/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get user details |
| `POST` | `/users/:id/credits` | Grant credits |
| `POST` | `/users/:id/impersonate` | View app as user (God Mode) |
| `POST` | `/users/:id/revoke-sessions` | Force logout user |
| `POST` | `/broadcast` | Send broadcast notification |
| `GET` | `/audit-logs` | Get audit logs |
| `GET` | `/payments` | Get payment history |

### Newsletter (`/api/newsletter`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/subscribe` | Subscribe to newsletter |
| `POST` | `/unsubscribe` | Unsubscribe from newsletter |
| `GET` | `/status` | Get subscription status by email |

### Waiting List (`/api/waitinglist`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/join` | Join the waiting list |
| `GET` | `/position/:email` | Get position in waiting list |

### Referrals (`/api/referral`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/code` | Get user's referral code/link |
| `POST` | `/create` | Create new referral |
| `POST` | `/apply` | Apply a referral code |
| `POST` | `/convert` | Convert referral on subscription |
| `GET` | `/my-referrals` | Get user's referral history |
| `GET` | `/stats` | Get referral statistics |
| `POST` | `/claim` | Claim referral reward |
| `GET` | `/validate/:code` | Validate a referral code |

### Teams (`/api/teams`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/invite` | Send team invite |
| `GET` | `/invites/sent` | Get sent invites |
| `GET` | `/invites/received` | Get received invites |
| `POST` | `/invite/respond` | Accept/decline invite |
| `DELETE` | `/invite/:id` | Cancel invite |
| `POST` | `/invite/:id/resend` | Resend invite |
| `GET` | `/invite/:token` | Get invite details by token |
| `POST` | `/` | Create a team |
| `GET` | `/` | Get user's teams |
| `GET` | `/:teamId/members` | Get team members |

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────┐                                               │
│   │  CORS           │  Origin whitelisting                          │
│   └────────┬────────┘                                               │
│            │                                                        │
│   ┌────────▼────────┐                                               │
│   │  Helmet         │  Security headers (CSP, XSS, etc.)            │
│   └────────┬────────┘                                               │
│            │                                                        │
│   ┌────────▼────────┐                                               │
│   │  Rate Limiter   │  Per-endpoint configurable limits             │
│   └────────┬────────┘                                               │
│            │                                                        │
│   ┌────────▼────────┐                                               │
│   │  JWT Auth       │  Supabase token validation                    │
│   └────────┬────────┘                                               │
│            │                                                        │
│   ┌────────▼────────┐                                               │
│   │  Google OAuth   │  Token validation + auto-refresh              │
│   └────────┬────────┘                                               │
│            │                                                        │
│   ┌────────▼────────┐                                               │
│   │  Row-Level      │  Supabase RLS policies                        │
│   │  Security       │                                               │
│   └────────┬────────┘                                               │
│            │                                                        │
│   ┌────────▼────────┐                                               │
│   │  Guardrails     │  AI safety (prompt injection, mass delete)    │
│   └────────┬────────┘                                               │
│            │                                                        │
│   ┌────────▼────────┐                                               │
│   │  Audit Logging  │  Security event tracking                      │
│   └─────────────────┘                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Security Features

| Feature | Implementation |
|---------|----------------|
| **Authentication** | Supabase Auth with JWT validation |
| **OAuth 2.0** | Secure Google account integration |
| **Rate Limiting** | Configurable limits per endpoint |
| **Input Validation** | Zod schemas for all API inputs |
| **Row Level Security** | Supabase RLS for data isolation |
| **CORS** | Configured origin whitelisting |
| **Helmet** | Security headers |
| **AI Guardrails** | Prompt injection detection, mass deletion protection |
| **Audit Logging** | Security event tracking |
| **GDPR Compliance** | User account deletion support |

---

## Deployment

### Production Infrastructure

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐         ┌─────────────────┐               │
│   │  Vercel         │         │  AWS App Runner │               │
│   │  (Frontend)     │◄───────►│  (Backend)      │               │
│   │  Next.js SSR    │         │  Port: 8080     │               │
│   └─────────────────┘         └─────────────────┘               │
│           │                           │                         │
│           │                           │                         │
│           └───────────┬───────────────┘                         │
│                       │                                         │
│                       ▼                                         │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  SUPABASE                               │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│   │  │ PostgreSQL  │  │ Auth        │  │ Storage     │      │   │
│   │  │ + RLS       │  │ + JWT       │  │ (optional)  │      │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌───────────────────────────────────────┐                     │
│   │            EXTERNAL SERVICES          │                     │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐  │                     │
│   │  │ OpenAI  │ │ Google  │ │ Lemon   │  │                     │
│   │  │ API     │ │ Cal API │ │ Squeezy │  │                     │
│   │  └─────────┘ └─────────┘ └─────────┘  │                     │
│   └───────────────────────────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Environment Detection

| Environment | Backend Port | Frontend Port |
|-------------|--------------|---------------|
| Development | 3000 | 4000 |
| Production | 8080 | 443 (Vercel) |
| Test | 3000 | - |

---

## Development

### Backend Commands

```bash
bun dev              # Dev server with hot reload
bun start            # Production server
bun test             # Run tests
bun test:coverage    # Tests with coverage
bun run check        # Lint check (Ultracite)
bun run fix          # Auto-fix lint issues
bun run format       # Format code (Biome)
bun run update:db:types  # Generate Supabase types
```

### Frontend Commands

```bash
npm run dev          # Dev server (port 4000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # Lint code (ESLint)
npm run format       # Format code (Prettier)
npm run test         # Run tests
npm run update:db:types  # Generate Supabase types
```

### Code Conventions

| Rule | Backend | Frontend |
|------|---------|----------|
| **Semicolons** | None | None |
| **Quotes** | Double `"` | Single `'` |
| **Imports** | `@/` alias only | `@/` alias only |
| **Formatter** | Biome | Prettier |
| **Linter** | Ultracite + Biome | ESLint |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Backend README](./be/README.md) | Detailed backend documentation, API reference, tool system |
| [Frontend README](./fe/README.md) | Detailed frontend documentation, components, state management |
| [AGENTS.md](./AGENTS.md) | AI agent architecture, guidelines, and coding conventions |

---

## Roadmap

### Current Development

- [ ] WhatsApp bot completion
- [ ] Enhanced conflict resolution
- [ ] Meeting optimization suggestions
- [ ] DPO system enhancements
- [ ] Outlook integration expansion

### Planned Features

| Feature | Priority | Description |
|---------|----------|-------------|
| Slack Integration | High | Workspace calendar management |
| Mobile App | High | React Native iOS/Android |
| Zoom/Meet Auto-Link | Medium | Automatic video call links |
| Email Integration | Medium | Email-to-event parsing |
| Team Collaboration | Medium | Shared calendars, scheduling |
| Smart Reminders | Low | AI-powered reminder timing |
| Weekly Digest | Low | Automated schedule summaries |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the code style guidelines in `AGENTS.md`
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
refactor: code refactoring
test: add/update tests
chore: maintenance tasks
```

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
