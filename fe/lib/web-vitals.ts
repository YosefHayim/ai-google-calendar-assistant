import { onCLS, onINP, onLCP } from 'web-vitals'

type Metric = {
  name: string
  value: number
  id: string
  delta: number
}

const reportWebVitals = (metric: Metric) => {
  // Send to analytics endpoint
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
    timestamp: Date.now(),
    url: window.location.href,
  })

  // Use sendBeacon if available, fallback to fetch
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/web-vitals', body)
  } else {
    fetch('/api/analytics/web-vitals', {
      body,
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(() => {
      // Silently fail if analytics endpoint is not available
    })
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`${metric.name}:`, metric.value)
  }
}

export const initWebVitals = () => {
  // Only initialize in browser
  if (typeof window === 'undefined') return

  try {
    onCLS(reportWebVitals)
    onINP(reportWebVitals)
    onLCP(reportWebVitals)
  } catch (error) {
    // Silently fail if web-vitals fails to initialize
    console.warn('Failed to initialize web-vitals:', error)
  }
}
