import type { Request, Response } from "express";

import { CONFIG } from "@/config/root-config";
import { ORCHESTRATOR_AGENT } from "@/ai-agents/agents";
import { STATUS_RESPONSE } from "@/types";
import type { User } from "@supabase/supabase-js";
import { activateAgent } from "@/utils/activate-agent";
import { reqResAsyncHandler } from "@/utils/async-handlers";
import sendR from "@/utils/send-response";

const queryAgent = reqResAsyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const { query } = req.body;

  if (!query || typeof query !== "string") {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Query is required and must be a string.");
  }

  if (!user.email) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "User email is required.");
  }

  try {
    const prompt = `Current date and time is ${new Date().toISOString()}. User ${user.email} requesting for help with: ${query}`;
    const { finalOutput } = await activateAgent(ORCHESTRATOR_AGENT, prompt);

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Agent query processed successfully", {
      response: finalOutput || "No output received from AI Agent.",
    });
  } catch (error) {
    console.error("Agent error:", error);
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Error processing agent query", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const queryAgentWithAudio = reqResAsyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const audioFile = (req as Request & { file?: Express.Multer.File }).file;

  if (!audioFile || !audioFile.buffer) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Audio file is required.");
  }

  if (!user.email) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "User email is required.");
  }

  try {
    // Step 1: Transcribe audio using OpenAI Whisper API
    const openaiApiKey = CONFIG.openAiApiKey;
    if (!openaiApiKey) {
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "OpenAI API key is not configured.");
    }

    // Create FormData for OpenAI API using form-data package
    const FormData = (await import("form-data")).default;
    const formData = new FormData();
    formData.append("file", audioFile.buffer, {
      filename: audioFile.originalname || "audio.webm",
      contentType: audioFile.mimetype || "audio/webm",
    });
    formData.append("model", "whisper-1");

    const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        ...formData.getHeaders(),
      },
      body: formData as unknown as BodyInit,
    });

    if (!transcriptionResponse.ok) {
      const errorData = await transcriptionResponse.json().catch(() => ({}));
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to transcribe audio", {
        error: errorData,
      });
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcribedText = transcriptionData.text || "";

    if (!transcribedText) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "No text was transcribed from the audio.");
    }

    // Step 2: Process transcribed text with agent
    const prompt = `Current date and time is ${new Date().toISOString()}. User ${user.email} requesting for help with: ${transcribedText}`;
    const { finalOutput } = await activateAgent(ORCHESTRATOR_AGENT, prompt);

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Agent query processed successfully", {
      response: finalOutput || "No output received from AI Agent.",
      transcribedText,
    });
  } catch (error) {
    console.error("Agent audio error:", error);
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Error processing audio query", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export const agentController = {
  queryAgent,
  queryAgentWithAudio,
};
