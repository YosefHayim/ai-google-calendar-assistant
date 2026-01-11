import type { Request, Response } from "express"
import { STATUS_RESPONSE } from "@/config"
import { reqResAsyncHandler, sendR } from "@/utils/http"
import { transcribeAudio } from "@/utils/ai/voice-transcription"
import {
  generateSpeech,
  isValidVoice,
  DEFAULT_VOICE,
  type TTSVoice,
} from "@/utils/ai/text-to-speech"
import { getVoicePreference } from "@/services/user-preferences-service"
import {
  DEFAULT_AGENT_PROFILE_ID,
  getProfilesForTier,
  formatProfileForClient,
  type AgentTier,
} from "@/shared/orchestrator"

const transcribe = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Audio file is required.");
  }

  const result = await transcribeAudio(req.file.buffer, req.file.mimetype);

  if (!result.success) {
    return sendR(
      res,
      STATUS_RESPONSE.BAD_REQUEST,
      result.error ?? "Transcription failed.",
    );
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Audio transcribed successfully", {
    text: result.text,
  });
});

const synthesize = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { text, voice: requestedVoice } = req.body as {
    text?: string;
    voice?: string;
  };

  if (!text?.trim()) {
    return sendR(
      res,
      STATUS_RESPONSE.BAD_REQUEST,
      "Text is required for speech synthesis.",
    );
  }

  let voice: TTSVoice = DEFAULT_VOICE;

  if (requestedVoice && isValidVoice(requestedVoice)) {
    voice = requestedVoice;
  } else if (req.user?.id) {
    const pref = await getVoicePreference(req.user.id);
    if (pref?.voice && isValidVoice(pref.voice)) {
      voice = pref.voice;
    }
  }

  const result = await generateSpeech(text, voice);

  if (!result.success || !result.audioBuffer) {
    return sendR(
      res,
      STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
      result.error ?? "Speech synthesis failed.",
    );
  }

  res.set({
    "Content-Type": "audio/mpeg",
    "Content-Length": result.audioBuffer.length.toString(),
    "Content-Disposition": "inline; filename=speech.mp3",
  });

  return res.send(result.audioBuffer);
});

const getAgentProfiles = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userTier = (req.query.tier as AgentTier) || "free"

  const profiles = getProfilesForTier(userTier)
  const formatted = profiles.map(formatProfileForClient)

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Agent profiles retrieved", {
    profiles: formatted,
    defaultProfileId: DEFAULT_AGENT_PROFILE_ID,
  })
})

export default { transcribe, synthesize, getAgentProfiles }
