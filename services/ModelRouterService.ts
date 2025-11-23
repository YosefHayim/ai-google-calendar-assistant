/**
 * Model Router Service
 *
 * Analyzes tasks and intelligently selects the appropriate AI model based on:
 * - Task complexity (simple, medium, complex)
 * - Task type (calendar, conversation, reasoning, etc.)
 * - Cost and latency requirements
 * - Model capabilities
 *
 * Implements Approach 4 (Hybrid): Router Service + Dynamic Agent Creation
 */

import { Agent } from "@openai/agents";
import { MODELS, type AGENTS_LIST } from "@/types";
import { AGENTS, HANDS_OFF_AGENTS, ORCHESTRATOR_AGENT } from "@/ai-agents/agents";
import { getRecommendedModel, type ModelCapabilities, getModelCapabilities } from "@/config/models";
import { Logger } from "./logging/Logger";
import type { AgentContext } from "@/utils/activateAgent";

/**
 * Task analysis result
 */
export interface TaskAnalysis {
  /** Task complexity level */
  complexity: "simple" | "medium" | "complex";
  /** Type of task */
  type: "calendar" | "conversation" | "reasoning" | "coding" | "multimodal" | "specialized";
  /** Whether task requires step-by-step reasoning */
  requiresReasoning: boolean;
  /** Estimated token count for the task */
  estimatedTokens: number;
  /** Whether task is cost-sensitive */
  costSensitive: boolean;
  /** Whether task requires fast response */
  speedCritical: boolean;
  /** Whether task requires multimodal capabilities */
  requiresMultimodal: boolean;
}

/**
 * Model selection result
 */
export interface ModelSelection {
  /** Selected model */
  model: MODELS;
  /** Reason for selection */
  reason: string;
  /** Model capabilities */
  capabilities: ModelCapabilities;
}

/**
 * Routing metrics for analytics
 */
export interface RoutingMetrics {
  totalRoutings: number;
  modelUsage: Record<string, number>;
  agentUsage: Record<string, number>;
  averageComplexity: { simple: number; medium: number; complex: number };
  averageResponseTime?: number;
  cacheHits: number;
  cacheMisses: number;
}

/**
 * Service for intelligent model routing based on task analysis
 */
export class ModelRouterService {
  private logger: Logger;
  private agentCache: Map<string, Agent>;
  private metrics: RoutingMetrics;
  private cacheMaxSize: number;
  private cacheAccessOrder: string[]; // For LRU eviction

