# Using AI Google Calendar Assistant with Google Gemini AI

This guide explains how to integrate Google's Gemini AI with the AI Google Calendar Assistant as an alternative to the default OpenAI Agents implementation.

## Overview

Google Gemini provides a natural integration path for this calendar assistant, offering:

- Native integration with Google Cloud ecosystem
- Multimodal capabilities (text, images, audio)
- Function calling for structured calendar operations
- Competitive pricing and performance
- Seamless authentication with Google Calendar API
- Large context windows (up to 2M tokens with Gemini 1.5 Pro)

## Prerequisites

1. **Google Cloud Project**: Create or use existing project at [console.cloud.google.com](https://console.cloud.google.com/)
2. **Gemini API Key**: Enable Gemini API and generate API key
3. **Existing Setup**: Complete the standard project setup from [README.md](./README.md)

## Integration Options

### Option 1: Using Gemini via AI Studio (Simplest)

Get API key from [aistudio.google.com](https://aistudio.google.com/app/apikey)

```bash
pnpm add @google/generative-ai
```

Add to your `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
```

### Option 2: Using Gemini via Vertex AI (Production)

For production deployments with enterprise features:

```bash
pnpm add @google-cloud/vertexai
```

Add to your `.env`:

```env
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GOOGLE_CLOUD_LOCATION=us-central1
GEMINI_MODEL=gemini-2.0-flash-exp
```

## Implementation Guide

### 1. Create Gemini Agent Service

Create a new file `src/services/geminiAgent.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function processCalendarRequest(userMessage: string) {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    systemInstruction: `You are a calendar assistant that helps parse and understand calendar events.
    Extract event details including: title, date, time, duration, location, and attendees.
    Always respond with valid JSON containing these fields.`,
  });

  const result = await model.generateContent(userMessage);
  const response = await result.response;
  return response.text();
}
```

### 2. Implement Function Calling for Calendar Operations

Gemini supports function declarations for structured calendar operations:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const tools = [
  {
    functionDeclarations: [
      {
        name: 'createCalendarEvent',
        description: 'Creates a new event in Google Calendar',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Event title',
            },
            startTime: {
              type: 'string',
              description: 'Start time in ISO 8601 format',
            },
            endTime: {
              type: 'string',
              description: 'End time in ISO 8601 format',
            },
            description: {
              type: 'string',
              description: 'Event description or notes',
            },
            location: {
              type: 'string',
              description: 'Event location or meeting room',
            },
            attendees: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of attendee email addresses',
            },
          },
          required: ['title', 'startTime', 'endTime'],
        },
      },
      {
        name: 'checkCalendarConflicts',
        description: 'Checks for scheduling conflicts within a time range',
        parameters: {
          type: 'object',
          properties: {
            startTime: {
              type: 'string',
              description: 'Start of time range to check',
            },
            endTime: {
              type: 'string',
              description: 'End of time range to check',
            },
          },
          required: ['startTime', 'endTime'],
        },
      },
      {
        name: 'findAvailableSlots',
        description: 'Finds available time slots for scheduling',
        parameters: {
          type: 'object',
          properties: {
            duration: {
              type: 'number',
              description: 'Required duration in minutes',
            },
            startDate: {
              type: 'string',
              description: 'Start date to search from',
            },
            endDate: {
              type: 'string',
              description: 'End date to search until',
            },
            workingHoursOnly: {
              type: 'boolean',
              description: 'Only suggest slots during working hours (9-5)',
            },
          },
          required: ['duration', 'startDate', 'endDate'],
        },
      },
    ],
  },
];

