/**
 * OpenAI Models Configuration
 *
 * Comprehensive model descriptions with capabilities, use cases, and selection criteria.
 * Used by ModelRouterService to intelligently select the appropriate model based on task requirements.
 */

import { MODELS } from "@/types";

export interface ModelCapabilities {
  /** Short description of the model */
  description: string;
  /** Primary use cases for this model */
  useCases: string[];
  /** Task complexity this model handles best */
  complexity: "simple" | "medium" | "complex" | "any";
  /** Task types this model excels at */
  taskTypes: ("calendar" | "conversation" | "reasoning" | "coding" | "multimodal" | "specialized")[];
  /** Estimated cost tier (1=lowest, 5=highest) */
  costTier: 1 | 2 | 3 | 4 | 5;
  /** Estimated latency tier (1=fastest, 5=slowest) */
  latencyTier: 1 | 2 | 3 | 4 | 5;
  /** Context window size in tokens (approximate) */
  contextWindow: number;
  /** Whether model supports reasoning/chain-of-thought */
  supportsReasoning: boolean;
  /** Whether model supports multimodal (text, image, audio, video) */
  supportsMultimodal: boolean;
  /** Whether model supports tool/function calling */
  supportsTools: boolean;
  /** Recommended for cost-sensitive applications */
  costOptimized: boolean;
  /** Recommended for real-time/low-latency applications */
  speedOptimized: boolean;
}

