import { OpenAIRealtimeWebSocket, RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import type { TransportLayerAudio, TransportLayerTranscriptDelta } from "@openai/agents-realtime";
import { convertOggToPcm16, convertPcm16ToOgg, isFfmpegAvailable } from "@/utils/voice/audioConverter";

import type { AgentContext } from "@/utils/activateAgent";
import { CONFIG } from "@/config/root-config";
import { ORCHESTRATOR_AGENT } from "@/ai-agents/agents";
import { activateAgent } from "@/utils/activateAgent";

export interface RealtimeVoiceProcessingResult {
  transcribedText: string;
  voiceResponseBuffer: Buffer | null;
  textResponse: string;
}

export interface RealtimeVoiceOptions {
  languageCode?: string; // ISO 639-1 language code (e.g., "en", "es", "fr")
}

/**
 * Service for processing voice messages using OpenAI Realtime API
 * Uses speech-to-speech models for real-time voice interactions
 */
export class RealtimeVoiceAgentService {
  private agent: RealtimeAgent;
  private session: RealtimeSession | null = null;

  constructor() {
    // Create a RealtimeAgent based on the orchestrator agent instructions
    // Adapted for voice interactions - responses should be concise and natural for speech
    this.agent = new RealtimeAgent({
      name: "voice-calendar-assistant",
      instructions: `You are a helpful voice assistant for managing Google Calendar. 
      You help users with calendar-related tasks through natural voice conversations.
      
      **Voice Interaction Guidelines:**
      - Be concise and conversational - you're speaking directly to the user
      - Keep responses brief and natural for voice interaction (2-3 sentences max when possible)
      - Speak naturally, as if having a conversation
      - Use the user's personalized agent name (if set) when introducing yourself
      - Be warm, professional, and helpful
      
      **Calendar Assistance:**
      - Help users create, view, update, and delete calendar events
      - Provide schedule insights and routine patterns when asked
      - Suggest optimal times for scheduling when relevant
      - Remember context from previous conversations
      
      **Important:**
      - The user's email and chat ID are automatically provided in context - never ask for them
      - Use conversation context to understand user preferences
      - Be proactive but not overwhelming
      - For complex requests, break them down naturally in conversation`,
      voice: "alloy", // Default voice, can be customized
    });
  }

  /**
   * Process a voice message using Realtime API: transcribe, get agent response, and generate voice response
   *
   * Automatically converts OGG format (from Telegram) to PCM16 format (for Realtime API),
   * and converts the PCM16 response back to OGG format (for Telegram).
   *
   * @param audioBuffer - Audio file buffer (OGG format from Telegram)
   * @param context - Agent context (conversation history, user info, etc.)
   * @param options - Additional options including language code
   * @returns Promise with transcribed text, voice response buffer, and text response
   */
  async processVoiceMessage(audioBuffer: Buffer, context?: AgentContext, options?: RealtimeVoiceOptions): Promise<RealtimeVoiceProcessingResult> {
    return new Promise((resolve, reject) => {
      const audioChunks: ArrayBuffer[] = [];
      let transcribedText = "";
      let textResponse = "";
      let responseId: string | null = null;

      try {
        // Get language code from options or default to English
        const languageCode = options?.languageCode || "en";

        // Create a new session for this voice interaction
        this.session = new RealtimeSession(this.agent, {
          apiKey: CONFIG.openAiApiKey,
          transport: "websocket", // Use WebSocket for server-side
          context: {
            conversationContext: context?.conversationContext,
            vectorSearchResults: context?.vectorSearchResults,
            agentName: context?.agentName,
            chatId: context?.chatId,
            email: context?.email,
          },
          // Configure audio transcription with language code
          config: {
            audio: {
              input: {
                transcription: {
                  language: languageCode,
                },
              },
            },
          },
        });

        // Set up event listeners
        this.session.on("audio", (event: TransportLayerAudio) => {
          // Collect audio chunks from the response
          audioChunks.push(event.data);
          responseId = event.responseId;
        });

        // Listen for history updates to extract transcripts and responses
        this.session.on("history_updated", (history) => {
          // Extract user input transcript from the last user message
          const userMessages = history.filter(
            (item): item is Extract<typeof item, { type: "message"; role: "user" }> => item.type === "message" && item.role === "user"
          );

          if (userMessages.length > 0) {
            const lastUserMessage = userMessages[userMessages.length - 1];
            if (lastUserMessage.content) {
              const audioContent = lastUserMessage.content.find((item: { type: string }) => item.type === "input_audio");
              if (audioContent && "transcript" in audioContent && audioContent.transcript && typeof audioContent.transcript === "string") {
                transcribedText = audioContent.transcript;
              }
            }
          }

          // Extract assistant response from the last assistant message
          const assistantMessages = history.filter(
            (item): item is Extract<typeof item, { type: "message"; role: "assistant" }> => item.type === "message" && item.role === "assistant"
          );

          if (assistantMessages.length > 0) {
            const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
            if (lastAssistantMessage.content) {
              // Get text response
              const textContent = lastAssistantMessage.content.find((item: { type: string }) => item.type === "output_text");
              if (textContent && "text" in textContent && typeof textContent.text === "string") {
                textResponse = textContent.text;
              }

              // If no text, try to get transcript from audio output
              if (!textResponse) {
                const audioContent = lastAssistantMessage.content.find((item: { type: string }) => item.type === "output_audio");
                if (audioContent && "transcript" in audioContent && audioContent.transcript && typeof audioContent.transcript === "string") {
                  textResponse = audioContent.transcript;
                }
              }
            }
          }
        });

        // Listen for agent end to know when response is complete
        this.session.on("agent_end", async () => {
          // Combine all audio chunks
          let voiceResponseBuffer: Buffer | null = null;
          if (audioChunks.length > 0) {
            // Calculate total length
            const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
            const combinedBuffer = new ArrayBuffer(totalLength);
            const combinedView = new Uint8Array(combinedBuffer);

            let offset = 0;
            for (const chunk of audioChunks) {
              const chunkView = new Uint8Array(chunk);
              combinedView.set(chunkView, offset);
              offset += chunk.byteLength;
            }

            const pcm16Buffer = Buffer.from(combinedBuffer);

            // Convert PCM16 response back to OGG for Telegram
            try {
              if (isFfmpegAvailable()) {
                voiceResponseBuffer = await convertPcm16ToOgg(pcm16Buffer);
              } else {
                // Fallback: use PCM16 directly (may not work with Telegram)
                console.warn("ffmpeg not available, using PCM16 directly (may not work with Telegram)");
                voiceResponseBuffer = pcm16Buffer;
              }
            } catch (conversionError) {
              console.error("Failed to convert PCM16 to OGG:", conversionError);
              // Fallback: use PCM16 directly
              voiceResponseBuffer = pcm16Buffer;
            }
          }

          // Clean up
          this.session?.close();
          this.session = null;

          // If we don't have a text response from the session, use the transcribed text
          if (!textResponse && transcribedText) {
            textResponse = transcribedText;
          }

          resolve({
            transcribedText: transcribedText || "",
            voiceResponseBuffer,
            textResponse: textResponse || "I'm sorry, I couldn't process your request.",
          });
        });

        this.session.on("error", (error) => {
          this.session?.close();
          this.session = null;
          reject(new Error(`Realtime API error: ${error.error}`));
        });

        // Connect to the session
        this.session
          .connect({
            apiKey: CONFIG.openAiApiKey,
          })
          .then(async () => {
            // Convert OGG to PCM16 for Realtime API
            let pcm16Buffer: Buffer;
            try {
              if (isFfmpegAvailable()) {
                pcm16Buffer = await convertOggToPcm16(audioBuffer);
              } else {
                console.warn("ffmpeg not available, sending OGG directly (may not work)");
                pcm16Buffer = audioBuffer;
              }
            } catch (conversionError) {
              console.error("Failed to convert OGG to PCM16:", conversionError);
              // Fallback: try sending OGG directly
              pcm16Buffer = audioBuffer;
            }

            // Convert Buffer to ArrayBuffer for sending
            // Ensure we have a proper ArrayBuffer (not SharedArrayBuffer)
            const arrayBuffer = new ArrayBuffer(pcm16Buffer.length);
            const view = new Uint8Array(arrayBuffer);
            view.set(pcm16Buffer);

            // Send the audio to the session
            this.session?.sendAudio(arrayBuffer, { commit: true });
          })
          .catch((error) => {
            this.session?.close();
            this.session = null;
            reject(new Error(`Failed to connect to Realtime API: ${error.message}`));
          });
      } catch (error) {
        if (this.session) {
          this.session.close();
          this.session = null;
        }
        reject(error);
      }
    });
  }

  /**
   * Process a voice message with fallback to traditional approach
   * This method tries Realtime API first, then falls back to Whisper + TTS if needed
   */
  async processVoiceMessageWithFallback(audioBuffer: Buffer, context?: AgentContext, options?: RealtimeVoiceOptions): Promise<RealtimeVoiceProcessingResult> {
    try {
      return await this.processVoiceMessage(audioBuffer, context, options);
    } catch (error) {
      console.error("Realtime API failed, falling back to traditional approach:", error);

      // Fallback: Use the existing orchestrator agent with text-based processing
      // This requires transcribing first, then getting text response, then TTS
      // For now, we'll return an error that can be handled by the caller
      throw new Error(`Voice processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update the agent's voice
   * @param voice - Voice name (alloy, echo, fable, onyx, nova, shimmer)
   */
  setVoice(voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"): void {
    this.agent = new RealtimeAgent({
      ...this.agent,
      voice,
    });
  }

  /**
   * Clean up any active sessions
   */
  cleanup(): void {
    if (this.session) {
      this.session.close();
      this.session = null;
    }
  }
}
