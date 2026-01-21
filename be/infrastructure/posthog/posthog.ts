import { PostHog } from "posthog-node"
import { env } from "@/config/env"

let client: PostHog | null = null

export const initializePostHog = (): PostHog | null => {
  if (client) {
    return client
  }

  if (!(env.posthog.isEnabled && env.posthog.apiKey)) {
    return null
  }

  client = new PostHog(env.posthog.apiKey, {
    host: env.posthog.host,
  })

  return client
}

export const isPostHogEnabled = (): boolean => env.posthog.isEnabled

export const getPostHogClient = (): PostHog | null => {
  if (!client && env.posthog.isEnabled) {
    return initializePostHog()
  }
  return client
}

export const shutdownPostHog = async (): Promise<void> => {
  if (client) {
    await client.shutdown()
    client = null
  }
}

type EventProperties = Record<string, unknown>

export const captureEvent = (
  distinctId: string,
  event: string,
  properties?: EventProperties
): void => {
  const posthog = getPostHogClient()
  if (!posthog) {
    return
  }

  posthog.capture({
    distinctId,
    event,
    properties,
  })
}

export const identifyUser = (
  distinctId: string,
  properties?: EventProperties
): void => {
  const posthog = getPostHogClient()
  if (!posthog) {
    return
  }

  posthog.identify({
    distinctId,
    properties,
  })
}
