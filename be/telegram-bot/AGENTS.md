# Telegram Bot Module

Grammy v1.38 bot with multi-language support and RTL handling.

## Response System Architecture

```
ResponseBuilder (fluent API)
├── Templates (event, error, list, etc.)
├── RTL Handler (Hebrew/Arabic detection)
├── HTML Escaper (Telegram MarkdownV2)
└── Adapters (telegram, web)
```

## Where to Look

| Task                | File                                       |
| ------------------- | ------------------------------------------ |
| Add command         | `utils/commands.ts`                        |
| Add translation     | `i18n/locales/*.json`                      |
| Response formatting | `response-system/core/response-builder.ts` |
| RTL issues          | `response-system/core/rtl-handler.ts`      |
| HTML escaping       | `response-system/core/html-escaper.ts`     |

## Key Files (Large)

- `utils/commands.ts` (1133 lines) - All command handlers
- `init-bot.ts` (667 lines) - Bot initialization
- `response-system/core/response-builder.ts` (457 lines) - Response builder

## Conventions

- i18next for translations (`i18n/locales/he.json`, `en.json`)
- Always use `ResponseBuilder` for bot responses
- Use `escapeHtml()` for user input in Telegram messages
- Use `applyRtl()` for RTL language formatting

## Key Patterns

```typescript
// RTL detection
import { containsHebrew, applyRtl } from "./response-system/core/rtl-handler";
if (containsHebrew(text)) {
  text = applyRtl(text);
}

// Safe HTML escaping
import { escapeHtml } from "./response-system/core/html-escaper";
const safe = escapeHtml(userInput);

// Response building
const response = new ResponseBuilder()
  .addHeader("Event Created")
  .addField("Title", event.summary)
  .build();
```

## Anti-Patterns

| Forbidden                  | Why                           |
| -------------------------- | ----------------------------- |
| Raw user input in messages | XSS risk - use `escapeHtml()` |
| Hardcoded Hebrew/English   | Use i18n translations         |
| Manual response building   | Use ResponseBuilder           |
| Skip RTL handling          | Breaks Hebrew display         |
