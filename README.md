# Ask Ally

**AI-Powered Calendar Assistant** - A production-ready, multi-modal SaaS platform that transforms natural language into calendar events via Web, Voice, Telegram, and WhatsApp.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-green.svg)](https://expressjs.com/)
[![Bun](https://img.shields.io/badge/Bun-Runtime-orange.svg)](https://bun.sh/)
[![OpenAI Agents](https://img.shields.io/badge/OpenAI-Agents_SDK-412991.svg)](https://openai.com/)
[![AWS](https://img.shields.io/badge/AWS-App_Runner-FF9900.svg)](https://aws.amazon.com/)

---

## Overview

Ask Ally is a sophisticated calendar automation platform built with a **multi-modal, cross-platform architecture**. The system processes natural language inputs through AI agent orchestration to manage Google Calendar events, delivering responses via real-time streaming (SSE) across four distinct interaction channels.

This project demonstrates expertise in:

- **AI/ML Integration**: Multi-agent orchestration using OpenAI Agents SDK with specialized agents for different calendar operations, including a Direct Preference Optimization (DPO) system for continuous prompt refinement
- **System Design**: Framework-agnostic shared layer enabling a single codebase to power Web, Voice, Telegram, and WhatsApp interfaces through the Adapter Pattern
- **Real-time Systems**: Server-Sent Events (SSE) streaming, WebSocket voice transcription, and Redis-backed cross-modal context persistence
- **Full-Stack Development**: Next.js 16 App Router frontend with 60+ TanStack Query hooks, Express 5 backend running on Bun runtime
- **Production Infrastructure**: AWS App Runner deployment with multi-tenant SaaS architecture, Row-Level Security, and comprehensive audit logging

---

## Technical Highlights

| Area | Implementation |
|------|----------------|
| **Multi-Agent AI** | OpenAI Agents SDK orchestrating specialized agents (create, update, delete) with guardrails for prompt injection and mass deletion protection |
| **Cross-Modal Architecture** | Shared business logic layer serving 4 platforms (Web/Voice/Telegram/WhatsApp) through framework-agnostic tool handlers |
| **Real-time Streaming** | SSE-based chat responses with typewriter effect; sub-100ms direct tools for database operations |
| **DPO System** | Dynamic Prompt Optimization with comprehensive logging, history tracking, and A/B testing capabilities |
| **Internationalization** | 6 languages (EN, HE, AR, DE, FR, RU) with full RTL support in Telegram bot |
| **State Management** | TanStack Query (60+ hooks) for server state, React Context for UI state, Redis for cross-modal context |
| **Security Layers** | JWT auth, Row-Level Security, rate limiting, input validation (Zod), AI guardrails, audit logging |
| **Production Deploy** | AWS App Runner (backend), Vercel (frontend), Supabase (PostgreSQL + Auth) |

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

### Request Flow

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

## Multi-Modal Shared Layer

A key architectural decision is the **Shared Layer** that enables code reuse across all interaction modalities.

### Design Principles

1. **Single Source of Truth**: Tool handlers contain pure business logic, shared across all modalities
2. **Framework Agnostic**: Core logic is independent of specific SDKs (OpenAI, Grammy)
3. **Adapter Pattern**: SDK-specific wrappers adapt shared handlers for each framework
4. **Unified Context**: Redis-backed cross-modal state enables features like pronoun resolution

### Architecture

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

---

## Tech Stack

### Backend

| Category | Technology | Notes |
|----------|------------|-------|
| **Runtime** | Bun 1.0+ | Primary runtime (Node.js 18+ fallback) |
| **Framework** | Express 5.1 | Latest major version with async middleware |
| **Language** | TypeScript 5.9+ | Strict mode, path aliases |
| **AI/Agents** | OpenAI Agents SDK | Multi-agent orchestration with handoffs |
| **Multi-Model** | Anthropic Claude, Google Gemini | Provider abstraction layer |
| **Database** | Supabase PostgreSQL | Row-Level Security policies |
| **Auth** | Supabase Auth + Google OAuth 2.0 | JWT validation, auto-refresh |
| **Cache** | Redis | Cross-modal context persistence |
| **Bot Framework** | Grammy | Telegram bot with i18n, RTL support |
| **Voice** | OpenAI Whisper | Speech-to-text transcription |
| **Payments** | Lemon Squeezy | Subscription management |
| **Validation** | Zod | Runtime schema validation |
| **Testing** | Jest, Supertest | Unit and integration tests |

### Frontend

| Category | Technology | Notes |
|----------|------------|-------|
| **Framework** | Next.js 16 | App Router, Server Components |
| **UI Library** | React 19 | Concurrent features, use() hook |
| **Styling** | Tailwind CSS 3.4 | Utility-first with custom design system |
| **Components** | shadcn/ui | 40+ accessible primitives (Radix-based) |
| **State** | TanStack Query 5.90 | 60+ custom hooks for server state |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **Animation** | Framer Motion | Page transitions, micro-interactions |
| **Charts** | Recharts, D3 | 12+ analytics visualizations |
| **3D Graphics** | Three.js, React Three Fiber | Wall calendar visualization |

### Infrastructure

| Category | Technology | Notes |
|----------|------------|-------|
| **Backend Hosting** | AWS App Runner | Container-based auto-scaling |
| **Frontend Hosting** | Vercel | Edge functions, SSR |
| **Database** | Supabase | Managed PostgreSQL, Auth, Storage |
| **CDN** | CloudFront | Static asset delivery |

---

## Project Structure

```
ai-google-calendar-assistant/
├── be/                              # Backend (Express + Bun)
│   ├── ai-agents/                   # OpenAI Agent System
│   │   ├── agents.ts                # Agent definitions & orchestration
│   │   ├── tool-registry.ts         # Tool definitions (DIRECT, AGENT)
│   │   ├── guardrails.ts            # Safety checks (injection, mass delete)
│   │   └── insights-generator.ts    # AI-powered analytics
│   │
│   ├── shared/                      # Cross-Modal Shared Layer
│   │   ├── tools/handlers/          # Pure business logic handlers
│   │   ├── adapters/                # SDK-specific wrappers (OpenAI)
│   │   ├── context/                 # Cross-modal context (Redis)
│   │   └── orchestrator/            # Agent profiles & factories
│   │
│   ├── telegram-bot/                # Grammy bot (1,100+ lines)
│   ├── controllers/                 # 25+ route handlers
│   ├── middlewares/                 # Auth, validation, rate limiting
│   └── services/                    # Business logic (payments, admin)
│
├── fe/                              # Frontend (Next.js 16 + React 19)
│   ├── app/                         # App Router pages
│   │   ├── dashboard/               # Main dashboard
│   │   └── admin/                   # Admin panel
│   │
│   ├── components/                  # React Components
│   │   ├── dashboard/analytics/     # 12+ chart components
│   │   ├── dialogs/                 # 14 modal variants
│   │   └── ui/                      # 40+ primitives (shadcn/ui)
│   │
│   ├── hooks/queries/               # TanStack Query (60+ hooks)
│   └── contexts/                    # Auth, Chat, Analytics
│
└── infra/                           # AWS CloudFront, App Runner configs
```

---

## Key Features

### AI Agent System

| Component | Description |
|-----------|-------------|
| **Orchestrator Agent** | Routes requests to specialized tools and handoff agents |
| **Direct Tools** | Fast, non-AI utilities for database operations (<100ms) |
| **Handoff Agents** | Multi-step workflow handlers for create, update, delete |
| **DPO System** | Dynamic Prompt Optimization with logging and history tracking |
| **Guardrails** | Prompt injection detection, mass deletion protection |
| **Insights Generator** | AI-powered calendar analytics and productivity insights |

### Platform Capabilities

| Feature | Implementation |
|---------|----------------|
| **Web Chat** | Streaming SSE responses with typewriter effect |
| **Voice Input** | Browser Web Speech API + OpenAI Whisper |
| **Telegram Bot** | Grammy framework, inline keyboards, 6 languages |
| **Analytics Dashboard** | 12+ interactive Recharts/D3 visualizations |
| **Gap Recovery** | AI-powered untracked time detection and filling |
| **Admin Panel** | User management, impersonation, broadcast, audit logs |

---

## API Overview

| Domain | Endpoints | Key Operations |
|--------|-----------|----------------|
| **Auth** | 8 routes | OAuth, JWT, sessions, GDPR deletion |
| **Calendar** | 6 routes | CRUD, free/busy queries |
| **Events** | 7 routes | CRUD, quick-add (NLP), analytics |
| **Chat** | 4 routes | SSE streaming, conversations |
| **Voice** | 2 routes | Transcription, real-time streaming |
| **Admin** | 7 routes | Users, credits, impersonation, audit |
| **Payments** | 6 routes | Subscriptions, webhooks, billing |

---

## Security

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                                  │
├─────────────────────────────────────────────────────────────────────┤
│   ┌─────────────────┐                                               │
│   │  CORS           │  Origin whitelisting                          │
│   └────────┬────────┘                                               │
│   ┌────────▼────────┐                                               │
│   │  Helmet         │  Security headers (CSP, XSS, etc.)            │
│   └────────┬────────┘                                               │
│   ┌────────▼────────┐                                               │
│   │  Rate Limiter   │  Per-endpoint configurable limits             │
│   └────────┬────────┘                                               │
│   ┌────────▼────────┐                                               │
│   │  JWT Auth       │  Supabase token validation                    │
│   └────────┬────────┘                                               │
│   ┌────────▼────────┐                                               │
│   │  Google OAuth   │  Token validation + auto-refresh              │
│   └────────┬────────┘                                               │
│   ┌────────▼────────┐                                               │
│   │  Row-Level      │  Supabase RLS policies                        │
│   │  Security       │                                               │
│   └────────┬────────┘                                               │
│   ┌────────▼────────┐                                               │
│   │  Guardrails     │  AI safety (prompt injection, mass delete)    │
│   └────────┬────────┘                                               │
│   ┌────────▼────────┐                                               │
│   │  Audit Logging  │  Security event tracking                      │
│   └─────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Deployment

### Production Architecture

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

---

## Getting Started

### Prerequisites

- Bun 1.0+ (or Node.js 18+)
- Supabase account
- Google Cloud project with Calendar API
- OpenAI API key

### Quick Start

```bash
# Clone and setup backend
cd be && cp .env.example .env && bun install && bun dev

# In new terminal, setup frontend
cd fe && cp env.example .env.local && npm install && npm run dev
```

Backend: `http://localhost:3000` | Frontend: `http://localhost:4000`

---

## Documentation

| Document | Description |
|----------|-------------|
| [Backend README](./be/README.md) | API reference, tool system, middleware |
| [Frontend README](./fe/README.md) | Components, state management, hooks |
| [AGENTS.md](./AGENTS.md) | AI architecture, coding conventions |

---

## License

MIT License - see [LICENSE](LICENSE) for details.
