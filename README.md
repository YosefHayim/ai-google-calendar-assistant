# AI Google Calendar Assistant

> An intelligent, AI-powered calendar management platform that transforms natural language into structured Google Calendar events across multiple interfaces (Web, Telegram, WhatsApp).

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5.1.0-green.svg)](https://nodejs.org/)
[![OpenAI Agents](https://img.shields.io/badge/OpenAI-Agents_v0.3.0-412991.svg)](https://openai.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Overview

AI Google Calendar Assistant is a sophisticated calendar automation platform that leverages cutting-edge AI agents to provide intelligent calendar management through natural language processing. Originally built for personal use, the architecture is designed to scale into a multi-tenant SaaS product with subscription-based billing.

### What Makes This Project Stand Out

- **Multi-Agent AI Architecture**: Utilizes OpenAI's Agents framework with specialized agents for different calendar operations
- **Natural Language Processing**: Converts free-text input into structured calendar events with smart parsing
- **Multilingual Support**: Handles English, Hebrew, and Arabic for event processing
- **Multi-Interface Design**: Web dashboard, Telegram bot, and WhatsApp webhook integration
- **Domain-Driven Design**: Clean architecture with repository pattern and dependency injection
- **Modern Tech Stack**: Next.js 15, React 19, Express 5, TypeScript throughout

---

## Key Features

### Intelligent Calendar Management

- **Natural Language Event Creation**: "Meeting with John tomorrow at 2pm for 1 hour" → Structured calendar event
- **Smart Calendar Selection**: AI analyzes event content to automatically select the appropriate calendar
- **Timezone Intelligence**: Automatic timezone detection and handling with fallback strategies
- **Duration Parsing**: Supports various formats (e.g., "1am-3am", "60 minutes", all-day events)
- **Multi-Language Support**: Processes events in English, Hebrew, and Arabic

### AI Agent System

**Orchestrator Agent** coordinates multiple specialized tools:

| Tool | Description |
|------|-------------|
| `generateGoogleAuthUrl` | Generates OAuth URL for Google Calendar authentication |
| `registerUser` | Creates user accounts via Supabase Auth |
| `validateUser` | Verifies user existence and retrieves tokens |
| `validateEventData` | Parses and normalizes event data from natural language |
| `createEvent` | Creates calendar events |
| `retrieveEvent` | Fetches events by ID or keywords |
| `updateEvent` | Modifies existing events |
| `deleteEvent` | Removes events from calendar |
| `selectCalendar` | Intelligently selects appropriate calendar for events |
| `parseEventText` | Converts natural language to event structure |
| `getUserDefaultTimeZone` | Retrieves user's configured timezone |

**Advanced Features**:
- Parallel tool execution enabled for efficiency
- Handoff agents for complex multi-step workflows (e.g., `createEventHandoff`)
- Custom error handling per tool
- Detailed agent instructions following OpenAI's recommended prompt format

### Multi-Platform Interfaces

1. **Web Dashboard**
   - Voice and text input support
   - Interactive onboarding wizard with checklist
   - Real-time calendar management
   - Agent name customization
   - Modern glassmorphism UI with animations (Aurora, particles, meteors, confetti)

2. **Telegram Bot** (Grammy v1.38.3)
   - Conversational interface with session management
   - `/start` and `/exit` commands
   - Continuous conversation flow with context
   - Message deduplication
   - Error handling with user feedback

3. **WhatsApp Integration** (In Development)
   - Webhook-based communication
   - Message processing pipeline

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Interfaces                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Web Dashboard│  │ Telegram Bot │  │  WhatsApp    │      │
│  │  (Next.js)   │  │   (Grammy)   │  │   Webhook    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                      Express API Server                       │
│                             │                                 │
│  ┌──────────────────────────┼──────────────────────────┐     │
│  │           Orchestrator Agent (OpenAI Agents)         │     │
│  │                          │                           │     │
│  │  ┌───────────────────────┴────────────────────┐     │     │
│  │  │        Specialized Tools Pool              │     │     │
│  │  ├────────────────────────────────────────────┤     │     │
│  │  │ • createEvent      • updateEvent           │     │     │
│  │  │ • deleteEvent      • retrieveEvent         │     │     │
│  │  │ • validateUser     • registerUser          │     │     │
│  │  │ • selectCalendar   • validateEventData     │     │     │
│  │  │ • parseEventText   • getUserDefaultTimeZone│     │     │
│  │  └────────────────────────────────────────────┘     │     │
│  └──────────────────────────────────────────────────────┘     │
│                             │                                 │
│  ┌──────────────────────────┼──────────────────────────┐     │
│  │        Domain Layer (DDD Pattern)                    │     │
│  ├──────────────────────────────────────────────────────┤     │
│  │  Entities: User, Calendar, Event                     │     │
│  │  Repositories: IUserRepo, ICalendarRepo, IEventRepo  │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────┼─────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────┴────────┐  ┌───────┴────────┐  ┌──────┴──────┐
│   Supabase      │  │ Google Calendar│  │   OpenAI    │
│  (PostgreSQL)   │  │      API       │  │     API     │
└─────────────────┘  └────────────────┘  └─────────────┘
```

### Project Structure

```
ai-google-calendar-assistant/
├── be/                              # Backend (Express + TypeScript)
│   ├── ai-agents/                   # OpenAI Agent implementations
│   │   ├── agents.ts                # Agent definitions
│   │   ├── agents-instructions.ts   # Detailed agent instructions
│   │   ├── tool-registry.ts         # Tool definitions and registration
│   │   ├── tool-execution.ts        # Tool implementation logic
│   │   ├── tool-schemas.ts          # Zod schemas for tool parameters
│   │   ├── tool-descriptions.ts     # User-facing tool descriptions
│   │   ├── agent-handoff-descriptions.ts  # Handoff agent descriptions
│   │   └── utils.ts                 # Agent utility functions
│   ├── config/                      # Configuration management
│   │   ├── clients/                 # External client configs
│   │   │   └── google-oauth.ts      # Google OAuth2 client
│   │   ├── constants/               # Application constants
│   │   │   └── http.ts              # HTTP/route constants
│   │   └── env.ts                   # Environment configuration
│   ├── controllers/                 # Request handlers
│   │   ├── calendar-controller.ts   # Calendar operations
│   │   ├── events-controller.ts     # Event operations
│   │   └── users-controller.ts      # User management
│   ├── domain/                      # Domain-Driven Design layer
│   │   ├── entities/                # Core business entities
│   │   │   ├── User.ts              # User entity with preferences
│   │   │   ├── Event.ts             # Calendar event entity
│   │   │   └── Calendar.ts          # Calendar entity
│   │   └── repositories/            # Repository interfaces
│   │       ├── IUserRepository.ts
│   │       ├── ICalendarRepository.ts
│   │       └── IEventRepository.ts
│   ├── infrastructure/              # External integrations
│   │   ├── di/                      # Dependency injection (Inversify)
│   │   │   └── container.ts         # DI container configuration
│   │   └── repositories/            # Repository implementations
│   │       ├── SupabaseUserRepository.ts
│   │       ├── GoogleCalendarEventRepository.ts
│   │       ├── GoogleCalendarCalendarRepository.ts
│   │       └── mappers/             # Data mappers
│   ├── middlewares/                 # Express middleware
│   │   ├── auth-handler.ts          # JWT authentication
│   │   └── error-handler.ts         # Global error handling
│   ├── routes/                      # API route definitions
│   │   ├── users.ts                 # User routes
│   │   ├── whatsapp-route.ts        # WhatsApp webhook
│   │   └── google-calendar/         # Calendar routes
│   │       ├── calendar-route.ts    # Calendar endpoints
│   │       └── events-route.ts      # Event endpoints
│   ├── telegram-bot/                # Telegram integration
│   │   ├── init-bot.ts              # Bot initialization
│   │   └── middleware/              # Bot middleware
│   │       └── auth-tg-handler.ts   # Telegram authentication
│   ├── utils/                       # Utility functions
│   │   ├── ai/                      # AI utilities
│   │   ├── auth/                    # Authentication helpers
│   │   ├── calendar/                # Calendar utilities
│   │   ├── date/                    # Date formatting
│   │   └── http/                    # HTTP helpers
│   ├── app.ts                       # Express server entry point
│   ├── types.ts                     # TypeScript type definitions
│   └── database.types.ts            # Supabase auto-generated types
│
├── fe/                              # Frontend (Next.js 15 + React 19)
│   ├── app/                         # Next.js App Router
│   │   ├── page.tsx                 # Landing page
│   │   ├── layout.tsx               # Root layout
│   │   ├── globals.css              # Global styles
│   │   ├── login/page.tsx           # Login page
│   │   ├── register/page.tsx        # Registration page
│   │   ├── dashboard/page.tsx       # Main dashboard
│   │   ├── pricing/page.tsx         # Pricing page
│   │   ├── contact/page.tsx         # Contact page
│   │   ├── terms/page.tsx           # Terms of service
│   │   ├── privacy/page.tsx         # Privacy policy
│   │   └── api/                     # API route handlers (proxy to backend)
│   ├── components/                  # React components (25+ components)
│   │   ├── ui/                      # Reusable UI components
│   │   │   ├── aurora-background.tsx
│   │   │   ├── particles.tsx
│   │   │   ├── meteors.tsx
│   │   │   ├── confetti.tsx
│   │   │   ├── ai-voice-input.tsx
│   │   │   ├── placeholders-and-vanish-input.tsx
│   │   │   ├── 3d-card.tsx
│   │   │   ├── magnetic-button.tsx
│   │   │   ├── rainbow-button.tsx
│   │   │   ├── onboarding-wizard.tsx
│   │   │   ├── onboarding-checklist.tsx
│   │   │   └── ... (more components)
│   │   ├── auth/                    # Authentication components
│   │   ├── navbar.tsx               # Navigation bar
│   │   ├── footer.tsx               # Footer
│   │   ├── providers.tsx            # Context providers
│   │   └── theme-toggle.tsx         # Dark mode toggle
│   ├── lib/                         # Utilities and helpers
│   │   ├── api/                     # API client functions
│   │   │   ├── config.ts            # API configuration
│   │   │   ├── client.ts            # Client-side API functions
│   │   │   ├── server.ts            # Server-side API functions
│   │   │   ├── types.ts             # TypeScript interfaces
│   │   │   └── utils/proxy.ts       # Request proxying
│   │   ├── supabase/                # Supabase integration
│   │   │   ├── auth.ts              # Authentication functions
│   │   │   ├── client.ts            # Browser client
│   │   │   ├── server.ts            # Server client
│   │   │   └── middleware.ts        # Auth middleware
│   │   └── utils.ts                 # Helper functions
│   ├── hooks/                       # React hooks
│   │   └── use-auth.ts              # Authentication hook
│   └── public/                      # Static assets
│
└── ai-design-v1/                    # AI design resources
```

---

## API Documentation

### User Routes (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/get-user` | Required | Get current user information |
| `DELETE` | `/` | Required | Deactivate user account |
| `GET` | `/callback` | - | OAuth callback handler |
| `POST` | `/verify-user-by-email-otp` | - | Email OTP verification |
| `POST` | `/signup` | - | Register new user |
| `POST` | `/signin` | - | Sign in existing user |
| `GET` | `/signup/google` | - | Sign up/in with Google OAuth |
| `GET` | `/signup/github` | - | Sign up/in with GitHub OAuth |

### Calendar Routes (`/api/calendars`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Required | List all user calendars |
| `GET` | `/:id` | Required | Get calendar info by ID |
| `GET` | `/colors` | Required | Get available calendar colors |
| `GET` | `/colors/:id` | Required | Get specific calendar color |
| `GET` | `/timezones` | Required | Get available timezones |
| `GET` | `/timezones/:id` | Required | Get calendar timezone |

### Event Routes (`/api/calendars/events`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Required | List all user events |
| `GET` | `/filtered` | Required | Get filtered events with query params |
| `GET` | `/:id` | Required | Get specific event by ID |
| `POST` | `/` | Required | Create new event |
| `PATCH` | `/:id` | Required | Update event |
| `DELETE` | `/:id` | Required | Delete event |

### WhatsApp Routes (`/api/whatsapp`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/webhook` | WhatsApp message webhook |

---

## Database Schema

### Supabase Tables

| Table | Description |
|-------|-------------|
| `calendar_categories` | User calendar mappings with metadata (timezone, reminders, access role) |
| `conversation_embeddings` | Vector embeddings for semantic search of conversation history |
| `conversation_messages` | Chat message history storage |
| `telegram_user_links` | Links between Telegram users and system accounts |
| `user_calendar_tokens` | Google OAuth access/refresh tokens for calendar access |

### Domain Entities

**User Entity**
- Profile: `firstName`, `lastName`, `displayName`, `avatar`, `language`
- Preferences: `defaultTimeZone`, `defaultCalendarId`, `notificationsEnabled`, `reminderDefaults`
- Methods: `updateEmail()`, `updateProfile()`, `updatePreferences()`, `recordLogin()`, `deactivate()`

**Event Entity**
- Properties: `id`, `summary`, `start`, `end`, `description`, `location`, `attendees`, `recurrence`, `reminders`, `status`, `visibility`
- Methods: `isAllDay()`, `isRecurring()`, `isPast()`, `getDurationMinutes()`, `updateTime()`

**Calendar Entity**
- Properties: `id`, `name`, `ownerId`, `settings` (timezone, colors)
- Access roles: `owner`, `writer`, `reader`, `freeBusyReader`
- Methods: `canWrite()`, `isOwner()`, `validateEventAddition()`

---

## Technology Stack

### Backend

| Category | Technologies |
|----------|-------------|
| **Runtime & Framework** | Node.js, Express 5.1.0, TypeScript 5.7+ |
| **AI & Agents** | OpenAI Agents Framework (`@openai/agents` v0.3.0), OpenAI API |
| **Database & Auth** | Supabase (PostgreSQL), JWT Authentication |
| **Google Integration** | Google Calendar API (`googleapis` v105.0.0), OAuth2 |
| **Bot Framework** | Grammy v1.38.3 (Telegram) with plugins |
| **Payments** | Stripe v18.5.0 |
| **Validation** | Zod v3.25.67, Validator.js |
| **DI Container** | Inversify v7.10.4 |
| **Testing** | Jest v30.2.0 |
| **Code Quality** | Biome (linting/formatting), Husky (git hooks) |

### Frontend

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15.1.0 (App Router), React 19.0.0 |
| **Language** | TypeScript 5.7.2 |
| **Styling** | Tailwind CSS 3.4.17, Framer Motion 11.11.17 |
| **UI Components** | Radix UI, Lucide Icons, 25+ custom components |
| **Forms** | Tanstack React Form v1.26.0 |
| **Auth** | NextAuth v5.0.0-beta.25, Supabase Client |
| **Effects** | Canvas Confetti, Aurora backgrounds, Particles, Meteors |
| **Theming** | next-themes (dark/light mode) |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account (database & auth)
- Google Cloud project with Calendar API enabled
- OpenAI API key
- Telegram Bot Token (optional, for Telegram interface)

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
GOOGLE_API_KEY=your_google_api_key
GOOGLE_REDIRECT_URI=http://localhost:3000/api/users/callback

# Telegram (optional)
TELEGRAM_BOT_ACCESS_TOKEN=your_telegram_bot_token

# WhatsApp (optional)
DEV_WHATS_APP_ACCESS_TOKEN=your_whatsapp_token

# Server
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
```

#### Frontend (`/fe/.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-google-calendar-assistant.git
cd ai-google-calendar-assistant

# Install backend dependencies
cd be
npm install

# Start backend development server
npm run dev

# In a new terminal, install frontend dependencies
cd ../fe
npm install

# Start frontend development server
npm run dev
```

The backend will run on `http://localhost:3000` and frontend on `http://localhost:3001`.

---

## Technical Highlights

### 1. Multi-Agent AI System

The project implements a sophisticated multi-agent architecture using OpenAI's Agents framework:

- **Orchestrator Pattern**: A central orchestrator agent delegates tasks to specialized tools
- **Handoff Agents**: Complex workflows use handoff agents for multi-step operations
- **Parallel Tool Calls**: Agents can execute multiple tools simultaneously for efficiency
- **Context Awareness**: Agents maintain conversation context and user preferences

### 2. Domain-Driven Design

Clean architecture following DDD principles:

- **Entities**: Pure business logic (User, Calendar, Event)
- **Repositories**: Abstract data access behind interfaces
- **Infrastructure Layer**: Concrete implementations for Google Calendar API and Supabase
- **Dependency Injection**: Inversify container for loose coupling

### 3. Smart Calendar Categorization

Evidence-based scoring system for intelligent calendar selection:

```
Weight Priority: Title (highest) > Description > Location > Attendees (lowest)
```

Categories include: meetings, work, studies, health, travel, errands, and more.

### 4. Authentication Flow

- **Email/Password**: Supabase Auth with Zod validation (6-72 character passwords)
- **Google OAuth**: OAuth2 with offline access for refresh tokens
- **GitHub OAuth**: Alternative authentication provider
- **Session Management**: JWT tokens with Bearer authentication
- **Token Storage**: Secure storage of Google Calendar OAuth tokens in Supabase

---

## Project Status

### Implemented Features

- Core AI agent system with 11+ specialized tools
- Web dashboard with voice and text input
- Interactive onboarding wizard with checklist
- Telegram bot with session management
- Natural language event processing
- Multi-calendar support with smart selection
- Full CRUD operations for calendar events
- Google OAuth integration
- User preference management (timezone, default calendar)
- Domain-Driven Design architecture
- Dependency injection with Inversify
- Comprehensive test suite with Jest

### In Development

- WhatsApp bot completion
- Stripe subscription implementation
- Enhanced AI capabilities (conflict resolution, meeting optimization)

### Planned Features

- Slack integration
- Mobile app (React Native)
- Zoom/Google Meet auto-linking
- Email integration (Gmail)
- Redis caching layer
- Team collaboration features

---

## Security Features

- **Row Level Security**: Supabase RLS policies enforce data isolation
- **JWT Validation**: All API requests validated via auth middleware
- **OAuth 2.0**: Secure Google account integration
- **Input Validation**: Zod schemas validate all inputs
- **CORS**: Configured for specific origins only
- **Environment Variables**: Sensitive data never committed

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow existing code patterns
- Add tests for new features
- Update documentation as needed
- Run `npm run lint` before committing

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- OpenAI for the Agents framework and API
- Google for Calendar API
- Supabase team for the excellent backend platform
- Next.js and React teams for amazing frameworks
