import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://15539b9acb6ceb485611722c3689022c@o4510712201084928.ingest.us.sentry.io/4510712201936896',
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
  sendDefaultPii: true,
  debug: false,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

// Test metric to verify Sentry metrics are working
Sentry.metrics.count('sentry_client_initialized', 1, {
  attributes: { environment: process.env.NODE_ENV || 'development' },
})
