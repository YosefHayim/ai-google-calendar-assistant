import { Agent, run } from "@openai/agents"
import { z } from "zod"
import { MODELS } from "@/config"

export const OptimizerOutputSchema = z.object({
  refined_prompt: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  optimization_type: z.enum([
    "intent_clarification",
    "safety_enhancement",
    "context_injection",
    "none",
  ]),
  detected_intent_category: z.enum([
    "scheduling",
    "deletion",
    "update",
    "search",
    "bulk_operation",
    "constraint_based",
    "other",
  ]),
})

export type OptimizerOutput = z.infer<typeof OptimizerOutputSchema>

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

<output_format>
Return a JSON object with:
- refined_prompt: The enhanced prompt (or original if no optimization needed)
- reasoning: WHY the base prompt was insufficient (or why it's sufficient)
- confidence: 0.0-1.0 how confident you are in the optimization
- optimization_type: What kind of enhancement was made
- detected_intent_category: What the user is trying to do
</output_format>

<critical_rules>
- If optimization_type is "none", refined_prompt MUST equal the original
- Reasoning MUST explain the decision, not just describe it
- Never fabricate user intent - only clarify what's present
- High confidence (>0.8) requires clear evidence of ambiguity/risk
</critical_rules>`

export const OPTIMIZER_AGENT = new Agent({
  name: "prompt_optimizer_agent",
  model: MODELS.GPT_4_1_MINI,
  instructions: OPTIMIZER_INSTRUCTIONS,
})

type RunOptimizerParams = {
  userQuery: string
  basePrompt: string
  userContext?: string
}

/**
 * Runs the optimizer agent to analyze user queries and determine if prompt optimization is needed.
 * Evaluates whether the base system prompt adequately handles the user's intent or requires enhancement
 * for safety, clarity, or context. Analyzes temporal nuances, constraints, and complex operations.
 *
 * @param params - Parameters for the optimizer analysis
 * @param params.userQuery - The user's original query/request
 * @param params.basePrompt - The base system prompt to potentially optimize
 * @param params.userContext - Optional additional context about the user or situation
 * @returns Promise resolving to optimizer output and execution time
 */
export async function runOptimizer(
  params: RunOptimizerParams
): Promise<{ output: OptimizerOutput; timeMs: number }> {
  const { userQuery, basePrompt, userContext } = params
  const startTime = Date.now()

  const prompt = `<user_query>${userQuery}</user_query>
<base_system_prompt>${basePrompt}</base_system_prompt>
${userContext ? `<user_context>${userContext}</user_context>` : ""}

Analyze this request and determine if the base prompt needs optimization.
Return your analysis as JSON matching the output format.`

  const result = await run(OPTIMIZER_AGENT, prompt)
  const timeMs = Date.now() - startTime

  let output: OptimizerOutput

  try {
    const parsed =
      typeof result.finalOutput === "string"
        ? JSON.parse(result.finalOutput)
        : result.finalOutput

    output = OptimizerOutputSchema.parse(parsed)
  } catch {
    output = {
      refined_prompt: userQuery,
      reasoning: "Failed to parse optimizer output - using original prompt",
      confidence: 0,
      optimization_type: "none",
      detected_intent_category: "other",
    }
  }

  return { output, timeMs }
}
