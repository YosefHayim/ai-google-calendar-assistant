/**
 * Brain Insight Service
 *
 * AI-powered service for extracting insights from conversations
 * and automatically updating Ally's brain based on importance.
 */

import OpenAI from "openai";
import { CONFIG } from "@/config";
import {
  type BrainInsight,
  type BrainInsightImportance,
  type AllyBrainPreference,
  getAllyBrainPreference,
  addBrainInsight,
  updateAllyBrainWithTimestamp,
} from "./user-preferences-service";
import { logger } from "@/utils/logger";

// ============================================
// Types
// ============================================

export type InsightExtractionResult = {
  insights: ExtractedInsight[];
  shouldUpdate: boolean;
  reason: string;
};

export type ExtractedInsight = {
  content: string;
  importance: BrainInsightImportance;
  category: BrainInsight["category"];
  confidence: number;
};

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

// ============================================
// OpenAI Client
// ============================================

const openai = new OpenAI({
  apiKey: CONFIG.OPEN_AI_API_KEY,
});

// ============================================
// Insight Extraction Prompt
// ============================================

const INSIGHT_EXTRACTION_SYSTEM_PROMPT = `You are an AI assistant that extracts important personal information from conversations to help build a user profile.

Your task is to analyze the conversation and extract any NEW, USEFUL insights about the user that would help personalize their experience.

Categories of insights:
- preference: User's preferences (meeting times, communication style, etc.)
- schedule: Regular schedules (work hours, gym times, etc.)
- location: Important locations (home, work, gym, etc.)
- contact: People the user mentions frequently
- habit: Regular habits or routines
- work: Work-related information (company, role, colleagues)
- other: Any other valuable information

Importance levels:
- low: Nice to know but not essential
- medium: Useful for better personalization
- high: Important for accurate assistance
- critical: Essential information that significantly affects how to help the user

Rules:
1. Only extract NEW information not already known
2. Be specific and concise
3. Focus on actionable information
4. Avoid extracting sensitive data (passwords, financial details, etc.)
5. Confidence score (0-1) indicates how certain you are about the extraction

Output JSON only with this structure:
{
  "insights": [
    {
      "content": "string - the insight text",
      "importance": "low|medium|high|critical",
      "category": "preference|schedule|location|contact|habit|work|other",
      "confidence": 0.0-1.0
    }
  ],
  "shouldUpdate": true/false,
  "reason": "Brief explanation of why or why not to update"
}`;

// ============================================
// Core Functions
// ============================================

/**
 * Extract insights from a conversation using AI
 */
