import crypto from "node:crypto"
import { SUPABASE } from "@/config"
import { logger } from "@/utils/logger"
import type { FeatureFlagAuditAction } from "./feature-flag-audit-service"

const supabase = SUPABASE

const DEFAULT_TIMEOUT_MS = 5000
const DEFAULT_RETRY_COUNT = 3
const MAX_RESPONSE_BODY_LENGTH = 1000
const BACKOFF_BASE_MS = 1000

export type FeatureFlagWebhook = {
  id: string
  name: string
  url: string
  secret: string | null
  events: string[]
  headers: Record<string, string>
  enabled: boolean
  retryCount: number
  timeoutMs: number
  lastTriggeredAt: string | null
  lastStatusCode: number | null
  createdAt: string
  updatedAt: string
}

type DbWebhook = {
  id: string
  name: string
  url: string
  secret: string | null
  events: string[]
  headers: Record<string, string>
  enabled: boolean
  retry_count: number
  timeout_ms: number
  last_triggered_at: string | null
  last_status_code: number | null
  created_at: string
  updated_at: string
}

export type CreateWebhookInput = {
  name: string
  url: string
  secret?: string
  events?: string[]
  headers?: Record<string, string>
  enabled?: boolean
  retryCount?: number
  timeoutMs?: number
}

export type UpdateWebhookInput = Partial<CreateWebhookInput>

export type WebhookPayload = {
  event: FeatureFlagAuditAction
  timestamp: string
  featureFlag: {
    id: string | null
    key: string
    name?: string
    enabled?: boolean
    environment?: string
  }
  actor: {
    id: string
    email?: string | null
  }
  changes?: {
    previousValue: Record<string, unknown> | null
    newValue: Record<string, unknown> | null
  }
}

function mapDbToWebhook(db: DbWebhook): FeatureFlagWebhook {
  return {
    id: db.id,
    name: db.name,
    url: db.url,
    secret: db.secret,
    events: db.events || [],
    headers: db.headers || {},
    enabled: db.enabled,
    retryCount: db.retry_count,
    timeoutMs: db.timeout_ms,
    lastTriggeredAt: db.last_triggered_at,
    lastStatusCode: db.last_status_code,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

function createHmacSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

export async function getAllWebhooks(): Promise<FeatureFlagWebhook[]> {
  const { data, error } = await supabase
    .from("feature_flag_webhooks")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) {
    logger.error("[FeatureFlagWebhookService] Failed to fetch webhooks:", error)
    return []
  }

  return (data as DbWebhook[]).map(mapDbToWebhook)
}

export async function getWebhookById(
  id: string
): Promise<FeatureFlagWebhook | null> {
  const { data, error } = await supabase
    .from("feature_flag_webhooks")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapDbToWebhook(data as DbWebhook)
}

export async function createWebhook(
  input: CreateWebhookInput
): Promise<FeatureFlagWebhook | null> {
  const { data, error } = await supabase
    .from("feature_flag_webhooks")
    .insert({
      name: input.name,
      url: input.url,
      secret: input.secret || null,
      events: input.events || [],
      headers: input.headers || {},
      enabled: input.enabled ?? true,
      retry_count: input.retryCount ?? DEFAULT_RETRY_COUNT,
      timeout_ms: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    })
    .select()
    .single()

  if (error) {
    logger.error("[FeatureFlagWebhookService] Failed to create webhook:", error)
    return null
  }

  return mapDbToWebhook(data as DbWebhook)
}

export async function updateWebhook(
  id: string,
  input: UpdateWebhookInput
): Promise<FeatureFlagWebhook | null> {
  const updateData: Record<string, unknown> = {}

  if (input.name !== undefined) {
    updateData.name = input.name
  }
  if (input.url !== undefined) {
    updateData.url = input.url
  }
  if (input.secret !== undefined) {
    updateData.secret = input.secret
  }
  if (input.events !== undefined) {
    updateData.events = input.events
  }
  if (input.headers !== undefined) {
    updateData.headers = input.headers
  }
  if (input.enabled !== undefined) {
    updateData.enabled = input.enabled
  }
  if (input.retryCount !== undefined) {
    updateData.retry_count = input.retryCount
  }
  if (input.timeoutMs !== undefined) {
    updateData.timeout_ms = input.timeoutMs
  }

  const { data, error } = await supabase
    .from("feature_flag_webhooks")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    logger.error("[FeatureFlagWebhookService] Failed to update webhook:", error)
    return null
  }

  return mapDbToWebhook(data as DbWebhook)
}

