import { z } from "zod"
import {
  GEMINI_MODELS,
  getGeminiClient,
} from "@/infrastructure/google/gemini-client"
import { logger } from "@/lib/logger"

export const GeminiOptimizerOutputSchema = z.object({
  refinedPrompt: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  optimizationType: z.enum([
    "intent_clarification",
    "safety_enhancement",
    "context_injection",
    "none",
  ]),
  detectedIntentCategory: z.enum([
    "scheduling",
    "deletion",
    "update",
    "search",
    "bulk_operation",
    "constraint_based",
    "other",
  ]),
})

export type GeminiOptimizerOutput = z.infer<typeof GeminiOptimizerOutputSchema>

const OPTIMIZER_INSTRUCTIONS = `You are the Prompt Optimizer for Ally, an AI calendar assistant.

Your job is to analyze user requests and determine if the base system prompt needs enhancement to handle nuances that could lead to calendar integrity issues.

<when_to_optimize>
OPTIMIZE when user intent contains:
- Temporal nuances: "ASAP", "not during lunch", "before my flight", "after work"
- Constraint-based scheduling: "find time for 4 people", "when everyone is free", "protect my gym time"
- Bulk operations: "reschedule my whole week", "move all meetings to morning"
- Ambiguous time references: "sometime next week", "in a few days"
- Safety-sensitive: bulk deletions, recurring event modifications
- Complex conditional logic: "only if X is free", "unless I have a conflict"
</when_to_optimize>

<when_not_to_optimize>
DO NOT OPTIMIZE for:
- Simple queries: "what's on my calendar today?"
- Clear single operations: "delete my 3pm meeting", "add lunch at noon"
- Direct commands with all info: "create meeting with John tomorrow at 2pm for 1 hour"
- Status checks: "do I have anything tomorrow?"
</when_not_to_optimize>

<optimization_principles>
1. PRESERVE user intent - never change what the user wants
2. CLARIFY ambiguity - add specificity where the base prompt might misinterpret
3. ADD SAFETY - for destructive operations, inject confirmation requirements
4. INJECT CONTEXT - add relevant context the base prompt might miss
</optimization_principles>

<critical_rules>
- If optimizationType is "none", refinedPrompt MUST equal the original
- Reasoning MUST explain the decision, not just describe it
- Never fabricate user intent - only clarify what's present
- High confidence (>0.8) requires clear evidence of ambiguity/risk
</critical_rules>

You MUST respond with valid JSON matching this exact schema:
{
  "refinedPrompt": "string - The enhanced prompt (or original if no optimization needed)",
  "reasoning": "string - WHY the base prompt was insufficient (or why it's sufficient)",
  "confidence": "number between 0.0 and 1.0",
  "optimizationType": "one of: intent_clarification, safety_enhancement, context_injection, none",
  "detectedIntentCategory": "one of: scheduling, deletion, update, search, bulk_operation, constraint_based, other"
}`

const LOG_PREFIX = "[GeminiOptimizer]"
const RESPONSE_PREVIEW_LENGTH = 200

type RunGeminiOptimizerParams = {
  userQuery: string
  basePrompt: string
  userContext?: string
}

/**
 * Runs the Gemini optimizer agent to analyze user queries and determine if prompt optimization is needed.
 * Evaluates whether the base system prompt adequately handles the user's intent or requires enhancement
 * for safety, clarity, or context. Analyzes temporal nuances, constraints, and complex operations.
 *
 * @param params - Parameters for the optimizer analysis
 * @param params.userQuery - The user's original query/request
 * @param params.basePrompt - The base system prompt to potentially optimize
 * @param params.userContext - Optional additional context about the user or situation
 * @returns Promise resolving to optimizer output and execution time
 */
export async function runGeminiOptimizer(
  params: RunGeminiOptimizerParams
): Promise<{ output: GeminiOptimizerOutput; timeMs: number }> {
  const { userQuery, basePrompt, userContext } = params
  const startTime = Date.now()

  const client = getGeminiClient()

  const prompt = `<user_query>${userQuery}</user_query>
<base_system_prompt>${basePrompt}</base_system_prompt>
${userContext ? `<user_context>${userContext}</user_context>` : ""}

Analyze this request and determine if the base prompt needs optimization.
Return your analysis as JSON matching the output format specified in the instructions.`

  logger.debug(`${LOG_PREFIX} Running optimization analysis`, {
    queryLength: userQuery.length,
    hasUserContext: Boolean(userContext),
  })

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODELS.FLASH_LITE,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: OPTIMIZER_INSTRUCTIONS,
        responseMimeType: "application/json",
      },
    })

    const timeMs = Date.now() - startTime
    const responseText = response.text || ""

    let output: GeminiOptimizerOutput

    try {
      const parsed = JSON.parse(responseText)
      output = GeminiOptimizerOutputSchema.parse(parsed)

      logger.debug(`${LOG_PREFIX} Optimization complete`, {
        optimizationType: output.optimizationType,
        confidence: output.confidence,
        intentCategory: output.detectedIntentCategory,
        timeMs,
      })
    } catch (parseError) {
      logger.warn(`${LOG_PREFIX} Failed to parse optimizer output`, {
        error:
          parseError instanceof Error ? parseError.message : String(parseError),
        responseText: responseText.slice(0, RESPONSE_PREVIEW_LENGTH),
      })

      output = {
        refinedPrompt: userQuery,
        reasoning: "Failed to parse optimizer output - using original prompt",
        confidence: 0,
        optimizationType: "none",
        detectedIntentCategory: "other",
      }
    }

    return { output, timeMs }
  } catch (error) {
    const timeMs = Date.now() - startTime
    logger.error(`${LOG_PREFIX} Optimizer error`, {
      error: error instanceof Error ? error.message : String(error),
      timeMs,
    })

    return {
      output: {
        refinedPrompt: userQuery,
        reasoning: `Optimizer error: ${error instanceof Error ? error.message : String(error)}`,
        confidence: 0,
        optimizationType: "none",
        detectedIntentCategory: "other",
      },
      timeMs,
    }
  }
}