export async function extractInsightsFromConversation(
  messages: ConversationMessage[],
  existingInsights: BrainInsight[] = [],
  existingInstructions: string = ""
): Promise<InsightExtractionResult> {
  try {
    const conversationText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const existingKnowledge = existingInsights
      .map((i) => `- [${i.category}] ${i.content}`)
      .join("\n");

    const userPrompt = `Current knowledge about user:
${existingKnowledge || "None yet"}

User's custom instructions:
${existingInstructions || "None"}

Recent conversation:
${conversationText}

Analyze this conversation and extract any NEW insights about the user. Return JSON only.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: INSIGHT_EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        insights: [],
        shouldUpdate: false,
        reason: "No response from AI",
      };
    }

    const result = JSON.parse(content) as InsightExtractionResult;
    return result;
  } catch (error) {
    logger.error(`brain-insight: Failed to extract insights: ${error}`);
    return {
      insights: [],
      shouldUpdate: false,
      reason: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Process conversation and update brain if auto-update is enabled
 */
export async function processConversationForBrainUpdate(
  userId: string,
  messages: ConversationMessage[]
): Promise<{
  updated: boolean;
  insightsAdded: number;
  reason: string;
}> {
  try {
    const allyBrain = await getAllyBrainPreference(userId);

    // Check if auto-update is enabled
    if (!allyBrain?.autoUpdate?.enabled) {
      return {
        updated: false,
        insightsAdded: 0,
        reason: "Auto-update is disabled",
      };
    }

    // Extract insights from the conversation
    const extractionResult = await extractInsightsFromConversation(
      messages,
      allyBrain.insights || [],
      allyBrain.instructions || ""
    );

    if (!extractionResult.shouldUpdate || extractionResult.insights.length === 0) {
      return {
        updated: false,
        insightsAdded: 0,
        reason: extractionResult.reason,
      };
    }

    // Filter insights by importance threshold
    const importanceOrder: BrainInsightImportance[] = [
      "low",
      "medium",
      "high",
      "critical",
    ];
    const thresholdIndex = importanceOrder.indexOf(
      allyBrain.autoUpdate.importanceThreshold
    );

    const qualifyingInsights = extractionResult.insights.filter(
      (insight) =>
        importanceOrder.indexOf(insight.importance) >= thresholdIndex &&
        insight.confidence >= 0.7
    );

    if (qualifyingInsights.length === 0) {
      return {
        updated: false,
        insightsAdded: 0,
        reason: "No insights meet the importance threshold",
      };
    }

    // Add qualifying insights to the brain
    let addedCount = 0;
    for (const insight of qualifyingInsights) {
      await addBrainInsight(userId, {
        content: insight.content,
        importance: insight.importance,
        category: insight.category,
        source: "conversation",
      });
      addedCount++;
    }

    return {
      updated: true,
      insightsAdded: addedCount,
      reason: `Added ${addedCount} new insight(s) to Ally's brain`,
    };
  } catch (error) {
    logger.error(`brain-insight: Failed to process conversation: ${error}`);
    return {
      updated: false,
      insightsAdded: 0,
      reason: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Manually trigger insight extraction and update
 */
export async function manuallyExtractAndUpdateBrain(
  userId: string,
  messages: ConversationMessage[],
  forceUpdate: boolean = false
): Promise<InsightExtractionResult & { addedInsights: BrainInsight[] }> {
  const allyBrain = await getAllyBrainPreference(userId);

  const extractionResult = await extractInsightsFromConversation(
    messages,
    allyBrain?.insights || [],
    allyBrain?.instructions || ""
  );

  const addedInsights: BrainInsight[] = [];

  if (forceUpdate || extractionResult.shouldUpdate) {
    for (const insight of extractionResult.insights) {
      if (insight.confidence >= 0.5) {
        const added = await addBrainInsight(userId, {
          content: insight.content,
          importance: insight.importance,
          category: insight.category,
          source: "conversation",
        });
        addedInsights.push(added);
      }
    }
  }

  return {
    ...extractionResult,
    addedInsights,
  };
}

/**
 * Build Ally Brain context for prompts (includes insights)
 */
export async function buildAllyBrainContext(
  userId: string
): Promise<string | null> {
  const allyBrain = await getAllyBrainPreference(userId);

  if (!allyBrain?.enabled) {
    return null;
  }

  const parts: string[] = [];

  // Add custom instructions
  if (allyBrain.instructions?.trim()) {
    parts.push("--- User's Custom Instructions ---");
    parts.push(allyBrain.instructions);
  }

  // Add learned insights
  if (allyBrain.insights && allyBrain.insights.length > 0) {
    parts.push("\n--- Learned Insights About User ---");

    // Group insights by category
    const byCategory = allyBrain.insights.reduce(
      (acc, insight) => {
        if (!acc[insight.category]) acc[insight.category] = [];
        acc[insight.category].push(insight);
        return acc;
      },
      {} as Record<string, BrainInsight[]>
    );

    for (const [category, insights] of Object.entries(byCategory)) {
      parts.push(`[${category.toUpperCase()}]`);
      for (const insight of insights) {
        const importanceTag =
          insight.importance === "critical" || insight.importance === "high"
            ? ` (${insight.importance.toUpperCase()})`
            : "";
        parts.push(`- ${insight.content}${importanceTag}`);
      }
    }
  }

  if (parts.length === 0) {
    return null;
  }

  parts.push("--- End User Context ---");

  return parts.join("\n");
}

/**
 * Summarize brain insights into natural language
 */
export async function summarizeBrainInsights(
  insights: BrainInsight[]
): Promise<string> {
  if (insights.length === 0) {
    return "No insights learned yet.";
  }

  try {
    const insightsList = insights
      .map((i) => `- [${i.category}/${i.importance}] ${i.content}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content:
            "Summarize these user insights into 2-3 natural sentences that describe what you know about the user. Be concise.",
        },
        {
          role: "user",
          content: insightsList,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || "Unable to summarize.";
  } catch {
    return `${insights.length} insight(s) learned about the user.`;
  }
}
