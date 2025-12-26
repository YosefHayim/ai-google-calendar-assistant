export enum MODELS {
  // Frontier reasoning models
  GPT_5 = "gpt-5",
  GPT_5_MINI = "gpt-5-mini",
  GPT_5_NANO = "gpt-5-nano",
  O3 = "o3",
  O3_PRO = "o3-pro",
  O3_MINI = "o3-mini",
  O4_MINI = "o4-mini",
  O1 = "o1",
  O1_PRO = "o1-pro",

  // Deep research
  O3_DEEP_RESEARCH = "o3-deep-research",
  O4_MINI_DEEP_RESEARCH = "o4-mini-deep-research",

  // Flagship chat models
  GPT_5_CHAT_LATEST = "gpt-5-chat-latest",
  CHATGPT_4O_LATEST = "chatgpt-4o-latest",

  // General GPT models
  GPT_4_1 = "gpt-4.1",
  GPT_4_1_MINI = "gpt-4.1-mini",
  GPT_4_1_NANO = "gpt-4.1-nano",
  GPT_4O = "gpt-4o",
  GPT_4O_MINI = "gpt-4o-mini",

  // Audio / Realtime
  GPT_4O_AUDIO_PREVIEW = "gpt-4o-audio-preview",
  GPT_4O_MINI_AUDIO_PREVIEW = "gpt-4o-mini-audio-preview",
  GPT_4O_REALTIME_PREVIEW = "gpt-4o-realtime-preview",
  GPT_4O_MINI_REALTIME_PREVIEW = "gpt-4o-mini-realtime-preview",

  // Text-to-speech
  GPT_4O_MINI_TTS = "gpt-4o-mini-tts",
  TTS_1 = "tts-1",
  TTS_1_HD = "tts-1-hd",

  // Transcription / Speech-to-text
  GPT_4O_TRANSCRIBE = "gpt-4o-transcribe",
  GPT_4O_MINI_TRANSCRIBE = "gpt-4o-mini-transcribe",
  WHISPER_1 = "whisper-1",

  // Specialized tool models
  GPT_4O_SEARCH_PREVIEW = "gpt-4o-search-preview",
  GPT_4O_MINI_SEARCH_PREVIEW = "gpt-4o-mini-search-preview",
  COMPUTER_USE_PREVIEW = "computer-use-preview",
  CODEX_MINI_LATEST = "codex-mini-latest",

  // Image generation
  GPT_IMAGE_1 = "gpt-image-1",
  DALL_E_3 = "dall-e-3",
  DALL_E_2 = "dall-e-2",

  // Embeddings
  TEXT_EMBEDDING_3_SMALL = "text-embedding-3-small",
  TEXT_EMBEDDING_3_LARGE = "text-embedding-3-large",
  TEXT_EMBEDDING_ADA_002 = "text-embedding-ada-002",

  // Moderation
  OMNI_MODERATION_LATEST = "omni-moderation-latest",
  TEXT_MODERATION_LATEST = "text-moderation-latest",

  // Open-weight (OSS)
  GPT_OSS_120B = "gpt-oss-120b",
  GPT_OSS_20B = "gpt-oss-20b",

  // Older GPT models
  GPT_4_TURBO = "gpt-4-turbo",
  GPT_4 = "gpt-4",
  GPT_3_5_TURBO = "gpt-3.5-turbo",

  // GPT base models
  BABBAGE_002 = "babbage-002",
  DAVINCI_002 = "davinci-002",
}

export const CURRENT_MODEL = MODELS.GPT_5_MINI;
