# Using AI Google Calendar Assistant with Claude AI

This guide explains how to integrate Anthropic's Claude AI with the AI Google Calendar Assistant as an alternative to the default OpenAI Agents implementation.

## Overview

While the project currently uses OpenAI Agents for natural language processing and event understanding, you can integrate Claude AI for similar or enhanced capabilities. Claude offers:

- Strong natural language understanding for calendar event parsing
- Excellent instruction following for scheduling tasks
- Long context windows (up to 200K tokens) for complex calendar analysis
- Function calling capabilities for structured calendar operations

## Prerequisites

1. **Anthropic API Key**: Sign up at [console.anthropic.com](https://console.anthropic.com/)
2. **Claude API Access**: Ensure you have access to Claude 3.5 Sonnet or later models
3. **Existing Setup**: Complete the standard project setup from [README.md](./README.md)

## Integration Options

### Option 1: Using Claude via Anthropic SDK

Install the Anthropic SDK:

```bash
pnpm add @anthropic-ai/sdk
```

Add to your `.env` file:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Option 2: Using Claude through Vertex AI

If you prefer using Claude through Google Cloud:

```bash
pnpm add @anthropic-ai/vertex-sdk
```

Configure Vertex AI credentials and add to `.env`:

```env
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
ANTHROPIC_VERTEX_REGION=us-east5
```

## Implementation Guide

### 1. Create Claude Agent Service

Create a new file `src/services/claudeAgent.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function processCalendarRequest(userMessage: string) {
  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: `You are a calendar assistant that helps parse and understand calendar events.
    Extract event details including: title, date, time, duration, location, and attendees.
    Return structured JSON with these fields.`,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  return message.content;
}
```

### 2. Implement Tool Use for Calendar Operations

Claude supports function calling for structured operations:

```typescript
import Anthropic from '@anthropic-ai/sdk';

const tools: Anthropic.Tool[] = [
  {
    name: 'create_calendar_event',
    description: 'Creates a new event in Google Calendar',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        start_time: { type: 'string', description: 'Start time in ISO format' },
        end_time: { type: 'string', description: 'End time in ISO format' },
        description: { type: 'string', description: 'Event description' },
        attendees: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of attendee emails',
        },
      },
      required: ['title', 'start_time', 'end_time'],
    },
  },
  {
    name: 'check_calendar_conflicts',
    description: 'Checks for scheduling conflicts in a time range',
    input_schema: {
      type: 'object',
      properties: {
        start_time: { type: 'string' },
        end_time: { type: 'string' },
      },
      required: ['start_time', 'end_time'],
    },
  },
];

export async function processWithTools(userMessage: string) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    tools: tools,
    messages: [{ role: 'user', content: userMessage }],
  });

  return message;
}
```

### 3. Replace OpenAI Agent Calls

Update your existing agent calls to use Claude instead. For example, in your Telegram bot handlers:

```typescript
// Before (OpenAI)
const response = await openaiAgent.processMessage(message);

// After (Claude)
const response = await processCalendarRequest(message);
```

## Use Cases Optimized for Claude

### Natural Language Event Creation

```
User: "Schedule a team standup every Monday at 9 AM for 30 minutes"
Claude: Parses recurring event with proper timezone handling
```

### Conflict Resolution

```
User: "I need to meet with Sarah sometime next week for an hour"
Claude: Analyzes calendar, suggests optimal time slots
```

### Multi-Event Analysis

```
User: "Summarize all my meetings this week"
Claude: Provides comprehensive summary with context
```

## Advanced Features

### Extended Context for Calendar Analysis

Claude's 200K token context window allows analyzing entire calendar months:

```typescript
async function analyzeCalendarMonth(events: CalendarEvent[]) {
  const eventsText = JSON.stringify(events, null, 2);

  const analysis = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Analyze these calendar events and provide insights:
        ${eventsText}

        Provide:
        1. Meeting time distribution
        2. Busiest days
        3. Suggestions for better time management`,
      },
    ],
  });

  return analysis;
}
```

### Prompt Caching for Repeated Operations

Use Claude's prompt caching to reduce costs for repeated calendar operations:

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  system: [
    {
      type: 'text',
      text: 'You are a calendar assistant...',
      cache_control: { type: 'ephemeral' },
    },
  ],
  messages: [{ role: 'user', content: userMessage }],
});
```

## Environment Variables

Add these to your `.env`:

```env
# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=4096

# Optional: Vertex AI Configuration
GOOGLE_CLOUD_PROJECT=
GOOGLE_APPLICATION_CREDENTIALS=
ANTHROPIC_VERTEX_REGION=us-east5
```

## Rate Limits and Pricing

- **Claude 3.5 Sonnet**: Input: $3/MTok, Output: $15/MTok
- **Rate Limits**: 50 requests/minute (default tier)
- **Batch API**: Available for non-real-time operations

## Testing

Test Claude integration with example queries:

```bash
# Set environment variable
export ANTHROPIC_API_KEY=your_key

# Run tests
pnpm test -- --testPathPattern=claude
```

## Migration Checklist

- [ ] Install `@anthropic-ai/sdk`
- [ ] Add `ANTHROPIC_API_KEY` to environment
- [ ] Create Claude agent service
- [ ] Update agent calls in bot handlers
- [ ] Implement tool use for calendar operations
- [ ] Update error handling for Anthropic API
- [ ] Test with sample calendar requests
- [ ] Update documentation

## Support and Resources

- [Anthropic Documentation](https://docs.anthropic.com/)
- [Claude API Reference](https://docs.anthropic.com/en/api/messages)
- [Function Calling Guide](https://docs.anthropic.com/en/docs/tool-use)
- [Prompt Engineering](https://docs.anthropic.com/en/docs/prompt-engineering)

## Comparison: Claude vs OpenAI Agents

| Feature | Claude | OpenAI Agents |
|---------|--------|---------------|
| Context Window | 200K tokens | 128K tokens |
| Tool Use | Native function calling | Agents framework |
| Streaming | Full streaming support | Real-time API |
| Pricing | $3-15/MTok | Varies by model |
| Best For | Complex analysis, long context | Real-time interactions |

## Contributing

Found a better way to integrate Claude? Please submit a PR or open an issue!

## License

Same as the main project (ISC)

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
