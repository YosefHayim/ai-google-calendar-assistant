# Repository Guidelines

## Project Structure & Modules
- Core server entrypoint: `app.ts` (Express + middleware).
- Business logic and routes live in `controllers`, `routes`, and `middlewares`.
- AI-related logic is in `ai-agents`; Supabase integrations in `supabase`.
- Configuration and environment handling are in `config` and `.env` (fetched via Doppler).
- Static assets are served from `public`; Telegram bot code is in `telegram-bot`.

## Build, Test, and Development
- `npm run dev` – start the server with `nodemon` for local development.
- `npm start` – run the TypeScript server via `ts-node` in a production-like mode.
- `npm test` – run the Jest test suite (Node + TS, ESM preset).
- `npm run check` / `npm run fix` – format and lint with Biome/Ultracite (`fix` may rewrite files).

## Coding Style & Naming
- Use TypeScript with explicit types where meaningful; prefer `async/await`.
- Follow Biome formatting (see `biome.jsonc`); no manual reflow beyond what the formatter enforces.
- Use `camelCase` for variables/functions, `PascalCase` for classes/types, and `SCREAMING_SNAKE_CASE` for constants.
- Keep route/controller files small and focused; share logic through utilities in `utils` or `ai-agents`.

## Testing Guidelines
- Tests use Jest configured in `jest.config.ts` (ESM, `@/` path alias).
- Name test files as `*.test.ts` and colocate near the code or in `__tests__` directories.
- Keep tests fast and deterministic; prefer integration tests around routes and controllers.
- Run `npm test` before opening a pull request.

## Commit & Pull Request Practices
- Use clear, present-tense commit messages (e.g., `feat: add calendar sync`, `fix: handle invalid token`).
- Group related changes into a single commit/PR; avoid mixed refactors and feature work.
- PRs should describe the change, motivation, and any user-facing impact (API changes, bot behavior, etc.).
- Link related issues and include screenshots/log snippets for behavior changes when helpful.