export async function processWithFunctions(userMessage: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    tools: tools,
  });

  const chat = model.startChat({
    history: [],
  });

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;

  // Check if Gemini wants to call a function
  const functionCall = response.functionCalls();

  if (functionCall && functionCall.length > 0) {
    // Handle function execution
    return {
      type: 'function_call',
      functionCalls: functionCall,
    };
  }

  return {
    type: 'text',
    content: response.text(),
  };
}
```

### 3. Handle Function Execution

Create a function handler:

```typescript
async function handleFunctionCall(functionCall: any) {
  const { name, args } = functionCall;

  switch (name) {
    case 'createCalendarEvent':
      return await createGoogleCalendarEvent(args);

    case 'checkCalendarConflicts':
      return await checkConflicts(args.startTime, args.endTime);

    case 'findAvailableSlots':
      return await findAvailableTimeSlots(args);

    default:
      throw new Error(`Unknown function: ${name}`);
  }
}

// Example: Create event in Google Calendar
async function createGoogleCalendarEvent(args: any) {
  const { calendar } = await getGoogleCalendarClient();

  const event = {
    summary: args.title,
    description: args.description,
    location: args.location,
    start: {
      dateTime: args.startTime,
      timeZone: 'UTC',
    },
    end: {
      dateTime: args.endTime,
      timeZone: 'UTC',
    },
    attendees: args.attendees?.map((email: string) => ({ email })),
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return {
    success: true,
    eventId: response.data.id,
    eventLink: response.data.htmlLink,
  };
}
```

### 4. Integrate with Telegram Bot

Update your Telegram bot handlers to use Gemini:

```typescript
import { Bot } from 'grammy';
import { processWithFunctions, handleFunctionCall } from './services/geminiAgent';

bot.on('message:text', async (ctx) => {
  const userMessage = ctx.message.text;

  try {
    const response = await processWithFunctions(userMessage);

    if (response.type === 'function_call') {
      // Execute the function calls
      const results = await Promise.all(
        response.functionCalls.map(handleFunctionCall)
      );

      // Send results back to Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const chat = model.startChat({ history: [] });

      // Continue conversation with function results
      const finalResponse = await chat.sendMessage([
        { text: userMessage },
        ...response.functionCalls.map((fc: any, i: number) => ({
          functionResponse: {
            name: fc.name,
            response: results[i],
          },
        })),
      ]);

      await ctx.reply(finalResponse.response.text());
    } else {
      await ctx.reply(response.content);
    }
  } catch (error) {
    console.error('Gemini processing error:', error);
    await ctx.reply('Sorry, I encountered an error processing your request.');
  }
});
```

## Advanced Features

### 1. Context Caching for Large Calendars

Gemini supports context caching to reduce costs when analyzing large datasets:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function analyzeCalendarWithCaching(events: CalendarEvent[]) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
  });

  // Cache large event dataset
  const cachedContent = await model.cachedContent.create({
    model: 'gemini-1.5-pro',
    systemInstruction: 'You are a calendar analysis assistant.',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Here are all calendar events:\n${JSON.stringify(events, null, 2)}`,
          },
        ],
      },
    ],
  });

  // Use cached content for multiple queries
  const cachedModel = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    cachedContent: cachedContent,
  });

  const result = await cachedModel.generateContent(
    'Analyze meeting patterns and suggest optimizations'
  );

  return result.response.text();
}
```

### 2. Multimodal Calendar Invitations

Process calendar invites from images or PDFs:

```typescript
async function processCalendarImage(imageData: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const result = await model.generateContent([
    {
      text: 'Extract calendar event details from this image and return as JSON',
    },
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageData, // base64 encoded
      },
    },
  ]);

  const eventDetails = JSON.parse(result.response.text());
  return eventDetails;
}
```

### 3. Grounding with Google Search

Enhance event creation with real-time information:

```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  tools: [
    {
      googleSearch: {}, // Enable Google Search grounding
    },
  ],
});

const result = await model.generateContent(
  'Schedule a meeting at the Google office in Mountain View next week. What is the address?'
);
```

## Environment Variables

Add these to your `.env`:

```env
# Gemini AI Studio Configuration
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.0-flash-exp

# OR Vertex AI Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
GOOGLE_CLOUD_LOCATION=us-central1
GEMINI_MODEL=gemini-2.0-flash-exp

