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

- Natural-language event creation and updates.
- Smart conflict detection and resolution suggestions.
- Multi-user support backed by Supabase.
- Telegram bot assistant for conversational control.
- Stripe-powered subscription / SaaS-ready billing layer.
- Strict validation with Zod and JWT-based auth.

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
