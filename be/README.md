# AI Google Calendar Assistant

AI-driven automation layer for Google Calendar, originally built for personal use and designed to evolve into a SaaS product.  
It handles event parsing, scheduling, and conflict resolution by combining Google Calendar, OpenAI Agents, Supabase, and a Telegram assistant interface.

## Overview

This service exposes a backend (Express + TypeScript) that:

- Connects to Google Calendar via `googleapis`.
- Uses OpenAI Agents to understand free-text requests and generate scheduling actions.
- Persists users, sessions, and settings in Supabase.
- Exposes a Telegram bot (via `grammy`) as the main assistant interface.
- Integrates Stripe for subscription and billing flows.

## Features

### Authentication & User Management
- Email/password signup and signin with Supabase Auth
- OAuth authentication (Google, GitHub)
- Email verification via OTP
- JWT-based authentication middleware
- User account deactivation
- Secure Google Calendar token storage and auto-refresh
- Third-party authentication integration

### Calendar Operations
- Retrieve all user calendars with metadata
- Get calendar overview, colors, and timezone settings
- Full CRUD operations for calendar events
- Filter events by custom criteria
- Retrieve specific events by ID
- Calendar category management and synchronization

### AI-Powered Event Management
- Natural language event creation and updates via OpenAI Agents
- Multi-agent orchestration system with specialized agents:
  - Event normalization agent
  - Event validation agent
  - Calendar type analysis agent
  - User timezone detection agent
  - CRUD operation agents (insert, update, delete, get)
- Smart event field validation
- Automatic timezone handling
- Event conflict detection and resolution suggestions
- Agent handoff system for complex workflows

### Event Features
- All-day events support
- Recurring events with RRULE format
- Event attendees management (add, remove, validate)
- Custom event reminders (email, popup)
- Event visibility controls (public, private, confidential)
- Event status management (confirmed, tentative, cancelled)
- Event duration calculations
- Time-based event queries (past, future, ongoing)

### Telegram Bot Assistant
- Conversational interface for calendar management
- Natural language processing for event commands
- Session-based user context management
- Background agent processing
- Command support (/start, /exit)
- Multi-user support with authentication

### Architecture & Infrastructure
- Clean architecture with layered design
- Middleware for authentication and error handling
- Centralized error handling with async wrappers
- Consistent response patterns with `sendR()` utility

### Developer Experience
- Full TypeScript support with strict typing
- Comprehensive Jest test suite with 80%+ coverage
- Zod schema validation for runtime type safety
- Environment configuration via Doppler
- Auto-generated Supabase database types
- Git hooks with Husky for code quality
- Code linting and formatting with Ultracite and Biome
- Docker containerization support
- Hot-reload development server with nodemon

### SaaS-Ready Features
- Multi-user support with isolated data
- Stripe payment integration for subscriptions
- WhatsApp integration (in development)
- Scalable architecture for production deployment

## Tech Stack

- Runtime: Node.js (CommonJS)
- Language: TypeScript (via `ts-node`)
- Web framework: Express
- AI: `@openai/agents`, `@openai/agents-core`, `@openai/agents-realtime`
- Database/Auth: Supabase (`@supabase/supabase-js`, `supabase`)
- Calendar: Google Calendar API (`googleapis`)
- Bot: `grammy`, `@grammyjs/*`
- Payments: Stripe
- Config/Env: `dotenv`, Doppler
- Validation: `zod`
- Logging/Middleware: `morgan`, `cors`, `cookie-parser`, `validator`

## Scripts

From `package.json`:

```bash
# Run type-aware dev server with auto-reload
pnpm dev        # uses nodemon

# Start production server (TypeScript via ts-node)
pnpm start      # NODE_OPTIONS='--max-old-space-size=4096' ts-node -r tsconfig-paths/register app.ts

# Run tests
pnpm test       # jest

# Lint & static checks (Ultracite)
pnpm check      # npx ultracite check
pnpm fix        # npx ultracite fix --unsafe

# Sort package.json fields
pnpm sort       # npx sort-package-json

# Generate Supabase DB types
pnpm get-updated-db-types
# npx supabase gen types typescript --project-id ... --schema public > database.types.ts

# Setup git hooks
pnpm prepare    # husky install

# Download environment variables from Doppler
pnpm download-env
# doppler secrets download --ai-g
