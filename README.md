# AI Google Calendar Assistant

> An intelligent, AI-powered calendar management platform that transforms natural language into structured Google Calendar events across multiple interfaces (Web, Telegram, WhatsApp).

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
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

**Orchestrator Agent** coordinates multiple specialized agents:
- Event CRUD operations (Create, Read, Update, Delete)
- User authentication and registration
- Calendar categorization and analysis
- Event field validation and normalization
- Complex workflow orchestration with handoff agents

### Multi-Platform Interfaces

1. **Web Dashboard**
   - Voice and text input support
   - Interactive onboarding experience
   - Real-time calendar management
   - Agent name customization
   - Modern glassmorphism UI with animations

2. **Telegram Bot**
   - Conversational interface
   - Session management
   - Continuous conversation flow
   - Error handling and user feedback

3. **WhatsApp Integration** (In Development)
   - Webhook-based communication
   - Message processing pipeline

### Advanced Features

- **Conflict Detection**: Identifies scheduling conflicts
- **Reminder Management**: Configurable reminders per calendar
- **Access Control**: Calendar-level permissions and sharing
- **Vector Embeddings**: Conversation history with semantic search capabilities
- **Stripe Integration**: Ready for subscription-based billing

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
│  │  │        Specialized Agents Pool             │     │     │
│  │  ├────────────────────────────────────────────┤     │     │
│  │  │ • Insert Event    • Update Event           │     │     │
│  │  │ • Delete Event    • Get Event              │     │     │
│  │  │ • User Auth       • Calendar Analysis      │     │     │
│  │  │ • Event Normalize • Timezone Detection     │     │     │
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

### Monorepo Structure

```
ai-google-calendar-assistant/
├── be/                          # Backend (Express + TypeScript)
│   ├── ai-agents/              # OpenAI Agent implementations
│   │   ├── agents.ts           # Agent definitions
│   │   ├── orchestrator.ts     # Main orchestrator
│   │   └── tools/              # Agent tools (calendar ops, auth, etc.)
│   ├── domain/                 # Domain-Driven Design layer
│   │   ├── entities/           # Core business entities
│   │   └── repositories/       # Repository interfaces
│   ├── infrastructure/         # External integrations
│   │   └── repositories/       # Repository implementations
│   ├── routes/                 # Express API routes
│   │   ├── calendars.ts        # Calendar endpoints
│   │   ├── users.ts            # User management
│   │   └── whatsapp.ts         # WhatsApp webhook
│   ├── telegram-bot/           # Telegram bot implementation
│   ├── config/                 # Configuration files
│   ├── database.types.ts       # Supabase generated types
│   └── app.ts                  # Express server entry
│
├── fe/                          # Frontend (Next.js 15 + React 19)
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/          # Dashboard interface
│   │   ├── login/              # Authentication pages
│   │   ├── pricing/            # Pricing page
│   │   └── api/                # API routes
│   ├── components/             # React components (23+ components)
│   │   ├── ui/                 # Reusable UI components
│   │   └── dashboard/          # Dashboard-specific components
│   ├── lib/                    # Utilities and helpers
│   └── styles/                 # Global styles and Tailwind config
│
└── .taskmaster/                 # AI-powered project management
    ├── config.json             # Task Master configuration
    └── CLAUDE.md               # AI assistant templates
```

---

## Technology Stack

### Backend

| Category | Technologies |
|----------|-------------|
| **Runtime & Framework** | Node.js, Express 5.1.0, TypeScript |
| **AI & Agents** | OpenAI Agents Framework (`@openai/agents` v0.3.0), OpenAI API |
| **Database & Auth** | Supabase (PostgreSQL), JWT Authentication |
| **Google Integration** | Google Calendar API (`googleapis` v105.0.0), OAuth2 |
| **Bot Framework** | Grammy (Telegram bot library) with plugins |
| **Payments** | Stripe v18.5.0 |
| **Validation** | Zod v3.25.67, Validator.js |
| **DI Container** | Inversify v7.10.4 |
| **Testing** | Jest v30.2.0 |
| **Code Quality** | Biome (linting/formatting), Husky (git hooks) |
| **Dev Tools** | Nodemon, ts-node, Task Master AI |

