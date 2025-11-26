# Conversation Context Management

## Overview

The system uses a **sliding window approach** with summarization to manage conversation context efficiently while maintaining continuity across long conversations.

## How Context Works

### 1. **Context Retrieval** (`ConversationMemoryService.getConversationContext()`)

For each message, the system retrieves:

- **Recent Messages**: Last **2 messages** in full detail (user + assistant pairs)
- **All Summaries**: All conversation summaries created so far (no limit)
- **Total Count**: Total number of messages in the conversation

### 2. **Context Formatting** (`ConversationMemoryService.formatContextForPrompt()`)

The context is formatted as:

```
## Previous Conversation Summary

### Summary 1 (3 messages)
[Summary text of first 3 messages]

### Summary 2 (3 messages)
[Summary text of next 3 messages]

...

## Recent Messages

USER: [Last user message]
ASSISTANT: [Last assistant response]
```

### 3. **Context Injection** (`utils/activateAgent.ts`)

The formatted context is injected into the agent prompt along with:
- Vector search results (similar past conversations)
- Agent name (if set)
- User email
- Chat ID

## Context Limits & Behavior

### What Gets Included

✅ **Always Included:**
- Last 2 messages (full text)
- All summaries (condensed versions of older messages)
- Vector search results (top 3 similar conversations)
- User metadata (email, chatId, agentName)

### What Gets Excluded

❌ **Not Included:**
- Messages older than the last 2 (they're summarized instead)
- Messages that haven't been summarized yet (if < 3 messages total)

### Context Reset Behavior

🔄 **Context Does NOT Reset Automatically:**
- Context accumulates over time
- Summaries are permanent (stored in database)
- Old messages remain in database but are summarized
- Context window is managed by keeping only last 2 messages + summaries

### Summarization Strategy

- **Summary Interval**: Every **3 messages**, a summary is created
- **Summary Length**: Limited to ~200 tokens (condensed)
- **Summary Content**: Preserves key information, user intent, preferences, and important context

## Monitoring Context Size

### Debug Logging

The system now logs context statistics to help you monitor:

1. **In `ConversationMemoryService.formatContextForPrompt()`:**
   - Recent messages count
   - Summaries count
   - Total message count
   - Context character count
   - Approximate token count

2. **In `utils/activateAgent.ts`:**
   - Which context components are included
   - Prompt size vs context size
   - Total character/token counts

### Viewing Logs

Check your console/logs for entries like:

```
[Context Debug] Agent: calendar_orchestrator_agent
[Context Debug] Context included: {
  hasConversationContext: true,
  hasVectorSearch: true,
  hasAgentName: true,
  hasEmail: true,
  hasChatId: true
}
[Context Debug] Size: {
  promptChars: 150,
  contextChars: 2500,
  totalChars: 2650,
  approxPromptTokens: 38,
  approxContextTokens: 625,
  approxTotalTokens: 663
}
```

## Configuration

### Adjustable Parameters

In `ConversationMemoryService.ts`:

```typescript
private readonly SUMMARY_INTERVAL = 3; // Summarize every 3 messages
private readonly RECENT_MESSAGE_COUNT = 2; // Keep last 2 messages in full
```

### Token Estimation

The system uses a rough estimate: **~4 characters per token**

For more accurate token counting, you could integrate:
- `tiktoken` library for OpenAI models
- Model-specific tokenizers

## Best Practices

1. **Monitor Context Size**: Watch the debug logs to ensure context isn't growing too large
2. **Adjust Summary Interval**: If context is too large, reduce `SUMMARY_INTERVAL` (e.g., summarize every 2 messages)
3. **Reduce Recent Messages**: If needed, reduce `RECENT_MESSAGE_COUNT` to 1
4. **Summary Quality**: Ensure summaries preserve important information (user preferences, key decisions, etc.)

## Database Tables

- **`conversation_messages`**: Stores all messages (full history)
- **`conversation_summaries`**: Stores condensed summaries (every 3 messages)
- **`conversation_state`**: Tracks message count and last message ID

## Example Context Growth

| Messages | Recent Messages | Summaries | Context Size |
|----------|----------------|-----------|--------------|
| 1-2      | 1-2            | 0         | Small        |
| 3        | 2              | 1         | Medium       |
| 6        | 2              | 2         | Medium       |
| 9        | 2              | 3         | Medium       |
| 30       | 2              | 10        | Large        |

The context size grows linearly with the number of summaries, but each summary is only ~200 tokens, so it remains manageable even for long conversations.

