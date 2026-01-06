import type { Request, Response } from "express"
import { STATUS_RESPONSE } from "@/config"
import { reqResAsyncHandler, sendR } from "@/utils/http"
import { transcribeAudio } from "@/utils/ai/voice-transcription"

const transcribe = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Audio file is required.")
  }

  const result = await transcribeAudio(req.file.buffer, req.file.mimetype)

  if (!result.success) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, result.error ?? "Transcription failed.")
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Audio transcribed successfully", {
    text: result.text,
  })
})

export default { transcribe }
