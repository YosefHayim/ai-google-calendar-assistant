import type { AgentContext } from "@/utils/activateAgent";
import { CONFIG } from "@/config/root-config";
import { ORCHESTRATOR_AGENT } from "@/ai-agents/agents";
import OpenAI from "openai";
import { activateAgent } from "@/utils/activateAgent";

export interface VoiceProcessingResult {
  transcribedText: string;
  voiceResponseBuffer: Buffer | null;
  textResponse: string;
}

/**
 * Service for processing voice messages with OpenAI
 * Uses Whisper for transcription and TTS for voice responses
 */
export class VoiceAgentService {
  private openai: OpenAI;
  private voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

  constructor(voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy") {
    this.openai = new OpenAI({
      apiKey: CONFIG.openAiApiKey,
    });
    this.voice = voice;
  }

  /**
   * Transcribe audio to text using OpenAI Whisper
   * @param audioBuffer - Audio file buffer (OGG format from Telegram)
   * @param languageCode - ISO 639-1 language code (e.g., "en", "es", "fr"). Defaults to "en"
   * @returns Promise with transcribed text
   */
  async transcribeAudio(audioBuffer: Buffer, languageCode: string = "en"): Promise<string> {
    try {
      // Create a File-like object from the buffer for Node.js
      // Convert Buffer to Uint8Array to ensure proper type compatibility with Blob
      const audioData = new Uint8Array(audioBuffer);
      const audioBlob = new Blob([audioData], { type: "audio/ogg" });
      const audioFile = new File([audioBlob], "voice.ogg", { type: "audio/ogg" });

      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: languageCode, // Use provided language code from user_telegram_links
      });

      return transcription.text;
    } catch (error) {
      console.error("[VoiceAgentService] Error transcribing audio:", error);
      throw new Error("Failed to transcribe audio");
    }
  }

  /**
   * Generate voice response from text using OpenAI TTS
   * @param text - Text to convert to speech
   * @returns Promise with audio buffer
   */
  async generateVoiceResponse(text: string): Promise<Buffer> {
    try {
      const mp3 = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: this.voice,
        input: text,
      });

      // Convert the response to a buffer
      const arrayBuffer = await mp3.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error("[VoiceAgentService] Error generating voice response:", error);
      throw new Error("Failed to generate voice response");
    }
  }

  /**
   * Process a voice message: transcribe, get agent response, and generate voice response
   * @param audioBuffer - Audio file buffer (OGG format from Telegram)
   * @param context - Agent context (conversation history, user info, etc.)
   * @param languageCode - ISO 639-1 language code (e.g., "en", "es", "fr"). Defaults to "en"
   * @returns Promise with transcribed text, voice response buffer, and text response
   */
  async processVoiceMessage(audioBuffer: Buffer, context?: AgentContext, languageCode: string = "en"): Promise<VoiceProcessingResult> {
    // Step 1: Transcribe the audio with language code
    const transcribedText = await this.transcribeAudio(audioBuffer, languageCode);

    if (!transcribedText || transcribedText.trim().length === 0) {
      console.error("[VoiceAgentService] Transcription returned empty text");
      throw new Error("No text was transcribed from the audio");
    }

    // Step 2: Get agent response using the existing orchestrator agent
    // Pass language code to context so agent responds in the same language
    const agentContext = {
      ...context,
      languageCode,
    };
    const agentResult = await activateAgent(
      ORCHESTRATOR_AGENT,
      `Current date and time is ${new Date().toISOString()}. User ${context?.email || "unknown"} requesting for help with: ${transcribedText}`,
      agentContext,
      {
        autoRoute: true,
      }
    );

    const textResponse = agentResult.finalOutput || "I'm sorry, I couldn't process your request.";

    // Step 3: Generate voice response from the text
    let voiceResponseBuffer: Buffer | null = null;
    try {
      voiceResponseBuffer = await this.generateVoiceResponse(textResponse);
    } catch (error) {
      console.error("[VoiceAgentService] Error generating voice response, will return text only:", error);
      // Continue without voice response
    }

    return {
      transcribedText,
      voiceResponseBuffer,
      textResponse,
    };
  }

  /**
   * Update the agent's voice
   * @param voice - Voice name (alloy, echo, fable, onyx, nova, shimmer)
   */
  setVoice(voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"): void {
    this.voice = voice;
  }
}