### Frontend

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15.1.0 (App Router), React 19.0.0 |
| **Language** | TypeScript 5.7.2 |
| **Styling** | Tailwind CSS 3.4.17, Framer Motion 11.11.17 |
| **UI Components** | Radix UI, Lucide Icons, Custom components |
| **Forms** | Tanstack React Form v1.26.0 |
| **Auth** | NextAuth v5.0.0-beta.25, Supabase Client |
| **Effects** | Canvas Confetti, Aurora backgrounds, Particles |
| **Theming** | next-themes (dark/light mode) |
| **Dev Tools** | Component tagger, ESLint 9, PostCSS |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account (database & auth)
- Google Cloud project with Calendar API enabled
- OpenAI API key
- Telegram Bot Token (for Telegram interface)
- Stripe account (for payments)

### Environment Variables

#### Backend (`/be/.env`)

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_API_KEY=your_google_api_key
GOOGLE_REDIRECT_URI=http://localhost:3000/api/users/auth/callback

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# WhatsApp (optional)
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token

# Server
PORT=3000
NODE_ENV=development
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

### Database Setup

1. Create a Supabase project
2. Run migrations for required tables:
   - `users`
   - `calendar_categories`
   - `conversation_messages`
   - `conversation_embeddings`
   - `telegram_user_links`

3. Set up Row Level Security (RLS) policies for secure data access

---

## API Documentation

### Authentication Endpoints

```
POST   /api/users/register              # Create new user
POST   /api/users/login                 # User login
GET    /api/users/auth/callback         # Google OAuth callback
GET    /api/users/me                    # Get current user
PUT    /api/users/agent-name            # Update agent name
```

### Calendar Endpoints

```
GET    /api/calendars                   # List all user calendars
GET    /api/calendars/colors            # Get calendar color options
GET    /api/calendars/timezone          # Get user timezone
POST   /api/calendars/events            # Create calendar event
GET    /api/calendars/events/:id        # Get specific event
PUT    /api/calendars/events/:id        # Update event
DELETE /api/calendars/events/:id        # Delete event
GET    /api/calendars/overview          # Get calendar overview
```

### Bot Endpoints

```
POST   /api/whatsapp/webhook            # WhatsApp message webhook
```

---

## Technical Highlights

### 1. Multi-Agent AI System

The project implements a sophisticated multi-agent architecture using OpenAI's Agents framework:

- **Orchestrator Pattern**: A central orchestrator agent delegates tasks to specialized agents
- **Handoff Agents**: Complex workflows use handoff agents for multi-step operations
- **Parallel Tool Calls**: Agents can execute multiple tools simultaneously for efficiency
- **Context Awareness**: Agents maintain conversation context and user preferences

### 2. Domain-Driven Design

Clean architecture following DDD principles:

- **Entities**: Pure business logic (User, Calendar, Event)
- **Repositories**: Abstract data access behind interfaces
- **Infrastructure Layer**: Concrete implementations for Google Calendar API and Supabase
- **Dependency Injection**: Inversify container for loose coupling

### 3. Natural Language Processing Pipeline

```
User Input → NLP Parser → Event Normalization → Calendar Selection → Validation → Google Calendar API
```

- Handles various date/time formats
- Extracts duration from natural language
- Multilingual support with language detection
- Smart defaults for missing information

### 4. Smart Calendar Categorization

Evidence-based scoring system:

```typescript
Weight Priority: Title (highest) > Description > Location > Attendees (lowest)
```

Categories include: meetings, work, studies, health, travel, errands, and more.

### 5. Modern Frontend Architecture

- **Server Components**: Leverages React Server Components for performance
- **App Router**: Next.js 15 App Router with streaming and suspense
- **Optimistic UI**: Immediate feedback with optimistic updates
- **Animations**: Framer Motion for smooth, professional animations
- **Accessibility**: WCAG-compliant UI components from Radix

### 6. Development Excellence

- **Type Safety**: Full TypeScript coverage with strict mode
- **Testing**: Jest test framework with comprehensive test suites
- **Code Quality**: Biome for fast linting and formatting
- **Git Hooks**: Husky pre-commit hooks ensure code quality
- **AI-Powered PM**: Task Master AI integration for project management
- **MCP Integration**: Model Context Protocol for AI-assisted development

