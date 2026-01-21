type EmbeddingMetadata = {
  role: "user" | "assistant"
  slackUserId: string
  teamId: string
  timestamp: string
}

type SimilarConversation = {
  content: string
  id: string
  metadata: EmbeddingMetadata | null
  similarity: number
}

type StoreEmbeddingParams = {
  slackUserId: string
  teamId: string
  content: string
  role: "user" | "assistant"
}

type SearchOptions = {
  threshold?: number
  limit?: number
}

const PERCENTAGE_MULTIPLIER = 100

export const generateEmbedding = (_text: string): number[] => []

export const storeConversationEmbedding = (
  _params: StoreEmbeddingParams
): boolean => true

export const searchSimilarConversations = (
  _slackUserId: string,
  _teamId: string,
  _query: string,
  _options?: SearchOptions
): SimilarConversation[] => []

export const buildSemanticContext = (
  conversations: SimilarConversation[]
): string => {
  if (conversations.length === 0) {
    return ""
  }

  const sorted = conversations.sort((a, b) => b.similarity - a.similarity)
  const contextParts: string[] = []

  for (const conv of sorted) {
    const role = conv.metadata?.role === "user" ? "User" : "Assistant"
    const similarity = Math.round(conv.similarity * PERCENTAGE_MULTIPLIER)
    const part = `[${similarity}% relevant] ${role}: ${conv.content}`
    contextParts.push(part)
  }

  return contextParts.length > 0
    ? `Relevant past conversations:\n${contextParts.join("\n")}`
    : ""
}

export const storeEmbeddingAsync = (_params: StoreEmbeddingParams): void => {
  // No-op: embeddings disabled
}

export const getRelevantContext = (
  _slackUserId: string,
  _teamId: string,
  _query: string,
  _options?: SearchOptions
): string => ""