  constructor(cacheMaxSize: number = 50) {
    this.logger = new Logger("ModelRouterService");
    this.agentCache = new Map<string, Agent>();
    this.cacheMaxSize = cacheMaxSize;
    this.cacheAccessOrder = [];
    this.metrics = {
      totalRoutings: 0,
      modelUsage: {},
      agentUsage: {},
      averageComplexity: { simple: 0, medium: 0, complex: 0 },
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * Analyze a task to determine its characteristics
   * @param prompt - User prompt/request
   * @param context - Optional agent context (conversation history, vector search results)
   * @returns Task analysis with complexity, type, and requirements
   */
  analyzeTask(prompt: string, context?: AgentContext): TaskAnalysis {
    try {
      this.logger.debug("Analyzing task", { promptLength: prompt.length });

      // Calculate word count and estimate tokens (rough estimate: 1 token ≈ 0.75 words)
      const wordCount = prompt.split(/\s+/).filter((w) => w.length > 0).length;
      const contextLength = context?.conversationContext?.length || 0;
      const vectorSearchLength = context?.vectorSearchResults?.length || 0;
      const totalWords = wordCount + Math.floor(contextLength / 5) + Math.floor(vectorSearchLength / 5);
      const estimatedTokens = Math.ceil(totalWords / 0.75);

      // Determine complexity based on word count and content
      let complexity: "simple" | "medium" | "complex" = "simple";
      if (totalWords < 50) {
        complexity = "simple";
      } else if (totalWords < 200) {
        complexity = "medium";
      } else {
        complexity = "complex";
      }

      // Detect task type from prompt content
      const lowerPrompt = prompt.toLowerCase();
      let type: TaskAnalysis["type"] = "conversation";
      let requiresReasoning = false;
      let requiresMultimodal = false;

      // Calendar-related keywords
      const calendarKeywords = [
        "calendar",
        "event",
        "meeting",
        "appointment",
        "schedule",
        "reminder",
        "create",
        "update",
        "delete",
        "find",
        "when",
        "what time",
        "busy",
        "free",
        "available",
      ];
      const hasCalendarKeywords = calendarKeywords.some((keyword) => lowerPrompt.includes(keyword));

      // Reasoning-related keywords
      const reasoningKeywords = [
        "analyze",
        "compare",
        "why",
        "how",
        "explain",
        "reason",
        "logic",
        "calculate",
        "solve",
        "plan",
        "strategy",
        "optimize",
        "best",
        "should",
        "recommend",
      ];
      const hasReasoningKeywords = reasoningKeywords.some((keyword) => lowerPrompt.includes(keyword));

      // Multimodal keywords
      const multimodalKeywords = ["image", "picture", "photo", "video", "audio", "file", "attachment"];
      const hasMultimodalKeywords = multimodalKeywords.some((keyword) => lowerPrompt.includes(keyword));

      // Determine task type
      if (hasCalendarKeywords) {
        type = "calendar";
      } else if (hasReasoningKeywords && complexity === "complex") {
        type = "reasoning";
        requiresReasoning = true;
      } else if (hasMultimodalKeywords) {
        type = "multimodal";
        requiresMultimodal = true;
      } else {
        type = "conversation";
      }

      // Check for reasoning requirements
      if (hasReasoningKeywords || complexity === "complex") {
        requiresReasoning = true;
      }

      // Determine cost and speed sensitivity
      // Simple tasks are typically cost-sensitive and speed-critical
      const costSensitive = complexity === "simple" || wordCount < 30;
      const speedCritical = complexity === "simple" || wordCount < 50;

      const analysis: TaskAnalysis = {
        complexity,
        type,
        requiresReasoning,
        estimatedTokens,
        costSensitive,
        speedCritical,
        requiresMultimodal,
      };

      this.logger.debug("Task analysis complete", analysis);
      return analysis;
    } catch (error) {
      this.logger.error("Failed to analyze task", error);
      // Return default analysis on error
      return {
        complexity: "medium",
        type: "conversation",
        requiresReasoning: false,
        estimatedTokens: 100,
        costSensitive: true,
        speedCritical: false,
        requiresMultimodal: false,
      };
    }
  }

  /**
   * Select appropriate model based on task analysis
   * @param analysis - Task analysis result
   * @param agentType - Type of agent (for agent-specific routing)
   * @returns Model selection with reason
   */
  selectModel(analysis: TaskAnalysis, agentType?: string): ModelSelection {
    try {
      this.logger.debug("Selecting model", { analysis, agentType });

      // Use the recommended model function from config/models.ts
      const selectedModel = getRecommendedModel(analysis.complexity, analysis.type, {
        costSensitive: analysis.costSensitive,
        speedCritical: analysis.speedCritical,
        requiresReasoning: analysis.requiresReasoning,
        requiresMultimodal: analysis.requiresMultimodal,
        requiresTools: true, // All agents need tool support
      });

      const capabilities = getModelCapabilities(selectedModel);

      // Generate reason for selection
      const reasons: string[] = [];
      if (analysis.complexity === "simple") {
        reasons.push("simple task");
      } else if (analysis.complexity === "complex") {
        reasons.push("complex task");
      }
      if (analysis.type === "calendar") {
        reasons.push("calendar operation");
      } else if (analysis.type === "reasoning") {
        reasons.push("reasoning required");
      }
      if (analysis.costSensitive) {
        reasons.push("cost-sensitive");
      }
      if (analysis.speedCritical) {
        reasons.push("speed-critical");
      }

      const reason = `Selected ${selectedModel} for ${reasons.join(", ")}`;

      const selection: ModelSelection = {
        model: selectedModel,
        reason,
        capabilities,
      };

      this.logger.info("Model selected", { model: selectedModel, reason });
      return selection;
    } catch (error) {
      this.logger.error("Failed to select model", error);
      // Fallback to default model
      return {
        model: MODELS.GPT_5_MINI,
        reason: "Fallback to default model due to selection error",
        capabilities: getModelCapabilities(MODELS.GPT_5_MINI),
      };
    }
  }

  /**
   * Get or create an agent with the specified model
   * Caches agents to avoid recreation overhead (LRU eviction)
   * @param agentType - Agent type (key from AGENTS or agent name)
   * @param model - Model to use for the agent
   * @returns Agent instance with the specified model
   */
  getAgentWithModel(agentType: string, model: MODELS): Agent {
    const cacheKey = `${agentType}:${model}`;

    // Check cache first (LRU: move to end of access order)
    if (this.agentCache.has(cacheKey)) {
      this.logger.debug("Retrieved agent from cache", { cacheKey });
      // Update access order for LRU
      const index = this.cacheAccessOrder.indexOf(cacheKey);
      if (index > -1) {
        this.cacheAccessOrder.splice(index, 1);
      }
      this.cacheAccessOrder.push(cacheKey);
      this.metrics.cacheHits++;
      return this.agentCache.get(cacheKey)!;
    }

    this.metrics.cacheMisses++;

    this.logger.debug("Creating new agent", { agentType, model });

    // Get base agent configuration
    let baseAgent: Agent | undefined;

    // Try to find agent in AGENTS
    if (agentType in AGENTS) {
      baseAgent = AGENTS[agentType as AGENTS_LIST];
    }
    // Try to find in HANDS_OFF_AGENTS
    else if (agentType in HANDS_OFF_AGENTS) {
      baseAgent = HANDS_OFF_AGENTS[agentType as keyof typeof HANDS_OFF_AGENTS];
    }
    // Try ORCHESTRATOR_AGENT
    else if (agentType === "calendar_orchestrator_agent" || agentType === "orchestrator") {
      baseAgent = ORCHESTRATOR_AGENT;
    }
    // Try to find by name in all agents
    else {
      const allAgents = { ...AGENTS, ...HANDS_OFF_AGENTS, orchestrator: ORCHESTRATOR_AGENT };
      for (const agent of Object.values(allAgents)) {
        if (agent.name === agentType) {
          baseAgent = agent;
          break;
        }
      }
    }

    if (!baseAgent) {
      throw new Error(`Agent type "${agentType}" not found`);
    }

    // Create new agent with selected model
    // Clone the agent configuration but override the model
    const agent = new Agent({
      name: baseAgent.name,
      instructions: baseAgent.instructions,
      model: model, // Override model
      modelSettings: baseAgent.modelSettings,
      tools: baseAgent.tools,
      handoffDescription: baseAgent.handoffDescription,
    });

    // Evict least recently used if cache is full
    if (this.agentCache.size >= this.cacheMaxSize) {
      const lruKey = this.cacheAccessOrder.shift();
      if (lruKey) {
        this.agentCache.delete(lruKey);
        this.logger.debug("Evicted LRU agent from cache", { lruKey });
      }
    }

    // Cache the agent (add to end of access order)
    this.agentCache.set(cacheKey, agent);
    this.cacheAccessOrder.push(cacheKey);
    this.logger.debug("Cached new agent", { cacheKey, cacheSize: this.agentCache.size });

    return agent;
  }

  /**
   * Record routing metrics
   * @param analysis - Task analysis
   * @param selection - Model selection
   * @param agentType - Agent type used
   * @param responseTimeMs - Optional response time in milliseconds
   */
  recordRouting(analysis: TaskAnalysis, selection: ModelSelection, agentType: string, responseTimeMs?: number): void {
    this.metrics.totalRoutings++;

    // Track model usage
    this.metrics.modelUsage[selection.model] = (this.metrics.modelUsage[selection.model] || 0) + 1;

    // Track agent usage
    this.metrics.agentUsage[agentType] = (this.metrics.agentUsage[agentType] || 0) + 1;

    // Track complexity distribution
    const complexityCount = this.metrics.averageComplexity[analysis.complexity];
    this.metrics.averageComplexity[analysis.complexity] = complexityCount + 1;

    // Track response time if provided
    if (responseTimeMs !== undefined) {
      const currentAvg = this.metrics.averageResponseTime || 0;
      const count = this.metrics.totalRoutings;
      this.metrics.averageResponseTime = (currentAvg * (count - 1) + responseTimeMs) / count;
    }

    this.logger.debug("Recorded routing metrics", {
      model: selection.model,
      agent: agentType,
      complexity: analysis.complexity,
      cacheHit: this.metrics.cacheHits,
      cacheMiss: this.metrics.cacheMisses,
    });
  }

  /**
   * Get current routing metrics
   * @returns Current metrics snapshot
   */
  getMetrics(): RoutingMetrics {
    return {
      ...this.metrics,
      cacheHits: this.metrics.cacheHits,
      cacheMisses: this.metrics.cacheMisses,
    };
  }

  /**
   * Reset metrics (useful for testing or periodic resets)
   */
  resetMetrics(): void {
    this.metrics = {
      totalRoutings: 0,
      modelUsage: {},
      agentUsage: {},
      averageComplexity: { simple: 0, medium: 0, complex: 0 },
      cacheHits: 0,
      cacheMisses: 0,
    };
    this.logger.info("Routing metrics reset");
  }

  /**
   * Clear agent cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.agentCache.clear();
    this.cacheAccessOrder = [];
    this.logger.debug("Agent cache cleared");
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number; keys: string[] } {
    const totalAccesses = this.metrics.cacheHits + this.metrics.cacheMisses;
    const hitRate = totalAccesses > 0 ? this.metrics.cacheHits / totalAccesses : 0;
    return {
      size: this.agentCache.size,
      maxSize: this.cacheMaxSize,
      hitRate: Math.round(hitRate * 100) / 100,
      keys: Array.from(this.agentCache.keys()),
    };
  }
}

