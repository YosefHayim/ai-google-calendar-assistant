# AI Google Calendar Assistant

> **Version**: 1.1.1  
> **Architecture Pattern**: Domain-Driven Design (DDD) with Layered Architecture

An intelligent, multi-platform personal calendar management system that leverages OpenAI's Agent Framework to provide natural language calendar operations, routine learning, and proactive scheduling capabilities.

## 🚀 Features

- **Natural Language Processing**: Understand and execute calendar operations from conversational input
- **Multi-Agent Orchestration**: Sophisticated agent system with specialized agents for different tasks
- **Routine Learning**: Automatic pattern detection and predictive scheduling
- **Context Management**: Conversation memory with summarization and vector search
- **Multi-Platform Support**: Telegram, WhatsApp, Web, and React Native interfaces
- **Intelligent Model Routing**: Dynamic model selection based on task complexity
- **Automatic Language Matching**: Responds in the user's Telegram language automatically

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+ with TypeScript 5.9
- **Framework**: Express.js 5.x
- **AI Framework**: OpenAI Agents SDK (`@openai/agents`, `@openai/agents-core`, `@openai/agents-realtime`)
- **Database**: Supabase (PostgreSQL) with vector search capabilities
- **Bot Framework**: Grammy (Telegram)
- **Dependency Injection**: Inversify (IoC container)
- **Validation**: Zod schemas
- **Background Jobs**: node-cron

## 🏗️ Architecture Overview

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

### Key Components

- **Client Layer**: Telegram bot, WhatsApp integration, Web UI (planned), React Native app (planned)
- **API Gateway**: Express.js with middleware for authentication, error handling, and routing
- **Service Layer**: Business logic services (Calendar, Event, Conversation Memory, Vector Search, Routine Learning, etc.)
- **AI Agents Layer**: Multi-agent orchestration system with specialized agents
- **Domain Layer**: Domain entities, value objects, and repository interfaces (DDD)
- **Infrastructure Layer**: Repository implementations, external clients, dependency injection

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account and project
- Google Cloud project with Calendar API enabled
- OpenAI API key
- Telegram bot token (for Telegram integration)

### Setup

1. **Clone the repository**:
```bash
git clone https://github.com/YosefHayim/AI-Calendar-Server.git
cd AI-Calendar-Server
```

2. **Install dependencies**:
```bash
npm install
# or
pnpm install
```

3. **Configure environment variables** (see [Configuration](#configuration))

4. **Run database migrations** (if applicable):
```bash
# Using Supabase CLI
supabase db push
```

5. **Generate TypeScript types from database**:
```bash
npm run get-updated-db-types
```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPEN_API_KEY=your_openai_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Telegram
TELEGRAM_BOT_ACCESS_TOKEN=your_telegram_bot_token

# Environment
NODE_ENV=development
```

## 🚀 Usage

### Start Development Server

```bash
npm run dev
```

### Start Production Server

```bash
npm start
```

### Telegram Bot

The Telegram bot automatically starts when the server runs. Users can:

1. Start a conversation with the bot
2. Provide their email for authentication
3. Authorize Google Calendar access via OAuth
4. Use natural language to manage their calendar

**Example Commands**:
- "Add a meeting tomorrow at 3pm"
- "Show me my events for next week"
- "Delete the meeting on Friday"
- "Update the meeting time to 4pm"

## 💻 Development

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

### Code Quality

The project uses:

- **Biome**: Linting and formatting
- **TypeScript**: Type checking
- **Jest**: Testing framework
- **Husky**: Git hooks for pre-commit checks

### Git Hooks

- **Pre-commit**: Runs linting and formatting
- **Pre-push**: Runs tests (optional)

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# CI mode
npm run test:ci
```

### Test Structure

- Unit tests for domain logic
- Integration tests for API endpoints
- Service tests
- Agent tests

## 📚 API Documentation

### REST API Endpoints

#### Calendar Operations

- `GET /api/calendar/all` - List all user calendars
- `GET /api/calendar/colors` - Get calendar color scheme
- `GET /api/calendar/timezone` - Get user timezone
- `GET /api/calendar/event/:eventId` - Retrieve event by ID
- `GET /api/calendar/events` - List events with filters
- `GET /api/calendar/overview` - Get calendar summary

#### User Operations

- `POST /api/users/oauth/callback` - OAuth callback handling
- `GET /api/users/auth/status` - Authentication status

#### WhatsApp (In Development)

- `POST /api/whatsapp/webhook` - WhatsApp webhook

### AI Agent System

The system uses a multi-agent orchestration pattern:

```
ORCHESTRATOR_AGENT (Main Decision Engine)
    ├── insert_event_handoff_agent
    ├── get_event_agent
    ├── update_event_handoff_agent
    ├── delete_event_handoff_agent
    └── Quick Response Agent
```

Each agent has specialized tools and instructions for handling specific tasks.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style (enforced by Biome)
- Ensure all tests pass before submitting PR

## 📖 Additional Documentation

For detailed architecture documentation, see:

- [Agent Architecture](docs/agent-architecture-analysis.md) - AI agent system details
- [Context Management](docs/context-management.md) - Conversation memory and context
- [Implementation Status](docs/IMPLEMENTATION_STATUS.md) - Current implementation status
- [Model Router Design](docs/model-router-design.md) - Intelligent model selection
- [Routine Learning](docs/routine-learning-implementation-plan.md) - Pattern detection and learning
- [Voice Integration](docs/realtime-voice-integration.md) - Voice message support
- [Language Matching](docs/language-matching-validation.md) - Automatic language detection

## 🔒 Security

- OAuth 2.0 for Google Calendar authentication
- JWT tokens for REST API authentication
- Row-Level Security (RLS) in Supabase
- Input validation with Zod schemas
- Error sanitization (no sensitive data in logs)

## 📝 License

ISC

## 👥 Authors

- **YosefHayim** - [GitHub](https://github.com/YosefHayim)

## 🙏 Acknowledgments

- OpenAI for the Agents SDK
- Supabase for the database and infrastructure
- Grammy for the Telegram bot framework
- The open-source community

---

**Version**: 1.1.1  
**Last Updated**: 2024

