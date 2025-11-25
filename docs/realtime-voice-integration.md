# Realtime Voice Agent Integration

This document describes the integration of OpenAI's Realtime API for voice-based interactions with Telegram.

## Overview

The `RealtimeVoiceAgentService` uses OpenAI's Realtime API to provide speech-to-speech voice interactions. Unlike the traditional approach (Whisper → Text → TTS), the Realtime API processes audio directly in real-time, providing a more natural conversation experience.

## Architecture

### Current Implementation (VoiceAgentService)
1. User sends voice message (OGG format)
2. Transcribe with Whisper API
3. Process text with orchestrator agent
4. Generate voice response with TTS API
5. Send voice response back to user

### New Implementation (RealtimeVoiceAgentService)
1. User sends voice message (OGG format)
2. Convert OGG to PCM16 (if needed)
3. Send audio to Realtime API
4. Realtime API processes audio directly (speech-to-speech)
5. Receive audio response and transcript
6. Convert PCM16 to OGG (if needed)
7. Send voice response back to user

## Key Components

### RealtimeVoiceAgentService

Located at: `utils/voice/realtimeVoiceAgentService.ts`

**Features:**
- Uses `RealtimeAgent` for voice-based calendar assistance
- Handles audio streaming via WebSocket transport
- Extracts transcripts and responses from session history
- Collects audio chunks for response generation

**Methods:**
- `processVoiceMessage()` - Main method for processing voice messages
- `processVoiceMessageWithFallback()` - With fallback to traditional approach
- `setVoice()` - Change the agent's voice
- `cleanup()` - Clean up active sessions

## Audio Format Considerations

**Important:** The OpenAI Realtime API expects **PCM16 format** audio, but Telegram sends **OGG format** voice messages.

### Current Status
The current implementation sends OGG buffers directly. This may work if the API accepts it, but for production use, audio conversion is recommended.

### Recommended Solution
Add audio format conversion using a library like:
- `fluent-ffmpeg` with `ffmpeg-static`
- `@ffmpeg/ffmpeg` (WebAssembly version)
- Native audio processing libraries

**Conversion Flow:**
```
Telegram OGG → Convert to PCM16 → Realtime API → PCM16 Response → Convert to OGG → Telegram
```

## Integration with Telegram Bot

To use the RealtimeVoiceAgentService in the Telegram bot:

```typescript
import { RealtimeVoiceAgentService } from "@/utils/voice/realtimeVoiceAgentService";

// Initialize service
const realtimeVoiceService = new RealtimeVoiceAgentService();

// In voice message handler
try {
  const result = await realtimeVoiceService.processVoiceMessage(audioBuffer, context);
  // Send voice response
  await ctx.api.sendVoice(ctx.chat.id, new InputFile(result.voiceResponseBuffer, "response.ogg"));
} catch (error) {
  // Fallback to traditional approach
  const fallbackResult = await voiceAgentService.processVoiceMessage(audioBuffer, context);
}
```

## Benefits of Realtime API

1. **Lower Latency**: Direct speech-to-speech processing reduces round-trip time
2. **Natural Conversations**: Better handling of interruptions and natural speech patterns
3. **Context Awareness**: Maintains conversation context throughout the session
4. **Streaming Support**: Can handle real-time audio streaming

## Limitations

1. **Audio Format**: Requires PCM16 format conversion (OGG from Telegram)
2. **Connection Management**: Each voice message creates a new session (could be optimized)
3. **Error Handling**: Needs robust fallback mechanisms
4. **Cost**: Realtime API may have different pricing than Whisper + TTS

## Next Steps

1. **Add Audio Conversion**: Implement OGG → PCM16 → OGG conversion
2. **Session Management**: Optimize session creation/reuse
3. **Error Handling**: Improve fallback mechanisms
4. **Testing**: Add unit tests for the new service
5. **Performance**: Compare latency and cost with traditional approach

## References

- [OpenAI Realtime API Documentation](https://openai.github.io/openai-agents-js/guides/voice-agents/)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/)
- [Telegram Bot API - Voice Messages](https://core.telegram.org/bots/api#voice)