# Calendar API (already configured)
GOOGLE_CALENDAR_API_KEY=...
```

## Model Selection Guide

| Model | Best For | Context | Price (per 1M tokens) |
|-------|----------|---------|----------------------|
| gemini-2.0-flash-exp | Fast responses, real-time chat | 1M tokens | Free (in preview) |
| gemini-1.5-flash | Production, cost-effective | 1M tokens | Input: $0.075, Output: $0.30 |
| gemini-1.5-pro | Complex analysis, long context | 2M tokens | Input: $1.25, Output: $5.00 |

## Use Cases

### Smart Event Scheduling

```
User: "Find time to meet with John next week for 1 hour"
Gemini: Analyzes both calendars, suggests optimal slots
```

### Natural Language Recurring Events

```
User: "Team standup every weekday at 9 AM"
Gemini: Creates recurring event with proper timezone handling
```

### Calendar Analysis

```
User: "How many hours of meetings do I have this month?"
Gemini: Analyzes calendar and provides detailed breakdown
```

### Conflict Resolution

```
User: "I need to reschedule my 2 PM meeting"
Gemini: Finds conflicts, suggests alternative times
```

## Testing

Create test file `src/tests/gemini.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';
import { processCalendarRequest } from '../services/geminiAgent';

describe('Gemini Calendar Agent', () => {
  it('should parse simple event request', async () => {
    const result = await processCalendarRequest(
      'Schedule lunch tomorrow at 12 PM'
    );

    expect(result).toContain('lunch');
  });

  it('should extract event details', async () => {
    const result = await processCalendarRequest(
      'Meeting with Sarah next Monday at 2 PM for 1 hour about Q4 planning'
    );

    expect(result).toBeTruthy();
  });
});
```

Run tests:

```bash
pnpm test -- --testPathPattern=gemini
```

## Migration Checklist

- [ ] Install `@google/generative-ai` or `@google-cloud/vertexai`
- [ ] Get Gemini API key from AI Studio or setup Vertex AI
- [ ] Add `GEMINI_API_KEY` to environment variables
- [ ] Create Gemini agent service
- [ ] Implement function calling for calendar operations
- [ ] Update bot handlers to use Gemini
- [ ] Test with sample calendar requests
- [ ] Implement error handling for API failures
- [ ] Setup monitoring and logging
- [ ] Update documentation

## Rate Limits

### AI Studio (Free Tier)
- 15 requests per minute (RPM)
- 1 million tokens per minute (TPM)
- 1,500 requests per day

### Vertex AI (Production)
- Default: 300 RPM, 4M TPM
- Can request increases via quota page

## Benefits of Using Gemini

1. **Unified Google Ecosystem**: Single authentication for Calendar + AI
2. **Cost-Effective**: Competitive pricing, especially for Flash models
3. **Large Context**: Up to 2M tokens for comprehensive calendar analysis
4. **Multimodal**: Process images, PDFs, and audio for event creation
5. **Grounding**: Real-time information via Google Search
6. **Context Caching**: Reduce costs for repeated operations

## Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Vertex AI Gemini Docs](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [Function Calling Guide](https://ai.google.dev/docs/function_calling)
- [AI Studio](https://aistudio.google.com/)
- [Google Calendar API](https://developers.google.com/calendar/api)

## Comparison: Gemini vs OpenAI

| Feature | Gemini 2.0 Flash | OpenAI GPT-4 |
|---------|------------------|--------------|
| Context Window | 1M tokens | 128K tokens |
| Function Calling | Native support | Native support |
| Multimodal | Images, audio, video | Images only |
| Pricing (1M tokens) | $0.075 / $0.30 | $5 / $15 |
| Google Integration | Native | Third-party |
| Grounding | Google Search | Bing (limited) |

## Troubleshooting

### API Key Issues
```bash
# Verify API key
curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"
```

### Rate Limiting
Implement exponential backoff:

```typescript
async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.status === 429 && i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
        continue;
      }
      throw error;
    }
  }
}
```

## Contributing

Found improvements for Gemini integration? Please submit a PR!

## License

Same as the main project (ISC)