---

## Project Goals & Roadmap

### Current Status: MVP Complete

- Core AI agent system operational
- Web dashboard and Telegram bot functional
- Natural language event processing working
- Multi-calendar support implemented

### Upcoming Features

1. **Enhanced AI Capabilities**
   - Conflict resolution with suggestions
   - Meeting optimization (finding best times)
   - Smart recurring event patterns

2. **Platform Expansion**
   - WhatsApp bot completion
   - Slack integration
   - Mobile app (React Native)

3. **SaaS Features**
   - Stripe subscription implementation
   - Multi-tenant architecture finalization
   - Usage analytics and dashboards
   - Team collaboration features

4. **Advanced Integrations**
   - Zoom/Google Meet auto-linking
   - Email integration (Gmail)
   - Task management systems (Jira, Asana)
   - Calendar syncing across multiple accounts

5. **Performance & Scale**
   - Redis caching layer
   - Event sourcing for audit trails
   - Horizontal scaling with load balancing
   - Edge deployment optimization

---

## Development Workflow

### Task Management with Task Master AI

This project uses [Task Master AI](https://www.npmjs.com/package/task-master-ai) for AI-powered project management:

```bash
# Access Task Master commands
npm run taskmaster

# Available commands include:
# - PRD parsing
# - Task complexity analysis
# - Automated workflow generation
# - AI-assisted code review
```

### Code Quality Standards

- **Linting**: Biome with custom rules
- **Testing**: Minimum 80% code coverage target
- **Type Safety**: Strict TypeScript, no `any` types
- **Git Workflow**: Feature branches with PR reviews
- **Commit Convention**: Conventional commits (feat, fix, docs, etc.)

---

## Architecture Decisions

### Why OpenAI Agents Framework?

- **Structured Orchestration**: Built-in patterns for multi-agent coordination
- **Type Safety**: TypeScript-first design
- **Tool Integration**: Easy to add custom tools
- **Streaming Support**: Real-time conversation updates

### Why Next.js 15 + React 19?

- **Server Components**: Improved performance and SEO
- **App Router**: Better developer experience
- **Streaming**: Progressive UI rendering
- **Edge Runtime**: Deploy closer to users

### Why Supabase?

- **PostgreSQL**: Robust relational database
- **Built-in Auth**: OAuth, JWT, RLS out of the box
- **Real-time**: WebSocket subscriptions for live updates
- **Vector Support**: For conversation embeddings

### Why Monorepo?

- **Code Sharing**: Shared types between frontend/backend
- **Atomic Changes**: Deploy related changes together
- **Simplified Tooling**: Single dependency management
- **Developer Experience**: Work on full stack in one repository

---

## Performance Considerations

- **Agent Caching**: Frequently used agent responses cached
- **Database Indexing**: Optimized queries for calendar events
- **API Rate Limiting**: Respect Google Calendar API quotas
- **Lazy Loading**: Frontend components loaded on demand
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Splitting**: Code split by route and component

---

## Security Features

- **Row Level Security**: Supabase RLS policies enforce data isolation
- **JWT Validation**: All API requests validated
- **OAuth 2.0**: Secure Google account integration
- **Input Validation**: Zod schemas validate all inputs
- **CORS**: Configured for specific origins only
- **Environment Variables**: Sensitive data never committed
- **Rate Limiting**: Prevent abuse and DoS attacks

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

---

## Contact & Support

For questions, issues, or collaboration opportunities:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/ai-google-calendar-assistant/issues)
- **Email**: your.email@example.com
- **LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)

---

**Built with by [Your Name]** | [Portfolio](https://yourportfolio.com) | [GitHub](https://github.com/yourusername)

---

### Screenshots

> Add screenshots of your application here to showcase the UI and features

**Landing Page**
![Landing Page](./docs/screenshots/landing.png)

**Dashboard Interface**
![Dashboard](./docs/screenshots/dashboard.png)

**Telegram Bot**
![Telegram Bot](./docs/screenshots/telegram.png)

---

*This project demonstrates full-stack development expertise, AI integration, modern architecture patterns, and production-ready code quality.*
