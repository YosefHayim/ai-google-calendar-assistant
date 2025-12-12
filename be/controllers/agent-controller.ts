import type { Request, Response } from "express";

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

export const agentController = {
  queryAgent,
};
