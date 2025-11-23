# OpenAI Models Reference

This document provides a comprehensive reference for all OpenAI models available in the codebase, with descriptions, capabilities, and selection criteria for the Model Router.

## Overview

The `config/models.ts` file contains detailed information about each OpenAI model, including:
- **Description**: What the model does
- **Use Cases**: When to use it
- **Complexity**: Task complexity it handles (simple/medium/complex/any)
- **Task Types**: What types of tasks it excels at
- **Cost & Latency Tiers**: Relative cost and speed (1-5 scale)
- **Capabilities**: Reasoning, multimodal, tools support

## Model Categories

### 1. Frontier Reasoning Models
Advanced models optimized for complex reasoning and problem-solving:
- **GPT_5**: Most advanced, 1M token context, multimodal
- **GPT_5_MINI**: Cost-effective general purpose
- **GPT_5_NANO**: High-speed, lightweight
- **O3/O3_PRO**: Enhanced reasoning, step-by-step thinking
- **O3_MINI**: Faster reasoning variant
- **O4_MINI**: Multimodal reasoning (text + images)
- **O1/O1_PRO**: Logical problem solving

### 2. Deep Research Models
Specialized for extensive research and analysis:
- **O3_DEEP_RESEARCH**: Deep research and analysis
- **O4_MINI_DEEP_RESEARCH**: Multimodal deep research

### 3. Flagship Chat Models
Optimized for natural conversation:
- **GPT_5_CHAT_LATEST**: Latest chat-optimized GPT-5
- **CHATGPT_4O_LATEST**: Latest ChatGPT variant

### 4. General GPT Models
Versatile models for various tasks:
- **GPT_4_1/GPT_4_1_MINI/GPT_4_1_NANO**: Improved coding, long context
- **GPT_4O/GPT_4O_MINI**: Multilingual, multimodal

### 5. Specialized Models
- **Audio/Realtime**: Voice interactions, real-time chat
- **Text-to-Speech**: Voice synthesis
- **Transcription**: Speech-to-text
- **Search**: Information retrieval
- **Computer Use**: Automation and UI control
- **Image Generation**: DALL-E models
- **Embeddings**: Vector representations
- **Moderation**: Content safety
- **Open-Weight**: Local deployment models

## Model Selection Guide

### For Calendar Tasks
- **Simple**: `GPT_5_MINI`, `GPT_5_NANO`, `GPT_4O_MINI`
- **Complex**: `GPT_5`, `GPT_4_1`

### For Conversation
- **General**: `GPT_5_CHAT_LATEST`, `GPT_5_MINI`, `CHATGPT_4O_LATEST`
- **Real-time**: `GPT_4O_REALTIME_PREVIEW`

### For Reasoning
- **Complex**: `O3`, `O3_PRO`, `O1_PRO`
- **Moderate**: `O3_MINI`, `O1`
- **Research**: `O3_DEEP_RESEARCH`

### For Cost-Sensitive Applications
- **Best**: `GPT_5_NANO`, `GPT_4O_MINI`, `GPT_3_5_TURBO`
- **Good**: `GPT_5_MINI`, `GPT_4_1_MINI`

### For Speed-Critical Applications
- **Fastest**: `GPT_5_NANO`, `GPT_4O_MINI_REALTIME_PREVIEW`
- **Fast**: `GPT_5_MINI`, `GPT_4O_MINI`

## Using the Model Router

The `ModelRouterService` uses this configuration to automatically select the best model:

```typescript
import { getRecommendedModel, findModelsByCriteria } from '@/config/models';
import { MODELS } from '@/types';

// Get recommended model for a task
const model = getRecommendedModel(
  'medium',           // complexity
  'calendar',         // task type
  {
    costSensitive: true,
    requiresTools: true
  }
);

// Find models matching criteria
const models = findModelsByCriteria({
  complexity: 'simple',
  taskType: 'calendar',
  maxCostTier: 2,
  costOptimized: true
});
```

## Model Capabilities Matrix

| Model | Complexity | Cost | Speed | Reasoning | Multimodal | Tools |
|-------|-----------|------|-------|-----------|------------|-------|
| GPT_5 | Complex | 5 | 4 | ✅ | ✅ | ✅ |
| GPT_5_MINI | Medium | 2 | 2 | ❌ | ❌ | ✅ |
| GPT_5_NANO | Simple | 1 | 1 | ❌ | ❌ | ✅ |
| O3 | Complex | 5 | 5 | ✅ | ❌ | ✅ |
| O3_MINI | Medium | 3 | 3 | ✅ | ❌ | ✅ |
| GPT_4O | Medium | 3 | 3 | ❌ | ✅ | ✅ |
| GPT_4O_MINI | Medium | 1 | 2 | ❌ | ✅ | ✅ |

## Best Practices

1. **Start with defaults**: Use `GPT_5_MINI` for most tasks
2. **Upgrade for complexity**: Use `GPT_5` or `O3` for complex reasoning
3. **Optimize for cost**: Use `GPT_5_NANO` or `GPT_4O_MINI` when cost matters
4. **Optimize for speed**: Use `GPT_5_NANO` or realtime variants for low latency
5. **Use specialized models**: Use specific models for their intended purpose (TTS, transcription, etc.)

## Updating Model Information

When OpenAI releases new models or updates existing ones:

1. Add the model to `MODELS` enum in `types.ts`
2. Add capabilities to `MODEL_CAPABILITIES` in `config/models.ts`
3. Update this documentation
4. Test model selection in `ModelRouterService`

## See Also

- `config/models.ts` - Full model configuration
- `types.ts` - Model enum definitions
- `docs/model-router-design.md` - Model router architecture
- `services/ModelRouterService.ts` - Model selection logic (to be implemented)

