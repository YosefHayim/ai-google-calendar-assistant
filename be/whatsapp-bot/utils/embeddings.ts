/**
 * WhatsApp Embeddings Utility
 * Handles semantic search and embedding storage for WhatsApp conversations
 */

import { CONFIG } from "@/config"
import { MODELS } from "@/config/constants/ai"
import OpenAI from "openai"
import { SUPABASE } from "@/config/clients/supabase"
import { logger } from "@/utils/logger"
import { getUserIdFromWhatsApp } from "./conversation-history"

const openai = new OpenAI({ apiKey: CONFIG.openAiApiKey })

const EMBEDDING_MODEL = MODELS.TEXT_EMBEDDING_3_SMALL
const CONVERSATION_EMBEDDINGS_TABLE = "conversation_embeddings"
const SIMILARITY_THRESHOLD = 0.7
const MAX_RESULTS = 5
const MAX_SEMANTIC_CONTEXT_LENGTH = 800

type EmbeddingMetadata = {
  role: "user" | "assistant"
  phoneNumber: string
  timestamp: string
}

type SimilarConversation = {
  content: string
  id: string
  metadata: EmbeddingMetadata | null
  similarity: number
}

/**
 * Generates an embedding vector for text
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate embedding for empty text")
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim(),
  })

  const embedding = response.data[0]?.embedding

  if (!embedding) {
    logger.error(`WhatsApp: Embeddings: Failed to generate embedding`)
    throw new Error("Failed to generate embedding")
  }
  return embedding
}

/**
 * Formats embedding array to pgvector string format
 */
const formatEmbeddingForPgVector = (embedding: number[]): string => {
  return `[${embedding.join(",")}]`
}

/**
 * Stores a conversation embedding in the database
 */
export const storeConversationEmbedding = async (
  phoneNumber: string,
  content: string,
  role: "user" | "assistant",
  messageId?: string,
  conversationId?: string
): Promise<boolean> => {
  try {
    const userId = await getUserIdFromWhatsApp(phoneNumber)
    if (!userId) {
      // For unlinked users, we still want to store embeddings but skip for now
      logger.debug(`WhatsApp: Embeddings: No user_id for phone ${phoneNumber}, skipping embedding`)
      return false
    }

    const embedding = await generateEmbedding(content)
    const embeddingString = formatEmbeddingForPgVector(embedding)
    const metadata: EmbeddingMetadata = {
      role,
      phoneNumber,
      timestamp: new Date().toISOString(),
    }

    const { error } = await SUPABASE.from(CONVERSATION_EMBEDDINGS_TABLE).insert({
      user_id: userId,
      content,
      embedding: embeddingString,
      message_id: messageId || null,
      conversation_id: conversationId || null,
      metadata,
      source: "whatsapp",
    })

    if (error) {
      logger.error(
        `WhatsApp: Embeddings: Error storing embedding: phone=${phoneNumber}, role=${role}, error=${error.message}`
      )
      return false
    }
    return true
  } catch (error) {
    logger.error(
      `WhatsApp: Embeddings: Error generating/storing embedding: phone=${phoneNumber}, role=${role}, error=${
        error instanceof Error ? error.message : error
      }`
    )
    return false
  }
}

/**
 * Searches for similar conversations using vector similarity
 */
export const searchSimilarConversations = async (
  phoneNumber: string,
  query: string,
  options?: {
    threshold?: number
    limit?: number
  }
): Promise<SimilarConversation[]> => {
  try {
    const userId = await getUserIdFromWhatsApp(phoneNumber)
    if (!userId) {
      return []
    }

    const queryEmbedding = await generateEmbedding(query)

    // Use v2 which takes match_user_id as UUID string
    const { data, error } = await SUPABASE.rpc("match_conversation_embeddings_v2", {
      query_embedding: formatEmbeddingForPgVector(queryEmbedding),
      match_user_id: userId,
      match_threshold: options?.threshold || SIMILARITY_THRESHOLD,
      match_count: options?.limit || MAX_RESULTS,
    })

    if (error) {
      logger.error(
        `WhatsApp: Embeddings: Error searching similar conversations: phone=${phoneNumber}, error=${error.message}`
      )
      return []
    }
    return (data || []) as SimilarConversation[]
  } catch (error) {
    logger.error(
      `WhatsApp: Embeddings: Error in similarity search: phone=${phoneNumber}, error=${
        error instanceof Error ? error.message : error
      }`
    )
    return []
  }
}

/**
 * Builds semantic context from similar conversations
 */
export const buildSemanticContext = (conversations: SimilarConversation[]): string => {
  if (conversations.length === 0) {
    return ""
  }

  const sorted = conversations.sort((a, b) => b.similarity - a.similarity)
  const contextParts: string[] = []
  let totalLength = 0

  for (const conv of sorted) {
    const role = conv.metadata?.role === "user" ? "User" : "Assistant"
    const similarity = Math.round(conv.similarity * 100)
    const part = `[${similarity}% relevant] ${role}: ${conv.content}`

    if (totalLength + part.length > MAX_SEMANTIC_CONTEXT_LENGTH) {
      break
    }

    contextParts.push(part)
    totalLength += part.length + 1
  }

  if (contextParts.length === 0) {
    return ""
  }

  return `Relevant past conversations:\n${contextParts.join("\n")}`
}

/**
 * Stores embedding in background (non-blocking)
 */
export const storeEmbeddingAsync = (
  phoneNumber: string,
  content: string,
  role: "user" | "assistant",
  messageId?: string,
  conversationId?: string
): void => {
  // Fire and forget - don't await
  storeConversationEmbedding(phoneNumber, content, role, messageId, conversationId).catch(
    (error) => {
      logger.error(
        `WhatsApp: Embeddings: Background storage failed: phone=${phoneNumber}, error=${
          error instanceof Error ? error.message : error
        }`
      )
    }
  )
}

/**
 * Gets relevant context for a query
 */
export const getRelevantContext = async (
  phoneNumber: string,
  query: string,
  options?: {
    threshold?: number
    limit?: number
  }
): Promise<string> => {
  const similarConversations = await searchSimilarConversations(phoneNumber, query, options)
  return buildSemanticContext(similarConversations)
}