export const MODEL_CAPABILITIES: Record<MODELS, ModelCapabilities> = {
  // ============================================
  // FRONTIER REASONING MODELS
  // ============================================

  [MODELS.GPT_5]: {
    description: "Most advanced model with enhanced reasoning, up to 1M token context, persistent memory, multimodal (text/image/audio/video)",
    useCases: ["Complex reasoning", "Multi-step problem solving", "Advanced analysis", "Large context tasks"],
    complexity: "complex",
    taskTypes: ["reasoning", "conversation", "multimodal"],
    costTier: 5,
    latencyTier: 4,
    contextWindow: 1000000,
    supportsReasoning: true,
    supportsMultimodal: true,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.GPT_5_MINI]: {
    description: "Cost-effective variant of GPT-5, optimized for general tasks with good performance",
    useCases: ["General conversation", "Calendar operations", "Standard tasks", "Cost-sensitive applications"],
    complexity: "medium",
    taskTypes: ["calendar", "conversation"],
    costTier: 2,
    latencyTier: 2,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: true,
    speedOptimized: true,
  },

  [MODELS.GPT_5_NANO]: {
    description: "High-speed, lightweight variant for simple, fast tasks",
    useCases: ["Simple queries", "Quick responses", "High-throughput tasks", "Cost-critical applications"],
    complexity: "simple",
    taskTypes: ["calendar", "conversation"],
    costTier: 1,
    latencyTier: 1,
    contextWindow: 32000,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: true,
    speedOptimized: true,
  },

  [MODELS.O3]: {
    description: "Enhanced reasoning model focused on step-by-step logical problem solving",
    useCases: ["Complex reasoning", "Mathematical problems", "Logical analysis", "Multi-step planning"],
    complexity: "complex",
    taskTypes: ["reasoning"],
    costTier: 5,
    latencyTier: 5,
    contextWindow: 200000,
    supportsReasoning: true,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.O3_PRO]: {
    description: "Professional version of O3 with extended reasoning capabilities",
    useCases: ["Advanced reasoning", "Research", "Complex analysis", "Critical decision making"],
    complexity: "complex",
    taskTypes: ["reasoning"],
    costTier: 5,
    latencyTier: 5,
    contextWindow: 200000,
    supportsReasoning: true,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.O3_MINI]: {
    description: "Lighter, faster version of O3 for precision tasks requiring speed",
    useCases: ["Moderate reasoning", "Quick analysis", "Balanced performance"],
    complexity: "medium",
    taskTypes: ["reasoning"],
    costTier: 3,
    latencyTier: 3,
    contextWindow: 128000,
    supportsReasoning: true,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: true,
  },

  [MODELS.O4_MINI]: {
    description: "Generative model capable of processing text and images, supports chain-of-thought reasoning",
    useCases: ["Multimodal reasoning", "Image analysis", "Whiteboard sketches", "Visual understanding"],
    complexity: "medium",
    taskTypes: ["reasoning", "multimodal"],
    costTier: 4,
    latencyTier: 4,
    contextWindow: 128000,
    supportsReasoning: true,
    supportsMultimodal: true,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.O1]: {
    description: "Reasoning model optimized for logical problem solving and step-by-step thinking",
    useCases: ["Logical reasoning", "Problem solving", "Analytical tasks"],
    complexity: "complex",
    taskTypes: ["reasoning"],
    costTier: 4,
    latencyTier: 4,
    contextWindow: 200000,
    supportsReasoning: true,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.O1_PRO]: {
    description: "Professional version of O1 with extended capabilities for complex reasoning",
    useCases: ["Advanced reasoning", "Research", "Complex problem solving"],
    complexity: "complex",
    taskTypes: ["reasoning"],
    costTier: 5,
    latencyTier: 5,
    contextWindow: 200000,
    supportsReasoning: true,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  // ============================================
  // DEEP RESEARCH MODELS
  // ============================================

  [MODELS.O3_DEEP_RESEARCH]: {
    description: "O3 variant optimized for deep research and extensive analysis",
    useCases: ["Research", "Deep analysis", "Comprehensive investigation", "Academic work"],
    complexity: "complex",
    taskTypes: ["reasoning"],
    costTier: 5,
    latencyTier: 5,
    contextWindow: 200000,
    supportsReasoning: true,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.O4_MINI_DEEP_RESEARCH]: {
    description: "O4-mini variant for multimodal deep research tasks",
    useCases: ["Multimodal research", "Visual research", "Comprehensive analysis"],
    complexity: "complex",
    taskTypes: ["reasoning", "multimodal"],
    costTier: 5,
    latencyTier: 5,
    contextWindow: 128000,
    supportsReasoning: true,
    supportsMultimodal: true,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  // ============================================
  // FLAGSHIP CHAT MODELS
  // ============================================

  [MODELS.GPT_5_CHAT_LATEST]: {
    description: "Latest GPT-5 chat variant optimized for contextual conversations",
    useCases: ["Natural conversation", "Contextual chat", "Multi-turn dialogue", "User interaction"],
    complexity: "any",
    taskTypes: ["conversation"],
    costTier: 4,
    latencyTier: 3,
    contextWindow: 1000000,
    supportsReasoning: false,
    supportsMultimodal: true,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.CHATGPT_4O_LATEST]: {
    description: "Latest ChatGPT-4o variant for general conversation and tasks",
    useCases: ["General conversation", "Standard tasks", "User assistance"],
    complexity: "medium",
    taskTypes: ["conversation"],
    costTier: 3,
    latencyTier: 3,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: true,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  // ============================================
  // GENERAL GPT MODELS
  // ============================================

  [MODELS.GPT_4_1]: {
    description: "Improved coding capabilities, long-context comprehension, up to 1M tokens",
    useCases: ["Coding tasks", "Long context", "Complex instructions", "Multi-step tasks"],
    complexity: "complex",
    taskTypes: ["coding", "conversation"],
    costTier: 4,
    latencyTier: 4,
    contextWindow: 1000000,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.GPT_4_1_MINI]: {
    description: "Smaller variant of GPT-4.1 for cost-effective coding and tasks",
    useCases: ["Coding", "Standard tasks", "Cost-sensitive applications"],
    complexity: "medium",
    taskTypes: ["coding", "conversation"],
    costTier: 2,
    latencyTier: 2,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: true,
    speedOptimized: true,
  },

  [MODELS.GPT_4_1_NANO]: {
    description: "High-speed variant of GPT-4.1 for quick, simple tasks",
    useCases: ["Quick coding", "Simple tasks", "High-speed applications"],
    complexity: "simple",
    taskTypes: ["coding", "conversation"],
    costTier: 1,
    latencyTier: 1,
    contextWindow: 32000,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: true,
    speedOptimized: true,
  },

  [MODELS.GPT_4O]: {
    description: "Multilingual, multimodal model (text/image/audio), state-of-the-art performance",
    useCases: ["Multimodal tasks", "Multilingual support", "Voice processing", "Image understanding"],
    complexity: "medium",
    taskTypes: ["multimodal", "conversation"],
    costTier: 3,
    latencyTier: 3,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: true,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.GPT_4O_MINI]: {
    description: "Cost-effective version of GPT-4o for enterprises and developers",
    useCases: ["General tasks", "Cost-sensitive applications", "Automation", "AI agents"],
    complexity: "medium",
    taskTypes: ["conversation", "calendar"],
    costTier: 1,
    latencyTier: 2,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: true,
    supportsTools: true,
    costOptimized: true,
    speedOptimized: true,
  },

  // ============================================
  // AUDIO / REALTIME MODELS
  // ============================================

  [MODELS.GPT_4O_AUDIO_PREVIEW]: {
    description: "GPT-4o variant optimized for audio processing and voice interactions",
    useCases: ["Voice interactions", "Audio processing", "Speech understanding"],
    complexity: "medium",
    taskTypes: ["multimodal", "specialized"],
    costTier: 3,
    latencyTier: 3,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: true,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.GPT_4O_MINI_AUDIO_PREVIEW]: {
    description: "Cost-effective audio processing variant",
    useCases: ["Voice tasks", "Cost-sensitive audio", "Quick voice interactions"],
    complexity: "simple",
    taskTypes: ["multimodal", "specialized"],
    costTier: 2,
    latencyTier: 2,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: true,
    supportsTools: true,
    costOptimized: true,
    speedOptimized: true,
  },

  [MODELS.GPT_4O_REALTIME_PREVIEW]: {
    description: "Real-time interaction model for live conversations",
    useCases: ["Real-time chat", "Live conversations", "Interactive applications"],
    complexity: "medium",
    taskTypes: ["conversation", "specialized"],
    costTier: 4,
    latencyTier: 1,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: true,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: true,
  },

  [MODELS.GPT_4O_MINI_REALTIME_PREVIEW]: {
    description: "Cost-effective real-time interaction variant",
    useCases: ["Real-time tasks", "Cost-sensitive live interactions"],
    complexity: "simple",
    taskTypes: ["conversation", "specialized"],
    costTier: 2,
    latencyTier: 1,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: true,
    supportsTools: true,
    costOptimized: true,
    speedOptimized: true,
  },

  // ============================================
  // TEXT-TO-SPEECH MODELS
  // ============================================

  [MODELS.GPT_4O_MINI_TTS]: {
    description: "Text-to-speech model for converting text to natural speech",
    useCases: ["Voice synthesis", "Audio generation", "Accessibility"],
    complexity: "simple",
    taskTypes: ["specialized"],
    costTier: 2,
    latencyTier: 2,
    contextWindow: 0,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: false,
    costOptimized: true,
    speedOptimized: true,
  },

  [MODELS.TTS_1]: {
    description: "Standard text-to-speech model",
    useCases: ["Voice synthesis", "Audio generation"],
    complexity: "simple",
    taskTypes: ["specialized"],
    costTier: 1,
    latencyTier: 2,
    contextWindow: 0,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: false,
    costOptimized: true,
    speedOptimized: true,
  },

  [MODELS.TTS_1_HD]: {
    description: "High-definition text-to-speech model for premium quality",
    useCases: ["High-quality voice", "Premium audio", "Professional synthesis"],
    complexity: "simple",
    taskTypes: ["specialized"],
    costTier: 2,
    latencyTier: 3,
    contextWindow: 0,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: false,
    costOptimized: false,
    speedOptimized: false,
  },

  // ============================================
  // TRANSCRIPTION / SPEECH-TO-TEXT MODELS
  // ============================================

  [MODELS.GPT_4O_TRANSCRIBE]: {
    description: "Advanced transcription model for converting speech to text",
    useCases: ["Audio transcription", "Speech-to-text", "Voice notes"],
    complexity: "medium",
    taskTypes: ["specialized"],
    costTier: 3,
    latencyTier: 3,
    contextWindow: 0,
    supportsReasoning: false,
    supportsMultimodal: true,
    supportsTools: false,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.GPT_4O_MINI_TRANSCRIBE]: {
    description: "Cost-effective transcription variant",
    useCases: ["Quick transcription", "Cost-sensitive audio processing"],
    complexity: "simple",
    taskTypes: ["specialized"],
    costTier: 2,
    latencyTier: 2,
    contextWindow: 0,
    supportsReasoning: false,
    supportsMultimodal: true,
    supportsTools: false,
    costOptimized: true,
    speedOptimized: true,
  },

  [MODELS.WHISPER_1]: {
    description: "Whisper speech recognition model",
    useCases: ["Speech recognition", "Audio transcription"],
    complexity: "simple",
    taskTypes: ["specialized"],
    costTier: 1,
    latencyTier: 2,
    contextWindow: 0,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: false,
    costOptimized: true,
    speedOptimized: true,
  },

  // ============================================
  // SPECIALIZED TOOL MODELS
  // ============================================

  [MODELS.GPT_4O_SEARCH_PREVIEW]: {
    description: "Search-optimized model for information retrieval tasks",
    useCases: ["Web search", "Information retrieval", "Research"],
    complexity: "medium",
    taskTypes: ["specialized"],
    costTier: 3,
    latencyTier: 4,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.GPT_4O_MINI_SEARCH_PREVIEW]: {
    description: "Cost-effective search variant",
    useCases: ["Quick search", "Cost-sensitive retrieval"],
    complexity: "simple",
    taskTypes: ["specialized"],
    costTier: 2,
    latencyTier: 3,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: true,
    speedOptimized: true,
  },

  [MODELS.COMPUTER_USE_PREVIEW]: {
    description: "Model optimized for computer control and automation tasks",
    useCases: ["Computer automation", "UI interaction", "System control"],
    complexity: "medium",
    taskTypes: ["specialized"],
    costTier: 4,
    latencyTier: 3,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: true,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.CODEX_MINI_LATEST]: {
    description: "Latest Codex variant optimized for code generation and understanding",
    useCases: ["Code generation", "Code analysis", "Programming assistance"],
    complexity: "medium",
    taskTypes: ["coding"],
    costTier: 2,
    latencyTier: 2,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: true,
    speedOptimized: true,
  },

  // ============================================
  // IMAGE GENERATION MODELS
  // ============================================

  [MODELS.GPT_IMAGE_1]: {
    description: "GPT image generation model",
    useCases: ["Image generation", "Visual content creation"],
    complexity: "medium",
    taskTypes: ["specialized"],
    costTier: 3,
    latencyTier: 4,
    contextWindow: 0,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: false,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.DALL_E_3]: {
    description: "DALL-E 3 image generation model with high-quality output",
    useCases: ["High-quality image generation", "Artistic creation", "Visual content"],
    complexity: "medium",
    taskTypes: ["specialized"],
    costTier: 3,
    latencyTier: 4,
    contextWindow: 0,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: false,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.DALL_E_2]: {
    description: "DALL-E 2 image generation model",
    useCases: ["Image generation", "Visual content"],
    complexity: "medium",
    taskTypes: ["specialized"],
    costTier: 2,
    latencyTier: 4,
    contextWindow: 0,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: false,
    costOptimized: true,
    speedOptimized: false,
  },

  // ============================================
  // EMBEDDING MODELS
  // ============================================

  [MODELS.TEXT_EMBEDDING_3_SMALL]: {
    description: "Small, efficient embedding model for vector search",
    useCases: ["Vector search", "Semantic similarity", "Embeddings"],
    complexity: "simple",
    taskTypes: ["specialized"],
    costTier: 1,
    latencyTier: 1,
    contextWindow: 8192,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: false,
    costOptimized: true,
    speedOptimized: true,
  },

  [MODELS.TEXT_EMBEDDING_3_LARGE]: {
    description: "Large embedding model for high-quality vector representations",
    useCases: ["High-quality embeddings", "Advanced vector search"],
    complexity: "medium",
    taskTypes: ["specialized"],
    costTier: 2,
    latencyTier: 2,
    contextWindow: 8192,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: false,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.TEXT_EMBEDDING_ADA_002]: {
    description: "Ada embedding model for general-purpose vector representations",
    useCases: ["General embeddings", "Vector search"],
    complexity: "simple",
    taskTypes: ["specialized"],
    costTier: 1,
    latencyTier: 1,
    contextWindow: 8192,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: false,
    costOptimized: true,
    speedOptimized: true,
  },

  // ============================================
  // MODERATION MODELS
  // ============================================

  [MODELS.OMNI_MODERATION_LATEST]: {
    description: "Latest omnimodal moderation model for content safety",
    useCases: ["Content moderation", "Safety checks", "Content filtering"],
    complexity: "simple",
    taskTypes: ["specialized"],
    costTier: 2,
    latencyTier: 2,
    contextWindow: 0,
    supportsReasoning: false,
    supportsMultimodal: true,
    supportsTools: false,
    costOptimized: true,
    speedOptimized: true,
  },

  [MODELS.TEXT_MODERATION_LATEST]: {
    description: "Latest text moderation model",
    useCases: ["Text moderation", "Content safety"],
    complexity: "simple",
    taskTypes: ["specialized"],
    costTier: 1,
    latencyTier: 1,
    contextWindow: 0,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: false,
    costOptimized: true,
    speedOptimized: true,
  },

  // ============================================
  // OPEN-WEIGHT (OSS) MODELS
  // ============================================

  [MODELS.GPT_OSS_120B]: {
    description: "Open-weight 120B parameter model for local deployment on high-end hardware",
    useCases: ["Local deployment", "Privacy-sensitive", "High-performance local AI"],
    complexity: "complex",
    taskTypes: ["conversation", "reasoning"],
    costTier: 1,
    latencyTier: 4,
    contextWindow: 131072,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: true,
    speedOptimized: false,
  },

  [MODELS.GPT_OSS_20B]: {
    description: "Open-weight 20B parameter model for local deployment on consumer hardware (16GB RAM)",
    useCases: ["Local deployment", "Privacy-sensitive", "Consumer hardware"],
    complexity: "medium",
    taskTypes: ["conversation"],
    costTier: 1,
    latencyTier: 3,
    contextWindow: 131072,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: true,
    speedOptimized: false,
  },

  // ============================================
  // OLDER GPT MODELS
  // ============================================

  [MODELS.GPT_4_TURBO]: {
    description: "GPT-4 Turbo model with improved speed and capabilities",
    useCases: ["General tasks", "Legacy support"],
    complexity: "medium",
    taskTypes: ["conversation"],
    costTier: 3,
    latencyTier: 3,
    contextWindow: 128000,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.GPT_4]: {
    description: "Original GPT-4 model",
    useCases: ["General tasks", "Legacy support"],
    complexity: "medium",
    taskTypes: ["conversation"],
    costTier: 4,
    latencyTier: 4,
    contextWindow: 8192,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: false,
    speedOptimized: false,
  },

  [MODELS.GPT_3_5_TURBO]: {
    description: "GPT-3.5 Turbo model for simple, cost-effective tasks",
    useCases: ["Simple tasks", "Cost-sensitive", "Legacy support"],
    complexity: "simple",
    taskTypes: ["conversation"],
    costTier: 1,
    latencyTier: 2,
    contextWindow: 16385,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: true,
    costOptimized: true,
    speedOptimized: true,
  },

  // ============================================
  // GPT BASE MODELS
  // ============================================

  [MODELS.BABBAGE_002]: {
    description: "Base model for fine-tuning and custom applications",
    useCases: ["Fine-tuning", "Custom models", "Specialized applications"],
    complexity: "simple",
    taskTypes: ["specialized"],
    costTier: 1,
    latencyTier: 2,
    contextWindow: 16384,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: false,
    costOptimized: true,
    speedOptimized: true,
  },

  [MODELS.DAVINCI_002]: {
    description: "Base model for fine-tuning and custom applications",
    useCases: ["Fine-tuning", "Custom models", "Specialized applications"],
    complexity: "medium",
    taskTypes: ["specialized"],
    costTier: 2,
    latencyTier: 3,
    contextWindow: 16384,
    supportsReasoning: false,
    supportsMultimodal: false,
    supportsTools: false,
    costOptimized: false,
    speedOptimized: false,
  },
};

/**
 * Get model capabilities by model enum value
 */
export function getModelCapabilities(model: MODELS): ModelCapabilities {
  return MODEL_CAPABILITIES[model];
}

/**
 * Find models that match specific criteria
 */
export function findModelsByCriteria(criteria: {
  complexity?: "simple" | "medium" | "complex" | "any";
  taskType?: "calendar" | "conversation" | "reasoning" | "coding" | "multimodal" | "specialized";
  maxCostTier?: number;
  maxLatencyTier?: number;
  supportsReasoning?: boolean;
  supportsMultimodal?: boolean;
  supportsTools?: boolean;
  costOptimized?: boolean;
  speedOptimized?: boolean;
}): MODELS[] {
  return Object.entries(MODEL_CAPABILITIES)
    .filter(([model, caps]) => {
      if (criteria.complexity && caps.complexity !== criteria.complexity && caps.complexity !== "any") {
        return false;
      }
      if (criteria.taskType && !caps.taskTypes.includes(criteria.taskType)) {
        return false;
      }
      if (criteria.maxCostTier && caps.costTier > criteria.maxCostTier) {
        return false;
      }
      if (criteria.maxLatencyTier && caps.latencyTier > criteria.maxLatencyTier) {
        return false;
      }
      if (criteria.supportsReasoning !== undefined && caps.supportsReasoning !== criteria.supportsReasoning) {
        return false;
      }
      if (criteria.supportsMultimodal !== undefined && caps.supportsMultimodal !== criteria.supportsMultimodal) {
        return false;
      }
      if (criteria.supportsTools !== undefined && caps.supportsTools !== criteria.supportsTools) {
        return false;
      }
      if (criteria.costOptimized !== undefined && caps.costOptimized !== criteria.costOptimized) {
        return false;
      }
      if (criteria.speedOptimized !== undefined && caps.speedOptimized !== criteria.speedOptimized) {
        return false;
      }
      return true;
    })
    .map(([model]) => model as MODELS);
}

/**
 * Get recommended model for a task
 */
export function getRecommendedModel(
  complexity: "simple" | "medium" | "complex",
  taskType: "calendar" | "conversation" | "reasoning" | "coding" | "multimodal" | "specialized",
  options?: {
    costSensitive?: boolean;
    speedCritical?: boolean;
    requiresReasoning?: boolean;
    requiresMultimodal?: boolean;
    requiresTools?: boolean;
  }
): MODELS {
  const criteria: Parameters<typeof findModelsByCriteria>[0] = {
    complexity,
    taskType,
    supportsTools: options?.requiresTools ?? true,
    supportsReasoning: options?.requiresReasoning,
    supportsMultimodal: options?.requiresMultimodal,
  };

  if (options?.costSensitive) {
    criteria.costOptimized = true;
    criteria.maxCostTier = 2;
  }

  if (options?.speedCritical) {
    criteria.speedOptimized = true;
    criteria.maxLatencyTier = 2;
  }

  const matches = findModelsByCriteria(criteria);

  if (matches.length === 0) {
    // Fallback to default
    return MODELS.GPT_5_MINI;
  }

  // Prefer cost-optimized and speed-optimized models
  const sorted = matches.sort((a, b) => {
    const capsA = MODEL_CAPABILITIES[a];
    const capsB = MODEL_CAPABILITIES[b];

    // Prioritize cost and speed optimized
    if (options?.costSensitive && capsA.costOptimized !== capsB.costOptimized) {
      return capsA.costOptimized ? -1 : 1;
    }
    if (options?.speedCritical && capsA.speedOptimized !== capsB.speedOptimized) {
      return capsA.speedOptimized ? -1 : 1;
    }

    // Then by cost tier
    if (capsA.costTier !== capsB.costTier) {
      return capsA.costTier - capsB.costTier;
    }

    // Then by latency tier
    return capsA.latencyTier - capsB.latencyTier;
  });

  return sorted[0];
}