export async function deleteWebhook(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("feature_flag_webhooks")
    .delete()
    .eq("id", id)

  if (error) {
    logger.error("[FeatureFlagWebhookService] Failed to delete webhook:", error)
    return false
  }

  return true
}

async function logDelivery(
  webhookId: string,
  featureFlagId: string | null,
  featureFlagKey: string,
  eventType: FeatureFlagAuditAction,
  payload: WebhookPayload,
  response: {
    status?: number
    body?: string
    durationMs: number
    success: boolean
    error?: string
    attempt: number
  }
): Promise<void> {
  const { error } = await supabase.from("feature_flag_webhook_deliveries").insert({
    webhook_id: webhookId,
    feature_flag_id: featureFlagId,
    feature_flag_key: featureFlagKey,
    event_type: eventType,
    payload,
    response_status: response.status || null,
    response_body: response.body?.substring(0, MAX_RESPONSE_BODY_LENGTH) || null,
    duration_ms: response.durationMs,
    attempt_number: response.attempt,
    success: response.success,
    error_message: response.error || null,
  })

  if (error) {
    logger.error("[FeatureFlagWebhookService] Failed to log delivery:", error)
  }
}

async function updateWebhookStatus(
  webhookId: string,
  statusCode: number | null
): Promise<void> {
  await supabase
    .from("feature_flag_webhooks")
    .update({
      last_triggered_at: new Date().toISOString(),
      last_status_code: statusCode,
    })
    .eq("id", webhookId)
}

async function sendWebhookRequest(
  webhook: FeatureFlagWebhook,
  payload: WebhookPayload,
  attempt: number
): Promise<{ success: boolean; status?: number; body?: string; error?: string }> {
  const payloadString = JSON.stringify(payload)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Webhook-Event": payload.event,
    "X-Webhook-Delivery-Attempt": attempt.toString(),
    ...webhook.headers,
  }

  if (webhook.secret) {
    headers["X-Webhook-Signature"] = createHmacSignature(
      payloadString,
      webhook.secret
    )
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), webhook.timeoutMs)

  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body: payloadString,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const body = await response.text()

    return {
      success: response.ok,
      status: response.status,
      body,
    }
  } catch (err) {
    clearTimeout(timeoutId)
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function triggerWebhooks(payload: WebhookPayload): Promise<void> {
  const webhooks = await getAllWebhooks()
  const enabledWebhooks = webhooks.filter((w) => w.enabled)

  for (const webhook of enabledWebhooks) {
    const shouldTrigger =
      webhook.events.length === 0 || webhook.events.includes(payload.event)

    if (!shouldTrigger) {
      continue
    }

    let lastResult: {
      success: boolean
      status?: number
      body?: string
      error?: string
    } = { success: false }

    for (let attempt = 1; attempt <= webhook.retryCount; attempt++) {
      const startTime = Date.now()
      lastResult = await sendWebhookRequest(webhook, payload, attempt)
      const durationMs = Date.now() - startTime

      await logDelivery(
        webhook.id,
        payload.featureFlag.id,
        payload.featureFlag.key,
        payload.event,
        payload,
        {
          ...lastResult,
          durationMs,
          attempt,
        }
      )

      if (lastResult.success) {
        break
      }

      if (attempt < webhook.retryCount) {
        const backoffMs = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, backoffMs))
      }
    }

    await updateWebhookStatus(webhook.id, lastResult.status || null)

    if (!lastResult.success) {
      logger.warn(
        `[FeatureFlagWebhookService] Webhook ${webhook.name} failed after ${webhook.retryCount} attempts`
      )
    }
  }
}

export async function getWebhookDeliveries(
  webhookId: string,
  limit = 50
): Promise<
  Array<{
    id: string
    featureFlagKey: string
    eventType: string
    success: boolean
    responseStatus: number | null
    durationMs: number
    attemptNumber: number
    createdAt: string
  }>
> {
  const { data, error } = await supabase
    .from("feature_flag_webhook_deliveries")
    .select(
      "id, feature_flag_key, event_type, success, response_status, duration_ms, attempt_number, created_at"
    )
    .eq("webhook_id", webhookId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    logger.error(
      "[FeatureFlagWebhookService] Failed to fetch deliveries:",
      error
    )
    return []
  }

  return data.map((d) => ({
    id: d.id,
    featureFlagKey: d.feature_flag_key,
    eventType: d.event_type,
    success: d.success,
    responseStatus: d.response_status,
    durationMs: d.duration_ms,
    attemptNumber: d.attempt_number,
    createdAt: d.created_at,
  }))
}
