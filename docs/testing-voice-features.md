# Testing Voice Features

## Unit Tests Status

### ✅ Existing Tests

1. **`__tests__/utils/voice/audioConverter.test.ts`**

   - Tests for audio format conversion (OGG ↔ PCM16)
   - Tests `isFfmpegAvailable()`
   - Tests conversion with custom options
   - **Status**: Basic structure exists, needs proper stream mocking

2. **`__tests__/utils/voice/realtimeVoiceAgentService.test.ts`**

   - Tests for RealtimeVoiceAgentService
   - Tests session creation, audio processing, error handling
   - Tests language code configuration
   - **Status**: Good coverage, may need updates for language code

3. **`__tests__/utils/voice/voiceAgentService.test.ts`** (NEW)
   - Tests for traditional VoiceAgentService
   - Tests transcription with language codes
   - Tests TTS generation
   - Tests full voice message processing
   - **Status**: Complete coverage

### ⚠️ Missing Tests

1. **Telegram Bot Integration Tests**

   - No tests for voice message handler in `telegram-bot/init-bot.ts`
   - No tests for language code extraction from `ctx.from.language_code`
   - No integration tests for end-to-end voice flow

2. **Language Code Tests**
   - Need tests verifying language code is passed correctly
   - Need tests for fallback behavior (ctx.from → session.codeLang → "en")

## Running Tests

### Run All Voice Tests

```bash
npm test -- __tests__/utils/voice/
```

### Run Specific Test File

```bash
npm test -- __tests__/utils/voice/voiceAgentService.test.ts
npm test -- __tests__/utils/voice/realtimeVoiceAgentService.test.ts
npm test -- __tests__/utils/voice/audioConverter.test.ts
```

### Run with Coverage

```bash
npm run test:coverage -- __tests__/utils/voice/
```

### Watch Mode

```bash
npm run test:watch -- __tests__/utils/voice/
```

## Testing in Development

### Prerequisites

1. **Environment Variables** (`.env` file):

   ```bash
   OPEN_API_KEY=your_openai_api_key
   TELEGRAM_BOT_ACCESS_TOKEN=your_telegram_bot_token
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

2. **Dependencies Installed**:

   ```bash
   npm install
   ```

3. **FFmpeg** (for audio conversion):
   - `ffmpeg-static` is included as a dependency
   - Should work automatically, but verify with: `npm list ffmpeg-static`

### Starting Dev Server

```bash
# Start development server (with nodemon auto-reload)
npm run dev

# Or start directly
npm start
```

The server will:

- Start Express server on port 3000 (or configured port)
- Initialize Telegram bot
- Start routine analysis background job

### Testing Voice Features in Dev

#### 1. **Test Traditional Voice Service (VoiceAgentService)**

The bot currently uses `VoiceAgentService` by default. To test:

1. Send a voice message to your Telegram bot
2. The bot should:
   - Transcribe using Whisper API with your language code
   - Process with orchestrator agent
   - Generate voice response with TTS
   - Send voice response back

#### 2. **Test Realtime Voice Service (RealtimeVoiceAgentService)**

To switch to RealtimeVoiceAgentService, update `telegram-bot/init-bot.ts`:

```typescript
// Change from:
import { VoiceAgentService } from "@/utils/voice/voiceAgentService";
const voiceAgentService = new VoiceAgentService();

// To:
import { RealtimeVoiceAgentService } from "@/utils/voice/realtimeVoiceAgentService";
const voiceAgentService = new RealtimeVoiceAgentService();
```

#### 3. **Test Language Code Support**

1. **Set your Telegram language**:

   - Go to Telegram Settings → Language
   - Set to a non-English language (e.g., Spanish, French)
   - Or use a test account with a different language

2. **Send a voice message**:

   - The bot should detect `ctx.from.language_code`
   - Use it for transcription and response generation

3. **Verify in logs**:
   - Check console for language code being used
   - Verify transcription accuracy improves with correct language

#### 4. **Test Audio Conversion**

If ffmpeg is available:

- OGG → PCM16 conversion should happen automatically
- PCM16 → OGG conversion for responses

If ffmpeg is not available:

- System will log warnings
- May fall back to sending OGG directly (may not work with Realtime API)

### Debugging Tips

1. **Check Language Code**:

   ```typescript
   // Add logging in telegram-bot/init-bot.ts
   console.log("Language code:", ctx.from?.language_code);
   console.log("Session codeLang:", ctx.session.codeLang);
   ```

2. **Check Audio Conversion**:

   ```typescript
   // Add logging in realtimeVoiceAgentService.ts
   console.log("Converting OGG to PCM16...");
   console.log("Converting PCM16 to OGG...");
   ```

3. **Check Realtime API Connection**:

   - Verify API key is set correctly
   - Check WebSocket connection logs
   - Monitor for connection errors

4. **Test with Different Languages**:
   - Create test accounts with different language settings
   - Send voice messages in different languages
   - Verify responses are in the correct language

### Common Issues

1. **FFmpeg Not Available**:

   - Check: `npm list ffmpeg-static`
   - Reinstall: `npm install ffmpeg-static`
   - System will fall back but may have issues

2. **Language Code Not Detected**:

   - Check `ctx.from.language_code` exists
   - Fallback to `ctx.session.codeLang`
   - Default to "en" if neither available

3. **Realtime API Connection Fails**:

   - Verify `OPEN_API_KEY` is set
   - Check API key has Realtime API access
   - Review error logs for specific issues

4. **Audio Format Issues**:
   - Verify OGG format from Telegram
   - Check PCM16 conversion is working
   - Test with different audio lengths

## Next Steps for Better Testing

1. **Add Integration Tests**:

   - Test full Telegram bot voice message flow
   - Mock Telegram API responses
   - Test language code extraction

2. **Add E2E Tests**:

   - Test with real Telegram bot (test account)
   - Verify voice message round-trip
   - Test multiple languages

3. **Improve Audio Converter Tests**:

   - Properly mock ffmpeg streams
   - Test actual conversion (with test audio files)
   - Test error scenarios

4. **Add Performance Tests**:
   - Measure conversion time
   - Measure API response time
   - Compare Realtime vs Traditional approach
